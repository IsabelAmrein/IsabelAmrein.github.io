(function () {
  'use strict';
  var root = document.documentElement;

  /* ---- Tema claro/oscuro ---- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      document.dispatchEvent(new Event('themechange'));
    });
  }

  /* ---- Filtro por tema en la lista de artículos ---- */
  var filters = document.querySelectorAll('[data-filter]');
  if (filters.length) {
    var rows = document.querySelectorAll('[data-tags]');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.getAttribute('data-filter');
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        rows.forEach(function (li) {
          var has = !tag || li.getAttribute('data-tags').split(',').indexOf(tag) > -1;
          li.hidden = !has;
        });
      });
    });
  }

  /* ---- Botón copiar en bloques de código ---- */
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code || !navigator.clipboard) return;
    var b = document.createElement('button');
    b.className = 'copy';
    b.type = 'button';
    b.textContent = root.lang === 'en' ? 'Copy' : 'Copiar';
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(code.innerText).then(function () {
        var old = b.textContent;
        b.textContent = root.lang === 'en' ? 'Copied' : 'Copiado';
        setTimeout(function () { b.textContent = old; }, 1500);
      });
    });
    pre.appendChild(b);
  });


  /* ---- Animaciones suaves: aparición al hacer scroll, cajitas por partes y brújula ---- */
  if (root.classList.contains('anim')) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.prose > *').forEach(function (el) {
      if (!el.classList.contains('steps')) el.classList.add('reveal');
      io.observe(el);
    });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.tiles>li,.elist>li,.section .wrap>h2,.section .wrap>.lede,.section .wrap>.filters,.prose-head,.author-box,.post-foot').forEach(function (el) { io2.observe(el); });
    root.classList.add('rv-ok');
    var motifs = document.querySelectorAll('.post-head .motif, .hero-page .hero-art .motif');
    requestAnimationFrame(function () { motifs.forEach(function (m) { m.classList.add('play'); }); });
  }

  /* ---- Sugerencia de idioma: se respeta lo que el visitante elige y no se redirige a la fuerza ---- */
  (function () {
    var sw = document.querySelector('.lang-switch');
    if (sw) sw.addEventListener('click', function () { try { localStorage.setItem('lang', sw.getAttribute('data-lang')); } catch (e) {} });
    var pref = null; try { pref = localStorage.getItem('lang'); } catch (e) {}
    if (pref) return;
    var want = null, langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length && !want; i++) { var c = (langs[i] || '').slice(0, 2).toLowerCase(); if (c === 'es' || c === 'en') want = c; }
    if (!want || want === root.lang) return;
    var alt = document.querySelector('link[rel="alternate"][hreflang="' + want + '"]');
    if (!alt) return;
    var txt = { es: ['Esta página también está disponible en español.', 'Verla en español'], en: ['This page is also available in English.', 'Read in English'] }[want];
    var bar = document.createElement('div'); bar.className = 'lang-hint'; bar.setAttribute('role', 'complementary'); bar.setAttribute('aria-label', want === 'en' ? 'Language suggestion' : 'Sugerencia de idioma'); bar.lang = want;
    var s = document.createElement('span'); s.textContent = txt[0];
    var a = document.createElement('a'); a.href = new URL(alt.href, location.href).pathname; a.textContent = txt[1]; a.hreflang = want;
    a.addEventListener('click', function () { try { localStorage.setItem('lang', want); } catch (e) {} });
    var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', want === 'es' ? 'Cerrar' : 'Close');
    x.addEventListener('click', function () { try { localStorage.setItem('lang', root.lang); } catch (e) {} bar.remove(); });
    bar.appendChild(s); bar.appendChild(a); bar.appendChild(x);
    var head = document.querySelector('.site-head'); if (head && head.parentNode) head.parentNode.insertBefore(bar, head.nextSibling);
  })();

  /* ---- Pausa de la animación de la portada ---- */
  var ex = document.querySelector('.ex') || document.querySelector('.hero-full'), pb = document.querySelector('.ex-pause');
  if (ex && pb) pb.addEventListener('click', function () {
    var on = ex.classList.toggle('paused'); var hh = ex.closest('.hero'); if (hh) hh.classList.toggle('paused', on); pb.setAttribute('aria-pressed', on ? 'true' : 'false');
    var l = on ? pb.getAttribute('data-play') : pb.getAttribute('data-pause'); pb.setAttribute('aria-label', l); pb.title = l;
  });

  /* ---- Aviso en los diagramas que se deslizan en pantallas pequeñas ---- */
  var figs = document.querySelectorAll('figure.diagram');
  function pistas() {
    figs.forEach(function (f) {
      var h = f.querySelector('.scroll-hint'), mide = f.scrollWidth > f.clientWidth + 4;
      f.classList.toggle('is-scroll', mide);
      if (mide) { f.tabIndex = 0; var cap = f.querySelector('figcaption'), sv = f.querySelector('svg[aria-label]');
        if (cap) { if (!cap.id) cap.id = 'fc-' + Math.random().toString(36).slice(2, 8); f.setAttribute('aria-labelledby', cap.id); } else if (sv) f.setAttribute('aria-label', sv.getAttribute('aria-label')); }
      else { f.removeAttribute('tabindex'); f.removeAttribute('aria-labelledby'); f.removeAttribute('aria-label'); }
      if (mide && !h) { h = document.createElement('p'); h.className = 'scroll-hint'; h.textContent = root.lang === 'en' ? 'Swipe to see the whole diagram →' : 'Desliza para ver el diagrama completo →'; f.insertBefore(h, f.firstChild); }
    });
  }
  if (figs.length) { pistas(); window.addEventListener('resize', pistas); window.addEventListener('load', pistas); }

  /* ---- Vista alternativa: botones para cambiar entre dos vistas (sin JavaScript se ven las dos) ---- */
  document.querySelectorAll('[data-vista]').forEach(function (v) {
    var tabs = Array.prototype.slice.call(v.querySelectorAll('[role="tab"]')), panels = Array.prototype.slice.call(v.querySelectorAll('[role="tabpanel"]'));
    function elegir(i, foco) {
      tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
      if (foco) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { elegir(i); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length; else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); elegir(n, true); }
      });
    });
    v.classList.add('js'); elegir(0);
  });

  /* ---- Orbes vivos junto a los proyectos «en marcha» ---- */
  var vivos = document.querySelectorAll('.orb-live');
  if (vivos.length && window.ThinkingOrbs) {
    var oscuro = function () { return root.getAttribute('data-theme') !== 'light'; };
    var color = function (el) { return getComputedStyle(el).getPropertyValue('--accent').trim(); };
    var lista = Array.prototype.map.call(vivos, function (cv) { return { cv: cv, orb: ThinkingOrbs.mount(cv, { state: 'composing', size: 20, dark: oscuro(), color: color(cv) }) }; });
    document.addEventListener('themechange', function () { lista.forEach(function (o) { o.orb.update({ dark: oscuro(), color: color(o.cv) }); }); });
  }

  /* ---- Indicador "pensando": aparece solo si cargar algo tarda más de 140 ms ---- */
  var think = document.getElementById('think');
  if (think && window.ThinkingOrbs) {
    var orb = null, timer = 0;
    var isDark = function () { return root.getAttribute('data-theme') !== 'light'; };
    var tint = function () { return getComputedStyle(document.body).getPropertyValue('--accent').trim(); };
    var show = function (state, delay) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        think.hidden = false;
        if (!orb) orb = ThinkingOrbs.mount(think.querySelector('canvas'), { state: state, size: 32, dark: isDark(), color: tint() });
        else { orb.update({ state: state, dark: isDark(), color: tint() }); orb.resume(); }
      }, delay);
    };
    var hide = function () { clearTimeout(timer); think.hidden = true; if (orb) orb.pause(); };
    document.addEventListener('themechange', function () { if (orb) orb.update({ dark: isDark(), color: tint() }); });
    var demo = /[?&]orbs\b/.test(location.search);
    if (demo) { show('composing', 0); setTimeout(hide, 4000); }
    else if (document.readyState !== 'complete') { show('composing', 140); window.addEventListener('load', hide); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      show('composing', 140);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) hide(); });
  }
})();
