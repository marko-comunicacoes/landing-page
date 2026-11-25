# Marko Comunicações — HOMOLOGAÇÃO. Produção é a Vercel (vercel.json na raiz).
# Serve os mesmos arquivos estáticos de app/ com Nginx, sem root.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=root:root docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=root:root app/ /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
