{
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TOPICS = DATA.topics, QS = DATA.questions, PRESETS = DATA.presets, PROBS = DATA.problems;
const byTopic = id => TOPICS.find(t => t.id === id);
const NOTES = new Set(['1.3', '1.4', '1.5', '1.6', '1.9', '1.11', '1.12', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.9']);
const UNITS = { 1: 'Unit 1: Using objects and methods', 2: 'Unit 2: Selection and iteration' };
const KIND = { trace: 'Trace the code', bug: 'Bug hunt', fill: 'Fill the blank', mc: 'Concept check' };
const VERSION = 'v1.2';

/* ---------- saved progress ---------- */
const KEY = 'chronicle-csa-v1';
let S = { q: {}, read: {}, draft: null, w: {}, wd: {} };
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
const solvedN = () => PROBS.filter(p => S.w[p.id] && S.w[p.id].solved).length;
let sampleFn = null;
try { if (window.claude && window.claude.use) window.claude.use('sample').then(f => { sampleFn = f; const b = document.getElementById('wask'); if (b && f) b.hidden = false; }).catch(() => {}); } catch (e) {}


/* ---------- sound: synthesized 8-bit / terminal sounds, no audio files ---------- */
const SFX = (() => {
  let ctx = null, on = S.sound !== false, lastStep = 0;
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  function blip(c, f, t, dur, o = {}) {
    const osc = c.createOscillator(), g = c.createGain(), vol = o.vol ?? 0.05;
    osc.type = o.type || 'square'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let out = g;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; g.connect(fl); out = fl; }
    osc.connect(g); out.connect(c.destination); osc.start(t); osc.stop(t + dur + 0.02);
  }
  function click(c, t, o = {}) {
    const len = Math.floor(c.sampleRate * (o.dur || 0.018)), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; f.type = 'highpass'; f.frequency.value = o.hp || 3200; g.gain.value = o.vol || 0.22;
    src.connect(f).connect(g).connect(c.destination); src.start(t);
  }
  const arp = (c, t, notes, gap, dur, vol, type) => notes.forEach((f, i) => blip(c, f, t + i * gap, dur, { vol, type }));
  const SND = {
    tap: (c, t) => click(c, t),
    key: (c, t) => click(c, t, { dur: 0.012, hp: 4200, vol: 0.14 }),
    step: (c, t) => blip(c, 1320, t, 0.028, { vol: 0.025 }),
    back: (c, t) => blip(c, 990, t, 0.028, { vol: 0.025 }),
    rewind: (c, t) => blip(c, 1400, t, 0.12, { vol: 0.03, to: 300 }),
    ff: (c, t) => blip(c, 300, t, 0.12, { vol: 0.03, to: 1400 }),
    done: (c, t) => arp(c, t, [784, 1047], 0.07, 0.08, 0.04),
    crash: (c, t) => { blip(c, 160, t, 0.09, { vol: 0.06, type: 'sawtooth', lp: 900 }); blip(c, 120, t + 0.11, 0.16, { vol: 0.06, type: 'sawtooth', lp: 900 }); },
    right: (c, t) => arp(c, t, [1047, 1568], 0.07, 0.09, 0.045),
    wrong: (c, t) => { blip(c, 196, t, 0.11, { vol: 0.05 }); blip(c, 147, t + 0.12, 0.2, { vol: 0.05 }); },
    streak: (c, t) => arp(c, t, [1047, 1319, 1568, 2093, 2637], 0.045, 0.06, 0.035),
    run: (c, t) => blip(c, 500, t, 0.09, { vol: 0.035, to: 1600 }),
    compile: (c, t) => { blip(c, 90, t, 0.22, { vol: 0.08, type: 'sawtooth', lp: 700 }); blip(c, 93, t, 0.22, { vol: 0.06, type: 'sawtooth', lp: 700 }); },
    pass: (c, t) => { arp(c, t, [523, 659, 784, 1047], 0.06, 0.07, 0.04); arp(c, t + 0.26, [1319, 1568], 0.0, 0.32, 0.03, 'triangle'); },
    fail: (c, t) => { blip(c, 440, t, 0.09, { vol: 0.045 }); blip(c, 330, t + 0.1, 0.09, { vol: 0.045 }); blip(c, 247, t + 0.2, 0.18, { vol: 0.045 }); },
    hint: (c, t) => { blip(c, 1760, t, 0.05, { vol: 0.03, type: 'triangle' }); blip(c, 2349, t + 0.06, 0.09, { vol: 0.03, type: 'triangle' }); },
    reveal: (c, t) => blip(c, 1600, t, 0.25, { vol: 0.03, to: 400, type: 'triangle' }),
    msg: (c, t) => arp(c, t, [880, 1175], 0.09, 0.12, 0.04, 'sine'),
    win: (c, t) => { arp(c, t, [523, 659, 784, 1047, 784, 1047], 0.08, 0.09, 0.045); blip(c, 1568, t + 0.5, 0.4, { vol: 0.04 }); },
    lose: (c, t) => arp(c, t, [392, 349, 311, 262], 0.13, 0.14, 0.04, 'triangle'),
    on: (c, t) => arp(c, t, [660, 990], 0.05, 0.05, 0.03)
  };
  function play(name, delay = 0) {
    if (!on || !SND[name]) return;
    if (name === 'step' || name === 'back') { const now = Date.now(); if (now - lastStep < 45) return; lastStep = now; }
    const c = ac(); if (!c) return;
    try { SND[name](c, c.currentTime + 0.01 + delay); } catch (e) {}
  }
  function sync() { const b = document.getElementById('snd'); if (!b) return; b.classList.toggle('off', !on); b.setAttribute('aria-label', on ? 'Sound on. Click to mute.' : 'Sound off. Click to turn on.'); b.title = on ? 'Mute sounds' : 'Turn sounds on'; }
  function toggle() { on = !on; S.sound = on; save(); sync(); if (on) play('on'); }
  return { play, toggle, sync };
})();

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
  const go = (n, snd) => {
    const was = i; i = Math.max(0, Math.min(steps.length - 1, n)); show();
    if (!snd || i === was) return;
    if (i === steps.length - 1) SFX.play(steps[i].err ? 'crash' : 'done', snd === 'ff' ? 0.12 : 0);
    if (snd !== 'step' || i !== steps.length - 1) SFX.play(snd);
  };
  D.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'reset') go(0, 'rewind'); else if (a === 'back') go(i - 1, 'back'); else if (a === 'step') go(i + 1, 'step'); else go(steps.length - 1, 'ff');
  });
  rg.addEventListener('input', () => go(+rg.value));
  D.addEventListener('keydown', e => {
    if (e.target === rg) return;
    if (e.key === 'ArrowRight') { go(i + 1, 'step'); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(i - 1, 'back'); e.preventDefault(); }
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
  h += link('write', 'Write code', `<span class="num">${solvedN()}/${PROBS.length}</span>`);
  h += link('review', 'Review pile', due ? `<span class="badge">${due}</span>` : '');
  h += link('playground', 'Playground');
  $('#tree').innerHTML = h;
  $('#status').innerHTML = `<span class="hide-s">Units 1 and 2</span><span>${solid()}/${QS.length} solid</span><span>${due} due for review</span><span class="hide-s">${solvedN()}/${PROBS.length} written</span><span class="sp"></span><span class="hide-s">Answers verified with real Java</span><span>${VERSION}</span>`;
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
        <div class="next"><h3>Write code: ${solvedN()} of ${PROBS.length} solved</h3><p>Free response is 45% of the AP exam, and it is all writing methods like these.</p><a class="btn" href="#write">Open Write code</a></div>
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
      ${PROBS.filter(p => p.topic === id).map(p => `<a class="btn" href="#write-${p.id}">Write it: ${esc(p.title)}</a>`).join('')}
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
    SFX.play(r.bad ? (r.text.startsWith('Compile') ? 'compile' : 'crash') : 'run');
    $('#ro' + k).innerHTML = `<div class="con" style="padding:10px 0 0"><pre>${esc(r.text)}</pre></div>`;
  });
}

/* ---------- practice ---------- */
let P = null, streak = 0;
let setup = { mode: 'all', unit: 0, topic: '' };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function pool(cfg) { return QS.filter(q => (cfg.mode === 'all' || q.t === cfg.mode) && (!cfg.unit || byTopic(q.topic).unit === cfg.unit) && (!cfg.topic || q.topic === cfg.topic)); }
function startSession(cfg, list, title) {
  setup = cfg;
  let qs = list;
  if (!qs) { const pl = shuffle(pool(cfg)); pl.sort((a, b) => strength(a) - strength(b)); qs = pl.slice(0, cfg.topic ? 12 : 10); qs = shuffle(qs); }
  streak = 0;
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
  streak = ok ? streak + 1 : 0;
  SFX.play(ok ? 'right' : 'wrong');
  if (ok && streak > 0 && streak % 3 === 0) SFX.play('streak', 0.22);
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
  const right = P.res.filter(Boolean).length;
  if (!P.played) { P.played = true; SFX.play(right / P.qs.length >= 0.7 ? 'win' : 'lose', 0.1); }
  const missed = P.qs.map(id => QS.find(q => q.id === id)).filter((q, k) => !P.res[k]);
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


/* ---------- write code ---------- */
const wrapW = (code, call, kind) => 'public class Main {\n' + code.split('\n').map(l => '    ' + l).join('\n') + '\n    public static void main(String[] args) {\n        ' + (kind === 'print' ? call + ';' : 'System.out.println(' + call + ');') + '\n    }\n}';
const normOut = t => t.split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
const retType = p => p.sig.split('(')[0].trim().split(/\s+/).slice(-2)[0];
const showVal = (p, v) => p.kind === 'return' && retType(p) === 'String' && !/^Crash: |^Compile error|^Runs forever/.test(v) ? JSON.stringify(v) : v;
function runTest(p, code, call) {
  const r = JavaEngine.run(wrapW(code, call, p.kind), { record: false, maxSteps: 60000 });
  if (r.error && r.error.kind === 'compile') return { compile: r.error };
  if (r.error && r.error.kind === 'Timeout') return { got: 'Runs forever', err: 'Your loop never stopped (stopped it after 60,000 steps).' };
  const o = normOut(r.out);
  if (r.error) return { got: (o ? o + '\n' : '') + 'Crash: ' + r.error.kind, err: r.error.kind + ': ' + r.error.msg };
  return { got: o };
}
const wStatus = p => { const r = S.w[p.id]; return !r ? 'New' : r.solved ? 'Solved' : 'Tried'; };
function viewWriteList() {
  const byT = TOPICS.filter(t => PROBS.some(p => p.topic === t.id));
  $('#view').innerHTML = `<h1>Write code</h1>
    <p class="lede">On the AP exam, 4 free-response questions are 45% of your score, and every one of them is writing Java methods. Write each method below, run the tests, and step through your own code when a test fails. ${solvedN()} of ${PROBS.length} solved.</p>
    ${byT.map(t => `<div class="prog" style="margin-bottom:16px"><h3>${t.id} ${esc(t.title)}</h3>${PROBS.filter(p => p.topic === t.id).map(p => { const st = wStatus(p); return `<a class="pr wr" href="#write-${p.id}"><span class="id">${p.kind === 'print' ? 'void' : esc(retType(p))}</span><span>${esc(p.title)}</span><span class="st st-${st.toLowerCase()}">${st}</span></a>`; }).join('')}</div>`).join('')}`;
}
function viewWrite(id) {
  const p = PROBS.find(x => x.id === id); if (!p) return viewWriteList();
  const t = byTopic(p.topic), idx = PROBS.indexOf(p), nx = PROBS[idx + 1];
  const starter = p.sig + ' {\n    \n}';
  const rec = S.w[p.id] || {};
  let hintN = 0, solArmed = false;
  $('#view').innerHTML = `<span class="src">Write it · ${t.id} ${esc(t.title)}${rec.solved ? ' · Solved' : ''}</span>
    <h1>${esc(p.title)}</h1>
    <p class="task" style="font-size:17px">${p.prompt}</p>
    <h3>Examples</h3>
    <div class="exs">${p.tests.slice(0, 2).map((c, k) => `<div class="exr"><code>${esc(c)}</code><span>${p.kind === 'print' ? 'prints' : 'returns'}</span><pre>${esc(showVal(p, p.expect[k])) || ' '}</pre></div>`).join('')}</div>
    <h3 style="margin-top:18px">Your code</h3>
    <textarea class="ed" id="wed" spellcheck="false" aria-label="Your method" style="min-height:240px">${esc(S.wd[p.id] || starter)}</textarea>
    <div class="row" style="margin-top:10px">
      <button class="btn pri" id="wrun">Run tests</button>
      <button class="btn" id="whb">Hint (0/${p.hints.length})</button>
      <button class="btn" id="wask" hidden>Ask Claude to review</button>
      <button class="btn" id="wsb">Show solution</button>
      <button class="btn" id="wreset">Reset code</button>
    </div>
    <div id="whint"></div><div id="wres"></div><div id="wclaude"></div><div id="wsol"></div>
    ${nx ? `<div class="row" style="border-top:1px solid var(--line);margin-top:28px;padding-top:20px"><a class="btn" href="#write-${nx.id}">Next: ${esc(nx.title)}</a><a class="btn" href="#write">All problems</a></div>` : ''}`;
  const ed = $('#wed');
  if (sampleFn) $('#wask').hidden = false;
  ed.addEventListener('input', () => { S.wd[p.id] = ed.value; save(); });
  ed.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); ed.setRangeText('    ', ed.selectionStart, ed.selectionEnd, 'end'); S.wd[p.id] = ed.value; save(); } });
  $('#wreset').onclick = () => { ed.value = starter; S.wd[p.id] = starter; save(); $('#wres').innerHTML = ''; };
  $('#whb').onclick = () => {
    if (hintN < p.hints.length) { hintN++; SFX.play('hint'); }
    $('#whb').textContent = `Hint (${hintN}/${p.hints.length})`;
    $('#whint').innerHTML = `<div class="trap" style="margin-top:14px">${p.hints.slice(0, hintN).map((h, k) => `<div><b>Hint ${k + 1}:</b>${esc(h)}</div>`).join('')}</div>`;
  };
  $('#wsb').onclick = () => {
    if (!solArmed) { solArmed = true; $('#wsb').textContent = 'Sure? Click again to show it'; return; }
    S.w[p.id] = Object.assign(S.w[p.id] || {}, { saw: true }); save(); renderTree(location.hash.slice(1));
    SFX.play('reveal');
    $('#wsol').innerHTML = `<div class="fb" style="margin-top:16px"><h4>Reference solution</h4><p>${esc(p.explain)}</p>${codeHTML(p.solution)}<p style="margin-top:10px;color:var(--muted)">Now close it, wait a minute, and write it yourself from memory. Reading a solution is not the same as being able to write it.</p></div>`;
    $('#wsb').textContent = 'Solution shown';
  };
  let last = null;
  $('#wrun').onclick = () => {
    const code = ed.value;
    if (code.trim() === starter.trim()) { SFX.play('wrong'); $('#wres').innerHTML = '<div class="fb bad"><h4>Write your code first</h4><p>Put your code between the { and }. Stuck? Press Hint.</p></div>'; return; }
    S.w[p.id] = Object.assign(S.w[p.id] || {}, { tries: ((S.w[p.id] || {}).tries || 0) + 1 });
    const results = [];
    for (const call of p.tests) {
      const r = runTest(p, code, call);
      if (r.compile) {
        const L = r.compile.line, n = code.split('\n').length;
        const where = L && L >= 2 && L <= n + 1 ? 'line ' + (L - 1) + ' of your code' : 'your code';
        last = { compile: r.compile.msg };
        SFX.play('compile');
        $('#wres').innerHTML = `<div class="fb bad"><h4>Compile error in ${where}</h4><p><code>${esc(r.compile.msg)}</code></p><p>Java will not run any of it until this is fixed. On the AP exam small syntax slips cost little, but here the tests cannot run.</p></div>`;
        save(); renderTree(location.hash.slice(1));
        return;
      }
      results.push({ call, exp: p.expect[results.length], got: r.got, err: r.err });
    }
    const pass = results.filter(r => r.got === r.exp).length, all = pass === results.length;
    last = { results, pass };
    if (all) S.w[p.id].solved = true;
    SFX.play(all ? 'pass' : 'fail');
    save(); renderTree(location.hash.slice(1));
    $('#wres').innerHTML = `<div class="fb ${all ? 'ok' : 'bad'}"><h4>${all ? 'All ' + pass + ' tests pass' : pass + ' of ' + results.length + ' tests pass'}</h4>
      ${all ? `<p>${esc(p.explain)}</p>` : '<p>Pick a failing test and press Step through to watch your code run on it.</p>'}
      <div class="tests">${results.map((r, k) => { const ok = r.got === r.exp; return `<div class="tr ${ok ? 'tp' : 'tf'}"><span class="tm">${ok ? 'Pass' : 'Fail'}</span><code>${esc(r.call)}</code><div><span class="tl">expected</span><pre>${esc(showVal(p, r.exp)) || ' '}</pre></div><div><span class="tl">got</span><pre>${esc(showVal(p, r.got)) || ' '}</pre></div><button class="btn sm" data-st="${k}">Step through</button></div>`; }).join('')}</div>
      ${all && !(S.w[p.id] || {}).saw ? '<details style="margin-top:12px"><summary>Compare with the reference solution</summary>' + codeHTML(p.solution) + '</details>' : ''}
      <div id="wdbg"></div></div>`;
    $('#wres').querySelectorAll('[data-st]').forEach(b => b.onclick = () => { mountDebugger($('#wdbg'), wrapW(code, results[+b.dataset.st].call, p.kind)); });
  };
  $('#wask').onclick = async () => {
    if (!sampleFn) return;
    const code = ed.value, box = $('#wclaude'), btn = $('#wask');
    if (!last) $('#wrun').click();
    const res = last && last.compile ? 'Compile error: ' + last.compile : last ? last.results.map(r => `${r.call}: expected ${showVal(p, r.exp) || '(nothing)'}, got ${showVal(p, r.got) || '(nothing)'} ${r.got === r.exp ? 'PASS' : 'FAIL'}`).join('\n') : 'not run';
    const allPass = last && last.results && last.pass === last.results.length;
    const promptText = `You are an AP Computer Science A tutor reviewing a high school student's Java method. Be direct and specific, like a good teacher. Plain text only, no markdown headings or bullet symbols, no em dashes, under 140 words.

Problem: ${p.prompt.replace(/<[^>]+>/g, '')}
Method header: ${p.sig}

Student's code:
${code}

Automated test results:
${res}

${allPass ? 'All tests pass. Say whether this would earn full credit on an AP free-response question, and point out one habit worth keeping or one thing to clean up (naming, unneeded code, risky patterns). Do not rewrite their whole method.' : 'Some tests fail or it does not compile. Explain what their code actually does wrong, pointing to the specific line or expression, and connect it to the failing test. Give one hint toward the fix. Do NOT write the corrected code for them.'}`;
    btn.disabled = true; btn.textContent = 'Claude is reading your code...';
    box.innerHTML = '<div class="fb claude" style="margin-top:16px"><h4>Claude\'s review</h4><p class="ct"></p></div>';
    const out = box.querySelector('.ct');
    try {
      const r = await sampleFn(promptText, { onText: ({ text }) => { out.textContent = text; }, modelTier: 'default' });
      out.textContent = r.text;
      SFX.play('msg');
    } catch (e) {
      out.textContent = e && e.code === 'rate_limited' ? 'Too many reviews in a row. Wait a minute and try again.' : e && e.code === 'not_granted' ? 'Claude reviews are not available here.' : 'Could not get a review right now.';
      if (e && e.code === 'not_granted') btn.hidden = true;
    }
    btn.disabled = false; btn.textContent = 'Ask Claude to review';
  };
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
  $('#run').onclick = () => { const r = quickRun(ed.value); SFX.play(r.bad ? (r.text.startsWith('Compile') ? 'compile' : 'crash') : 'run'); $('#pout').innerHTML = `<div class="con" style="padding:12px 0 0"><h5>Console output</h5><pre>${r.bad ? '' : esc(r.text)}${r.bad ? '<span class="er">' + esc(r.text) + '</span>' : ''}</pre></div>`; };
  $('#stp').onclick = () => mountDebugger($('#pout'), ed.value);
}

/* ---------- routing ---------- */
const FILES = { home: 'Home.java', practice: 'Practice.java', review: 'ReviewPile.java', playground: 'Playground.java', write: 'WriteCode.java' };
function route() {
  const h = location.hash.slice(1) || 'home';
  renderTree(h);
  if (h.startsWith('write-')) { const p = PROBS.find(x => x.id === h.slice(6)); $('#tab').textContent = p ? p.sig.split('(')[0].trim().split(/\s+/).pop() + '.java' : 'WriteCode.java'; renderTree('write'); viewWrite(h.slice(6)); }
  else if (h.startsWith('learn-')) { const id = h.slice(6).replace('-', '.'); const t = byTopic(id); $('#tab').textContent = t ? t.file : 'Home.java'; viewLearn(id); }
  else {
    $('#tab').textContent = FILES[h] || 'Home.java';
    if (h === 'practice') { if (P && !P.review) viewQuestion(); else viewPracticeSetup(); }
    else if (h === 'review') viewReview();
    else if (h === 'playground') viewPlayground();
    else if (h === 'write') viewWriteList();
    else viewHome();
  }
  $('#app').classList.remove('open');
  $('#main').scrollTop = 0;
}
window.addEventListener('hashchange', () => { if (P && P.i >= P.qs.length && !location.hash.match(/practice|review/)) P = null; route(); });
$('#menu').onclick = () => $('#app').classList.toggle('open');
$('#snd').onclick = e => { e.stopPropagation(); SFX.toggle(); };
SFX.sync();
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.tree a, .chip, .btn, .pr, .menu');
  if (!b || b.disabled || b.id === 'snd') return;
  if (['wrun', 'run', 'whb', 'wsb', 'wask'].includes(b.id) || b.dataset.run !== undefined) return;
  SFX.play('tap');
}, true);
document.addEventListener('input', e => { if (e.target.classList && e.target.classList.contains('ed')) SFX.play('key'); });
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
