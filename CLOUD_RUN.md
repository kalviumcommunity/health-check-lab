# Cloud Platform Mapping: Local Docker to Cloud Run & Kubernetes

## 1. Google Cloud Run Mapping
- **Startup Probe:** Maps to `start_period` in Docker Compose, giving slow-booting containers time to initialize.
- **Liveness Probe:** Polls `GET /health` (shallow). If it fails repeatedly, Cloud Run restarts the container instance.
- **Readiness Probe:** Polls `GET /ready` (deep). If dependencies like the database fail, Cloud Run temporarily pulls the instance out of the load balancer traffic pool.

## 2. Kubernetes Mapping
- **`livenessProbe`**: Restarts deadlocked pods using the shallow `/health` check.
- **`readinessProbe`**: Controls traffic routing via the deep `/ready` check.