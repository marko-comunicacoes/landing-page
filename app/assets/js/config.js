/* Marko Comunicações — configuração do site (o que o admin edita)
   Para mudar textos, cores, fontes, fotos e vídeos do site, edite PADRAO abaixo e faça o deploy. */
(function () {
  'use strict';

  var I = 'assets/img/';
  var V = 'assets/video/';

  var PADRAO = {
    versao: 1,
    tema: {
      padrao: 'claro',
      cores: {
        'sage-50': '#f3f6ef', 'sage-100': '#e6eee1', 'sage-200': '#cad2c5', 'sage-300': '#95beac',
        'sage-400': '#83a98c', 'sage-500': '#52796f', 'teal-700': '#355053', 'slate-800': '#2f3e46',
        'ink-950': '#191919', 'sun-500': '#f6a81b'
      },
      fontes: { sans: 'Arimo', display: 'Jost', serif: 'Fraunces' },
      raioBotao: 999
    },
    hero: {
      linha1: 'Bem-vindo',
      linha2: 'a Marko',
      rotulo: 'Um marco na\nsua empresa',
      texto: 'Fotografia, filmagem, social media e tráfego pago para negócios de Recife que querem ser lembrados.',
      cta: 'Peça um orçamento',
      midia: { tipo: 'video', src: V + 'bastidores-gravacao.mp4', poster: '', alt: 'Bastidores de uma gravação da Marko' }
    },
    trabalho: {
      titulo: 'N*o*sso **trabalho**',
      texto: 'A Marko Comunicações preza pela qualidade, seja do planejamento à execução e posteriormente a entrega ao cliente.',
      itens: [
        { tipo: 'imagem', src: I + 'portfolio/odontologia.jpg', alt: 'Dentista segurando escova de dentes', legenda: 'Dra. Paula Siqueira', tamanho: 'alto' },
        { tipo: 'imagem', src: I + 'portfolio/gastronomia-sushi.jpg', alt: 'Sushi servido em prato escuro', legenda: 'Gastronomia', tamanho: 'largo' },
        { tipo: 'video', src: V + 'cafeteria-atendimento.mp4', alt: 'Atendente servindo café', legenda: 'Reels · cafeteria', tamanho: 'alto' },
        { tipo: 'imagem', src: I + 'portfolio/bebida-praia.jpg', alt: 'Mulher na praia segurando lata de bebida', legenda: 'Campanha de bebida', tamanho: 'alto' },
        { tipo: 'imagem', src: I + 'portfolio/oficina-mecanica.jpg', alt: 'Mecânico trabalhando na oficina', legenda: 'GT', tamanho: 'alto' },
        { tipo: 'imagem', src: I + 'portfolio/gastronomia-parrilla.jpg', alt: 'Carne com batata e queijo', legenda: 'Romeno Burger', tamanho: 'normal' },
        { tipo: 'imagem', src: I + 'portfolio/cafeteria.jpg', alt: 'Xícara de café e bolo', legenda: 'Cafeteria', tamanho: 'normal' },
        { tipo: 'imagem', src: I + 'portfolio/lava-jato.jpg', alt: 'Funcionário de lava-jato sorrindo', legenda: 'Lava-jato', tamanho: 'largo' },
        { tipo: 'imagem', src: I + 'portfolio/moda-automotivo.jpg', alt: 'Detalhe de roupa encostada em carro azul', legenda: 'Moda', tamanho: 'largo' },
        { tipo: 'imagem', src: I + 'portfolio/confeitaria-natal.jpg', alt: 'Bolo decorado de Natal', legenda: 'Confeitaria', tamanho: 'largo' }
      ]
    },
    servicos: {
      titulo: 'O *que* **fazemos**',
      nota: '*Clique nos serviços e descubra',
      rotulo: 'Deixamos sua marca\nna história.',
      lista: [
        { id: 'fotografias', nome: 'Fotografias', resumo: 'Postagem de fotos reais de clientes, funcionários e estrutura dão ao público uma sensação de proximidade com a instituição.',
          etapas: [{ t: 'Produção', p: 'Sessão no seu espaço, com a sua equipe e os seus produtos. Sem banco de imagens.' }, { t: 'Pós-produção', p: 'Todo material colhido é entregue ao cliente em um Drive personalizado, podendo ser utilizado para outros trabalhos.' }],
          midias: [I + 'portfolio/cerveja-servindo.jpg', I + 'portfolio/retrato-vermelho.jpg', I + 'portfolio/clinica-odontologica.jpg', I + 'portfolio/doces-natal.jpg'], exemplo: false },
        { id: 'filmagens', nome: 'Filmagens', resumo: 'O cliente precisava de conteúdos mais estratégicos e profissionais para atrair atenção e gerar mais resultados nas redes.',
          etapas: [{ t: 'O desafio', p: 'Conteúdo amador não segurava a atenção e não trazia cliente.' }, { t: 'O que fizemos', p: 'Desenvolvemos filmagens e reels com foco em engajamento e conversão, elevando a qualidade do perfil e fortalecendo a presença digital.' }],
          midias: [V + 'lancamento-imobiliario.mp4', V + 'confeitaria.mp4', V + 'campanha-uma-vida.mp4'], exemplo: false },
        { id: 'gestao', nome: 'Gestão de Marketing', resumo: 'Cuidamos da sua marca do diagnóstico à entrega, online e no ponto físico.',
          etapas: [{ t: 'Análise', p: 'Analisamos as principais carências e necessidades do seu empreendimento, tanto online como físico.' }, { t: 'Planejamento', p: 'Realizamos um planejamento de ações que irão alavancar sua marca.' }, { t: 'Execução', p: 'Levamos sua marca ao objetivo, os clientes, entregando material de qualidade que fortalece o vínculo com o público.' }],
          midias: [I + 'gestao/antes.jpg', I + 'gestao/depois.jpg', I + 'gestao/feed-odontopediatria.jpg', I + 'gestao/feed-gt.jpg'], exemplo: false },
        { id: 'social', nome: 'Social Mídia', resumo: 'Calendário de posts, roteiro, legenda e resposta ao público, todo mês.',
          etapas: [{ t: 'Calendário', p: 'Planejamos o mês com datas, temas e formatos.' }, { t: 'Produção', p: 'Artes, reels e legendas no tom da sua marca.' }, { t: 'Relatório', p: 'O que funcionou, o que ajustar no mês seguinte.' }],
          midias: [I + 'gestao/feed-imobiliaria.jpg', I + 'gestao/feed-odontopediatria.jpg'], exemplo: true },
        { id: 'design', nome: 'Design Gráfico', resumo: 'Identidade visual, artes para redes, cardápios, fachadas e material impresso.',
          etapas: [{ t: 'Briefing', p: 'Entendemos o seu negócio e o seu público.' }, { t: 'Criação', p: 'Propostas visuais com revisão junto com você.' }, { t: 'Entrega', p: 'Arquivos prontos para redes, impressão e site.' }],
          midias: [I + 'gestao/depois.jpg', I + 'gestao/feed-gt.jpg'], exemplo: true },
        { id: 'trafego', nome: 'Tráfego Pago', resumo: 'Anúncios no Instagram, Facebook e Google para levar gente certa até você.',
          etapas: [{ t: 'Público', p: 'Definimos quem precisa ver o seu anúncio e onde.' }, { t: 'Campanha', p: 'Criativos e orçamento ajustados semana a semana.' }, { t: 'Resultado', p: 'Mensagens, visitas e vendas medidas no relatório.' }],
          midias: [I + 'portfolio/bebida-praia.jpg'], exemplo: true }
      ]
    },
    clientes: {
      titulo: 'N*o*ssos **clientes**',
      lista: [
        { nome: 'Dra. Paula Siqueira Odontopediatria', logos: [I + 'clientes/dra-paula-siqueira-odontopediatria.png'] },
        { nome: 'Dra. Paula Siqueira', logos: [I + 'clientes/dra-paula-siqueira.png'] },
        { nome: 'Arcádia', logos: [I + 'clientes/arcadia.png'] },
        { nome: 'Cinco · Cuidado Inteligente Conectado', logos: [I + 'clientes/cinco.png'] },
        { nome: 'Vita', logos: [I + 'clientes/vita-simbolo.png', I + 'clientes/vita-wordmark.png'] },
        { nome: 'Romeno Burger', logos: [I + 'clientes/romeno-burger.jpg'] },
        { nome: 'Colégio Educativo', logos: [I + 'clientes/colegio-educativo.png'] },
        { nome: 'GT', logos: [I + 'clientes/gt.png'] }
      ]
    },
    sobre: {
      titulo: 'Sobr*e* a **Agência Marko**',
      texto: 'A Marko Comunicações é uma agência ampla e plural, onde buscamos atender a todas as necessidades publicitárias de nossos clientes. Entregando qualidade e inovação para alavancar sua marca.',
      frase: 'Não é sobre nossa agência, mas sobre sua empresa.',
      fundador: {
        nome: 'Matheus Galdino',
        cargo: 'Fundador',
        foto: I + 'pessoas/matheus-galdino.jpg',
        texto: 'Profissional de produção audiovisual com mais de 7 anos de mercado. Trabalha como freelancer e tem experiência como social media em campanha política. Fez parte da equipe de marketing do Hospital Veterinário PetDream e da Secretaria de Meio Ambiente de Pernambuco, e produziu vídeo propagandas, foto propaganda, minidocs e animações 2D.'
      },
      parceiros: [
        { nome: 'PetDream · Clínica, Resort e Spa', logo: I + 'clientes/petdream.png' },
        { nome: 'Secretaria de Meio Ambiente e Sustentabilidade de Pernambuco', logo: I + 'clientes/semas-pe.png' }
      ]
    },
    depoimentos: {
      titulo: 'Clientes **satisfeitos**',
      lista: [
        { texto: 'Matheus, o reels que tu produziu ficou muito bom, sério. Qualidade top e já trouxe cliente pra gente.', nome: 'Rapha Vasconcelos', foto: I + 'pessoas/rapha-vasconcelos.jpg' },
        { texto: 'Gente, depois que comecei com vocês meu Instagram mudou muito. Tá bem mais profissional e comecei a receber mais mensagens.', nome: 'Dra. Paula Siqueira', foto: I + 'pessoas/paula-siqueira.jpg' },
        { texto: 'Mano, tu salvou kkkk. Eu não tinha tempo nem ideia do que postar, e agora tá tudo organizado e dando resultado.', nome: 'Danilo Novelino', foto: I + 'pessoas/danilo-novelino.jpg' }
      ]
    },
    contato: {
      titulo: 'Deixe *sua* ~marca~',
      email: 'markocomun@gmail.com',
      telefone: '(81) 99897-2340',
      whatsapp: '5581998972340',
      instagram: 'markocomun',
      linktree: 'linktr.ee/marko_comun',
      endereco1: 'Av. Gen. San Martin, 572',
      endereco2: 'Cordeiro - Recife',
      chamada: 'Trabalhe conosco'
    }
  };

  /* Paleta: nome e papel de cada cor, para o admin e o guia */
  var PALETA = [
    { id: 'teal-700', nome: 'Verde-petróleo', papel: 'Fundo de todas as seções' },
    { id: 'slate-800', nome: 'Ardósia', papel: 'Rodapé, texto dos botões' },
    { id: 'sage-200', nome: 'Sálvia', papel: 'Botões, painel de clientes' },
    { id: 'sage-100', nome: 'Sálvia clara', papel: 'Títulos e texto principal' },
    { id: 'sage-300', nome: 'Sálvia média', papel: 'Números e texto grande de apoio' },
    { id: 'sage-400', nome: 'Folha', papel: 'Etiqueta de marca' },
    { id: 'sage-500', nome: 'Musgo', papel: 'Apoio no tema Claro' },
    { id: 'sage-50', nome: 'Névoa', papel: 'Fundo do tema Claro' },
    { id: 'sun-500', nome: 'Sol', papel: 'O sol do símbolo; foco e um destaque por tela' },
    { id: 'ink-950', nome: 'Grafite', papel: 'Texto sobre fotos' }
  ];

  /* Funções de cor → item da paleta, por tema (espelha tokens.css) */
  var FUNCOES = {
    escuro: { surface: 'teal-700', 'surface-deep': 'slate-800', panel: 'sage-200', 'panel-tile': 'teal-700', ink: 'sage-100', 'ink-soft': 'sage-200', muted: 'sage-300', accent: 'sage-200', 'on-accent': 'slate-800', tag: 'sage-400', 'on-tag': 'slate-800', focus: 'sun-500' },
    claro: { surface: 'sage-50', 'surface-deep': 'sage-100', panel: 'teal-700', 'panel-tile': 'slate-800', ink: 'slate-800', 'ink-soft': 'teal-700', muted: 'sage-500', accent: 'teal-700', 'on-accent': 'sage-100', tag: 'sage-400', 'on-tag': 'slate-800', focus: 'teal-700' }
  };

  /* Pares que o admin e o guia verificam: [texto, fundo, uso, mínimo] */
  var PARES = [
    ['ink', 'surface', 'Títulos e texto principal', 4.5],
    ['ink-soft', 'surface', 'Parágrafos e rótulos', 4.5],
    ['ink', 'surface-deep', 'Texto do rodapé', 4.5],
    ['ink-soft', 'surface-deep', 'Contatos no rodapé', 4.5],
    ['on-accent', 'accent', 'Texto dos botões', 4.5],
    ['muted', 'surface', 'Números de etapa (texto grande)', 3],
    ['on-tag', 'tag', 'Etiqueta de marca (16px+)', 3],
    ['focus', 'surface', 'Anel de foco', 3]
  ];

  /* Fontes disponíveis no admin. local: já vem na pasta; senão, Google Fonts. */
  var FONTES = {
    sans: [
      { nome: 'Arimo', local: true, pilha: '"Arimo", "Helvetica Neue", Helvetica, Arial, sans-serif', nota: 'Mesma métrica da Helvetica World do site original' },
      { nome: 'Instrument Sans', g: 'Instrument+Sans:ital,wght@0,400;0,700;1,400;1,700', pilha: '"Instrument Sans", Arimo, sans-serif' },
      { nome: 'Archivo', g: 'Archivo:ital,wght@0,400;0,700;1,400;1,700', pilha: '"Archivo", Arimo, sans-serif' },
      { nome: 'DM Sans', g: 'DM+Sans:ital,wght@0,400;0,700;1,400;1,700', pilha: '"DM Sans", Arimo, sans-serif' },
      { nome: 'Manrope', g: 'Manrope:wght@400;700', pilha: '"Manrope", Arimo, sans-serif', nota: 'Sem itálico verdadeiro' }
    ],
    display: [
      { nome: 'Jost', local: true, pilha: '"Jost", Futura, "Century Gothic", sans-serif', nota: 'Substituta da Fashion Fetish Heavy' },
      { nome: 'Outfit', g: 'Outfit:wght@700', pilha: '"Outfit", Jost, sans-serif' },
      { nome: 'Syne', g: 'Syne:wght@700', pilha: '"Syne", Jost, sans-serif' },
      { nome: 'Unbounded', g: 'Unbounded:wght@700', pilha: '"Unbounded", Jost, sans-serif' },
      { nome: 'Archivo Black', g: 'Archivo+Black', pilha: '"Archivo Black", Jost, sans-serif' }
    ],
    serif: [
      { nome: 'Fraunces', local: true, pilha: '"Fraunces", Georgia, serif', nota: 'Substituta da TT Ramillas' },
      { nome: 'Instrument Serif', g: 'Instrument+Serif:ital@0;1', pilha: '"Instrument Serif", Fraunces, serif' },
      { nome: 'DM Serif Display', g: 'DM+Serif+Display:ital@0;1', pilha: '"DM Serif Display", Fraunces, serif' },
      { nome: 'Playfair Display', g: 'Playfair+Display:ital,wght@0,400;1,400', pilha: '"Playfair Display", Fraunces, serif' },
      { nome: 'Young Serif', g: 'Young+Serif', pilha: '"Young Serif", Fraunces, serif' }
    ]
  };

  function clonar(o) { return JSON.parse(JSON.stringify(o)); }

  function mesclar(base, extra) {
    if (Array.isArray(base) || Array.isArray(extra)) return extra !== undefined ? extra : base;
    if (base && typeof base === 'object' && extra && typeof extra === 'object') {
      var out = {};
      Object.keys(base).forEach(function (k) { out[k] = mesclar(base[k], extra[k]); });
      Object.keys(extra).forEach(function (k) { if (!(k in out)) out[k] = extra[k]; });
      return out;
    }
    return extra !== undefined ? extra : base;
  }

  function carregar() { return clonar(PADRAO); }

  function acharFonte(papel, nome) {
    var lista = FONTES[papel] || [];
    for (var i = 0; i < lista.length; i++) if (lista[i].nome === nome) return lista[i];
    return lista[0];
  }

  function carregarFonteGoogle(doc, f) {
    if (!f || f.local || !f.g) return;
    var id = 'gf-' + f.nome.replace(/\W/g, '');
    if (doc.getElementById(id)) return;
    var l = doc.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f.g + '&display=swap';
    doc.head.appendChild(l);
  }

  function aplicarTema(cfg, doc, temaForcado) {
    doc = doc || document;
    var raiz = doc.documentElement;
    var cores = cfg.tema.cores;
    Object.keys(cores).forEach(function (k) { raiz.style.setProperty('--' + k, cores[k]); });
    ['sans', 'display', 'serif'].forEach(function (papel) {
      var f = acharFonte(papel, cfg.tema.fontes[papel]);
      carregarFonteGoogle(doc, f);
      raiz.style.setProperty('--font-' + papel, f.pilha);
    });
    raiz.style.setProperty('--radius-btn', (cfg.tema.raioBotao >= 999 ? 999 : cfg.tema.raioBotao) + 'px');
    var tema = temaForcado || cfg.tema.padrao;
    if (tema === 'claro') raiz.setAttribute('data-theme', 'claro'); else raiz.removeAttribute('data-theme');
  }

  /* Cores resolvidas de cada função, para medir contraste */
  function resolver(cfg, tema) {
    var mapa = FUNCOES[tema] || FUNCOES.escuro, out = {};
    Object.keys(mapa).forEach(function (k) { out[k] = cfg.tema.cores[mapa[k]]; });
    return out;
  }

  function luminancia(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var c = [0, 2, 4].map(function (i) {
      var v = parseInt(h.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) {
    var x = luminancia(a), y = luminancia(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /* Mini-marcação dos títulos: **negrito**, *itálico*, ~serifa~ */
  function marcar(txt) {
    return esc(txt)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~(.+?)~/g, '<span class="mk-serif">$1</span>')
      .replace(/\n/g, '<br>');
  }
  function semMarcas(txt) { return String(txt || '').replace(/[*~]/g, ''); }

  function ehVideo(src) { return /\.(mp4|webm|mov)(\?|$)/i.test(src || '') || /^data:video\//.test(src || ''); }

  /* Ícones: traço fino, 24px */
  var ICONES = {
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    whatsapp: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6"/>',
    email: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    play: '<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    som: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    mudo: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 10l4 4M20 10l-4 4"/>',
    cima: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    baixo: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    lixo: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    imagem: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3h16v-3"/>',
    celular: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    monitor: '<rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16.5V20"/>',
    lua: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    paleta: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.9 1.4-2l-.3-.8c-.5-1.2.4-2.5 1.7-2.5H17a3.5 3.5 0 0 0 3.5-3.5c0-4.6-3.8-8.2-8.5-8.2z"/><circle cx="7.5" cy="12" r="1"/><circle cx="10" cy="8" r="1"/><circle cx="14.5" cy="8" r="1"/>',
    texto: '<path d="M5 6V4.5h14V6M12 4.5v15M9 19.5h6"/>',
    grade: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
    pessoas: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><circle cx="17" cy="9.5" r="2.3"/><path d="M16 14.6c2.2.1 3.9 1.4 4.5 4.4"/>',
    citacao: '<path d="M6 17c-1.5-1-2-2.6-2-4.5C4 9.4 6 7.2 9 6.5M15 17c-1.5-1-2-2.6-2-4.5 0-3.1 2-5.3 5-6"/>',
    casa: '<path d="M4 11l8-6.5 8 6.5M6 9.5V19h12V9.5"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3h16v-3"/>',
    voltar: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alerta: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.2v.3"/>'
  };

  function injetarIcones(doc) {
    doc = doc || document;
    if (doc.getElementById('mk-sprite')) return;
    var svg = '<svg id="mk-sprite" xmlns="http://www.w3.org/2000/svg" style="display:none">' +
      Object.keys(ICONES).map(function (k) { return '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONES[k] + '</symbol>'; }).join('') + '</svg>';
    doc.body.insertAdjacentHTML('afterbegin', svg);
  }
  function icone(nome, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + nome + '"/></svg>'; }

  window.MARKO = {
    PADRAO: PADRAO, PALETA: PALETA, FUNCOES: FUNCOES, PARES: PARES, FONTES: FONTES,
    clonar: clonar, mesclar: mesclar, carregar: carregar, aplicarTema: aplicarTema, acharFonte: acharFonte,
    carregarFonteGoogle: carregarFonteGoogle, resolver: resolver, contraste: contraste, esc: esc, marcar: marcar, semMarcas: semMarcas, ehVideo: ehVideo,
    injetarIcones: injetarIcones, icone: icone
  };
})();
