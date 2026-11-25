# Marko Comunicações — landing page

Landing page da Marko feita a partir do design system (cores, fontes e peças `mk-`), com admin para trocar cores, fontes, textos, fotos e vídeos sem mexer em código. Roda em um container Docker com Node puro (sem dependências de npm).

| Endereço | O que é | Acesso |
|---|---|---|
| `/` | Landing page | público |
| `/admin` | Admin com prévia ao vivo (desktop/celular), rascunho e botão Publicar | senha |
| `/guia` | Guia da marca: cores com contraste, tipografia, componentes e tom de voz | senha |
| `/api/health` | Verificação de saúde do container | público |

## Subir com Docker

```bash
cp docker/.env.example docker/.env      # defina ADMIN_PASSWORD
docker compose up -d --build
```

O site abre em http://localhost:8090 e o admin em http://localhost:8090/admin (usuário `ADMIN_USER`, senha `ADMIN_PASSWORD`). Sem `ADMIN_PASSWORD`, o admin fica desativado.

A porta do host muda com `HOST_PORT=9000 docker compose up -d`. Por padrão o container só escuta em `127.0.0.1`; para expor na rede, use `BIND_ADDR=0.0.0.0`, mas prefira publicar por um proxy reverso com HTTPS (veja abaixo).

## Variáveis (`docker/.env`)

| Variável | Padrão | Para quê |
|---|---|---|
| `ADMIN_USER` / `ADMIN_PASSWORD` | `marko` / vazio | Login do admin e do guia |
| `TRUST_PROXY` | `false` | `true` atrás de Nginx/Caddy/Traefik (usa `X-Forwarded-For` no limite de pedidos e de tentativas de login) |
| `UPLOAD_MAX_IMAGE_MB` / `UPLOAD_MAX_VIDEO_MB` | `10` / `60` | Tamanho máximo dos envios do admin |
| `CONFIG_HISTORY` | `30` | Quantas publicações anteriores guardar |
| `CONTATO_WEBHOOK_URL` | vazio | Recebe um POST JSON a cada pedido de orçamento (n8n, Make, Zapier…) |

## Onde ficam os dados

Tudo que muda pelo site fica em `data/`, montado como volume em `/data`:

- `config.json`: a configuração publicada. Sem ela, o site usa o padrão de `app/public/assets/js/config.js`.
- `historico/`: as últimas publicações. Para voltar uma versão, copie o arquivo para `data/config.json` e rode `docker compose restart`.
- `uploads/`: imagens e vídeos enviados pelo admin. O tipo é conferido pelo conteúdo do arquivo e cada arquivo recebe um nome aleatório.
- `contatos.jsonl`: os pedidos de orçamento do formulário, que também aparecem no admin em **Pedidos recebidos**.

Backup é só copiar a pasta `data/`. O container roda como o usuário `node` (uid 1000), então em outro servidor a pasta precisa ser gravável por esse uid: `sudo chown -R 1000:1000 data`.

## Como funciona

- O site carrega `/config-publicada.js` (a configuração do servidor) e monta as seções por cima do padrão de `config.js`.
- O admin edita um rascunho e manda cada mudança para a prévia (`/?preview`). **Publicar** grava no servidor (`PUT /api/admin/config`). **Exportar/Importar JSON** baixa e carrega a configuração.
- As imagens são reduzidas para 1600 px no navegador antes do envio (`POST /api/admin/upload`).
- O formulário de orçamento grava o pedido (`POST /api/contato`) e oferece seguir a conversa no WhatsApp com a mensagem já preenchida. Tem validação, um campo invisível contra robôs e limite de 5 pedidos a cada 15 minutos por IP.
- Segurança:
  - cabeçalhos CSP, `nosniff` e `frame-ancestors 'self'`;
  - o admin só aceita escrita vinda do próprio site (checagem de `Origin`);
  - login limitado a 10 tentativas a cada 15 minutos;
  - container `read_only`, sem capabilities e com `no-new-privileges`.
- Vídeos são servidos com `Range` (necessário no Safari/iOS).

## Atrás de um proxy reverso (Nginx)

```nginx
server {
  server_name marko.com.br;
  client_max_body_size 64m;              # envios de vídeo do admin
  location / {
    proxy_pass http://127.0.0.1:8090;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Com proxy, defina `TRUST_PROXY=true`. O login do admin é Basic Auth, então **só use o admin por HTTPS**.

## Desenvolvimento sem Docker

```bash
cd app
ADMIN_PASSWORD=dev npm run dev     # http://localhost:3000, dados em ../data
npm test                           # testes do servidor (node:test)
```

## Pastas

```text
app/
  src/            servidor: rotas, arquivos estáticos, armazenamento, segurança
  public/         index.html (site), admin.html, guia.html e assets/ (css, js, img, video, fonts)
  tests/          testes do servidor
docker/           Dockerfile, Dockerfile.dockerignore e .env.example
data/             volume com config publicada, uploads e pedidos (fora do Git)
sast-sca/         trivy/, bearer/ e sonarqube/: scripts de análise via Docker
compose.yaml
```

O design system de origem está em `../design-system/project/` e em https://claude.ai/artifact/Jdg7JCKsi6iMN1jd8pzzD6.

## Pendências de conteúdo

- Os serviços **Social Mídia**, **Design Gráfico** e **Tráfego Pago** têm resumo e etapas ilustrativos, marcados como “exemplo” no admin. O selo não aparece no site, mas o texto precisa ser aprovado.
- As fotos dos depoimentos foram casadas com os nomes por suposição. Confirmar.
- O símbolo usado é a foto de perfil do Instagram (150 px). Falta o arquivo original em alta.
- As fontes originais (Helvetica World, Fashion Fetish Heavy, TT Ramillas) são licenciadas pelo Canva. O site usa as substitutas Arimo, Jost e Fraunces.
