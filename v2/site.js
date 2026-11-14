// FR Operations: menu, the marked-document demo and the contact form.
(function () {
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (menuBtn && menu) {
    const setOpen = (open) => {
      menu.classList.toggle('hidden', !open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // the diagram: one switch, two versions of the same process
  document.querySelectorAll('[data-flow]').forEach((flow) => {
    const buttons = flow.querySelectorAll('[data-flow-show]');
    const show = (name) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.flowShow === name)));
      flow.querySelectorAll('[data-flow-panel]').forEach((p) => { p.hidden = p.dataset.flowPanel !== name; });
    };
    buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.flowShow)));
  });

  // tabs with arrow-key support
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      tabs.forEach((t, j) => {
        t.setAttribute('aria-selected', String(j === i));
        t.tabIndex = j === i ? 0 : -1;
        panels[j].hidden = j !== i;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
        if (next !== undefined) { e.preventDefault(); select(next, true); }
      });
    });
    if (tabs.length) select(0);
  });

  // ---- the marked document: three made-up examples, in both languages ----
  const DEMO = {
    nl: [
      { meta: [['Van', 'planning@vandenberg-bouw.example'], ['Onderwerp', 'Transport 14 pallets Rotterdam naar Zwolle']],
        body: [['Goedemiddag,'], ['Graag een wagen voor ', ['14 europallets', 'a'], ' isolatiemateriaal, samen ', ['ongeveer 3.200 kg', 'b'], '. Laden op ', ['dinsdag 17 november', 'c'], ' bij ', ['Waalhaven Zuidzijde 21, Rotterdam', 'd'], '.'], ['Lossen ', ['woensdag vóór 10:00', 'e'], ' op ', ['Hanzelaan 8, Zwolle', 'f'], '. Er is een ', ['laadklep', 'g'], ' nodig. Onze referentie is ', ['PO-48213', 'h'], '.'], ['Groet, Sanne']],
        fields: [['a', 'Lading', '14 europallets'], ['b', 'Gewicht', '3.200 kg', 'Klant schrijft "ongeveer": planner vraagt na', 1], ['c', 'Laden', '17-11-2026'], ['d', 'Laadadres', 'Waalhaven Zuidzijde 21, Rotterdam'], ['e', 'Lossen', '18-11-2026, vóór 10:00'], ['f', 'Losadres', 'Hanzelaan 8, Zwolle'], ['g', 'Laadklep', 'Ja'], ['h', 'Referentie', 'PO-48213']],
        out: ['Boeking klaargezet in het TMS', '7 velden ingevuld, 1 wacht op de planner'] },
      { meta: [['Factuur', '2026-1187'], ['Van', 'Kantoorgroothandel De Linde B.V.']],
        body: [['Betreft uw inkooporder ', ['IO-3391', 'a'], '.'], [['40 × bureaustoel Ergo', 'b'], ' à ', ['€ 189,00', 'c'], ' per stuk: € 7.560,00'], ['Levering: € 95,00'], ['Subtotaal ', ['€ 7.655,00', 'd'], ', btw 21% ', ['€ 1.607,55', 'e'], ', totaal ', ['€ 9.262,55', 'f'], '.'], ['Betaling binnen ', ['30 dagen', 'g'], '.']],
        fields: [['a', 'Inkooporder', 'IO-3391'], ['b', 'Regel', '40 × bureaustoel Ergo'], ['c', 'Stukprijs', '€ 189,00', 'Inkooporder zegt € 179,00: naar inkoop', 1], ['d', 'Excl. btw', '€ 7.655,00'], ['e', 'Btw', '€ 1.607,55'], ['f', 'Totaal', '€ 9.262,55'], ['g', 'Betaaltermijn', '30 dagen']],
        out: ['Factuur tegengehouden', 'Aantal klopt, stukprijs wijkt af van de inkooporder'] },
      { meta: [['Document', 'Huurovereenkomst bedrijfsruimte'], ['Pagina', '2 van 14']],
        body: [['3.1 De huur gaat in op ', ['1 januari 2027', 'a'], ' en is aangegaan voor ', ['vijf jaar', 'b'], '.'], ['3.2 Opzegging gebeurt schriftelijk, met een termijn van ', ['twaalf maanden', 'c'], '.'], ['4.1 De huurprijs bedraagt ', ['€ 4.850 per maand', 'd'], ', exclusief btw.'], ['4.3 De huurprijs wordt jaarlijks aangepast ', ['volgens de CPI', 'e'], '.'], ['9.2 De aansprakelijkheid van verhuurder is ', ['beperkt tot drie maanden huur', 'f'], '.']],
        fields: [['a', 'Ingangsdatum', '01-01-2027'], ['b', 'Looptijd', '5 jaar'], ['c', 'Opzegtermijn', '12 maanden'], ['d', 'Huurprijs', '€ 4.850 per maand'], ['e', 'Indexering', 'Jaarlijks, CPI'], ['f', 'Aansprakelijkheid', 'Max. 3 maanden huur', 'Beperking gevonden: naar de jurist', 1]],
        out: ['Clausules naast elkaar gezet', '5 overgenomen, 1 ter beoordeling'] },
    ],
    en: [
      { meta: [['From', 'planning@vandenberg-bouw.example'], ['Subject', 'Transport 14 pallets Rotterdam to Zwolle']],
        body: [['Good afternoon,'], ['We need a truck for ', ['14 euro pallets', 'a'], ' of insulation, ', ['roughly 3,200 kg', 'b'], ' in total. Loading on ', ['Tuesday 17 November', 'c'], ' at ', ['Waalhaven Zuidzijde 21, Rotterdam', 'd'], '.'], ['Unloading ', ['Wednesday before 10:00', 'e'], ' at ', ['Hanzelaan 8, Zwolle', 'f'], '. A ', ['tail lift', 'g'], ' is needed. Our reference is ', ['PO-48213', 'h'], '.'], ['Regards, Sanne']],
        fields: [['a', 'Cargo', '14 euro pallets'], ['b', 'Weight', '3,200 kg', 'Customer writes "roughly": planner checks', 1], ['c', 'Loading', '17-11-2026'], ['d', 'Loading address', 'Waalhaven Zuidzijde 21, Rotterdam'], ['e', 'Unloading', '18-11-2026, before 10:00'], ['f', 'Delivery address', 'Hanzelaan 8, Zwolle'], ['g', 'Tail lift', 'Yes'], ['h', 'Reference', 'PO-48213']],
        out: ['Booking prepared in the TMS', '7 fields filled in, 1 waiting for the planner'] },
      { meta: [['Invoice', '2026-1187'], ['From', 'Kantoorgroothandel De Linde B.V.']],
        body: [['Regarding your purchase order ', ['IO-3391', 'a'], '.'], [['40 × office chair Ergo', 'b'], ' at ', ['€ 189.00', 'c'], ' each: € 7,560.00'], ['Delivery: € 95.00'], ['Subtotal ', ['€ 7,655.00', 'd'], ', VAT 21% ', ['€ 1,607.55', 'e'], ', total ', ['€ 9,262.55', 'f'], '.'], ['Payment within ', ['30 days', 'g'], '.']],
        fields: [['a', 'Purchase order', 'IO-3391'], ['b', 'Line', '40 × office chair Ergo'], ['c', 'Unit price', '€ 189.00', 'Purchase order says € 179.00: to purchasing', 1], ['d', 'Excl. VAT', '€ 7,655.00'], ['e', 'VAT', '€ 1,607.55'], ['f', 'Total', '€ 9,262.55'], ['g', 'Payment term', '30 days']],
        out: ['Invoice held back', 'Quantity matches, unit price differs from the purchase order'] },
      { meta: [['Document', 'Commercial lease agreement'], ['Page', '2 of 14']],
        body: [['3.1 The lease starts on ', ['1 January 2027', 'a'], ' and runs for ', ['five years', 'b'], '.'], ['3.2 Notice is given in writing, with a period of ', ['twelve months', 'c'], '.'], ['4.1 The rent is ', ['€ 4,850 per month', 'd'], ', excluding VAT.'], ['4.3 The rent is adjusted every year ', ['in line with the CPI', 'e'], '.'], ['9.2 The landlord\'s liability is ', ['limited to three months\' rent', 'f'], '.']],
        fields: [['a', 'Start date', '01-01-2027'], ['b', 'Term', '5 years'], ['c', 'Notice period', '12 months'], ['d', 'Rent', '€ 4,850 per month'], ['e', 'Indexation', 'Yearly, CPI'], ['f', 'Liability', 'Max. 3 months\' rent', 'Limitation found: to the lawyer', 1]],
        out: ['Clauses laid side by side', '5 copied over, 1 for review'] },
    ],
  };
  const demo = document.querySelector('[data-demo]');
  if (demo) {
    const sheet = demo.querySelector('[data-demo-sheet]');
    const rows = demo.querySelector('[data-demo-rows]');
    const out = demo.querySelector('[data-demo-out]');
    const picks = document.querySelectorAll('[data-demo-pick]');
    let current = 0;
    const el = (tag, text, cls) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
    const light = (id, on) => demo.querySelectorAll('[data-f="' + id + '"]').forEach((n) => n.classList.toggle('is-on', on));
    const render = () => {
      const lang = document.documentElement.lang === 'en' ? 'en' : 'nl';
      const d = DEMO[lang][current];
      const flagged = new Set(d.fields.filter((f) => f[4]).map((f) => f[0]));
      sheet.replaceChildren();
      const meta = el('div', null, 'sheet__meta');
      d.meta.forEach(([k, v]) => { const line = el('div'); line.append(k + ': ', el('b', v)); meta.append(line); });
      sheet.append(meta);
      d.body.forEach((para) => {
        const p = el('p');
        para.forEach((part) => {
          if (typeof part === 'string') return p.append(part);
          const m = el('mark', part[0], flagged.has(part[1]) ? 'is-flag' : '');
          m.dataset.f = part[1];
          p.append(m);
        });
        sheet.append(p);
      });
      rows.replaceChildren();
      d.fields.forEach(([id, label, value, note, flag]) => {
        const tr = el('tr', null, flag ? 'is-flag' : '');
        tr.dataset.f = id;
        const th = el('th', label); th.scope = 'row';
        const td = el('td', value);
        if (note) td.append(el('small', note));
        tr.append(th, td);
        rows.append(tr);
      });
      out.replaceChildren(el('b', d.out[0]), d.out[1]);
      picks.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    };
    ['mouseover', 'mouseout', 'focusin', 'focusout'].forEach((type) => demo.addEventListener(type, (e) => {
      const t = e.target.closest('[data-f]');
      if (t) light(t.dataset.f, type === 'mouseover' || type === 'focusin');
    }));
    picks.forEach((b, i) => b.addEventListener('click', () => { current = i; render(); }));
    document.addEventListener('frops:lang', render);
    render();
  }

  const form = document.getElementById('contactForm');
  if (form) {
    const ok = document.getElementById('formSuccess');
    const fail = document.getElementById('formError');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const btn = document.getElementById('formSubmitBtn');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        ok.classList.remove('hidden');
        fail.classList.add('hidden');
        form.reset();
      } catch (err) {
        fail.classList.remove('hidden');
        ok.classList.add('hidden');
      } finally {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      }
    });
  }
})();
