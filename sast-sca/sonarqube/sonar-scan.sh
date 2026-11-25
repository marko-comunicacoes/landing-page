#!/usr/bin/env bash
# sonar-scanner-cli via Docker. Precisa de sast-sca/sonarqube/.env com SONAR_HOST_URL e SONAR_TOKEN.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
[ -f "${SCRIPT_DIR}/.env" ] || { echo "Crie ${SCRIPT_DIR}/.env a partir de .env.example"; exit 1; }
set -a; . "${SCRIPT_DIR}/.env"; set +a

docker run --rm --network host \
  -e SONAR_HOST_URL="${SONAR_HOST_URL}" -e SONAR_TOKEN="${SONAR_TOKEN}" \
  -v "${PROJECT_ROOT}:/usr/src" \
  sonarsource/sonar-scanner-cli:latest \
  -Dproject.settings=/usr/src/sast-sca/sonarqube/sonar-project.properties
