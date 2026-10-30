/* Company registration cost calculator — all rates INDICATIVE.
   Edit CONFIG when the MCA / state governments revise fees. Have a CA verify before changing. */
(function () {
  'use strict';

  var CONFIG = {
    dsc: 1200,                 // per Class-3 DSC, 2-year (indicative)
    panTan: 131,               // PAN 66 + TAN 65 (approx.)
    gst: 0.18,                 // on professional fee only
    company: {
      nameFee: 1000,           // SPICe+ Part A
      mcaFeeUpto15L: 0,        // incorporation fee nil for authorised capital <= 15 lakh
      stamp: {
        delhi: function (cap) { return { moa: 200, aoa: Math.round(cap * 0.0015), form: 10 }; },
        up:    function (cap) { return { moa: 500, aoa: cap > 500000 ? 1000 : 500, form: 10 }; }
      },
      plans: {
        pvt: { basic: 999, standard: 3999, premium: 9999, dscIncluded: { basic: 0, standard: 2, premium: 2 } },
        opc: { basic: 999, standard: 3499, premium: 8999, dscIncluded: { basic: 0, standard: 1, premium: 1 } }
      }
    },
    llp: {
      nameFee: 200,            // RUN-LLP
      fillip: function (c) { return c <= 100000 ? 500 : c <= 500000 ? 2000 : c <= 1000000 ? 4000 : 5000; },
      form3: function (c) { return c <= 100000 ? 50 : c <= 500000 ? 100 : c <= 1000000 ? 150 : 200; },
      stamp: {
        delhi: function (c) { return Math.min(Math.round(c * 0.01), 5000); },
        up:    function (c) { return Math.round(c * 0.01); }
      },
      plans: { basic: 1499, standard: 4499, premium: 9999, dscIncluded: { basic: 0, standard: 2, premium: 2 } }
    },
    whatsapp: '918447452345'
  };

  var $ = function (id) { return document.getElementById(id); };
  var entity = $('c-entity'), state = $('c-state'), capital = $('c-capital'), people = $('c-people'), plan = $('c-plan');
  if (!entity) return;

  function inr(n) { return '₹' + n.toLocaleString('en-IN'); }

  function setPeopleOptions(min, max, label) {
    var cur = parseInt(people.value, 10);
    people.innerHTML = '';
    for (var i = min; i <= max; i++) {
      var o = document.createElement('option'); o.value = i; o.textContent = i; people.appendChild(o);
    }
    people.value = Math.min(Math.max(cur || min, min), max);
    $('c-people-label').textContent = label;
  }

  function setCapitalOptions(isLLP) {
    capital.innerHTML = '';
    var opts = isLLP
      ? [[100000, '₹1 lakh'], [500000, '₹5 lakh'], [1000000, '₹10 lakh'], [2500000, '₹25 lakh']]
      : [[100000, '₹1 lakh'], [500000, '₹5 lakh'], [1000000, '₹10 lakh'], [1500000, '₹15 lakh'], ['more', 'More than ₹15 lakh']];
    opts.forEach(function (o) { var e = document.createElement('option'); e.value = o[0]; e.textContent = o[1]; capital.appendChild(e); });
    $('c-capital-label').textContent = isLLP ? 'Total capital contribution' : 'Authorised share capital';
  }

  function calc() {
    var e = entity.value, s = state.value, n = parseInt(people.value, 10), pl = plan.value;
    var rows = [], govt = 0, note = '';
    var cap = capital.value === 'more' ? null : parseInt(capital.value, 10);

    if (cap === null) {
      $('c-total').textContent = 'Ask for a quote';
      $('c-rows').innerHTML = '';
      $('c-note').textContent = 'Companies with authorised capital above ₹15 lakh attract slab-based MCA fees and higher stamp duty. We quote these individually.';
      $('c-wa').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Hi, I need a quote for a company with authorised capital above ₹15 lakh in ' + (s === 'up' ? 'Uttar Pradesh' : 'Delhi') + '.');
      return;
    }

    var fee, dscIncl, dscNeeded = n;
    if (e === 'llp') {
      fee = CONFIG.llp.plans[pl]; dscIncl = CONFIG.llp.plans.dscIncluded[pl];
      dscNeeded = Math.min(n, 2) + Math.max(0, n - 2); // every partner signing needs a DSC in practice
      rows.push(['Name reservation (RUN-LLP)', CONFIG.llp.nameFee]);
      rows.push(['MCA incorporation fee (FiLLiP)', CONFIG.llp.fillip(cap)]);
      rows.push(['Stamp duty on LLP Agreement (' + (s === 'up' ? 'UP' : 'Delhi') + ')', CONFIG.llp.stamp[s](cap)]);
      rows.push(['Form 3 filing fee', CONFIG.llp.form3(cap)]);
    } else {
      var pset = CONFIG.company.plans[e];
      fee = pset[pl]; dscIncl = pset.dscIncluded[pl];
      var st = CONFIG.company.stamp[s](cap);
      rows.push(['Name reservation (SPICe+ Part A)', CONFIG.company.nameFee]);
      rows.push(['MCA incorporation fee (capital ≤ ₹15 lakh)', CONFIG.company.mcaFeeUpto15L]);
      rows.push(['Stamp duty — MoA (' + (s === 'up' ? 'UP' : 'Delhi') + ')', st.moa]);
      rows.push(['Stamp duty — AoA', st.aoa]);
      rows.push(['Stamp duty — SPICe+ form', st.form]);
    }
    rows.push(['PAN + TAN', CONFIG.panTan]);
    var extraDsc = Math.max(0, dscNeeded - dscIncl);
    rows.push(['Digital Signatures — ' + dscNeeded + ' × ' + inr(CONFIG.dsc) + (dscIncl ? ' (' + dscIncl + ' included in plan)' : ''), extraDsc * CONFIG.dsc]);
    rows.forEach(function (r) { govt += r[1]; });

    var gst = Math.round(fee * CONFIG.gst);
    var total = govt + fee + gst;

    var html = '<tbody><tr class="head"><td colspan="2">Government &amp; third-party (at actuals, indicative)</td></tr>';
    rows.forEach(function (r) { html += '<tr><td>' + r[0] + '</td><td>' + inr(r[1]) + '</td></tr>'; });
    html += '<tr class="head"><td colspan="2">Professional fee</td></tr>';
    html += '<tr><td>' + plan.options[plan.selectedIndex].text.split(' — ')[0] + ' plan</td><td>' + inr(fee) + '</td></tr>';
    html += '<tr><td>GST @ 18% on professional fee</td><td>' + inr(gst) + '</td></tr></tbody>';
    $('c-rows').innerHTML = html;
    $('c-total').textContent = inr(total);
    $('c-note').textContent = 'Indicative. Government fees, stamp duty and DSC prices are set by the respective authorities and revised from time to time; the written quote you receive before filing is the figure that applies.';

    var label = { pvt: 'Private Limited Company', opc: 'One Person Company', llp: 'LLP' }[e];
    var msg = 'Hi, I used your cost calculator. ' + label + ' in ' + (s === 'up' ? 'Uttar Pradesh (Noida/Ghaziabad)' : 'Delhi') + ', capital ' + inr(cap) + ', ' + n + ' ' + (e === 'llp' ? 'partners' : 'directors') + ', ' + pl + ' plan. Estimate shown: ' + inr(total) + '. Please send a written quote.';
    $('c-wa').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  function onEntity() {
    var e = entity.value;
    if (e === 'opc') setPeopleOptions(1, 3, 'Number of directors');
    else if (e === 'llp') setPeopleOptions(2, 5, 'Number of partners');
    else setPeopleOptions(2, 5, 'Number of directors');
    setCapitalOptions(e === 'llp');
    calc();
  }

  entity.addEventListener('change', onEntity);
  [state, capital, people, plan].forEach(function (el) { el.addEventListener('change', calc); });
  var used = false;
  [entity, state, capital, people, plan].forEach(function (el) {
    el.addEventListener('change', function () {
      if (used || !window.probayTrack) return;
      used = true;
      window.probayTrack('calculator_use', { entity: entity.value, state: state.value });
    });
  });
  onEntity();
})();
