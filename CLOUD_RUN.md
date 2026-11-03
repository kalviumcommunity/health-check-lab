# Cloud Run & Kubernetes Health Check Mapping

This document maps the local Docker Compose health checks implemented in this
project to their equivalents on **Google Cloud Run** and **Kubernetes**.

---

## Local Setup Summary

| Aspect              | Local (Docker Compose)                                  |
|----------------------|---------------------------------------------------------|
| **Liveness endpoint**  | `GET /health` → 200 OK (shallow, no DB)               |
| **Readiness endpoint** | `GET /ready`  → 200 / 503 (pings the database)        |
| **HEALTHCHECK**        | `curl -f http://localhost:3000/health` every 10 s      |
| **Restart policy**     | `restart: unless-stopped`                              |

---

## Google Cloud Run Mapping

Cloud Run supports three probe types (configured in `service.yaml` or via the
Console / `gcloud`):

### 1. Startup Probe
Runs once at container boot. Until it passes, liveness and readiness probes are
not started, and the container receives no traffic.

```yaml
startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 6        # 30 s max startup window
```

Maps to our **`/health`** endpoint — the process just needs to be alive, no
dependency readiness required yet.

### 2. Liveness Probe
Runs continuously. If it fails, Cloud Run restarts the container instance.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  periodSeconds: 10
  failureThreshold: 3
```

This is the direct equivalent of our **Docker HEALTHCHECK + restart policy**.

### 3. (Traffic-serving readiness — implicit in Cloud Run)
Cloud Run does not expose a separate "readiness" probe the way Kubernetes does.
Instead, when a startup probe is configured, instances only receive traffic
after the startup probe passes. For deeper dependency checks you would use the
startup probe path set to `/ready`.

```yaml
# Alternative: use /ready as the startup probe to gate traffic on DB readiness
startupProbe:
  httpGet:
    path: /ready
    port: 3000
  periodSeconds: 5
  failureThreshold: 12
```

---

## Kubernetes Mapping

Kubernetes gives you three distinct probes — the richest model:

### 1. Startup Probe
```yaml
startupProbe:
  httpGet:
    path: /health
    port: 3000
  periodSeconds: 5
  failureThreshold: 6
```
Delays liveness/readiness probes until the app is booted.

### 2. Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
```
Restarts the **pod** when the process is stuck — same role as Docker's
`HEALTHCHECK` + `restart: unless-stopped`.

### 3. Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
```
Removes the pod from the Service's endpoint list so it stops receiving traffic
when a dependency (e.g., the database) is down — but does **not** restart it.
This is the probe that has no direct Docker Compose equivalent; in Compose, the
HEALTHCHECK can only restart, not shed traffic.

---

## Comparison Table

| Concern                | Docker Compose              | Cloud Run                 | Kubernetes              |
|------------------------|-----------------------------|---------------------------|-------------------------|
| "Process alive?"       | `HEALTHCHECK /health`       | `livenessProbe /health`   | `livenessProbe /health` |
| "Ready for traffic?"   | *(no native equivalent)*    | `startupProbe /ready`     | `readinessProbe /ready` |
| Auto-restart on failure| `restart: unless-stopped`   | Automatic on liveness fail| kubelet restarts pod     |
| Traffic shedding       | *(not supported)*           | Implicit via startup probe| readinessProbe controls  |

---

## Key Takeaway

The `/health` (liveness) and `/ready` (readiness) endpoints we built locally
translate directly into cloud-native probes. The only difference is
**granularity**: Kubernetes gives the finest control (three independent probes),
Cloud Run merges startup + readiness, and Docker Compose has only one
HEALTHCHECK that doubles as both liveness gate and restart trigger.
