# Trivy

```bash
docker compose -f docker/compose.yaml build   # para escanear a imagem de homologação também
./sast-sca/trivy/run-trivy.sh # relatórios em sast-sca/trivy/reports/ (txt, html, json)
SEVERITY=CRITICAL,HIGH ./sast-sca/trivy/run-trivy.sh
```

Exceções vão em `.trivyignore`, sempre com o motivo.
