/* Shared behaviour for the guides section.
   Language toggle (shared with index.html / agents.html through the
   'as-lang' localStorage key), scroll reveal, reading progress and
   the auto-built table of contents. */
(function () {
  var root = document.getElementById('top');
  function isEn() { return root.getAttribute('dir') === 'ltr'; }

  /* ---------- table of contents ---------- */
  var toc = document.getElementById('toc-list');
  var headings = [].slice.call(document.querySelectorAll('.art h2'));

  headings.forEach(function (h, i) {
    if (!h.id) h.id = 'sec-' + (i + 1);
  });

  function buildToc() {
    if (!toc) return;
    toc.innerHTML = '';
    headings.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      toc.appendChild(li);
    });
  }

  function markToc() {
    if (!toc) return;
    var links = toc.querySelectorAll('a');
    var active = -1;
    headings.forEach(function (h, i) {
      if (h.getBoundingClientRect().top <= 140) active = i;
    });
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('on', i === active);
    }
  }

  /* ---------- language ---------- */
  function applyLang(en) {
    root.setAttribute('dir', en ? 'ltr' : 'rtl');
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.he) el.dataset.he = el.innerHTML;
      el.innerHTML = en ? el.dataset.en : el.dataset.he;
    });
    document.querySelectorAll('[data-en-aria]').forEach(function (el) {
      if (!el.dataset.heAria) el.dataset.heAria = el.getAttribute('aria-label');
      el.setAttribute('aria-label', en ? el.dataset.enAria : el.dataset.heAria);
    });
    document.documentElement.lang = en ? 'en' : 'he';
    var label = document.getElementById('lang-label');
    if (label) label.textContent = en ? 'עב' : 'EN';
    try { localStorage.setItem('as-lang', en ? 'en' : 'he'); } catch (err) {}
    buildToc();   // the headings just changed language
    markToc();
  }

  var toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.addEventListener('click', function () { applyLang(!isEn()); });

  /* ---------- reveal ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('[data-reveal]'));
  revealEls.forEach(function (el, i) {
    if (el.getBoundingClientRect().top > window.innerHeight * 1.05) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
    }
  });
  function sweep() {
    revealEls.forEach(function (el) {
      if (el.style.opacity === '0' && el.getBoundingClientRect().top < window.innerHeight) {
        el.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }

  /* ---------- reading progress ---------- */
  var bar = document.getElementById('progress-bar');
  function progress() {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.pageYOffset / max) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }

  function onScroll() { sweep(); progress(); markToc(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  buildToc();
  try { if (localStorage.getItem('as-lang') === 'en') applyLang(true); } catch (err) {}
  onScroll();
})();
