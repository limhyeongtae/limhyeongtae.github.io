// Mobile menu, sub-menus, publication filter, image lightbox, research sub-nav highlight.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.sub-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.parentElement, open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  // close the mobile menu after choosing an in-page link
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    a.addEventListener('click', function () { if (nav) nav.classList.remove('open'); });
  });

  // publication filter
  var buttons = document.querySelectorAll('.filters button');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      buttons.forEach(function (x) { x.classList.toggle('on', x === b); });
      var f = b.getAttribute('data-filter');
      document.querySelectorAll('.pub').forEach(function (p) {
        p.classList.toggle('hide', f === 'first' && p.getAttribute('data-first') !== '1');
      });
      document.querySelectorAll('.year-group').forEach(function (g) {
        g.classList.toggle('empty', !g.querySelector('.pub:not(.hide)'));
      });
    });
  });

  // lightbox
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var img = lb.querySelector('img');
    document.querySelectorAll('a.zoom').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        img.src = a.getAttribute('href');
        var inner = a.querySelector('img');
        img.alt = inner ? inner.alt : '';
        lb.hidden = false;
      });
    });
    var close = function () { lb.hidden = true; img.src = ''; };
    lb.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) close(); });
  }

  // citation numbers: refreshed weekly in assets/data/scholar.json by a GitHub Action
  var live = document.querySelectorAll('[data-scholar]');
  if (live.length && window.fetch) {
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    fetch('assets/data/scholar.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        live.forEach(function (el) {
          var k = el.getAttribute('data-scholar');
          if (k === 'updated' && d.updated) {
            var p = d.updated.split('-');
            el.textContent = MON[parseInt(p[1], 10) - 1] + ' ' + p[0];
          } else if (d[k] != null) {
            el.textContent = d[k];
          }
        });
      })
      .catch(function () { /* keep the numbers written into the page */ });
  }

  // research sub-nav: mark the section in view
  var links = document.querySelectorAll('.subnav a');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = map[en.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.rsec').forEach(function (s) { io.observe(s); });
  }
})();
