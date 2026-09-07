# Cloud Run Health Check Mapping

## Local Health Endpoints

### `/health` — Liveness

The `/health` endpoint checks whether the Orders API process is alive and responding.

It does not depend on the database.

- HTTP 200 → application is alive
- Response: `OK`

### `/ready` — Readiness

The `/ready` endpoint checks whether the Orders API can connect to its PostgreSQL database.

- HTTP 200 → database is reachable
- HTTP 503 → database is unavailable
- Response: `READY` or `NOT READY`

## Cloud Run Mapping

The `/health` endpoint maps conceptually to a Cloud Run liveness check.

The `/ready` endpoint represents application readiness and can be used to determine whether the service is ready to serve traffic.

Cloud Run startup checks can be used to determine whether a newly started container has completed initialization before receiving traffic.

## Kubernetes Mapping

- `/health` → `livenessProbe`
- `/ready` → `readinessProbe`

No Cloud Run deployment is performed. This is documentation-only mapping.