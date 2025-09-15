# Backend on GCE (No Nginx)

This guide deploys Spring Boot on GCE without Nginx. TLS is handled by Google Cloud HTTP(S) Load Balancer (recommended) or by Spring Boot itself (simpler but harder to auto‑renew certs).

## Option A — Google Cloud HTTP(S) Load Balancer (Recommended)

- Why: Managed SSL certs, WebSocket/SSE support, global anycast IP, DDoS protection, easy scaling.
- Works with: `/ws-stomp/**` WebSocket and `/api/notifications/stream` SSE.

### 1) Build and push the image

```
# In project root
docker build -t REGION-docker.pkg.dev/PROJECT/REPO/hongbookstore:$(git rev-parse --short HEAD) .
# Authenticate to Artifact Registry first, then push
```

### 2) Create VM (no external IP is OK)

- Same region/zone as DB/Redis to minimize latency.
- Attach a service account with minimal roles (e.g., `roles/storage.objectAdmin`).
- Open firewall only to health checks (Google HC ranges) and internal ports as needed.

On the VM:

```
# Pull and run
mkdir -p /opt/hongbookstore && cd /opt/hongbookstore
sudo docker pull REGION-docker.pkg.dev/PROJECT/REPO/hongbookstore:TAG
sudo docker run -d --name hongbookstore --restart unless-stopped \
  --env-file /opt/hongbookstore/.env \
  -p 127.0.0.1:8080:8080 \
  REGION-docker.pkg.dev/PROJECT/REPO/hongbookstore:TAG
```

> Keep the app bound to localhost:8080. The load balancer will reach the VM over the VPC, you don’t need to expose 8080 publicly.

### 3) Health check endpoint

- We added `spring-boot-starter-actuator`. Configure GCLB health check to HTTP `GET /actuator/health` on port 8080.
- Add firewall to allow Google health check IP ranges.

### 4) Unmanaged instance group

- Put the single VM into an “unmanaged instance group”. GCLB backends need an IG/MIG.

### 5) Create external HTTP(S) Load Balancer

- Managed certificate for `api.your-domain`.
- URL map → backend service (the instance group).
- Frontend (443) → URL map.
- Optional: redirect 80 → 443.

### 6) DNS

- Point `api.your-domain` A/AAAA to the LB IP.

### 7) CORS and OAuth redirect

- Set `ALLOWED_ORIGINS` to include your Vercel/custom domains.
- Use `{baseUrl}/login/oauth2/code/{registrationId}` redirect URIs on the IdP console.

## Option B — Spring Boot terminates TLS (No LB)

- Simpler infra, but you must manage certificates and auto‑renew.
- Steps:
  1) Issue cert (Let’s Encrypt) and convert to PKCS12.
  2) Mount keystore and set `server.ssl.*` props via env.
  3) Expose `:443` from the container, update security groups.
- Not recommended when WebSocket/SSE and scaling are in scope.

## Databases on GCE with Docker

- Prefer internal VPC IPs for MySQL and Redis; do not expose to the internet.
- Connect the app using env vars `MYSQL_HOST`, `MYSQL_PORT`, `REDIS_HOST`, `REDIS_PORT`.

## Environment variables

See `deploy/gce/example.env` for a template. Never commit secrets.

## Observability

- Actuator: `/actuator/health` for LB health checks.
- Consider Cloud Logging/Monitoring agents on the VM.

## CI/CD (outline)

- GitHub Actions: build → push image to Artifact Registry → SSH or `gcloud compute ssh` to pull and restart.
- Add a basic canary or a simple `docker run` with new tag, then swap containers to minimize downtime.

