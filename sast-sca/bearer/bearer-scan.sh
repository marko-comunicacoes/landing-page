#!/usr/bin/env bash
# Bearer CLI via Docker: SAST do código (app/assets/js).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_DIR="${SCRIPT_DIR}/reports"
SKIP="docs,sast-sca,app/assets/video,app/assets/img,app/assets/fonts"
mkdir -p "${REPORT_DIR}"

for FORMATO in json html; do
  docker run --rm --user "$(id -u):$(id -g)" -v "${PROJECT_ROOT}:/tmp/scan" \
    bearer/bearer:latest scan /tmp/scan --skip-path "${SKIP}" \
    --format "${FORMATO}" --output "/tmp/scan/sast-sca/bearer/reports/bearer-report.${FORMATO}" \
    --exit-code 0 || true
done

echo ">> Relatórios em ${REPORT_DIR}"
