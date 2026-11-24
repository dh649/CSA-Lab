// Mini Java interpreter for AP CSA Units 1-2: primitives, Strings, Math, if/loops, static methods.
// Produces a step-by-step trace for the debugger view.
const JavaEngine = (() => {
  class JErr extends Error { constructor(kind, msg, line) { super(msg); this.kind = kind; this.line = line; } }
  const compile = (msg, line) => new JErr('compile', msg, line);
  const thrown = (name, msg, line) => new JErr(name, msg, line);

  const OPS = ['++', '--', '+=', '-=', '*=', '/=', '%=', '==', '!=', '<=', '>=', '&&', '||', '+', '-', '*', '/', '%', '<', '>', '=', '!', '(', ')', '{', '}', '[', ']', ';', ',', '.', '?', ':'];
  const TYPES = new Set(['int', 'double', 'boolean', 'String']);

  function lex(src) {
    const toks = []; let i = 0, line = 1; const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; } i += 2; continue; }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i, isD = false;
        while (j < n && /[0-9]/.test(src[j])) j++;
        if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { isD = true; j++; while (j < n && /[0-9]/.test(src[j])) j++; }
        else if (src[j] === '.' && !/[A-Za-z_]/.test(src[j + 1] || '')) { isD = true; j++; }
        if (src[j] === 'e' || src[j] === 'E') { isD = true; j++; if (src[j] === '+' || src[j] === '-') j++; while (j < n && /[0-9]/.test(src[j])) j++; }
        const txt = src.slice(i, j);
        if (src[j] === 'd' || src[j] === 'D') { isD = true; j++; }
        toks.push({ k: isD ? 'dbl' : 'int', v: txt, line, s: i, e: j }); i = j; continue;
      }
      if (c === '"') {
        let j = i + 1, s = '';
        while (j < n && src[j] !== '"') {
          if (src[j] === '\n') throw compile('unclosed string literal', line);
          if (src[j] === '\\') {
            const e = src[j + 1];
            const map = { n: '\n', t: '\t', '"': '"', '\\': '\\', "'": "'" };
            if (!(e in map)) throw compile('illegal escape character in string: \\' + e, line);
            s += map[e]; j += 2; continue;
          }
          s += src[j]; j++;
        }
        if (j >= n) throw compile('unclosed string literal', line);
        toks.push({ k: 'str', v: s, line, s: i, e: j + 1 }); i = j + 1; continue;
      }
      if (c === "'") throw compile('char values are not supported in this playground; use a String instead', line);
      if (/[A-Za-z_$]/.test(c)) {
        let j = i; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
        toks.push({ k: 'id', v: src.slice(i, j), line, s: i, e: j }); i = j; continue;
      }
      const op = OPS.find(o => src.startsWith(o, i));
      if (!op) throw compile("illegal character: '" + c + "'", line);
      toks.push({ k: 'op', v: op, line, s: i, e: i + op.length }); i += op.length;
    }
    toks.push({ k: 'eof', v: '<end of file>', line, s: n, e: n });
    return toks;
  }

  function parse(src) {
    const toks = lex(src); let p = 0;
    const peek = (o = 0) => toks[Math.min(p + o, toks.length - 1)];
    const next = () => toks[p++];
    const is = (v, o = 0) => { const t = peek(o); return (t.k === 'op' || t.k === 'id') && t.v === v; };
    const expect = v => { const t = next(); if (!((t.k === 'op' || t.k === 'id') && t.v === v)) throw compile("'" + v + "' expected but found '" + t.v + "'", t.line); return t; };
    const ident = () => { const t = next(); if (t.k !== 'id' || TYPES.has(t.v) || ['if', 'else', 'while', 'for', 'return', 'new', 'true', 'false', 'null'].includes(t.v)) throw compile('<identifier> expected but found \'' + t.v + "'", t.line); return t; };
    const textOf = (a, b) => src.slice(toks[a].s, toks[b - 1].e);

    function parseType() {
      const t = next();
      if (!TYPES.has(t.v) && t.v !== 'void') throw compile("unknown type '" + t.v + "'", t.line);
      let ty = t.v;
      if (is('[')) { expect('['); expect(']'); ty += '[]'; }
      return ty;
    }

    // ----- expressions -----
    function expr() { return assign(); }
    function assign() {
      const start = p;
      const lhs = ternary();
      if (peek().k === 'op' && ['=', '+=', '-=', '*=', '/=', '%='].includes(peek().v)) {
        const opTok = next();
        if (lhs.k !== 'var') throw compile('unexpected type: required variable, found value', opTok.line);
        const rhs = assign();
        return { k: 'assign', op: opTok.v, name: lhs.name, rhs, line: opTok.line, src: textOf(start, p) };
      }
      return lhs;
    }
    function ternary() {
      const start = p;
      const c = or();
      if (is('?')) { next(); const a = ternary(); expect(':'); const b = ternary(); return { k: 'cond', c, a, b, line: c.line, src: textOf(start, p) }; }
      return c;
    }
    function binLevel(sub, ops) {
      return function lvl() {
        const start = p;
        let l = sub();
        while (peek().k === 'op' && ops.includes(peek().v)) {
          const o = next(); const r = sub();
          if (o.v === '+' && l.k === 'lit' && r.k === 'lit' && l.val.t === 'String' && r.val.t === 'String') {
            l = { k: 'lit', val: { t: 'String', v: l.val.v + r.val.v, lit: true }, line: l.line, src: textOf(start, p) };
            continue;
          }
          l = { k: 'bin', op: o.v, l, r, line: o.line, src: textOf(start, p) };
        }
        return l;
      };
    }
    const mul = binLevel(unary, ['*', '/', '%']);
    const add = binLevel(mul, ['+', '-']);
    const rel = binLevel(add, ['<', '>', '<=', '>=']);
    const eq = binLevel(rel, ['==', '!=']);
    const and = binLevel(eq, ['&&']);
    const or = binLevel(and, ['||']);

    function unary() {
      const start = p; const t = peek();
      if (t.k === 'op' && (t.v === '!' || t.v === '-' || t.v === '+')) { next(); const e = unary(); return { k: 'un', op: t.v, e, line: t.line, src: textOf(start, p) }; }
      if (t.k === 'op' && (t.v === '++' || t.v === '--')) { next(); const e = unary(); if (e.k !== 'var') throw compile('unexpected type: required variable', t.line); return { k: 'inc', op: t.v, pre: true, name: e.name, line: t.line, src: textOf(start, p) }; }
      if (t.k === 'op' && t.v === '(' && peek(1).k === 'id' && TYPES.has(peek(1).v) && is(')', 2)) {
        next(); const ty = next().v; next(); const e = unary();
        return { k: 'cast', ty, e, line: t.line, src: textOf(start, p) };
      }
      return postfix();
    }
    function args() {
      expect('('); const a = [];
      if (!is(')')) { a.push(expr()); while (is(',')) { next(); a.push(expr()); } }
      expect(')'); return a;
    }
    function postfix() {
      const start = p;
      let e = primary();
      for (;;) {
        if (is('.')) {
          next(); const m = ident();
          if (!is('(')) throw compile("cannot find symbol: variable " + m.v, m.line);
          const a = args();
          e = { k: 'mcall', obj: e, name: m.v, args: a, line: m.line, src: textOf(start, p) };
        } else if (peek().k === 'op' && (peek().v === '++' || peek().v === '--')) {
          const o = next();
          if (e.k !== 'var') throw compile('unexpected type: required variable', o.line);
          e = { k: 'inc', op: o.v, pre: false, name: e.name, line: o.line, src: textOf(start, p) };
        } else break;
      }
      return e;
    }
    function primary() {
      const start = p; const t = next();
      if (t.k === 'int') {
        const v = Number(t.v);
        if (v > 2147483648) throw compile('integer number too large: ' + t.v, t.line);
        return { k: 'lit', val: { t: 'int', v: v > 2147483647 ? -2147483648 : v }, line: t.line, src: t.v };
      }
      if (t.k === 'dbl') return { k: 'lit', val: { t: 'double', v: Number(t.v) }, line: t.line, src: t.v };
      if (t.k === 'str') return { k: 'lit', val: { t: 'String', v: t.v, lit: true }, line: t.line, src: textOf(start, p) };
      if (t.k === 'op' && t.v === '(') { const e = expr(); expect(')'); return { ...e, paren: true, src: textOf(start, p) }; }
      if (t.k === 'id') {
        if (t.v === 'true' || t.v === 'false') return { k: 'lit', val: { t: 'boolean', v: t.v === 'true' }, line: t.line, src: t.v };
        if (t.v === 'null') return { k: 'lit', val: { t: 'null' }, line: t.line, src: 'null' };
        if (t.v === 'new') {
          const c = next();
          if (c.v !== 'String') throw compile('only new String(...) is supported in this playground', c.line);
          const a = args();
          return { k: 'newstr', args: a, line: t.line, src: textOf(start, p) };
        }
        if (t.v === 'Math' && is('.')) { next(); const f = ident(); const a = args(); return { k: 'math', fn: f.v, args: a, line: t.line, src: textOf(start, p) }; }
        if (t.v === 'Integer' && is('.')) { next(); const f = ident(); if (f.v === 'MAX_VALUE') return { k: 'lit', val: { t: 'int', v: 2147483647 }, line: t.line, src: 'Integer.MAX_VALUE' }; if (f.v === 'MIN_VALUE') return { k: 'lit', val: { t: 'int', v: -2147483648 }, line: t.line, src: 'Integer.MIN_VALUE' }; throw compile('cannot find symbol: Integer.' + f.v, f.line); }
        if (t.v === 'System' && is('.')) {
          next(); const o = ident(); if (o.v !== 'out') throw compile('cannot find symbol: System.' + o.v, o.line);
          expect('.'); const f = ident();
          if (!['println', 'print', 'printf'].includes(f.v)) throw compile('cannot find symbol: System.out.' + f.v, f.line);
          const a = args();
          return { k: 'print', fn: f.v, args: a, line: t.line, src: textOf(start, p) };
        }
        if (TYPES.has(t.v)) throw compile("'.class' expected", t.line);
        if (is('(')) { const a = args(); return { k: 'call', name: t.v, args: a, line: t.line, src: textOf(start, p) }; }
        return { k: 'var', name: t.v, line: t.line, src: t.v };
      }
      throw compile("illegal start of expression: '" + t.v + "'", t.line);
    }

    // ----- statements -----
    function isDeclStart() {
      let o = 0; if (is('final')) o = 1;
      const t = peek(o);
      return t.k === 'id' && TYPES.has(t.v) && (peek(o + 1).k === 'id' || is('[', o + 1));
    }
    function decl(needSemi) {
      const start = p; const line = peek().line;
      if (is('final')) next();
      const ty = parseType();
      const vars = [];
      do {
        if (vars.length) next();
        const nm = ident(); let init = null;
        if (is('=')) { next(); init = expr(); }
        vars.push({ name: nm.v, init });
      } while (is(','));
      if (needSemi) expect(';');
      return { k: 'decl', ty, vars, line, src: textOf(start, p) };
    }
    function exprStmtList() {
      const list = [exprStmtCheck(expr())];
      while (is(',')) { next(); list.push(exprStmtCheck(expr())); }
      return list;
    }
    function exprStmtCheck(e) {
      if (!['assign', 'inc', 'call', 'mcall', 'print', 'math', 'newstr'].includes(e.k) || e.paren) throw compile('not a statement', e.line);
      return e;
    }
    function block() {
      const line = expect('{').line; const body = [];
      while (!is('}')) { if (peek().k === 'eof') throw compile("reached end of file while parsing (missing '}')", peek().line); body.push(stmt()); }
      expect('}');
      return { k: 'block', body, line };
    }
    function stmt() {
      const t = peek();
      if (is('{')) return block();
      if (is(';')) { next(); return { k: 'empty', line: t.line }; }
      if (isDeclStart()) return decl(true);
      if (is('if')) {
        next(); expect('('); const s0 = p; const c = expr(); const csrc = textOf(s0, p); expect(')');
        if (is(';')) { /* if (x); is legal but almost always a bug */ }
        const a = stmt(); let b = null;
        if (is('else')) { next(); b = stmt(); }
        return { k: 'if', c, csrc, a, b, line: t.line };
      }
      if (is('while')) {
        next(); expect('('); const s0 = p; const c = expr(); const csrc = textOf(s0, p); expect(')');
        return { k: 'while', c, csrc, body: stmt(), line: t.line };
      }
      if (is('for')) {
        next(); expect('(');
        let init = null;
        if (!is(';')) init = isDeclStart() ? decl(false) : { k: 'exprs', list: exprStmtList(), line: t.line };
        expect(';');
        let c = null, csrc = '';
        if (!is(';')) { const s0 = p; c = expr(); csrc = textOf(s0, p); }
        expect(';');
        let upd = [], usrc = '';
        if (!is(')')) { const s0 = p; upd = exprStmtList(); usrc = textOf(s0, p); }
        expect(')');
        return { k: 'for', init, c, csrc, upd, usrc, body: stmt(), line: t.line };
      }
      if (is('return')) { next(); let e = null; if (!is(';')) e = expr(); expect(';'); return { k: 'return', e, line: t.line }; }
      if (is('break')) { next(); expect(';'); return { k: 'break', line: t.line }; }
      if (is('continue')) { next(); expect(';'); return { k: 'continue', line: t.line }; }
      if (is('else')) throw compile("'else' without 'if'", t.line);
      const s0 = p; const list = exprStmtList();
      if (list.length > 1) throw compile("';' expected", peek().line);
      expect(';');
      return { k: 'expr', e: list[0], line: t.line, src: textOf(s0, p) };
    }

    function method(mods) {
      const line = peek().line;
      const ret = parseType(); const nm = ident();
      expect('('); const params = [];
      if (!is(')')) {
        do { if (params.length) next(); const ty = parseType(); const pn = ident(); params.push({ ty, name: pn.v }); } while (is(','));
      }
      expect(')');
      if (!mods.includes('static')) throw compile('this playground only runs static methods; add the word static to ' + nm.v, line);
      return { name: nm.v, ret, params, body: block(), line };
    }

    const prog = { methods: {}, main: null, cls: null };
    let o = 0; while (is('public', o) || is('final', o)) o++;
    if (is('class', o)) {
      p += o; expect('class'); prog.cls = ident().v; expect('{');
      while (!is('}')) {
        if (peek().k === 'eof') throw compile("reached end of file while parsing (missing '}')", peek().line);
        const mods = []; while (['public', 'private', 'static', 'final'].includes(peek().v) && peek().k === 'id') mods.push(next().v);
        if (is('(', 2) || (is('[', 1) && is('(', 4))) {
          const m = method(mods);
          (prog.methods[m.name] = prog.methods[m.name] || []).push(m);
        } else throw compile('this playground does not support fields; declare variables inside methods', peek().line);
      }
      expect('}');
      if (peek().k !== 'eof') throw compile('class, interface, enum, or record expected', peek().line);
      const mm = (prog.methods.main || [])[0];
      if (!mm) throw compile('no main method found (public static void main(String[] args))', 1);
      prog.main = mm;
    } else {
      const body = [];
      while (peek().k !== 'eof') body.push(stmt());
      prog.main = { name: 'main', ret: 'void', params: [], body: { k: 'block', body, line: 1 }, line: 1 };
    }
    return prog;
  }

  // ----- values -----
  let strId = 0; const pool = new Map();
  const S = (v, lit) => { if (lit) { if (!pool.has(v)) pool.set(v, ++strId); return { t: 'String', v, id: pool.get(v) }; } return { t: 'String', v, id: ++strId }; };
  const I = v => ({ t: 'int', v: v | 0 });
  const D = v => ({ t: 'double', v });
  const B = v => ({ t: 'boolean', v: !!v });
  const NUM = x => x.t === 'int' || x.t === 'double';

  function fmtDouble(v) {
    if (Number.isNaN(v)) return 'NaN';
    if (v === Infinity) return 'Infinity';
    if (v === -Infinity) return '-Infinity';
    if (v === 0) return Object.is(v, -0) ? '-0.0' : '0.0';
    const a = Math.abs(v);
    if (a >= 1e-3 && a < 1e7) { const s = String(v); return s.includes('.') ? s : s + '.0'; }
    let [m, e] = v.toExponential().split('e');
    if (!m.includes('.')) m += '.0';
    return m + 'E' + (e[0] === '+' ? e.slice(1) : e);
  }
  function jstr(x) {
    switch (x.t) {
      case 'int': return String(x.v);
      case 'double': return fmtDouble(x.v);
      case 'boolean': return x.v ? 'true' : 'false';
      case 'String': return x.v;
      case 'null': return 'null';
      default: return '';
    }
  }
  function show(x) { if (!x) return '?'; if (x.t === 'String') return JSON.stringify(x.v); return jstr(x); }
  const tname = x => x.t === 'null' ? 'null' : x.t;

  function coerce(ty, x, line, what) {
    if (x.t === 'void') throw compile("'void' type not allowed here", line);
    if (ty === 'int') { if (x.t === 'int') return x; if (x.t === 'double') throw compile('incompatible types: possible lossy conversion from double to int' + (what ? ' (' + what + ')' : ''), line); }
    if (ty === 'double') { if (x.t === 'double') return x; if (x.t === 'int') return D(x.v); }
    if (ty === 'boolean' && x.t === 'boolean') return x;
    if (ty === 'String' && (x.t === 'String' || x.t === 'null')) return x;
    throw compile('incompatible types: ' + tname(x) + ' cannot be converted to ' + ty, line);
  }

  function bin(op, a, b, line) {
    if (a.t === 'void' || b.t === 'void') throw compile("'void' type not allowed here", line);
    if (op === '+' && (a.t === 'String' || b.t === 'String')) return S(jstr(a) + jstr(b));
    if (['+', '-', '*', '/', '%'].includes(op)) {
      if (!NUM(a) || !NUM(b)) throw compile("bad operand types for binary operator '" + op + "' (" + tname(a) + ', ' + tname(b) + ')', line);
      if (a.t === 'int' && b.t === 'int') {
        const x = a.v, y = b.v;
        switch (op) {
          case '+': return I(x + y);
          case '-': return I(x - y);
          case '*': return I(Math.imul(x, y));
          case '/': if (y === 0) throw thrown('ArithmeticException', '/ by zero', line); return I(Math.trunc(x / y));
          case '%': if (y === 0) throw thrown('ArithmeticException', '/ by zero', line); return I(x % y);
        }
      }
      const x = a.v, y = b.v;
      switch (op) { case '+': return D(x + y); case '-': return D(x - y); case '*': return D(x * y); case '/': return D(x / y); case '%': return D(x % y); }
    }
    if (['<', '>', '<=', '>='].includes(op)) {
      if (!NUM(a) || !NUM(b)) throw compile("bad operand types for binary operator '" + op + "' (" + tname(a) + ', ' + tname(b) + ')', line);
      return B(op === '<' ? a.v < b.v : op === '>' ? a.v > b.v : op === '<=' ? a.v <= b.v : a.v >= b.v);
    }
    if (op === '==' || op === '!=') {
      let r;
      if (NUM(a) && NUM(b)) r = a.v === b.v;
      else if (a.t === 'boolean' && b.t === 'boolean') r = a.v === b.v;
      else if ((a.t === 'String' || a.t === 'null') && (b.t === 'String' || b.t === 'null')) r = a.t === 'null' ? b.t === 'null' : (b.t !== 'null' && a.id === b.id);
      else throw compile('incomparable types: ' + tname(a) + ' and ' + tname(b), line);
      return B(op === '==' ? r : !r);
    }
    throw compile('unknown operator ' + op, line);
  }

  // ----- interpreter -----
  const SIG_BREAK = { sig: 'break' }, SIG_CONT = { sig: 'continue' };
  const MAX_STEPS = 4000;

  function run(src, opts = {}) {
    strId = 0; pool.clear();
    const res = { steps: [], out: '', error: null };
    let prog;
    try { prog = parse(src); }
    catch (e) { if (e instanceof JErr) { res.error = { kind: 'compile', msg: e.message, line: e.line }; return res; } throw e; }

    const frames = [];
    let out = '';
    const maxSteps = opts.maxSteps || MAX_STEPS;
    const record = opts.record !== false;
    let count = 0;

    function snapshot(line, note, changed) {
      count++;
      if (count > maxSteps) throw thrown('Timeout', 'Stopped after ' + maxSteps + ' steps. This is probably an infinite loop: check that the loop condition can become false.', line);
      if (!record) return;
      res.steps.push({
        line, note, changed: changed || null, out,
        frames: frames.map(f => ({ name: f.name, line: f.line, vars: f.scopes.flatMap(sc => [...sc.entries()].map(([n, v]) => ({ n, ty: v.ty, val: v.val ? show(v.val) : '(no value)' }))) }))
      });
    }
    const top = () => frames[frames.length - 1];
    function lookup(name, line) {
      const f = top();
      for (let i = f.scopes.length - 1; i >= 0; i--) if (f.scopes[i].has(name)) return f.scopes[i].get(name);
      throw compile('cannot find symbol: variable ' + name, line);
    }
    function get(name, line) {
      const v = lookup(name, line);
      if (!v.val) throw compile('variable ' + name + ' might not have been initialized', line);
      return v.val;
    }
    function declare(name, ty, val, line) {
      for (const sc of top().scopes) if (sc.has(name)) throw compile('variable ' + name + ' is already defined', line);
      top().scopes[top().scopes.length - 1].set(name, { ty, val });
    }

    function* call(m, argv, line) {
      if (frames.length > 60) throw thrown('StackOverflowError', 'too many nested method calls', line);
      const f = { name: m.name, scopes: [new Map()], line, m };
      frames.push(f);
      if (m !== prog.main) m.params.forEach((pp, i) => declare(pp.name, pp.ty, coerce(pp.ty, argv[i], line, 'argument ' + (i + 1)), line));
      if (m.name !== 'main' || frames.length > 1) snapshot(m.line, 'Called ' + m.name + '(' + argv.map(show).join(', ') + '). Parameters get copies of the arguments.');
      let ret = { t: 'void' };
      try { yield* execBlock(m.body, false); if (m.ret !== 'void') throw compile('missing return statement in ' + m.name, m.line); }
      catch (e) { if (e && e.sig === 'return') ret = e.val; else throw e; }
      finally { frames.pop(); }
      return ret;
    }

    function pickMethod(name, argv, line) {
      const ms = prog.methods[name];
      if (!ms) throw compile('cannot find symbol: method ' + name, line);
      const ok = ms.filter(m => m.params.length === argv.length && m.params.every((pp, i) => { try { coerce(pp.ty, argv[i], line); return true; } catch (e) { return false; } }));
      if (!ok.length) throw compile('method ' + name + ' cannot be applied to (' + argv.map(tname).join(', ') + ')', line);
      return ok.find(m => m.params.every((pp, i) => pp.ty === argv[i].t)) || ok[0];
    }

    function* evArgs(list) { const a = []; for (const x of list) a.push(yield* ev(x)); return a; }

    function* ev(e) {
      switch (e.k) {
        case 'lit': return e.val.t === 'String' ? S(e.val.v, true) : e.val;
        case 'var': return get(e.name, e.line);
        case 'cond': { const c = yield* ev(e.c); if (c.t !== 'boolean') throw compile('incompatible types: ' + tname(c) + ' cannot be converted to boolean', e.line); return yield* ev(c.v ? e.a : e.b); }
        case 'bin': {
          if (e.op === '&&' || e.op === '||') {
            const a = yield* ev(e.l);
            if (a.t !== 'boolean') throw compile("bad operand types for binary operator '" + e.op + "'", e.line);
            if (e.op === '&&' && !a.v) return B(false);
            if (e.op === '||' && a.v) return B(true);
            const b = yield* ev(e.r);
            if (b.t !== 'boolean') throw compile("bad operand types for binary operator '" + e.op + "'", e.line);
            return b;
          }
          const a = yield* ev(e.l); const b = yield* ev(e.r);
          return bin(e.op, a, b, e.line);
        }
        case 'un': {
          const x = yield* ev(e.e);
          if (e.op === '!') { if (x.t !== 'boolean') throw compile("bad operand type " + tname(x) + " for unary operator '!'", e.line); return B(!x.v); }
          if (!NUM(x)) throw compile("bad operand type " + tname(x) + " for unary operator '" + e.op + "'", e.line);
          if (e.op === '+') return x;
          return x.t === 'int' ? I(-x.v) : D(-x.v);
        }
        case 'cast': {
          const x = yield* ev(e.e);
          if (e.ty === 'int') {
            if (x.t === 'int') return x;
            if (x.t === 'double') { const v = x.v; if (Number.isNaN(v)) return I(0); if (v >= 2147483647) return I(2147483647); if (v <= -2147483648) return I(-2147483648); return I(Math.trunc(v)); }
          }
          if (e.ty === 'double' && NUM(x)) return D(x.v);
          if (e.ty === x.t) return x;
          throw compile('incompatible types: ' + tname(x) + ' cannot be converted to ' + e.ty, e.line);
        }
        case 'assign': {
          const v = lookup(e.name, e.line);
          let r = yield* ev(e.rhs);
          if (e.op === '=') { v.val = coerce(v.ty, r, e.line); return v.val; }
          if (!v.val) throw compile('variable ' + e.name + ' might not have been initialized', e.line);
          let res2 = bin(e.op[0], v.val, r, e.line);
          if (v.ty === 'int' && res2.t === 'double') res2 = I(Math.trunc(res2.v));
          else if (v.ty === 'String' && res2.t !== 'String') throw compile('incompatible types', e.line);
          v.val = coerce(v.ty, res2, e.line);
          return v.val;
        }
        case 'inc': {
          const v = lookup(e.name, e.line);
          if (!v.val) throw compile('variable ' + e.name + ' might not have been initialized', e.line);
          if (!NUM(v.val)) throw compile("bad operand type " + tname(v.val) + " for unary operator '" + e.op + "'", e.line);
          const old = v.val; const d = e.op === '++' ? 1 : -1;
          v.val = old.t === 'int' ? I(old.v + d) : D(old.v + d);
          return e.pre ? v.val : old;
        }
        case 'newstr': { const a = yield* evArgs(e.args); if (a.length !== 1 || a[0].t !== 'String') throw compile('new String(...) needs one String', e.line); return S(a[0].v); }
        case 'math': return mathCall(e.fn, yield* evArgs(e.args), e.line);
        case 'call': { const a = yield* evArgs(e.args); return yield* call(pickMethod(e.name, a, e.line), a, e.line); }
        case 'mcall': {
          const o = yield* ev(e.obj); const a = yield* evArgs(e.args);
          return strMethod(o, e.name, a, e.line);
        }
        case 'print': {
          const a = yield* evArgs(e.args);
          if (e.fn === 'printf') { out += printf(a, e.line); return { t: 'void' }; }
          if (a.length > 1) throw compile('no suitable method found for ' + e.fn + ' with ' + a.length + ' arguments', e.line);
          if (a[0] && a[0].t === 'void') throw compile("'void' type not allowed here", e.line);
          if (e.fn === 'print' && !a.length) throw compile('no suitable method found for print(no arguments)', e.line);
          out += (a.length ? jstr(a[0]) : '') + (e.fn === 'println' ? '\n' : '');
          return { t: 'void' };
        }
      }
      throw compile('cannot evaluate ' + e.k, e.line);
    }

    function mathCall(fn, a, line) {
      const need = n => { if (a.length !== n) throw compile('Math.' + fn + ' takes ' + n + ' argument' + (n === 1 ? '' : 's'), line); a.forEach(x => { if (!NUM(x)) throw compile('Math.' + fn + ' needs numbers, not ' + tname(x), line); }); };
      switch (fn) {
        case 'abs': need(1); return a[0].t === 'int' ? I(Math.abs(a[0].v)) : D(Math.abs(a[0].v));
        case 'pow': need(2); return D(Math.pow(a[0].v, a[1].v));
        case 'sqrt': need(1); return D(Math.sqrt(a[0].v));
        case 'random': need(0); return D(opts.random ? opts.random() : Math.random());
        case 'max': case 'min': need(2); { const r = Math[fn](a[0].v, a[1].v); return a[0].t === 'int' && a[1].t === 'int' ? I(r) : D(r); }
      }
      throw compile('Math.' + fn + ' is not part of the AP subset this playground supports', line);
    }

    function strMethod(o, name, a, line) {
      if (o.t === 'null') throw thrown('NullPointerException', 'Cannot invoke "String.' + name + '()" because the value is null', line);
      if (o.t !== 'String') throw compile(tname(o) + ' cannot be dereferenced (primitives have no methods)', line);
      const s = o.v;
      const argT = (i, t) => { if (!a[i] || (a[i].t !== t && !(t === 'String' && a[i].t === 'null'))) throw compile('incompatible argument for ' + name, line); };
      switch (name) {
        case 'length': if (a.length) throw compile('length() takes no arguments', line); return I(s.length);
        case 'substring': {
          if (a.length < 1 || a.length > 2) throw compile('substring takes 1 or 2 ints', line);
          argT(0, 'int'); if (a.length === 2) argT(1, 'int');
          const b = a[0].v, en = a.length === 2 ? a[1].v : s.length;
          if (b < 0 || en > s.length || b > en) throw thrown('StringIndexOutOfBoundsException', 'begin ' + b + ', end ' + en + ', length ' + s.length, line);
          return S(s.slice(b, en));
        }
        case 'indexOf': { argT(0, 'String'); if (a.length > 1) argT(1, 'int'); return I(s.indexOf(a[0].v, a.length > 1 ? Math.max(0, a[1].v) : 0)); }
        case 'equals': if (a.length !== 1) throw compile('equals takes 1 argument', line); return B(a[0].t === 'String' && a[0].v === s);
        case 'equalsIgnoreCase': return B(a[0].t === 'String' && a[0].v.toLowerCase() === s.toLowerCase());
        case 'compareTo': {
          argT(0, 'String'); if (a[0].t === 'null') throw thrown('NullPointerException', 'compareTo(null)', line);
          const t = a[0].v; const lim = Math.min(s.length, t.length);
          for (let k = 0; k < lim; k++) if (s.charCodeAt(k) !== t.charCodeAt(k)) return I(s.charCodeAt(k) - t.charCodeAt(k));
          return I(s.length - t.length);
        }
        case 'toUpperCase': return S(s.toUpperCase());
        case 'toLowerCase': return S(s.toLowerCase());
        case 'contains': argT(0, 'String'); return B(s.includes(a[0].v));
      }
      throw compile('cannot find symbol: method ' + name + ' (not supported here)', line);
    }

    function printf(a, line) {
      if (!a.length || a[0].t !== 'String') throw compile('printf needs a format String first', line);
      let k = 1;
      return a[0].v.replace(/%(-?\d*)(?:\.(\d+))?([dfsn%])/g, (m, w, prec, c) => {
        if (c === 'n') return '\n'; if (c === '%') return '%';
        const x = a[k++]; if (!x) throw thrown('MissingFormatArgumentException', "Format specifier '" + m + "'", line);
        let r;
        if (c === 'd') { if (x.t !== 'int') throw thrown('IllegalFormatConversionException', 'd != ' + x.t, line); r = String(x.v); }
        else if (c === 'f') { if (x.t !== 'double') throw thrown('IllegalFormatConversionException', 'f != ' + x.t, line); r = x.v.toFixed(prec === undefined ? 6 : +prec); }
        else r = jstr(x);
        const width = Math.abs(+w || 0);
        if (r.length < width) r = w.startsWith('-') ? r.padEnd(width) : r.padStart(width);
        return r;
      });
    }

    function* execBlock(b, scoped = true) {
      if (scoped) top().scopes.push(new Map());
      try { for (const s of b.body) yield* exec(s); }
      finally { if (scoped) top().scopes.pop(); }
    }

    function describeExpr(e, val) {
      if (e.k === 'assign') return e.name + (e.op === '=' ? '' : ' ' + e.op + ' ...') + ' → ' + e.name + ' is now ' + show(val);
      if (e.k === 'inc') { const v = lookup(e.name, e.line); return e.name + e.op.replace(/./, '') + ' → ' + e.name + ' is now ' + show(v.val); }
      if (e.k === 'print') return 'Printed to the console';
      if (e.k === 'call') return 'Back from ' + e.name + '()' + (val && val.t !== 'void' ? ', it returned ' + show(val) : '');
      return 'Ran ' + e.src;
    }

    function* exec(s) {
      switch (s.k) {
        case 'block': return yield* execBlock(s);
        case 'empty': return;
        case 'decl': {
          const notes = [];
          for (const v of s.vars) {
            let val = null;
            if (v.init) val = coerce(s.ty, yield* ev(v.init), s.line, v.name);
            declare(v.name, s.ty, val, s.line);
            notes.push(val ? s.ty + ' ' + v.name + ' = ' + show(val) : 'Declared ' + s.ty + ' ' + v.name + ' (no value yet)');
          }
          snapshot(s.line, notes.join('; '), s.vars.map(v => v.name));
          return;
        }
        case 'expr': {
          const before = out.length;
          const val = yield* ev(s.e);
          if (s.e.k === 'print') { snapshot(s.line, 'Printed ' + JSON.stringify(out.slice(before)).replace(/\\n/g, '↵'), null); return; }
          const ch = s.e.k === 'assign' || s.e.k === 'inc' ? [s.e.name] : null;
          snapshot(s.line, describeExpr(s.e, val), ch);
          return;
        }
        case 'if': {
          const c = yield* ev(s.c);
          if (c.t !== 'boolean') throw compile('incompatible types: ' + tname(c) + ' cannot be converted to boolean', s.line);
          snapshot(s.line, '(' + s.csrc + ') is ' + c.v + (c.v ? ' → run the if part' : s.b ? ' → skip to else' : ' → skip it'));
          if (c.v) yield* scopedStmt(s.a); else if (s.b) yield* scopedStmt(s.b);
          return;
        }
        case 'while': {
          let iter = 0;
          for (;;) {
            const c = yield* ev(s.c);
            if (c.t !== 'boolean') throw compile('incompatible types: ' + tname(c) + ' cannot be converted to boolean', s.line);
            snapshot(s.line, '(' + s.csrc + ') is ' + c.v + (c.v ? ' → run the loop body (pass ' + (++iter) + ')' : ' → loop ends'));
            if (!c.v) break;
            try { yield* scopedStmt(s.body); }
            catch (e) { if (e === SIG_BREAK) { snapshot(s.line, 'break → leave the loop'); break; } if (e !== SIG_CONT) throw e; }
          }
          return;
        }
        case 'for': {
          top().scopes.push(new Map());
          try {
            if (s.init) {
              if (s.init.k === 'decl') yield* exec(s.init);
              else { for (const x of s.init.list) yield* ev(x); snapshot(s.line, 'Loop setup'); }
            }
            let iter = 0;
            for (;;) {
              let cv = true;
              if (s.c) {
                const c = yield* ev(s.c);
                if (c.t !== 'boolean') throw compile('incompatible types: ' + tname(c) + ' cannot be converted to boolean', s.line);
                cv = c.v;
                snapshot(s.line, '(' + s.csrc + ') is ' + cv + (cv ? ' → run the loop body (pass ' + (++iter) + ')' : ' → loop ends'));
              }
              if (!cv) break;
              try { yield* scopedStmt(s.body); }
              catch (e) { if (e === SIG_BREAK) { snapshot(s.line, 'break → leave the loop'); break; } if (e !== SIG_CONT) throw e; }
              const names = [];
              for (const x of s.upd) { yield* ev(x); if (x.name) names.push(x.name); }
              if (s.upd.length) snapshot(s.line, 'Update: ' + s.usrc + ' → ' + names.map(n => n + ' is now ' + show(lookup(n, s.line).val)).join(', '), names);
            }
          } finally { top().scopes.pop(); }
          return;
        }
        case 'return': {
          let val = { t: 'void' };
          const m = frames.length;
          if (s.e) val = yield* ev(s.e);
          const fname = top().name;
          const rt = top().m.ret;
          if (rt === 'void' && s.e) throw compile('incompatible types: unexpected return value', s.line);
          if (rt !== 'void' && !s.e) throw compile('missing return value', s.line);
          if (rt !== 'void') val = coerce(rt, val, s.line);
          snapshot(s.line, s.e ? 'return ' + show(val) + ' → leave ' + fname + '()' : 'return → leave ' + fname + '()');
          throw { sig: 'return', val, depth: m };
        }
        case 'break': throw SIG_BREAK;
        case 'continue': snapshot(s.line, 'continue → jump to the next pass'); throw SIG_CONT;
      }
    }
    function* scopedStmt(s) {
      if (s.k === 'decl') throw compile('variable declaration not allowed here (use { } braces)', s.line);
      if (s.k === 'block') return yield* execBlock(s);
      top().scopes.push(new Map());
      try { yield* exec(s); } finally { top().scopes.pop(); }
    }

    try {
      frames.length = 0;
      const g = call(prog.main, [], prog.main.line);
      let r = g.next(); while (!r.done) r = g.next();
      res.steps.push({ line: null, note: 'Program finished.', out, frames: [], changed: null, end: true });
    } catch (e) {
      if (e instanceof JErr) {
        res.error = { kind: e.kind, msg: e.message, line: e.line };
        if (e.kind === 'compile') { res.steps = []; out = ''; }
        res.steps.push({ line: e.line, note: (e.kind === 'compile' ? 'Compile error: ' : e.kind === 'Timeout' ? '' : 'Crash! ' + e.kind + ': ') + e.message, out, frames: res.steps.length ? res.steps[res.steps.length - 1].frames : [], changed: null, end: true, err: true });
      } else if (e === SIG_BREAK) { res.error = { kind: 'compile', msg: 'break outside switch or loop', line: null }; }
      else if (e === SIG_CONT) { res.error = { kind: 'compile', msg: 'continue outside of loop', line: null }; }
      else throw e;
    }
    res.out = out;
    return res;
  }

  return { run, parse, lex, fmtDouble };
})();
if (typeof module !== 'undefined') module.exports = JavaEngine;
