'use strict';
const crypto = require('node:crypto');

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // estilos inline: o site monta variáveis CSS e alguns style="" a partir da configuração
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'"
].join('; ');

function cabecalhos(res) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
}

function ipDe(req, confiarProxy) {
  if (confiarProxy) {
    const xff = req.headers['x-forwarded-for'];
    if (xff) return String(xff).split(',')[0].trim();
  }
  return req.socket.remoteAddress || '?';
}

/* Janela deslizante simples em memória: suficiente para um único container. */
function limitador(maximo, janelaMs) {
  const mapa = new Map();
  function limpar(agora) {
    for (const [k, v] of mapa) if (v.inicio + janelaMs <= agora) mapa.delete(k);
  }
  return {
    estourou(chave) {
      const agora = Date.now();
      if (mapa.size > 5000) limpar(agora);
      const v = mapa.get(chave);
      return !!v && v.inicio + janelaMs > agora && v.n >= maximo;
    },
    contar(chave) {
      const agora = Date.now();
      let v = mapa.get(chave);
      if (!v || v.inicio + janelaMs <= agora) { v = { inicio: agora, n: 0 }; mapa.set(chave, v); }
      v.n++;
      return v.n;
    },
    zerar(chave) { mapa.delete(chave); }
  };
}

function igualSeguro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/* Basic Auth: devolve true se as credenciais conferem */
function credenciaisOk(req, usuario, senha) {
  const h = req.headers.authorization || '';
  const m = /^Basic\s+([A-Za-z0-9+/=]+)$/i.exec(h);
  if (!m) return false;
  const txt = Buffer.from(m[1], 'base64').toString('utf8');
  const i = txt.indexOf(':');
  if (i < 0) return false;
  const okU = igualSeguro(txt.slice(0, i), usuario);
  const okS = igualSeguro(txt.slice(i + 1), senha);
  return okU && okS;
}

/* Pedidos que mudam algo só podem vir do próprio site (bloqueia CSRF com credenciais em cache). */
function mesmaOrigem(req, confiarProxy) {
  const origem = req.headers.origin;
  if (!origem) {
    const ref = req.headers.referer;
    if (!ref) return true; // clientes sem navegador (curl) não mandam Origin
    try { return hostDe(req, confiarProxy) === new URL(ref).host; } catch { return false; }
  }
  try { return hostDe(req, confiarProxy) === new URL(origem).host; } catch { return false; }
}

function hostDe(req, confiarProxy) {
  return String((confiarProxy && req.headers['x-forwarded-host']) || req.headers.host || '').split(',')[0].trim();
}

module.exports = { cabecalhos, ipDe, limitador, credenciaisOk, mesmaOrigem, CSP };
