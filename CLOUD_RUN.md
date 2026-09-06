# Cloud Run Health Check Mapping

## Local Docker Health Checks

This project uses two endpoints:

- `/health` is the liveness endpoint. It performs a shallow check and returns `200 OK` when the application process is alive.
- `/ready` is the readiness endpoint. It checks the PostgreSQL database connection using `SELECT 1`. It returns `200 READY` when the database is reachable and `503 NOT READY` when the database is unavailable.

## Cloud Run Mapping

The local `/health` endpoint represents the application's liveness/startup health signal. Cloud Run supports startup and liveness health checks that can be used to determine whether an instance has started successfully and whether it is still responding correctly.

The local `/ready` endpoint represents readiness behavior: the application is only ready to serve requests when its database dependency is available. Kubernetes exposes this distinction explicitly through liveness and readiness probes.

No Cloud Run deployment is performed for this assignment. This file documents how the local Docker health-check implementation maps to cloud health-check concepts.