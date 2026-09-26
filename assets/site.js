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
})();
