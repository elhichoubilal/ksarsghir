(function () {
  var root = document.documentElement;
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('ks-theme', root.dataset.theme); } catch (e) {}
  });

  var menuBtn = document.querySelector('[data-menu]'), nav = document.getElementById('nav');
  if (menuBtn && nav) menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

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
    var get = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };

    if (box('weather')) get('https://api.open-meteo.com/v1/forecast?latitude=' + C.lat + '&longitude=' + C.lng +
      '&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=' + encodeURIComponent(TZN) + '&forecast_days=5')
      .then(function (d) {
        var c = d.current, w = wx(c.weather_code);
        var days = d.daily.time.map(function (t, i) {
          var dd = new Date(t + 'T12:00:00'), wi = wx(d.daily.weather_code[i]);
          return '<div><span class="d-t">' + new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(dd) + '</span><span class="d-ico">' + wi[0] + '</span><span><b>' + num(d.daily.temperature_2m_max[i]) + '°</b> ' + num(d.daily.temperature_2m_min[i]) + '°</span></div>';
        }).join('');
        box('weather').innerHTML = '<div class="live-now"><span class="live-ico" aria-hidden="true">' + w[0] + '</span><div><div class="live-big">' + num(c.temperature_2m) + '°</div><div class="live-desc">' + U.codes[w[1]] + '</div></div></div>' +
          '<ul class="live-facts"><li>' + U.wind + ': <b>' + num(c.wind_speed_10m) + ' km/h ' + windArrow(c.wind_direction_10m) + ' ' + windName(c.wind_direction_10m, lang) + '</b></li><li>' + U.humidity + ': <b>' + num(c.relative_humidity_2m) + '%</b></li></ul>' +
          '<div class="days">' + days + '</div>';
      }).catch(function () { fail('weather'); });

    if (box('sea')) Promise.all([
      get('https://marine-api.open-meteo.com/v1/marine?latitude=' + C.seaLat + '&longitude=' + C.seaLng + '&current=wave_height,wave_direction,wave_period,sea_surface_temperature&timezone=' + encodeURIComponent(TZN) + ''),
      get('https://api.open-meteo.com/v1/forecast?latitude=' + C.seaLat + '&longitude=' + C.seaLng + '&current=wind_speed_10m,wind_direction_10m&timezone=' + encodeURIComponent(TZN) + '')
    ]).then(function (r) {
      var m = r[0].current, w = r[1].current, h = m.wave_height;
      var st = h == null ? -1 : h < 0.5 ? 0 : h < 1.25 ? 1 : h < 2.5 ? 2 : 3;
      box('sea').innerHTML = '<div class="live-now"><span class="live-ico" aria-hidden="true">🌊</span><div><div class="live-big">' + (h == null ? '–' : num(h, 1) + ' m') + '</div>' +
        (st >= 0 ? '<span class="sea-state sea-' + st + '">' + U.seaStates[st] + '</span>' : '') + '</div></div>' +
        '<ul class="live-facts">' + (m.sea_surface_temperature != null ? '<li>' + U.water + ': <b>' + num(m.sea_surface_temperature) + '°</b></li>' : '') +
        (m.wave_period != null ? '<li>' + U.period + ': <b>' + num(m.wave_period) + ' s</b></li>' : '') +
        '<li>' + U.wind + ': <b>' + num(w.wind_speed_10m) + ' km/h ' + windArrow(w.wind_direction_10m) + ' ' + windName(w.wind_direction_10m, lang) + '</b></li></ul>';
    }).catch(function () { fail('sea'); });

    if (box('prayer')) {
      var now = mnow(), ds = dmy(now);
      get('https://api.aladhan.com/v1/timings/' + ds + '?latitude=' + C.lat + '&longitude=' + C.lng + '&method=' + C.method + (C.tune ? '&tune=' + encodeURIComponent(C.tune) : ''))
        .then(function (d) {
          var T = d.data.timings, keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          var mins = function (x) { var p = String(x).slice(0, 5).split(':'); return +p[0] * 60 + +p[1]; };
          var cur = now.getUTCHours() * 60 + now.getUTCMinutes(), next = keys.filter(function (k) { return k !== 'Sunrise' && mins(T[k]) > cur; })[0] || 'Fajr';
          var hj = d.data.date.hijri, hijri = lang === 'ar' ? hj.day + ' ' + hj.month.ar + ' ' + hj.year + ' هـ' : hj.day + ' ' + hj.month.en + ' ' + hj.year + ' AH';
          var left = mins(T[next]) - cur; if (left < 0) left += 1440;
          box('prayer').innerHTML = '<p class="next-p">' + U.next + ': <b>' + U.prayers[next] + ' ' + String(T[next]).slice(0, 5) + '</b> <span>(' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) + ')</span></p>' +
            '<ul class="prayers">' + keys.map(function (k) { return '<li' + (k === next ? ' class="is-next"' : '') + '><span>' + U.prayers[k] + '</span><b>' + String(T[k]).slice(0, 5) + '</b></li>'; }).join('') + '</ul>' +
            '<p class="live-note">' + hijri + ' · ' + U.approx + '</p>';
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

  /* ---------- lightbox ---------- */
  var groups = document.querySelectorAll('[data-lb-group]');
  if (groups.length) {
    var box = document.createElement('div'), items = [], idx = 0, lastFocus = null, sx = null;
    box.className = 'lb'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button class="lb-x" type="button" aria-label="×">×</button><button class="lb-p" type="button" aria-label="‹">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure><button class="lb-n" type="button" aria-label="›">›</button><span class="lb-c"></span>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption'), cnt = box.querySelector('.lb-c');
    var show = function (i) {
      idx = (i + items.length) % items.length; var a = items[idx], th = a.querySelector('img');
      img.src = a.getAttribute('href'); img.alt = th ? th.alt : '';
      cap.textContent = a.dataset.caption || (th ? th.alt : ''); cnt.textContent = (idx + 1) + ' / ' + items.length;
    };
    var close = function () { box.hidden = true; document.documentElement.style.overflow = ''; img.src = ''; if (lastFocus) lastFocus.focus(); };
    groups.forEach(function (g) {
      g.addEventListener('click', function (e) {
        var a = e.target.closest('[data-lb]'); if (!a) return; e.preventDefault();
        items = Array.prototype.filter.call(g.querySelectorAll('[data-lb]'), function (x) { return !x.hidden; });
        lastFocus = a; box.hidden = false; document.documentElement.style.overflow = 'hidden'; show(items.indexOf(a)); box.querySelector('.lb-x').focus();
      });
    });
    box.addEventListener('click', function (e) {
      if (e.target.closest('.lb-x') || e.target === box) close();
      else if (e.target.closest('.lb-p')) show(idx - 1);
      else if (e.target.closest('.lb-n')) show(idx + 1);
    });
    var rtl = document.documentElement.dir === 'rtl';
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + (rtl ? -1 : 1));
      if (e.key === 'ArrowLeft') show(idx + (rtl ? 1 : -1));
    });
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + ((dx < 0) !== rtl ? 1 : -1)); sx = null; });
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
})();
