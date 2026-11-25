/* Marko Comunicações — admin: edita a configuração e mostra a prévia ao vivo */
(function () {
  'use strict';
  var M = window.MARKO, esc = M.esc, ic = M.icone;
  M.injetarIcones(document);

  var publicado = M.carregar();
  var rascunho = M.clonar(publicado);
  var secao = 'aparencia';
  var abertos = {};                 // serviços expandidos (índice → true)
  var editor = document.getElementById('editor');
  var iframe = document.getElementById('previa');
  var ANCORA = { aparencia: 'inicio', hero: 'inicio', trabalho: 'trabalho', servicos: 'servicos', clientes: 'clientes', sobre: 'sobre', depoimentos: 'depoimentos', contato: 'contato', pedidos: 'contato' };

  /* ---------- caminho "a.b.0.c" ---------- */
  function pegar(caminho) { return caminho.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, rascunho); }
  function definir(caminho, valor) {
    var ks = caminho.split('.'), o = rascunho;
    for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = valor;
  }

  /* ---------- API do servidor ---------- */
  function api(metodo, caminho, corpo, tipo) {
    var op = { method: metodo, headers: {}, credentials: 'same-origin' };
    if (corpo !== undefined) {
      op.headers['Content-Type'] = tipo || 'application/json';
      op.body = tipo ? corpo : JSON.stringify(corpo);
    }
    return fetch(caminho, op).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.erro || (r.status === 401 ? 'Sessão expirada: recarregue a página e entre de novo.' : 'Falha no servidor (' + r.status + ').'));
        return d;
      });
    }, function () { throw new Error('Sem conexão com o servidor.'); });
  }

  /* ---------- peças de formulário ---------- */
  var seq = 0;
  function campo(rotulo, k, op) {
    op = op || {};
    var id = 'c' + (++seq), v = pegar(k);
    var ctrl = op.area
      ? '<textarea id="' + id + '" data-k="' + k + '" rows="' + (op.linhas || 3) + '">' + esc(v) + '</textarea>'
      : '<input id="' + id + '" type="' + (op.tipo || 'text') + '" data-k="' + k + '" value="' + esc(v) + '"' + (op.ph ? ' placeholder="' + esc(op.ph) + '"' : '') + '>';
    return '<label class="adm-campo" for="' + id + '"><span>' + esc(rotulo) + '</span>' + ctrl + (op.dica ? '<small class="adm-dica">' + op.dica + '</small>' : '') + '</label>';
  }
  var DICA_TITULO = 'Use <code>*itálico*</code>, <code>**negrito**</code> e <code>~serifa~</code>, como no site: <code>N*o*sso **trabalho**</code>.';

  function miniatura(src, k, op) {
    op = op || {};
    var corpo = !src ? '<span>Sem mídia</span>' : M.ehVideo(src) ? '<video src="' + esc(src) + '" muted preload="metadata"></video>' : '<img src="' + esc(src) + '" alt="">';
    return '<button type="button" class="adm-thumb' + (op.cls ? ' ' + op.cls : '') + (src ? '' : ' adm-thumb--vazio') + '" data-acao="trocar" data-k="' + k + '" data-aceita="' + (op.aceita || 'imagem') + '" aria-label="Trocar ' + esc(op.nome || 'imagem') + '">' + corpo + '<span class="adm-thumb__troca">Trocar</span></button>';
  }

  function acoes(lista, i, total) {
    return '<div class="adm-item__acoes">' +
      '<button type="button" class="adm-icone" data-acao="subir" data-lista="' + lista + '" data-i="' + i + '" aria-label="Mover para cima"' + (i === 0 ? ' disabled' : '') + '>' + ic('cima') + '</button>' +
      '<button type="button" class="adm-icone" data-acao="descer" data-lista="' + lista + '" data-i="' + i + '" aria-label="Mover para baixo"' + (i === total - 1 ? ' disabled' : '') + '>' + ic('baixo') + '</button>' +
      '<button type="button" class="adm-icone adm-icone--perigo" data-acao="remover" data-lista="' + lista + '" data-i="' + i + '" aria-label="Remover">' + ic('lixo') + '</button></div>';
  }

  function midias(k, aceita) {
    var arr = pegar(k) || [];
    return '<div class="adm-midias">' + arr.map(function (src, i) {
      return '<div class="adm-midia">' + miniatura(src, k + '.' + i, { aceita: aceita, cls: aceita === 'logo' ? 'adm-thumb--logo' : '' }) +
        '<button type="button" class="adm-icone adm-icone--perigo" data-acao="remover" data-lista="' + k + '" data-i="' + i + '" aria-label="Remover mídia">' + ic('fechar') + '</button></div>';
    }).join('') + '<button type="button" class="adm-add" data-acao="add-midia" data-lista="' + k + '" data-aceita="' + aceita + '" aria-label="Adicionar mídia">' + ic('mais') + '</button></div>';
  }

  function cabecalho(titulo, lead) { return '<h1>' + titulo + '</h1>' + (lead ? '<p class="adm-lead">' + lead + '</p>' : ''); }

  /* ---------- seções ---------- */
  var SECOES = {};

  SECOES.aparencia = function () {
    var t = rascunho.tema;
    var fontes = ['sans', 'display', 'serif'].map(function (papel) {
      var nomes = { sans: 'Texto e títulos', display: 'Nome da marca (hero)', serif: 'Palavra em serifa' };
      var amostra = { sans: 'N<em>o</em>sso <strong>trabalho</strong>', display: 'a Marko', serif: 'marca' };
      var f = M.acharFonte(papel, t.fontes[papel]);
      M.carregarFonteGoogle(document, f);
      return '<div class="adm-fonte"><label class="adm-campo"><span>' + nomes[papel] + '</span><select data-k="tema.fontes.' + papel + '">' +
        M.FONTES[papel].map(function (o) { return '<option' + (o.nome === f.nome ? ' selected' : '') + '>' + esc(o.nome) + '</option>'; }).join('') + '</select></label>' +
        '<p class="adm-fonte__amostra" style="font-family:' + esc(f.pilha) + ';' + (papel === 'display' ? 'font-weight:700' : '') + '">' + amostra[papel] + '</p>' +
        (f.nota ? '<small class="adm-dica">' + esc(f.nota) + '</small>' : '') + '</div>';
    }).join('');
    return cabecalho('<strong>Aparência</strong>', 'Cores, fontes e forma dos botões. A prévia muda na hora; o site só muda quando você publicar.') +
      '<section class="adm-bloco"><h2>Tema padrão</h2><div class="adm-seg" role="group" aria-label="Tema padrão">' +
      '<button type="button" data-acao="tema" data-v="claro" aria-pressed="' + (t.padrao !== 'escuro') + '">' + ic('sol') + 'Claro</button>' +
      '<button type="button" data-acao="tema" data-v="escuro" aria-pressed="' + (t.padrao === 'escuro') + '">' + ic('lua') + 'Escuro (verde-petróleo)</button></div>' +
      '<p class="adm-dica">É o tema de quem abre o site pela primeira vez. O visitante pode trocar pelo botão sol/lua no topo, e o site lembra a escolha dele.</p></section>' +
      '<section class="adm-bloco"><h2>Paleta <button type="button" class="adm-btn adm-btn--fantasma adm-btn--mini" data-acao="paleta-original">Voltar à original</button></h2>' +
      '<p class="adm-dica">Cada cor alimenta várias partes do site. Mude a cor aqui e tudo que usa ela acompanha.</p><div class="adm-cores">' +
      M.PALETA.map(function (p) {
        var v = t.cores[p.id];
        return '<div class="adm-cor"><input type="color" value="' + esc(v) + '" data-cor="' + p.id + '" aria-label="' + esc(p.nome) + '">' +
          '<div><strong>' + esc(p.nome) + '</strong><small>' + esc(p.papel) + '</small></div>' +
          '<input type="text" value="' + esc(v) + '" data-cor-hex="' + p.id + '" maxlength="7" spellcheck="false" aria-label="Código de ' + esc(p.nome) + '"></div>';
      }).join('') + '</div></section>' +
      '<section class="adm-bloco"><h2>Contraste</h2><p class="adm-dica">Texto comum precisa de 4,5:1; texto grande, ícones e foco, 3:1.</p><div id="tab-contraste">' + tabelaContraste() + '</div></section>' +
      '<section class="adm-bloco"><h2>Fontes</h2>' + fontes + '</section>' +
      '<section class="adm-bloco"><h2>Botões</h2><label class="adm-campo"><span>Cantos</span><select data-k="tema.raioBotao" data-num>' +
      [[999, 'Pílula (original)'], [12, 'Arredondado'], [4, 'Quase reto'], [0, 'Reto']].map(function (o) {
        return '<option value="' + o[0] + '"' + (+t.raioBotao === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></label></section>';
  };

  function tabelaContraste() {
    var linhas = ['escuro', 'claro'].map(function (tema) {
      var c = M.resolver(rascunho, tema);
      return '<tr><th colspan="4">' + (tema === 'escuro' ? 'Tema Marko' : 'Tema Claro') + '</th></tr>' + M.PARES.map(function (p) {
        var r = M.contraste(c[p[0]], c[p[1]]), ok = r >= p[3];
        return '<tr><td><span class="adm-amostra" style="color:' + c[p[0]] + ';background:' + c[p[1]] + '">Aa</span></td><td>' + esc(p[2]) + '</td>' +
          '<td class="adm-razao">' + r.toFixed(1).replace('.', ',') + ':1</td><td><span class="adm-selo adm-selo--' + (ok ? 'ok' : 'falha') + '">' + ic(ok ? 'check' : 'alerta') + (ok ? 'OK' : 'Baixo') + '</span></td></tr>';
      }).join('');
    }).join('');
    return '<table class="adm-contraste"><thead><tr><th scope="col">Amostra</th><th scope="col">Uso</th><th scope="col">Razão</th><th scope="col"><span class="sr">Situação</span></th></tr></thead><tbody>' + linhas + '</tbody></table>';
  }

  SECOES.hero = function () {
    var m = rascunho.hero.midia || {};
    return cabecalho('<strong>Topo</strong> da página', 'A primeira tela: o “Bem-vindo a Marko” e a mídia ao lado.') +
      '<section class="adm-bloco"><h2>Textos</h2><div class="adm-linha">' + campo('Linha 1 (itálico)', 'hero.linha1') + campo('Linha 2 (nome da marca)', 'hero.linha2') + '</div>' +
      campo('Rótulo entre cantoneiras', 'hero.rotulo', { area: true, linhas: 2, dica: 'Quebre a linha onde quiser que ela quebre no site.' }) +
      campo('Frase de apoio', 'hero.texto', { area: true }) + campo('Botão principal', 'hero.cta') + '</section>' +
      '<section class="adm-bloco"><h2>Mídia ao lado' + (m.src ? ' <button type="button" class="adm-btn adm-btn--fantasma adm-btn--mini" data-acao="sem-midia">Remover</button>' : '') + '</h2>' +
      miniatura(m.src, 'hero.midia.src', { aceita: 'midia', cls: 'adm-thumb--grande', nome: 'mídia do topo' }) +
      (m.src ? campo('Descrição (acessibilidade)', 'hero.midia.alt') : '<p class="adm-dica">Sem mídia, o título ocupa a largura toda.</p>') +
      '<p class="adm-dica">Vídeos verticais (reels) funcionam melhor. Tocam sem som; o visitante liga o som se quiser.</p></section>';
  };

  SECOES.trabalho = function () {
    var itens = rascunho.trabalho.itens;
    return cabecalho('<strong>Trabalhos</strong>', 'O mosaico “Nosso trabalho”. Arraste a ordem com as setas; “alto” e “largo” ocupam duas células.') +
      '<section class="adm-bloco"><h2>Textos</h2>' + campo('Título', 'trabalho.titulo', { dica: DICA_TITULO }) + campo('Texto entre cantoneiras', 'trabalho.texto', { area: true }) + '</section>' +
      '<section class="adm-bloco"><h2>Fotos e vídeos (' + itens.length + ')</h2>' + avisoGrade(itens) + '<div class="adm-lista">' + itens.map(function (it, i) {
        var k = 'trabalho.itens.' + i;
        return '<div class="adm-item">' + miniatura(it.src, k + '.src', { aceita: 'midia' }) + '<div class="adm-item__campos">' +
          campo('Legenda', k + '.legenda') + campo('Descrição (acessibilidade)', k + '.alt') +
          '<label class="adm-campo"><span>Tamanho</span><select data-k="' + k + '.tamanho">' +
          [['normal', 'Normal (1×1)'], ['alto', 'Alto (1×2)'], ['largo', 'Largo (2×1)'], ['grande', 'Grande (2×2)']].map(function (o) {
            return '<option value="' + o[0] + '"' + (it.tamanho === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
          }).join('') + '</select></label></div>' + acoes('trabalho.itens', i, itens.length) + '</div>';
      }).join('') + '</div><button type="button" class="adm-btn adm-btn--fantasma" data-acao="add-trabalho">' + ic('mais') + 'Adicionar foto ou vídeo</button></section>';
  };

  /* O mosaico tem 6 colunas no desktop: avisa quando a última linha fica incompleta */
  function avisoGrade(itens) {
    var peso = { normal: 1, alto: 2, largo: 2, grande: 4 };
    var celulas = itens.reduce(function (s, it) { return s + (peso[it.tamanho] || 1); }, 0);
    var sobra = celulas % 6;
    if (!sobra) return '<p class="adm-dica">' + ic('check') + ' ' + celulas + ' células: ' + (celulas / 6) + ' linhas completas no desktop.</p>';
    return '<p class="adm-dica">' + ic('alerta') + ' ' + celulas + ' células: faltam ' + (6 - sobra) + ' para fechar a última linha. Aumente um item ou adicione outro.</p>';
  }

  SECOES.servicos = function () {
    var lista = rascunho.servicos.lista;
    return cabecalho('<strong>Serviços</strong>', 'Os botões de “O que fazemos” e o painel que abre em cada um.') +
      '<section class="adm-bloco"><h2>Textos</h2>' + campo('Título', 'servicos.titulo', { dica: DICA_TITULO }) +
      '<div class="adm-linha">' + campo('Nota', 'servicos.nota') + campo('Rótulo entre cantoneiras', 'servicos.rotulo', { area: true, linhas: 2 }) + '</div></section>' +
      '<section class="adm-bloco"><h2>Serviços (' + lista.length + ')</h2><p class="adm-dica">Use 3, 6 ou 9 serviços para a grade não sobrar buraco.</p><div class="adm-lista">' +
      lista.map(function (s, i) {
        var k = 'servicos.lista.' + i;
        return '<details class="adm-servico" data-servico-i="' + i + '"' + (abertos[i] ? ' open' : '') + '><summary>' + esc(s.nome) + (s.exemplo ? ' <span class="mk-exemplo">exemplo</span>' : '') + acoes('servicos.lista', i, lista.length) + '</summary>' +
          '<div class="adm-servico__corpo">' + campo('Nome', k + '.nome') + campo('Resumo', k + '.resumo', { area: true }) +
          '<label class="adm-check"><input type="checkbox" data-k="' + k + '.exemplo" data-bool' + (s.exemplo ? ' checked' : '') + '> Texto de exemplo (ainda não aprovado pela Marko)</label>' +
          '<div class="adm-campo"><span>Etapas</span><div class="adm-lista">' + s.etapas.map(function (e, j) {
            return '<div class="adm-etapa"><span class="adm-etapa__n">' + String(j + 1).padStart(2, '0') + '</span><div class="adm-item__campos">' +
              campo('Nome da etapa', k + '.etapas.' + j + '.t') + campo('Descrição', k + '.etapas.' + j + '.p', { area: true, linhas: 2 }) + '</div>' +
              '<button type="button" class="adm-icone adm-icone--perigo" data-acao="remover" data-lista="' + k + '.etapas" data-i="' + j + '" aria-label="Remover etapa">' + ic('lixo') + '</button></div>';
          }).join('') + '</div><button type="button" class="adm-btn adm-btn--fantasma adm-btn--mini" data-acao="add-etapa" data-lista="' + k + '.etapas">' + ic('mais') + 'Etapa</button></div>' +
          '<div class="adm-campo"><span>Fotos e vídeos</span>' + midias(k + '.midias', 'midia') + '</div></div></details>';
      }).join('') + '</div><button type="button" class="adm-btn adm-btn--fantasma" data-acao="add-servico">' + ic('mais') + 'Adicionar serviço</button></section>';
  };

  SECOES.clientes = function () {
    var lista = rascunho.clientes.lista;
    return cabecalho('<strong>Clientes</strong>', 'O mural de logos. Use múltiplos de 4 para fechar as linhas.') +
      '<section class="adm-bloco"><h2>Textos</h2>' + campo('Título', 'clientes.titulo', { dica: DICA_TITULO }) + '</section>' +
      '<section class="adm-bloco"><h2>Logos (' + lista.length + ')</h2><div class="adm-lista">' + lista.map(function (c, i) {
        var k = 'clientes.lista.' + i;
        return '<div class="adm-item adm-item--sem-thumb"><div class="adm-item__campos">' + campo('Nome do cliente', k + '.nome') +
          '<div class="adm-campo"><span>Logo (uma ou duas partes)</span>' + midias(k + '.logos', 'logo') + '</div></div>' + acoes('clientes.lista', i, lista.length) + '</div>';
      }).join('') + '</div><button type="button" class="adm-btn adm-btn--fantasma" data-acao="add-cliente">' + ic('mais') + 'Adicionar cliente</button></section>';
  };

  SECOES.sobre = function () {
    var ps = rascunho.sobre.parceiros;
    return cabecalho('<strong>Sobre</strong> a agência', 'Apresentação, fundador e onde ele já trabalhou.') +
      '<section class="adm-bloco"><h2>Agência</h2>' + campo('Título', 'sobre.titulo', { dica: DICA_TITULO }) + campo('Texto', 'sobre.texto', { area: true, linhas: 4 }) + campo('Frase de destaque', 'sobre.frase') + '</section>' +
      '<section class="adm-bloco"><h2>Fundador</h2><div class="adm-item">' + miniatura(rascunho.sobre.fundador.foto, 'sobre.fundador.foto', { nome: 'foto do fundador' }) +
      '<div class="adm-item__campos"><div class="adm-linha">' + campo('Nome', 'sobre.fundador.nome') + campo('Rótulo', 'sobre.fundador.cargo') + '</div>' +
      campo('Texto', 'sobre.fundador.texto', { area: true, linhas: 6 }) + '</div><span></span></div></section>' +
      '<section class="adm-bloco"><h2>Prestou serviços em</h2><div class="adm-lista">' + ps.map(function (p, i) {
        var k = 'sobre.parceiros.' + i;
        return '<div class="adm-item">' + miniatura(p.logo, k + '.logo', { aceita: 'logo', cls: 'adm-thumb--logo' }) + '<div class="adm-item__campos">' + campo('Nome', k + '.nome') + '</div>' + acoes('sobre.parceiros', i, ps.length) + '</div>';
      }).join('') + '</div><button type="button" class="adm-btn adm-btn--fantasma" data-acao="add-parceiro">' + ic('mais') + 'Adicionar</button></section>';
  };

  SECOES.depoimentos = function () {
    var lista = rascunho.depoimentos.lista;
    return cabecalho('<strong>Depoimentos</strong>', 'Copie a fala do cliente como ele escreveu, gírias incluídas.') +
      '<section class="adm-bloco"><h2>Textos</h2>' + campo('Título', 'depoimentos.titulo', { dica: DICA_TITULO }) + '</section>' +
      '<section class="adm-bloco"><h2>Depoimentos (' + lista.length + ')</h2><div class="adm-lista">' + lista.map(function (d, i) {
        var k = 'depoimentos.lista.' + i;
        return '<div class="adm-item">' + miniatura(d.foto, k + '.foto', { nome: 'foto do cliente' }) + '<div class="adm-item__campos">' + campo('Nome', k + '.nome') + campo('Depoimento', k + '.texto', { area: true, linhas: 3 }) + '</div>' + acoes('depoimentos.lista', i, lista.length) + '</div>';
      }).join('') + '</div><button type="button" class="adm-btn adm-btn--fantasma" data-acao="add-depoimento">' + ic('mais') + 'Adicionar depoimento</button></section>';
  };

  SECOES.contato = function () {
    return cabecalho('<strong>Contato</strong>', 'Rodapé, formulário e botões de WhatsApp do site inteiro.') +
      '<section class="adm-bloco"><h2>Chamada</h2>' + campo('Título', 'contato.titulo', { dica: DICA_TITULO }) + campo('Botão secundário', 'contato.chamada') + '</section>' +
      '<section class="adm-bloco"><h2>Dados</h2>' + campo('E-mail', 'contato.email', { tipo: 'email' }) +
      '<div class="adm-linha">' + campo('Telefone (como aparece)', 'contato.telefone', { tipo: 'tel' }) + campo('WhatsApp (só números, com 55)', 'contato.whatsapp', { ph: '5581999999999' }) + '</div>' +
      '<div class="adm-linha">' + campo('Instagram (sem @)', 'contato.instagram') + campo('Linktree', 'contato.linktree') + '</div>' +
      campo('Endereço', 'contato.endereco1') + campo('Bairro e cidade', 'contato.endereco2') + '</section>';
  };

  var pedidos = null, pedidosErro = '';
  function data(iso) {
    try { return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return iso; }
  }
  SECOES.pedidos = function () {
    var corpo;
    if (pedidosErro) corpo = '<p class="adm-aviso">' + esc(pedidosErro) + '</p>';
    else if (!pedidos) corpo = '<p class="adm-lead">Carregando…</p>';
    else if (!pedidos.length) corpo = '<p class="adm-vazio">Nenhum pedido ainda. Quando alguém preencher o formulário do site, ele aparece aqui.</p>';
    else corpo = '<ul class="adm-pedidos">' + pedidos.map(function (p) {
      var num = String(p.tel || '').replace(/\D/g, ''); if (num.length <= 11) num = '55' + num;
      return '<li class="adm-pedido"><div class="adm-pedido__topo"><strong>' + esc(p.nome) + '</strong>' + (p.empresa ? ' <span>· ' + esc(p.empresa) + '</span>' : '') +
        '<time datetime="' + esc(p.recebido) + '">' + esc(data(p.recebido)) + '</time></div>' +
        (p.servicos && p.servicos.length ? '<p class="adm-pedido__servicos">' + p.servicos.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</p>' : '') +
        (p.msg ? '<p class="adm-pedido__msg">' + esc(p.msg) + '</p>' : '') +
        '<a class="adm-btn adm-btn--fantasma adm-pedido__whats" href="https://wa.me/' + esc(num) + '" target="_blank" rel="noopener">' + ic('whatsapp') + esc(p.tel) + '</a></li>';
    }).join('') + '</ul>';
    return cabecalho('<strong>Pedidos recebidos</strong>', 'Pedidos de orçamento enviados pelo formulário do site, do mais recente ao mais antigo.') +
      '<p><button type="button" class="adm-btn adm-btn--fantasma" data-acao="recarregar-pedidos">' + ic('voltar') + 'Atualizar</button></p>' + corpo;
  };
  function carregarPedidos() {
    pedidosErro = '';
    api('GET', 'api/admin/contatos').then(function (d) { pedidos = d.contatos || []; }, function (e) { pedidosErro = e.message; })
      .then(function () { if (secao === 'pedidos') render(); });
  }

  function render(focar) {
    seq = 0;
    var topo = editor.scrollTop;
    editor.innerHTML = SECOES[secao]();
    if (focar) {
      editor.scrollTop = 0; editor.focus({ preventScroll: true });
      Array.prototype.forEach.call(editor.children, function (el, i) { el.style.setProperty('--i', Math.min(i, 8)); });
      if (window.MK_ANIM) window.MK_ANIM.repetir(editor, 'entrando');
    } else { editor.classList.remove('entrando'); editor.scrollTop = topo; }
    document.querySelectorAll('[data-secao]').forEach(function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-secao') === secao)); });
  }

  /* ---------- estado, prévia, status ---------- */
  var tempo;
  function enviarPrevia(extra) {
    clearTimeout(tempo);
    tempo = setTimeout(function () {
      var msg = { tipo: 'marko:config', config: rascunho };
      if (extra) Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; });
      try { iframe.contentWindow.postMessage(msg, '*'); } catch (e) { /* prévia indisponível */ }
    }, extra ? 0 : 120);
  }
  function sujo() { return JSON.stringify(rascunho) !== JSON.stringify(publicado); }
  function status(txt, tipo) {
    var st = document.getElementById('status');
    st.className = 'adm-status' + (tipo ? ' ' + tipo : '');
    document.getElementById('status-txt').textContent = txt;
  }
  function mudou(estrutura, extra) {
    var s = sujo();
    document.getElementById('btn-publicar').disabled = !s;
    document.getElementById('btn-descartar').disabled = !s;
    status(s ? 'Alterações não publicadas' : 'Publicado', s ? 'rascunho' : '');
    if (estrutura) render();
    enviarPrevia(extra);
  }

  function servicoDoCaminho(k) {
    var m = /^servicos\.lista\.(\d+)/.exec(k || '');
    return m && rascunho.servicos.lista[+m[1]] ? rascunho.servicos.lista[+m[1]].id : null;
  }

  /* ---------- eventos do editor ---------- */
  editor.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-cor') || el.hasAttribute('data-cor-hex')) { cor(el); return; }
    var k = el.getAttribute('data-k'); if (!k) return;
    var v = el.hasAttribute('data-bool') ? el.checked : el.hasAttribute('data-num') ? +el.value : el.value;
    definir(k, v);
    if (/\.nome$/.test(k) && /^servicos\.lista\.\d+\.nome$/.test(k)) {
      var sum = el.closest('details') && el.closest('details').querySelector('summary');
      if (sum && sum.firstChild) sum.firstChild.textContent = v;
    }
    var estrutura = el.tagName === 'SELECT' && /^(tema\.fontes|trabalho\.itens)/.test(k) || el.hasAttribute('data-bool');
    mudou(estrutura, servicoDoCaminho(k) ? { servico: servicoDoCaminho(k) } : null);
  });
  editor.addEventListener('change', function (e) { if (e.target.matches('select[data-k], input[data-bool]')) { /* já tratado em input */ } });

  function cor(el) {
    var id = el.getAttribute('data-cor') || el.getAttribute('data-cor-hex');
    var v = el.value.trim().toLowerCase();
    if (el.hasAttribute('data-cor-hex')) {
      if (!/^#[0-9a-f]{6}$/.test(v)) { el.setAttribute('aria-invalid', 'true'); return; }
      el.removeAttribute('aria-invalid');
      editor.querySelector('[data-cor="' + id + '"]').value = v;
    } else editor.querySelector('[data-cor-hex="' + id + '"]').value = v;
    rascunho.tema.cores[id] = v;
    document.getElementById('tab-contraste').innerHTML = tabelaContraste();
    mudou(false);
  }

  editor.addEventListener('toggle', function (e) {
    var d = e.target; if (!d.matches || !d.matches('details[data-servico-i]')) return;
    var i = +d.getAttribute('data-servico-i');
    if (d.open) { abertos[i] = true; var s = rascunho.servicos.lista[i]; if (s) enviarPrevia({ servico: s.id, rolar: 'servicos' }); }
    else delete abertos[i];
  }, true);

  editor.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acao]'); if (!b) return;
    if (b.closest('summary')) e.preventDefault();
    var acao = b.getAttribute('data-acao'), lista = b.getAttribute('data-lista'), i = +b.getAttribute('data-i'), k = b.getAttribute('data-k');
    var arr = lista ? pegar(lista) : null;

    if (acao === 'subir' || acao === 'descer') {
      var j = acao === 'subir' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return;
      var x = arr[i]; arr[i] = arr[j]; arr[j] = x;
      if (lista === 'servicos.lista') { var ai = abertos[i], aj = abertos[j]; delete abertos[i]; delete abertos[j]; if (ai) abertos[j] = true; if (aj) abertos[i] = true; }
      mudou(true); return;
    }
    if (acao === 'remover') {
      arr.splice(i, 1);
      if (lista === 'servicos.lista') abertos = {};
      mudou(true); return;
    }
    if (acao === 'recarregar-pedidos') { pedidos = null; render(); carregarPedidos(); return; }
    if (acao === 'tema') { rascunho.tema.padrao = b.getAttribute('data-v'); mudou(true); return; }
    if (acao === 'paleta-original') { rascunho.tema.cores = M.clonar(M.PADRAO.tema.cores); mudou(true); return; }
    if (acao === 'sem-midia') { rascunho.hero.midia = { tipo: 'imagem', src: '', alt: '' }; mudou(true); return; }
    if (acao === 'trocar') {
      abrirSeletor(b.getAttribute('data-aceita'), function (src) {
        definir(k, src);
        var m = /^(trabalho\.itens\.\d+|hero\.midia)\.src$/.exec(k);
        if (m) definir(m[1] + '.tipo', M.ehVideo(src) ? 'video' : 'imagem');
        mudou(true, servicoDoCaminho(k) ? { servico: servicoDoCaminho(k) } : null);
      });
      return;
    }
    if (acao === 'add-midia') { abrirSeletor(b.getAttribute('data-aceita'), function (src) { arr.push(src); mudou(true, servicoDoCaminho(lista) ? { servico: servicoDoCaminho(lista) } : null); }); return; }
    if (acao === 'add-etapa') { arr.push({ t: 'Nova etapa', p: '' }); mudou(true); return; }
    if (acao === 'add-trabalho') {
      abrirSeletor('midia', function (src) {
        rascunho.trabalho.itens.push({ tipo: M.ehVideo(src) ? 'video' : 'imagem', src: src, alt: '', legenda: '', tamanho: 'normal' });
        mudou(true, { rolar: 'trabalho' }); editor.scrollTop = editor.scrollHeight;
      }); return;
    }
    if (acao === 'add-servico') {
      var n = rascunho.servicos.lista.length;
      rascunho.servicos.lista.push({ id: 'servico-' + Date.now(), nome: 'Novo serviço', resumo: '', etapas: [{ t: 'Primeira etapa', p: '' }], midias: [], exemplo: true });
      abertos[n] = true; mudou(true, { servico: rascunho.servicos.lista[n].id, rolar: 'servicos' }); editor.scrollTop = editor.scrollHeight; return;
    }
    if (acao === 'add-cliente') { abrirSeletor('logo', function (src) { rascunho.clientes.lista.push({ nome: 'Novo cliente', logos: [src] }); mudou(true, { rolar: 'clientes' }); }); return; }
    if (acao === 'add-parceiro') { abrirSeletor('logo', function (src) { rascunho.sobre.parceiros.push({ nome: 'Nova empresa', logo: src }); mudou(true); }); return; }
    if (acao === 'add-depoimento') { rascunho.depoimentos.lista.push({ texto: '', nome: 'Nome do cliente', foto: '' }); mudou(true, { rolar: 'depoimentos' }); editor.scrollTop = editor.scrollHeight; }
  });

  /* ---------- seletor de mídia ---------- */
  var seletor = document.getElementById('seletor'), aoEscolher = null;
  var enviados = [], aceitaAtual = 'imagem';
  function abrirSeletor(aceita, cb) {
    aoEscolher = cb; aceitaAtual = aceita;
    document.getElementById('seletor-nota').textContent = aceita === 'midia' ? 'Imagens são reduzidas para 1600 px antes do envio. Vídeos em MP4 ou WebM, de preferência curtos e leves.' : 'Imagens são reduzidas para 1600 px antes do envio.';
    document.getElementById('seletor-arquivo').setAttribute('accept', aceita === 'midia' ? 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif');
    grade();
    document.getElementById('seletor-arquivo').value = '';
    seletor.showModal();
    api('GET', 'api/admin/midias').then(function (d) { enviados = d.midias || []; if (seletor.open) grade(); }, function () { /* mostra só a biblioteca */ });
  }
  function grade() {
    var aceita = aceitaAtual;
    var itens = enviados.concat(M.BIBLIOTECA).filter(function (src) {
      var v = M.ehVideo(src);
      if (aceita === 'midia') return true;
      if (aceita === 'logo') return !v && /(^uploads\/|\/(clientes|marca)\/)/.test(src);
      return !v;
    });
    document.getElementById('seletor-titulo').textContent = aceita === 'logo' ? 'Escolher logo' : aceita === 'midia' ? 'Escolher foto ou vídeo' : 'Escolher imagem';
    document.getElementById('seletor-grade').innerHTML = itens.map(function (src) {
      var nome = /^uploads\//.test(src) ? 'Enviado' : src.split('/').pop(), logo = /\/(clientes|marca)\//.test(src);
      return '<button type="button" class="' + (logo ? 'logo' : '') + '" data-src="' + esc(src) + '" title="' + esc(nome) + '">' +
        (M.ehVideo(src) ? '<video src="' + esc(src) + '" muted preload="metadata"></video>' : '<img src="' + esc(src) + '" alt="" loading="lazy">') + '<span>' + esc(nome) + '</span></button>';
    }).join('');
  }
  document.getElementById('seletor-grade').addEventListener('click', function (e) {
    var b = e.target.closest('[data-src]'); if (!b) return;
    seletor.close(); if (aoEscolher) aoEscolher(b.getAttribute('data-src'));
  });
  document.getElementById('seletor-arquivo').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    var nota = document.getElementById('seletor-nota'), input = this;
    var video = /^video\/(mp4|webm)$/.test(f.type);
    if (video && aceitaAtual !== 'midia') { nota.textContent = 'Aqui só cabe imagem. Envie JPG, PNG ou WebP.'; return; }
    if (!video && !/^image\/(jpeg|png|webp|gif)$/.test(f.type)) { nota.textContent = 'Formato não aceito. Envie JPG, PNG, WebP' + (aceitaAtual === 'midia' ? ', MP4 ou WebM.' : '.'); return; }
    input.disabled = true; nota.textContent = 'Enviando ' + f.name + '…';
    var preparar = video || f.type === 'image/gif' ? Promise.resolve(f) : reduzir(f);
    preparar.then(function (blob) { return api('POST', 'api/admin/upload', blob, blob.type || f.type); })
      .then(function (d) { enviados.unshift(d.src); seletor.close(); if (aoEscolher) aoEscolher(d.src); },
        function (e) { nota.textContent = 'Não foi possível enviar: ' + e.message; })
      .then(function () { input.disabled = false; input.value = ''; });
  });
  /* Reduz a imagem para no máximo 1600 px antes de enviar */
  function reduzir(arquivo) {
    return new Promise(function (ok) {
      var url = URL.createObjectURL(arquivo), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var max = 1600, s = Math.min(1, max / Math.max(img.width, img.height));
        if (s === 1 && arquivo.size < 1.5 * 1024 * 1024) { ok(arquivo); return; }
        var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { ok(b || arquivo); }, arquivo.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); ok(arquivo); };
      img.src = url;
    });
  }

  /* ---------- topo e navegação ---------- */
  function irPara(s, rolar) {
    if (!SECOES[s]) s = 'aparencia';
    secao = s;
    if (s === 'pedidos') carregarPedidos();
    if (location.hash !== '#' + s) history.replaceState(null, '', '#' + s);
    render(true);
    if (rolar !== false) enviarPrevia({ rolar: ANCORA[s] });
  }
  document.getElementById('adm-nav').addEventListener('click', function (e) {
    var b = e.target.closest('[data-secao]'); if (b) irPara(b.getAttribute('data-secao'));
  });
  window.addEventListener('hashchange', function () { irPara(location.hash.slice(1)); });

  var publicando = false;
  document.getElementById('btn-publicar').addEventListener('click', function () {
    if (publicando) return;
    publicando = true;
    var enviado = M.clonar(rascunho), botao = this;
    botao.disabled = true; status('Publicando…', 'rascunho');
    api('PUT', 'api/admin/config', enviado).then(function () {
      publicado = enviado; mudou(false);
      if (!sujo()) {
        status('Publicado agora', '');
        if (window.MK_ANIM) window.MK_ANIM.repetir(document.getElementById('status'), 'publicou');
      }
    }, function (e) {
      status('Não publicou: ' + e.message, 'erro'); botao.disabled = false;
    }).then(function () { publicando = false; });
  });
  document.getElementById('btn-descartar').addEventListener('click', function () { rascunho = M.clonar(publicado); abertos = {}; mudou(true); });

  document.getElementById('btn-exportar').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(rascunho, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'marko-config.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.getElementById('btn-importar').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return; var input = this;
    var leitor = new FileReader();
    leitor.onload = function () {
      try { rascunho = M.mesclar(M.clonar(M.PADRAO), JSON.parse(leitor.result)); abertos = {}; mudou(true); status('Arquivo importado. Revise e publique.', 'rascunho'); }
      catch (e) { status('Esse arquivo não é uma configuração válida.', 'erro'); }
      input.value = '';
    };
    leitor.readAsText(f);
  });

  var confirmar = document.getElementById('confirmar');
  document.getElementById('btn-restaurar').addEventListener('click', function () { confirmar.showModal(); });
  confirmar.addEventListener('close', function () {
    if (confirmar.returnValue !== 'sim') return;
    api('DELETE', 'api/admin/config').then(function () {
      publicado = M.clonar(M.PADRAO); rascunho = M.clonar(M.PADRAO); abertos = {};
      mudou(true); status('Padrão restaurado', '');
    }, function (e) { status('Não restaurou: ' + e.message, 'erro'); });
  });

  window.addEventListener('beforeunload', function (e) { if (sujo()) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- prévia: escala desktop/celular ---------- */
  var palco = document.getElementById('palco'), moldura = document.getElementById('moldura'), previa = document.querySelector('.adm-previa');
  var tela = 'desktop';
  function escalar() {
    var largura = tela === 'celular' ? 390 : 1280;
    var w = palco.clientWidth - 32, h = palco.clientHeight - 32; if (w <= 0 || h <= 0) return;
    var s = Math.min(1, w / largura);
    var altura = tela === 'celular' ? Math.min(844, h / s) : h / s;
    iframe.style.width = largura + 'px'; iframe.style.height = altura + 'px'; iframe.style.transform = 'scale(' + s + ')';
    moldura.style.width = (largura * s + (tela === 'celular' ? 16 : 0)) + 'px'; moldura.style.height = (altura * s + (tela === 'celular' ? 16 : 0)) + 'px';
  }
  document.querySelectorAll('[data-tela]').forEach(function (b) {
    b.addEventListener('click', function () {
      tela = b.getAttribute('data-tela');
      document.querySelectorAll('[data-tela]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      previa.classList.toggle('celular', tela === 'celular'); escalar();
    });
  });
  if (window.ResizeObserver) new ResizeObserver(escalar).observe(palco); else window.addEventListener('resize', escalar);
  iframe.addEventListener('load', function () { enviarPrevia({ rolar: ANCORA[secao] }); });

  irPara(location.hash.slice(1) || 'aparencia', false);
  escalar();
})();
