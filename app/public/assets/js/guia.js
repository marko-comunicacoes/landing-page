/* Marko Comunicações — guia: cores, contraste e funções a partir da configuração publicada */
(function () {
  'use strict';
  var M = window.MARKO, esc = M.esc;
  var cfg = M.carregar();
  M.aplicarTema(cfg, document, 'escuro');

  var cores = cfg.tema.cores;
  document.getElementById('g-cores').innerHTML = M.PALETA.map(function (p) {
    return '<div class="g-cor"><div class="g-cor__amostra" style="background:' + esc(cores[p.id]) + '"></div><div class="g-cor__info"><strong>' + esc(p.nome) + '</strong><small>' + esc(p.papel) + '</small>' +
      '<button type="button" class="g-cor__hex" data-copiar="' + esc(cores[p.id]) + '" aria-label="Copiar ' + esc(cores[p.id]) + '">' + esc(cores[p.id]) + '</button></div></div>';
  }).join('');

  document.querySelector('#g-contraste tbody').innerHTML = ['escuro', 'claro'].map(function (tema) {
    var c = M.resolver(cfg, tema);
    return M.PARES.map(function (p, i) {
      var r = M.contraste(c[p[0]], c[p[1]]), ok = r >= p[3];
      return '<tr>' + (i === 0 ? '<th scope="rowgroup" rowspan="' + M.PARES.length + '">' + (tema === 'escuro' ? 'Marko' : 'Claro') + '</th>' : '') +
        '<td><span class="g-amostra" style="color:' + c[p[0]] + ';background:' + c[p[1]] + '">Marko</span></td><td>' + esc(p[2]) + '</td>' +
        '<td class="num ' + (ok ? 'g-ok' : 'g-falha') + '">' + r.toFixed(1).replace('.', ',') + ':1' + (ok ? '' : ' · baixo') + '</td><td class="num">' + String(p[3]).replace('.', ',') + ':1</td></tr>';
    }).join('');
  }).join('');

  var nomes = {}; M.PALETA.forEach(function (p) { nomes[p.id] = p.nome; });
  var rot = { surface: 'Fundo das seções', 'surface-deep': 'Rodapé', panel: 'Painel de clientes', 'panel-tile': 'Ladrilho de logo', ink: 'Títulos', 'ink-soft': 'Texto', muted: 'Números de etapa', accent: 'Botões', 'on-accent': 'Texto do botão', tag: 'Etiqueta de marca', 'on-tag': 'Texto da etiqueta', focus: 'Anel de foco' };
  document.querySelector('#g-funcoes tbody').innerHTML = Object.keys(M.FUNCOES.escuro).map(function (f) {
    var a = M.FUNCOES.escuro[f], b = M.FUNCOES.claro[f];
    return '<tr><td>' + esc(rot[f] || f) + ' <code>--' + esc(f) + '</code></td>' +
      '<td><span class="g-ponto" style="background:' + esc(cores[a]) + '"></span>' + esc(nomes[a]) + '</td>' +
      '<td><span class="g-ponto" style="background:' + esc(cores[b]) + '"></span>' + esc(nomes[b]) + '</td></tr>';
  }).join('');

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copiar]'); if (!b) return;
    var v = b.getAttribute('data-copiar');
    var fim = function () { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = v; }, 1200); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(fim, function () { b.textContent = v; });
  });
})();

/* Animações: o que entra ao rolar e o índice da seção atual */
(function () {
  var A = window.MK_ANIM; if (!A) return;
  A.marcar('.g-secao > .g-num, .g-secao > .mk-title, .g-secao > .g-lead, .g-alerta, .g-subtitulo, .g-tabela-wrap, .g-regras, .g-voz > div, .g-comp__item, .g-escala__linha');
  A.marcar('.g-tiras figure, .g-cor, .g-logo, .g-fonte, .g-el', 'zoom');
  A.marcar('.mk-step', '');
  A.revelar();
  A.espiao(Array.prototype.slice.call(document.querySelectorAll('.g-indice a')), Array.prototype.slice.call(document.querySelectorAll('.g-secao')));
})();
