#!/usr/bin/env bash
# Genera GOrbitSF-dist.tar.gz para entrega DevOps.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"

cd "${FRONTEND_DIR}"

"${SCRIPT_DIR}/build-production.sh"

rm -rf release
mkdir -p release/browser
cp -r dist/gorbitsf/browser/. release/browser/
cp ENTREGA_FRONTEND.md env.required.example release/

OUT="${FRONTEND_DIR}/GOrbitSF-dist.tar.gz"
tar -czf "${OUT}" -C release .
rm -rf release

echo ""
echo "Paquete listo: ${OUT}"
ls -lh "${OUT}"
