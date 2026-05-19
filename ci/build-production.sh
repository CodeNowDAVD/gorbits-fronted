#!/usr/bin/env bash
# Build de producción GOrbitSF (CI local / Jenkins).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"
DIST_DIR="${DIST_DIR:-${FRONTEND_DIR}/dist/gorbitsf/browser}"

echo "======================================"
echo " BUILD GOrbitSF (producción)"
echo "======================================"
echo "Dir: ${FRONTEND_DIR}"
echo ""

cd "${FRONTEND_DIR}"

if ! node -v 2>&1 | grep -qE 'v(20|22|24)\.'; then
  echo "AVISO: se recomienda Node.js 20+ (node -v: $(node -v 2>&1))" >&2
fi

npm ci
npm run build

if [[ ! -f "${DIST_DIR}/index.html" ]]; then
  echo "ERROR: no existe ${DIST_DIR}/index.html" >&2
  exit 1
fi

echo ""
echo "==> Verificar bundle sin localhost/:8080"
if grep -rE 'localhost|:8080' "${DIST_DIR}"/*.js 2>/dev/null; then
  echo "ERROR: el build referencia hosts de desarrollo" >&2
  exit 1
fi
echo "OK: sin localhost ni :8080 en JS principales"

echo ""
echo "Build OK → ${DIST_DIR}"
ls -la "${DIST_DIR}" | head -20
