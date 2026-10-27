#!/usr/bin/env bash
# Collects the Month 5 deliverables into ./submission with the required names.
#   bash scripts/package-submission.sh [name]
set -euo pipefail

NAME="${1:-chanuka}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/submission"
P="$NAME-month5"

mkdir -p "$OUT/$P-dockerfiles"
cp "$ROOT/frontend/Dockerfile"          "$OUT/$P-dockerfiles/frontend.Dockerfile"
cp "$ROOT/frontend/nginx.conf.template" "$OUT/$P-dockerfiles/frontend.nginx.conf.template"
cp "$ROOT/frontend/.dockerignore"       "$OUT/$P-dockerfiles/frontend.dockerignore"
cp "$ROOT/backend/Dockerfile"           "$OUT/$P-dockerfiles/backend.Dockerfile"
cp "$ROOT/backend/.dockerignore"        "$OUT/$P-dockerfiles/backend.dockerignore"

cp "$ROOT/docker-compose.yml"                    "$OUT/$P-docker-compose.yml"
cp "$ROOT/.github/workflows/ci-cd.yml"           "$OUT/$P-github-workflow.yml"
cp "$ROOT/docs/screenshots/grafana-dashboard.png" "$OUT/$P-monitoring.png"

if [ ! -f "$OUT/$P-deployment-url.md" ]; then
  echo "Missing $OUT/$P-deployment-url.md: fill in the production URL after deploying." >&2
  exit 1
fi

echo "Submission files in $OUT:"
ls -1 "$OUT" "$OUT/$P-dockerfiles"
