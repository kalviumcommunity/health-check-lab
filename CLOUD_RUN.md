# Health Checks Cloud Mapping

## 1. Local vs. Cloud Concepts

| Purpose | Local Endpoint | Google Cloud Run Probe | Kubernetes Probe |
| :--- | :--- | :--- | :--- |
| **Startup Check** | `GET /health` | **Startup Probe** (checks if container started before traffic is routed) | `startupProbe` |
| **Liveness Check** | `GET /health` | **Liveness Probe** (detects deadlocks; triggers container restart if failed) | `livenessProbe` |
| **Readiness Check** | `GET /ready` | *Handled via Traffic routing & health endpoints* | `readinessProbe` (removes container from service endpoints if DB fails) |

## 2. Google Cloud Run Configuration Example

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: orders-api
spec:
  template:
    spec:
      containers:
        - image: gcr.io/my-project/orders-api:latest
          ports:
            - containerPort: 3000
          startupProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            periodSeconds: 15
            timeoutSeconds: 3
            failureThreshold: 3
