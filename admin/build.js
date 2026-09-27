/* Ksar Sghir — site builder.
   Turns data/site.json + data/articles.json into static pages (4 languages).
   Runs in the dashboard (browser) and in Node. */
(function (root) {
  'use strict';

  var LANGS = ['ar', 'fr', 'en', 'es'];
  var LOCALE = { ar: 'ar_MA', fr: 'fr_FR', en: 'en_US', es: 'es_ES' };

  var UI = {
    ar: { home: 'الرئيسية', tourism: 'السياحة', read: 'اقرأ الموضوع', latest: 'أحدث المواضيع', all: 'كل المواضيع',
      allTourism: 'كل الوجهات السياحية', related: 'مواضيع قريبة منك', share: 'شارك الموضوع', toc: 'في هذا الموضوع',
      gallery: 'معرض الصور', map: 'الموقع على الخريطة', featured: 'موضوع مميز', filterAll: 'الكل', theme: 'تبديل الوضع',
      menu: 'القائمة', updated: 'آخر تحديث', explore: 'اكتشف الوجهات', follow: 'تابعنا', rights: 'جميع الحقوق محفوظة',
      tourismIntro: 'دليل شامل لشواطئ وموانئ ومواقع القصر الصغير وضواحيه، على الضفة الجنوبية لمضيق جبل طارق.',
      ad: 'إعلان', lang: 'اللغة' },
    fr: { home: 'Accueil', tourism: 'Tourisme', read: 'Lire l’article', latest: 'Derniers articles', all: 'Tous les articles',
      allTourism: 'Toutes les destinations', related: 'À découvrir à proximité', share: 'Partager', toc: 'Dans cet article',
      gallery: 'Galerie photos', map: 'Sur la carte', featured: 'À la une', filterAll: 'Tout', theme: 'Changer de thème',
      menu: 'Menu', updated: 'Mis à jour', explore: 'Découvrir les destinations', follow: 'Suivez-nous', rights: 'Tous droits réservés',
      tourismIntro: 'Le guide des plages, ports et sites de Ksar Sghir et ses environs, sur la rive sud du détroit de Gibraltar.',
      ad: 'Publicité', lang: 'Langue' },
    en: { home: 'Home', tourism: 'Tourism', read: 'Read more', latest: 'Latest articles', all: 'All articles',
      allTourism: 'All destinations', related: 'Nearby places', share: 'Share', toc: 'In this article',
      gallery: 'Photo gallery', map: 'On the map', featured: 'Featured', filterAll: 'All', theme: 'Toggle theme',
      menu: 'Menu', updated: 'Updated', explore: 'Explore destinations', follow: 'Follow us', rights: 'All rights reserved',
      tourismIntro: 'A guide to the beaches, ports and sites of Ksar Sghir and its surroundings, on the southern shore of the Strait of Gibraltar.',
      ad: 'Advertisement', lang: 'Language' },
    es: { home: 'Inicio', tourism: 'Turismo', read: 'Leer más', latest: 'Últimos artículos', all: 'Todos los artículos',
      allTourism: 'Todos los destinos', related: 'Lugares cercanos', share: 'Compartir', toc: 'En este artículo',
      gallery: 'Galería de fotos', map: 'En el mapa', featured: 'Destacado', filterAll: 'Todo', theme: 'Cambiar tema',
      menu: 'Menú', updated: 'Actualizado', explore: 'Descubrir destinos', follow: 'Síguenos', rights: 'Todos los derechos reservados',
      tourismIntro: 'Guía de las playas, puertos y lugares de Alcazarseguer (Ksar Sghir) y sus alrededores, en la orilla sur del estrecho de Gibraltar.',
      ad: 'Publicidad', lang: 'Idioma' }
  };
  var LANG_NAME = { ar: 'العربية', fr: 'Français', en: 'English', es: 'Español' };
  var PLACE_NAMES = ['القصر الصغير', 'Ksar Sghir', 'Ksar es-Seghir', 'Ksar Seghir', 'Alcazarseguer'];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function strip(html) { return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function t(obj, lang) { if (!obj) return ''; if (typeof obj === 'string') return obj; return obj[lang] || obj.ar || ''; }
  function isAbs(u) { return /^(https?:)?\/\//.test(u || '') || /^(mailto:|tel:|#)/.test(u || ''); }
  function prefix(lang) { return lang === 'ar' ? '' : lang + '/'; }

  // file path -> directory depth ("fr/tourisme/x/index.html" -> 3)
  function depthOf(file) { return file.split('/').length - 1; }
  function up(file) { var d = depthOf(file), s = ''; for (var i = 0; i < d; i++) s += '../'; return s; }
  // link from a page file to a site path ("tourisme/x/")
  function rel(file, target) {
    if (isAbs(target)) return target;
    var r = up(file) + String(target || '').replace(/^\//, '');
    return r === '' ? './' : r;
  }
  function asset(file, src) { return !src ? '' : (isAbs(src) || /^data:/.test(src) ? src : rel(file, src)); }

  function articleDir(a, lang) {
    return prefix(lang) + (a.section === 'page' ? '' : (a.section || 'tourisme') + '/') + a.slug + '/';
  }
  function articleFile(a, lang) { return articleDir(a, lang) + 'index.html'; }
  function hasLang(a, lang) { var x = a.i18n && a.i18n[lang]; return !!(x && x.title && strip(x.content)); }
  function absUrl(site, dir) { return String(site.baseUrl || '').replace(/\/$/, '') + '/' + dir; }

  function published(articles) { return articles.filter(function (a) { return !a.draft; }); }
  function tourism(articles, lang) {
    return published(articles).filter(function (a) { return (a.section || 'tourisme') === 'tourisme' && hasLang(a, lang); })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }
  function category(site, id) {
    var c = (site.categories || []).filter(function (x) { return x.id === id; })[0];
    return c || { id: id || '', icon: '📍', name: { ar: id, fr: id, en: id, es: id } };
  }
  function catLabel(site, id, lang) { var c = category(site, id); return (c.icon ? c.icon + ' ' : '') + t(c.name, lang); }

  function relatedFor(a, articles, lang) {
    var pool = tourism(articles, lang).filter(function (x) { return x.slug !== a.slug; });
    var picked = (a.related || []).map(function (s) { return pool.filter(function (x) { return x.slug === s; })[0]; }).filter(Boolean);
    var same = pool.filter(function (x) { return x.category === a.category && picked.indexOf(x) < 0; });
    var near = pool.filter(function (x) { return picked.indexOf(x) < 0 && same.indexOf(x) < 0; });
    if (a.lat != null) {
      var dist = function (x) { return x.lat == null ? 99 : Math.hypot(x.lat - a.lat, x.lng - a.lng); };
      same.sort(function (p, q) { return dist(p) - dist(q); });
      near.sort(function (p, q) { return dist(p) - dist(q); });
    }
    return picked.concat(same, near).slice(0, 4);
  }

  // add ids to h2 and build table of contents
  function withToc(html) {
    var items = [], n = 0;
    var out = String(html || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, function (m, attrs, inner) {
      n++;
      var id = (attrs.match(/id="([^"]+)"/) || [])[1] || ('s' + n);
      items.push({ id: id, text: strip(inner) });
      if (!/id="/.test(attrs)) attrs += ' id="' + id + '"';
      return '<h2' + attrs + '>' + inner + '</h2>';
    });
    return { html: out, toc: items };
  }
  function fixContentPaths(file, html) {
    return String(html || '').replace(/(src|href)="(assets\/[^"]+)"/g, function (m, a, p) { return a + '="' + rel(file, p) + '"'; });
  }

  /* ---------- theme (editable from the dashboard) ---------- */
  var FONTS = { 'Tajawal': 'Tajawal:wght@400;500;700;800', 'Cairo': 'Cairo:wght@400;600;700;800', 'Almarai': 'Almarai:wght@400;700;800',
    'IBM Plex Sans Arabic': 'IBM+Plex+Sans+Arabic:wght@400;500;700', 'Noto Kufi Arabic': 'Noto+Kufi+Arabic:wght@400;600;800', 'Readex Pro': 'Readex+Pro:wght@400;500;700' };
  var DISPLAY = { 'Fraunces': 'Fraunces:opsz,wght@9..144,600;9..144,700', 'Playfair Display': 'Playfair+Display:wght@600;700', 'DM Serif Display': 'DM+Serif+Display', 'none': '' };
  function th(site) { return site.theme || {}; }
  function darken(hex, k) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex;
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function c(v) { return ('0' + Math.round(v * (1 - k)).toString(16)).slice(-2); }
    return '#' + c(r) + c(g) + c(b);
  }
  function fontLink(site) {
    var T = th(site), f = T.font && FONTS[T.font] ? T.font : 'Tajawal', d = T.display || 'Fraunces';
    var fam = [FONTS[f]]; if (DISPLAY[d]) fam.push(DISPLAY[d]);
    return '<link href="https://fonts.googleapis.com/css2?' + fam.map(function (x) { return 'family=' + x; }).join('&') + '&display=swap" rel="stylesheet">';
  }
  function themeCss(site, file) {
    var T = th(site), out = [], root = [];
    if (site.logo && file) root.push('--ph-logo:url("' + asset(file, site.logo) + '")');
    if (T.primary) { root.push('--sea:' + T.primary, '--sea-deep:' + darken(T.primary, .32)); }
    if (T.accent) root.push('--amber:' + T.accent);
    if (T.font && FONTS[T.font]) root.push("--font:'" + T.font + "',system-ui,Arial,sans-serif");
    if (T.display) root.push('--display:' + (T.display === 'none' ? 'var(--font)' : "'" + T.display + "',Georgia,serif"));
    var R = { small: ['6px', '10px', '4px'], large: ['30px', '20px', '12px'] }[T.radius];
    if (R) root.push('--r-lg:' + R[0], '--r:' + R[1], '--r-sm:' + R[2]);
    if (root.length) out.push(':root{' + root.join(';') + '}');
    if (T.primary) out.push(':root[data-theme="dark"]{--sea:' + T.primary + ';--sea-deep:' + T.primary + '}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--sea:' + T.primary + ';--sea-deep:' + T.primary + '}}');
    if (T.ink) out.push('.hero,:root:not([data-theme="dark"]) .stats{background-color:' + T.ink + '}');
    if (T.customCss) out.push(String(T.customCss).replace(/<\/style/gi, ''));
    return out.length ? '<style>' + out.join('\n') + '</style>\n' : '';
  }
  function iconLinks(site, file) {
    var ic = site.favicon || site.logo, v = '?v=' + (site.version || 1);
    if (!ic) return '<link rel="icon" type="image/svg+xml" href="' + rel(file, 'assets/logo.svg') + v + '">\n<link rel="icon" type="image/png" sizes="64x64" href="' + rel(file, 'assets/favicon-64.png') + v + '">\n<link rel="apple-touch-icon" href="' + rel(file, 'assets/apple-touch-icon.png') + v + '">\n';
    var h = esc(asset(file, ic));
    return '<link rel="icon" href="' + h + '">\n<link rel="apple-touch-icon" href="' + h + '">\n';
  }
  function brandMark(site, file) {
    return '<img class="brand-logo" src="' + esc(site.logo ? asset(file, site.logo) : rel(file, 'assets/logo.svg')) + '" alt="" width="40" height="40">';
  }
  function show(site, key) { var h = site.homeSections || {}; return h[key] !== false; }


  /* ---------- social icons + top bar + ticker ---------- */
  var SOCIAL_SVG = {
    facebook: '<path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z"/>',
    instagram: '<path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.2s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.2c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.1-.1zM12 2c-2.7 0-3.1 0-4.2.1C4.2 2.2 2.2 4.2 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.2 3.6 2.2 5.6 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.6-.2 5.6-2.2 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.2-3.6-2.2-5.6-5.7-5.7C15.1 2 14.7 2 12 2z"/>',
    whatsapp: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/>',
    youtube: '<path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3z"/>',
    tiktok: '<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.3v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.5a6 6 0 1 0 5.1 5.9V9.1a7.6 7.6 0 0 0 4.5 1.4V7.2a4.4 4.4 0 0 1-3.4-1.4z"/>',
    x: '<path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/>',
    telegram: '<path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.6 13.2 1.9 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z"/>',
    email: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h16V7.4l-8 5.3zM5.2 7 12 11.5 18.8 7z"/>',
    link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 19a4.5 4.5 0 0 1-3.2-7.7l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1a2.5 2.5 0 0 0 3.5 3.5l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1A4.5 4.5 0 0 1 8.5 19zm8.5-4.8a1 1 0 0 1-.7-1.7l2.1-2.1a2.5 2.5 0 0 0-3.5-3.5l-2.1 2.1a1 1 0 0 1-1.4-1.4l2.1-2.1a4.5 4.5 0 0 1 6.4 6.4l-2.2 2.1a1 1 0 0 1-.7.2z"/>'
  };
  function socialType(u) {
    u = String(u || '').toLowerCase();
    if (/facebook\.com|fb\.com|fb\.me/.test(u)) return 'facebook';
    if (/instagram\.com/.test(u)) return 'instagram';
    if (/wa\.me|whatsapp/.test(u)) return 'whatsapp';
    if (/youtube\.com|youtu\.be/.test(u)) return 'youtube';
    if (/tiktok\.com/.test(u)) return 'tiktok';
    if (/(^|\/\/|\.)(x|twitter)\.com/.test(u)) return 'x';
    if (/t\.me|telegram/.test(u)) return 'telegram';
    if (/^mailto:/.test(u)) return 'email';
    return 'link';
  }
  function socialIcons(site, cls) {
    var list = (site.social || []).filter(function (x) { return x && x.url; });
    if (!list.length) return '';
    return '<div class="' + cls + '">' + list.map(function (x) {
      var ty = x.icon || socialType(x.url);
      return '<a class="soc soc-' + ty + '" href="' + esc(x.url) + '" target="_blank" rel="noopener" aria-label="' + esc(x.name || ty) + '" title="' + esc(x.name || ty) + '">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">' + (SOCIAL_SVG[ty] || SOCIAL_SVG.link) + '</svg></a>';
    }).join('') + '</div>';
  }
  function ticker(site, file, lang) {
    var k = site.ticker || {};
    if (!k.enabled) return '';
    var items = (k.items || []).filter(function (i) { return t(i.text, lang); });
    if (!items.length) return '';
    var one = items.map(function (i) {
      var txt = esc(t(i.text, lang));
      return '<span class="tk-item">' + (i.url ? '<a href="' + esc(linkHref(site, file, lang, i)) + '"' + (isAbs(i.url) ? ' rel="noopener"' : '') + '>' + txt + '</a>' : txt) + '</span>';
    }).join('<span class="tk-sep" aria-hidden="true">•</span>');
    var label = t(k.label, lang);
    return '<div class="ticker" data-speed="' + esc(k.speed || 'normal') + '">' + (label ? '<span class="tk-label">' + esc(label) + '</span>' : '') +
      '<div class="tk-track"><div class="tk-move"><div class="tk-set">' + one + '<span class="tk-sep" aria-hidden="true">•</span></div><div class="tk-set" aria-hidden="true">' + one + '<span class="tk-sep">•</span></div></div></div></div>';
  }
  function topbar(site, file, lang) {
    var tb = site.topbar || {};
    var tk = ticker(site, file, lang), so = tb.social !== false ? socialIcons(site, 'top-soc') : '';
    if (!tk && !so) return '';
    return '<div class="topbar' + (tk ? ' has-ticker' : '') + '"><div class="wrap topbar-in">' + (tk || '<span></span>') + so + '</div></div>\n';
  }

  /* ---------- images ---------- */
  /* small copies: Blogger resizes on its side; uploaded images get a "-sm" copy (640px) listed in site._thumbs */
  var THUMBS = {};
  function smallOf(src) { return String(src).replace(/\.(webp|jpe?g|png)$/i, '-sm.webp'); }
  function sized(src, w) {
    if (/blogger\.googleusercontent\.com/.test(src || '')) return String(src).replace(/\/(s\d+|w\d+-h\d+[^/]*)\//, '/s' + w + '/');
    if (w <= 900 && src && THUMBS[String(src).replace(/^\//, '')]) return smallOf(src);
    return src;
  }
  function heroImages(site) {
    var h = site.hero || {}, list = (h.images || []).filter(Boolean);
    if (!list.length && h.image) list = [h.image];
    return list;
  }

  /* ---------- YouTube (loads only when clicked) ---------- */
  function ytId(u) {
    u = String(u || '').trim();
    var m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(u) ? u : '';
  }
  function ytBlock(url, title, lang) {
    var id = ytId(url); if (!id) return '';
    var play = { ar: 'تشغيل الفيديو', fr: 'Lire la vidéo', en: 'Play video', es: 'Reproducir vídeo' }[lang] || 'Play';
    return '<div class="yt" data-yt="' + id + '" data-title="' + esc(title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="' + esc(title) + '" loading="lazy" decoding="async" width="480" height="360">' +
      '<button type="button" class="yt-play" aria-label="' + esc(play + ': ' + title) + '"><svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6A89 89 0 0 0 .1 24a89 89 0 0 0 1.4 16.3 8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6A89 89 0 0 0 67.9 24a89 89 0 0 0-1.4-16.3z" fill="#f00"/><path d="M45 24 27 14v20z" fill="#fff"/></svg></button>' +
      '<noscript><a href="https://www.youtube.com/watch?v=' + id + '">YouTube</a></noscript></div>';
  }
  function homeVideo(site, lang) {
    var v = site.homeVideo || {}; if (!v.url || !ytId(v.url)) return '';
    var title = t(v.title, lang) || t(site.name, lang);
    return '<section class="wrap block hv"><div class="hv-grid"><div class="hv-txt"><h2 class="block-title">' + esc(title) + '</h2>' +
      (t(v.text, lang) ? '<p>' + esc(t(v.text, lang)) + '</p>' : '') + '</div>' + ytBlock(v.url, title, lang) + '</div></section>';
  }

  /* ---------- shared layout ---------- */
  function langLinks(site, file, lang, alternates) {
    return LANGS.map(function (l) {
      var target = alternates[l];
      if (target == null) return '<span class="lang is-off" aria-disabled="true">' + l.toUpperCase() + '</span>';
      return '<a class="lang' + (l === lang ? ' is-on' : '') + '" href="' + esc(rel(file, target)) + '" hreflang="' + l +
        '" lang="' + l + '" title="' + LANG_NAME[l] + '"' + (l === lang ? ' aria-current="true"' : '') + '>' + l.toUpperCase() + '</a>';
    }).join('');
  }
  function linkHref(site, file, lang, item) {
    var u = item.url || '';
    if (isAbs(u)) return u;
    return rel(file, (item.i18n ? prefix(lang) : '') + u.replace(/^\//, ''));
  }
  function navHtml(site, file, lang, current) {
    return (site.menu || []).map(function (m) {
      var href = linkHref(site, file, lang, m);
      var on = current && m.url === current;
      var ext = isAbs(m.url) && !/^#/.test(m.url);
      return '<a href="' + esc(href) + '"' + (on ? ' aria-current="page"' : '') + (ext ? ' rel="noopener"' : '') + '>' + esc(t(m.label, lang)) + '</a>';
    }).join('');
  }

  function head(site, o) {
    var lang = o.lang, file = o.file;
    var alt = Object.keys(o.alternates).map(function (l) {
      return '<link rel="alternate" hreflang="' + l + '" href="' + esc(absUrl(site, o.alternates[l])) + '">';
    }).join('\n');
    if (o.alternates.ar != null) alt += '\n<link rel="alternate" hreflang="x-default" href="' + esc(absUrl(site, o.alternates.ar)) + '">';
    var img = o.image ? (isAbs(o.image) ? o.image : absUrl(site, o.image)) : (site.hero && site.hero.image ? (isAbs(site.hero.image) ? site.hero.image : absUrl(site, site.hero.image)) : '');
    var ga = site.analytics ? '<script async src="https://www.googletagmanager.com/gtag/js?id=' + esc(site.analytics) + '"></script>' +
      '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","' + esc(site.analytics) + '");</script>' : '';
    var mode = th(site).mode;
    return '<!DOCTYPE html>\n<html lang="' + lang + '" dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '"' + (mode === 'dark' || mode === 'light' ? ' data-theme="' + mode + '"' : '') + '>\n<head>\n' +
      '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<title>' + esc(o.title) + '</title>\n' +
      '<meta name="description" content="' + esc(o.description) + '">\n' +
      '<meta name="robots" content="index, follow, max-image-preview:large">\n' +
      '<link rel="canonical" href="' + esc(absUrl(site, o.dir)) + '">\n' + alt + '\n' +
      '<meta property="og:type" content="' + (o.ogType || 'website') + '">\n' +
      '<meta property="og:site_name" content="' + esc(t(site.name, lang)) + '">\n' +
      '<meta property="og:title" content="' + esc(o.ogTitle || o.title) + '">\n' +
      '<meta property="og:description" content="' + esc(o.description) + '">\n' +
      '<meta property="og:url" content="' + esc(absUrl(site, o.dir)) + '">\n' +
      '<meta property="og:locale" content="' + LOCALE[lang] + '">\n' +
      (img ? '<meta property="og:image" content="' + esc(img) + '">\n<meta name="twitter:image" content="' + esc(img) + '">\n' : '') +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      (site.verification && site.verification.google ? '<meta name="google-site-verification" content="' + esc(site.verification.google) + '">\n' : '') +
      '<meta name="theme-color" content="#0b1e2d">\n' +
      iconLinks(site, file) +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      fontLink(site) + '\n' +
      '<link rel="stylesheet" href="' + rel(file, 'assets/style.css') + '?v=' + (site.version || 1) + '">\n' + themeCss(site, file) +
      '<script>document.documentElement.classList.add("js");try{var th=localStorage.getItem("ks-theme");if(th)document.documentElement.dataset.theme=th;}catch(e){}</script>\n' +
      (o.schema ? '<script type="application/ld+json">' + JSON.stringify(o.schema).replace(/</g, '\\u003c') + '</script>\n' : '') +
      ga + '</head>\n';
  }

  function header(site, o) {
    var lang = o.lang, file = o.file;
    return '<body class="lang-' + lang + (o.bodyClass ? ' ' + o.bodyClass : '') + '">\n' +
      '<a class="skip" href="#main">' + (lang === 'ar' ? 'انتقل إلى المحتوى' : lang === 'fr' ? 'Aller au contenu' : lang === 'es' ? 'Ir al contenido' : 'Skip to content') + '</a>\n' +
      topbar(site, file, lang) + '<header class="top"><div class="wrap top-in">' +
      '<a class="brand" href="' + rel(file, prefix(lang)) + '">' + brandMark(site, file) +
      '<span class="brand-txt"><b>' + esc(t(site.name, lang)) + '</b><small>' + esc(lang === 'ar' ? 'Ksar Sghir' : 'القصر الصغير') + '</small></span></a>' +
      '<nav class="nav" id="nav" aria-label="' + esc(UI[lang].menu) + '">' + navHtml(site, file, lang, o.current) + '</nav>' +
      '<div class="tools"><div class="langs" role="group" aria-label="' + UI[lang].lang + '">' + langLinks(site, file, lang, o.alternates) + '</div>' +
      '<button class="icon-btn" type="button" data-theme-toggle aria-label="' + esc(UI[lang].theme) + '">' + moonSvg() + '</button>' +
      '<button class="icon-btn menu-btn" type="button" data-menu aria-controls="nav" aria-expanded="false" aria-label="' + esc(UI[lang].menu) + '">' + menuSvg() + '</button>' +
      '</div></div></header>\n';
  }

  function footer(site, o) {
    var lang = o.lang, file = o.file;
    var cols = (site.footer || []).map(function (col) {
      return '<div class="f-col"><h2>' + esc(t(col.title, lang)) + '</h2><ul>' + (col.links || []).map(function (l) {
        return '<li><a href="' + esc(linkHref(site, file, lang, l)) + '">' + esc(t(l.label, lang)) + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var social = socialIcons(site, 'foot-soc');
    return '<footer class="foot"><div class="wrap">' +
      '<div class="f-grid"><div class="f-about"><a class="brand" href="' + rel(file, prefix(lang)) + '">' + brandMark(site, file) + '<span class="brand-txt"><b>' + esc(t(site.name, lang)) + '</b></span></a>' +
      '<p>' + esc(t(site.tagline, lang)) + '</p>' + (social ? '<div class="social" aria-label="' + esc(UI[lang].follow) + '"><span>' + esc(UI[lang].follow) + '</span>' + social + '</div>' : '') + '</div>' + cols + '</div>' +
      '<p class="copy">© ' + new Date().getFullYear() + ' ' + esc(t(site.name, lang)) + ' · ' + esc(site.owner || '') + ' · ' + esc(UI[lang].rights) + '</p>' +
      '</div></footer>\n<script src="' + rel(file, 'assets/site.js') + '?v=' + (site.version || 1) + '" defer></script>\n</body>\n</html>\n';
  }

  function brandSvg() {
    return '<svg viewBox="0 0 40 40" width="34" height="34"><circle cx="20" cy="20" r="19" fill="currentColor" opacity=".12"/>' +
      '<path d="M6 25c4-3 8-3 12 0s8 3 12 0 6-2 6-2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M8 31c4-3 8-3 12 0s8 3 12 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>' +
      '<circle cx="27" cy="14" r="5" fill="#f2a541"/></svg>';
  }
  function moonSvg() { return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'; }
  function menuSvg() { return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }

  function card(site, file, a, lang, big) {
    var x = a.i18n[lang];
    var img = a.cover ? '<img src="' + esc(asset(file, big ? sized(a.cover, 1200) : sized(a.cover, 640))) + '" alt="' + esc(x.alt || x.title) + '" loading="lazy" decoding="async" width="800" height="500">'
      : '<span class="ph" aria-hidden="true">' + brandSvg() + '</span>';
    return '<article class="card' + (big ? ' card-big' : '') + '" data-cat="' + esc(a.category) + '">' +
      '<a href="' + esc(rel(file, articleDir(a, lang))) + '"><div class="card-img ph-bg">' + img + '</div>' +
      '<div class="card-body"><span class="cat">' + esc(catLabel(site, a.category, lang)) + '</span>' +
      (big ? '<h3 class="card-title">' : '<h3 class="card-title">') + esc(x.title) + '</h3>' +
      (big ? '<p>' + esc(x.description) + '</p><span class="more">' + esc(UI[lang].read) + '</span>' : '') +
      '</div></a></article>';
  }

  function adSlot(site, key, lang) {
    var html = site.ads && site.ads[key];
    if (!html || !String(html).trim()) return '';
    return '<aside class="ad" aria-label="' + esc(UI[lang].ad) + '"><span>' + esc(UI[lang].ad) + '</span>' + html + '</aside>';
  }


  /* ---------- homepage extra sections ---------- */
  var LIVE_UI = {
    ar: { title: 'القصر الصغير الآن', weather: 'الطقس', sea: 'حالة البحر', prayer: 'مواقيت الصلاة', waves: 'الموج', water: 'حرارة الماء', wind: 'الرياح', humidity: 'الرطوبة', period: 'فترة الموج', next: 'الصلاة القادمة', approx: 'مواقيت تقريبية حسب موقع القصر الصغير', unavailable: 'غير متاح حالياً', more: 'التفاصيل',
      prayers: { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' }, seaStates: ['هادئ', 'خفيف', 'متوسط', 'هائج'],
      codes: { clear: 'صافٍ', partly: 'غائم جزئياً', cloudy: 'غائم', fog: 'ضباب', drizzle: 'رذاذ', rain: 'ممطر', snow: 'ثلج', showers: 'زخات مطر', storm: 'عاصفة رعدية' } },
    fr: { title: 'Ksar Sghir en direct', weather: 'Météo', sea: 'État de la mer', prayer: 'Horaires de prière', waves: 'Vagues', water: 'Eau', wind: 'Vent', humidity: 'Humidité', period: 'Période', next: 'Prochaine prière', approx: 'Horaires approximatifs pour Ksar Sghir', unavailable: 'Indisponible pour le moment', more: 'Détails',
      prayers: { Fajr: 'Fajr', Sunrise: 'Chourouk', Dhuhr: 'Dohr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Icha' }, seaStates: ['Calme', 'Peu agitée', 'Agitée', 'Forte'],
      codes: { clear: 'Ensoleillé', partly: 'Partiellement nuageux', cloudy: 'Nuageux', fog: 'Brouillard', drizzle: 'Bruine', rain: 'Pluie', snow: 'Neige', showers: 'Averses', storm: 'Orage' } },
    en: { title: 'Ksar Sghir right now', weather: 'Weather', sea: 'Sea conditions', prayer: 'Prayer times', waves: 'Waves', water: 'Water', wind: 'Wind', humidity: 'Humidity', period: 'Period', next: 'Next prayer', approx: 'Approximate times for Ksar Sghir', unavailable: 'Not available right now', more: 'Details',
      prayers: { Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' }, seaStates: ['Calm', 'Slight', 'Moderate', 'Rough'],
      codes: { clear: 'Clear', partly: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog', drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', showers: 'Showers', storm: 'Thunderstorm' } },
    es: { title: 'Alcazarseguer ahora', weather: 'Tiempo', sea: 'Estado del mar', prayer: 'Horarios de oración', waves: 'Olas', water: 'Agua', wind: 'Viento', humidity: 'Humedad', period: 'Periodo', next: 'Próxima oración', approx: 'Horarios aproximados para Alcazarseguer', unavailable: 'No disponible ahora', more: 'Detalles',
      prayers: { Fajr: 'Fajr', Sunrise: 'Amanecer', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' }, seaStates: ['Calma', 'Marejadilla', 'Marejada', 'Fuerte'],
      codes: { clear: 'Despejado', partly: 'Parcialmente nublado', cloudy: 'Nublado', fog: 'Niebla', drizzle: 'Llovizna', rain: 'Lluvia', snow: 'Nieve', showers: 'Chubascos', storm: 'Tormenta' } }
  };
  function liveSection(site, file, lang) {
    var w = site.live || {}, L = LIVE_UI[lang];
    var parts = [];
    var link = function (key) { var u = w[key + 'Url']; return u ? '<a class="live-more" href="' + esc(linkHref(site, file, lang, { url: u, i18n: !isAbs(u) })) + '">' + esc(L.more) + '</a>' : ''; };
    if (w.weather !== false) parts.push('<div class="live-card" data-live="weather"><div class="live-h"><h3>' + esc(L.weather) + '</h3>' + link('weather') + '</div><div class="live-body" aria-live="polite"><div class="live-skel"></div></div></div>');
    if (w.sea !== false) parts.push('<div class="live-card" data-live="sea"><div class="live-h"><h3>' + esc(L.sea) + '</h3>' + link('sea') + '</div><div class="live-body" aria-live="polite"><div class="live-skel"></div></div></div>');
    if (w.prayer !== false) parts.push('<div class="live-card" data-live="prayer"><div class="live-h"><h3>' + esc(L.prayer) + '</h3>' + link('prayer') + '</div><div class="live-body" aria-live="polite"><div class="live-skel"></div></div></div>');
    if (!parts.length) return '';
    var cfg = { off: +w.utcOffset || 0, lang: lang, lat: w.lat || 35.8426, lng: w.lng || -5.5596, seaLat: w.seaLat || 35.87, seaLng: w.seaLng || -5.55, method: w.method || 21, tune: w.tune || '', ui: L };
    return '<section class="wrap block live" aria-labelledby="live-t"><h2 class="block-title" id="live-t">' + esc(L.title) + '</h2><div class="live-grid">' + parts.join('') + '</div>' +
      '<script type="application/json" id="ks-live">' + JSON.stringify(cfg).replace(/</g, '\\u003c') + '</script></section>';
  }
  function servicesSection(site, file, lang) {
    var list = site.services || []; if (!list.length) return '';
    var S = site.servicesBlock || {};
    return '<section class="wrap block"><h2 class="block-title">' + esc(t(S.title, lang) || { ar: 'خدماتنا', fr: 'Nos services', en: 'Our services', es: 'Nuestros servicios' }[lang]) + '</h2><div class="svc-grid">' +
      list.map(function (x) {
        var ext = isAbs(x.url);
        return '<a class="svc" href="' + esc(linkHref(site, file, lang, x)) + '"' + (ext ? ' rel="noopener"' : '') + '><span class="svc-i" aria-hidden="true">' + esc(x.icon || '') + '</span><b>' + esc(t(x.title, lang)) + '</b><span>' + esc(t(x.text, lang)) + '</span></a>';
      }).join('') + '</div></section>';
  }
  function gallerySection(site, file, lang) {
    var g = site.homeGallery || {}, imgs = (g.images || []).filter(function (i) { return i && i.src; });
    if (!imgs.length) return '';
    var more = g.url ? '<a class="btn btn-ghost" href="' + esc(linkHref(site, file, lang, { url: g.url, i18n: g.i18n })) + '"' + (isAbs(g.url) ? ' rel="noopener"' : '') + '>' + esc(t(g.cta, lang) || { ar: 'عرض كل الصور', fr: 'Voir toutes les photos', en: 'See all photos', es: 'Ver todas las fotos' }[lang]) + '</a>' : '';
    return '<section class="wrap block gal-home"><div class="block-head"><div><h2 class="block-title">' + esc(t(g.title, lang) || UI[lang].gallery) + '</h2>' +
      (t(g.subtitle, lang) ? '<p class="muted-p">' + esc(t(g.subtitle, lang)) + '</p>' : '') + '</div>' + more + '</div>' +
      '<div class="gal-row">' + imgs.slice(0, 6).map(function (i) {
        var alt = t(i.alt, lang) || t(site.name, lang);
        return '<figure class="ph-bg"><img src="' + esc(asset(file, sized(i.src, 800))) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></figure>';
      }).join('') + '</div></section>';
  }
  function ratingSection(site, file, lang) {
    var r = site.rating || {}; if (r.enabled === false) return '';
    var T = { ar: ['قيّم الموقع', 'رأيك كيعاونا نحسنو الدليل.', 'شكراً على التقييم!', 'شارك رأيك على Google', 'شارك رأيك على Facebook', 'نجمة', 'نجوم'],
      fr: ['Notez le site', 'Votre avis nous aide à améliorer ce guide.', 'Merci pour votre note !', 'Laisser un avis sur Google', 'Laisser un avis sur Facebook', 'étoile', 'étoiles'],
      en: ['Rate this site', 'Your feedback helps us improve this guide.', 'Thanks for your rating!', 'Leave a review on Google', 'Leave a review on Facebook', 'star', 'stars'],
      es: ['Valora el sitio', 'Tu opinión nos ayuda a mejorar esta guía.', '¡Gracias por tu valoración!', 'Deja una reseña en Google', 'Deja una reseña en Facebook', 'estrella', 'estrellas'] }[lang];
    var btns = (r.google ? '<a class="btn" href="' + esc(r.google) + '" target="_blank" rel="noopener">' + esc(T[3]) + '</a>' : '') +
      (r.facebook ? '<a class="btn btn-ghost" href="' + esc(r.facebook) + '" target="_blank" rel="noopener">' + esc(T[4]) + '</a>' : '');
    var stars = ''; for (var i = 1; i <= 5; i++) stars += '<button type="button" data-star="' + i + '" aria-label="' + i + ' ' + (i === 1 ? T[5] : T[6]) + '">★</button>';
    return '<section class="rate"><div class="wrap rate-in"><h2 class="block-title">' + esc(t(r.title, lang) || T[0]) + '</h2><p>' + esc(t(r.text, lang) || T[1]) + '</p>' +
      '<div class="stars" role="group" aria-label="' + esc(T[0]) + '" data-rating>' + stars + '</div>' +
      '<p class="rate-thanks" hidden>' + esc(T[2]) + '</p>' + (btns ? '<div class="rate-btns">' + btns + '</div>' : '') + '</div></section>';
  }


  /* ---------- destinations map (loads Leaflet only when scrolled into view) ---------- */
  var MUI = { ar: ['خريطة الوجهات', 'كل الشواطئ والمواقع حول القصر الصغير. اضغط على نقطة لتفتح الموضوع.', 'اقرأ الموضوع', 'تحميل الخريطة…'],
    fr: ['Carte des destinations', 'Toutes les plages et sites autour de Ksar Sghir. Touchez un point pour ouvrir l’article.', 'Lire l’article', 'Chargement de la carte…'],
    en: ['Destinations map', 'All the beaches and sites around Ksar Sghir. Tap a pin to open the article.', 'Read more', 'Loading map…'],
    es: ['Mapa de destinos', 'Todas las playas y lugares alrededor de Alcazarseguer. Toca un punto para abrir el artículo.', 'Leer más', 'Cargando mapa…'] };
  var CAT_COLORS = { beach: '#00b4d8', port: '#0b5f8a', nature: '#2f9e44', history: '#c2410c' };
  function mapSection(site, articles, file, lang) {
    var list = tourism(articles, lang).filter(function (a) { return a.lat != null && a.lng != null && !isNaN(a.lat); });
    if (!list.length) return '';
    var T = MUI[lang], m = site.map || {};
    var pts = list.map(function (a) {
      var c = category(site, a.category);
      return { t: a.i18n[lang].title, u: rel(file, articleDir(a, lang)), la: +a.lat, ln: +a.lng, i: c.icon || '📍', c: CAT_COLORS[a.category] || '#00b4d8', k: t(c.name, lang), img: a.cover ? asset(file, sized(a.cover, 640)) : '' };
    });
    var cats = (site.categories || []).filter(function (c) { return list.some(function (a) { return a.category === c.id; }); });
    return '<section class="wrap block dmap"><h2 class="block-title">' + esc(t(m.title, lang) || T[0]) + '</h2><p class="muted-p">' + esc(t(m.text, lang) || T[1]) + '</p>' +
      '<div class="dmap-box" id="dmap" data-read="' + esc(T[2]) + '"><span class="dmap-load">' + esc(T[3]) + '</span></div>' +
      '<div class="dmap-legend">' + cats.map(function (c) { return '<span><i style="background:' + (CAT_COLORS[c.id] || '#00b4d8') + '"></i>' + esc((c.icon || '') + ' ' + t(c.name, lang)) + '</span>'; }).join('') + '</div>' +
      '<script type="application/json" id="ks-map">' + JSON.stringify(pts).replace(/</g, '\\u003c') + '</script></section>';
  }

  /* ---------- pages ---------- */
  function homePage(site, articles, lang) {
    var file = prefix(lang) + 'index.html', dir = prefix(lang);
    var alternates = {}; LANGS.forEach(function (l) { alternates[l] = prefix(l); });
    var list = tourism(articles, lang);
    var feat = list.filter(function (a) { return a.slug === site.featured; })[0] || list.filter(function (a) { return a.featured; })[0] || list[0];
    var rest = list.filter(function (a) { return a !== feat; }).slice(0, 6);
    var h = site.hero || {};
    var title = t(h.seoTitle, lang) || (t(site.name, lang) + ' | ' + t(site.tagline, lang));
    var schema = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebSite', name: t(site.name, lang), alternateName: PLACE_NAMES, url: absUrl(site, dir), inLanguage: lang },
      { '@type': 'TouristDestination', name: t(site.name, lang), alternateName: PLACE_NAMES, description: t(h.subtitle, lang),
        url: absUrl(site, dir), geo: { '@type': 'GeoCoordinates', latitude: 35.8426, longitude: -5.5596 },
        containedInPlace: { '@type': 'Country', name: 'Morocco' },
        includesAttraction: list.slice(0, 20).map(function (a) { return { '@type': 'TouristAttraction', name: a.i18n[lang].title, url: absUrl(site, articleDir(a, lang)) }; }) }
    ] };
    var cats = (site.categories || []).filter(function (c) { return list.some(function (a) { return a.category === c.id; }); });
    var stats = (site.stats || []).map(function (s) { return '<div class="stat"><b>' + esc(s.value) + '</b><span>' + esc(t(s.label, lang)) + '</span></div>'; }).join('');
    var o = { lang: lang, file: file, dir: dir, alternates: alternates, current: '', title: title, description: t(h.description, lang) || t(h.subtitle, lang), image: h.image, schema: schema, bodyClass: 'is-home' };
    return head(site, o) + header(site, o) +
      '<main id="main">' +
      (function () {
        var imgs = heroImages(site);
        var style = imgs[0] ? ' style="--hero:url(\'' + esc(asset(file, imgs[0])) + '\')"' : '';
        var slides = imgs.length > 1 ? '<div class="hero-slides" aria-hidden="true">' + imgs.map(function (src, i) {
          return '<img ' + (i ? 'data-src' : 'src') + '="' + esc(asset(file, src)) + '" alt=""' + (i ? '' : ' class="on" fetchpriority="high"') + ' decoding="async">';
        }).join('') + '</div>' : '';
        return '<section class="hero' + (slides ? ' has-slides' : '') + '"' + style + '>' + slides + '<div class="wrap hero-in">';
      })() +
      '<h1>' + esc(t(h.title, lang) || t(site.name, lang)) + '</h1>' +
      '<p class="hero-sub">' + esc(t(h.subtitle, lang)) + '</p>' +
      '<a class="btn" href="' + rel(file, prefix(lang) + 'tourisme/') + '">' + esc(t(h.cta, lang) || UI[lang].explore) + '</a>' +
      '</div><svg class="wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40c160-30 320-30 480 0s320 30 480 0 320-30 480 0v40H0z"/></svg></section>' +
      (show(site, 'live') ? liveSection(site, file, lang) : '') +
      adSlot(site, 'top', lang) +
      (show(site, 'intro') && t(site.intro, lang) ? '<section class="wrap intro prose">' + t(site.intro, lang) + '</section>' : '') +
      (show(site, 'video') ? homeVideo(site, lang) : '') +
      (show(site, 'featured') && feat ? '<section class="wrap block"><h2 class="block-title">' + esc(UI[lang].featured) + '</h2>' + card(site, file, feat, lang, true) + '</section>' : '') +
      (show(site, 'latest') && rest.length ? '<section class="wrap block"><div class="block-head"><h2 class="block-title">' + esc(UI[lang].latest) + '</h2><a href="' + rel(file, prefix(lang) + 'tourisme/') + '">' + esc(UI[lang].allTourism) + '</a></div>' +
        '<div class="grid">' + rest.map(function (a) { return card(site, file, a, lang); }).join('') + '</div></section>' : '') +
      (show(site, 'map') ? mapSection(site, articles, file, lang) : '') +
      (show(site, 'gallery') ? gallerySection(site, file, lang) : '') +
      (show(site, 'services') ? servicesSection(site, file, lang) : '') +
      (show(site, 'categories') && cats.length ? '<section class="wrap block"><div class="chips">' + cats.map(function (c) {
        return '<a class="chip" href="' + rel(file, prefix(lang) + 'tourisme/') + '#' + esc(c.id) + '">' + esc((c.icon || '') + ' ' + t(c.name, lang)) + '</a>';
      }).join('') + '</div></section>' : '') +
      (show(site, 'stats') && stats ? '<section class="stats"><div class="wrap stats-in">' + stats + '</div></section>' : '') +
      (show(site, 'rating') ? ratingSection(site, file, lang) : '') +
      '</main>\n' + footer(site, o);
  }

  function tourismPage(site, articles, lang) {
    var file = prefix(lang) + 'tourisme/index.html', dir = prefix(lang) + 'tourisme/';
    var alternates = {}; LANGS.forEach(function (l) { alternates[l] = prefix(l) + 'tourisme/'; });
    var list = tourism(articles, lang);
    var cats = (site.categories || []).filter(function (c) { return list.some(function (a) { return a.category === c.id; }); });
    var tp = site.tourismPage || {};
    var h1 = t(tp.title, lang) || (UI[lang].tourism + ' — ' + t(site.name, lang));
    var o = { lang: lang, file: file, dir: dir, alternates: alternates, current: 'tourisme/', title: t(tp.seoTitle, lang) || h1,
      description: t(tp.description, lang) || UI[lang].tourismIntro, image: list[0] && list[0].cover,
      schema: { '@context': 'https://schema.org', '@type': 'ItemList', name: h1, itemListElement: list.map(function (a, i) {
        return { '@type': 'ListItem', position: i + 1, url: absUrl(site, articleDir(a, lang)), name: a.i18n[lang].title }; }) } };
    return head(site, o) + header(site, o) +
      '<main id="main" class="wrap page">' + crumbs(site, file, lang, [[UI[lang].home, prefix(lang)], [UI[lang].tourism]]) +
      '<h1 class="page-title">' + esc(h1) + '</h1><p class="lead">' + esc(t(tp.description, lang) || UI[lang].tourismIntro) + '</p>' +
      (cats.length > 1 ? '<div class="chips" role="group" data-filter><button class="chip is-on" type="button" data-cat="">' + esc(UI[lang].filterAll) + '</button>' +
        cats.map(function (c) { return '<button class="chip" type="button" data-cat="' + esc(c.id) + '">' + esc((c.icon || '') + ' ' + t(c.name, lang)) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="grid" data-grid>' + list.map(function (a) { return card(site, file, a, lang); }).join('') + '</div>' +
      adSlot(site, 'bottom', lang) + '</main>\n' + footer(site, o);
  }

  function crumbs(site, file, lang, items) {
    return '<nav class="crumbs" aria-label="breadcrumb"><ol>' + items.map(function (it) {
      return '<li>' + (it[1] != null ? '<a href="' + esc(rel(file, it[1])) + '">' + esc(it[0]) + '</a>' : '<span aria-current="page">' + esc(it[0]) + '</span>') + '</li>';
    }).join('') + '</ol></nav>';
  }

  function seoTitle(site, a, lang) {
    var x = a.i18n[lang];
    if (x.seoTitle) return x.seoTitle;
    var tail = { ar: 'القصر الصغير', fr: 'Ksar Sghir, Maroc', en: 'Ksar Sghir, Morocco', es: 'Alcazarseguer, Marruecos' }[lang];
    return x.title + ' | ' + tail;
  }

  function articlePage(site, articles, a, lang) {
    var x = a.i18n[lang], file = articleFile(a, lang), dir = articleDir(a, lang);
    var alternates = {}; LANGS.forEach(function (l) { if (hasLang(a, l)) alternates[l] = articleDir(a, l); });
    var isPage = a.section === 'page';
    var body = withToc(fixContentPaths(file, x.content));
    var rel4 = isPage ? [] : relatedFor(a, articles, lang);
    var url = absUrl(site, dir);
    var cover = a.cover ? (isAbs(a.cover) ? a.cover : absUrl(site, a.cover)) : undefined;
    var graph = [{ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: UI[lang].home, item: absUrl(site, prefix(lang)) }
    ].concat(isPage ? [{ '@type': 'ListItem', position: 2, name: x.title, item: url }] : [
      { '@type': 'ListItem', position: 2, name: UI[lang].tourism, item: absUrl(site, prefix(lang) + 'tourisme/') },
      { '@type': 'ListItem', position: 3, name: x.title, item: url }]) }];
    if (!isPage) {
      var place = { '@type': a.category === 'beach' ? ['TouristAttraction', 'Beach'] : 'TouristAttraction', name: x.title, description: x.description, url: url,
        image: cover, inLanguage: lang, containedInPlace: { '@type': 'City', name: t(site.name, lang), alternateName: PLACE_NAMES, containedInPlace: { '@type': 'Country', name: 'Morocco' } } };
      if (a.lat != null) place.geo = { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng };
      graph.push(place);
      graph.push({ '@type': 'Article', headline: x.title, description: x.description, image: cover, inLanguage: lang,
        datePublished: a.date, dateModified: a.updated || a.date, author: { '@type': 'Person', name: site.owner || '' },
        publisher: { '@type': 'Organization', name: t(site.name, lang) }, mainEntityOfPage: url });
    }
    var o = { lang: lang, file: file, dir: dir, alternates: alternates, current: isPage ? a.slug + '/' : 'tourisme/', title: seoTitle(site, a, lang),
      ogTitle: x.title, description: x.description, image: a.cover, ogType: 'article', schema: { '@context': 'https://schema.org', '@graph': graph } };
    var shareUrl = encodeURIComponent(url);
    var gallery = (a.gallery || []).filter(function (g) { return g && g.src; });
    return head(site, o) + header(site, o) +
      '<main id="main" class="page">' +
      '<div class="wrap narrow">' + crumbs(site, file, lang, isPage ? [[UI[lang].home, prefix(lang)], [x.title]] :
        [[UI[lang].home, prefix(lang)], [UI[lang].tourism, prefix(lang) + 'tourisme/'], [x.title]]) +
      (isPage ? '' : '<span class="cat">' + esc(catLabel(site, a.category, lang)) + '</span>') +
      '<h1 class="page-title">' + esc(x.title) + '</h1>' +
      (x.description ? '<p class="lead">' + esc(x.description) + '</p>' : '') +
      (isPage ? '' : '<p class="meta"><time datetime="' + esc(a.updated || a.date) + '">' + esc(UI[lang].updated + ': ' + (a.updated || a.date)) + '</time></p>') +
      '</div>' +
      (a.cover ? '<figure class="cover wrap ph-bg"><img src="' + esc(asset(file, a.cover)) + '" alt="' + esc(x.alt || x.title) + '" width="1400" height="780" fetchpriority="high"></figure>' : '') +
      '<div class="wrap narrow">' +
      (body.toc.length > 2 ? '<nav class="toc" aria-label="' + esc(UI[lang].toc) + '"><h2>' + esc(UI[lang].toc) + '</h2><ol>' +
        body.toc.map(function (i) { return '<li><a href="#' + esc(i.id) + '">' + esc(i.text) + '</a></li>'; }).join('') + '</ol></nav>' : '') +
      adSlot(site, 'top', lang) +
      '<div class="prose">' + body.html + '</div>' +
      (a.video && ytId(a.video) ? '<section class="video"><h2>' + esc({ ar: 'فيديو', fr: 'Vidéo', en: 'Video', es: 'Vídeo' }[lang]) + '</h2>' + ytBlock(a.video, x.title, lang) + '</section>' : '') +
      (gallery.length ? '<section class="gallery"><h2>' + esc(UI[lang].gallery) + '</h2><div class="gal" data-lb-group>' + gallery.map(function (g) {
        var alt = (g.alt && t(g.alt, lang)) || x.title, cap = g.caption && t(g.caption, lang);
        return '<a class="ph-bg" href="' + esc(asset(file, sized(g.src, 2048))) + '" data-lb' + (cap ? ' data-caption="' + esc(cap) + '"' : '') + '><img src="' + esc(asset(file, sized(g.src, 640))) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></a>';
      }).join('') + '</div></section>' : '') +
      ((a.map || a.lat != null) ? '<section class="map"><h2>' + esc(UI[lang].map) + '</h2><div class="map-box"><iframe src="' + esc(a.map || ('https://maps.google.com/maps?q=' + a.lat + ',' + a.lng + '&z=15&output=embed')) + '" loading="lazy" title="' + esc(x.title) + '" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></section>' : '') +
      adSlot(site, 'bottom', lang) +
      '<section class="share"><h2>' + esc(UI[lang].share) + '</h2><div>' +
      '<a class="sh sh-wa" href="https://wa.me/?text=' + encodeURIComponent(x.title + ' ') + shareUrl + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a class="sh sh-fb" href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '" target="_blank" rel="noopener">Facebook</a>' +
      '<button class="sh sh-cp" type="button" data-copy="' + esc(url) + '">' + (lang === 'ar' ? 'نسخ الرابط' : lang === 'fr' ? 'Copier le lien' : lang === 'es' ? 'Copiar enlace' : 'Copy link') + '</button>' +
      '</div></section></div>' +
      (rel4.length ? '<section class="related"><div class="wrap"><h2 class="block-title">' + esc(UI[lang].related) + '</h2><div class="grid grid-4">' +
        rel4.map(function (r) { return card(site, file, r, lang); }).join('') + '</div></div></section>' : '') +
      '</main>\n' + footer(site, o);
  }

  function sitemap(site, articles, files) {
    var urls = [];
    function add(dirs, lastmod) {
      Object.keys(dirs).forEach(function (l) {
        urls.push('<url><loc>' + esc(absUrl(site, dirs[l])) + '</loc>' + (lastmod ? '<lastmod>' + lastmod + '</lastmod>' : '') +
          Object.keys(dirs).map(function (k) { return '<xhtml:link rel="alternate" hreflang="' + k + '" href="' + esc(absUrl(site, dirs[k])) + '"/>'; }).join('') +
          (dirs.ar != null ? '<xhtml:link rel="alternate" hreflang="x-default" href="' + esc(absUrl(site, dirs.ar)) + '"/>' : '') + '</url>');
      });
    }
    var today = new Date().toISOString().slice(0, 10);
    var home = {}, tour = {}; LANGS.forEach(function (l) { home[l] = prefix(l); tour[l] = prefix(l) + 'tourisme/'; });
    add(home, today); add(tour, today);
    ['gallery/', 'meteo/', 'salat/'].forEach(function (d) {
      if (!files || !files[d + 'index.html']) return;
      var m = {}; LANGS.forEach(function (l) { m[l] = prefix(l) + d; }); add(m, today);
    });
    published(articles).forEach(function (a) {
      var d = {}; LANGS.forEach(function (l) { if (hasLang(a, l)) d[l] = articleDir(a, l); });
      add(d, a.updated || a.date);
    });
    (site.extraUrls || []).filter(function (u) { return !files || !files[u + 'index.html']; }).forEach(function (u) { urls.push('<url><loc>' + esc(absUrl(site, u)) + '</loc></url>'); });
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls.join('\n') + '\n</urlset>\n';
  }


  /* ---------- gallery, weather and prayer pages ---------- */
  function simplePage(site, lang, dirNoLang, o2) {
    var dir = prefix(lang) + dirNoLang, file = dir + 'index.html';
    var alternates = {}; LANGS.forEach(function (l) { alternates[l] = prefix(l) + dirNoLang; });
    var o = { lang: lang, file: file, dir: dir, alternates: alternates, current: dirNoLang, title: o2.title, description: o2.description, image: o2.image, schema: o2.schema, bodyClass: o2.bodyClass };
    return head(site, o) + header(site, o) + '<main id="main" class="page ' + (o2.mainClass || '') + '"><div class="wrap">' +
      crumbs(site, file, lang, [[UI[lang].home, prefix(lang)], [o2.h1]]) + '<h1 class="page-title">' + esc(o2.h1) + '</h1>' +
      (o2.lead ? '<p class="lead">' + esc(o2.lead) + '</p>' : '') + '</div>' + o2.body(file) + '</main>\n' +
      (o2.scripts ? o2.scripts(file) : '') + footer(site, o);
  }

  var GUI = {
    ar: { all: 'الكل', photos: 'صورة' }, fr: { all: 'Tout', photos: 'photos' }, en: { all: 'All', photos: 'photos' }, es: { all: 'Todo', photos: 'fotos' }
  };
  function galleryPage(site, gallery, lang) {
    var g = gallery || {}, cats = g.categories || [], photos = (g.photos || []).filter(function (p) { return p && p.src; });
    var name = t(site.name, lang);
    var catName = function (id) { var c = cats.filter(function (x) { return x.id === id; })[0]; return c ? t(c.name, lang) : ''; };
    var h1 = t(g.title, lang) || UI[lang].gallery;
    return simplePage(site, lang, 'gallery/', {
      h1: h1, title: h1 + ' | ' + name, description: t(g.intro, lang) || h1, lead: t(g.intro, lang), image: photos[0] && sized(photos[0].src, 1200), mainClass: 'gallery-page',
      schema: { '@context': 'https://schema.org', '@type': 'ImageGallery', name: h1, description: t(g.intro, lang),
        image: photos.slice(0, 60).map(function (p) { return { '@type': 'ImageObject', contentUrl: isAbs(p.src) ? sized(p.src, 1600) : absUrl(site, p.src), caption: t(p.caption, lang) || t(p.alt, lang) || (catName(p.cat) + ' — ' + name), creator: { '@type': 'Person', name: site.owner || '' } }; }) },
      body: function (file) {
        var used = cats.filter(function (c) { return photos.some(function (p) { return p.cat === c.id; }); });
        return '<div class="wrap">' + (used.length > 1 ? '<div class="chips" role="group" data-filter><button class="chip is-on" type="button" data-cat="">' + esc(GUI[lang].all) + ' <small>' + photos.length + '</small></button>' +
          used.map(function (c) { var n = photos.filter(function (p) { return p.cat === c.id; }).length; return '<button class="chip" type="button" data-cat="' + esc(c.id) + '">' + esc(t(c.name, lang)) + ' <small>' + n + '</small></button>'; }).join('') + '</div>' : '') +
          '<div class="glry" data-grid data-lb-group>' + photos.map(function (p) {
            var alt = t(p.alt, lang) || t(p.caption, lang) || (catName(p.cat) + ' — ' + name), cap = t(p.caption, lang);
            return '<a class="card ph-bg" data-cat="' + esc(p.cat || '') + '" href="' + esc(asset(file, sized(p.src, 2048))) + '" data-lb' + (cap ? ' data-caption="' + esc(cap) + '"' : '') + '>' +
              '<img src="' + esc(asset(file, sized(p.src, 640))) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">' + (cap ? '<span class="glry-cap">' + esc(cap) + '</span>' : '') + '</a>';
          }).join('') + '</div></div>';
      }
    });
  }

  var WUI = {
    ar: { h1: 'الطقس في القصر الصغير', lead: 'حالة الطقس الآن، التوقعات كل 3 ساعات و7 أيام، حالة البحر، المد والجزر، الشمس والقمر في القصر الصغير.', now: 'الطقس الآن', today: 'اليوم ساعة بساعة', week: 'توقعات 7 أيام', sea: 'حالة البحر', sun: 'الشمس والقمر', tide: 'المد والجزر', map: 'خريطة الرياح والأمطار',
      feels: 'المحسوسة', clouds: 'السحب', pressure: 'الضغط الجوي', wind: 'سرعة الرياح', gusts: 'الهبات', dir: 'اتجاه الرياح', rain: 'التساقطات', humidity: 'الرطوبة', uv: 'الأشعة فوق البنفسجية', sunrise: 'شروق الشمس', sunset: 'غروب الشمس', moonrise: 'طلوع القمر', moonset: 'أفول القمر', phase: 'طور القمر', illum: 'الإضاءة', updated: 'آخر تحديث',
      waves: 'علو الموج', period: 'فترة الموج', water: 'حرارة الماء', swim: 'السباحة', fish: 'الصيد', high: 'مد عالٍ', low: 'جزر', details: 'تفاصيل', close: 'إغلاق', rainProb: 'احتمال المطر',
      good: 'مناسب', fair: 'مقبول بحذر', bad: 'غير مناسب', tideNote: 'أوقات المد والجزر تقديرية من نموذج بحري، ولا تصلح للملاحة.', safety: 'مؤشرات السباحة والصيد إرشادية فقط. اتبع دائماً تعليمات المنقذين والرايات على الشاطئ.', source: 'البيانات: Open-Meteo. الخريطة: Windy.', loading: 'جاري التحميل…', error: 'تعذر تحميل البيانات حالياً.',
      phases: ['محاق', 'هلال متزايد', 'تربيع أول', 'أحدب متزايد', 'بدر', 'أحدب متناقص', 'تربيع أخير', 'هلال متناقص'],
      about: '<h2>الطقس وحالة البحر في القصر الصغير</h2><p>تقع القصر الصغير على الضفة الجنوبية لمضيق جبل طارق، حيث تتأثر الأحوال الجوية كثيراً برياح الشرقي (Levante) ورياح الغربي. عندما تهب رياح الشرقي القوية يرتفع الموج على الشاطئ، بينما تكون أيام الغربي عادة أهدأ للسباحة. تابع هذه الصفحة قبل زيارة الشاطئ أو الخروج للصيد.</p>' },
    fr: { h1: 'Météo à Ksar Sghir', lead: 'Météo actuelle, prévisions heure par heure et sur 7 jours, état de la mer, marées, soleil et lune à Ksar Sghir.', now: 'Météo actuelle', today: 'Aujourd’hui heure par heure', week: 'Prévisions 7 jours', sea: 'État de la mer', sun: 'Soleil et lune', tide: 'Marées', map: 'Carte des vents et de la pluie',
      feels: 'Ressenti', clouds: 'Nuages', pressure: 'Pression', wind: 'Vent', gusts: 'Rafales', dir: 'Direction', rain: 'Précipitations', humidity: 'Humidité', uv: 'Indice UV', sunrise: 'Lever du soleil', sunset: 'Coucher du soleil', moonrise: 'Lever de lune', moonset: 'Coucher de lune', phase: 'Phase', illum: 'Illumination', updated: 'Mis à jour',
      waves: 'Vagues', period: 'Période', water: 'Température de l’eau', swim: 'Baignade', fish: 'Pêche', high: 'Pleine mer', low: 'Basse mer', details: 'Détails', close: 'Fermer', rainProb: 'Risque de pluie',
      good: 'Favorable', fair: 'Prudence', bad: 'Déconseillé', tideNote: 'Horaires de marée estimés par un modèle marin, non utilisables pour la navigation.', safety: 'Indicateurs de baignade et de pêche donnés à titre indicatif. Respectez toujours les drapeaux et les sauveteurs.', source: 'Données : Open-Meteo. Carte : Windy.', loading: 'Chargement…', error: 'Impossible de charger les données pour le moment.',
      phases: ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'],
      about: '<h2>Météo et état de la mer à Ksar Sghir</h2><p>Ksar Sghir se trouve sur la rive sud du détroit de Gibraltar, où la météo dépend beaucoup du vent d’est (Levante) et du vent d’ouest (Poniente). Quand le Levante souffle fort, la mer se forme sur la plage ; les jours de Poniente sont souvent plus calmes pour la baignade.</p>' },
    en: { h1: 'Ksar Sghir weather', lead: 'Current weather, hourly and 7-day forecast, sea conditions, tides, sun and moon in Ksar Sghir, Morocco.', now: 'Current weather', today: 'Today hour by hour', week: '7-day forecast', sea: 'Sea conditions', sun: 'Sun and moon', tide: 'Tides', map: 'Wind and rain map',
      feels: 'Feels like', clouds: 'Clouds', pressure: 'Pressure', wind: 'Wind', gusts: 'Gusts', dir: 'Direction', rain: 'Precipitation', humidity: 'Humidity', uv: 'UV index', sunrise: 'Sunrise', sunset: 'Sunset', moonrise: 'Moonrise', moonset: 'Moonset', phase: 'Moon phase', illum: 'Illumination', updated: 'Updated',
      waves: 'Waves', period: 'Period', water: 'Water temperature', swim: 'Swimming', fish: 'Fishing', high: 'High tide', low: 'Low tide', details: 'Details', close: 'Close', rainProb: 'Chance of rain',
      good: 'Good', fair: 'Use caution', bad: 'Not advised', tideNote: 'Tide times are estimated from a marine model and are not for navigation.', safety: 'Swimming and fishing indicators are for guidance only. Always follow lifeguards and beach flags.', source: 'Data: Open-Meteo. Map: Windy.', loading: 'Loading…', error: 'Could not load data right now.',
      phases: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],
      about: '<h2>Weather and sea conditions in Ksar Sghir</h2><p>Ksar Sghir sits on the southern shore of the Strait of Gibraltar, where the weather depends heavily on the easterly Levante and the westerly Poniente. Strong Levante days bring waves to the beach, while Poniente days are often calmer for swimming.</p>' },
    es: { h1: 'El tiempo en Alcazarseguer', lead: 'Tiempo actual, previsión por horas y a 7 días, estado del mar, mareas, sol y luna en Alcazarseguer (Ksar Sghir).', now: 'Tiempo actual', today: 'Hoy por horas', week: 'Previsión 7 días', sea: 'Estado del mar', sun: 'Sol y luna', tide: 'Mareas', map: 'Mapa de viento y lluvia',
      feels: 'Sensación', clouds: 'Nubes', pressure: 'Presión', wind: 'Viento', gusts: 'Rachas', dir: 'Dirección', rain: 'Precipitación', humidity: 'Humedad', uv: 'Índice UV', sunrise: 'Amanecer', sunset: 'Atardecer', moonrise: 'Salida de la luna', moonset: 'Puesta de la luna', phase: 'Fase lunar', illum: 'Iluminación', updated: 'Actualizado',
      waves: 'Olas', period: 'Periodo', water: 'Temperatura del agua', swim: 'Baño', fish: 'Pesca', high: 'Pleamar', low: 'Bajamar', details: 'Detalles', close: 'Cerrar', rainProb: 'Prob. de lluvia',
      good: 'Favorable', fair: 'Precaución', bad: 'No recomendado', tideNote: 'Horas de marea estimadas por un modelo marino; no aptas para la navegación.', safety: 'Indicadores de baño y pesca orientativos. Sigue siempre a los socorristas y las banderas.', source: 'Datos: Open-Meteo. Mapa: Windy.', loading: 'Cargando…', error: 'No se pudieron cargar los datos ahora.',
      phases: ['Luna nueva', 'Creciente', 'Cuarto creciente', 'Gibosa creciente', 'Luna llena', 'Gibosa menguante', 'Cuarto menguante', 'Menguante'],
      about: '<h2>Tiempo y estado del mar en Alcazarseguer</h2><p>Alcazarseguer está en la orilla sur del estrecho de Gibraltar, donde el tiempo depende mucho del Levante y del Poniente. Con Levante fuerte se forma mar en la playa; los días de Poniente suelen ser más tranquilos para el baño.</p>' }
  };
  function toolScript(site, file, cfg) {
    return '<script type="application/json" id="ks-tool">' + JSON.stringify(cfg).replace(/</g, '\\u003c') + '</script>\n<script src="' + rel(file, 'assets/tools.js') + '?v=' + (site.version || 1) + '" defer></script>\n';
  }
  function weatherPage(site, lang) {
    var U = WUI[lang], w = site.live || {}, L = LIVE_UI[lang];
    var cfg = { off: +w.utcOffset || 0, tool: 'weather', lang: lang, lat: w.lat || 35.8426, lng: w.lng || -5.5596, seaLat: w.seaLat || 35.87, seaLng: w.seaLng || -5.55, ui: U, codes: L.codes, seaStates: L.seaStates };
    var sec = function (id, title, inner) { return '<section class="wx-sec" id="' + id + '"><h2>' + esc(title) + '</h2>' + inner + '</section>'; };
    return simplePage(site, lang, 'meteo/', {
      h1: U.h1, title: U.h1 + ' | ' + t(site.name, lang), description: U.lead, lead: U.lead, mainClass: 'tool-page',
      schema: { '@context': 'https://schema.org', '@type': 'WebPage', name: U.h1, description: U.lead, about: { '@type': 'Place', name: t(site.name, lang), geo: { '@type': 'GeoCoordinates', latitude: cfg.lat, longitude: cfg.lng } } },
      body: function () {
        return '<div class="wrap tool" data-tool="weather">' +
          sec('wx-now', U.now, '<div class="wx-now" data-slot="now"><div class="live-skel"></div></div>') +
          sec('wx-hours', U.today, '<div class="wx-hours" data-slot="hours"><div class="live-skel"></div></div>') +
          sec('wx-week', U.week, '<div class="wx-week" data-slot="week"><div class="live-skel"></div></div>') +
          '<div class="wx-two">' + sec('wx-sea', U.sea, '<div data-slot="sea"><div class="live-skel"></div></div><p class="live-note">' + esc(U.safety) + '</p>') +
          sec('wx-sun', U.sun, '<div data-slot="sun"><div class="live-skel"></div></div>') + '</div>' +
          sec('wx-tide', U.tide, '<div data-slot="tide"><div class="live-skel"></div></div><p class="live-note">' + esc(U.tideNote) + '</p>') +
          sec('wx-map', U.map, '<div class="wx-map"><iframe loading="lazy" title="' + esc(U.map) + '" src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=8&overlay=wind&product=ecmwf&level=surface&lat=' + cfg.lat + '&lon=' + cfg.lng + '&message=true"></iframe></div>') +
          '<div class="prose wx-about">' + U.about + '</div><p class="live-note">' + esc(U.source) + '</p></div>';
      },
      scripts: function (file) { return toolScript(site, file, cfg); }
    });
  }

  var PUI = {
    ar: { h1: 'مواقيت الصلاة في القصر الصغير', lead: 'مواقيت الأذان اليوم في القصر الصغير، الصلاة القادمة، التاريخ الهجري، اتجاه القبلة وجدول الشهر كاملاً للتحميل.', next: 'الصلاة القادمة', remaining: 'متبقي', month: 'جدول الشهر', print: 'تحميل / طباعة PDF', prev: 'الشهر السابق', nextM: 'الشهر التالي', qibla: 'اتجاه القبلة', qiblaTxt: 'درجة من الشمال (باتجاه الشرق تقريباً)', day: 'اليوم', hijri: 'الهجري', date: 'الميلادي',
      note: 'المواقيت محسوبة فلكياً بطريقة المغرب، وقد تختلف بدقيقة أو اثنتين عن مواقيت وزارة الأوقاف والشؤون الإسلامية. التاريخ الهجري الرسمي بالمغرب يعتمد على رؤية الهلال.', loading: 'جاري التحميل…', error: 'تعذر تحميل المواقيت حالياً.', days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      about: '<h2>مواقيت الصلاة بالقصر الصغير</h2><p>تعرض هذه الصفحة مواقيت الفجر والشروق والظهر والعصر والمغرب والعشاء في القصر الصغير بإقليم الفحص أنجرة، مع جدول شهري يمكن طباعته أو حفظه بصيغة PDF.</p>' },
    fr: { h1: 'Horaires de prière à Ksar Sghir', lead: 'Heures de prière du jour à Ksar Sghir, prochaine prière, date de l’Hégire, direction de la Qibla et calendrier mensuel à télécharger.', next: 'Prochaine prière', remaining: 'dans', month: 'Calendrier du mois', print: 'Télécharger / imprimer PDF', prev: 'Mois précédent', nextM: 'Mois suivant', qibla: 'Direction de la Qibla', qiblaTxt: 'degrés depuis le nord (vers l’est)', day: 'Jour', hijri: 'Hégire', date: 'Date',
      note: 'Horaires calculés selon la méthode marocaine ; ils peuvent différer d’une ou deux minutes des horaires officiels du ministère des Habous. La date officielle de l’Hégire au Maroc dépend de l’observation du croissant.', loading: 'Chargement…', error: 'Impossible de charger les horaires.', days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      about: '<h2>Heures de prière à Ksar Sghir</h2><p>Cette page affiche les horaires de Fajr, Chourouk, Dohr, Asr, Maghrib et Icha à Ksar Sghir (province de Fahs-Anjra), avec un calendrier mensuel imprimable.</p>' },
    en: { h1: 'Prayer times in Ksar Sghir', lead: 'Today’s prayer times in Ksar Sghir, next prayer, Hijri date, Qibla direction and a printable monthly timetable.', next: 'Next prayer', remaining: 'in', month: 'Monthly timetable', print: 'Download / print PDF', prev: 'Previous month', nextM: 'Next month', qibla: 'Qibla direction', qiblaTxt: 'degrees from north (roughly east)', day: 'Day', hijri: 'Hijri', date: 'Date',
      note: 'Times are calculated with the Moroccan method and may differ by a minute or two from the official Ministry of Habous times. The official Hijri date in Morocco depends on moon sighting.', loading: 'Loading…', error: 'Could not load prayer times.', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      about: '<h2>Prayer times in Ksar Sghir</h2><p>This page shows Fajr, Sunrise, Dhuhr, Asr, Maghrib and Isha times in Ksar Sghir (Fahs-Anjra province), with a printable monthly timetable.</p>' },
    es: { h1: 'Horarios de oración en Alcazarseguer', lead: 'Horarios de oración de hoy en Alcazarseguer, próxima oración, fecha de la Hégira, dirección de la Qibla y calendario mensual para descargar.', next: 'Próxima oración', remaining: 'en', month: 'Calendario del mes', print: 'Descargar / imprimir PDF', prev: 'Mes anterior', nextM: 'Mes siguiente', qibla: 'Dirección de la Qibla', qiblaTxt: 'grados desde el norte (hacia el este)', day: 'Día', hijri: 'Hégira', date: 'Fecha',
      note: 'Horarios calculados con el método marroquí; pueden variar uno o dos minutos respecto a los oficiales del Ministerio de Habices. La fecha oficial de la Hégira en Marruecos depende de la observación de la luna.', loading: 'Cargando…', error: 'No se pudieron cargar los horarios.', days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      about: '<h2>Horarios de oración en Alcazarseguer</h2><p>Esta página muestra los horarios de Fajr, Amanecer, Dhuhr, Asr, Maghrib e Isha en Alcazarseguer (provincia de Fahs-Anjra), con un calendario mensual imprimible.</p>' }
  };
  function prayerPage(site, lang) {
    var U = PUI[lang], w = site.live || {}, L = LIVE_UI[lang];
    var cfg = { off: +w.utcOffset || 0, tool: 'prayer', lang: lang, lat: w.lat || 35.8426, lng: w.lng || -5.5596, method: w.method || 21, tune: w.tune || '', hijriAdj: w.hijriAdj || 0, ui: U, prayers: L.prayers, place: t(site.name, lang) };
    return simplePage(site, lang, 'salat/', {
      h1: U.h1, title: U.h1 + ' | ' + t(site.name, lang), description: U.lead, lead: U.lead, mainClass: 'tool-page',
      schema: { '@context': 'https://schema.org', '@type': 'WebPage', name: U.h1, description: U.lead },
      body: function () {
        return '<div class="wrap tool" data-tool="prayer">' +
          '<section class="pr-today" data-slot="today"><div class="live-skel"></div></section>' +
          '<section class="wx-sec pr-month"><div class="pr-mhead"><h2 data-slot="mtitle">' + esc(U.month) + '</h2><div class="pr-nav"><button class="btn-ico" type="button" data-m="-1" aria-label="' + esc(U.prev) + '">‹</button><button class="btn-ico" type="button" data-m="1" aria-label="' + esc(U.nextM) + '">›</button><button class="btn" type="button" data-print>' + esc(U.print) + '</button></div></div>' +
          '<div class="pr-table" data-slot="month"><div class="live-skel"></div></div></section>' +
          '<p class="live-note">' + esc(U.note) + '</p><div class="prose wx-about">' + U.about + '</div></div>';
      },
      scripts: function (file) { return toolScript(site, file, cfg); }
    });
  }

  /* Build every generated file. Returns { "path": "content" } */
  function buildAll(site, articles, gallery) {
    var files = {};
    THUMBS = {}; (site._thumbs || []).forEach(function (p) { THUMBS[p] = 1; });
    LANGS.forEach(function (lang) {
      files[prefix(lang) + 'index.html'] = homePage(site, articles, lang);
      if (gallery && (gallery.photos || []).length) files[prefix(lang) + 'gallery/index.html'] = galleryPage(site, gallery, lang);
      if ((site.pages || {}).meteo !== false) files[prefix(lang) + 'meteo/index.html'] = weatherPage(site, lang);
      if ((site.pages || {}).salat !== false) files[prefix(lang) + 'salat/index.html'] = prayerPage(site, lang);
      files[prefix(lang) + 'tourisme/index.html'] = tourismPage(site, articles, lang);
      published(articles).forEach(function (a) { if (hasLang(a, lang)) files[articleFile(a, lang)] = articlePage(site, articles, a, lang); });
    });
    files['sitemap.xml'] = sitemap(site, articles, files);
    files['robots.txt'] = 'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ' + absUrl(site, 'sitemap.xml') + '\n';
    return files;
  }

  /* ---------- SEO checks for the dashboard ---------- */
  function seoCheck(site, a, lang) {
    var x = (a.i18n && a.i18n[lang]) || {};
    var kw = String(x.keyword || '').trim().toLowerCase();
    var title = seoTitle(site, { i18n: (function () { var o = {}; o[lang] = x; return o; })() }, lang);
    var text = strip(x.content);
    var words = text ? text.split(' ').length : 0;
    var firstP = strip((String(x.content || '').match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '');
    var has = function (s) { return !!kw && String(s || '').toLowerCase().indexOf(kw) >= 0; };
    var kwWords = kw.split(/\s+/).filter(function (w) { return w.length > 2; });
    var partial = function (s) { s = String(s || '').toLowerCase(); return kwWords.length && kwWords.every(function (w) { return s.indexOf(w) >= 0; }); };
    var names = lang === 'ar' ? ['القصر الصغير'] : lang === 'es' ? ['alcazarseguer', 'ksar sghir'] : ['ksar sghir', 'ksar es-seghir', 'ksar seghir'];
    var low = text.toLowerCase();
    var count = kw ? low.split(kw).length - 1 : 0;
    var checks = [
      { ok: !!kw, label: 'كلمة رئيسية محددة' },
      { ok: title.length >= 30 && title.length <= 62, warn: title.length > 0, label: 'طول عنوان SEO: ' + title.length + ' حرف (المثالي 30–60)' },
      { ok: (x.description || '').length >= 70 && (x.description || '').length <= 160, warn: !!x.description, label: 'طول الوصف: ' + (x.description || '').length + ' حرف (المثالي 70–160)' },
      { ok: has(title) || partial(title), label: 'الكلمة الرئيسية فعنوان SEO' },
      { ok: has(x.title) || partial(x.title), label: 'الكلمة الرئيسية فالعنوان H1' },
      { ok: has(x.description) || partial(x.description), label: 'الكلمة الرئيسية فالوصف' },
      { ok: has(firstP) || partial(firstP), label: 'الكلمة الرئيسية فالفقرة الأولى' },
      { ok: has(x.alt) || partial(x.alt), label: 'الكلمة الرئيسية فوصف الصورة (alt)' },
      { ok: count >= 2 && count <= Math.max(8, Math.round(words / 80)), warn: count > 0, label: 'تكرار الكلمة فالمحتوى: ' + count + ' مرة' + (count > Math.max(8, Math.round(words / 80)) ? ' (بزاف، حشو)' : '') },
      { ok: words >= 300, warn: words >= 150, label: 'طول المحتوى: ' + words + ' كلمة (300 على الأقل)' },
      { ok: /<h2/.test(x.content || ''), label: 'عناوين فرعية H2 فالمحتوى' },
      { ok: names.some(function (n) { return low.indexOf(n) >= 0; }), label: 'اسم المنطقة كاين فالمحتوى (' + names[0] + ')' },
      { ok: !!a.cover, label: 'صورة رئيسية' }
    ];
    var score = Math.round(100 * checks.filter(function (c) { return c.ok; }).length / checks.length);
    return { checks: checks, score: score, title: title };
  }

  var api = { LANGS: LANGS, UI: UI, buildAll: buildAll, articlePage: articlePage, homePage: homePage, tourismPage: tourismPage,
    ytId: ytId, socialType: socialType, SOCIAL_SVG: SOCIAL_SVG, galleryPage: galleryPage, weatherPage: weatherPage, prayerPage: prayerPage, sized: sized, smallOf: smallOf, setThumbs: function (l) { THUMBS = {}; (l || []).forEach(function (p) { THUMBS[p] = 1; }); }, seoCheck: seoCheck, FONTS: FONTS, DISPLAY: DISPLAY, articleDir: articleDir, articleFile: articleFile, hasLang: hasLang, strip: strip, esc: esc, catLabel: catLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KSBuild = api;
})(this);
