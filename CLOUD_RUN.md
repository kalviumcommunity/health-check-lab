# Cloud Run Mapping

## Overview

This project implements liveness and readiness checks for the `orders-api` service and maps the same concepts to Cloud Run and Kubernetes environments.

---

## Local Docker Health Checks

### Liveness Check

**Endpoint:** `GET /health`

Purpose:

* Verifies that the application process is running.
* Does not depend on the database.
* Returns `200 OK` when the service is alive.

Docker uses this endpoint through the configured `healthcheck` to determine whether the container is healthy.

---

### Readiness Check

**Endpoint:** `GET /ready`

Purpose:

* Verifies that the application can communicate with its database dependency.
* Returns `200 READY` when the database is reachable.
* Returns `503 NOT READY` when the database is unavailable.

This check confirms whether the service is actually ready to serve requests.

---

## Cloud Run Mapping

| Local Docker Environment                       | Cloud Run Equivalent                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `GET /health` liveness endpoint                | Cloud Run Liveness Probe                          |
| `GET /ready` readiness endpoint                | Cloud Run Startup Probe / Dependency Validation   |
| Docker health status (`healthy` / `unhealthy`) | Cloud Run Revision Health Status                  |
| Docker restart policy (`unless-stopped`)       | Cloud Run automatic instance recovery and restart |
| `docker compose ps` health status              | Cloud Run Service and Revision Status             |

---

## Kubernetes Mapping

| Endpoint  | Kubernetes Probe |
| --------- | ---------------- |
| `/health` | Liveness Probe   |
| `/ready`  | Readiness Probe  |

---

## Validation Summary

### Healthy State

* `docker compose ps` shows the container as healthy.
* `curl localhost:3000/ready` returns `200 READY`.

### Failure State

* Stopping the database causes `/ready` to return `503 NOT READY`.
* The service becomes unhealthy because a required dependency is unavailable.

### Recovery State

* Restarting the database restores connectivity.
* `/ready` returns `200 READY`.
* The service returns to a healthy state.

---

## Conclusion

The application now exposes proper liveness and readiness endpoints, allows the container runtime to detect failures, and provides evidence that the service can identify dependency failures and recover when the dependency becomes available again.
