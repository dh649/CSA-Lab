{
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TOPICS = DATA.topics, QS = DATA.questions, PRESETS = DATA.presets;
const byTopic = id => TOPICS.find(t => t.id === id);
const NOTES = new Set(['1.3', '1.4', '1.5', '1.6', '1.9', '1.11', '1.12', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.9']);
const UNITS = { 1: 'Unit 1: Using objects and methods', 2: 'Unit 2: Selection and iteration' };
const KIND = { trace: 'Trace the code', bug: 'Bug hunt', fill: 'Fill the blank', mc: 'Concept check' };
const VERSION = 'v1.0';

/* ---------- saved progress ---------- */
const KEY = 'chronicle-csa-v1';
let S = { q: {}, read: {}, draft: null };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const DAY = 864e5, GAPS = [1, 3, 7, 14];
function grade(id, ok) {
  const r = S.q[id] || { s: 0, n: 0, w: 0, due: null };
  r.n++;
  if (!ok) { r.s = 0; r.w++; r.due = Date.now(); }
  else { r.s++; r.due = r.w > 0 && r.s <= GAPS.length ? Date.now() + GAPS[r.s - 1] * DAY : null; }
  S.q[id] = r; save();
}
const isDue = q => { const r = S.q[q.id]; return !!(r && r.due && r.due <= Date.now()); };
const strength = q => { const r = S.q[q.id]; if (!r) return 0; if (isDue(q)) return 0.15; if (r.s >= 2) return 1; if (r.s === 1) return r.w ? 0.55 : 0.7; return 0.15; };
const topicQs = id => QS.filter(q => q.topic === id);
const topicPct = id => { const qs = topicQs(id); return qs.length ? qs.reduce((a, q) => a + strength(q), 0) / qs.length : 0; };
const dueList = () => QS.filter(isDue);
const solid = () => QS.filter(q => strength(q) >= 0.7).length;

/* ---------- syntax highlight ---------- */
const KW = new Set('public private static void class new return if else while for break continue final true false null'.split(' '));
const TY = new Set(['int', 'double', 'boolean', 'String', 'Math', 'System', 'Integer']);
function hl(line) {
  return line.replace(/(____)|(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=(\s*\())?|([^"\w/]+|\/)/g, (m, bl, com, str, num, id, call, other) => {
    if (bl) return '<span class="blank">?</span>';
    if (com) return '<span class="c">' + esc(com) + '</span>';
    if (str) return '<span class="s">' + esc(str) + '</span>';
    if (num) return '<span class="n">' + num + '</span>';
    if (id) { if (KW.has(id)) return '<span class="k">' + id + '</span>'; if (TY.has(id)) return '<span class="ty">' + id + '</span>'; if (call) return '<span class="f">' + id + '</span>'; return id; }
    return esc(m);
  });
}
function codeHTML(code, o = {}) {
  return '<div class="code">' + code.split('\n').map((l, i) => {
    const n = i + 1, tag = o.pick ? 'button' : 'div';
    return `<${tag} class="ln${o.pick ? ' pick' : ''}" data-ln="${n}"${o.pick ? ' type="button" aria-label="Line ' + n + '"' : ''}><span class="g">${n}</span><span class="t">${hl(l) || ' '}</span></${tag}>`;
  }).join('') + '</div>';
}

/* ---------- debugger ---------- */
const IC = {
  reset: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 3v12M14 4 7 9l7 5z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M12 4 5 9l7 5z" fill="currentColor"/></svg>',
  step: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M6 4l7 5-7 5z" fill="currentColor"/></svg>',
  end: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M14 3v12M4 4l7 5-7 5z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
};
function seeded(n) { let s = n; return () => (s = s * 16807 % 2147483647) / 2147483647; }

function mountDebugger(host, code) {
  const r = JavaEngine.run(code, { random: seeded(11) });
  const steps = [{ line: null, note: 'Ready. Press Step (or the right arrow key) to run the first line.', out: '', frames: [{ name: 'main', vars: [] }], changed: null }].concat(r.steps);
  if (r.error && r.error.kind === 'compile') {
    host.innerHTML = `<div class="dbg"><div class="dbg-body"><div>${codeHTML(code)}</div><div class="dbg-side"><div class="note err"><b>Compile error on line ${r.error.line || '?'}</b>${esc(r.error.msg)}<br>Java refuses to run any of the program until this is fixed.</div></div></div></div>`;
    const ln = host.querySelector(`.ln[data-ln="${r.error.line}"]`); if (ln) ln.classList.add('errl');
    return;
  }
  host.innerHTML = `<div class="dbg" tabindex="0" aria-label="Debugger. Use left and right arrow keys to step.">
    <div class="dbg-bar">
      <button class="ib" data-a="reset" aria-label="Back to start" title="Back to start">${IC.reset}</button>
      <button class="ib" data-a="back" aria-label="Step back" title="Step back">${IC.back}</button>
      <button class="ib go" data-a="step" aria-label="Step forward">${IC.step}Step</button>
      <button class="ib" data-a="end" aria-label="Run to the end" title="Run to the end">${IC.end}</button>
      <span class="stepn"></span>
      <input type="range" min="0" max="${steps.length - 1}" value="0" aria-label="Step slider">
    </div>
    <div class="dbg-body">
      <div>${codeHTML(code)}</div>
      <div class="dbg-side">
        <div class="note"></div>
        <div class="vars"><h5>Variables</h5><div class="vlist"></div></div>
        <div class="con"><h5>Console output</h5><pre></pre></div>
      </div>
    </div></div>`;
  const D = host.querySelector('.dbg'), pane = D.querySelector('.code'), lines = [...D.querySelectorAll('.ln')];
  const note = D.querySelector('.note'), vl = D.querySelector('.vlist'), pre = D.querySelector('pre'), sn = D.querySelector('.stepn'), rg = D.querySelector('input');
  let i = 0;
  function show() {
    const st = steps[i];
    lines.forEach(l => l.classList.remove('cur', 'errl'));
    const ln = st.line ? lines[st.line - 1] : null;
    if (ln) {
      ln.classList.add(st.err ? 'errl' : 'cur');
      const top = ln.offsetTop - pane.offsetTop;
      if (top < pane.scrollTop + 10 || top > pane.scrollTop + pane.clientHeight - 40) pane.scrollTop = Math.max(0, top - pane.clientHeight / 2);
    }
    note.className = 'note' + (st.err ? ' err' : '');
    const head = st.end ? (st.err ? 'Stopped' : 'Done') : i === 0 ? 'Start' : 'Line ' + st.line + ' just ran';
    note.innerHTML = '<b>' + head + '</b>' + esc(st.note);
    const fr = st.frames || [];
    vl.innerHTML = fr.length ? fr.map((f, k) => `<div class="frame${k === fr.length - 1 ? ' live' : ''}">${fr.length > 1 ? '<div class="fn">' + esc(f.name) + '()' + (k === fr.length - 1 ? ' : running now' : ' : waiting') + '</div>' : ''}${f.vars.length ? f.vars.map(v => `<div class="box${k === fr.length - 1 && st.changed && st.changed.includes(v.n) ? ' chg' : ''}"><span class="vt">${esc(v.ty)}</span><span>${esc(v.n)}</span><span class="vv">${esc(v.val)}</span></div>`).join('') : '<div class="empty">No variables yet</div>'}</div>`).join('') : '<div class="empty">Program over, variables are gone</div>';
    pre.innerHTML = esc(st.out) + (st.err ? '<span class="er">' + esc(st.note) + '</span>' : '');
    pre.scrollTop = pre.scrollHeight;
    sn.textContent = 'Step ' + i + ' / ' + (steps.length - 1);
    rg.value = i;
    D.querySelector('[data-a=back]').disabled = D.querySelector('[data-a=reset]').disabled = i === 0;
    D.querySelector('[data-a=step]').disabled = D.querySelector('[data-a=end]').disabled = i === steps.length - 1;
  }
  const go = n => { i = Math.max(0, Math.min(steps.length - 1, n)); show(); };
  D.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    go(a === 'reset' ? 0 : a === 'back' ? i - 1 : a === 'step' ? i + 1 : steps.length - 1);
  });
  rg.addEventListener('input', () => go(+rg.value));
  D.addEventListener('keydown', e => {
    if (e.target === rg) return;
    if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
  });
  show();
}
function quickRun(code) {
  const r = JavaEngine.run(code, { record: false, random: seeded(11) });
  if (r.error && r.error.kind === 'compile') return { text: 'Compile error: ' + r.error.msg + (r.error.line ? ' (line ' + r.error.line + ')' : ''), bad: true };
  return { text: r.out + (r.error ? (r.error.kind === 'Timeout' ? r.error.msg : 'Crash! ' + r.error.kind + ': ' + r.error.msg) : ''), bad: !!r.error };
}

/* ---------- sidebar, status ---------- */
const ring = p => { const c = 2 * Math.PI * 6; return `<svg class="ring" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="var(--line)" stroke-width="3"/><circle cx="8" cy="8" r="6" fill="none" stroke="var(--ok)" stroke-width="3" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 8 8)"/></svg>`; };
const hid = id => 'learn-' + id.replace('.', '-');
function renderTree(route) {
  const due = dueList().length;
  const link = (href, label, extra = '', cls = '') => `<a href="#${href}" class="${cls}${route === href ? ' on' : ''}">${label}${extra}</a>`;
  let h = link('home', 'Home');
  h += '<h4>Learn</h4>';
  for (const u of [1, 2]) {
    h += `<div class="folder"><svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1H6l1.5 2h6A1.5 1.5 0 0 1 15 4.5v7A1.5 1.5 0 0 1 13.5 13h-11A1.5 1.5 0 0 1 1 11.5z" fill="var(--curmark)"/></svg>${UNITS[u]}</div>`;
    h += TOPICS.filter(t => t.unit === u).map(t => link(hid(t.id), ring(topicPct(t.id)) + esc(t.file), `<span class="num">${t.id}</span>`, 'file')).join('');
  }
  h += '<h4>Practice</h4>';
  h += link('practice', 'Practice session');
  h += link('review', 'Review pile', due ? `<span class="badge">${due}</span>` : '');
  h += link('playground', 'Playground');
  $('#tree').innerHTML = h;
  $('#status').innerHTML = `<span class="hide-s">Units 1 and 2</span><span>${solid()}/${QS.length} solid</span><span>${due} due for review</span><span class="sp"></span><span class="hide-s">Answers verified with real Java</span><span>${VERSION}</span>`;
}

/* ---------- views ---------- */
const DEMO = TOPICS.find(t => t.id === '2.7').cards[2].code;
function nextTopic() {
  const order = TOPICS.filter(t => t.unit === 2).concat(TOPICS.filter(t => t.unit === 1));
  return order.find(t => !S.read[t.id]) || order.reduce((a, t) => topicPct(t.id) < topicPct(a.id) ? t : a, order[0]);
}
function viewHome() {
  const due = dueList().length, nt = nextTopic();
  const prog = [1, 2].map(u => `<div class="prog" style="margin-bottom:16px"><h3>${UNITS[u]}</h3>${TOPICS.filter(t => t.unit === u).map(t => { const p = topicPct(t.id); return `<a class="pr" href="#${hid(t.id)}"><span class="id">${t.id}</span><span>${esc(t.title)}</span><span class="bar" title="${Math.round(p * 100)}%"><i style="width:${Math.round(p * 100)}%"></i></span></a>`; }).join('')}</div>`).join('');
  $('#view').innerHTML = `
    <h1>Watch Java run, one line at a time</h1>
    <p class="lede">Every lesson's code steps through here so you can see each variable change. Every practice answer was checked against real Java.</p>
    <div class="home">
      <div>
        <h2>Try it: a while loop adding up digits</h2>
        <p style="margin:0 0 4px;color:var(--muted)">Press Step and watch <code>num</code> lose a digit each pass while <code>sum</code> grows.</p>
        <div id="demo"></div>
      </div>
      <div>
        ${due ? `<div class="next"><h3>${due} question${due === 1 ? '' : 's'} due for review</h3><p>Ones you missed come back until you get them right a few times in a row.</p><a class="btn pri" href="#review">Start review</a></div>` : ''}
        <div class="next"><h3>Next up: ${nt.id} ${esc(nt.title)}</h3><p>${S.read[nt.id] ? 'Your weakest topic right now.' : 'You have not opened this lesson yet.'} ${topicQs(nt.id).length} practice questions.</p><div class="row"><a class="btn ${due ? '' : 'pri'}" href="#${hid(nt.id)}">Open lesson</a><button class="btn" id="mixed">Mixed practice</button></div></div>
        ${prog}
      </div>
    </div>`;
  mountDebugger($('#demo'), DEMO);
  $('#mixed').onclick = () => startSession({ mode: 'all', unit: 0, topic: '' });
}

function viewLearn(id) {
  const t = byTopic(id); if (!t) return viewHome();
  S.read[id] = 1; save();
  const idx = TOPICS.indexOf(t), nx = TOPICS[idx + 1], n = topicQs(id).length;
  $('#view').innerHTML = `
    <span class="src">${NOTES.has(id) ? 'Matches your AP CSA notes' : 'Course topic, not in your notes yet'}</span>
    <h1>${t.id} ${esc(t.title)}</h1>
    <p class="lede">${t.cards.length} short cards. Press Step through on any example to watch it run. Then practice: ${n} questions.</p>
    ${t.cards.map((c, k) => `<section class="card">
      <h2>${esc(c.h)}</h2><p>${c.p}</p>
      ${c.trap ? `<div class="trap"><b>Trap:</b>${esc(c.trap)}</div>` : ''}
      ${c.code ? `<div class="cbox" id="cb${k}">${codeHTML(c.code)}</div>
      <div class="codehead"><button class="btn" data-run="${k}">Run</button><button class="btn pri" data-dbg="${k}">Step through</button></div><div id="ro${k}"></div>` : ''}
    </section>`).join('')}
    <div class="row" style="border-top:1px solid var(--line);padding-top:24px">
      <button class="btn pri" id="prac">Practice ${t.id} (${n} questions)</button>
      ${nx ? `<a class="btn" href="#${hid(nx.id)}">Next: ${nx.id} ${esc(nx.title)}</a>` : ''}
    </div>`;
  $('#prac').onclick = () => startSession({ mode: 'all', unit: 0, topic: id });
  $('#view').querySelectorAll('[data-dbg]').forEach(b => b.onclick = () => {
    const k = b.dataset.dbg, box = $('#cb' + k);
    if (b.dataset.on) { box.innerHTML = codeHTML(t.cards[k].code); b.textContent = 'Step through'; delete b.dataset.on; return; }
    mountDebugger(box, t.cards[k].code); b.textContent = 'Hide debugger'; b.dataset.on = 1; $('#ro' + k).innerHTML = '';
    const d = box.querySelector('.dbg'); if (d) d.focus({ preventScroll: true });
  });
  $('#view').querySelectorAll('[data-run]').forEach(b => b.onclick = () => {
    const k = b.dataset.run, r = quickRun(t.cards[k].code);
    $('#ro' + k).innerHTML = `<div class="con" style="padding:10px 0 0"><pre>${esc(r.text)}</pre></div>`;
  });
}

/* ---------- practice ---------- */
let P = null;
let setup = { mode: 'all', unit: 0, topic: '' };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function pool(cfg) { return QS.filter(q => (cfg.mode === 'all' || q.t === cfg.mode) && (!cfg.unit || byTopic(q.topic).unit === cfg.unit) && (!cfg.topic || q.topic === cfg.topic)); }
function startSession(cfg, list, title) {
  setup = cfg;
  let qs = list;
  if (!qs) { const pl = shuffle(pool(cfg)); pl.sort((a, b) => strength(a) - strength(b)); qs = pl.slice(0, cfg.topic ? 12 : 10); qs = shuffle(qs); }
  P = { qs: qs.map(q => q.id), i: 0, res: [], answered: false, title: title || (cfg.topic ? cfg.topic + ' ' + byTopic(cfg.topic).title : cfg.mode === 'all' ? 'Mixed practice' : KIND[cfg.mode]), review: !!list };
  const target = P.review ? 'review' : 'practice';
  if (location.hash.slice(1) !== target) location.hash = target; else route();
}
function viewPracticeSetup() {
  const chip = (grp, v, label) => `<button class="chip${String(setup[grp]) === String(v) ? ' on' : ''}" data-g="${grp}" data-v="${v}">${label}</button>`;
  const n = pool(setup).length;
  $('#view').innerHTML = `<h1>Practice</h1><p class="lede">Ten questions at a time, weakest first. Missed ones go to your review pile.</p>
    <h3>Question type</h3><div class="chips">${chip('mode', 'all', 'Mixed')}${chip('mode', 'trace', 'Trace the code')}${chip('mode', 'bug', 'Bug hunt')}${chip('mode', 'fill', 'Fill the blank')}${chip('mode', 'mc', 'Concept check')}</div>
    <h3>Unit</h3><div class="chips">${chip('unit', 0, 'Both')}${chip('unit', 1, 'Unit 1')}${chip('unit', 2, 'Unit 2')}</div>
    <h3>Topic</h3><div class="chips"><select id="tsel" aria-label="Topic"><option value="">All topics</option>${TOPICS.filter(t => !setup.unit || t.unit === setup.unit).map(t => `<option value="${t.id}"${setup.topic === t.id ? ' selected' : ''}>${t.id} ${esc(t.title)}</option>`).join('')}</select></div>
    <div class="row" style="margin-top:10px"><button class="btn pri" id="go"${n ? '' : ' disabled'}>Start (${Math.min(n, setup.topic ? 12 : 10)} of ${n})</button></div>`;
  $('#view').querySelectorAll('.chip').forEach(c => c.onclick = () => { const g = c.dataset.g; setup[g] = g === 'unit' ? +c.dataset.v : c.dataset.v; if (g === 'unit' && setup.topic && setup.unit && byTopic(setup.topic).unit !== setup.unit) setup.topic = ''; viewPracticeSetup(); });
  $('#tsel').onchange = e => { setup.topic = e.target.value; viewPracticeSetup(); };
  $('#go').onclick = () => startSession({ ...setup });
}
function optBody(q, o) {
  if (q.t === 'trace') {
    const lines = o.split('\n');
    return '<pre>' + lines.map(l => /^Crash: |^Compile error$|^Runs forever$/.test(l) ? '<span class="crash">' + esc(l) + '</span>' : esc(l)).join('\n') + '</pre>';
  }
  if (q.t === 'fill') return '<pre>' + hl(o) + '</pre>';
  return /[;(){}=<>!]/.test(o) && o.length < 80 ? '<pre>' + hl(o) + '</pre>' : '<span>' + esc(o) + '</span>';
}
function viewQuestion() {
  if (P.i >= P.qs.length) return viewDone();
  const q = QS.find(x => x.id === P.qs[P.i]), t = byTopic(q.topic);
  P.answered = false;
  const dots = P.qs.map((_, k) => `<i class="${k < P.res.length ? (P.res[k] ? 'ok' : 'bad') : k === P.i ? 'now' : ''}"></i>`).join('');
  let body = '';
  if (q.t === 'trace') body = `<p class="prompt">What does this print?</p>${codeHTML(q.code)}`;
  if (q.t === 'fill') body = `<p class="task">${esc(q.task)}</p><p class="prompt">Which code goes in the blank?</p>${codeHTML(q.code)}`;
  if (q.t === 'bug') body = `<p class="task">${esc(q.task)}</p><p class="prompt">Click the line with the bug.</p>${codeHTML(q.code, { pick: true })}`;
  if (q.t === 'mc') body = `<p class="prompt">${esc(q.q)}</p>${q.code ? codeHTML(q.code) : ''}`;
  let opts = [];
  if (q.t === 'trace' || q.t === 'mc') opts = shuffle([q.answer, ...q.wrong]);
  if (q.t === 'fill') opts = shuffle(q.opts);
  const correct = q.t === 'fill' ? q.opts[0] : q.answer;
  const wide = opts.some(o => o.length > 34 && q.t !== 'trace');
  $('#view').innerHTML = `<div class="qhead"><span class="kind">${KIND[q.t]}</span><span>${esc(q.topic + ' ' + t.title)}</span>${P.title !== KIND[q.t] ? '<span>' + esc(P.title) + '</span>' : ''}<span class="dots" aria-label="Question ${P.i + 1} of ${P.qs.length}">${dots}</span></div>
    ${body}
    ${opts.length ? `<div class="opts" style="${wide ? 'grid-template-columns:minmax(0,1fr)' : ''}">${opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="L">${'ABCD'[k]}</span>${optBody(q, o)}</button>`).join('')}</div>` : ''}
    <div id="fb"></div>`;
  const view = $('#view');
  view.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (P.answered) return;
    const pickO = opts[+b.dataset.k], ok = pickO === correct;
    view.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (opts[+x.dataset.k] === correct) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    answer(q, ok);
  });
  view.querySelectorAll('.ln.pick').forEach(b => b.onclick = () => {
    if (P.answered) return;
    const n = +b.dataset.ln, ok = n === q.bug;
    view.querySelectorAll('.ln.pick').forEach(x => { x.disabled = true; x.classList.remove('pick'); });
    view.querySelector(`.ln[data-ln="${q.bug}"]`).classList.add('right');
    if (!ok) b.classList.add('wrong');
    answer(q, ok);
  });
}
function answer(q, ok) {
  P.answered = true; P.res.push(ok); grade(q.id, ok); renderTree(location.hash.slice(1));
  const dot = document.querySelectorAll('.dots i')[P.res.length - 1]; if (dot) dot.className = ok ? 'ok' : 'bad';
  const more = q.t === 'bug' ? `<p>Line ${q.bug} should be: <code>${esc(q.fix.trim())}</code><br>The buggy version printed: <code>${esc(q.bugOut)}</code></p>` : '';
  const watch = q.t === 'trace' ? q.code : q.t === 'fill' ? q.code.replace('____', q.opts[0]) : q.t === 'bug' ? q.fixed : null;
  $('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><h4>${ok ? 'Correct' : 'Not quite'}</h4><p>${esc(q.why)}</p>${more}
    <div class="row">${q.t === 'bug' ? '<button class="btn" id="wb">Watch the buggy version</button>' : ''}${watch ? `<button class="btn" id="ww">${q.t === 'bug' ? 'Watch the fixed version' : 'Step through it'}</button>` : ''}<button class="btn pri" id="nx">${P.i + 1 < P.qs.length ? 'Next question' : 'See results'}</button></div><div id="wv"></div></div>`;
  if (watch) $('#ww').onclick = () => { mountDebugger($('#wv'), watch); };
  if (q.t === 'bug') $('#wb').onclick = () => { mountDebugger($('#wv'), q.code); };
  $('#nx').onclick = () => { P.i++; viewQuestion(); $('#main').scrollTop = 0; };
  $('#nx').focus({ preventScroll: true });
}
function viewDone() {
  const right = P.res.filter(Boolean).length, missed = P.qs.map(id => QS.find(q => q.id === id)).filter((q, k) => !P.res[k]);
  $('#view').innerHTML = `<h1>${esc(P.title)}: done</h1>
    <div class="row" style="gap:18px;margin:10px 0 18px"><div class="score">${right}/${P.qs.length}</div><p style="margin:0;color:var(--muted);max-width:40ch">${right === P.qs.length ? 'Clean sweep.' : missed.length + ' went to your review pile. They come back until you get them right a few times in a row.'}</p></div>
    <div class="row"><button class="btn pri" id="again">${P.review ? 'Review more' : 'Another round'}</button><a class="btn" href="#review">Review pile (${dueList().length})</a><a class="btn" href="#home">Home</a></div>
    ${missed.length ? '<h2 style="margin-top:28px">What you missed</h2>' + missed.map(q => `<div class="miss"><b>${esc(q.topic)} ${KIND[q.t]}:</b> ${esc(q.q || q.task || 'What does this print?')}<br><span style="color:var(--muted)">${esc(q.why)}</span></div>`).join('') : ''}`;
  $('#again').onclick = () => P.review ? startReview() : startSession({ ...setup });
}
function startReview() { const d = shuffle(dueList()).slice(0, 15); if (!d.length) { P = null; location.hash = 'review'; route(); return; } startSession(setup, d, 'Review pile'); }
function viewReview() {
  if (P && P.review) return viewQuestion();
  const d = dueList();
  $('#view').innerHTML = `<h1>Review pile</h1><p class="lede">Questions you missed come back here right away, then again after 1, 3, 7 and 14 days once you get them right.</p>
    ${d.length ? `<button class="btn pri" id="rs">Review ${Math.min(d.length, 15)} now</button>` : '<p>Nothing due right now. Missed questions will show up here.</p><a class="btn pri" href="#practice">Go practice</a>'}`;
  if (d.length) $('#rs').onclick = startReview;
}

/* ---------- playground ---------- */
function viewPlayground() {
  const code = S.draft || PRESETS[0].code;
  $('#view').innerHTML = `<h1>Playground</h1><p class="lede">Write your own code and step through it. Works with int, double, boolean, String, Math, if, while, for, and static methods (everything in Units 1 and 2).</p>
    <div class="row" style="margin-bottom:10px"><select id="pre" aria-label="Load an example"><option value="">Load an example...</option>${PRESETS.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('')}</select></div>
    <textarea class="ed" id="ed" spellcheck="false" aria-label="Java code">${esc(code)}</textarea>
    <div class="row" style="margin-top:10px"><button class="btn" id="run">Run</button><button class="btn pri" id="stp">Step through</button></div>
    <div id="pout"></div>`;
  const ed = $('#ed');
  ed.addEventListener('input', () => { S.draft = ed.value; save(); });
  ed.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('    ', s, ed.selectionEnd, 'end'); S.draft = ed.value; save(); } });
  $('#pre').onchange = e => { if (e.target.value === '') return; ed.value = PRESETS[+e.target.value].code; S.draft = ed.value; save(); $('#pout').innerHTML = ''; };
  $('#run').onclick = () => { const r = quickRun(ed.value); $('#pout').innerHTML = `<div class="con" style="padding:12px 0 0"><h5>Console output</h5><pre>${r.bad ? '' : esc(r.text)}${r.bad ? '<span class="er">' + esc(r.text) + '</span>' : ''}</pre></div>`; };
  $('#stp').onclick = () => mountDebugger($('#pout'), ed.value);
}

/* ---------- routing ---------- */
const FILES = { home: 'Home.java', practice: 'Practice.java', review: 'ReviewPile.java', playground: 'Playground.java' };
function route() {
  const h = location.hash.slice(1) || 'home';
  renderTree(h);
  if (h.startsWith('learn-')) { const id = h.slice(6).replace('-', '.'); const t = byTopic(id); $('#tab').textContent = t ? t.file : 'Home.java'; viewLearn(id); }
  else {
    $('#tab').textContent = FILES[h] || 'Home.java';
    if (h === 'practice') { if (P && !P.review) viewQuestion(); else viewPracticeSetup(); }
    else if (h === 'review') viewReview();
    else if (h === 'playground') viewPlayground();
    else viewHome();
  }
  $('#app').classList.remove('open');
  $('#main').scrollTop = 0;
}
window.addEventListener('hashchange', () => { if (P && P.i >= P.qs.length && !location.hash.match(/practice|review/)) P = null; route(); });
$('#menu').onclick = () => $('#app').classList.toggle('open');
$('#scrim').onclick = () => $('#app').classList.remove('open');
$('#tree').addEventListener('click', e => {
  const a = e.target.closest('a'); if (!a) return;
  const h = a.getAttribute('href').slice(1);
  if (h === 'practice' && P && P.i >= P.qs.length) P = null;
  if (h === 'practice' && P && P.review) P = null;
  if (h === location.hash.slice(1)) route();
});
document.addEventListener('keydown', e => {
  if (!P || !/^(practice|review)$/.test(location.hash.slice(1)) || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  const k = 'abcd1234'.indexOf(e.key.toLowerCase());
  if (k >= 0 && !P.answered) { const b = document.querySelector(`.opt[data-k="${k % 4}"]`); if (b) b.click(); }
  if (e.key === 'Enter' && P.answered && document.activeElement.id !== 'nx') { const n = $('#nx'); if (n) n.click(); }
});
route();
}
