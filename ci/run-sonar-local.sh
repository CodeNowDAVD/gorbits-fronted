#!/usr/bin/env bash
# SonarQube local — GOrbitSF (Mac, Sonar en :9001).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${SCRIPT_DIR}/..}"

SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9001}"
SONAR_TOKEN="${SONAR_TOKEN:?Exporta SONAR_TOKEN (Sonar → My Account → Security → Generate Token)}"

cd "${FRONTEND_DIR}"

if [[ ! -f sonar-project.properties ]]; then
  echo "ERROR: falta sonar-project.properties en ${FRONTEND_DIR}" >&2
  exit 1
fi

echo "==> Tests + cobertura"
"${SCRIPT_DIR}/run-tests.sh"

echo ""
echo "==> Sonar → ${SONAR_HOST_URL} (proyecto GOrbitSF)"
npx --yes sonar-scanner \
  -Dsonar.host.url="${SONAR_HOST_URL}" \
  -Dsonar.token="${SONAR_TOKEN}"

echo ""
echo "Dashboard: ${SONAR_HOST_URL}/dashboard?id=GOrbitSF"
