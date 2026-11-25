/* Marko Comunicações — landing page: monta as seções a partir da configuração */
(function () {
  'use strict';
  var M = window.MARKO, esc = M.esc;
  var preview = /[?&]preview/.test(location.search);
  var cfg = M.carregar();
  /* Tema escolhido pelo visitante no botão do topo (sobrepõe o padrão do admin).
     Na prévia do admin é ignorado, para o admin ver sempre o tema padrão. */
  var CHAVE_TEMA = 'marko.tema.visitante';
  var temaVisitante = null;
  if (!preview) { try { temaVisitante = localStorage.getItem(CHAVE_TEMA); } catch (e) { /* sem storage */ } }
  if (temaVisitante !== 'claro' && temaVisitante !== 'escuro') temaVisitante = null;
  var servicoAtivo = null;

  var A = window.MK_ANIM || { marcar: function () {}, revelar: function () {}, ligar: function () {}, ligado: function () { return false; }, repetir: function () {}, espiao: function () {}, fecharDialogo: function (d) { d.close(); } };
  M.injetarIcones(document);
  /* Na prévia do admin o site é redesenhado a cada tecla: sem animações de entrada */
  if (preview) { document.body.classList.add('preview'); A.ligar(false); }
  /* Selo "exemplo" (texto ainda não aprovado) só aparece na prévia do admin */
  else document.body.classList.add('sem-exemplos');

  function pegar(obj, caminho) { return caminho.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }

  function midiaHTML(src, alt, opts) {
    opts = opts || {};
    if (M.ehVideo(src)) {
      return '<video src="' + esc(src) + '" muted loop playsinline ' + (opts.autoplay === false ? 'preload="metadata"' : 'autoplay preload="metadata"') + ' aria-label="' + esc(alt || '') + '"></video>';
    }
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy">';
  }

  function textos() {
    document.querySelectorAll('[data-c]').forEach(function (el) { el.textContent = pegar(cfg, el.getAttribute('data-c')) || ''; });
    document.querySelectorAll('[data-m]').forEach(function (el) { el.innerHTML = M.marcar(pegar(cfg, el.getAttribute('data-m')) || ''); });
    var c = cfg.contato;
    var whats = 'https://wa.me/' + String(c.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent('Olá, Marko! Vim pelo site e quero falar sobre um projeto.');
    document.querySelectorAll('[data-whats]').forEach(function (a) { a.href = whats; });
    document.getElementById('link-insta').href = 'https://instagram.com/' + encodeURIComponent(c.instagram || '');
    document.getElementById('link-tree').href = 'https://' + String(c.linktree || '').replace(/^https?:\/\//, '');
  }

  function hero() {
    var h = cfg.hero, fig = document.getElementById('hero-midia'), sec = document.getElementById('inicio');
    if (!h.midia || !h.midia.src) { fig.hidden = true; sec.classList.add('hero--sem-midia'); return; }
    fig.hidden = false; sec.classList.remove('hero--sem-midia');
    var video = M.ehVideo(h.midia.src);
    fig.innerHTML = midiaHTML(h.midia.src, h.midia.alt) +
      (video ? '<figcaption><span>' + esc(h.midia.alt || '') + '</span><button type="button" class="botao-som" aria-pressed="false" aria-label="Ligar som">' + M.icone('mudo') + '</button></figcaption>' : '');
    var b = fig.querySelector('.botao-som');
    if (b) b.addEventListener('click', function () {
      var v = fig.querySelector('video'); v.muted = !v.muted; if (!v.muted) v.play();
      b.setAttribute('aria-pressed', String(!v.muted));
      b.setAttribute('aria-label', v.muted ? 'Ligar som' : 'Desligar som');
      b.innerHTML = M.icone(v.muted ? 'mudo' : 'som');
    });
  }

  function mosaico() {
    var el = document.getElementById('mosaico');
    el.innerHTML = cfg.trabalho.itens.map(function (it, i) {
      var video = it.tipo === 'video' || M.ehVideo(it.src);
      return '<figure class="' + esc(it.tamanho || 'normal') + '">' + midiaHTML(it.src, it.alt) +
        (video ? '<span class="mk-play" aria-hidden="true">' + M.icone('play') + '</span>' : '') +
        (it.legenda ? '<figcaption>' + esc(it.legenda) + '</figcaption>' : '') +
        '<button type="button" class="cobre" data-abrir="' + i + '"><span class="sr">Ampliar: ' + esc(it.alt || it.legenda || 'trabalho') + '</span></button></figure>';
    }).join('');
  }

  function servicos() {
    var lista = cfg.servicos.lista;
    if (!lista.some(function (s) { return s.id === servicoAtivo; })) servicoAtivo = lista[0] && lista[0].id;
    var el = document.getElementById('lista-servicos');
    el.innerHTML = lista.map(function (s) {
      var ativo = s.id === servicoAtivo;
      return '<button type="button" role="tab" class="mk-btn mk-btn--wide" id="tab-' + esc(s.id) + '" aria-selected="' + ativo + '" aria-pressed="' + ativo + '" aria-controls="servico-painel" data-servico="' + esc(s.id) + '">' + esc(s.nome) + ' <span class="mk-btn__seta">→</span></button>';
    }).join('');
    painelServico();
    var chips = document.getElementById('f-servicos');
    chips.innerHTML = lista.map(function (s, i) {
      return '<label class="chip"><input type="checkbox" id="f-s-' + i + '" name="servicos" value="' + esc(s.nome) + '"><span>' + esc(s.nome) + '</span></label>';
    }).join('');
  }

  /* Faixa que corre com os nomes dos serviços, separados pela rosa dos ventos */
  function faixa() {
    var nomes = cfg.servicos.lista.map(function (s) { return s.nome; });
    if (!nomes.length) { document.getElementById('faixa-trilho').innerHTML = ''; return; }
    while (nomes.length < 8) nomes = nomes.concat(nomes);
    var grupo = '<div class="faixa__grupo">' + nomes.map(function (n) {
      return '<span class="faixa__item">' + esc(n) + '</span><img class="faixa__rosa" src="assets/img/marca/marko-simbolo.jpg" alt="">';
    }).join('') + '</div>';
    document.getElementById('faixa-trilho').innerHTML = grupo + grupo;
  }

  /* Diz o que entra ao rolar (só fora da prévia) */
  function animar() {
    A.marcar('.mk-section .mk-title-row, #clientes .mk-title, #depoimentos .mk-title, .sobre__texto');
    A.marcar('#mosaico > figure, .mk-services > *, .contato__lista li, .form > *');
    A.marcar('.mk-clients__tile, .mk-quote, .parceiros li', 'zoom');
    A.marcar('.fundador__foto', 'esquerda');
    A.marcar('.fundador__corpo > *, .centro, .contato__dados > .mk-btn, .contato__titulo, #servico-painel .mk-step');
    A.revelar();
  }

  function painelServico(animarTroca) {
    var s = cfg.servicos.lista.filter(function (x) { return x.id === servicoAtivo; })[0];
    var p = document.getElementById('servico-painel');
    if (!s) { p.innerHTML = ''; return; }
    p.setAttribute('aria-labelledby', 'tab-' + s.id);
    var soVideo = s.midias.length && s.midias.every(M.ehVideo);
    var palavras = s.nome.split(' '), ultima = palavras.pop();
    p.innerHTML =
      '<div class="servico__cab"><h3 class="servico__titulo"><small>Conheça nossa</small>' + esc(palavras.join(' ')) + (palavras.length ? ' ' : '') + '<strong>' + esc(ultima) + '</strong>' +
      (s.exemplo ? '<span class="mk-exemplo">exemplo</span>' : '') + '</h3><p class="servico__resumo">' + esc(s.resumo) + '</p>' +
      '<a class="mk-btn mk-btn--outline" href="#contato">Quero ' + esc(s.nome.toLowerCase()) + ' <span class="mk-btn__seta">→</span></a></div>' +
      '<div class="servico__galeria' + (soVideo ? ' servico__galeria--video' : '') + '">' + s.midias.map(function (src) { return '<figure>' + midiaHTML(src, s.nome) + '</figure>'; }).join('') + '</div>' +
      '<ol class="mk-steps">' + s.etapas.map(function (e, i) {
        return '<li class="mk-step"><span class="mk-step__n">' + String(i + 1).padStart(2, '0') + '</span><h4 class="mk-step__t">' + esc(e.t) + '</h4><p class="mk-step__p">' + esc(e.p) + '</p></li>';
      }).join('') + '</ol>';
    p.querySelectorAll('.servico__cab > *, .servico__galeria > *').forEach(function (el, i) { el.style.setProperty('--i', i % 6); });
    if (animarTroca) { A.repetir(p, 'entrando'); A.marcar('.mk-step', '', p); A.revelar(p); }
  }

  function clientes() {
    document.getElementById('mural-clientes').innerHTML = cfg.clientes.lista.map(function (c) {
      var logos = c.logos || [];
      return '<div class="mk-clients__tile' + (logos.length > 1 ? ' mk-clients__tile--duplo' : '') + '" title="' + esc(c.nome) + '">' +
        logos.map(function (src, i) { return '<img src="' + esc(src) + '" alt="' + (i ? '' : esc(c.nome)) + '">'; }).join('') + '</div>';
    }).join('');
  }

  function sobre() {
    var f = cfg.sobre.fundador, img = document.getElementById('fundador-foto');
    img.src = f.foto; img.alt = 'Foto de ' + f.nome;
    document.getElementById('parceiros').innerHTML = cfg.sobre.parceiros.map(function (p) {
      return '<li title="' + esc(p.nome) + '"><img src="' + esc(p.logo) + '" alt="' + esc(p.nome) + '"></li>';
    }).join('');
  }

  function depoimentos() {
    document.getElementById('lista-depoimentos').innerHTML = cfg.depoimentos.lista.map(function (d) {
      return '<figure class="mk-quote"><blockquote>“' + esc(d.texto) + '”</blockquote><figcaption>' +
        (d.foto ? '<img src="' + esc(d.foto) + '" alt="">' : '') + esc(d.nome) + '</figcaption></figure>';
    }).join('');
  }

  function render() {
    aplicarTema();
    textos(); hero(); faixa(); mosaico(); servicos(); clientes(); sobre(); depoimentos();
    if (!preview) animar();
  }

  function temaAtual() { return temaVisitante || cfg.tema.padrao || 'claro'; }
  function aplicarTema() {
    var tema = temaAtual();
    M.aplicarTema(cfg, document, tema);
    var b = document.getElementById('botao-tema'), proximo = tema === 'claro' ? 'escuro' : 'claro';
    var rotulo = proximo === 'escuro' ? 'Usar tema escuro' : 'Usar tema claro';
    b.setAttribute('aria-label', rotulo); b.title = rotulo;
    b.innerHTML = M.icone(proximo === 'escuro' ? 'lua' : 'sol');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = tema === 'claro' ? cfg.tema.cores['sage-50'] : cfg.tema.cores['teal-700'];
  }

  document.getElementById('botao-tema').addEventListener('click', function () {
    temaVisitante = temaAtual() === 'claro' ? 'escuro' : 'claro';
    if (!preview) { try { localStorage.setItem(CHAVE_TEMA, temaVisitante); } catch (e) { /* só nesta visita */ } }
    var raiz = document.documentElement;
    if (A.ligado()) { raiz.classList.add('trocando-tema'); clearTimeout(aplicarTema.t); aplicarTema.t = setTimeout(function () { raiz.classList.remove('trocando-tema'); }, 600); }
    aplicarTema();
  });

  /* Topo: some ao rolar para baixo, volta ao rolar para cima; link da seção visível fica marcado */
  var topoEl = document.querySelector('.topo'), ultimoY = window.scrollY, pedindo = false;
  window.addEventListener('scroll', function () {
    if (pedindo) return; pedindo = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, menuAberto = !document.getElementById('menu-mobile').hidden;
      topoEl.classList.toggle('rolou', y > 8);
      topoEl.classList.toggle('escondido', A.ligado() && !menuAberto && y > 400 && y > ultimoY + 4);
      if (y < ultimoY - 4 || y <= 400) topoEl.classList.remove('escondido');
      ultimoY = y; pedindo = false;
    });
  }, { passive: true });
  topoEl.addEventListener('focusin', function () { topoEl.classList.remove('escondido'); });
  A.espiao(Array.prototype.slice.call(document.querySelectorAll('.topo__links a')),
    ['trabalho', 'servicos', 'clientes', 'sobre', 'contato'].map(function (id) { return document.getElementById(id); }), 'aria-current');

  /* Eventos */
  document.addEventListener('click', function (e) {
    var s = e.target.closest('[data-servico]');
    if (s) {
      servicoAtivo = s.getAttribute('data-servico');
      document.querySelectorAll('[data-servico]').forEach(function (b) {
        var on = b === s; b.setAttribute('aria-selected', String(on)); b.setAttribute('aria-pressed', String(on));
      });
      painelServico(true);
      return;
    }
    var a = e.target.closest('[data-abrir]');
    if (a) { abrirCaixa(cfg.trabalho.itens[+a.getAttribute('data-abrir')]); return; }
    if (e.target.closest('[data-fechar]')) { fecharCaixa(); }
  });

  document.getElementById('lista-servicos').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var bs = Array.prototype.slice.call(this.querySelectorAll('[data-servico]'));
    var i = bs.indexOf(document.activeElement); if (i < 0) return;
    var n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
    n.focus(); n.click();
  });

  var caixa = document.getElementById('caixa');
  function abrirCaixa(it) {
    if (!it) return;
    var video = it.tipo === 'video' || M.ehVideo(it.src);
    document.getElementById('caixa-midia').innerHTML = video
      ? '<video src="' + esc(it.src) + '" controls autoplay playsinline aria-label="' + esc(it.alt || '') + '"></video>'
      : '<img src="' + esc(it.src) + '" alt="' + esc(it.alt || '') + '">';
    document.getElementById('caixa-legenda').textContent = [it.legenda, it.alt].filter(Boolean).join(' · ');
    if (caixa.showModal) caixa.showModal(); else caixa.setAttribute('open', '');
  }
  function fecharCaixa() { if (caixa.close) A.fecharDialogo(caixa); else caixa.removeAttribute('open'); }
  caixa.addEventListener('cancel', function (e) { e.preventDefault(); fecharCaixa(); });
  caixa.addEventListener('click', function (e) { if (e.target === caixa) fecharCaixa(); });
  caixa.addEventListener('close', function () { document.getElementById('caixa-midia').innerHTML = ''; });

  var menuBtn = document.querySelector('.topo__menu'), menu = document.getElementById('menu-mobile');
  menuBtn.addEventListener('click', function () {
    var abre = menu.hidden; menu.hidden = !abre; menuBtn.setAttribute('aria-expanded', String(abre));
    menuBtn.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); } });

  var form = document.getElementById('form-contato');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = document.getElementById('f-nome'), tel = document.getElementById('f-tel'), st = document.getElementById('form-status');
    var botao = form.querySelector('button[type="submit"]');
    var faltando = [];
    [nome, tel].forEach(function (c) { var vazio = !c.value.trim(); c.setAttribute('aria-invalid', String(vazio)); if (vazio) faltando.push(c); });
    if (tel.value.trim() && tel.value.replace(/\D/g, '').length < 10) { tel.setAttribute('aria-invalid', 'true'); faltando.push(tel); }
    if (faltando.length) { st.textContent = 'Preencha seu nome e um WhatsApp com DDD para a gente responder.'; faltando[0].focus(); return; }
    if (preview) { st.textContent = 'Prévia do admin: o pedido não é enviado daqui.'; return; }

    var servicos = Array.prototype.map.call(form.querySelectorAll('input[name="servicos"]:checked'), function (c) { return c.value; });
    var pedido = { nome: nome.value, tel: tel.value, empresa: document.getElementById('f-empresa').value, servicos: servicos, msg: document.getElementById('f-msg').value, site: document.getElementById('f-site').value };
    botao.disabled = true; form.setAttribute('aria-busy', 'true');
    st.textContent = 'Enviando…';
    fetch('api/contato', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.d.erro || 'Não foi possível enviar agora.');
        form.reset();
        st.innerHTML = 'Pedido recebido! A gente responde em breve. Se preferir, <a data-whats-pedido href="#" target="_blank" rel="noopener">continue no WhatsApp →</a>';
        var a = st.querySelector('[data-whats-pedido]');
        var txt = 'Olá, Marko! Sou ' + pedido.nome.trim() + (pedido.empresa.trim() ? ', da ' + pedido.empresa.trim() : '') + '. Acabei de pedir um orçamento pelo site' + (servicos.length ? ' (' + servicos.join(', ') + ')' : '') + '.';
        a.href = 'https://wa.me/' + String(cfg.contato.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(txt);
        A.repetir(st, 'enviado');
      })
      .catch(function (err) {
        st.textContent = (err && err.message ? err.message : 'Não foi possível enviar agora.') + ' Se preferir, fale com a gente pelo WhatsApp.';
      })
      .then(function () { botao.disabled = false; form.removeAttribute('aria-busy'); });
  });

  /* Atualização vinda do admin (prévia) ou de outra aba */
  window.addEventListener('message', function (e) {
    var d = e.data;
    /* só a página do admin (mesma origem) manda configuração, e só para a prévia */
    if (!preview || e.origin !== location.origin || !d || d.tipo !== 'marko:config') return;
    cfg = d.config;
    if (d.servico) servicoAtivo = d.servico;
    render();
    if (d.rolar) {
      /* scrollTo em vez de scrollIntoView: este não arrasta a página do admin junto */
      var alvo = document.getElementById(d.rolar), topo = document.querySelector('.topo');
      if (alvo) window.scrollTo(0, d.rolar === 'inicio' ? 0 : alvo.getBoundingClientRect().top + window.scrollY - (topo ? topo.offsetHeight : 0));
    }
  });

  render();
})();
