# Marko Comunicações — landing page

Landing page estática da Marko (HTML, CSS e JavaScript, sem servidor e sem build), feita a partir do design system: cores, fontes e peças `mk-`.

- **Produção:** Vercel, configurada pelo `vercel.json`.
- **Homologação:** Docker com Nginx, em `docker/`.

## Produção na Vercel

1. Em **Add New → Project**, importe `marko-comunicacoes/landing-page`.
2. **Framework Preset: Other**.
3. Deixe **Root Directory** em `./` e não preencha os campos de build. O `vercel.json` já define:
   - sem install e sem build;
   - `outputDirectory: app`;
   - cabeçalhos de segurança e cache.
4. Clique em **Deploy**. Depois, cada push na `main` publica sozinho.

O domínio próprio é configurado em **Settings → Domains**.

> Não coloque `compose.yaml` nem `Dockerfile` na raiz do repositório. Se a Vercel encontrar um deles, tenta rodar o projeto como container, e o build falha com “Container service must specify an entrypoint”.

## Homologação com Docker

```bash
docker compose -f docker/compose.yaml up -d --build
```

O site abre em http://localhost:8090. Para usar outra porta: `HOST_PORT=9000 docker compose -f docker/compose.yaml up -d --build`.

O Nginx serve os mesmos arquivos de `app/`, com os mesmos cabeçalhos da Vercel e mais `noindex`, para a homologação não aparecer no Google. O container roda sem root e com o sistema de arquivos só leitura.

Para homologar sem Docker: `python3 -m http.server 8090 -d app`.

## Como editar o conteúdo

Todo o conteúdo fica em `app/assets/js/config.js`, no objeto `PADRAO`. Edite lá e faça push:

- textos de todas as seções;
- cores e fontes;
- fotos e vídeos do mosaico;
- serviços, com etapas e galeria;
- clientes, fundador e depoimentos;
- WhatsApp, e-mail, Instagram e endereço.

Os títulos aceitam `*itálico*`, `**negrito**` e `~serifa~`.

Fotos e vídeos novos vão em `app/assets/img/` e `app/assets/video/`. Os caminhos no `config.js` são relativos, por exemplo `assets/img/portfolio/foto.jpg`. Para o site continuar leve:

- fotos de até 1600 px, em JPG ou WebP;
- vídeos curtos em MP4 de 360p a 720p.

## Formulário de orçamento

Como o site não tem servidor, o formulário monta a mensagem (nome, WhatsApp, empresa, serviços e texto) e abre o WhatsApp da Marko com ela pronta. O visitante só aperta enviar. O número vem de `contato.whatsapp` no `config.js`.

## Pastas

```text
app/                site publicado (index.html e assets/: css, js, img, video, fonts)
docker/             homologação: Dockerfile, nginx.conf, compose.yaml
sast-sca/           trivy/, bearer/ e sonarqube/: análise via Docker
vercel.json         configuração da Vercel (produção)
.vercelignore       docker/ e sast-sca/ não vão para a Vercel
```

O design system de origem está em `../design-system/project/` e em https://claude.ai/artifact/Jdg7JCKsi6iMN1jd8pzzD6.

## Pendências de conteúdo

- Os serviços **Social Mídia**, **Design Gráfico** e **Tráfego Pago** têm resumo e etapas ilustrativos (`exemplo: true` no `config.js`). O texto precisa ser aprovado.
- As fotos dos depoimentos foram casadas com os nomes por suposição. Confirmar.
- O símbolo usado é a foto de perfil do Instagram (150 px). Falta o arquivo original em alta.
- As fontes originais (Helvetica World, Fashion Fetish Heavy, TT Ramillas) são licenciadas pelo Canva. O site usa as substitutas Arimo, Jost e Fraunces.
