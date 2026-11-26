# Cloud Run Health Check Mapping

## Local Setup (Docker Compose)
- **`GET /health` (Liveness — shallow):** Returns `200 OK` when the Express process is alive. Does not query PostgreSQL so a database hiccup does not cause unnecessary container restarts.
- **`GET /ready` (Readiness — deep):** Runs `SELECT 1` against PostgreSQL. Returns `200 READY` when reachable and `503 NOT READY` when the database is unavailable.
- **Docker Compose `healthcheck` + `restart: unless-stopped`:** Polls `/health` every `10s` (`timeout: 3s`, `start_period: 20s`, `retries: 3`) and restarts the `orders-api` container automatically if needed.

## Mapping to Google Cloud Run (Conceptual — Not Deployed)
- **Cloud Run Startup Probe:** Maps to initial container readiness/boot verification before Cloud Run routes traffic to the revision. If it fails within the startup window, Cloud Run stops the container from receiving traffic or restarts it instead of sending requests prematurely.
- **Cloud Run Liveness Probe:** Maps to `/health` (shallow process check). Cloud Run periodically checks whether the container is still responsive; if liveness fails repeatedly, Cloud Run restarts the container instance.
- **Why `/ready` stays separate:** Liveness checks should only test if the process itself needs a restart. Checking a shared database inside liveness can trigger restart loops across instances during a database outage, whereas readiness/traffic gating indicates whether the instance can serve database-backed requests.

## Optional Mapping to Kubernetes Probes
- **Startup probe:** Protects slow-starting containers until initialization finishes.
- **Liveness probe (`GET /health`):** Restarts the container if the process hangs or deadlocks.
- **Readiness probe (`GET /ready`):** Removes the Pod from Service endpoints (stops traffic) when the database is unreachable, and restores traffic when the database recovers without needlessly restarting the container.
