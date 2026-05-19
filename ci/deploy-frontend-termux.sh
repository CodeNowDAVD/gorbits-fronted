#!/usr/bin/env bash
# Deploy GOrbitSF → Termux LAN (tar + scp + ssh). OPCIONAL.
# Flujo principal CI/CD: ./ci/deploy-http-gorbits.sh → POST /deploy-frontend
# Ver: ../ENTREGA_FRONTEND.md y ../../comandos_despliegue_gorbits.txt
#
# Uso:
#   ./ci/build-production.sh
#   ./ci/deploy-frontend-termux.sh
#
# Variables opcionales:
#   TERMUX_HOST=192.168.2.4  TERMUX_USER=u0_a296  TERMUX_PORT=8022
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"
DIST_DIR="${DIST_DIR:-${FRONTEND_DIR}/dist/gorbitsf/browser}"

TERMUX_HOST="${TERMUX_HOST:-192.168.2.4}"
TERMUX_USER="${TERMUX_USER:-u0_a296}"
TERMUX_PORT="${TERMUX_PORT:-8022}"
REMOTE_RELEASES="${REMOTE_RELEASES:-~/servers/gorbits-frontend/releases}"
REMOTE_TAR="${REMOTE_RELEASES}/frontend-new.tar.gz"
DEPLOY_SCRIPT="${DEPLOY_SCRIPT:-~/servers/gorbits-frontend/bin/deploy.sh}"

TAR_LOCAL="${TAR_LOCAL:-/tmp/frontend-new.tar.gz}"

if [[ ! -f "${DIST_DIR}/index.html" ]]; then
  echo "ERROR: no hay build en ${DIST_DIR}. Ejecuta: ./ci/build-production.sh" >&2
  exit 1
fi

echo "======================================"
echo " DEPLOY FRONTEND → Termux"
echo "======================================"
echo "Host:  ${TERMUX_USER}@${TERMUX_HOST}:${TERMUX_PORT}"
echo "From:  ${DIST_DIR}"
echo ""

echo "==> 1/3 Empaquetar"
tar -czf "${TAR_LOCAL}" -C "${DIST_DIR}" .
ls -lh "${TAR_LOCAL}"

echo ""
echo "==> 2/3 Copiar (scp)"
scp -P "${TERMUX_PORT}" "${TAR_LOCAL}" \
  "${TERMUX_USER}@${TERMUX_HOST}:${REMOTE_TAR}"

echo ""
echo "==> 3/3 Deploy en servidor"
ssh -p "${TERMUX_PORT}" "${TERMUX_USER}@${TERMUX_HOST}" \
  "${DEPLOY_SCRIPT} ${REMOTE_TAR}"

echo ""
echo "Deploy frontend solicitado. Verifica:"
echo "  http://${TERMUX_HOST}:8088"
echo "  http://${TERMUX_HOST}:8088/api/actuator/health"
