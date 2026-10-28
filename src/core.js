'use strict';
/* ===================== N2 — core ===================== */
const TAU = Math.PI * 2;
const VH = 540;
let VW = 960, SC = 1, DPR = 1;
const GY0 = 378, GY1 = 512;           // walkable depth band (feet y)
const GRAV = 1750;

const cv = document.getElementById('game');
const cx = cv.getContext('2d');
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - (1 - t) * (1 - t);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const FA = '۰۱۲۳۴۵۶۷۸۹';
const fa = n => String(n).replace(/\d/g, d => FA[d]);
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function shade(hex, amt) {
  let n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; }

/* ---------- storage ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('n2.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('n2.' + k, JSON.stringify(v)); } catch (e) { } }
};
const LOOK = Object.assign({ skin: 'normal', beard: 'short', cap: '#c8a477', v: 2 }, store.get('look', {}));
if (LOOK.v !== 2) { LOOK.cap = '#c8a477'; LOOK.v = 2; }
const SET = Object.assign({ mus: true, sfx: true, vib: true, q: 'high' }, store.get('set', {}));

/* ---------- drawing helpers ---------- */
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, TAU); }
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, TAU); }
/* cheap neon: layered strokes, no shadowBlur */
function neon(c, col, w, core) {
  const a = c.globalAlpha;
  c.strokeStyle = col;
  c.globalAlpha = a * .18; c.lineWidth = w * 4; c.stroke();
  c.globalAlpha = a * .4; c.lineWidth = w * 2.1; c.stroke();
  c.globalAlpha = a; c.lineWidth = w; c.stroke();
  if (core !== false) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(.8, w * .38); c.stroke(); }
  c.globalAlpha = a;
}
function limb(c, x, y, a, len, w, col, endR, endCol, out) {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = col; rr(c, -w / 2, -w / 2, w, len + w / 2, w / 2); c.fill();
  if (out) { c.strokeStyle = out; c.lineWidth = 2.4; c.stroke(); }
  if (endR) { c.fillStyle = endCol; circ(c, 0, len, endR); c.fill(); if (out) c.stroke(); }
  c.restore();
}
function glowDot(c, x, y, r, col, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a == null ? .9 : a)); g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
function text(c, s, x, y, o) {
  o = o || {};
  c.font = o.font || '20px Lalezar, Vazirmatn, Tahoma, sans-serif';
  c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
  c.direction = /[\u0600-\u06FF]/.test(s) ? 'rtl' : 'ltr';
  if (o.align === 'left' && c.direction === 'rtl') c.textAlign = 'left';
  if (o.glow) {
    c.save(); c.shadowColor = o.glow; c.shadowBlur = o.blur || 14;
    c.fillStyle = o.fill || '#fff'; c.fillText(s, x, y); c.restore();
  }
  if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || 4; c.strokeText(s, x, y); }
  c.fillStyle = o.fill || '#fff'; c.fillText(s, x, y);
}

/* ---------- audio ---------- */
const AU = { ctx: null };
function auInit() {
  try {
    if (!AU.ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const a = new C(); AU.ctx = a;
      const comp = a.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 4; comp.connect(a.destination);
      AU.master = a.createGain(); AU.master.gain.value = .9; AU.master.connect(comp);
      AU.sfx = a.createGain(); AU.sfx.connect(AU.master);
      AU.mus = a.createGain(); AU.mus.connect(AU.master);
      const n = a.createBuffer(1, a.sampleRate, a.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      AU.nb = n;
      const dl = a.createDelay(1); dl.delayTime.value = .3;
      const fb = a.createGain(); fb.gain.value = .3;
      const lf = a.createBiquadFilter(); lf.type = 'lowpass'; lf.frequency.value = 2400;
      AU.echo = a.createGain(); AU.echo.connect(dl); dl.connect(lf); lf.connect(fb); fb.connect(dl); lf.connect(AU.mus);
      auVol();
      if (MU.pending) { const p = MU.pending; MU.pending = null; musPlay(p); }
    }
    if (AU.ctx.state === 'suspended') AU.ctx.resume();
  } catch (e) { }
}
function auVol() { if (!AU.ctx) return; AU.sfx.gain.value = SET.sfx ? .8 : 0; AU.mus.gain.value = SET.mus ? .3 : 0; }
function tn(o) {
  const a = AU.ctx; if (!a || !SET.sfx && !o.dest) return;
  const t = a.currentTime + (o.d || 0), L = o.l || .1;
  const os = a.createOscillator(); os.type = o.w || 'square';
  os.frequency.setValueAtTime(o.f, t);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + L);
  const g = a.createGain(); const v = o.v == null ? .3 : o.v;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.at || .004));
  g.gain.exponentialRampToValueAtTime(.0001, t + L);
  let node = os;
  if (o.lp) { const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || 1; os.connect(f); node = f; }
  node.connect(g); g.connect(o.dest || AU.sfx); if (o.echo) g.connect(AU.echo);
  os.start(t); os.stop(t + L + .05);
}
function nz(o) {
  const a = AU.ctx; if (!a || !SET.sfx && !o.dest) return;
  const t = a.currentTime + (o.d || 0), L = o.l || .1;
  const s = a.createBufferSource(); s.buffer = AU.nb; s.loop = true;
  const f = a.createBiquadFilter(); f.type = o.ft || 'lowpass';
  f.frequency.setValueAtTime(o.f || 2000, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + L); f.Q.value = o.q || .8;
  const g = a.createGain(); g.gain.setValueAtTime(o.v == null ? .3 : o.v, t); g.gain.exponentialRampToValueAtTime(.0001, t + L);
  s.connect(f); f.connect(g); g.connect(o.dest || AU.sfx);
  s.start(t, Math.random() * .5); s.stop(t + L + .05);
}
const SFX = {
  ui() { tn({ w: 'triangle', f: 880, l: .06, v: .22 }); tn({ w: 'triangle', f: 1320, l: .08, v: .2, d: .05 }); },
  whoosh() { nz({ ft: 'bandpass', f: 500, f2: 2600, q: 1.6, l: .13, v: .22 }); },
  punch() { nz({ f: 2200, f2: 260, l: .08, v: .5 }); tn({ w: 'sine', f: 170, f2: 48, l: .14, v: .7 }); },
  bat() { tn({ w: 'sine', f: 130, f2: 40, l: .2, v: .8 }); nz({ f: 3000, f2: 400, l: .12, v: .45 }); tn({ w: 'triangle', f: 760, f2: 600, l: .07, v: .14 }); },
  clang() { [523, 1307, 1990, 2711].forEach((f, i) => tn({ w: 'square', f, l: .4 - i * .06, v: .07, lp: 6000 })); nz({ f: 5000, f2: 900, l: .07, v: .35 }); tn({ w: 'sine', f: 150, f2: 50, l: .14, v: .55 }); },
  pew() { tn({ w: 'square', f: 1500, f2: 260, l: .13, v: .2 }); tn({ w: 'sawtooth', f: 760, f2: 120, l: .1, v: .12 }); },
  zap() { tn({ w: 'sawtooth', f: 1100, f2: 60, l: .38, v: .2 }); nz({ ft: 'highpass', f: 3000, l: .3, v: .12 }); },
  ko() { tn({ w: 'square', f: 220, f2: 55, l: .3, v: .28 }); nz({ f: 1500, f2: 100, l: .3, v: .35 }); },
  pickup() { [660, 880, 1320].forEach((f, i) => tn({ w: 'triangle', f, l: .09, v: .24, d: i * .055 })); },
  heal() { [523, 659, 784, 1046].forEach((f, i) => tn({ w: 'triangle', f, l: .1, v: .22, d: i * .06 })); },
  brk() { nz({ f: 5000, f2: 150, l: .4, v: .55 }); tn({ w: 'square', f: 320, f2: 50, l: .32, v: .2 }); },
  hurt() { tn({ w: 'square', f: 260, f2: 90, l: .16, v: .26 }); nz({ f: 1200, l: .08, v: .3 }); },
  jump() { tn({ w: 'square', f: 280, f2: 760, l: .12, v: .13 }); },
  land() { nz({ f: 500, l: .07, v: .25 }); },
  special() { tn({ w: 'sawtooth', f: 180, f2: 1400, l: .45, v: .2 }); nz({ ft: 'bandpass', f: 400, f2: 4000, q: 2, l: .5, v: .3 }); },
  boom() { nz({ f: 1200, f2: 60, l: .7, v: .7 }); tn({ w: 'sine', f: 90, f2: 30, l: .6, v: .8 }); },
  roar() { tn({ w: 'sawtooth', f: 90, f2: 45, l: 1.1, v: .3, lp: 800 }); tn({ w: 'square', f: 93, f2: 44, l: 1.1, v: .15, lp: 600 }); nz({ f: 600, l: 1, v: .25 }); },
  warn() { tn({ w: 'square', f: 990, l: .08, v: .14 }); tn({ w: 'square', f: 990, l: .08, v: .14, d: .14 }); },
  laser() { tn({ w: 'sawtooth', f: 120, f2: 900, l: .4, v: .22 }); nz({ ft: 'highpass', f: 2000, l: .4, v: .2 }); },
  orb() { tn({ w: 'sine', f: 600, f2: 300, l: .2, v: .2 }); },
  go() { [784, 988, 1175].forEach((f, i) => tn({ w: 'square', f, l: .08, v: .1, d: i * .07 })); },
  tele() { tn({ w: 'sine', f: 1800, f2: 200, l: .22, v: .18 }); },
  block() { tn({ w: 'square', f: 1600, f2: 900, l: .06, v: .12 }); nz({ ft: 'highpass', f: 2500, l: .06, v: .25 }); tn({ w: 'sine', f: 240, f2: 120, l: .08, v: .3 }); },
  coin() { tn({ w: 'triangle', f: 1320, l: .05, v: .16 }); tn({ w: 'triangle', f: 1980, l: .08, v: .14, d: .045 }); },
  power() { tn({ w: 'sawtooth', f: 110, f2: 880, l: .7, v: .25 }); tn({ w: 'square', f: 220, f2: 1760, l: .7, v: .12 }); nz({ ft: 'bandpass', f: 300, f2: 5000, q: 2, l: .8, v: .3 }); },
  glass() { nz({ ft: 'highpass', f: 3500, l: .3, v: .4 }); [2400, 3100, 1900].forEach((f, i) => tn({ w: 'square', f, l: .12, v: .05, d: i * .03 })); },
  grab() { nz({ f: 900, l: .06, v: .3 }); tn({ w: 'triangle', f: 300, f2: 200, l: .08, v: .2 }); },
  crate() { nz({ f: 1400, f2: 200, l: .18, v: .45 }); tn({ w: 'triangle', f: 200, f2: 80, l: .12, v: .4 }); }
};
function vib(ms) { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } }

/* ---------- music (tiny synthwave sequencer) ---------- */
const SONGS = {
  menu: { bpm: 96, root: 45, prog: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -2, 2]], bass: [0, null, null, 0, null, null, 12, null, 0, null, null, 0, null, 10, null, null], kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.', arp: 2 },
  s1: { bpm: 120, root: 40, prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], bass: [0, null, 0, 12, null, 0, null, 0, 0, null, 0, 12, null, 0, 10, null], kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...xx', arp: 1 },
  s2: { bpm: 128, root: 43, prog: [[0, 4, 7], [-3, 0, 4], [-5, -1, 2], [-1, 2, 5]], bass: [0, 0, null, 0, 12, null, 0, null, 0, 0, null, 0, 12, null, 7, null], kick: 'x...x...x...x..x', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', arp: 1 },
  s3: { bpm: 132, root: 38, prog: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]], bass: [0, null, 12, null, 0, 0, null, 12, 0, null, 12, null, 0, 0, 10, 12], kick: 'x...x...x...x...', snare: '....x..x....x...', hat: 'xxx.xxx.xxx.xxx.', arp: 1 },
  boss: { bpm: 146, root: 40, prog: [[0, 3, 7], [1, 4, 8], [0, 3, 7], [-1, 3, 6]], bass: [0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 12, 0, 1, 1, 13, 1], kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x.x.', hat: 'xxxxxxxxxxxxxxxx', arp: 1 },
  final: { bpm: 150, root: 38, prog: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]], bass: [0, 0, 12, 0, 0, 12, 0, 10, 0, 0, 12, 0, 7, 7, 10, 12], kick: 'x...x...x...x.x.', snare: '....x.......x..x', hat: 'x.xxx.xxx.xxx.xx', arp: 1 },
  win: { bpm: 112, root: 48, prog: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], bass: [0, null, 0, null, 7, null, 0, null, 0, null, 0, null, 7, null, 12, null], kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', arp: 2 }
};
const MU = { song: null, name: null, step: 0, next: 0, iv: null, pending: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function musPlay(name) {
  if (!AU.ctx) { MU.pending = name; return; }
  if (MU.name === name) return;
  MU.song = SONGS[name]; MU.name = name; MU.step = 0; MU.next = AU.ctx.currentTime + .1;
  if (!MU.iv) MU.iv = setInterval(musTick, 25);
}
function musStop() { MU.song = null; MU.name = null; }
function musTick() {
  const s = MU.song, a = AU.ctx; if (!s || !a || a.state !== 'running') return;
  const sp = 60 / s.bpm / 4;
  if (MU.next < a.currentTime - .3) MU.next = a.currentTime + .05;
  while (MU.next < a.currentTime + .15) { musStep(s, MU.step, MU.next - a.currentTime, sp); MU.next += sp; MU.step++; }
}
function musStep(s, step, d, sp) {
  const M = AU.mus, i = step % 16, bar = Math.floor(step / 16) % s.prog.length, ch = s.prog[bar], r = s.root;
  if (s.kick[i] === 'x') tn({ w: 'sine', f: 150, f2: 42, l: .22, v: .85, d, dest: M });
  if (s.snare[i] === 'x') { nz({ ft: 'bandpass', f: 1900, q: .7, l: .15, v: .4, d, dest: M }); tn({ w: 'triangle', f: 200, f2: 120, l: .07, v: .2, d, dest: M }); }
  if (s.hat[i] === 'x') nz({ ft: 'highpass', f: 7600, l: .035, v: .13, d, dest: M });
  const b = s.bass[i];
  if (b != null) tn({ w: 'sawtooth', f: mtof(r + ch[0] + b), l: sp * 1.7, v: .2, lp: 700, q: 4, d, dest: M });
  if (i % s.arp === 0) {
    const k = (i / s.arp) | 0, n = ch[k % 3] + (k % 6 >= 3 ? 12 : 0);
    tn({ w: 'square', f: mtof(r + 24 + n), l: sp * .9, v: .045, lp: 2800, d, dest: M, echo: true });
  }
  if (i === 0) ch.forEach(n => tn({ w: 'triangle', f: mtof(r + 12 + n), l: sp * 15, v: .045, at: .4, d, dest: M, lp: 1800 }));
}
