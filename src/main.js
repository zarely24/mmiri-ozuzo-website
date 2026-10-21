/* Mmiri Ozuzo — progressive enhancement. No dependencies, no storage, no network requests
   except the OpenStreetMap iframe that the visitor explicitly asks for. */
(function () {
  'use strict';
  var html = document.documentElement;
  html.className = html.className.replace('no-js', 'js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dataEl = $('#site-data');
  var DATA = {};
  try { DATA = JSON.parse(dataEl ? dataEl.textContent : '{}'); } catch (e) { DATA = {}; }

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(m) {
    if (!toastEl) return;
    toastEl.textContent = m; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- hero image: fade/scale in once decoded ---------- */
  var hero = $('#hero');
  if (hero) {
    var heroImg = $('.hero-media img', hero);
    var ready = function () { hero.classList.add('is-loaded'); };
    if (!heroImg) ready();
    else if (heroImg.complete && heroImg.naturalWidth) ready();
    else { heroImg.addEventListener('load', ready); heroImg.addEventListener('error', ready); setTimeout(ready, 2500); }
  }

  /* ---------- nav ---------- */
  var nav = $('#nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 24); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  var burger = $('#burger'), mnav = $('#mnav'), mcta = $('#mcta');
  var mctaWanted = false;
  function setMenu(open) {
    if (!mnav || !burger) return;
    mnav.classList.toggle('open', open);
    if (nav) nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? DATA.strings.menuClose : DATA.strings.menuOpen);
    html.classList.toggle('lock', open);
    if (mcta) mcta.classList.toggle('show', !open && mctaWanted);
    if (open) { var first = $('a', mnav); if (first) first.focus(); } else { burger.focus(); }
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    mnav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a,button', mnav).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- mobile CTA bar: hide while the hero booking button is on screen ---------- */
  var heroBook = $('#heroBook');
  if (mcta) {
    html.classList.add('has-mcta');
    if (heroBook && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          mctaWanted = !e.isIntersecting;
          if (!(mnav && mnav.classList.contains('open'))) mcta.classList.toggle('show', mctaWanted);
        });
      }, { threshold: 0.1 }).observe(heroBook);
    } else { mctaWanted = true; mcta.classList.add('show'); }
  }

  /* ---------- reveal on scroll (in-viewport elements marked synchronously: no flash) ---------- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var vh = window.innerHeight || 800;
    var pending = reveals.filter(function (el) { var r = el.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) { el.classList.add('in'); return false; } return true; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    pending.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- active section in nav ---------- */
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('.nav-links a').forEach(function (a) { a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['shop', 'services', 'story', 'gallery', 'visit'].forEach(function (id) { var s = document.getElementById(id); if (s) secIO.observe(s); });
  }

  /* ---------- open / closed status in Europe/Athens ---------- */
  function athensNow(tz) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var g = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
      var d = (g('weekday') || '').toLowerCase().slice(0, 3);
      var h = parseInt(g('hour'), 10), m = parseInt(g('minute'), 10);
      if (h === 24) h = 0;
      if (!/^(mon|tue|wed|thu|fri|sat|sun)$/.test(d) || isNaN(h) || isNaN(m)) return null;
      return { d: d, min: h * 60 + m };
    } catch (e) { return null; }
  }
  var toMin = function (s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };
  var fill = function (s, o) { return s.replace(/\{\{(\w+)\}\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); };
  function refreshStatus() {
    if (!DATA.hours) return;
    var S = DATA.strings.status, days = DATA.strings.days, order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var now = athensNow(DATA.hours.tz); if (!now) return;
    var today = DATA.hours.week[now.d];
    var open = !!today && now.min >= toMin(today[0]) && now.min < toMin(today[1]);
    var msg = '';
    if (open) msg = fill(S.closes, { time: today[1] });
    else {
      var di = order.indexOf(now.d);
      for (var i = 0; i < 8; i++) {
        var key = order[(di + i) % 7], o = DATA.hours.week[key];
        if (!o) continue;
        if (i === 0 && now.min >= toMin(o[0])) continue;
        msg = i === 0 ? fill(S.opensToday, { time: o[0] }) : i === 1 ? fill(S.opensTomorrow, { time: o[0] }) : fill(S.opensOn, { day: days[key], time: o[0] });
        break;
      }
    }
    $$('.js-open-note').forEach(function (el) { el.textContent = msg; });
    $$('.js-status-pill').forEach(function (p) { p.classList.toggle('is-open', open); var s = $('span', p); if (s) s.textContent = open ? S.open : S.closed; });
    $$('#hoursList li').forEach(function (li) { li.classList.toggle('today', li.getAttribute('data-day') === now.d); });
  }
  refreshStatus(); setInterval(refreshStatus, 60000);

  /* ---------- click-to-load map (no connection before the click) ---------- */
  $$('.js-load-map').forEach(function (b) {
    b.addEventListener('click', function () {
      var slot = $('#mapSlot'); if (!slot) return;
      var f = document.createElement('iframe');
      f.setAttribute('title', slot.getAttribute('data-title') || 'Map');
      f.setAttribute('loading', 'lazy');
      f.setAttribute('referrerpolicy', 'no-referrer');
      f.src = slot.getAttribute('data-src');
      slot.innerHTML = ''; slot.appendChild(f);
      toast(DATA.strings.mapLoaded);
    });
  });

  /* ---------- copy phone ---------- */
  $$('.js-copy-phone').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { toast(DATA.strings.copied); }, fail = function () { toast(DATA.strings.copyFail); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(DATA.phoneDisplay).then(done, fail); else fail();
    });
  });

  /* ---------- gallery lightbox ---------- */
  var items = $$('.g-item'), lb = $('#lightbox');
  var closeLb = null;
  if (items.length && lb) {
    var lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbIdx = $('#lbIdx'), gIdx = 0, lastFocus = null;
    var openLb = function (i) {
      gIdx = (i + items.length) % items.length;
      var f = items[gIdx], cap = f.getAttribute('data-cap') || '';
      lbImg.src = f.getAttribute('data-full'); lbImg.alt = f.getAttribute('aria-label') || cap; lbCap.textContent = cap; lbIdx.textContent = (gIdx + 1) + ' / ' + items.length;
      if (lb.hidden) { lastFocus = document.activeElement; lb.hidden = false; requestAnimationFrame(function () { lb.classList.add('open'); }); html.classList.add('lock'); $('#lbClose').focus(); }
    };
    closeLb = function () { lb.classList.remove('open'); setTimeout(function () { lb.hidden = true; html.classList.remove('lock'); if (lastFocus) lastFocus.focus(); }, 300); };
    items.forEach(function (f, i) { f.addEventListener('click', function () { openLb(i); }); });
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { openLb(gIdx - 1); });
    $('#lbNext').addEventListener('click', function () { openLb(gIdx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') openLb(gIdx - 1);
      if (e.key === 'ArrowRight') openLb(gIdx + 1);
      if (e.key === 'Tab') { var f = $$('button', lb); var first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ---------- Escape closes overlays ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lb && !lb.hidden && closeLb) closeLb();
    if (mnav && mnav.classList.contains('open')) setMenu(false);
  });
})();
