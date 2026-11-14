// FR Operations: menu, tabs, the pipeline simulator, the calculator and the contact form.
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

  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'nl');

  // ---- the simulator: made-up orders moving through a pipeline; exceptions wait for the visitor ----
  const sim = document.querySelector('[data-sim]');
  if (sim) {
    const T = {
      nl: { title: ['Simulatie', 'orderverwerking'], run: 'Start', pause: 'Pauze', step: 'Stap', speed: 'Snel',
        stages: ['Ontvangen', 'Uitlezen', 'Controleren', 'Boeken in ERP', 'Bevestigd'],
        stats: ['Verwerkt', 'Zonder tussenkomst', 'Wacht op u', 'Doorlooptijd'], queue: 'Wacht op u', log: 'Logboek',
        empty: 'Niets te beoordelen. De pijplijn loopt door.', approve: 'Goedkeuren', reject: 'Terug naar klant',
        src: ['e-mail', 'pdf', 'portaal', 'edi'], lines: 'regels',
        reasons: ['Prijs wijkt af van de prijslijst', 'Artikelnummer niet gevonden', 'Afleveradres onvolledig', 'Aantal hoger dan de voorraad'],
        ev: { in: 'ontvangen via', read: 'uitgelezen:', ok: 'gecontroleerd, geen afwijkingen', hold: 'tegengehouden:', book: 'geboekt in ERP', done: 'bevestiging naar klant verstuurd', approved: 'goedgekeurd door u', rejected: 'teruggestuurd naar klant' },
        note: 'Verzonnen orders, geen klantgegevens. Zo gedraagt een draaiende automatisering zich: het meeste loopt door, twijfelgevallen wachten op een mens.' },
      en: { title: ['Simulation', 'order processing'], run: 'Run', pause: 'Pause', step: 'Step', speed: 'Fast',
        stages: ['Received', 'Read', 'Checked', 'Booked in ERP', 'Confirmed'],
        stats: ['Processed', 'Without intervention', 'Waiting for you', 'Lead time'], queue: 'Waiting for you', log: 'Log',
        empty: 'Nothing to review. The pipeline keeps running.', approve: 'Approve', reject: 'Back to customer',
        src: ['email', 'pdf', 'portal', 'edi'], lines: 'lines',
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
