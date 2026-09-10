# Cloud Health Check Mapping

When deploying a containerized application like this to a managed container platform like Google Cloud Run or Kubernetes, you map your local health checks to platform-specific probes.

## Google Cloud Run

Cloud Run supports three types of probes:
- **Startup Probe**: Tells Cloud Run if your application has started and is ready to receive traffic initially. You might map this to `/ready` if your app takes a long time to warm up.
- **Liveness Probe**: Tells Cloud Run if your container is still healthy or needs to be restarted. This maps perfectly to our `/health` endpoint. If the liveness probe fails, Cloud Run will restart the container instance.

In Cloud Run, you can configure these probes in the YAML configuration or via the UI during deployment, similar to how we configured the `healthcheck` block in Docker Compose.

## Kubernetes Probes

Kubernetes has a similar concept with slightly different names:
- **livenessProbe**: Equivalent to our Docker Compose `healthcheck`. If it fails, Kubelet kills the container and it's subjected to its restart policy. Maps to our `/health` endpoint.
- **readinessProbe**: Determines if a container is ready to accept traffic. If it fails, the endpoint controller removes the pod's IP address from the endpoints of all Services that match the pod. Maps to our `/ready` endpoint.
- **startupProbe**: Similar to Cloud Run's startup probe, used for slow-starting containers.

## Summary

The dual-endpoint pattern (`/health` and `/ready`) is a standard best practice that translates directly from local Docker Compose environments to production container orchestrators.
