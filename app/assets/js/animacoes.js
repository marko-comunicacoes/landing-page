/* Marko Comunicações — animações compartilhadas (site, guia e admin)
   Liga html.anim só quando o sistema não pede movimento reduzido. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var obs = null;

  function ligado() { return raiz.classList.contains('anim'); }

  function observador() {
    if (obs || !('IntersectionObserver' in window)) return obs;
    obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    return obs;
  }

  /* Mostra e, ao fim da entrada, tira o elemento do sistema de revelar
     (assim o hover e outras transições dele voltam a funcionar sem atraso) */
  function mostrar(el) {
    el.classList.add('visivel');
    var feito = false;
    var soltar = function () { if (feito) return; feito = true; el.removeAttribute('data-revelar'); el.style.removeProperty('--i'); };
    el.addEventListener('transitionend', function f(ev) { if (ev.target === el && ev.propertyName === 'opacity') { el.removeEventListener('transitionend', f); soltar(); } });
    setTimeout(soltar, 2000);
  }

  /* Marca elementos para revelar ao rolar, com atraso escalonado entre irmãos */
  function marcar(seletor, tipo, raizBusca) {
    var porPai = new Map();
    (raizBusca || document).querySelectorAll(seletor).forEach(function (el) {
      if (el.hasAttribute('data-revelar') || el.classList.contains('visivel')) return;
      var n = porPai.get(el.parentNode) || 0; porPai.set(el.parentNode, n + 1);
      el.setAttribute('data-revelar', tipo || '');
      el.style.setProperty('--i', Math.min(n, 8));
    });
  }

  /* Observa tudo que ainda não apareceu */
  function revelar(raizBusca) {
    var lista = (raizBusca || document).querySelectorAll('[data-revelar]:not(.visivel)');
    if (!ligado() || !observador()) { lista.forEach(function (el) { el.classList.add('visivel'); el.removeAttribute('data-revelar'); }); return; }
    lista.forEach(function (el) { obs.observe(el); });
  }

  function ligar(sim) {
    if (sim && !reduz) raiz.classList.add('anim'); else raiz.classList.remove('anim');
    revelar();
  }

  /* Repete uma animação CSS tirando e pondo a classe */
  function repetir(el, classe) {
    if (!el || !ligado()) return;
    el.classList.remove(classe); void el.offsetWidth; el.classList.add(classe);
  }

  /* Fecha um <dialog> com animação de saída */
  function fecharDialogo(dlg, depois) {
    if (!dlg.open) return;
    var fim = function () { dlg.classList.remove('fechando'); dlg.close(); if (depois) depois(); };
    if (!ligado()) { fim(); return; }
    dlg.classList.add('fechando');
    dlg.addEventListener('animationend', fim, { once: true });
    setTimeout(function () { if (dlg.open) fim(); }, 400);
  }

  /* Destaca o link do índice/menu da seção visível */
  function espiao(links, secoes, atributo) {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          if (atributo) { if (on) a.setAttribute(atributo, 'true'); else a.removeAttribute(atributo); } else a.classList.toggle('ativo', on);
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    secoes.forEach(function (s) { if (s) io.observe(s); });
  }

  if (!reduz) raiz.classList.add('anim');

  window.MK_ANIM = { marcar: marcar, revelar: revelar, ligar: ligar, ligado: ligado, repetir: repetir, fecharDialogo: fecharDialogo, espiao: espiao, reduz: reduz };
})();
