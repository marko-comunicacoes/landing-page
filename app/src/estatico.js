'use strict';
/* Arquivos estáticos com ETag, cache e Range (vídeos no Safari/iOS precisam de Range). */
const fs = require('node:fs');
const path = require('node:path');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

/* Resolve um caminho de URL dentro de raiz; null se sair dela, tiver arquivo oculto ou for inválido */
function resolver(raiz, urlPath) {
  let dec;
  try { dec = decodeURIComponent(urlPath); } catch { return null; }
  if (dec.includes('\0')) return null;
  const partes = dec.split(/[\\/]+/).filter(Boolean);
  if (partes.some((p) => p === '..' || p.startsWith('.'))) return null;
  const alvo = path.resolve(raiz, ...partes);
  if (alvo !== raiz && !alvo.startsWith(raiz + path.sep)) return null;
  return alvo;
}

function servirArquivo(req, res, arquivo, opcoes = {}) {
  fs.stat(arquivo, (err, st) => {
    if (err || !st.isFile()) { opcoes.naoAchou ? opcoes.naoAchou() : naoAchou(res); return; }
    const ext = path.extname(arquivo).toLowerCase();
    const tipo = TIPOS[ext] || 'application/octet-stream';
    const etag = 'W/"' + st.size.toString(16) + '-' + Math.floor(st.mtimeMs).toString(16) + '"';
    res.setHeader('Content-Type', tipo);
    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', st.mtime.toUTCString());
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', opcoes.cache || (ext === '.html' ? 'no-cache' : 'public, max-age=3600'));

    if (req.headers['if-none-match'] === etag) { res.statusCode = 304; res.end(); return; }

    let inicio = 0, fim = st.size - 1;
    const range = req.headers.range;
    if (range && st.size > 0) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!m || (m[1] === '' && m[2] === '')) { return faixaInvalida(res, st.size); }
      if (m[1] === '') { inicio = Math.max(0, st.size - Number(m[2])); }
      else { inicio = Number(m[1]); if (m[2] !== '') fim = Math.min(Number(m[2]), st.size - 1); }
      if (inicio > fim || inicio >= st.size) { return faixaInvalida(res, st.size); }
      res.statusCode = 206;
      res.setHeader('Content-Range', 'bytes ' + inicio + '-' + fim + '/' + st.size);
    } else {
      res.statusCode = 200;
    }
    res.setHeader('Content-Length', st.size === 0 ? 0 : fim - inicio + 1);
    if (req.method === 'HEAD' || st.size === 0) { res.end(); return; }
    const fluxo = fs.createReadStream(arquivo, { start: inicio, end: fim });
    fluxo.on('error', () => res.destroy());
    fluxo.pipe(res);
  });
}

function faixaInvalida(res, tamanho) {
  res.statusCode = 416;
  res.setHeader('Content-Range', 'bytes */' + tamanho);
  res.end();
}

function naoAchou(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('Não encontrado');
}

module.exports = { resolver, servirArquivo, naoAchou, TIPOS };
