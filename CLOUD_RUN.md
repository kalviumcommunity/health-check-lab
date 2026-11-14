# Cloud health-check mapping

The local API exposes separate signals:

- `GET /health` is a shallow liveness check. It returns `200` while the
  application process can answer requests and does not depend on PostgreSQL.
- `GET /ready` is a dependency-aware readiness check. It runs `SELECT 1` and
  returns `503` when PostgreSQL cannot be reached.

For Cloud Run, configure a **startup probe** against `/health` to allow for
application startup and a **liveness probe** against `/health` to detect an
unresponsive instance. Cloud Run does not provide a Kubernetes-style readiness
probe for controlling traffic routing, so `/ready` remains useful for local
Compose validation and application-level monitoring but should not be presented
as a Cloud Run traffic gate.

In Kubernetes, use `/health` for startup and liveness probes, and `/ready` for a
readiness probe so traffic is withheld while PostgreSQL is unavailable.

The Compose health check intentionally uses `/ready` to expose database loss
as an `unhealthy` container during the lab. Docker Compose restart policies
restart exited containers, not containers that are merely unhealthy; the
database outage is therefore recovered by restoring PostgreSQL, after which
the API's readiness probe succeeds again. This is distinct from an automatic
restart on an unhealthy status.
