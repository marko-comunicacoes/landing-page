# Trivy

```bash
docker compose build          # para escanear a imagem também
./sast-sca/trivy/run-trivy.sh # relatórios em sast-sca/trivy/reports/ (txt, html, json)
SEVERITY=CRITICAL,HIGH ./sast-sca/trivy/run-trivy.sh
```

Exceções vão em `.trivyignore`, sempre com o motivo.
