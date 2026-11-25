'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { criarServidor } = require('../src/server');
const ambiente = require('../src/ambiente');

const SENHA = 'senha-de-teste';
let servidor, base, dir;
const auth = 'Basic ' + Buffer.from('marko:' + SENHA).toString('base64');

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'marko-teste-'));
  const amb = ambiente.ler({ DATA_DIR: dir, ADMIN_PASSWORD: SENHA, UPLOAD_MAX_IMAGE_MB: '1', UPLOAD_MAX_VIDEO_MB: '2' });
  servidor = criarServidor(amb);
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  base = 'http://127.0.0.1:' + servidor.address().port;
});
after(() => { servidor.close(); fs.rmSync(dir, { recursive: true, force: true }); });

const ir = (p, op = {}) => fetch(base + p, op);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(60, 1)]);

test('saúde e página inicial com cabeçalhos de segurança', async () => {
  assert.equal((await ir('/api/health')).status, 200);
  const r = await ir('/');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
  assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.match(await r.text(), /config-publicada\.js/);
});

test('sem configuração publicada, o site usa o padrão', async () => {
  const r = await ir('/config-publicada.js');
  assert.equal(await r.text(), 'window.MARKO_PUBLICADO = null;\n');
});

test('não sai da pasta pública nem serve arquivos ocultos', async () => {
  for (const p of ['/../package.json', '/%2e%2e/package.json', '/assets/%2e%2e/%2e%2e/src/server.js', '/.env', '/assets/%00.js']) {
    assert.equal((await ir(p)).status, 404, p);
  }
});

test('vídeo responde a Range (206)', async () => {
  const r = await ir('/assets/video/confeitaria.mp4', { headers: { Range: 'bytes=0-99' } });
  assert.equal(r.status, 206);
  assert.equal((await r.arrayBuffer()).byteLength, 100);
  assert.match(r.headers.get('content-range'), /^bytes 0-99\/\d+$/);
});

test('admin exige senha e as páginas internas não ficam soltas', async () => {
  assert.equal((await ir('/admin')).status, 401);
  assert.equal((await ir('/guia')).status, 401);
  assert.equal((await ir('/api/admin/config')).status, 401);
  assert.equal((await ir('/admin', { headers: { Authorization: 'Basic ' + Buffer.from('marko:errada').toString('base64') } })).status, 401);
  assert.equal((await ir('/admin.html', { redirect: 'manual' })).status, 301);
  const r = await ir('/admin', { headers: { Authorization: auth } });
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Marko Comunicações — Admin/);
});

test('publicar, ler, restaurar e guardar histórico', async () => {
  const cfg = { tema: { padrao: 'escuro' }, hero: { linha1: 'Olá </script><b>' } };
  const put = await ir('/api/admin/config', { method: 'PUT', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) });
  assert.equal(put.status, 200);
  const js = await (await ir('/config-publicada.js')).text();
  assert.ok(!js.includes('</script>'), 'escapa </script>');
  assert.match(js, /"padrao":"escuro"/);

  await ir('/api/admin/config', { method: 'PUT', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ tema: { padrao: 'claro' } }) });
  assert.ok(fs.readdirSync(path.join(dir, 'historico')).length >= 1);

  assert.equal((await ir('/api/admin/config', { method: 'DELETE', headers: { Authorization: auth } })).status, 200);
  assert.equal(await (await ir('/config-publicada.js')).text(), 'window.MARKO_PUBLICADO = null;\n');
});

test('configuração inválida e origem estranha são recusadas', async () => {
  const h = { Authorization: auth, 'Content-Type': 'application/json' };
  assert.equal((await ir('/api/admin/config', { method: 'PUT', headers: h, body: '[1]' })).status, 400);
  assert.equal((await ir('/api/admin/config', { method: 'PUT', headers: h, body: '{x' })).status, 400);
  assert.equal((await ir('/api/admin/config', { method: 'PUT', headers: { Authorization: auth, 'Content-Type': 'text/plain' }, body: '{}' })).status, 415);
  assert.equal((await ir('/api/admin/config', { method: 'PUT', headers: Object.assign({ Origin: 'https://malicioso.example' }, h), body: '{"tema":{}}' })).status, 403);
});

test('upload confere o conteúdo, guarda e serve o arquivo', async () => {
  const h = { Authorization: auth, 'Content-Type': 'image/jpeg' };
  const r = await ir('/api/admin/upload', { method: 'POST', headers: h, body: JPG });
  assert.equal(r.status, 201);
  const { src } = await r.json();
  assert.match(src, /^uploads\/[a-f0-9]{32}\.jpg$/);
  const arq = await ir('/' + src);
  assert.equal(arq.status, 200);
  assert.equal(arq.headers.get('content-type'), 'image/jpeg');

  const lista = await (await ir('/api/admin/midias', { headers: { Authorization: auth } })).json();
  assert.deepEqual(lista.midias, [src]);

  // HTML disfarçado de imagem
  assert.equal((await ir('/api/admin/upload', { method: 'POST', headers: h, body: '<html><script>alert(1)</script></html>' })).status, 415);
  // grande demais para imagem (limite de teste: 1 MB)
  const grande = Buffer.concat([JPG, Buffer.alloc(1024 * 1024 + 10)]);
  assert.equal((await ir('/api/admin/upload', { method: 'POST', headers: h, body: grande })).status, 413);
  // nomes fora do padrão não são servidos
  assert.equal((await ir('/uploads/..%2Fconfig.json')).status, 404);

  const nome = src.split('/')[1];
  assert.equal((await ir('/api/admin/midias/' + nome, { method: 'DELETE', headers: { Authorization: auth } })).status, 200);
  assert.equal((await ir('/' + src)).status, 404);
});

test('pedido de orçamento: valida, grava e limita abuso', async () => {
  const h = { 'Content-Type': 'application/json', 'X-Forwarded-For': '1.2.3.4' };
  const ruim = await ir('/api/contato', { method: 'POST', headers: h, body: JSON.stringify({ nome: '', tel: '12' }) });
  assert.equal(ruim.status, 422);
  assert.deepEqual((await ruim.json()).campos, ['nome', 'tel']);

  const ok = await ir('/api/contato', { method: 'POST', headers: h, body: JSON.stringify({ nome: 'Ana', tel: '(81) 99999-0000', empresa: 'Café', servicos: ['Fotografias'], msg: 'Oi\nTudo bem?' }) });
  assert.equal(ok.status, 201);

  // armadilha: finge sucesso e não grava
  const robo = await ir('/api/contato', { method: 'POST', headers: h, body: JSON.stringify({ nome: 'Bot', tel: '81999990000', site: 'http://spam' }) });
  assert.equal(robo.status, 200);

  const lista = await (await ir('/api/admin/contatos', { headers: { Authorization: auth } })).json();
  assert.equal(lista.contatos.length, 1);
  assert.equal(lista.contatos[0].nome, 'Ana');
  assert.equal(lista.contatos[0].msg, 'Oi\nTudo bem?');

  let ultimo;
  for (let i = 0; i < 6; i++) ultimo = await ir('/api/contato', { method: 'POST', headers: h, body: JSON.stringify({ nome: 'Ana', tel: '81999990000' }) });
  assert.equal(ultimo.status, 429);
});
