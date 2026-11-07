(function () {
  var root = document.documentElement;
  document.querySelectorAll('[data-theme-toggle]').forEach(function (themeBtn) { themeBtn.addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('ks-theme', root.dataset.theme); } catch (e) {}
  }); });

  var menuBtn = document.querySelector('[data-menu]'), nav = document.getElementById('nav'), backdrop = document.querySelector('.nav-backdrop');
  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle('is-open', open); document.body.classList.toggle('nav-open', open);
    if (backdrop) backdrop.hidden = !open;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn && nav) menuBtn.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setNav(false); if (menuBtn) menuBtn.focus(); }); });

  /* services sheet (mobile tab bar) */
  var sheet = document.getElementById('svc-sheet');
  function setSheet(open) { if (!sheet) return; sheet.hidden = !open; document.body.classList.toggle('sheet-open', open); if (open) { var f = sheet.querySelector('a'); if (f) f.focus(); } }
  document.querySelectorAll('[data-sheet-open]').forEach(function (b) { b.addEventListener('click', function () { setNav(false); setSheet(true); }); });
  document.querySelectorAll('[data-sheet-close]').forEach(function (b) { b.addEventListener('click', function () { setSheet(false); }); });
  if (sheet) sheet.addEventListener('click', function (e) { if (e.target === sheet) setSheet(false); });

  /* search */
  var sBtn = document.querySelector('[data-search]'), sBox = null, sData = null;
  function sNorm(x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); }
  function sRender(q) {
    var out = sBox.querySelector('.s-res'), L = sBox.dataset;
    if (!sData) { out.innerHTML = '<p class="s-none">…</p>'; return; }
    var n = sNorm(q).trim(), list = !n ? sData.slice(0, 8) : sData.filter(function (x) { return sNorm(x.t + ' ' + x.d + ' ' + x.c).indexOf(n) >= 0; }).slice(0, 12);
    var base = sBtn.dataset.search.replace(/search\.json.*$/, ''), up = base.replace(/[^/]+\/$/, '');
    out.innerHTML = list.length ? list.map(function (x) {
      var rel = base + x.u.replace(/^(fr|en|es)\//, '');
      return '<a href="' + rel + '"><b>' + x.t.replace(/</g, '&lt;') + '</b><small>' + (x.c || '').replace(/</g, '&lt;') + '</small></a>';
    }).join('') : '<p class="s-none">' + L.none + '</p>';
  }
  if (sBtn) sBtn.addEventListener('click', function () {
    var lg = root.lang || 'ar', T = { ar: ['ابحث عن شاطئ، ميناء، خدمة…', 'لا توجد نتائج.', 'إغلاق'], fr: ['Plage, port, service…', 'Aucun résultat.', 'Fermer'], en: ['Beach, port, service…', 'No results.', 'Close'], es: ['Playa, puerto, servicio…', 'Sin resultados.', 'Cerrar'] }[lg] || ['', '', ''];
    if (!sBox) {
      sBox = document.createElement('div'); sBox.className = 's-box'; sBox.dataset.none = T[1];
      sBox.innerHTML = '<div class="s-in" role="dialog" aria-modal="true"><div class="s-head"><input type="search" placeholder="' + T[0] + '" aria-label="' + T[0] + '"><button type="button" class="icon-btn" aria-label="' + T[2] + '">✕</button></div><div class="s-res"></div></div>';
      document.body.appendChild(sBox);
      var inp = sBox.querySelector('input');
      inp.addEventListener('input', function () { sRender(inp.value); });
      sBox.querySelector('.s-head button').addEventListener('click', function () { sBox.hidden = true; sBtn.focus(); });
      sBox.addEventListener('click', function (e) { if (e.target === sBox) sBox.hidden = true; });
      fetch(sBtn.dataset.search).then(function (r) { return r.json(); }).then(function (d) { sData = d; sRender(inp.value); }).catch(function () { sData = []; sRender(''); });
    }
    sBox.hidden = false; sRender(sBox.querySelector('input').value); setTimeout(function () { sBox.querySelector('input').focus(); }, 30);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sBox && !sBox.hidden) sBox.hidden = true; else if (sheet && !sheet.hidden) setSheet(false); else if (nav && nav.classList.contains('is-open')) setNav(false);
  });

  var more = document.querySelector('[data-menu-more]');
  if (more && menuBtn && nav) more.addEventListener('click', function () {
    if (!nav.classList.contains('is-open')) menuBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var first = nav.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
  });
  document.querySelectorAll('[data-spot]').forEach(function (tr) {
    var dots = tr.parentNode.querySelectorAll('.spot-dots i'), raf = 0;
    tr.addEventListener('scroll', function () {
      if (raf) return; raf = requestAnimationFrame(function () {
        raf = 0; var c = tr.firstElementChild, step = c ? c.offsetWidth + 12 : 1, i = Math.round(Math.abs(tr.scrollLeft) / step);
        dots.forEach(function (d, k) { d.classList.toggle('on', k === Math.min(i, dots.length - 1)); });
      });
    }, { passive: true });
  });
  var unc = document.querySelector('[data-unclamp]');
  if (unc) unc.addEventListener('click', function () { var w = unc.closest('[data-clamp]'); if (w) w.classList.add('is-open'); unc.remove(); });
  var today = document.querySelector('[data-today]');
  if (today) try {
    var hl = root.lang || 'ar';
    today.textContent = new Intl.DateTimeFormat({ ar: 'ar-MA', fr: 'fr-FR', en: 'en-GB', es: 'es-ES' }[hl] || 'ar-MA',
      { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Africa/Casablanca' }).format(new Date());
  } catch (e) {}

  var filter = document.querySelector('[data-filter]'), grid = document.querySelector('[data-grid]');
  function apply(cat) {
    if (!filter || !grid) return;
    filter.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-on', c.dataset.cat === cat); });
    grid.querySelectorAll('.card').forEach(function (c) { c.hidden = !!cat && c.dataset.cat !== cat; });
  }
  if (filter) {
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      apply(b.dataset.cat);
      history.replaceState(null, '', b.dataset.cat ? '#' + b.dataset.cat : location.pathname);
    });
    var h = decodeURIComponent(location.hash.slice(1));
    if (h && filter.querySelector('[data-cat="' + h.replace(/"/g, '') + '"]')) apply(h);
  }

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { var t = b.textContent; b.textContent = '✓'; setTimeout(function () { b.textContent = t; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, function () {});
    });
  });

  /* ---------- live: weather, sea, prayer ---------- */
  var cfgEl = document.getElementById('ks-live');
  if (cfgEl) {
    var C = JSON.parse(cfgEl.textContent), U = C.ui, lang = C.lang;
  /* Morocco time from UTC + offset set in the dashboard (browsers may carry outdated time-zone rules) */
  var OFF = +C.off || 0;
  var TZN = OFF === 0 ? 'UTC' : 'Etc/GMT' + (OFF > 0 ? '-' : '+') + Math.abs(OFF);
  var mnow = function () { return new Date(Date.now() + OFF * 36e5); };
  var dmy = function (d) { return ('0' + d.getUTCDate()).slice(-2) + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + d.getUTCFullYear(); };

  /* wind: full direction name + local name (Levante / Poniente) */
  var WN = {
    ar: { d: ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'], e: 'شرقي', w: 'غربي' },
    fr: { d: ['Nord', 'Nord-est', 'Est', 'Sud-est', 'Sud', 'Sud-ouest', 'Ouest', 'Nord-ouest'], e: 'Levant', w: 'Ponant' },
    en: { d: ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'], e: 'Levante', w: 'Poniente' },
    es: { d: ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'], e: 'Levante', w: 'Poniente' }
  };
  var windName = function (deg, lg) {
    if (deg == null || isNaN(deg)) return '';
    var W = WN[lg] || WN.en, d = ((deg % 360) + 360) % 360, full = W.d[Math.round(d / 45) % 8];
    var local = d >= 45 && d <= 135 ? W.e : d >= 225 && d <= 315 ? W.w : '';
    return local ? local + ' · ' + full : full;
  };
  var windArrow = function (deg) { return deg == null ? '' : '<span class="wx-arrow" style="display:inline-block;transform:rotate(' + Math.round(deg + 180) + 'deg)" aria-hidden="true">↑</span>'; };

    var loc = lang === 'ar' ? 'ar-MA' : lang;
    var num = function (v, d) { return new Intl.NumberFormat(loc, { maximumFractionDigits: d || 0 }).format(v); };
    var box = function (k) { var c = document.querySelector('[data-live="' + k + '"] .live-body'); return c; };
    var fail = function (k) { var b = box(k); if (b) b.innerHTML = '<p class="live-note">' + U.unavailable + '</p>'; };
    var wx = function (c) {
      if (c === 0) return ['☀️', 'clear']; if (c <= 2) return ['🌤️', 'partly']; if (c === 3) return ['☁️', 'cloudy'];
      if (c === 45 || c === 48) return ['🌫️', 'fog']; if (c <= 57) return ['🌦️', 'drizzle']; if (c <= 67) return ['🌧️', 'rain'];
      if (c <= 77) return ['❄️', 'snow']; if (c <= 82) return ['🌦️', 'showers']; return ['⛈️', 'storm'];
    };
    var dir = function (d) { var a = lang === 'ar' ? ['ش', 'ش ق', 'ق', 'ج ق', 'ج', 'ج غ', 'غ', 'ش غ'] : lang === 'fr' ? ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] : lang === 'es' ? ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; return a[Math.round(((d % 360) / 45)) % 8]; };
    var KMH = lang === 'ar' ? 'كم/س' : 'km/h', MU = lang === 'ar' ? 'م' : 'm';
    var get = function (u) {
      /* 1) copy saved hourly by GitHub in data/live/ (same site, works on every network) 2) Open-Meteo directly 3) older saved copy */
      var LB = (function () { var s = document.querySelector('script[src*="assets/site.js"],script[src*="assets/tools.js"]'); return s ? s.src.replace(/assets\/[^\/]*$/, '') + 'data/live/' : ''; })();
      var near = function (a, b) { return Math.abs(+a - +b) < 1e-3; };
      var saved = function (maxH) {
        return Promise.resolve().then(function () {
          if (!/open-meteo\.com/.test(u) || !LB) throw 0;
          var q = new URL(u).searchParams, la = q.get('latitude'), lo = q.get('longitude'), name = '';
          if (/marine-api/.test(u)) { if (near(la, C.seaLat) && near(lo, C.seaLng)) name = 'mar-sea'; }
          else if (near(la, C.lat) && near(lo, C.lng)) name = 'fc-town';
          else if (near(la, C.seaLat) && near(lo, C.seaLng)) name = 'fc-sea';
          if (!name) throw 0;
          return fetch(LB + name + '.json?h=' + Math.floor(Date.now() / 36e5), { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
            if (j._tz !== q.get('timezone') || !(Date.now() - Date.parse(j._fetched) < maxH * 36e5)) throw 0;
            var n = +q.get('forecast_days') || 7;
            ['current', 'hourly', 'daily'].forEach(function (k) {
              var want = (q.get(k) || '').split(',').filter(Boolean);
              if (!want.length) { delete j[k]; return; }
              if (!j[k]) throw 0;
              want.forEach(function (f) { if (!(f in j[k])) throw 0; });
              if (k !== 'current') Object.keys(j[k]).forEach(function (f) { if (Array.isArray(j[k][f])) j[k][f] = j[k][f].slice(0, k === 'daily' ? n : n * 24); });
            });
            return j;
          });
        });
      };
      var one = function (x) { return fetch(x).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
      var direct = function () { return one(u).catch(function () { return new Promise(function (ok) { setTimeout(ok, 1500); }).then(function () { return one(u.replace(/timezone=[^&]*/, 'timezone=auto')); }); }); };
      return saved(3).catch(direct).catch(function (e) { return saved(48).catch(function () { throw e; }); });
    };

    if (box('weather')) get('https://api.open-meteo.com/v1/forecast?latitude=' + C.lat + '&longitude=' + C.lng +
      '&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=' + encodeURIComponent(TZN) + '&forecast_days=5')
      .then(function (d) {
        var c = d.current, w = wx(c.weather_code);
        var days = d.daily.time.map(function (t, i) {
          var dd = new Date(t + 'T12:00:00'), wi = wx(d.daily.weather_code[i]);
          return '<div><span class="d-t">' + new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(dd) + '</span><span class="d-ico">' + wi[0] + '</span><span><b>' + num(d.daily.temperature_2m_max[i]) + '°</b> ' + num(d.daily.temperature_2m_min[i]) + '°</span></div>';
        }).join('');
        box('weather').innerHTML = '<div class="lv-now"><div class="lv-txt"><b class="lv-big" dir="ltr">' + num(c.temperature_2m) + '°C</b><span class="lv-desc">' + U.codes[w[1]] + '</span></div><span class="lv-ico" aria-hidden="true">' + w[0] + '</span></div>' +
          '<ul class="lv-facts"><li>' + U.humidity + ': <b>' + num(c.relative_humidity_2m) + '%</b></li><li class="lv-x">' + U.wind + ': <b><span>' + num(c.wind_speed_10m) + ' ' + KMH + '</span> ' + windArrow(c.wind_direction_10m) + ' ' + windName(c.wind_direction_10m, lang) + '</b></li></ul>' +
          '<div class="days">' + days + '</div>';
      }).catch(function () { fail('weather'); });

    if (box('sea')) Promise.all([
      get('https://marine-api.open-meteo.com/v1/marine?latitude=' + C.seaLat + '&longitude=' + C.seaLng + '&current=wave_height,wave_direction,wave_period,sea_surface_temperature&timezone=' + encodeURIComponent(TZN) + ''),
      get('https://api.open-meteo.com/v1/forecast?latitude=' + C.seaLat + '&longitude=' + C.seaLng + '&current=wind_speed_10m,wind_direction_10m&timezone=' + encodeURIComponent(TZN) + '')
    ]).then(function (r) {
      var m = r[0].current, w = r[1].current, h = m.wave_height;
      var st = h == null ? -1 : h < 0.5 ? 0 : h < 1.25 ? 1 : h < 2.5 ? 2 : 3;
      box('sea').innerHTML = '<div class="lv-now"><div class="lv-txt"><b class="lv-big">' + (h == null ? '–' : '<span dir="ltr">' + num(h, 1) + '</span> ' + MU) + '</b><span class="lv-desc">' + (U.waves || '') + '</span></div><span class="lv-ico" aria-hidden="true">🌊</span></div>' +
        '<ul class="lv-facts"><li>' + U.wind + ': <b><span>' + num(w.wind_speed_10m) + ' ' + KMH + '</span></b></li>' +
        (st >= 0 ? '<li>' + (U.state || '') + ': <b class="sea-txt sea-' + st + '">' + U.seaStates[st] + '</b></li>' : '') +
        (m.sea_surface_temperature != null ? '<li class="lv-x">' + U.water + ': <b>' + num(m.sea_surface_temperature) + '°</b></li>' : '') + '</ul>';
    }).catch(function () { fail('sea'); });

    if (box('prayer')) {
      var now = mnow(), ds = dmy(now);
      var HM = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
      var HE = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];
      var iso = now.getUTCFullYear() + '-' + ('0' + (now.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + now.getUTCDate()).slice(-2);
      var aladhan = function () { return get('https://api.aladhan.com/v1/timings/' + ds + '?latitude=' + C.lat + '&longitude=' + C.lng + '&method=' + C.method + (C.tune ? '&tune=' + encodeURIComponent(C.tune) : '')); };
      var src = !C.official ? aladhan() : get(C.official).then(function (o) {
        var x = o && o.days && o.days[iso]; if (!x) return aladhan();
        var k = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'], T = {}; k.forEach(function (n, i) { T[n] = x.t[i]; });
        var h = x.h || [];
        return { official: true, data: { timings: T, date: { hijri: h.length ? { day: h[0], month: { ar: HM[h[1] - 1], en: HE[h[1] - 1] }, year: h[2] } : null } } };
      }, aladhan);
      src
        .then(function (d) {
          var T = d.data.timings, keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          var mins = function (x) { var p = String(x).slice(0, 5).split(':'); return +p[0] * 60 + +p[1]; };
          var cur = now.getUTCHours() * 60 + now.getUTCMinutes(), next = keys.filter(function (k) { return k !== 'Sunrise' && mins(T[k]) > cur; })[0] || 'Fajr';
          var hj = d.data.date.hijri, hijri = !hj ? '' : lang === 'ar' ? hj.day + ' ' + hj.month.ar + ' ' + hj.year + ' هـ' : hj.day + ' ' + hj.month.en + ' ' + hj.year + ' AH';
          var left = mins(T[next]) - cur; if (left < 0) left += 1440;
          box('prayer').innerHTML = '<div class="lv-next"><small>' + U.next + '</small><b>' + U.prayers[next] + ' <span dir="ltr">' + String(T[next]).slice(0, 5) + '</span></b><span class="lv-left">' + (U.inT || '') + ' <span dir="ltr">' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) + '</span></span></div>' +
            '<ul class="prayers">' + keys.map(function (k) { return '<li' + (k === next ? ' class="is-next"' : '') + '><span>' + U.prayers[k] + '</span><b>' + String(T[k]).slice(0, 5) + '</b></li>'; }).join('') + '</ul>' +
            '<p class="live-note">' + (hijri ? hijri + ' · ' : '') + (d.official ? (U.official || '✓ Habous') : U.approx) + '</p>' +
            (U.fullUrl ? '<a class="lv-all" href="' + U.fullUrl + '">' + (U.full || U.more) + ' <span aria-hidden="true">' + (lang === 'ar' ? '←' : '→') + '</span></a>' : '');
        }).catch(function () { fail('prayer'); });
    }
  }

  /* ---------- rating ---------- */
  var rate = document.querySelector('[data-rating]');
  if (rate) {
    var stars = rate.querySelectorAll('[data-star]');
    var paint = function (n) { stars.forEach(function (s) { s.classList.toggle('on', +s.dataset.star <= n); }); };
    var saved = 0; try { saved = +localStorage.getItem('ks-rating') || 0; } catch (e) {}
    if (saved) { paint(saved); rate.parentNode.querySelector('.rate-thanks').hidden = false; }
    stars.forEach(function (s) {
      s.addEventListener('mouseenter', function () { paint(+s.dataset.star); });
      s.addEventListener('click', function () {
        saved = +s.dataset.star; paint(saved);
        try { localStorage.setItem('ks-rating', saved); } catch (e) {}
        rate.parentNode.querySelector('.rate-thanks').hidden = false;
        if (window.gtag) window.gtag('event', 'site_rating', { value: saved, rating: saved });
      });
    });
    rate.addEventListener('mouseleave', function () { paint(saved); });
  }

  /* ---------- ticker speed ---------- */
  document.querySelectorAll('.ticker').forEach(function (tk) {
    var set = tk.querySelector('.tk-set'), move = tk.querySelector('.tk-move'); if (!set || !move) return;
    var pps = { slow: 35, normal: 60, fast: 100 }[tk.dataset.speed] || 60;
    var fit = function () { move.style.setProperty('--dur', Math.max(8, set.offsetWidth / pps) + 's'); };
    fit(); window.addEventListener('resize', fit);
  });

  /* ---------- YouTube: load the player only when clicked ---------- */
  document.querySelectorAll('.yt').forEach(function (box) {
    box.addEventListener('click', function () {
      if (box.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.yt + '?autoplay=1&rel=0';
      f.title = box.dataset.title || 'YouTube';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      box.innerHTML = ''; box.appendChild(f);
    });
  });

  /* ---------- images: fade in over the logo placeholder ---------- */
  document.querySelectorAll('.ph-bg img').forEach(function (img) {
    var done = function () { img.classList.add('is-loaded'); img.parentNode.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth) done(); else img.addEventListener('load', done);
  });

  /* ---------- hero slideshow ---------- */
  var slides = document.querySelectorAll('.hero-slides img');
  if (slides.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var si = 0;
    var loadImg = function (im) { if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); } };
    loadImg(slides[1]);
    setInterval(function () {
      if (document.hidden) return;
      slides[si].classList.remove('on'); si = (si + 1) % slides.length; slides[si].classList.add('on');
      loadImg(slides[(si + 1) % slides.length]);
    }, 5500);
  }

  /* ---------- photos: no right-click / drag-to-save (the watermark is baked into the images) ---------- */
  ['contextmenu', 'dragstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  });

  /* ---------- lightbox ---------- */
  var groups = document.querySelectorAll('[data-lb-group]');
  if (groups.length) {
    var lbBox = document.createElement('div'), items = [], idx = 0, lastFocus = null, sx = null;
    lbBox.className = 'lb'; lbBox.hidden = true; lbBox.setAttribute('role', 'dialog'); lbBox.setAttribute('aria-modal', 'true');
    lbBox.innerHTML = '<button class="lb-x" type="button" aria-label="×">×</button><button class="lb-p" type="button" aria-label="‹">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure><button class="lb-n" type="button" aria-label="›">›</button><span class="lb-c"></span>';
    document.body.appendChild(lbBox);
    var img = lbBox.querySelector('img'), cap = lbBox.querySelector('figcaption'), cnt = lbBox.querySelector('.lb-c');
    var show = function (i) {
      idx = (i + items.length) % items.length; var a = items[idx], th = a.querySelector('img');
      img.src = a.getAttribute('href'); img.alt = th ? th.alt : '';
      cap.textContent = a.dataset.caption || (th ? th.alt : ''); cnt.textContent = (idx + 1) + ' / ' + items.length;
    };
    var close = function () { lbBox.hidden = true; document.documentElement.style.overflow = ''; img.src = ''; if (lastFocus) lastFocus.focus(); };
    groups.forEach(function (g) {
      g.addEventListener('click', function (e) {
        var a = e.target.closest('[data-lb]'); if (!a) return; e.preventDefault();
        items = Array.prototype.filter.call(g.querySelectorAll('[data-lb]'), function (x) { return !x.hidden || g.hasAttribute('data-lb-all'); });
        lastFocus = a; lbBox.hidden = false; document.documentElement.style.overflow = 'hidden'; show(items.indexOf(a)); lbBox.querySelector('.lb-x').focus();
      });
    });
    lbBox.addEventListener('click', function (e) {
      if (e.target.closest('.lb-x') || e.target === lbBox) close();
      else if (e.target.closest('.lb-p')) show(idx - 1);
      else if (e.target.closest('.lb-n')) show(idx + 1);
    });
    var rtl = document.documentElement.dir === 'rtl';
    document.addEventListener('keydown', function (e) {
      if (lbBox.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + (rtl ? -1 : 1));
      if (e.key === 'ArrowLeft') show(idx + (rtl ? 1 : -1));
    });
    lbBox.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lbBox.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + ((dx < 0) !== rtl ? 1 : -1)); sx = null; });
  }

  /* ---------- destinations map (Leaflet loaded on demand) ---------- */
  var mapEl = document.getElementById('dmap'), mapData = document.getElementById('ks-map');
  if (mapEl && mapData) {
    var start = function () {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
      var js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      js.onload = function () {
        var L = window.L, pts = JSON.parse(mapData.textContent), read = mapEl.dataset.read;
        mapEl.innerHTML = '';
        var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
        var map = L.map(mapEl, { scrollWheelZoom: false, tap: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        if (dark) mapEl.classList.add('is-dark');
        var bounds = [];
        pts.forEach(function (p) {
          var icon = L.divIcon({ className: '', html: '<div class="dpin" style="background:' + p.c + '"><span>' + p.i + '</span></div>', iconSize: [34, 34], iconAnchor: [4, 34], popupAnchor: [13, -30] });
          var esc2 = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
          L.marker([p.la, p.ln], { icon: icon, title: p.t }).addTo(map).bindPopup('<div class="dpop">' + (p.img ? '<img src="' + esc2(p.img) + '" alt="">' : '') + '<small>' + esc2(p.i + ' ' + p.k) + '</small><b>' + esc2(p.t) + '</b><a href="' + esc2(p.u) + '">' + esc2(read) + ' ←</a></div>');
          bounds.push([p.la, p.ln]);
        });
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 }); else map.setView(bounds[0], 13);
        map.on('focus', function () { map.scrollWheelZoom.enable(); });
      };
      document.head.appendChild(js);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '300px' });
      io.observe(mapEl);
    } else start();
  }
  /* ---------- shared: load Leaflet once ---------- */
  var leafletCbs = null;
  function withLeaflet(cb) {
    if (window.L) return cb(window.L);
    if (leafletCbs) return leafletCbs.push(cb);
    leafletCbs = [cb];
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
    var js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = function () { leafletCbs.forEach(function (f) { f(window.L); }); };
    document.head.appendChild(js);
  }
  function whenVisible(el, fn) {
    if (!('IntersectionObserver' in window)) return fn();
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: '300px' });
    io.observe(el);
  }

  /* ---------- ferry lines map (satellite) ---------- */
  document.querySelectorAll('[data-fmap]').forEach(function (el) {
    var names = JSON.parse(el.dataset.fmap || '[]'), wrap = el.closest('.fmap');
    var P = { tm: [35.8885, -5.5005], alg: [36.13, -5.438], ks: [35.8426, -5.5596], tv: [35.789, -5.809], tar: [36.008, -5.604], bcn: [41.35, 2.17], gen: [44.405, 8.91] };
    var map = null, strait, all;
    whenVisible(el, function () {
      withLeaflet(function (L) {
        map = L.map(el, { scrollWheelZoom: false });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Imagery © Esri' }).addTo(map);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, opacity: .85 }).addTo(map);
        var pin = function (ll, color, label) { return L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="fpin" style="background:' + color + '"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(map).bindTooltip(label, { permanent: true, direction: 'top', className: 'ftip', offset: [0, -8] }); };
        var arc = function (a, b, bend) { var pts = []; for (var i = 0; i <= 40; i++) { var t = i / 40, off = Math.sin(Math.PI * t) * bend; pts.push([a[0] + (b[0] - a[0]) * t + off, a[1] + (b[1] - a[1]) * t - off * 0.6]); } return pts; };
        pin(P.tm, '#f2a541', names[0]); pin(P.alg, '#f2a541', names[1]); pin(P.ks, '#00b4d8', names[2]); pin(P.tv, '#ffffff', names[3]); pin(P.tar, '#ffffff', names[4]);
        pin(P.bcn, '#2cc6e6', names[5]); pin(P.gen, '#2cc6e6', names[6]);
        L.polyline(arc(P.tm, P.alg, 0.02), { color: '#f2a541', weight: 4, dashArray: '10 8' }).addTo(map);
        L.polyline(arc(P.tv, P.tar, 0.015), { color: '#ffffff', weight: 3, dashArray: '6 8' }).addTo(map);
        L.polyline([P.ks, P.tm], { color: '#00b4d8', weight: 3, opacity: .9 }).addTo(map);
        var mid = [[35.98, -5.30], [36.05, -4.60], [36.25, -3.20]];
        L.polyline([P.tm].concat(mid, [[36.55, -1.90], [37.05, -0.60], [37.75, 0.40], [38.70, 1.00], [39.80, 1.60], [40.80, 2.10], P.bcn]), { color: '#2cc6e6', weight: 3, dashArray: '10 8', smoothFactor: 2 }).addTo(map);
        L.polyline([P.tm].concat(mid, [[36.65, -1.60], [37.35, 0.60], [38.20, 3.00], [39.40, 5.50], [41.20, 7.10], [42.80, 8.20], [43.90, 8.80], P.gen]), { color: '#7fe0ff', weight: 3, dashArray: '4 8', smoothFactor: 2 }).addTo(map);
        strait = L.latLngBounds([P.tv, P.alg, P.tar, P.ks, P.tm]); all = L.latLngBounds([P.tv, P.bcn, P.gen, P.tm]);
        map.fitBounds(strait, { padding: [30, 30] });
      });
    });
    if (wrap) wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fview]'); if (!b || !map) return;
      wrap.querySelectorAll('[data-fview]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      map.fitBounds(b.dataset.fview === 'all' ? all : strait, { padding: [30, 30] });
    });
  });

  /* ---------- mini weather + sea card inside beach articles ---------- */
  document.querySelectorAll('[data-wx]').forEach(function (el) {
    var c = JSON.parse(el.dataset.wx), U = c.ui, b = el.querySelector('.wx-mini-b'), lg = c.lang;
    var loc2 = lg === 'ar' ? 'ar-MA' : lg, nf = function (v, d) { return new Intl.NumberFormat(loc2, { maximumFractionDigits: d || 0 }).format(v); };
    var code = function (x) { return x === 0 ? ['☀️', 'clear'] : x <= 2 ? ['🌤️', 'partly'] : x === 3 ? ['☁️', 'cloudy'] : (x === 45 || x === 48) ? ['🌫️', 'fog'] : x <= 57 ? ['🌦️', 'drizzle'] : x <= 67 ? ['🌧️', 'rain'] : x <= 77 ? ['❄️', 'snow'] : x <= 82 ? ['🌦️', 'showers'] : ['⛈️', 'storm']; };
    var g = function (u) { var one = function (x) { return fetch(x).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }; return one(u).catch(function () { return new Promise(function (ok) { setTimeout(ok, 1500); }).then(function () { return one(u.replace(/timezone=[^&]*/, 'timezone=auto')); }); }); };
    whenVisible(el, function () {
      Promise.all([
        g('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lng + '&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=UTC'),
        g('https://marine-api.open-meteo.com/v1/marine?latitude=' + c.lat + '&longitude=' + c.lng + '&current=wave_height,sea_surface_temperature&timezone=UTC').catch(function () { return { current: {} }; })
      ]).then(function (r) {
        var w = r[0].current, m = r[1].current || {}, h = m.wave_height, ws = w.wind_speed_10m, k = code(w.weather_code);
        var lvl = (h == null ? 0 : h >= 1 ? 2 : h >= 0.5 ? 1 : 0); lvl = Math.max(lvl, ws >= 35 ? 2 : ws >= 22 ? 1 : 0);
        var sw = ['good', 'fair', 'bad'][lvl];
        b.innerHTML = '<span class="wm-t">' + k[0] + ' <b>' + nf(w.temperature_2m) + '°</b> <small>' + (c.codes[k[1]] || '') + '</small></span>' +
          (h != null ? '<span>🌊 ' + U.waves + ' <b>' + nf(h, 1) + ' m</b></span>' : '') +
          (m.sea_surface_temperature != null ? '<span>🌡️ ' + U.water + ' <b>' + nf(m.sea_surface_temperature) + '°</b></span>' : '') +
          '<span>💨 ' + U.wind + ' <b>' + nf(ws) + ' km/h</b> ' + windTxt(w.wind_direction_10m, lg) + '</span>' +
          '<span class="wm-sw wm-' + sw + '">🏊 ' + U.swim + ': <b>' + U[sw] + '</b></span>';
      }).catch(function () { b.innerHTML = '<small class="live-note">' + U.error + '</small>'; });
    });
  });
  /* live ferry board: departures / arrivals tabs */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tm-tabs [data-tm]'); if (!b) return;
    var box = b.closest('.tm-live'), f = box && box.querySelector('iframe'); if (!f) return;
    box.querySelectorAll('.tm-tabs [data-tm]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    if (f.getAttribute('src') !== b.dataset.tm) f.setAttribute('src', b.dataset.tm);
  });
  function windTxt(deg, lg) {
    if (deg == null) return '';
    var d = ((deg % 360) + 360) % 360, e = d >= 45 && d <= 135, w = d >= 225 && d <= 315;
    var N = { ar: ['شرقي', 'غربي'], fr: ['Levante', 'Poniente'], en: ['Levante', 'Poniente'], es: ['Levante', 'Poniente'] }[lg] || ['E', 'W'];
    return e ? '(' + N[0] + ')' : w ? '(' + N[1] + ')' : '';
  }
})();
