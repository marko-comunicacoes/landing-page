#!/usr/bin/env bash
# Trivy via Docker: IaC (Dockerfile/compose de homologação), filesystem (vulnerabilidades e segredos) e a imagem marko-landing.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_DIR="${SCRIPT_DIR}/reports"
TRIVY_IMAGE="${TRIVY_IMAGE:-aquasec/trivy:latest}"
SEVERITY="${SEVERITY:-CRITICAL,HIGH,MEDIUM}"
APP_IMAGE="${APP_IMAGE:-marko-landing-homol:latest}"

mkdir -p "${REPORT_DIR}"

fix_permissions() {
  docker run --rm -v "${REPORT_DIR}:/reports" --entrypoint sh "${TRIVY_IMAGE}" \
    -c "chown -R $(id -u):$(id -g) /reports && chmod 0755 /reports && chmod 0644 /reports/* 2>/dev/null || true"
}
trap fix_permissions EXIT

convert_report() {
  local base="$1"
  docker run --rm -v "${REPORT_DIR}:/reports" "${TRIVY_IMAGE}" convert --format table --output "/reports/${base}.txt" "/reports/${base}.json"
  docker run --rm -v "${REPORT_DIR}:/reports" "${TRIVY_IMAGE}" convert --format template --template "@/contrib/html.tpl" --output "/reports/${base}.html" "/reports/${base}.json"
}

IGNORE_ARG=()
[ -f "${SCRIPT_DIR}/.trivyignore" ] && IGNORE_ARG=(--ignorefile /workspace/sast-sca/trivy/.trivyignore)

echo "=== [1/3] IaC / misconfigurations ==="
docker run --rm -v trivy-cache:/root/.cache/ -v "${PROJECT_ROOT}:/workspace:ro" -v "${REPORT_DIR}:/reports" \
  "${TRIVY_IMAGE}" config --severity "${SEVERITY}" "${IGNORE_ARG[@]}" \
  --skip-dirs /workspace/.git --skip-dirs /workspace/sast-sca \
  --format json --output /reports/trivy-config-report.json /workspace
convert_report trivy-config-report

echo "=== [2/3] Filesystem: vulnerabilidades e segredos ==="
docker run --rm -v trivy-cache:/root/.cache/ -v "${PROJECT_ROOT}:/workspace:ro" -v "${REPORT_DIR}:/reports" \
  "${TRIVY_IMAGE}" fs --scanners vuln,secret --severity "${SEVERITY}" "${IGNORE_ARG[@]}" \
  --skip-dirs /workspace/.git --skip-dirs /workspace/sast-sca/trivy/reports \
  --skip-files /workspace/docker/.env --skip-files /workspace/sast-sca/sonarqube/.env --skip-files /workspace/.env \
  --format json --output /reports/trivy-fs-report.json /workspace
convert_report trivy-fs-report

echo "=== [3/3] Imagem ${APP_IMAGE} ==="
if docker image inspect "${APP_IMAGE}" >/dev/null 2>&1; then
  docker run --rm -v trivy-cache:/root/.cache/ -v /var/run/docker.sock:/var/run/docker.sock -v "${PROJECT_ROOT}:/workspace:ro" -v "${REPORT_DIR}:/reports" \
    "${TRIVY_IMAGE}" image --severity "${SEVERITY}" --ignore-unfixed "${IGNORE_ARG[@]}" \
    --format json --output /reports/trivy-image-report.json "${APP_IMAGE}"
  convert_report trivy-image-report
else
  echo ">> Imagem não encontrada. Rode 'docker compose -f docker/compose.yaml build' antes."
fi

echo ">> Relatórios em ${REPORT_DIR}"
ls -lh "${REPORT_DIR}"
