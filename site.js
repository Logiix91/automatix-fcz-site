// FR Operations: menu, tabs, simulator, calculator, the three example types (diagram, marked document, chat) and the contact form.
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
        const next = { ArrowRight: i === last ? 0 : i + 1, ArrowDown: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
        if (next !== undefined) { e.preventDefault(); select(next, true); }
      });
    });
    if (tabs.length) select(0);
  });

  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'nl');

  // ---- the simulator: made-up orders moving through a pipeline; exceptions wait for the visitor ----
  const sim = document.querySelector('[data-sim]');
  if (sim) {
    const T = {
      nl: { title: ['Simulatie', 'orderverwerking'], run: 'Start', pause: 'Pauze', step: 'Stap', speed: 'Snel',
        stages: ['Ontvangen', 'Uitlezen', 'Controleren', 'Boeken in ERP', 'Bevestigd'],
        stats: ['Verwerkt', 'Zonder tussenkomst', 'Wacht op u', 'Doorlooptijd'], queue: 'Wacht op u', log: 'Logboek',
        empty: 'Niets te beoordelen. De pijplijn loopt door.', approve: 'Goedkeuren', reject: 'Terug naar klant',
        src: ['e-mail', 'pdf', 'portaal', 'EDI'], lines: 'regels',
        reasons: ['Prijs wijkt af van de prijslijst', 'Artikelnummer niet gevonden', 'Afleveradres onvolledig', 'Aantal hoger dan de voorraad'],
        ev: { in: 'ontvangen via', read: 'uitgelezen:', ok: 'gecontroleerd, geen afwijkingen', hold: 'tegengehouden:', book: 'geboekt in ERP', done: 'bevestiging naar klant verstuurd', approved: 'goedgekeurd door u', rejected: 'teruggestuurd naar klant' },
        note: 'Verzonnen orders, geen klantgegevens. Zo gedraagt een draaiende automatisering zich: het meeste loopt door, twijfelgevallen wachten op een mens.' },
      en: { title: ['Simulation', 'order processing'], run: 'Run', pause: 'Pause', step: 'Step', speed: 'Fast',
        stages: ['Received', 'Read', 'Checked', 'Booked in ERP', 'Confirmed'],
        stats: ['Processed', 'Without intervention', 'Waiting for you', 'Lead time'], queue: 'Waiting for you', log: 'Log',
        empty: 'Nothing to review. The pipeline keeps running.', approve: 'Approve', reject: 'Back to customer',
        src: ['email', 'pdf', 'portal', 'EDI'], lines: 'lines',
        reasons: ['Price differs from the price list', 'Item number not found', 'Delivery address incomplete', 'Quantity exceeds stock'],
        ev: { in: 'received via', read: 'read:', ok: 'checked, no deviations', hold: 'held:', book: 'booked in ERP', done: 'confirmation sent to customer', approved: 'approved by you', rejected: 'sent back to customer' },
        note: 'Made-up orders, no customer data. This is how a running automation behaves: most of it flows through, doubtful cases wait for a person.' },
    };
    const $ = (s) => sim.querySelector(s);
    const el = (tag, text, cls) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const S = { items: [], queue: [], log: [], next: 2041, done: 0, clean: 0, tick: 0, running: !reduce, fast: false, visible: true, secs: [] };
    const rnd = (n) => Math.floor(Math.random() * n);
    const stamp = () => new Date().toLocaleTimeString('nl-NL', { hour12: false });
    const say = (item, key, kind, extra) => { S.log.unshift({ t: stamp(), id: item.id, key, kind, extra }); S.log.length = Math.min(S.log.length, 7); };

    const spawn = () => { const it = { id: 'ORD-' + S.next++, src: rnd(4), lines: 2 + rnd(8), stage: 0, age: 0, born: S.tick, touched: false }; S.items.push(it); say(it, 'in', 'run', { src: it.src }); };
    const finish = (it) => { S.done++; if (!it.touched) S.clean++; S.secs.push((S.tick - it.born) * 0.9 + 1.5); S.secs = S.secs.slice(-20); };
    const step = () => {
      S.tick++;
      for (const it of [...S.items].reverse()) {
        it.age++;
        if (it.age < 2 && it.stage !== 0) continue;
        if (it.stage === 4) { S.items.splice(S.items.indexOf(it), 1); finish(it); continue; }
        if (it.stage === 2 && !it.checked) {
          it.checked = true;
          if (S.queue.length < 3 && Math.random() < 0.3) { it.reason = rnd(4); it.touched = true; S.items.splice(S.items.indexOf(it), 1); S.queue.push(it); say(it, 'hold', 'wait', { reason: it.reason }); continue; }
          say(it, 'ok', 'run'); continue;
        }
        it.stage++; it.age = 0;
        if (it.stage === 1) say(it, 'read', 'run', { lines: it.lines });
        if (it.stage === 3) say(it, 'book', 'run');
        if (it.stage === 4) say(it, 'done', 'ok');
      }
      if (S.items.length < 7 && S.tick % 2 === 0) spawn();
    };
    const resolve = (id, approve) => {
      const i = S.queue.findIndex((q) => q.id === id); if (i < 0) return;
      const [it] = S.queue.splice(i, 1);
      if (approve) { it.stage = 3; it.age = 0; S.items.push(it); say(it, 'approved', 'ok'); }
      else { say(it, 'rejected', 'wait'); }
      render();
    };

    const render = () => {
      const L = T[lang()];
      $('[data-sim-title]').replaceChildren(el('b', L.title[0]), ' ' + L.title[1]);
      const run = $('[data-sim-run]'); run.textContent = S.running ? L.pause : L.run; run.setAttribute('aria-pressed', String(S.running));
      $('[data-sim-step]').textContent = L.step;
      const fast = $('[data-sim-fast]'); fast.textContent = L.speed; fast.setAttribute('aria-pressed', String(S.fast));
      const avg = S.secs.length ? (S.secs.reduce((a, b) => a + b, 0) / S.secs.length).toFixed(1).replace('.', lang() === 'nl' ? ',' : '.') + ' s' : '–';
      const vals = [S.done, S.done ? Math.round((S.clean / S.done) * 100) + '%' : '–', S.queue.length, avg];
      sim.querySelectorAll('[data-sim-stat]').forEach((d, i) => { d.querySelector('dt').textContent = L.stats[i]; d.querySelector('dd').textContent = vals[i]; });
      sim.querySelectorAll('[data-sim-stage]').forEach((box, i) => {
        const here = S.items.filter((it) => it.stage === i);
        box.querySelector('.stage__name').replaceChildren(el('span', L.stages[i]), el('span', String(here.length)));
        const ul = box.querySelector('ul');
        const want = here.slice(-3).map((it) => it.id);
        [...ul.children].forEach((c) => { if (!want.includes(c.dataset.id)) c.remove(); });
        here.slice(-3).forEach((it) => {
          if (ul.querySelector('[data-id="' + it.id + '"]')) return;
          const li = el('li', null, 'chip' + (i === 4 ? ' is-ok' : it.touched ? ' is-wait' : ''));
          li.dataset.id = it.id; li.append(el('span', it.id), el('span', L.src[it.src])); ul.append(li);
        });
      });
      $('[data-sim-queue-title]').textContent = L.queue + ' (' + S.queue.length + ')';
      const q = $('[data-sim-queue]');
      [...q.children].forEach((c) => { if (!S.queue.some((it) => it.id === c.dataset.id)) c.remove(); });
      S.queue.forEach((it) => {
        let li = q.querySelector('[data-id="' + it.id + '"]');
        if (!li) {
          li = el('li'); li.dataset.id = it.id;
          const ok = el('button', null, 'btn btn--primary'); ok.type = 'button'; ok.dataset.act = 'approve';
          const no = el('button', null, 'btn'); no.type = 'button'; no.dataset.act = 'reject';
          const acts = el('div'); acts.append(ok, no);
          li.append(el('b', it.id), el('p'), acts); q.append(li);
        }
        li.querySelector('p').textContent = L.reasons[it.reason];
        li.querySelector('[data-act=approve]').textContent = L.approve;
        li.querySelector('[data-act=reject]').textContent = L.reject;
      });
      if (!S.queue.length) { const e = el('li', L.empty, 'queue__empty'); e.dataset.id = 'none'; q.append(e); }
      $('[data-sim-log-title]').textContent = L.log;
      $('[data-sim-log]').replaceChildren(...S.log.map((r) => {
        const d = el('div', null, 'is-' + r.kind); let tail = L.ev[r.key];
        if (r.key === 'in') tail += ' ' + L.src[r.extra.src];
        if (r.key === 'read') tail += ' ' + r.extra.lines + ' ' + L.lines;
        if (r.key === 'hold') tail += ' ' + L.reasons[r.extra.reason].toLowerCase();
        d.append(el('time', r.t), r.id + ' ' + tail); return d;
      }));
      $('[data-sim-note]').textContent = L.note;
    };

    let timer = null;
    const loop = () => { clearTimeout(timer); if (!S.running || !S.visible || document.hidden) return; timer = setTimeout(() => { step(); render(); loop(); }, S.fast ? 320 : 900); };
    $('[data-sim-run]').addEventListener('click', () => { S.running = !S.running; render(); loop(); });
    $('[data-sim-step]').addEventListener('click', () => { step(); render(); });
    $('[data-sim-fast]').addEventListener('click', () => { S.fast = !S.fast; render(); loop(); });
    $('[data-sim-queue]').addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) resolve(b.closest('li').dataset.id, b.dataset.act === 'approve'); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { S.visible = en.isIntersecting; loop(); }).observe(sim);
    document.addEventListener('visibilitychange', loop);
    document.addEventListener('frops:lang', render);
    for (let i = 0; i < 26; i++) step();   // start with a pipeline that is already in use
    render(); loop();
  }

  // ---- the calculator: arithmetic on the visitor's own numbers ----
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const upd = () => {
      const loc = lang() === 'nl' ? 'nl-NL' : 'en-GB';
      const v = (n) => Number(calc.querySelector('[name=' + n + ']').value);
      calc.querySelectorAll('input[type=range]').forEach((i) => { calc.querySelector('output[for=' + i.id + ']').textContent = Number(i.value).toLocaleString(loc); });
      const hours = (v('n') * v('m') / 60) * 21;
      calc.querySelector('[data-calc-hours]').textContent = Math.round(hours).toLocaleString(loc);
      calc.querySelector('[data-calc-year]').textContent = '€ ' + (Math.round((hours * 12 * v('r')) / 100) * 100).toLocaleString(loc);
    };
    calc.addEventListener('input', upd);
    document.addEventListener('frops:lang', upd);
    upd();
  }

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
      { meta: [['Van', 'inkoop@bouwservice-brabant.example'], ['Onderwerp', 'Offerteaanvraag PBM']],
        body: [['Goedemorgen,'], ['Graag een offerte voor ', ['120 werkhandschoenen Grip, maat 9', 'a'], ' en ', ['40 veiligheidsbrillen Clear', 'b'], '.'], ['Levering in ', ['week 48', 'c'], ' op ons adres in ', ['Breda', 'd'], '. Rekent u nog met de ', ['staffelkorting van vorig jaar', 'e'], '?'], ['Groet, Jeroen']],
        fields: [['a', 'Regel 1', '120 × werkhandschoen Grip 9', 'Op voorraad, prijs uit ERP'], ['b', 'Regel 2', '40 × veiligheidsbril Clear', 'Op voorraad, prijs uit ERP'], ['c', 'Levering', 'Week 48'], ['d', 'Afleverplaats', 'Breda'], ['e', 'Korting', 'Niet ingevuld', 'Geen afspraak in ERP gevonden: naar verkoop', 1]],
        out: ['Offerte in concept gezet', '4 velden ingevuld, 1 vraag voor verkoop'] },
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
      { meta: [['From', 'inkoop@bouwservice-brabant.example'], ['Subject', 'Quote request PPE']],
        body: [['Good morning,'], ['Please send a quote for ', ['120 work gloves Grip, size 9', 'a'], ' and ', ['40 safety glasses Clear', 'b'], '.'], ['Delivery in ', ['week 48', 'c'], ' to our address in ', ['Breda', 'd'], '. Does ', ['last year\'s volume discount', 'e'], ' still apply?'], ['Regards, Jeroen']],
        fields: [['a', 'Line 1', '120 × work glove Grip 9', 'In stock, price from ERP'], ['b', 'Line 2', '40 × safety glasses Clear', 'In stock, price from ERP'], ['c', 'Delivery', 'Week 48'], ['d', 'Delivery town', 'Breda'], ['e', 'Discount', 'Not filled in', 'No agreement found in ERP: to sales', 1]],
        out: ['Quote drafted', '4 fields filled in, 1 question for sales'] },
    ],
  };
  const mk = (tag, text, cls) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
  document.querySelectorAll('[data-demo]').forEach((demo) => {
    const sheet = demo.querySelector('[data-demo-sheet]'), rows = demo.querySelector('[data-demo-rows]'), out = demo.querySelector('[data-demo-out]');
    const render = () => {
      const d = DEMO[document.documentElement.lang === 'en' ? 'en' : 'nl'][Number(demo.dataset.demo)];
      const flagged = new Set(d.fields.filter((f) => f[4]).map((f) => f[0]));
      const meta = mk('div', null, 'sheet__meta');
      d.meta.forEach(([k, v]) => { const line = mk('div'); line.append(k + ': ', mk('b', v)); meta.append(line); });
      sheet.replaceChildren(meta, ...d.body.map((para) => {
        const p = mk('p');
        para.forEach((part) => {
          if (typeof part === 'string') return p.append(part);
          const m = mk('mark', part[0], flagged.has(part[1]) ? 'is-flag' : ''); m.dataset.f = part[1]; p.append(m);
        });
        return p;
      }));
      rows.replaceChildren(...d.fields.map(([id, label, value, note, flag]) => {
        const tr = mk('tr', null, flag ? 'is-flag' : ''); tr.dataset.f = id;
        const th = mk('th', label); th.scope = 'row';
        const td = mk('td', value); if (note) td.append(mk('small', note));
        tr.append(th, td); return tr;
      }));
      out.replaceChildren(mk('b', d.out[0]), d.out[1]);
    };
    ['mouseover', 'mouseout', 'focusin', 'focusout'].forEach((type) => demo.addEventListener(type, (e) => {
      const t = e.target.closest('[data-f]');
      if (t) demo.querySelectorAll('[data-f="' + t.dataset.f + '"]').forEach((n) => n.classList.toggle('is-on', type === 'mouseover' || type === 'focusin'));
    }));
    document.addEventListener('frops:lang', render);
    render();
  });

  // ---- the chat example ----
  const CHAT = {
    nl: [['user', 'Klant', 'Waar is mijn zending met referentie PO-48213?'], ['sys', '', 'Opgezocht in TMS: PO-48213, geladen 17-11 om 08:42, losvenster 18-11 vóór 10:00'], ['bot', 'Assistent', 'Uw zending is op 17 november om 08:42 geladen in Rotterdam en staat gepland voor 18 november vóór 10:00 in Zwolle.'], ['user', 'Klant', 'Kan het een dag later? Er is dan niemand aanwezig.'], ['bot', 'Assistent', 'Een levering verzetten mag ik niet zelf beslissen. Ik heb uw vraag doorgezet naar de planning; u krijgt vandaag antwoord van een medewerker.'], ['sys wait', '', 'Doorgezet naar planner, met het hele gesprek erbij']],
    en: [['user', 'Customer', 'Where is my shipment with reference PO-48213?'], ['sys', '', 'Looked up in TMS: PO-48213, loaded 17-11 at 08:42, delivery window 18-11 before 10:00'], ['bot', 'Assistant', 'Your shipment was loaded in Rotterdam on 17 November at 08:42 and is planned for 18 November before 10:00 in Zwolle.'], ['user', 'Customer', 'Can it come a day later? Nobody will be there.'], ['bot', 'Assistant', 'Moving a delivery is not something I may decide myself. I have passed your question to planning; an employee will answer you today.'], ['sys wait', '', 'Handed to the planner, with the full conversation attached']],
  };
  document.querySelectorAll('[data-chat]').forEach((box) => {
    const render = () => box.replaceChildren(...CHAT[document.documentElement.lang === 'en' ? 'en' : 'nl'].map(([kind, who, text]) => {
      const p = mk('p', null, kind.split(' ').map((k) => 'is-' + k).join(' '));
      if (who) p.append(mk('span', who, 'chat__who'));
      p.append(text); return p;
    }));
    document.addEventListener('frops:lang', render);
    render();
  });

  // ---- example: matching bank payments to invoices ----
  const RECON = {
    nl: { head: ['Bijschrijving', 'Bedrag', 'Factuur', 'Uitkomst'], sum: ['3 van 5 gekoppeld', '2 blijven over voor de administratie'],
      rows: [['12-11', 'Bakkerij Van Dijk', 'fact 2026-0412', '€ 1.210,00', '2026-0412', 'Gekoppeld', 'factuurnummer in de omschrijving'],
        ['12-11', 'Installatiebedrijf Noord', '0398 en 0401', '€ 3.872,00', '2026-0398 en 2026-0401', 'Gekoppeld', 'twee facturen, samen het juiste bedrag'],
        ['13-11', 'J. de Boer', 'bedankt', '€ 605,00', '2026-0407', 'Gekoppeld', 'naam en bedrag komen overeen'],
        ['13-11', 'Hoveniers Groen', 'factuur 0415', '€ 900,00', '2026-0415 (€ 968,00)', 'Naar administratie', '€ 68,00 te weinig betaald', 1],
        ['13-11', 'Onbekende rekening', 'storting', '€ 250,00', 'Geen', 'Naar administratie', 'geen passende factuur gevonden', 1]] },
    en: { head: ['Incoming payment', 'Amount', 'Invoice', 'Outcome'], sum: ['3 of 5 matched', '2 are left for accounts'],
      rows: [['12-11', 'Bakkerij Van Dijk', 'inv 2026-0412', '€ 1,210.00', '2026-0412', 'Matched', 'invoice number in the description'],
        ['12-11', 'Installatiebedrijf Noord', '0398 and 0401', '€ 3,872.00', '2026-0398 and 2026-0401', 'Matched', 'two invoices that add up to the amount'],
        ['13-11', 'J. de Boer', 'thanks', '€ 605.00', '2026-0407', 'Matched', 'name and amount agree'],
        ['13-11', 'Hoveniers Groen', 'invoice 0415', '€ 900.00', '2026-0415 (€ 968.00)', 'To accounts', '€ 68.00 short', 1],
        ['13-11', 'Unknown account', 'deposit', '€ 250.00', 'None', 'To accounts', 'no matching invoice found', 1]] },
  };
  document.querySelectorAll('[data-recon]').forEach((box) => {
    const render = () => {
      const d = RECON[lang()];
      const table = mk('table'), thead = mk('thead'), hr = mk('tr'), tbody = mk('tbody');
      d.head.forEach((h) => { const th = mk('th', h); th.scope = 'col'; hr.append(th); });
      thead.append(hr);
      d.rows.forEach(([date, who, desc, amount, inv, outcome, why, flag]) => {
        const tr = mk('tr', null, flag ? 'is-flag' : '');
        const a = mk('td'); a.append(mk('b', who), mk('small', date + ', "' + desc + '"'));
        const o = mk('td'); o.append(mk('b', outcome), mk('small', why));
        [a, mk('td', amount, 'num'), mk('td', inv), o].forEach((td, i) => { td.dataset.label = d.head[i]; tr.append(td); });
        tbody.append(tr);
      });
      table.append(thead, tbody);
      const sum = mk('p', null, 'ex__sum'); sum.append(mk('b', d.sum[0]), d.sum[1]);
      box.replaceChildren(table, sum);
    };
    document.addEventListener('frops:lang', render); render();
  });

  // ---- example: a day's schedule for three engineers (half-hour columns from 08:00) ----
  const PLAN = {
    nl: { people: ['Daan', 'Fatima', 'Koen'], sum: ['8 van 9 klussen ingepland', '1 wacht op de planner'], hold: 'Onderdeel niet op voorraad: planner beslist',
      jobs: [[['08:00', '10:00', 'Cv-storing', 'Gouda'], ['10:30', '12:30', 'Onderhoud', 'Waddinxveen'], ['13:30', '16:00', 'Warmtepomp', 'Zoetermeer']],
        [['08:30', '11:00', 'Airco', 'Delft'], ['11:30', '13:00', 'Storing', 'Rijswijk'], ['14:00', '16:30', 'Oplevering', 'Den Haag']],
        [['08:00', '09:30', 'Storing', 'Alphen'], ['10:00', '12:00', 'Onderhoud', 'Leiden'], ['13:00', '15:00', 'Warmtepomp', 'Leiden', 1]]] },
    en: { people: ['Daan', 'Fatima', 'Koen'], sum: ['8 of 9 jobs scheduled', '1 waits for the planner'], hold: 'Part not in stock: planner decides',
      jobs: [[['08:00', '10:00', 'Boiler fault', 'Gouda'], ['10:30', '12:30', 'Maintenance', 'Waddinxveen'], ['13:30', '16:00', 'Heat pump', 'Zoetermeer']],
        [['08:30', '11:00', 'Air conditioning', 'Delft'], ['11:30', '13:00', 'Fault', 'Rijswijk'], ['14:00', '16:30', 'Handover', 'Den Haag']],
        [['08:00', '09:30', 'Fault', 'Alphen'], ['10:00', '12:00', 'Maintenance', 'Leiden'], ['13:00', '15:00', 'Heat pump', 'Leiden', 1]]] },
  };
  const slot = (t) => { const [h, m] = t.split(':').map(Number); return (h - 8) * 2 + (m ? 1 : 0) + 1; };
  document.querySelectorAll('[data-plan]').forEach((box) => {
    const render = () => {
      const d = PLAN[lang()];
      const axis = mk('div', null, 'board__axis'); axis.setAttribute('aria-hidden', 'true');
      for (let h = 8; h < 17; h++) axis.append(mk('span', String(h).padStart(2, '0') + ':00'));
      const rows = d.people.map((name, i) => {
        const row = mk('div', null, 'board__row'), track = mk('ul', null, 'board__track');
        d.jobs[i].forEach(([from, to, what, where, flag]) => {
          const li = mk('li', null, flag ? 'is-flag' : '');
          li.style.setProperty('--a', slot(from)); li.style.setProperty('--b', slot(to));
          li.append(mk('small', from + ' tot ' + to), mk('b', what), mk('span', where));
          if (lang() === 'en') li.firstChild.textContent = from + ' to ' + to;
          if (flag) li.append(mk('em', d.hold));
          track.append(li);
        });
        row.append(mk('p', name, 'board__who'), track); return row;
      });
      const sum = mk('p', null, 'ex__sum'); sum.append(mk('b', d.sum[0]), d.sum[1]);
      box.replaceChildren(axis, ...rows, sum);
    };
    document.addEventListener('frops:lang', render); render();
  });

  // ---- example: a weekly report fed by three systems ----
  const REPORT = {
    nl: { src: [['ERP', 'bijgewerkt 03:00'], ['CRM', 'bijgewerkt 03:00'], ['Boekhouding', 'bijgewerkt 03:05']], kpi: [['€ 84.300', 'omzet deze week'], ['37', 'openstaande offertes'], ['€ 41.900', 'openstaande posten']],
      chart: 'Omzet per week, in duizenden euro', week: 'wk', warn: ['CRM: 2 offertes zonder klantnummer', 'niet meegeteld, staan klaar om aan te vullen'] },
    en: { src: [['ERP', 'refreshed 03:00'], ['CRM', 'refreshed 03:00'], ['Accounts', 'refreshed 03:05']], kpi: [['€ 84,300', 'revenue this week'], ['37', 'open quotes'], ['€ 41,900', 'outstanding receivables']],
      chart: 'Revenue per week, in thousands of euros', week: 'wk', warn: ['CRM: 2 quotes without a customer number', 'left out of the count, ready to be completed'] },
    weeks: [[39, 71], [40, 78], [41, 69], [42, 82], [43, 75], [44, 88], [45, 80], [46, 84.3]],
  };
  document.querySelectorAll('[data-report]').forEach((box) => {
    const render = () => {
      const d = REPORT[lang()], loc = lang() === 'nl' ? 'nl-NL' : 'en-GB';
      const src = mk('ul', null, 'report__src'); d.src.forEach(([n, t]) => { const li = mk('li'); li.append(mk('b', n), mk('span', t)); src.append(li); });
      const kpi = mk('dl', null, 'report__kpi'); d.kpi.forEach(([v, l]) => { const w = mk('div'); w.append(mk('dd', v), mk('dt', l)); kpi.append(w); });
      const fig = mk('figure', null, 'report__chart'); fig.append(mk('figcaption', d.chart));
      const bars = mk('ol'); const max = 100;
      REPORT.weeks.forEach(([wk, v], i) => {
        const li = mk('li', null, i === REPORT.weeks.length - 1 ? 'is-now' : ''); li.style.setProperty('--h', Math.round((v / max) * 130) + 'px');
        li.append(mk('b', v.toLocaleString(loc, { maximumFractionDigits: 0 })), mk('i'), mk('span', d.week + ' ' + wk)); bars.append(li);
      });
      fig.append(bars);
      const warn = mk('p', null, 'report__warn'); warn.append(mk('b', d.warn[0]), d.warn[1]);
      box.replaceChildren(src, kpi, fig, warn);
    };
    document.addEventListener('frops:lang', render); render();
  });

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
