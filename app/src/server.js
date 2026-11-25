'use strict';
/* Marko Comunicações — servidor da landing page e do admin (Node puro, sem dependências). */
const http = require('node:http');
const path = require('node:path');
const ambiente = require('./ambiente');
const armazem = require('./armazem');
const est = require('./estatico');
const seg = require('./seguranca');

class ErroHttp extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}

function lerCorpo(req, maximo) {
  return new Promise((ok, falha) => {
    const declarado = Number(req.headers['content-length']);
    if (declarado > maximo) { req.resume(); falha(new ErroHttp(413, 'Arquivo grande demais.')); return; }
    const partes = []; let total = 0; let estourou = false;
    req.on('data', (p) => {
      if (estourou) return;
      total += p.length;
      if (total > maximo) { estourou = true; partes.length = 0; falha(new ErroHttp(413, 'Arquivo grande demais.')); return; }
      partes.push(p);
    });
    req.on('end', () => { if (!estourou) ok(Buffer.concat(partes)); });
    req.on('error', falha);
  });
}

async function lerJson(req, maximo) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) throw new ErroHttp(415, 'Envie JSON.');
  const buf = await lerCorpo(req, maximo);
  try { return JSON.parse(buf.toString('utf8')); } catch { throw new ErroHttp(400, 'JSON inválido.'); }
}

function json(res, status, dados) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(dados));
}

/* ---------- pedido de orçamento ---------- */
function texto(v, max) {
  if (v == null) return '';
  if (typeof v !== 'string') throw new ErroHttp(400, 'Campo inválido.');
  // remove caracteres de controle, preservando quebras de linha
  return v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
}

function validarContato(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new ErroHttp(400, 'Pedido inválido.');
  const nome = texto(d.nome, 120);
  const tel = texto(d.tel, 30);
  const digitos = tel.replace(/\D/g, '');
  const erros = [];
  if (!nome) erros.push('nome');
  if (digitos.length < 10 || digitos.length > 15) erros.push('tel');
  if (erros.length) { const e = new ErroHttp(422, 'Preencha seu nome e um WhatsApp com DDD.'); e.campos = erros; throw e; }
  const servicos = Array.isArray(d.servicos) ? d.servicos.slice(0, 12).map((s) => texto(s, 60)).filter(Boolean) : [];
  return { nome, tel, empresa: texto(d.empresa, 120), servicos, msg: texto(d.msg, 2000) };
}

async function avisarWebhook(url, registro) {
  if (!/^https?:\/\//i.test(url)) return;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'orcamento', pedido: registro }),
      signal: AbortSignal.timeout(5000)
    });
    if (!r.ok) console.error('[contato] webhook respondeu', r.status);
  } catch (e) {
    console.error('[contato] webhook falhou:', e.message);
  }
}

/* ---------- servidor ---------- */
function criarServidor(amb = ambiente.ler()) {
  const dados = armazem.criar(amb.dados, { historico: amb.historico });
  const limiteContato = seg.limitador(5, 15 * 60 * 1000);
  const limiteLogin = seg.limitador(10, 15 * 60 * 1000);
  const pub = amb.publico;

  function exigirAdmin(req, res) {
    if (!amb.adminSenha) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Admin desativado: defina ADMIN_PASSWORD no .env e reinicie o container.');
      return false;
    }
    const ip = seg.ipDe(req, amb.confiarProxy);
    if (limiteLogin.estourou(ip)) throw new ErroHttp(429, 'Muitas tentativas. Aguarde 15 minutos.');
    if (seg.credenciaisOk(req, amb.adminUsuario, amb.adminSenha)) return true;
    if (req.headers.authorization) limiteLogin.contar(ip);
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Marko admin", charset="UTF-8"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Acesso restrito.');
    return false;
  }

  function exigirMesmaOrigem(req) {
    if (!seg.mesmaOrigem(req, amb.confiarProxy)) throw new ErroHttp(403, 'Origem não permitida.');
  }

  async function rotaAdmin(req, res, url) {
    const metodo = req.method;
    const p = url.pathname;
    if (metodo !== 'GET' && metodo !== 'HEAD') exigirMesmaOrigem(req);

    if (p === '/api/admin/config') {
      if (metodo === 'GET') return json(res, 200, { config: await dados.lerConfig() });
      if (metodo === 'PUT') {
        const cfg = await lerJson(req, 4 * 1024 * 1024);
        if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg) || typeof cfg.tema !== 'object') throw new ErroHttp(400, 'Configuração inválida.');
        await dados.publicarConfig(cfg);
        return json(res, 200, { ok: true, publicado: new Date().toISOString() });
      }
      if (metodo === 'DELETE') { await dados.restaurarPadrao(); return json(res, 200, { ok: true }); }
      throw new ErroHttp(405, 'Método não permitido.');
    }
    if (p === '/api/admin/upload') {
      if (metodo !== 'POST') throw new ErroHttp(405, 'Método não permitido.');
      const buf = await lerCorpo(req, Math.max(amb.uploadMaxImagem, amb.uploadMaxVideo));
      const tipo = armazem.tipoPorConteudo(buf);
      if (!tipo) throw new ErroHttp(415, 'Formato não aceito. Envie JPG, PNG, WebP, GIF, MP4 ou WebM.');
      const max = tipo.video ? amb.uploadMaxVideo : amb.uploadMaxImagem;
      if (buf.length > max) throw new ErroHttp(413, 'Arquivo grande demais (máximo ' + Math.round(max / 1048576) + ' MB).');
      return json(res, 201, { src: await dados.salvarUpload(buf, tipo) });
    }
    if (p === '/api/admin/midias') {
      if (metodo === 'GET') return json(res, 200, { midias: await dados.listarUploads() });
      throw new ErroHttp(405, 'Método não permitido.');
    }
    const mRem = /^\/api\/admin\/midias\/([^/]+)$/.exec(p);
    if (mRem) {
      if (metodo !== 'DELETE') throw new ErroHttp(405, 'Método não permitido.');
      if (!(await dados.removerUpload(mRem[1]))) throw new ErroHttp(404, 'Arquivo não encontrado.');
      return json(res, 200, { ok: true });
    }
    if (p === '/api/admin/contatos') {
      if (metodo === 'GET') return json(res, 200, { contatos: await dados.listarContatos() });
      throw new ErroHttp(405, 'Método não permitido.');
    }
    if (p === '/admin' || p === '/admin/') return est.servirArquivo(req, res, path.join(pub, 'admin.html'), { cache: 'no-store' });
    if (p === '/guia' || p === '/guia/') return est.servirArquivo(req, res, path.join(pub, 'guia.html'), { cache: 'no-store' });
    throw new ErroHttp(404, 'Não encontrado.');
  }

  async function tratar(req, res) {
    seg.cabecalhos(res);
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    const metodo = req.method;

    if (p === '/api/health') return json(res, 200, { ok: true });

    if (p === '/config-publicada.js') {
      const cfg = await dados.lerConfig();
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      // < evita que um "</script>" em algum texto feche a tag
      res.end('window.MARKO_PUBLICADO = ' + JSON.stringify(cfg).replace(/</g, '\\u003c') + ';\n');
      return;
    }

    if (p === '/api/contato') {
      if (metodo !== 'POST') throw new ErroHttp(405, 'Método não permitido.');
      exigirMesmaOrigem(req);
      const ip = seg.ipDe(req, amb.confiarProxy);
      if (limiteContato.estourou(ip)) throw new ErroHttp(429, 'Recebemos vários pedidos seus agora. Fale com a gente pelo WhatsApp.');
      const d = await lerJson(req, 16 * 1024);
      // campo-armadilha invisível: robôs preenchem, pessoas não
      if (d && typeof d.site === 'string' && d.site.trim()) return json(res, 200, { ok: true });
      const pedido = validarContato(d);
      limiteContato.contar(ip);
      const registro = await dados.registrarContato(pedido);
      if (amb.webhookContato) avisarWebhook(amb.webhookContato, registro);
      return json(res, 201, { ok: true });
    }

    if (p.startsWith('/api/admin/') || p === '/admin' || p === '/admin/' || p === '/guia' || p === '/guia/') {
      res.setHeader('Cache-Control', 'no-store');
      if (!exigirAdmin(req, res)) return;
      return rotaAdmin(req, res, url);
    }
    if (p.startsWith('/api/')) throw new ErroHttp(404, 'Não encontrado.');

    if (metodo !== 'GET' && metodo !== 'HEAD') throw new ErroHttp(405, 'Método não permitido.');

    if (p.startsWith('/uploads/')) {
      const arq = dados.caminhoUpload(p.slice('/uploads/'.length));
      if (!arq) return est.naoAchou(res);
      return est.servirArquivo(req, res, arq, { cache: 'public, max-age=31536000, immutable' });
    }
    // páginas do admin só pelas rotas protegidas
    if (p === '/admin.html' || p === '/guia.html') { res.statusCode = 301; res.setHeader('Location', p.replace('.html', '')); res.end(); return; }
    if (p === '/' || p === '/index.html') return est.servirArquivo(req, res, path.join(pub, 'index.html'));

    const arq = est.resolver(pub, p);
    if (!arq) return est.naoAchou(res);
    return est.servirArquivo(req, res, arq);
  }

  const servidor = http.createServer((req, res) => {
    tratar(req, res).catch((e) => {
      const status = e instanceof ErroHttp ? e.status : 500;
      if (status === 500) console.error('[erro]', req.method, req.url, e);
      if (res.headersSent) { res.destroy(); return; }
      const corpo = { erro: status === 500 ? 'Erro interno.' : e.message };
      if (e.campos) corpo.campos = e.campos;
      json(res, status, corpo);
    });
  });
  servidor.requestTimeout = 120000;
  servidor.headersTimeout = 20000;
  return servidor;
}

if (require.main === module) {
  const amb = ambiente.ler();
  const servidor = criarServidor(amb);
  servidor.listen(amb.porta, () => {
    console.log('Marko landing em http://0.0.0.0:' + amb.porta + ' (dados em ' + amb.dados + ')');
    if (!amb.adminSenha) console.warn('ADMIN_PASSWORD vazio: o admin fica desativado.');
  });
  const parar = () => { servidor.close(() => process.exit(0)); setTimeout(() => process.exit(0), 5000).unref(); };
  process.on('SIGTERM', parar);
  process.on('SIGINT', parar);
}

module.exports = { criarServidor, validarContato };
