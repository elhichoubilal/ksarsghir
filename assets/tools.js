/* Ksar Sghir — weather & prayer pages */
(function () {
  'use strict';
  var cfgEl = document.getElementById('ks-tool');
  if (!cfgEl) return;
  var C = JSON.parse(cfgEl.textContent), U = C.ui, lang = C.lang;
  var loc = lang === 'ar' ? 'ar-MA' : lang;
  var TZ = 'Africa/Casablanca';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var slot = function (n) { return $('[data-slot="' + n + '"]'); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var num = function (v, d) { return v == null || isNaN(v) ? '–' : new Intl.NumberFormat(loc, { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }).format(v); };
  var get = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
  var fail = function (n) { var s = slot(n); if (s) s.innerHTML = '<p class="live-note">' + esc(U.error) + '</p>'; };
  var fmtTime = function (d) { return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(d); };
  var hhmm = function (iso) { return String(iso).slice(11, 16); };

  /* ================= WEATHER ================= */
  if (C.tool === 'weather') {
    var wx = function (c, day) {
      var night = day === 0;
      if (c === 0) return [night ? '🌙' : '☀️', 'clear']; if (c <= 2) return [night ? '☁️' : '🌤️', 'partly']; if (c === 3) return ['☁️', 'cloudy'];
      if (c === 45 || c === 48) return ['🌫️', 'fog']; if (c <= 57) return ['🌦️', 'drizzle']; if (c <= 67) return ['🌧️', 'rain'];
      if (c <= 77) return ['❄️', 'snow']; if (c <= 82) return ['🌦️', 'showers']; return ['⛈️', 'storm'];
    };
    var DIRS = lang === 'ar' ? ['ش', 'ش ش ق', 'ش ق', 'ش ق ق', 'ق', 'ج ق ق', 'ج ق', 'ج ج ق', 'ج', 'ج ج غ', 'ج غ', 'ج غ غ', 'غ', 'ش غ غ', 'ش غ', 'ش ش غ']
      : lang === 'en' ? ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      : ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    var dirName = function (d) { return d == null ? '' : DIRS[Math.round((d % 360) / 22.5) % 16]; };
    var arrow = function (d) { return d == null ? '' : '<span class="wx-arrow" style="transform:rotate(' + Math.round(d + 180) + 'deg)" aria-hidden="true">↑</span>'; };
    var kmh = function (v) { return num(v) + ' ' + (lang === 'ar' ? 'كم/س' : 'km/h'); };
    var dayName = function (iso, long) { return new Intl.DateTimeFormat(loc, { weekday: long ? 'long' : 'short', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')); };
    var dm = function (iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7); };

    var F = 'https://api.open-meteo.com/v1/forecast?latitude=' + C.lat + '&longitude=' + C.lng +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day' +
      '&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,wind_direction_10m,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunrise,sunset,uv_index_max,daylight_duration' +
      '&timezone=' + encodeURIComponent(TZ) + '&forecast_days=7';
    var M = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + C.seaLat + '&longitude=' + C.seaLng +
      '&current=wave_height,wave_period,wave_direction,sea_surface_temperature' +
      '&hourly=wave_height,sea_level_height_msl&daily=wave_height_max&timezone=' + encodeURIComponent(TZ) + '&forecast_days=3';

    var hourCard = function (h, i) {
      var w = wx(h.weather_code[i], h.is_day[i]);
      return '<div class="wx-h"><div class="wx-t">' + hhmm(h.time[i]) + '</div><div class="wx-row"><span class="wx-ico">' + w[0] + '</span><b class="wx-temp">' + num(h.temperature_2m[i]) + '°</b></div>' +
        '<div class="wx-rain">☂ ' + num(h.precipitation_probability[i]) + '%</div><div class="wx-mm">' + num(h.precipitation[i], 1) + ' mm</div>' +
        '<div class="wx-wind">' + num(h.wind_speed_10m[i]) + '-' + num(h.wind_gusts_10m[i]) + ' <small>km/h</small></div>' +
        '<div class="wx-dir">' + arrow(h.wind_direction_10m[i]) + ' ' + dirName(h.wind_direction_10m[i]) + '</div><div class="wx-cl">☁ ' + num(h.cloud_cover[i]) + '%</div></div>';
    };
    var hoursOf = function (h, iso) {
      var out = []; for (var i = 0; i < h.time.length; i++) if (h.time[i].slice(0, 10) === iso && +h.time[i].slice(11, 13) % 3 === 0) out.push(i);
      return out;
    };

    Promise.all([get(F), get(M).catch(function () { return null; })]).then(function (r) {
      var f = r[0], m = r[1], c = f.current, d = f.daily, h = f.hourly, w = wx(c.weather_code, c.is_day);
      var today = d.time[0];
      var fact = function (ic, label, val) { return '<div class="wx-f"><span class="wx-fi" aria-hidden="true">' + ic + '</span><div><b>' + val + '</b><small>' + esc(label) + '</small></div></div>'; };
      slot('now').innerHTML =
        '<div class="wx-now-main"><span class="wx-big-ico" aria-hidden="true">' + w[0] + '</span><div><div class="wx-big">' + num(c.temperature_2m) + '°</div><div class="wx-desc">' + esc(C.codes[w[1]]) + '</div></div>' +
        '<div class="wx-feels"><b>' + num(c.apparent_temperature) + '°</b><small>' + esc(U.feels) + '</small></div></div>' +
        '<p class="wx-date">' + new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date()) + ' · ' + esc(U.updated) + ' ' + hhmm(c.time) + '</p>' +
        '<div class="wx-facts">' +
        fact('☁️', U.clouds, num(c.cloud_cover) + '%') + fact('☂️', U.rain, num(c.precipitation, 1) + ' mm') +
        fact('💨', U.wind, kmh(c.wind_speed_10m)) + fact('🌬️', U.gusts, kmh(c.wind_gusts_10m)) +
        fact(arrow(c.wind_direction_10m), U.dir, dirName(c.wind_direction_10m)) + fact('⏲️', U.pressure, Math.round(c.pressure_msl) + ' hPa') +
        fact('💧', U.humidity, num(c.relative_humidity_2m) + '%') + fact('🔆', U.uv, num(d.uv_index_max[0], 1)) +
        fact('🌅', U.sunrise, hhmm(d.sunrise[0])) + fact('🌇', U.sunset, hhmm(d.sunset[0])) + '</div>';

      slot('hours').innerHTML = '<div class="wx-hgrid">' + hoursOf(h, today).map(function (i) { return hourCard(h, i); }).join('') + '</div>';

      slot('week').innerHTML = '<div class="wx-days">' + d.time.map(function (iso, i) {
        var wi = wx(d.weather_code[i], 1);
        return '<div class="wx-d"><div class="wx-t"><b>' + esc(dayName(iso)) + '</b> ' + dm(iso) + '</div><div class="wx-row"><span class="wx-ico">' + wi[0] + '</span><div class="wx-mm2"><b>' + num(d.temperature_2m_max[i]) + '°</b><span>' + num(d.temperature_2m_min[i]) + '°</span></div></div>' +
          '<div class="wx-rain">☂ ' + num(d.precipitation_probability_max[i]) + '%</div><div class="wx-mm">' + num(d.precipitation_sum[i], 1) + ' mm</div>' +
          '<div class="wx-wind">' + num(d.wind_speed_10m_max[i]) + '-' + num(d.wind_gusts_10m_max[i]) + ' <small>km/h</small></div>' +
          '<div class="wx-dir">' + arrow(d.wind_direction_10m_dominant[i]) + ' ' + dirName(d.wind_direction_10m_dominant[i]) + '</div>' +
          '<button class="wx-btn" type="button" data-day="' + iso + '" aria-expanded="false">' + esc(U.details) + '</button></div>';
      }).join('') + '</div><div class="wx-daydetail" hidden></div>';
      var detail = $('.wx-daydetail');
      slot('week').addEventListener('click', function (e) {
        var b = e.target.closest('[data-day]'); if (!b) return;
        var open = b.getAttribute('aria-expanded') === 'true';
        slot('week').querySelectorAll('[data-day]').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
        if (open) { detail.hidden = true; return; }
        b.setAttribute('aria-expanded', 'true');
        detail.innerHTML = '<h3>' + esc(dayName(b.dataset.day, true)) + ' ' + dm(b.dataset.day) + '</h3><div class="wx-hgrid">' + hoursOf(h, b.dataset.day).map(function (i) { return hourCard(h, i); }).join('') + '</div>';
        detail.hidden = false; detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      /* sea */
      if (m && m.current) {
        var mc = m.current, wh = mc.wave_height, ws = c.wind_speed_10m, gu = c.wind_gusts_10m;
        var st = wh == null ? -1 : wh < 0.5 ? 0 : wh < 1.25 ? 1 : wh < 2.5 ? 2 : 3;
        var swim = wh == null ? -1 : (wh < 0.5 && gu < 35) ? 0 : (wh < 1 && gu < 45) ? 1 : 2;
        var fish = wh == null ? -1 : (wh < 1 && ws < 25) ? 0 : (wh < 1.75 && ws < 35) ? 1 : 2;
        var lvl = [U.good, U.fair, U.bad], cls = ['sea-0', 'sea-2', 'sea-3'];
        slot('sea').innerHTML = '<div class="wx-sea-main"><span class="wx-big-ico" aria-hidden="true">🌊</span><div><div class="wx-big">' + (wh == null ? '–' : num(wh, 1) + ' m') + '</div>' +
          (st >= 0 ? '<span class="sea-state sea-' + st + '">' + esc(C.seaStates[st]) + '</span>' : '') + '</div></div>' +
          '<div class="wx-facts">' + fact('🌡️', U.water, num(mc.sea_surface_temperature) + '°') + fact('⏱️', U.period, num(mc.wave_period) + ' s') +
          fact(arrow(mc.wave_direction), U.dir, dirName(mc.wave_direction)) + fact('💨', U.wind, kmh(ws)) + '</div>' +
          '<div class="wx-idx">' + (swim >= 0 ? '<div><span>🏊 ' + esc(U.swim) + '</span><b class="sea-state ' + cls[swim] + '">' + esc(lvl[swim]) + '</b></div>' : '') +
          (fish >= 0 ? '<div><span>🎣 ' + esc(U.fish) + '</span><b class="sea-state ' + cls[fish] + '">' + esc(lvl[fish]) + '</b></div>' : '') + '</div>' +
          (m.daily ? '<div class="wx-seadays">' + m.daily.time.map(function (iso, i) { return '<div><small>' + esc(dayName(iso)) + '</small><b>' + num(m.daily.wave_height_max[i], 1) + ' m</b></div>'; }).join('') + '</div>' : '');
      } else fail('sea');

      /* tide from modelled sea level */
      if (m && m.hourly && m.hourly.sea_level_height_msl && m.hourly.sea_level_height_msl.some(function (v) { return v != null; })) {
        var T = m.hourly.time, L = m.hourly.sea_level_height_msl, ev = [];
        for (var i = 1; i < L.length - 1; i++) {
          if (L[i] == null || L[i - 1] == null || L[i + 1] == null) continue;
          if (L[i] > L[i - 1] && L[i] >= L[i + 1]) ev.push({ t: T[i], v: L[i], hi: true });
          if (L[i] < L[i - 1] && L[i] <= L[i + 1]) ev.push({ t: T[i], v: L[i], hi: false });
        }
        var two = T.slice(0, 48), vals = L.slice(0, 48).map(function (v) { return v == null ? 0 : v; });
        var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), W = 600, H = 120;
        var pts = vals.map(function (v, i) { return (i * W / 47).toFixed(1) + ',' + (H - 10 - (v - mn) / ((mx - mn) || 1) * (H - 20)).toFixed(1); }).join(' ');
        var nowIdx = two.indexOf(c.time.slice(0, 13) + ':00');
        slot('tide').innerHTML = '<div class="wx-tides">' + ev.filter(function (e) { return e.t.slice(0, 10) <= d.time[1]; }).map(function (e) {
          return '<div class="' + (e.hi ? 'hi' : 'lo') + '"><span>' + (e.hi ? '⬆ ' + esc(U.high) : '⬇ ' + esc(U.low)) + '</span><b>' + hhmm(e.t) + '</b><small>' + (e.t.slice(0, 10) === today ? '' : esc(dayName(e.t.slice(0, 10)))) + ' ' + num(e.v, 2) + ' m</small></div>';
        }).join('') + '</div>' +
          '<svg class="wx-tidechart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(U.tide) + '"><polyline points="' + pts + '" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
          (nowIdx >= 0 ? '<line x1="' + (nowIdx * W / 47).toFixed(1) + '" x2="' + (nowIdx * W / 47).toFixed(1) + '" y1="0" y2="' + H + '" stroke="var(--amber)" stroke-width="2" stroke-dasharray="4 4"/>' : '') + '</svg>';
      } else fail('tide');

      /* sun & moon */
      var mt = moonTimes(new Date(), C.lat, C.lng), il = moonIllum(new Date());
      var ph = Math.floor(il.phase * 8 + 0.5) % 8, em = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][ph];
      var dl = d.daylight_duration ? d.daylight_duration[0] : null;
      slot('sun').innerHTML = '<div class="wx-facts wx-facts-2">' +
        fact('🌅', U.sunrise, hhmm(d.sunrise[0])) + fact('🌇', U.sunset, hhmm(d.sunset[0])) +
        (dl ? fact('☀️', lang === 'ar' ? 'طول النهار' : lang === 'fr' ? 'Durée du jour' : lang === 'es' ? 'Duración del día' : 'Day length', Math.floor(dl / 3600) + 'h ' + ('0' + Math.round(dl % 3600 / 60)).slice(-2)) : '') +
        fact('🌙', U.moonrise, mt.rise ? fmtTime(mt.rise) : '—') + fact('🌘', U.moonset, mt.set ? fmtTime(mt.set) : '—') +
        fact(em, U.phase, esc(U.phases[ph])) + fact('💡', U.illum, num(il.fraction * 100) + '%') + '</div>';
    }).catch(function () { ['now', 'hours', 'week', 'sea', 'sun', 'tide'].forEach(fail); });
  }

  /* ================= PRAYER ================= */
  if (C.tool === 'prayer') {
    var KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    var base = 'latitude=' + C.lat + '&longitude=' + C.lng + '&method=' + C.method + (C.tune ? '&tune=' + encodeURIComponent(C.tune) : '') + (C.hijriAdj ? '&adjustment=' + C.hijriAdj : '');
    var t5 = function (x) { return String(x).slice(0, 5); };
    var mins = function (x) { var p = t5(x).split(':'); return +p[0] * 60 + +p[1]; };
    var hijriTxt = function (h) { return lang === 'ar' ? (h.weekday.ar + ' ' + (+h.day) + ' ' + h.month.ar + ' ' + h.year + ' هـ') : (+h.day + ' ' + h.month.en + ' ' + h.year + ' AH'); };
    var qibla = (function () {
      var r = Math.PI / 180, p1 = C.lat * r, p2 = 21.4225 * r, dl = (39.8262 - C.lng) * r;
      var b = Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl));
      return (b / r + 360) % 360;
    })();
    var now = new Date(), ds = ('0' + now.getDate()).slice(-2) + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + now.getFullYear();
    var timer = null;
    get('https://api.aladhan.com/v1/timings/' + ds + '?' + base).then(function (r) {
      var T = r.data.timings, hj = r.data.date.hijri;
      var render = function () {
        var n = new Date(), cur = n.getHours() * 60 + n.getMinutes(), sec = n.getSeconds();
        var next = KEYS.filter(function (k) { return k !== 'Sunrise' && mins(T[k]) > cur; })[0] || 'Fajr';
        var left = (mins(T[next]) - cur + 1440) % 1440 * 60 - sec; if (left < 0) left += 86400;
        var hh = Math.floor(left / 3600), mm = Math.floor(left % 3600 / 60), ss = left % 60;
        slot('today').innerHTML =
          '<div class="pr-head"><div><p class="pr-hijri">' + esc(hijriTxt(hj)) + '</p><p class="pr-greg">' + new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(n) + ' · ' + esc(C.place) + '</p></div>' +
          '<div class="pr-next"><small>' + esc(U.next) + '</small><b>' + esc(C.prayers[next]) + ' ' + t5(T[next]) + '</b><span class="pr-count" dir="ltr">' + hh + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2) + '</span></div></div>' +
          '<ul class="pr-grid">' + KEYS.map(function (k) { return '<li' + (k === next ? ' class="is-next"' : '') + '><span>' + esc(C.prayers[k]) + '</span><b>' + t5(T[k]) + '</b></li>'; }).join('') + '</ul>' +
          '<p class="pr-qibla">🧭 ' + esc(U.qibla) + ': <b>' + qibla.toFixed(1) + '°</b> ' + esc(U.qiblaTxt) + '</p>';
      };
      render(); timer = setInterval(render, 1000);
    }).catch(function () { fail('today'); });

    var y = now.getFullYear(), mo = now.getMonth() + 1;
    var loadMonth = function () {
      slot('month').innerHTML = '<div class="live-skel"></div>';
      get('https://api.aladhan.com/v1/calendar/' + y + '/' + mo + '?' + base).then(function (r) {
        var rows = r.data, todayKey = ds;
        slot('mtitle').textContent = U.month + ' — ' + new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(new Date(y, mo - 1, 15)) +
          ' / ' + (lang === 'ar' ? rows[0].date.hijri.month.ar : rows[0].date.hijri.month.en) + (rows[rows.length - 1].date.hijri.month.number !== rows[0].date.hijri.month.number ? ' – ' + (lang === 'ar' ? rows[rows.length - 1].date.hijri.month.ar : rows[rows.length - 1].date.hijri.month.en) : '') + ' ' + rows[0].date.hijri.year;
        slot('month').innerHTML = '<div class="tbl-scroll"><table><thead><tr><th>' + esc(U.day) + '</th><th>' + esc(U.date) + '</th><th>' + esc(U.hijri) + '</th>' +
          KEYS.map(function (k) { return '<th>' + esc(C.prayers[k]) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (d) {
            var g = d.date.gregorian, h = d.date.hijri, wd = U.days[new Date(+g.year, +g.month.number - 1, +g.day).getDay()];
            return '<tr' + (g.date === todayKey ? ' class="is-today"' : '') + (new Date(+g.year, +g.month.number - 1, +g.day).getDay() === 5 ? ' data-fri' : '') + '><td>' + esc(wd) + '</td><td>' + (+g.day) + '/' + (+g.month.number) + '</td><td>' + (+h.day) + ' ' + esc(lang === 'ar' ? h.month.ar : h.month.en) + '</td>' +
              KEYS.map(function (k) { return '<td>' + t5(d.timings[k]) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div>';
      }).catch(function () { fail('month'); });
    };
    loadMonth();
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-m]');
      if (b) { mo += +b.dataset.m; if (mo < 1) { mo = 12; y--; } if (mo > 12) { mo = 1; y++; } loadMonth(); }
      if (e.target.closest('[data-print]')) window.print();
    });
  }

  /* ================= moon (after SunCalc by V. Agafonkin, BSD-2) ================= */
  function moonMath() {
    var PI = Math.PI, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, atan = Math.atan2, acos = Math.acos, rad = PI / 180;
    var dayMs = 864e5, J1970 = 2440588, J2000 = 2451545, e = rad * 23.4397;
    var toDays = function (d) { return d.valueOf() / dayMs - 0.5 + J1970 - J2000; };
    var ra = function (l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); };
    var dec = function (l, b) { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); };
    var alt = function (H, phi, d) { return asin(sin(phi) * sin(d) + cos(phi) * cos(d) * cos(H)); };
    var sid = function (d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; };
    var refr = function (h) { if (h < 0) h = 0; return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179)); };
    var sun = function (d) { var M = rad * (357.5291 + 0.98560028 * d), C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), L = M + C + rad * 102.9372 + PI; return { dec: dec(L, 0), ra: ra(L, 0) }; };
    var moon = function (d) { var L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.22935 * d), l = L + rad * 6.289 * sin(M), b = rad * 5.128 * sin(F); return { ra: ra(l, b), dec: dec(l, b), dist: 385001 - 20905 * cos(M) }; };
    var pos = function (date, lat, lng) { var lw = rad * -lng, phi = rad * lat, d = toDays(date), c = moon(d), H = sid(d, lw) - c.ra, h = alt(H, phi, c.dec); return h + refr(h); };
    return {
      illum: function (date) {
        var d = toDays(date), s = sun(d), m = moon(d), sd = 149598000;
        var phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra));
        var inc = atan(sd * sin(phi), m.dist - sd * cos(phi));
        var ang = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
        return { fraction: (1 + cos(inc)) / 2, phase: 0.5 + 0.5 * inc * (ang < 0 ? -1 : 1) / PI };
      },
      times: function (date, lat, lng) {
        var t = new Date(date); t.setHours(0, 0, 0, 0);
        var later = function (h) { return new Date(t.valueOf() + h * dayMs / 24); };
        var hc = 0.133 * rad, h0 = pos(t, lat, lng) - hc, h1, h2, rise, set, a, b, xe, ye, dd, roots, x1, x2, dx;
        for (var i = 1; i <= 24; i += 2) {
          h1 = pos(later(i), lat, lng) - hc; h2 = pos(later(i + 1), lat, lng) - hc;
          a = (h0 + h2) / 2 - h1; b = (h2 - h0) / 2; xe = -b / (2 * a); ye = (a * xe + b) * xe + h1; dd = b * b - 4 * a * h1; roots = 0;
          if (dd >= 0) { dx = Math.sqrt(dd) / (Math.abs(a) * 2); x1 = xe - dx; x2 = xe + dx; if (Math.abs(x1) <= 1) roots++; if (Math.abs(x2) <= 1) roots++; if (x1 < -1) x1 = x2; }
          if (roots === 1) { if (h0 < 0) rise = i + x1; else set = i + x1; } else if (roots === 2) { rise = i + (ye < 0 ? x2 : x1); set = i + (ye < 0 ? x1 : x2); }
          if (rise && set) break;
          h0 = h2;
        }
        return { rise: rise ? later(rise) : null, set: set ? later(set) : null };
      }
    };
  }
  function moonTimes(d, lat, lng) { return moonMath().times(d, lat, lng); }
  function moonIllum(d) { return moonMath().illum(d); }
})();
