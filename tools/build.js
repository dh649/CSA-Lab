const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = require('path').resolve(__dirname, '..');
const E = require(ROOT + '/src/engine.js');
const { TOPICS, QUESTIONS, PRESETS } = require(ROOT + '/src/content.js');
const { PROBLEMS } = require(ROOT + '/src/problems.js');
const wrapW = (code, call, kind) => 'public class Main {\n' + code + '\n    public static void main(String[] args) {\n        ' + (kind === 'print' ? call + ';' : 'System.out.println(' + call + ');') + '\n    }\n}';
const JD = ROOT + '/build/java';
fs.rmSync(JD, { recursive: true, force: true }); fs.mkdirSync(JD, { recursive: true });

const progs = {};
function add(id, code) {
  const java = /\bclass\s+\w+/.test(code)
    ? code.replace(/\bclass\s+\w+/, 'class ' + id)
    : 'public class ' + id + ' {\npublic static void main(String[] args) {\n' + code + '\n}\n}\n';
  fs.writeFileSync(path.join(JD, id + '.java'), java);
  progs[id] = code;
}
const norm = s => s.split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
function label(r) {
  if (r.status === 'compile') return 'Compile error';
  if (r.status === 'timeout') return 'Runs forever';
  const o = norm(r.out);
  if (r.status === 'exception') return (o ? o + '\n' : '') + 'Crash: ' + r.err.split(':')[0];
  return o === '' ? '(nothing printed)' : o;
}
function engLabel(code) {
  const r = E.run(code, { record: false, maxSteps: 200000 });
  if (r.error && r.error.kind === 'compile') return 'Compile error';
  if (r.error && r.error.kind === 'Timeout') return 'Runs forever';
  const o = norm(r.out);
  if (r.error) return (o ? o + '\n' : '') + 'Crash: ' + r.error.kind;
  return o === '' ? '(nothing printed)' : o;
}

const hash = str => { let h = 2166136261; for (let k = 0; k < str.length; k++) { h ^= str.charCodeAt(k); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
QUESTIONS.forEach((q, i) => {
  q.id = q.topic + '-' + hash(q.t + (q.code || '') + (q.q || '') + (q.task || ''));
  if (q.t === 'trace') add('T' + i, q.code);
  if (q.t === 'fill') q.opts.forEach((o, k) => add('F' + i + '_' + k, q.code.replace('____', o)));
  if (q.t === 'bug') {
    add('B' + i + '_b', q.code);
    const lines = q.code.split('\n'); lines[q.bug - 1] = q.fix; q.fixed = lines.join('\n');
    add('B' + i + '_f', q.fixed);
  }
  if (q.t === 'mc' && q.verify) add('M' + i + '_v', q.verify);
  if (q.t === 'mc' && q.fails) { add('M' + i + '_x', q.fails); q.oks.forEach((o, k) => add('M' + i + '_o' + k, o)); }
});
TOPICS.forEach((t, ti) => t.cards.forEach((c, ci) => { if (c.code) add('L' + ti + '_' + ci, c.code); }));
PRESETS.forEach((p, i) => add('P' + i, p.code));
PROBLEMS.forEach((pb, i) => pb.tests.forEach((t, k) => {
  add('W' + i + '_s_' + k, wrapW(pb.solution, t, pb.kind));
  pb.wrong.forEach((w, j) => add('W' + i + '_w' + j + '_' + k, wrapW(w, t, pb.kind)));
  add('W' + i + '_z_' + k, wrapW(pb.sig + ' {\n}', t, pb.kind));
}));

cp.execSync(`java -cp ${ROOT}/tools Harness ${JD} ${ROOT}/build/results.jsonl 2>/dev/null`, { stdio: 'inherit' });
const res = {};
fs.readFileSync(ROOT + '/build/results.jsonl', 'utf8').trim().split('\n').forEach(l => { const r = JSON.parse(l); res[r.id] = r; });

const problems = [];
const mismatches = [];
for (const id of Object.keys(progs)) {
  if (!res[id]) { problems.push(id + ': no result'); continue; }
  const j = label(res[id]), e = engLabel(progs[id]);
  if (j !== e) mismatches.push({ id, java: j, engine: e, err: res[id].err });
}
QUESTIONS.forEach((q, i) => {
  const L = id => label(res[id]);
  if (q.t === 'trace') {
    q.answer = L('T' + i);
    const all = [q.answer, ...q.wrong.map(norm)];
    if (new Set(all).size !== all.length) problems.push(q.id + ' trace: duplicate/correct among wrong options. answer=' + JSON.stringify(q.answer) + ' wrong=' + JSON.stringify(q.wrong));
    q.wrong = q.wrong.map(norm);
  }
  if (q.t === 'fill') {
    q.opts.forEach((o, k) => {
      const l = L('F' + i + '_' + k);
      if (k === 0 && l !== norm(q.expect)) problems.push(q.id + ' fill: correct option gives ' + JSON.stringify(l));
      if (k > 0 && l === norm(q.expect)) problems.push(q.id + ' fill: wrong option ' + k + ' also works');
    });
    q.optOut = q.opts.map((o, k) => L('F' + i + '_' + k));
  }
  if (q.t === 'bug') {
    const b = L('B' + i + '_b'), f = L('B' + i + '_f');
    if (f !== norm(q.expect)) problems.push(q.id + ' bug: fixed gives ' + JSON.stringify(f));
    if (b === norm(q.expect)) problems.push(q.id + ' bug: buggy already correct');
    q.bugOut = b;
  }
  if (q.t === 'mc' && q.verify) { const v = norm(res['M' + i + '_v'].out); if (v !== norm(q.vout || q.answer)) problems.push(q.id + ' mc verify: got ' + JSON.stringify(v)); }
  if (q.t === 'mc' && q.fails) {
    if (res['M' + i + '_x'].status !== 'compile') problems.push(q.id + ' mc: fails snippet compiled');
    q.oks.forEach((o, k) => { if (res['M' + i + '_o' + k].status === 'compile') problems.push(q.id + ' mc: ok snippet ' + k + ' did not compile: ' + res['M' + i + '_o' + k].err); });
  }
});
PROBLEMS.forEach((pb, i) => {
  if (!pb.solution.startsWith(pb.sig)) problems.push(pb.id + ': solution does not start with sig');
  pb.expect = pb.tests.map((t, k) => label(res['W' + i + '_s_' + k]).replace(/^\(nothing printed\)$/, ''));
  pb.expect.forEach((e, k) => { if (/^Crash|^Compile|^Runs/.test(e)) problems.push(pb.id + ' test ' + k + ': solution gives ' + e); });
  pb.wrong.forEach((w, j) => {
    const fails = pb.tests.filter((t, k) => label(res['W' + i + '_w' + j + '_' + k]).replace(/^\(nothing printed\)$/, '') !== pb.expect[k]).length;
    if (!fails) problems.push(pb.id + ': wrong solution ' + j + ' passes every test');
  });
});
console.log('problems:', PROBLEMS.length, 'tests:', PROBLEMS.reduce((a, p) => a + p.tests.length, 0));
console.log('programs:', Object.keys(progs).length, 'questions:', QUESTIONS.length);
console.log('PROBLEMS:', problems.length); problems.forEach(p => console.log('  ' + p));
console.log('ENGINE MISMATCHES:', mismatches.length); mismatches.forEach(m => console.log('  ' + JSON.stringify(m)));
const data = { problems: PROBLEMS.map(p => ({ id: p.id, topic: p.topic, title: p.title, kind: p.kind, prompt: p.prompt, sig: p.sig, tests: p.tests, expect: p.expect, hints: p.hints, solution: p.solution, explain: p.explain })), topics: TOPICS, questions: QUESTIONS.map(q => { const o = { ...q }; delete o.verify; delete o.vout; delete o.fails; delete o.oks; return o; }), presets: PRESETS };
fs.writeFileSync(ROOT + '/build/data.json', JSON.stringify(data));
