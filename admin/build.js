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
    return '<!DOCTYPE html>\n<html lang="' + lang + '" dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">\n<head>\n' +
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
      '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🌊%3C/text%3E%3C/svg%3E">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet">\n' +
      '<link rel="stylesheet" href="' + rel(file, 'assets/style.css') + '?v=' + (site.version || 1) + '">\n' +
      '<script>try{var th=localStorage.getItem("ks-theme");if(th)document.documentElement.dataset.theme=th;}catch(e){}</script>\n' +
      (o.schema ? '<script type="application/ld+json">' + JSON.stringify(o.schema).replace(/</g, '\\u003c') + '</script>\n' : '') +
      ga + '</head>\n';
  }

  function header(site, o) {
    var lang = o.lang, file = o.file;
    return '<body class="lang-' + lang + (o.bodyClass ? ' ' + o.bodyClass : '') + '">\n' +
      '<a class="skip" href="#main">' + (lang === 'ar' ? 'انتقل إلى المحتوى' : lang === 'fr' ? 'Aller au contenu' : lang === 'es' ? 'Ir al contenido' : 'Skip to content') + '</a>\n' +
      '<header class="top"><div class="wrap top-in">' +
      '<a class="brand" href="' + rel(file, prefix(lang)) + '"><span class="brand-mark" aria-hidden="true">' + brandSvg() + '</span>' +
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
    var social = (site.social || []).map(function (s) {
      return '<a href="' + esc(s.url) + '" rel="noopener" target="_blank">' + esc(s.name) + '</a>';
    }).join('');
    return '<footer class="foot"><div class="wrap">' +
      '<div class="f-grid"><div class="f-about"><a class="brand" href="' + rel(file, prefix(lang)) + '"><span class="brand-mark" aria-hidden="true">' + brandSvg() + '</span><span class="brand-txt"><b>' + esc(t(site.name, lang)) + '</b></span></a>' +
      '<p>' + esc(t(site.tagline, lang)) + '</p>' + (social ? '<div class="social" aria-label="' + esc(UI[lang].follow) + '">' + social + '</div>' : '') + '</div>' + cols + '</div>' +
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
    var img = a.cover ? '<img src="' + esc(asset(file, a.cover)) + '" alt="' + esc(x.alt || x.title) + '" loading="lazy" decoding="async" width="800" height="500">'
      : '<span class="ph" aria-hidden="true">' + brandSvg() + '</span>';
    return '<article class="card' + (big ? ' card-big' : '') + '" data-cat="' + esc(a.category) + '">' +
      '<a href="' + esc(rel(file, articleDir(a, lang))) + '"><div class="card-img">' + img + '</div>' +
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
      '<section class="hero"' + (h.image ? ' style="--hero:url(\'' + esc(asset(file, h.image)) + '\')"' : '') + '><div class="wrap hero-in">' +
      '<h1>' + esc(t(h.title, lang) || t(site.name, lang)) + '</h1>' +
      '<p class="hero-sub">' + esc(t(h.subtitle, lang)) + '</p>' +
      '<a class="btn" href="' + rel(file, prefix(lang) + 'tourisme/') + '">' + esc(t(h.cta, lang) || UI[lang].explore) + '</a>' +
      '</div><svg class="wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40c160-30 320-30 480 0s320 30 480 0 320-30 480 0v40H0z"/></svg></section>' +
      adSlot(site, 'top', lang) +
      (t(site.intro, lang) ? '<section class="wrap intro prose">' + t(site.intro, lang) + '</section>' : '') +
      (feat ? '<section class="wrap block"><h2 class="block-title">' + esc(UI[lang].featured) + '</h2>' + card(site, file, feat, lang, true) + '</section>' : '') +
      (rest.length ? '<section class="wrap block"><div class="block-head"><h2 class="block-title">' + esc(UI[lang].latest) + '</h2><a href="' + rel(file, prefix(lang) + 'tourisme/') + '">' + esc(UI[lang].allTourism) + '</a></div>' +
        '<div class="grid">' + rest.map(function (a) { return card(site, file, a, lang); }).join('') + '</div></section>' : '') +
      (cats.length ? '<section class="wrap block"><div class="chips">' + cats.map(function (c) {
        return '<a class="chip" href="' + rel(file, prefix(lang) + 'tourisme/') + '#' + esc(c.id) + '">' + esc((c.icon || '') + ' ' + t(c.name, lang)) + '</a>';
      }).join('') + '</div></section>' : '') +
      (stats ? '<section class="stats"><div class="wrap stats-in">' + stats + '</div></section>' : '') +
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
      (a.cover ? '<figure class="cover wrap"><img src="' + esc(asset(file, a.cover)) + '" alt="' + esc(x.alt || x.title) + '" width="1400" height="780" fetchpriority="high"></figure>' : '') +
      '<div class="wrap narrow">' +
      (body.toc.length > 2 ? '<nav class="toc" aria-label="' + esc(UI[lang].toc) + '"><h2>' + esc(UI[lang].toc) + '</h2><ol>' +
        body.toc.map(function (i) { return '<li><a href="#' + esc(i.id) + '">' + esc(i.text) + '</a></li>'; }).join('') + '</ol></nav>' : '') +
      adSlot(site, 'top', lang) +
      '<div class="prose">' + body.html + '</div>' +
      (gallery.length ? '<section class="gallery"><h2>' + esc(UI[lang].gallery) + '</h2><div class="gal">' + gallery.map(function (g) {
        var alt = (g.alt && t(g.alt, lang)) || x.title;
        return '<a href="' + esc(asset(file, g.src)) + '" target="_blank" rel="noopener"><img src="' + esc(asset(file, g.src)) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></a>';
      }).join('') + '</div></section>' : '') +
      (a.map ? '<section class="map"><h2>' + esc(UI[lang].map) + '</h2><div class="map-box"><iframe src="' + esc(a.map) + '" loading="lazy" title="' + esc(x.title) + '" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></section>' : '') +
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

  function sitemap(site, articles) {
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
    published(articles).forEach(function (a) {
      var d = {}; LANGS.forEach(function (l) { if (hasLang(a, l)) d[l] = articleDir(a, l); });
      add(d, a.updated || a.date);
    });
    (site.extraUrls || []).forEach(function (u) { urls.push('<url><loc>' + esc(absUrl(site, u)) + '</loc></url>'); });
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls.join('\n') + '\n</urlset>\n';
  }

  /* Build every generated file. Returns { "path": "content" } */
  function buildAll(site, articles, css, js) {
    var files = {};
    LANGS.forEach(function (lang) {
      files[prefix(lang) + 'index.html'] = homePage(site, articles, lang);
      files[prefix(lang) + 'tourisme/index.html'] = tourismPage(site, articles, lang);
      published(articles).forEach(function (a) { if (hasLang(a, lang)) files[articleFile(a, lang)] = articlePage(site, articles, a, lang); });
    });
    files['sitemap.xml'] = sitemap(site, articles);
    files['robots.txt'] = 'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ' + absUrl(site, 'sitemap.xml') + '\n';
    if (css != null) files['assets/style.css'] = css;
    if (js != null) files['assets/site.js'] = js;
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
    seoCheck: seoCheck, articleDir: articleDir, articleFile: articleFile, hasLang: hasLang, strip: strip, esc: esc, catLabel: catLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KSBuild = api;
})(this);
