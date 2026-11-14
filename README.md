# Health Check Lab

## Setup
```bash
docker compose up -d
```

## Verify Service
```bash
curl localhost:3000/orders
curl -i localhost:3000/health
curl -i localhost:3000/ready
docker compose ps
```

`/health` is a shallow liveness check and does not contact PostgreSQL.
`/ready` runs `SELECT 1` and returns `503` when PostgreSQL is unavailable. The
Compose health check uses `/ready`, so stopping `db` makes `orders-api`
unhealthy; starting `db` again lets it become healthy without recreating the
API container.

## Stop Database
```bash
docker compose stop db
curl -i localhost:3000/ready
docker compose ps
```

## Restore Database
```bash
docker compose start db
curl -i localhost:3000/ready
docker compose ps
```

`restart: unless-stopped` restarts the API if its process exits, but Docker
Compose does not restart a running container just because its health status is
unhealthy. The readiness check reports dependency failures; it is not itself a
restart trigger. See [CLOUD_RUN.md](./CLOUD_RUN.md) for cloud probe mapping.
