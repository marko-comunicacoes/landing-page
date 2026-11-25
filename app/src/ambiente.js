'use strict';
/* Configuração lida das variáveis de ambiente (ver docker/.env.example). */
const path = require('node:path');

function inteiro(v, padrao) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : padrao;
}

function ler(env = process.env) {
  return {
    porta: inteiro(env.PORT, 3000),
    dados: path.resolve(env.DATA_DIR || path.join(__dirname, '..', '..', 'data')),
    publico: path.resolve(env.PUBLIC_DIR || path.join(__dirname, '..', 'public')),
    adminUsuario: env.ADMIN_USER || 'marko',
    adminSenha: env.ADMIN_PASSWORD || '',
    confiarProxy: /^(1|true|sim|yes)$/i.test(env.TRUST_PROXY || ''),
    uploadMaxImagem: inteiro(env.UPLOAD_MAX_IMAGE_MB, 10) * 1024 * 1024,
    uploadMaxVideo: inteiro(env.UPLOAD_MAX_VIDEO_MB, 60) * 1024 * 1024,
    webhookContato: env.CONTATO_WEBHOOK_URL || '',
    historico: inteiro(env.CONFIG_HISTORY, 30)
  };
}

module.exports = { ler };
