#!/usr/bin/env bash
# Bearer CLI via Docker: SAST do código (app/src e app/public/assets/js).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_DIR="${SCRIPT_DIR}/reports"
SKIP="app/tests,data,docs,sast-sca,app/public/assets/video,app/public/assets/img,app/public/assets/fonts"
mkdir -p "${REPORT_DIR}"

for FORMATO in json html; do
  docker run --rm --user "$(id -u):$(id -g)" -v "${PROJECT_ROOT}:/tmp/scan" \
    bearer/bearer:latest scan /tmp/scan --skip-path "${SKIP}" \
    --format "${FORMATO}" --output "/tmp/scan/sast-sca/bearer/reports/bearer-report.${FORMATO}" \
    --exit-code 0 || true
done

echo ">> Relatórios em ${REPORT_DIR}"
