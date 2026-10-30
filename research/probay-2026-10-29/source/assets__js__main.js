/* ==========================================================================
   Probay — site behaviour (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SITE CONFIG — change contact details here once; every page updates.
     ------------------------------------------------------------------ */
  var SITE = {
    phoneDisplay: '+91 84474 52345',
    phoneDial: '+918447452345',
    whatsapp: '918447452345',          // country code + number, no "+"
    email: 'hello@probay.in',
    leadEndpoint: 'https://n8n.srv1323284.hstgr.cloud/webhook/probay-lead',                  // n8n Production URL of "Website form (Webhook)" node, e.g. 'https://n8n.example.com/webhook/probay-lead' — see tools/n8n-probay-leads.json
    ga4Id: 'G-M6TPF28DMF',             // GA4 Measurement ID, e.g. 'G-ABC123XYZ9'. Empty = GA4 off.
    clarityId: '',                     // Microsoft Clarity project ID (heatmaps/recordings). Empty = off.
    trackHost: 'probay.in'             // tags load only on this host; elsewhere events are logged to the console
  };

  /* ------------------------------------------------------------------
     ANALYTICS — GA4 + optional Clarity, loaded once from here for every page.
     Key events to mark in GA4 (Admin → Events): generate_lead, whatsapp_click, phone_click.
     ------------------------------------------------------------------ */
  var live = location.hostname === SITE.trackHost;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  if (live && SITE.ga4Id) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + SITE.ga4Id;
    document.head.appendChild(gs);
    window.gtag('js', new Date());
    window.gtag('config', SITE.ga4Id);
  }
  if (live && SITE.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', SITE.clarityId);
  }
  function track(name, params) {
    params = params || {};
    params.page_file = location.pathname.split('/').pop() || 'index.html';
    if (live && SITE.ga4Id) window.gtag('event', name, params);
    else if (window.console) console.info('[track]', name, params);
  }
  window.probayTrack = track; // used by calculator.js

  var ICONS = {
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/>',
    xcircle: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.2L7 22l5-3 5 3-1.2-8.8"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    bank: '<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20M6 15h4"/>',
    trending: '<path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'
  };

  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  doc.documentElement.classList.add('js');

  function svg(name) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Icons ---------- */
  $$('[data-icon]').forEach(function (el) {
    el.outerHTML = svg(el.getAttribute('data-icon'));
  });

  /* ---------- Contact details from config ---------- */
  function waLink(text) {
    return 'https://wa.me/' + SITE.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  $$('[data-phone]').forEach(function (a) {
    a.setAttribute('href', 'tel:' + SITE.phoneDial);
    var t = $('[data-phone-text]', a);
    if (t) t.textContent = SITE.phoneDisplay;
  });
  $$('[data-email]').forEach(function (a) {
    a.setAttribute('href', 'mailto:' + SITE.email);
    var t = $('[data-email-text]', a);
    if (t) t.textContent = SITE.email;
  });
  $$('[data-wa]').forEach(function (a) {
    var msg = a.getAttribute('data-wa') || 'Hi, I need help with company registration.';
    a.setAttribute('href', waLink(msg));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Conversion clicks: WhatsApp / call / email ---------- */
  function linkLocation(a) {
    var zones = [['#c-wa', 'calculator'], ['.wa-float', 'floating_button'], ['.mobile-cta', 'mobile_bar'],
      ['.topbar', 'topbar'], ['.header', 'header'], ['.form-success', 'form_success'], ['.lead-card', 'lead_card'],
      ['.hero', 'hero'], ['.cta-band', 'cta_band'], ['.footer', 'footer']];
    for (var i = 0; i < zones.length; i++) if (a.closest(zones[i][0])) return zones[i][1];
    return 'content';
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var name = /^https:\/\/wa\.me\//.test(href) ? 'whatsapp_click' : /^tel:/.test(href) ? 'phone_click' : /^mailto:/.test(href) ? 'email_click' : '';
    if (name) track(name, { link_location: linkLocation(a) });
  });

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---------- Pages not built yet (remove data-soon once a page exists) ---------- */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-soon]');
    if (!a) return;
    e.preventDefault();
    toast('This page is being built — it goes live in the next phase.');
  });

  /* ---------- Header ---------- */
  var header = $('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = doc.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = svg(open ? 'close' : 'menu');
    });
  }
  var mobileNav = window.matchMedia('(max-width: 980px)');
  $$('.nav > li > button.nav-link').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!mobileNav.matches) return;
      var li = btn.parentElement;
      var wasOpen = li.classList.contains('open');
      $$('.nav > li.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) li.classList.add('open');
      btn.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
    });
  });
  $$('.nav-wrap a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.hasAttribute('data-soon')) return;
      doc.body.classList.remove('nav-open');
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = svg('menu'); }
    });
  });

  /* ---------- FAQ: one open at a time + FAQPage structured data ---------- */
  var faqs = $$('.faq-item');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d && o.parentElement === d.parentElement) o.open = false; });
    });
  });
  if (faqs.length) {
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(function (d) {
        return {
          '@type': 'Question',
          name: $('summary', d).textContent.trim(),
          acceptedAnswer: { '@type': 'Answer', text: $('.answer', d).textContent.replace(/\s+/g, ' ').trim() }
        };
      })
    };
    var s = doc.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    doc.head.appendChild(s);
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Table of contents scroll-spy ---------- */
  var tocLinks = $$('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove('active'); });
        var link = map[en.target.id];
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var t = doc.getElementById(id);
      if (t) spy.observe(t);
    });
  }

  /* ---------- "Choose plan" buttons prefill the lead form ---------- */
  $$('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var note = $('#lead-form [name="plan"]');
      if (note) note.value = btn.getAttribute('data-plan');
      track('select_plan', { plan: btn.getAttribute('data-plan') });
    });
  });

  /* ---------- Lead form ---------- */
  $$('form[data-lead]').forEach(function (form) {
    var card = form.closest('.lead-card');

    function setError(field, on) {
      var wrap = field.closest('.field');
      if (wrap) wrap.classList.toggle('has-error', on);
      field.setAttribute('aria-invalid', on ? 'true' : 'false');
    }
    function validate() {
      var ok = true;
      var name = form.elements.name, phone = form.elements.phone;
      var digits = phone.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      var badName = name.value.trim().length < 2;
      var badPhone = !/^[6-9]\d{9}$/.test(digits);
      setError(name, badName); setError(phone, badPhone);
      if (badName || badPhone) ok = false;
      if (ok) phone.value = digits;
      return ok;
    }
    $$('input, select', form).forEach(function (f) {
      f.addEventListener('input', function () { setError(f, false); });
    });
    form.addEventListener('focusin', function () { track('form_start', { form_location: card && card.closest('.hero') ? 'hero' : 'content' }); }, { once: true });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // honeypot
      if (!validate()) {
        var bad = $('.has-error input, .has-error select', form);
        if (bad) bad.focus();
        return;
      }
      var data = {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value,
        city: form.elements.city ? form.elements.city.value : '',
        service: form.elements.service ? form.elements.service.value : '',
        plan: form.elements.plan ? form.elements.plan.value : '',
        page: location.pathname.split('/').pop() || 'index.html'
      };
      if (SITE.leadEndpoint) {
        try {
          fetch(SITE.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) }).catch(function () {});
        } catch (err) { /* never block the visitor on a logging failure */ }
      }
      track('generate_lead', { service: data.service, city: data.city, plan: data.plan }); // no name/phone: GA4 forbids PII
      var msg = 'Hi, I am ' + data.name + '. I need help with ' + (data.service || 'company registration') +
        (data.plan ? ' (' + data.plan + ' plan)' : '') + (data.city ? ' in ' + data.city : '') + '. Please call me on ' + data.phone + '.';
      var wa = $('.form-success [data-wa-dynamic]', card);
      if (wa) { wa.setAttribute('href', waLink(msg)); wa.setAttribute('target', '_blank'); wa.setAttribute('rel', 'noopener'); }
      var nm = $('.form-success [data-lead-name]', card);
      if (nm) nm.textContent = data.name.split(' ')[0];
      card.classList.add('is-done');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
})();
