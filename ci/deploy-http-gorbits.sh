#!/usr/bin/env bash
# Deploy GOrbitSF → servidor vía HTTP (mismo patrón que GOrbitS backend).
# POST multipart + Bearer token → https://app.gorbits.xyz/deploy
#
# Uso:
#   ./ci/build-production.sh
#   export DEPLOY_TOKEN="tu_token"
#   ./ci/deploy-http-gorbits.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"
DIST_DIR="${DIST_DIR:-${FRONTEND_DIR}/dist/gorbitsf/browser}"

DEPLOY_URL="${DEPLOY_URL:-https://app.gorbits.xyz/deploy}"
HEALTH_URL="${HEALTH_URL:-https://app.gorbits.xyz/api/actuator/health}"
FRONTEND_URL="${FRONTEND_URL:-https://app.gorbits.xyz}"
TAR_FILE="${TAR_FILE:-/tmp/gorbitsf-frontend.tar.gz}"

if [[ -z "${DEPLOY_TOKEN:-}" ]]; then
  echo "ERROR: define DEPLOY_TOKEN o usa credencial Jenkins gorbits-deploy-token" >&2
  exit 1
fi

if [[ ! -f "${DIST_DIR}/index.html" ]]; then
  echo "ERROR: no hay build en ${DIST_DIR}. Ejecuta: ./ci/build-production.sh" >&2
  exit 1
fi

echo "======================================"
echo " DEPLOY HTTP → GOrbitSF"
echo "======================================"
echo "URL:  ${DEPLOY_URL}"
echo "From: ${DIST_DIR}"
echo ""

echo "==> Empaquetar estáticos"
tar -czf "${TAR_FILE}" -C "${DIST_DIR}" .
ls -lh "${TAR_FILE}"

echo ""
echo "==> POST (curl)"
RESP=$(curl -sf -S -X POST \
  -H "Authorization: Bearer ${DEPLOY_TOKEN}" \
  -F "file=@${TAR_FILE}" \
  "${DEPLOY_URL}") || {
  echo "ERROR: falló POST a ${DEPLOY_URL}" >&2
  exit 1
}

echo "${RESP}"
echo ""

if ! echo "${RESP}" | grep -qE 'Deploy OK|Deploy exitoso|✅|success'; then
  echo "AVISO: respuesta sin mensaje de éxito claro; verificar en servidor" >&2
fi

echo "==> Health API"
HEALTH=$(curl -sf "${HEALTH_URL}" || true)
echo "${HEALTH}"

echo ""
echo "==> Frontend SPA"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/" || echo "000")
echo "HTTP ${HTTP_CODE} ← ${FRONTEND_URL}/"

if echo "${HEALTH}" | grep -q '"status":"UP"' && [[ "${HTTP_CODE}" == "200" ]]; then
  echo "Deploy HTTP frontend OK."
else
  echo "AVISO: revisar ${FRONTEND_URL} y ${HEALTH_URL}"
fi
