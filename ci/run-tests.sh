#!/usr/bin/env bash
# Tests unitarios + cobertura LCOV (Vitest vía ng test).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"

cd "${FRONTEND_DIR}"

echo "======================================"
echo " TESTS + COBERTURA GOrbitSF"
echo "======================================"

npm run test:ci

LCOV="${FRONTEND_DIR}/coverage/gorbitsf/lcov.info"
if [[ ! -f "${LCOV}" ]]; then
  echo "ERROR: no se generó ${LCOV}" >&2
  exit 1
fi

echo ""
echo "OK → ${LCOV}"
