'use strict';
/* Tudo que o site guarda fica em DATA_DIR (volume do Docker):
   config.json        configuração publicada pelo admin
   historico/         versões anteriores da configuração
   uploads/           imagens e vídeos enviados pelo admin
   contatos.jsonl     pedidos de orçamento (um JSON por linha) */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const NOME_UPLOAD = /^[a-f0-9]{32}\.(jpg|png|webp|gif|mp4|webm)$/;

/* Reconhece o tipo pelo conteúdo (não confia na extensão nem no Content-Type) */
function tipoPorConteudo(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', video: false };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', video: false };
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return { ext: 'webp', video: false };
  if (buf.toString('latin1', 0, 4) === 'GIF8') return { ext: 'gif', video: false };
  if (buf.toString('latin1', 4, 8) === 'ftyp') return { ext: 'mp4', video: true };
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return { ext: 'webm', video: true };
  return null;
}

async function gravarAtomico(arquivo, conteudo) {
  const tmp = arquivo + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
  await fsp.writeFile(tmp, conteudo);
  await fsp.rename(tmp, arquivo);
}

function criar(dir, opcoes = {}) {
  const arqConfig = path.join(dir, 'config.json');
  const dirHist = path.join(dir, 'historico');
  const dirUp = path.join(dir, 'uploads');
  const arqContatos = path.join(dir, 'contatos.jsonl');
  const manterHist = opcoes.historico || 30;
  for (const d of [dir, dirHist, dirUp]) fs.mkdirSync(d, { recursive: true });

  let cache; // undefined = ainda não lido; null = sem configuração publicada

  async function lerConfig() {
    if (cache !== undefined) return cache;
    try {
      cache = JSON.parse(await fsp.readFile(arqConfig, 'utf8'));
    } catch (e) {
      if (e.code !== 'ENOENT') console.error('[armazem] config.json ilegível, usando o padrão:', e.message);
      cache = null;
    }
    return cache;
  }

  async function guardarHistorico() {
    try {
      const nome = 'config-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      await fsp.copyFile(arqConfig, path.join(dirHist, nome));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      return;
    }
    const antigos = (await fsp.readdir(dirHist)).filter((n) => n.endsWith('.json')).sort();
    await Promise.all(antigos.slice(0, Math.max(0, antigos.length - manterHist)).map((n) => fsp.unlink(path.join(dirHist, n))));
  }

  async function publicarConfig(cfg) {
    await guardarHistorico();
    await gravarAtomico(arqConfig, JSON.stringify(cfg));
    cache = cfg;
  }

  async function restaurarPadrao() {
    await guardarHistorico();
    await fsp.rm(arqConfig, { force: true });
    cache = null;
  }

  async function salvarUpload(buf, info) {
    const nome = crypto.randomBytes(16).toString('hex') + '.' + info.ext;
    await gravarAtomico(path.join(dirUp, nome), buf);
    return 'uploads/' + nome;
  }

  async function listarUploads() {
    const nomes = (await fsp.readdir(dirUp)).filter((n) => NOME_UPLOAD.test(n));
    const itens = await Promise.all(nomes.map(async (n) => ({ n, t: (await fsp.stat(path.join(dirUp, n))).mtimeMs })));
    return itens.sort((a, b) => b.t - a.t).map((i) => 'uploads/' + i.n);
  }

  function caminhoUpload(nome) {
    return NOME_UPLOAD.test(nome) ? path.join(dirUp, nome) : null;
  }

  async function removerUpload(nome) {
    const c = caminhoUpload(nome);
    if (!c) return false;
    try { await fsp.unlink(c); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; }
  }

  async function registrarContato(pedido) {
    const registro = Object.assign({ id: crypto.randomUUID(), recebido: new Date().toISOString() }, pedido);
    await fsp.appendFile(arqContatos, JSON.stringify(registro) + '\n', { mode: 0o600 });
    return registro;
  }

  async function listarContatos(limite = 200) {
    let bruto;
    try { bruto = await fsp.readFile(arqContatos, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    const linhas = bruto.split('\n').filter(Boolean);
    const out = [];
    for (let i = linhas.length - 1; i >= 0 && out.length < limite; i--) {
      try { out.push(JSON.parse(linhas[i])); } catch { /* linha corrompida: ignora */ }
    }
    return out;
  }

  return { lerConfig, publicarConfig, restaurarPadrao, salvarUpload, listarUploads, caminhoUpload, removerUpload, registrarContato, listarContatos };
}

module.exports = { criar, tipoPorConteudo, NOME_UPLOAD };
