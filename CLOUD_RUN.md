# Cloud Run Health Check Mapping

This lab uses two application endpoints:

- `/health` is a shallow liveness endpoint. It proves the Node.js process can answer HTTP and does not check PostgreSQL.
- `/ready` is a deep readiness endpoint. It pings PostgreSQL and returns `200 READY` only when the database is reachable; otherwise it returns `503 NOT READY`.

In Docker Compose, the single `healthcheck` is wired to `/ready` so the local demo clearly shows the service moving from healthy to unhealthy when the database is stopped, then back to healthy when the dependency recovers.

On Cloud Run, the same design maps as follows:

- Configure Cloud Run startup/liveness checks against `/health` so a stuck process can be restarted without depending on a shared database.
- Keep `/ready` as the service readiness/dependency signal used by monitoring, release checks, or Kubernetes-style readiness probes where traffic should stop while dependencies are unavailable.
- Do not put PostgreSQL in the liveness check. Restarting the app does not fix a database outage and can make a brief dependency problem worse.

For Kubernetes, this would map to `livenessProbe: /health` and `readinessProbe: /ready`.
