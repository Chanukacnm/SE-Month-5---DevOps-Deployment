# syntax=docker/dockerfile:1

# ---- Build stage: compile the React SPA into static files ----
FROM node:24-alpine AS builder
WORKDIR /app

# Manifests first, so the npm ci layer is reused until dependencies change.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .
# Optional absolute API URL. Leave empty to call same-origin /api (proxied by nginx below).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Runtime stage: static files behind nginx, running as a non-root user ----
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime

# Where nginx forwards /api requests. Overridden per environment
# (http://backend:3000 in Compose, the API's URL in the cloud).
ENV API_UPSTREAM=http://backend:3000

# The image's entrypoint renders templates/*.template into conf.d with envsubst at start-up.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
