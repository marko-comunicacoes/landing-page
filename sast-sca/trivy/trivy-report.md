# Relatório de Segurança — Trivy (`landing-page`)

- **Data:** 2026-11-25
- **Projeto:** `marko-landing` (`/home/jpos/projects/work/markocomunicacoes/landing-page`)
- **Scanner:** `aquasec/trivy:latest` (executado via `sast-sca/trivy/run-trivy.sh`)
- **Severidades filtradas:** `CRITICAL,HIGH,MEDIUM`
- **Imagem analisada:** `marko-landing:latest` (`alpine 3.24.4`, `--ignore-unfixed`)

---

## Resumo Executivo

| Scan | Alvo | CRITICAL | HIGH | MEDIUM | Total |
|---|---|---:|---:|---:|---:|
| `[1/3]` IaC / Misconfigurations (`trivy config`) | Repositório (`docker/Dockerfile`: 24 verificações OK, 0 falhas) | 0 | 0 | 0 | **0** |
| `[2/3]` Filesystem (`trivy fs --scanners vuln,secret`) | Código-fonte e configs do repositório (excluindo `.env` locais) | 0 | 0 | 0 | **0** |
| `[3/3]` Imagem Docker (`trivy image --ignore-unfixed`) | `marko-landing:latest` (`alpine 3.24.4` + `npm` embutido da imagem base) | 0 | 10 | 19 | **29** |
| **Total geral** | — | **0** | **10** | **19** | **29** |

> **Observação sobre IaC:** No scan `[1/3]`, o parser de Dockerfile do Trivy registrou erro de sintaxe ao tentar ler `docker/Dockerfile.dockerignore` como se fosse um `Dockerfile` (devido ao prefixo `Dockerfile` no nome do arquivo), enquanto `docker/Dockerfile` passou com 24 checks aprovados e 0 falhas.

---

## `[1/3]` IaC / Misconfigurations

- **Achados:** 0 (`CRITICAL`, `HIGH`, `MEDIUM`)
- **Checks aprovados em `docker/Dockerfile`:** 24
- **Relatórios:** `sast-sca/trivy/reports/trivy-config-report.{html,txt,json}`

---

## `[2/3]` Filesystem (Vulnerabilidades e Segredos)

- **Achados:** 0 (`CRITICAL`, `HIGH`, `MEDIUM`)
- **Nota:** Arquivos locais ignorados no Git (`docker/.env`, `sast-sca/sonarqube/.env` e `.env`) foram excluídos via `--skip-files` em `run-trivy.sh`. A aplicação `app/` não possui dependências externas no `package.json`.
- **Relatórios:** `sast-sca/trivy/reports/trivy-fs-report.{html,txt,json}`

---

## `[3/3]` Imagem Docker (`marko-landing:latest`)

Todos os 29 apontamentos pertencem à imagem base `node:22-alpine`:
- **7 vulnerabilidades `MEDIUM` de SO (`alpine 3.24.4`):** `libcrypto3`, `libssl3` e `zlib` desatualizados em relação ao repositório Alpine 3.24.
- **22 vulnerabilidades (`10 HIGH`, `12 MEDIUM`) em pacotes Node.js:** todas localizadas dentro de `/usr/local/lib/node_modules/npm/node_modules/...` (CLI do `npm` embutida na imagem base `node:22-alpine`, não usadas pela aplicação Node pura em runtime).

### Vulnerabilidades `HIGH` (10)

| CVE | Pacote | Versão Instalada | Versão Corrigida | Caminho / Alvo | Resumo |
|---|---|---|---|---|---|
| `CVE-2026-102276` | `brace-expansion` | `2.0.2` | `5.0.10, 3.0.7, 2.1.5, 1.1.19` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS via exaustão de pilha por padrões de chaves malformados |
| `CVE-2026-102278` | `brace-expansion` | `2.0.2` | `5.0.11, 3.0.8, 2.1.6, 1.1.20` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS via recursão descontrolada em padrões aninhados |
| `CVE-2026-13149` | `brace-expansion` | `2.0.2` | `5.0.7, 1.1.16, 2.1.2` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS por complexidade exponencial |
| `CVE-2026-14257` | `brace-expansion` | `2.0.2` | `5.0.8, 3.0.3, 2.1.3, 1.1.17` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS via exaustão de memória em `expand()` |
| `CVE-2026-69152` | `brace-expansion` | `2.0.2` | `1.1.18, 2.1.4, 3.0.6, 5.0.9` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS via arrays intermediários sem limite (bypass de `CVE-2026-14257`) |
| `CVE-2026-33671` | `picomatch` | `4.0.3` | `4.0.4, 3.0.2, 2.3.2` | `usr/local/lib/node_modules/npm/node_modules/picomatch/package.json` | ReDoS via padrões extglob malformados |
| `CVE-2026-48815` | `sigstore` | `3.1.0` | `4.1.1` | `usr/local/lib/node_modules/npm/node_modules/sigstore/package.json` | Aceitação indevida de certificados por ignorar `certificateOIDs` |
| `CVE-2026-69192` | `ip-address` | `10.1.0` | `10.3.1` | `usr/local/lib/node_modules/npm/node_modules/ip-address/package.json` | Parsing inconsistente de IP levando a SSRF / bypass de limite de confiança |
| `CVE-2026-9496` | `pacote` | `19.0.2` | `21.5.1` | `usr/local/lib/node_modules/npm/node_modules/@npmcli/metavuln-calculator/node_modules/pacote/package.json` | DoS via `spec.rawSpec` malformado em `addGitSha` |
| `CVE-2026-9496` | `pacote` | `20.0.1` | `21.5.1` | `usr/local/lib/node_modules/npm/node_modules/pacote/package.json` | DoS via `spec.rawSpec` malformado em `addGitSha` |

### Vulnerabilidades `MEDIUM` (19)

| CVE | Pacote | Versão Instalada | Versão Corrigida | Caminho / Alvo | Resumo |
|---|---|---|---|---|---|
| `CVE-2026-107496` | `libcrypto3` | `3.5.9-r0` | `3.5.9-r1` | Alpine `3.24.4` (`<os>`) | OpenSSL: DoS via certificado EC malformado em criptografia CMS |
| `CVE-2026-107496` | `libssl3` | `3.5.9-r0` | `3.5.9-r1` | Alpine `3.24.4` (`<os>`) | OpenSSL: DoS via certificado EC malformado em criptografia CMS |
| `CVE-2026-95691` | `libcrypto3` | `3.5.9-r0` | `3.5.9-r1` | Alpine `3.24.4` (`<os>`) | OpenSSL: DoS via frames QUIC CRYPTO sobrepostos |
| `CVE-2026-95691` | `libssl3` | `3.5.9-r0` | `3.5.9-r1` | Alpine `3.24.4` (`<os>`) | OpenSSL: DoS via frames QUIC CRYPTO sobrepostos |
| `CVE-2026-95692` | `libcrypto3` | `3.5.9-r0` | `3.5.9-r1` | Alpine `3.24.4` (`<os>`) | OpenSSL: DoS via leitura fora dos limites em AES-GCM-SIV |
| `CVE-2026-95692` | `libssl3` | `3.5.9-r0` | `3.5.9-r1` | Alpine `3.24.4` (`<os>`) | OpenSSL: DoS via leitura fora dos limites em AES-GCM-SIV |
| `CVE-2026-4738` | `zlib` | `1.3.2-r1` | `1.4-r0` | Alpine `3.24.4` (`<os>`) | Escrita/leitura fora dos limites de buffer de memória |
| `CVE-2026-101911` | `ip-address` | `10.1.0` | `10.7.1` | `usr/local/lib/node_modules/npm/node_modules/ip-address/package.json` | DoS via parsing ilimitado de endereço IPv6 |
| `CVE-2026-101912` | `ip-address` | `10.1.0` | `10.7.1` | `usr/local/lib/node_modules/npm/node_modules/ip-address/package.json` | Bypass de controle de acesso em comparação de sub-rede entre famílias |
| `CVE-2026-101913` | `ip-address` | `10.1.0` | `10.5.1` | `usr/local/lib/node_modules/npm/node_modules/ip-address/package.json` | Bypass de segurança por validação incompleta de IPv6 link-local |
| `CVE-2026-111997` | `ip-address` | `10.1.0` | `10.7.4` | `usr/local/lib/node_modules/npm/node_modules/ip-address/package.json` | DoS via excesso de `%` em entrada IPv6 |
| `CVE-2026-42338` | `ip-address` | `10.1.0` | `10.1.1` | `usr/local/lib/node_modules/npm/node_modules/ip-address/package.json` | XSS por escape HTML inadequado |
| `CVE-2026-102277` | `brace-expansion` | `2.0.2` | `5.0.12, 3.0.9, 2.1.7, 1.1.21` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS via padrões de chaves malformados |
| `CVE-2026-33750` | `brace-expansion` | `2.0.2` | `5.0.5, 3.0.2, 2.0.3, 1.1.13` | `usr/local/lib/node_modules/npm/node_modules/brace-expansion/package.json` | DoS via passo zero em padrão de chaves |
| `CVE-2026-104844` | `postcss-selector-parser` | `7.1.1` | `7.1.6, 6.1.5` | `usr/local/lib/node_modules/npm/node_modules/postcss-selector-parser/package.json` | DoS via seletores CSS malformados |
| `CVE-2026-118764` | `minimatch` | `9.0.9` | `11.0.1` | `usr/local/lib/node_modules/npm/node_modules/minimatch/package.json` | DoS via expansão de padrão glob malformado |
| `CVE-2026-118773` | `glob` | `10.5.0` | `14.0.2` | `usr/local/lib/node_modules/npm/node_modules/glob/package.json` | DoS via cancelamento incompleto de travessia |
| `CVE-2026-33672` | `picomatch` | `4.0.3` | `4.0.4, 3.0.2, 2.3.2` | `usr/local/lib/node_modules/npm/node_modules/picomatch/package.json` | Comprometimento de integridade por injeção de método em classes POSIX |
| `CVE-2026-48758` | `@sigstore/core` | `2.0.0` | `3.2.1` | `usr/local/lib/node_modules/npm/node_modules/@sigstore/core/package.json` | Bypass de assinatura por codificação incorreta em `preAuthEncoding` |

---

## Arquivos Gerados

- Consolidado: `sast-sca/trivy/trivy-report.md`
- IaC / Config: `sast-sca/trivy/reports/trivy-config-report.{html,txt,json}`
- Filesystem / Secrets: `sast-sca/trivy/reports/trivy-fs-report.{html,txt,json}`
- Imagem Docker: `sast-sca/trivy/reports/trivy-image-report.{html,txt,json}`

## Próximo Passo

Para remediar os apontamentos da imagem `marko-landing:latest` (ex.: `apk upgrade --no-cache` no `Dockerfile` e remoção do `npm`/toolchain embutido não utilizado em produção ou rebuild com base atualizada), execute a skill **`/sast-trivy-fix`**.
