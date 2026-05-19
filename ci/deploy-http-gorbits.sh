#!/usr/bin/env bash
# Deploy GOrbitSF → POST https://app.gorbits.xyz/deploy-frontend
# Bearer token (Jenkins: credencial gorbits-deploy-token).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"
DIST_DIR="${DIST_DIR:-${FRONTEND_DIR}/dist/gorbitsf/browser}"

DEPLOY_URL="${DEPLOY_URL:-https://app.gorbits.xyz/deploy-frontend}"
FRONTEND_URL="${FRONTEND_URL:-https://app.gorbits.xyz}"
HEALTH_URL="${HEALTH_URL:-https://app.gorbits.xyz/api/actuator/health}"
TAR_FILE="${TAR_FILE:-${FRONTEND_DIR}/frontend-new.tar.gz}"
RESP_FILE="${RESP_FILE:-/tmp/gorbitsf-deploy-response.txt}"

if [[ -z "${DEPLOY_TOKEN:-}" ]]; then
  echo "ERROR: DEPLOY_TOKEN vacío. Jenkins: credencial gorbits-deploy-token" >&2
  exit 1
fi

if [[ ! -f "${DIST_DIR}/index.html" ]]; then
  echo "ERROR: no hay build en ${DIST_DIR}" >&2
  exit 1
fi

echo "======================================"
echo " DEPLOY HTTP → GOrbitSF (frontend)"
echo "======================================"
echo "URL:   ${DEPLOY_URL}"
echo "Tar:   ${TAR_FILE}"
echo "From:  ${DIST_DIR}/"
echo "Token: (definido, ${#DEPLOY_TOKEN} caracteres)"
echo ""

echo "==> 1/3 Empaquetar"
tar -czf "${TAR_FILE}" -C "${DIST_DIR}" .
ls -lh "${TAR_FILE}"

echo ""
echo "==> 2/3 POST deploy-frontend"
HTTP_CODE=$(curl -sS -w "%{http_code}" -o "${RESP_FILE}" -X POST \
  -H "Authorization: Bearer ${DEPLOY_TOKEN}" \
  -F "file=@${TAR_FILE}" \
  "${DEPLOY_URL}" || echo "000")

echo "HTTP ${HTTP_CODE}"
cat "${RESP_FILE}" || true
echo ""

if [[ "${HTTP_CODE}" != "200" && "${HTTP_CODE}" != "201" && "${HTTP_CODE}" != "204" ]]; then
  echo "ERROR: POST ${DEPLOY_URL} respondió HTTP ${HTTP_CODE}" >&2
  echo "Revisa: token gorbits-deploy-token, endpoint /deploy-frontend, red del agente Jenkins" >&2
  exit 1
fi

echo "==> 3/3 Validación ${FRONTEND_URL}/"
SPA_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/" || echo "000")
echo "Frontend HTTP ${SPA_CODE}"

if [[ "${SPA_CODE}" != "200" ]]; then
  echo "ERROR: ${FRONTEND_URL}/ respondió HTTP ${SPA_CODE}" >&2
  exit 1
fi

echo "Deploy frontend HTTP OK."
