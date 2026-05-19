#!/usr/bin/env bash
# Verificación post-deploy frontend + nginx + health API.
set -euo pipefail

TERMUX_HOST="${TERMUX_HOST:-192.168.2.4}"
TERMUX_USER="${TERMUX_USER:-u0_a296}"
TERMUX_PORT="${TERMUX_PORT:-8022}"
FRONTEND_URL="${FRONTEND_URL:-http://${TERMUX_HOST}:8088}"
HEALTH_URL="${HEALTH_URL:-${FRONTEND_URL}/api/actuator/health}"

echo "======================================"
echo " VERIFICACIÓN GOrbitSF"
echo "======================================"

echo "==> Estado en Termux (SSH)"
ssh -p "${TERMUX_PORT}" "${TERMUX_USER}@${TERMUX_HOST}" '
  echo "=== Frontend ==="
  ~/servers/gorbits-frontend/bin/status.sh 2>/dev/null || echo "(status.sh no disponible)"

  echo ""
  echo "=== Nginx ==="
  ~/services/nginx/bin/status.sh 2>/dev/null || echo "(nginx status no disponible)"
'

echo ""
echo "==> Health API (desde Mac)"
HTTP_CODE=$(curl -s -o /tmp/gorbits-health.json -w "%{http_code}" "${HEALTH_URL}" || true)
cat /tmp/gorbits-health.json 2>/dev/null || true
echo ""
echo "HTTP ${HTTP_CODE} ← ${HEALTH_URL}"

echo ""
echo "==> Frontend SPA (cabecera HTTP)"
curl -sI "${FRONTEND_URL}/" | head -5
echo ""
echo "Abre en navegador: ${FRONTEND_URL}/login"
