/* ===================== N2 — game ===================== */
const CS = 1.16;
const Q = { layerDpr: 1.5, parts: 1 };
function applyQuality() { Q.layerDpr = SET.q === 'high' ? Math.min(2, window.devicePixelRatio || 1) : 1; Q.parts = SET.q === 'high' ? 1 : .5; }

const DIFFS = {
  normal: { hp: 1, dmg: 1, wind: 1, cool: 1, tok: 2, heal: 1, extra: 0, lives: 3 },
  hard: { hp: 1.3, dmg: 1.5, wind: .78, cool: .7, tok: 3, heal: .7, extra: 1, lives: 2 }
};
const WPN = {
  bat: { name: 'چوب بیس‌بال', dur: 14, dmg: [15, 15, 26], reach: 94, col: '#ff3fd8', snd: 'bat' },
  pipe: { name: 'میله نئونی', dur: 16, dmg: [19, 19, 30], reach: 104, col: '#29f3ff', snd: 'clang' },
  gun: { name: 'تفنگ لیزری', dur: 24, dmg: 12, col: '#b6ff4a', ranged: true },
  skate: { name: 'اسکیت‌برد نئونی', dur: 12, dmg: [14, 14, 24], reach: 98, col: '#5dff9b', snd: 'bat', wide: 40 },
  chair: { name: 'صندلی', dur: 6, dmg: [22, 22, 30], reach: 86, col: '#ffb340', snd: 'crate', kd: true },
  sign: { name: 'تابلوی نئون', dur: 5, dmg: [30, 30, 42], reach: 118, col: '#ff3fd8', snd: 'clang', kd: true },
  hammer: { name: 'چکش طلایی', dur: 10, dmg: [34, 34, 50], reach: 106, col: '#ffd23a', snd: 'bat', kd: true, wave: true }
};
const FOES = {
  punk: { hp: 34, spd: 105, range: 54, dmg: 8, wind: .42, atk: .28, cool: [.8, 1.6], score: 100, rad: 16, h: 112, draw: drawPunk, ai: 'melee', thug: 1, coins: [2, 4] },
  bot: { hp: 24, spd: 140, range: 48, dmg: 7, wind: .34, atk: .38, cool: [.9, 1.7], score: 90, rad: 20, h: 76, draw: drawBot, ai: 'dash', coins: [2, 3] },
  glitch: { hp: 30, spd: 95, range: 52, dmg: 9, wind: .36, atk: .25, cool: [1, 1.8], score: 130, rad: 18, h: 92, draw: drawGlitch, ai: 'tele', coins: [2, 4] },
  brute: { hp: 85, spd: 72, range: 68, dmg: 13, wind: .55, atk: .3, cool: [1.2, 2], score: 250, rad: 26, h: 150, draw: drawBrute, ai: 'charge', armor: true, thug: 1, coins: [5, 8] },
  drone: { hp: 24, spd: 95, range: 300, dmg: 9, wind: .5, atk: .2, cool: [1.6, 2.6], score: 140, rad: 22, h: 60, draw: drawDrone, ai: 'shoot', fly: 64, coins: [3, 4] },
  king1: { boss: 1, name: 'سلطان خیابان', hp: 480, spd: 100, range: 86, dmg: 13, rad: 34, h: 200, draw: drawKing1, score: 5000, thug: 1, coins: [40, 40] },
  arcade: { boss: 2, name: 'آرکیدوس', hp: 620, spd: 80, range: 140, dmg: 14, rad: 52, h: 230, draw: drawArcadeBoss, score: 7000, coins: [55, 55] },
  nking: { boss: 3, name: 'پادشاه نئون', hp: 820, spd: 110, range: 95, dmg: 15, rad: 30, h: 210, draw: drawNeonKing, score: 10000, coins: [80, 80] }
};
const STAGES = [
  { song: 's1', len: 4300,
    waves: [{ at: 560, f: ['punk', 'punk'] }, { at: 1250, f: ['punk', 'bot', 'punk', 'bot'] }, { at: 2050, f: ['punk', 'punk', 'bot', 'punk', 'bot'] }, { at: 2850, f: ['bot', 'punk', 'punk', 'bot', 'punk', 'punk'] }],
    boss: { at: 3650, type: 'king1' },
    props: [{ t: 'bat', x: 430, y: 445 }, { t: 'crate', x: 1100, y: 470, drop: 'skate' }, { t: 'crate', x: 1480, y: 425, drop: 'soda' }, { t: 'chair', x: 1800, y: 480 }, { t: 'crate', x: 2450, y: 430, drop: 'pizza' }, { t: 'gold', x: 2620, y: 492 }, { t: 'bat', x: 2900, y: 485 }, { t: 'crate', x: 3420, y: 455, drop: 'pizza' }] },
  { song: 's2', len: 4400,
    waves: [{ at: 560, f: ['punk', 'glitch', 'punk'] }, { at: 1280, f: ['bot', 'bot', 'glitch', 'punk'] }, { at: 2080, f: ['brute', 'punk', 'punk'] }, { at: 2880, f: ['glitch', 'glitch', 'brute', 'bot', 'punk'] }],
    boss: { at: 3720, type: 'arcade' },
    props: [{ t: 'pipe', x: 430, y: 450 }, { t: 'crate', x: 1100, y: 470, drop: 'sign' }, { t: 'crate', x: 1650, y: 420, drop: 'soda' }, { t: 'gold', x: 1950, y: 395 }, { t: 'chair', x: 2300, y: 480 }, { t: 'crate', x: 2600, y: 440, drop: 'pizza' }, { t: 'crate', x: 3450, y: 460, drop: 'pipe' }, { t: 'crate', x: 3560, y: 420, drop: 'pizza' }] },
  { song: 's3', len: 4500,
    waves: [{ at: 580, f: ['drone', 'punk', 'bot'] }, { at: 1300, f: ['brute', 'glitch', 'drone', 'punk'] }, { at: 2100, f: ['drone', 'drone', 'bot', 'bot', 'punk', 'glitch'] }, { at: 2900, f: ['brute', 'brute', 'drone', 'glitch', 'punk'] }],
    boss: { at: 3780, type: 'nking' },
    props: [{ t: 'gun', x: 440, y: 450 }, { t: 'crate', x: 1000, y: 470, drop: 'skate' }, { t: 'crate', x: 1700, y: 430, drop: 'gun' }, { t: 'crate', x: 2000, y: 480, drop: 'pizza' }, { t: 'sign', x: 2500, y: 440 }, { t: 'gold', x: 2700, y: 500 }, { t: 'crate', x: 2780, y: 430, drop: 'gun' }, { t: 'crate', x: 3500, y: 440, drop: 'pizza' }, { t: 'crate', x: 3600, y: 485, drop: 'soda' }] }
];
const STEPS = [{ story: 'intro' }, { stage: 0 }, { story: 's1' }, { bonus: 0 }, { stage: 1 }, { story: 's2' }, { bonus: 1 }, { stage: 2 }, { story: 'arian' }, { fight: true }, { story: 'end' }, { win: true }];

const G = { state: 'boot', mode: 'story', t: 0, stage: 0, step: 0, diff: 'normal', D: DIFFS.normal, S: STAGES[0], score: 0, stageScore: 0, lives: 3, camX: 0, camMin: 0, lock: null, ents: [], items: [], shots: [], fx: [], ghosts: [], hero: null, wi: 0, waveOn: false, spawnQ: [], boss: null, banner: null, hitStop: 0, slow: 1, slowT: 0, shake: 0, combo: 0, comboT: 0, goT: 0, tokens: 0, art: null, endT: 0, stageT: 0, flashT: 0, rain: [], zoom: null, runCoins: 0, wave: 0, survT: 0, bonusT: 0, bonusDmg: 0 };
const INP = { mx: 0, my: 0, atkE: false, jumpE: false, spE: false, dashE: false, n2E: false, keys: {}, joy: { id: null, ox: 0, oy: 0 }, held: {}, ptr: {} };
let BTN = {};
const durMul = () => 1 + .2 * (SAVE.up.dur || 0);

/* ---------------- resize ---------------- */
let portrait = false;
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  portrait = h > w * 1.05;
  const aw = portrait ? h : w, ah = portrait ? w : h;
  VW = Math.round(clamp(VH * aw / ah, 800, 1280));
  SC = Math.min(ah / VH, aw / VW);
  DPR = SET.q === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  cv.style.width = Math.round(VW * SC) + 'px'; cv.style.height = Math.round(VH * SC) + 'px';
  cv.width = Math.round(VW * SC * DPR); cv.height = Math.round(VH * SC * DPR);
  document.getElementById('rot').hidden = !portrait;
  BTN = {
    atk: { x: VW - 122, y: VH - 112, r: 54 },
    jump: { x: VW - 250, y: VH - 70, r: 38 },
    dash: { x: VW - 246, y: VH - 178, r: 32 },
    sp: { x: VW - 104, y: VH - 238, r: 36 },
    n2: { x: VW - 352, y: VH - 66, r: 32 },
    pause: { x: VW - 58, y: 38, r: 24 }
  };
  INP.joy.bx = 146; INP.joy.by = VH - 118;
  G.vig = null;
}

/* ---------------- run flow ---------------- */
function runStep(i) {
  G.step = i; const s = STEPS[i];
  if (!s) return;
  if (s.story) { musPlay('menu'); startStory(s.story, () => runStep(i + 1)); }
  else if (s.stage != null) { G.stageScore = G.score; SAVE.run = { diff: G.diff, step: i, score: G.score, lives: G.lives }; saveGame(); startStage(s.stage); }
  else if (s.bonus != null) startBonus(s.bonus);
  else if (s.fight) { SAVE.run = { diff: G.diff, step: i, score: G.score, lives: G.lives }; saveGame(); startFight('story'); }
  else if (s.win) winGame();
}
function newHero(x) {
  const mh = 100 + 15 * (SAVE.up.hp || 0);
  return { kind: 'hero', x, y: 450, z: 0, vz: 0, dir: 1, hp: mh, maxHp: mh, en: Math.min(100, 30 + 35 * (SAVE.up.en || 0)), rage: 0, n2T: 0, anim: 'walk', animT: 0, p: 0, state: 'intro', st: 0, weapon: null, wdur: 0, combo: 0, buf: false, inv: 0, flash: 0, hitSet: null, kicked: false, kb: 0, rad: 18, h: 120, dashCd: 0, grabCd: 0, happyT: 0, ghostT: 0 };
}
function resetArena(si) {
  G.stage = si; G.art = buildStage(si);
  G.ents = []; G.items = []; G.shots = []; G.fx = []; G.ghosts = []; G.boss = null; G.zoom = null; G.car = null;
  G.camX = 0; G.camMin = 0; G.lock = null; G.wi = 0; G.waveOn = false; G.spawnQ = []; G.tokens = 0;
  G.combo = 0; G.comboT = 0; G.goT = 0; G.slow = 1; G.slowT = 0; G.endT = 0; G.stageT = 0; G.endShown = false; G.banner = null; G.runCoins = 0;
  G.rain = [];
  if (si === 0) for (let k = 0; k < 90 * Q.parts; k++) G.rain.push({ x: Math.random() * 1400, y: Math.random() * VH, v: 700 + Math.random() * 400 });
}
function startStage(i) {
  G.mode = 'story';
  resetArena(i); G.S = STAGES[i]; G.score = G.stageScore;
  const h = G.hero = newHero(-60); G.ents.push(h);
  for (const pr of G.S.props) {
    if (pr.t === 'crate' || pr.t === 'gold') G.ents.push({ kind: 'crate', x: pr.x, y: pr.y, z: 0, hp: pr.t === 'gold' ? 3 : 2, drop: pr.t === 'gold' ? 'hammer' : pr.drop, gold: pr.t === 'gold', rad: 22, h: 50, flash: 0, wob: 0 });
    else addItem(pr.t, pr.x, pr.y, 0);
  }
  G.state = 'play'; hideScreens();
  G.banner = { t: 0, dur: 2.6, a: 'مرحله ' + fa(i + 1), b: THEMES[i].name, col: THEMES[i].neon[0] };
  musPlay(G.S.song);
}
function startBonus(bi) {
  G.mode = 'bonus'; resetArena(bi);
  G.S = { len: 300 + VW, waves: [], boss: { at: 1e9 } };
  G.camX = G.camMin = G.lock = 300;
  const h = G.hero = newHero(300 - 40); h.weapon = 'bat'; h.wdur = 99; G.ents.push(h);
  const car = { kind: 'car', x: 300 + VW * .62, y: (GY0 + GY1) / 2 + 4, z: 0, hp: 520, maxHp: 520, rad: 112, h: 92, flash: 0 };
  G.ents.push(car); G.car = car;
  G.bonusT = 25; G.bonusDmg = 0; G.state = 'play'; hideScreens();
  G.banner = { t: 0, dur: 2.4, a: 'مرحله بونوس', b: 'ماشین را در ۲۵ ثانیه خرد کن!', col: '#ffe14a' };
  musPlay('boss');
}
function startSurvival() {
  G.mode = 'survival'; G.diff = 'normal'; G.D = DIFFS.normal; G.lives = 2; G.score = 0; G.stageScore = 0; G.wave = 0;
  resetArena(0); G.S = { len: VW, waves: [], boss: { at: 1e9 } }; G.lock = 0;
  const h = G.hero = newHero(-60); G.ents.push(h);
  G.state = 'play'; G.survT = 2.6; hideScreens();
  G.banner = { t: 0, dur: 2.4, a: 'حالت بی‌پایان', b: 'تا کجا دوام میاری؟', col: '#29f3ff' };
  musPlay('s1');
}
function nextSurvWave() {
  G.wave++; ev('wave', G.wave, true);
  const cyc = Math.floor((G.wave - 1) / 5);
  if (G.wave > 1 && (G.wave - 1) % 5 === 0) {
    const si = cyc % 3; G.art = buildStage(si); G.stage = si; G.flashT = .5;
    G.rain = []; if (si === 0) for (let k = 0; k < 90 * Q.parts; k++) G.rain.push({ x: Math.random() * 1400, y: Math.random() * VH, v: 700 + Math.random() * 400 });
    musPlay(['s1', 's2', 's3'][si]);
  }
  const w = G.wave, pool = ['punk', 'bot'];
  if (w >= 3) pool.push('glitch'); if (w >= 4) pool.push('brute'); if (w >= 6) pool.push('drone');
  const n = Math.min(3 + Math.floor(w * .8), 14);
  const list = []; for (let i = 0; i < n; i++) list.push(pick(pool));
  G.spawnQ = list.map((t, i) => ({ t, side: i % 2 ? -1 : 1, d: i < 3 ? i * .4 : 0 }));
  if (w % 5 === 0) {
    const bt = ['king1', 'arcade', 'nking'][(w / 5 - 1) % 3];
    const b = spawnFoe(bt, 1, VW + 120); const k = .45 + .1 * Math.floor(w / 15);
    b.hp = b.maxHp = Math.round(FOES[bt].hp * k); b.y = (GY0 + GY1) / 2; G.boss = b; G.bossHit = false; G.bossWeapon = false;
    SFX.roar(); musPlay('boss');
  }
  if (Math.random() < .8) G.ents.push({ kind: 'crate', x: rnd(120, VW - 120), y: rnd(GY0 + 10, GY1 - 10), z: 0, hp: 2, drop: pick(['bat', 'pipe', 'skate', 'chair', 'sign', 'gun', 'pizza', 'soda']), rad: 22, h: 50, flash: 0, wob: 0 });
  if (w % 4 === 0) G.ents.push({ kind: 'crate', x: rnd(120, VW - 120), y: rnd(GY0 + 10, GY1 - 10), z: 0, hp: 3, drop: 'hammer', gold: true, rad: 22, h: 50, flash: 0, wob: 0 });
  G.waveOn = true;
  G.banner = { t: 0, dur: 1.8, a: 'موج ' + fa(w), b: w % 5 === 0 ? 'باس!' : '', col: w % 5 === 0 ? '#ff3a5a' : '#29f3ff' };
  SFX.go();
}
function addItem(type, x, y, z, dur, vx) {
  G.items.push({ type, x, y, z: z || 0, vz: z ? 200 : 0, vx: vx || 0, dur: dur != null ? dur : (WPN[type] ? Math.round(WPN[type].dur * durMul()) : 0), t: Math.random() * 6 });
}

/* ---------------- spawning ---------------- */
function spawnFoe(type, side, x0) {
  const F = FOES[type], D = G.D;
  const x = x0 != null ? x0 : side > 0 ? G.camX + VW + 60 : G.camX - 60;
  const e = {
    kind: 'foe', type, F, x, y: GY0 + 14 + Math.random() * (GY1 - GY0 - 28), z: F.fly || 0, dir: -side,
    hp: Math.round(F.hp * D.hp), maxHp: Math.round(F.hp * D.hp), state: 'enter', st: 0, anim: 'walk', animT: Math.random() * 5,
    cd: .6 + Math.random() * .9, rad: F.rad, h: F.h, flash: 0, hpShow: 0, kb: 0, vz: 0, slot: Math.random(), tok: false, poise: 0
  };
  if (F.boss) { e.boss = true; e.cd = 1.2; e.sum = 0; }
  G.ents.push(e); return e;
}
function startWave(w) {
  G.lock = clamp(G.hero.x - VW * .5, G.camMin, G.S.len - VW);
  G.waveOn = true;
  const list = w.f.slice();
  for (let k = 0; k < G.D.extra; k++) list.push(G.stage === 0 ? 'punk' : pick(['punk', 'bot', 'glitch']));
  G.spawnQ = list.map((t, i) => ({ t, side: i % 2 ? -1 : 1, d: i < 3 ? i * .45 : 0 }));
}
function startBoss() {
  const S = G.S;
  G.lock = clamp(S.boss.at - VW * .45, G.camMin, S.len - VW);
  G.waveOn = true;
  const b = spawnFoe(S.boss.type, 1, G.lock + VW + 120);
  b.y = (GY0 + GY1) / 2; G.boss = b; G.bossHit = false; G.bossWeapon = false;
  G.banner = { t: 0, dur: 2.4, a: 'باس!', b: b.F.name, col: '#ff3a5a' };
  SFX.roar(); G.shake = 10; vib(120);
  musPlay('boss');
}

/* ---------------- hero ---------------- */
function startAttack(h, n) {
  h.state = 'atk'; h.st = 0; h.p = 0; h.combo = n; h.buf = false; h.atkDone = false; h.hitSet = new Set();
  if (Math.abs(INP.mx) > .3) h.dir = INP.mx > 0 ? 1 : -1;
  const sp = h.n2T > 0 ? .78 : 1;
  if (h.weapon === 'gun') { h.anim = 'shoot'; h.atkDur = .22 * sp; h.hitAt = .55; }
  else if (h.weapon) { h.anim = ['swingA', 'swingB', 'swingC'][n]; h.atkDur = [.34, .36, .46][n] * sp * (h.weapon === 'sign' || h.weapon === 'hammer' ? 1.15 : 1); h.hitAt = [.4, .45, .5][n]; SFX.whoosh(); }
  else { h.anim = ['punch1', 'punch2', 'uppercut'][n]; h.atkDur = [.22, .22, .34][n] * sp; h.hitAt = [.35, .35, .45][n]; SFX.whoosh(); }
  if (G.boss && h.weapon) G.bossWeapon = true;
}
function nearItem(h, foodOnly) {
  let best = null, bd = 1e9;
  for (const it of G.items) {
    if (it.z > 2 || it.type === 'coin') continue;
    const isFood = it.type === 'pizza' || it.type === 'soda';
    if (foodOnly !== isFood) continue;
    const dx = Math.abs(it.x - h.x), dy = Math.abs(it.y - h.y);
    if (dx < 48 && dy < 28 && dx + dy < bd) { bd = dx + dy; best = it; }
  }
  return best;
}
function grabTarget(h) {
  if (h.grabCd > 0 || Math.abs(INP.mx) < .3) return null;
  const d = INP.mx > 0 ? 1 : -1;
  for (const e of G.ents) {
    if (e.kind !== 'foe' || e.boss || e.dead || e.F.fly || e.z > 4) continue;
    if (e.F.armor && !(h.n2T > 0)) continue;
    if (!['approach', 'recover', 'hurt', 'windup'].includes(e.state)) continue;
    const dx = (e.x - h.x) * d;
    if (dx > 0 && dx < e.rad + 30 && Math.abs(e.y - h.y) < 14) return e;
  }
  return null;
}
function addGhost(h, col) {
  G.ghosts.push({ x: h.x, y: h.y, z: h.z, dir: h.dir, anim: h.anim, animT: h.animT, p: h.p, weapon: h.weapon, t: 0, l: .3, col });
  if (G.ghosts.length > 6) G.ghosts.shift();
}
function heroUpdate(h, dt) {
  h.animT += dt; h.st += dt; if (h.inv > 0) h.inv -= dt; if (h.flash > 0) h.flash -= dt;
  if (h.dashCd > 0) h.dashCd -= dt; if (h.grabCd > 0) h.grabCd -= dt; if (h.happyT > 0) h.happyT -= dt;
  if (h.n2T > 0) { h.n2T -= dt; h.ghostT -= dt; if (h.ghostT <= 0) { h.ghostT = .07; addGhost(h, '#ff3fd8'); } if (h.n2T <= 0) toast('حالت N2 تمام شد', '', '#ff3fd8'); }
  const mx = INP.mx, my = INP.my, spd = h.n2T > 0 ? 1.25 : 1;
  if (h.state === 'intro') {
    h.x += 170 * dt; h.anim = 'walk';
    if (h.x >= G.camX + 170) { h.state = 'idle'; h.anim = 'idle'; }
    return;
  }
  if (h.state === 'victory' || h.state === 'dead') { if (h.state === 'victory') h.anim = 'victory'; return; }
  if (INP.n2E && h.rage >= 100 && !['down', 'getup', 'dead', 'grab'].includes(h.state)) {
    h.n2T = 8; h.rage = 0; h.inv = Math.max(h.inv, .5); SFX.power(); G.flashT = .25; G.shake = 10; vib(120);
    ring(h.x, h.y, '#ff3fd8', 200); ring(h.x, h.y, '#29f3ff', 140);
    G.banner = { t: 0, dur: 1.4, a: 'حالت N2!', b: '', col: '#ff3fd8' }; ev('n2');
  }
  const free = h.state === 'idle' || h.state === 'walk';
  if (INP.dashE && h.dashCd <= 0 && (free || h.state === 'atk' && h.p > .6)) {
    if (Math.abs(mx) > .2) h.dir = mx > 0 ? 1 : -1;
    h.state = 'dash'; h.st = 0; h.anim = 'dash'; h.inv = Math.max(h.inv, .24); h.hitSet = new Set(); h.dashCd = .55; SFX.whoosh(); puff(h.x, h.y, 4);
  }
  if (h.state === 'jump' || h.state === 'jkick') {
    h.vz -= GRAV * dt; h.z += h.vz * dt; h.x += mx * 215 * spd * dt; h.y += my * 100 * dt;
    if (Math.abs(mx) > .3 && h.state === 'jump') h.dir = mx > 0 ? 1 : -1;
    if (INP.atkE && h.state === 'jump' && !h.kicked) { h.state = 'jkick'; h.anim = 'kick'; h.kicked = true; h.hitSet = new Set(); SFX.whoosh(); }
    if (h.state === 'jkick') meleeHit(h, 70, 16, true, 'kick');
    if (h.z <= 0) { h.z = 0; h.vz = 0; h.state = 'idle'; h.anim = 'idle'; SFX.land(); puff(h.x, h.y, 5); }
  } else if (free) {
    const food = nearItem(h, true);
    if (food) eatFood(h, food);
    const gt = grabTarget(h);
    if (INP.jumpE) { h.state = 'jump'; h.anim = 'jump'; h.vz = 600; h.kicked = false; SFX.jump(); puff(h.x, h.y, 4); }
    else if (INP.spE && h.en >= 50) { h.en -= 50; h.state = 'special'; h.st = 0; h.anim = 'special'; h.hitSet = new Set(); h.spTick = 0; SFX.special(); G.shake = 6; ring(h.x, h.y, '#29f3ff', 140); vib(60); }
    else if (INP.atkE) { const it = nearItem(h, false); if (it) pickWeapon(h, it); else startAttack(h, 0); }
    else if (gt && !h.weapon) {
      h.state = 'grab'; h.st = 0; h.anim = 'grab'; h.grabbed = gt; h.grabN = 0; h.kneeT = 0;
      releaseTok(gt); setFoe(gt, 'grabbed'); gt.anim = 'hurt'; SFX.grab();
    }
    else if (Math.abs(mx) > .12 || Math.abs(my) > .12) {
      h.x += mx * 215 * spd * dt; h.y += my * 135 * spd * dt; if (Math.abs(mx) > .12) h.dir = mx > 0 ? 1 : -1;
      h.anim = 'walk'; h.state = 'walk';
    } else { h.state = 'idle'; h.anim = 'idle'; }
  } else if (h.state === 'atk') {
    h.p = h.st / h.atkDur;
    if (INP.atkE) h.buf = true;
    if (!h.atkDone && h.p >= h.hitAt) { h.atkDone = true; heroStrike(h); }
    if (h.combo === 2 && h.p < .5) h.x += h.dir * 110 * dt;
    if (h.p >= 1) {
      if (h.buf && h.weapon === 'gun') startAttack(h, 0);
      else if (h.buf && h.combo < 2) startAttack(h, h.combo + 1);
      else { h.state = 'idle'; h.anim = 'idle'; h.combo = 0; }
    }
  } else if (h.state === 'dash') {
    const k = 1 - h.st / .22;
    h.x += h.dir * 760 * Math.max(.2, k) * dt;
    h.ghostT -= dt; if (h.ghostT <= 0) { h.ghostT = .04; addGhost(h, '#29f3ff'); }
    for (const e of G.ents) {
      if (e === h || !hittable(e) || h.hitSet.has(e) || e.kind === 'car') continue;
      if (Math.abs(e.x - h.x) < e.rad + 24 && Math.abs(e.y - h.y) < 22 && e.z < 80) { h.hitSet.add(e); hurtFoe(e, 7, h.dir, h.n2T > 0, 'dash'); }
    }
    if (h.st > .22) { h.state = 'idle'; h.anim = 'idle'; }
  } else if (h.state === 'grab') {
    const e = h.grabbed;
    if (!e || e.dead || e.state !== 'grabbed') { h.state = 'idle'; h.anim = 'idle'; h.grabbed = null; }
    else {
      e.x = h.x + h.dir * 30; e.y = h.y; e.z = 0; e.dir = -h.dir;
      if (h.kneeT > 0) { h.kneeT -= dt; h.anim = 'knee'; h.p = 1 - h.kneeT / .22; } else h.anim = 'grab';
      if ((INP.atkE && h.grabN >= 2) || INP.jumpE) throwFoe(h, e);
      else if (INP.atkE && h.kneeT <= 0) { h.kneeT = .22; h.grabN++; hurtFoe(e, 7, h.dir, false, 'knee'); }
      else if (h.st > 1.7) { setFoe(e, 'hurt'); e.kb = h.dir * 160; h.state = 'idle'; h.anim = 'idle'; h.grabbed = null; h.grabCd = .6; }
    }
  } else if (h.state === 'throw') {
    h.p = h.st / .38; if (h.p >= 1) { h.state = 'idle'; h.anim = 'idle'; }
  } else if (h.state === 'special') {
    h.p = h.st / .62; h.spTick -= dt;
    if (h.spTick <= 0) { h.spTick = .14; h.hitSet = new Set(); }
    for (const e of G.ents) {
      if (e === h || h.hitSet.has(e) || !hittable(e)) continue;
      if (Math.abs(e.x - h.x) < 110 + e.rad && Math.abs(e.y - h.y) < 36) { h.hitSet.add(e); hurtFoe(e, h.p > .7 ? 14 : 8, e.x > h.x ? 1 : -1, h.p > .7, 'special'); }
    }
    if (Math.random() < .6) G.fx.push({ k: 'spark', x: h.x + rnd(-60, 60), y: h.y - rnd(20, 90), vx: rnd(-200, 200), vy: rnd(-200, 50), l: .3, t: 0, col: pick(['#29f3ff', '#ff3fd8']) });
    if (h.p >= 1) { h.state = 'idle'; h.anim = 'idle'; h.inv = .3; }
  } else if (h.state === 'pick') {
    h.p = h.st / .24; if (h.p >= 1) { h.state = 'idle'; h.anim = 'idle'; }
  } else if (h.state === 'hurt') {
    h.x += h.kb * dt; h.kb *= Math.pow(.02, dt);
    if (h.st > .32) { h.state = 'idle'; h.anim = 'idle'; }
  } else if (h.state === 'down') {
    h.vz -= GRAV * dt; h.z = Math.max(0, h.z + h.vz * dt); h.x += h.kb * dt; if (h.z <= 0) { h.kb *= Math.pow(.01, dt); h.vz = 0; }
    if (h.st > 1.05) { if (h.hp <= 0) heroDie(h); else { h.state = 'getup'; h.st = 0; h.anim = 'getup'; } }
  } else if (h.state === 'getup') {
    h.p = h.st / .4; if (h.p >= 1) { h.state = 'idle'; h.anim = 'idle'; h.inv = 1; }
  }
  const lo = G.camX + 26, hi = Math.min(G.camX + VW - 26, G.S.len - 26);
  h.x = clamp(h.x, lo, hi); h.y = clamp(h.y, GY0, GY1);
}
function throwFoe(h, e) {
  h.state = 'throw'; h.st = 0; h.anim = 'throw'; h.grabbed = null; h.grabCd = .4;
  e.thrown = true; e.thrownHit = new Set();
  hurtFoe(e, 16, -h.dir, true, 'throw');
  e.x = h.x; e.kb = -h.dir * 470; e.vz = 560; e.z = Math.max(e.z, 40);
  G.shake = 8; vib(50); SFX.whoosh(); ev('throws');
  G.fx.push({ k: 'comic', x: e.x, y: e.y - 150, t: 0, l: .6, s: 'YEET!', col: '#5dff9b' });
}
function heroStrike(h) {
  if (h.weapon === 'gun') {
    G.shots.push({ k: 'bul', x: h.x + h.dir * 62, y: h.y, z: 62, vx: h.dir * 950, vy: 0, l: .8, t: 0, dmg: WPN.gun.dmg, own: 'hero' });
    SFX.pew(); G.fx.push({ k: 'flashm', x: h.x + h.dir * 70, y: h.y - 62, t: 0, l: .08 });
    useWeapon(h);
    return;
  }
  const W = h.weapon ? WPN[h.weapon] : null;
  const reach = W ? W.reach : (h.combo === 2 ? 64 : 58);
  const dmg = W ? W.dmg[h.combo] : [7, 7, 13][h.combo];
  const hit = meleeHit(h, reach, dmg, h.combo === 2 || !!(W && W.kd), h.weapon || 'fist', W && W.wide);
  if (W && W.wave && h.combo === 2) {
    G.shots.push({ k: 'wave', x: h.x + h.dir * 60, y: h.y, r: 10, t: 0, l: 1, dmg: 22, own: 'hero', hitSet: new Set(), col: '#ffd23a' });
    G.shake = 12; SFX.boom();
  }
  if (hit && W) useWeapon(h);
}
function useWeapon(h) {
  h.wdur--;
  if (h.wdur <= 0) {
    const col = WPN[h.weapon].col;
    for (let i = 0; i < 9; i++) G.fx.push({ k: 'debris', x: h.x + h.dir * 40, y: h.y, z: 70, vx: rnd(-160, 160), vz: rnd(150, 420), r: rnd(0, 6), vr: rnd(-12, 12), l: 1.1, t: 0, col: i % 3 ? col : '#ddd', w: rnd(4, 10) });
    popText(h.x, h.y - 150, 'شکست!', '#ff6b6b', 26);
    SFX.brk(); vib(50); h.weapon = null; h.wdur = 0; ev('breaks');
  }
}
function pickWeapon(h, it) {
  if (h.weapon && h.wdur > 0 && G.mode !== 'bonus') addItem(h.weapon, h.x - h.dir * 30, h.y, 30, h.wdur);
  h.weapon = it.type; h.wdur = it.dur;
  G.items.splice(G.items.indexOf(it), 1);
  h.state = 'pick'; h.st = 0; h.anim = 'pick';
  SFX.pickup(); popText(h.x, h.y - 150, WPN[it.type].name, WPN[it.type].col, 22);
  ring(it.x, it.y, WPN[it.type].col, 60);
  if (it.type === 'hammer') unlock('gold');
}
function eatFood(h, it) {
  if (h.hp >= h.maxHp) return;
  const amt = Math.round((it.type === 'pizza' ? 35 : 18) * G.D.heal);
  h.hp = Math.min(h.maxHp, h.hp + amt); h.happyT = 1;
  G.items.splice(G.items.indexOf(it), 1);
  SFX.heal(); popText(h.x, h.y - 150, '+' + fa(amt), '#5dff9b', 26); ring(h.x, h.y, '#5dff9b', 70);
}
function hittable(e) { return (e.kind === 'foe' || e.kind === 'crate' || e.kind === 'car') && !e.dead && e.state !== 'enter' && e.state !== 'dying' && e.state !== 'grabbed' && !(e.inv > 0) && !(e.alpha != null && e.alpha < .3); }
function meleeHit(h, reach, dmg, kd, kind, wide) {
  let hit = false;
  for (const e of G.ents) {
    if (e === h || !hittable(e) || h.hitSet.has(e)) continue;
    const dx = (e.x - h.x) * h.dir;
    if (dx < -14 || dx > reach + e.rad) continue;
    if (Math.abs(e.y - h.y) > (wide || 26) + (e.boss ? 10 : 0) + (e.kind === 'car' ? 16 : 0)) continue;
    if (kind !== 'kick' && e.z > 80) continue;
    h.hitSet.add(e); hurtFoe(e, dmg, h.dir, kd, kind); hit = true;
  }
  return hit;
}
function hurtHero(dmg, dir, kd) {
  const h = G.hero;
  if (h.inv > 0 || ['down', 'getup', 'special', 'intro', 'victory', 'dead', 'dash'].includes(h.state) || G.state !== 'play') return false;
  dmg = Math.round(dmg * G.D.dmg * (h.n2T > 0 ? .7 : 1));
  h.hp -= dmg; h.flash = .18; h.en = Math.min(100, h.en + 3); h.rage = Math.min(100, h.rage + 12);
  G.shake = Math.max(G.shake, kd ? 10 : 6); G.combo = 0; G.flashT = .12; if (G.boss) G.bossHit = true;
  SFX.hurt(); vib(kd ? 90 : 40);
  popText(h.x, h.y - 140, '-' + fa(dmg), '#ff6b8a', 22);
  if (h.grabbed) { const e = h.grabbed; h.grabbed = null; if (e.state === 'grabbed') setFoe(e, 'approach'); }
  if (h.hp <= 0) { h.hp = 0; kd = true; }
  if (h.n2T > 0 && !kd) return true;          // super armor while in N2 mode
  if (kd) { h.state = 'down'; h.st = 0; h.vz = 380; h.z = Math.max(h.z, 1); h.kb = dir * 240; h.anim = 'down'; }
  else { h.state = 'hurt'; h.st = 0; h.kb = dir * 170; h.anim = 'hurt'; }
  return true;
}
function heroDie(h) {
  G.lives--;
  if (G.lives > 0) {
    h.hp = h.maxHp; h.state = 'getup'; h.st = 0; h.anim = 'getup'; h.inv = 3; h.en = Math.max(h.en, 50);
    ring(h.x, h.y, '#ffe14a', 160); popText(h.x, h.y - 160, 'برگشتم!', '#ffe14a', 28);
    for (const e of G.ents) if (e.kind === 'foe' && !e.boss && Math.abs(e.x - h.x) < 220) hurtFoe(e, 0, e.x > h.x ? 1 : -1, true, 'push');
  } else {
    h.state = 'dead'; G.state = 'over'; musStop(); saveGame();
    setTimeout(() => gameOverScreen(), 900);
  }
}

/* ---------------- foes ---------------- */
function hurtFoe(e, dmg, dir, kd, kind) {
  const h = G.hero;
  if (kind !== 'push' && h && h.n2T > 0) dmg = Math.round(dmg * 1.7);
  if (e.kind === 'crate') {
    e.hp--; e.flash = .15; e.wob = 1; SFX.crate(); G.hitStop = .04;
    for (let i = 0; i < 5; i++) G.fx.push({ k: 'debris', x: e.x, y: e.y, z: 30, vx: rnd(-150, 150), vz: rnd(100, 300), r: 0, vr: rnd(-10, 10), l: .8, t: 0, col: e.gold ? '#ffd23a' : '#ffb340', w: rnd(4, 9) });
    if (e.hp <= 0) {
      e.dead = true; G.ents.splice(G.ents.indexOf(e), 1);
      for (let i = 0; i < 12; i++) G.fx.push({ k: 'debris', x: e.x, y: e.y, z: 30, vx: rnd(-220, 220), vz: rnd(150, 420), r: 0, vr: rnd(-14, 14), l: 1, t: 0, col: i % 2 ? (e.gold ? '#ffd23a' : '#ffb340') : '#29f3ff', w: rnd(5, 12) });
      if (e.drop) addItem(e.drop, e.x, e.y, 30);
      for (let i = 0; i < (e.gold ? 10 : 2); i++) addItem('coin', e.x, e.y, 30, 0, rnd(-120, 120));
      G.score += 50; if (e.gold) { ring(e.x, e.y, '#ffd23a', 120); SFX.pickup(); }
    }
    return;
  }
  if (e.kind === 'car') {
    e.hp = Math.max(0, e.hp - dmg); e.flash = .14; G.bonusDmg += dmg; G.hitStop = .04; G.shake = Math.max(G.shake, 5);
    G.score += dmg * 5; G.combo++; G.comboT = 1.4;
    for (let i = 0; i < 6; i++) G.fx.push({ k: 'debris', x: e.x - dir * 60 + rnd(-30, 30), y: e.y, z: 50, vx: dir * rnd(40, 260), vz: rnd(150, 380), r: 0, vr: rnd(-14, 14), l: 1, t: 0, col: pick(['#7a3bd0', '#bde8ff', '#29f3ff', '#3d1a78']), w: rnd(4, 11) });
    G.fx.push({ k: 'star', x: e.x - dir * 50, y: e.y - 50, t: 0, l: .22, s: 1.2 });
    if (Math.random() < .4) SFX.glass(); else SFX.bat();
    if (Math.random() < .3) addItem('coin', e.x, e.y, 40, 0, rnd(-140, 140));
    if (e.hp <= 0 && !e.dead) {
      e.dead = true; unlock('car'); SFX.boom(); G.flashT = .3; G.shake = 16; G.slow = .3; G.slowT = .8;
      for (let i = 0; i < 40; i++) G.fx.push({ k: 'debris', x: e.x + rnd(-80, 80), y: e.y, z: 40, vx: rnd(-320, 320), vz: rnd(200, 600), r: 0, vr: rnd(-20, 20), l: 1.4, t: 0, col: pick(['#7a3bd0', '#bde8ff', '#29f3ff', '#ff3fd8']), w: rnd(6, 14) });
      for (let i = 0; i < 20; i++) addItem('coin', e.x, e.y, 40, 0, rnd(-260, 260));
      G.fx.push({ k: 'comic', x: e.x, y: e.y - 150, t: 0, l: 1, s: 'KABOOM!', col: '#ffe14a' });
    }
    return;
  }
  e.hp -= dmg; e.flash = .12; e.hpShow = 2.2;
  if (kind !== 'push') {
    G.hitStop = Math.max(G.hitStop, kd ? .085 : .045); G.shake = Math.max(G.shake, kd ? 7 : 3.5);
    G.combo++; G.comboT = 1.4; G.score += 10 * Math.min(G.combo, 20);
    if (G.combo % 5 === 0) ev('combo', G.combo, true);
    h.en = Math.min(100, h.en + (kind === 'special' ? 1 : 5)); h.rage = Math.min(100, h.rage + (kind === 'special' ? 1 : 3));
    const hy = e.y - e.z - e.h * .6;
    const sc = { gun: '#b6ff4a', pipe: '#29f3ff', bat: '#ff3fd8', skate: '#5dff9b', chair: '#ffb340', sign: '#ff3fd8', hammer: '#ffd23a' }[kind] || '#ffe14a';
    for (let i = 0; i < 6 * Q.parts + 3; i++) G.fx.push({ k: 'spark', x: e.x - dir * 8, y: hy, vx: dir * rnd(80, 420) + rnd(-80, 80), vy: rnd(-260, 120), l: rnd(.18, .35), t: 0, col: sc });
    G.fx.push({ k: 'star', x: e.x, y: hy, t: 0, l: .22, s: kd ? 1.4 : 1 });
    popText(e.x + rnd(-10, 10), hy - 30, fa(dmg), h && h.n2T > 0 ? '#ff3fd8' : '#fff', kd ? 24 : 18);
    if (kd && Math.random() < .7) G.fx.push({ k: 'comic', x: e.x, y: hy - 40, t: 0, l: .55, s: pick(['POW!', 'BAM!', 'ZAP!', 'BONK!', 'WHAM!']), col: pick(['#ffe14a', '#ff3fd8', '#29f3ff']) });
    (WPN[kind] ? SFX[WPN[kind].snd] : SFX.punch)();
    if (kd) vib(30);
  }
  if (e.boss) {
    if (e.hp <= 0) { bossDie(e); return; }
    e.poise += dmg;
    if (e.poise > 70 && e.state !== 'atk') { e.poise = 0; setFoe(e, 'hurt'); e.kb = dir * 120; }
    return;
  }
  if (kind === 'knee' && e.hp > 0) return;
  if (e.hp <= 0) {
    if (e.state === 'grabbed' && h) { h.grabbed = null; h.state = 'idle'; h.anim = 'idle'; }
    e.dead = true; releaseTok(e); setFoe(e, 'down'); e.vz = 430; e.kb = dir * 330; e.z = Math.max(e.z, 1);
    G.score += e.F.score; SFX.ko(); G.hitStop = .11; ev('ko');
    const lastOne = G.waveOn && !G.boss && !G.spawnQ.length && !G.ents.some(o => o.kind === 'foe' && o !== e && !o.dead);
    if (lastOne) { G.slow = .3; G.slowT = .55; G.zoom = { t: 0, l: 1, x: e.x, y: e.y - 60, z: 1.18 }; }
    return;
  }
  if (e.F.armor && !kd && !['special', 'push', 'throw'].includes(kind) && e.state === 'atk') return;
  releaseTok(e);
  if (kd || (e.F.armor && kind === 'gun' && Math.random() < .2)) { setFoe(e, 'down'); e.vz = 360; e.kb = dir * (kind === 'push' ? 360 : 260); e.z = Math.max(e.z, 1); }
  else if (!e.F.armor || e.st > .1) { setFoe(e, 'hurt'); e.kb = dir * 150; }
}
function setFoe(e, s) { e.state = s; e.st = 0; e.atkDone = false; }
function getTok(e) { if (e.tok) return true; if (G.tokens < G.D.tok) { G.tokens++; e.tok = true; return true; } return false; }
function releaseTok(e) { if (e.tok) { e.tok = false; G.tokens = Math.max(0, G.tokens - 1); } }

function foeUpdate(e, dt) {
  e.animT += dt; e.st += dt; if (e.flash > 0) e.flash -= dt; if (e.cd > 0) e.cd -= dt; if (e.hpShow > 0) e.hpShow -= dt; if (e.inv > 0) e.inv -= dt;
  const h = G.hero, F = e.F, D = G.D;
  e.moving = false;
  if (e.alpha != null && e.alpha < 1 && !e.boss) e.alpha = Math.min(1, e.alpha + dt * 3);
  if (e.boss && e.state !== 'down' && e.state !== 'dying') { bossUpdate(e, dt); return; }
  const fly = F.fly || 0;
  switch (e.state) {
    case 'grabbed': {
      e.anim = 'hurt';
      if (!h || h.grabbed !== e) setFoe(e, 'approach');
      return;
    }
    case 'enter': {
      const tx = clamp(e.x, G.camX + 60, G.camX + VW - 60);
      e.dir = tx > e.x ? 1 : -1; e.x += e.dir * F.spd * 1.3 * dt; e.anim = 'walk'; e.moving = true;
      if (Math.abs(e.x - tx) < 8) setFoe(e, 'approach');
      if (fly) e.z = fly;
      break;
    }
    case 'approach': {
      e.dir = h.x > e.x ? 1 : -1;
      const side = e.x < h.x ? -1 : 1;
      let tx, ty;
      const has = e.cd <= 0 && getTok(e);
      if (F.ai === 'shoot') { tx = h.x + side * 260; ty = h.y; }
      else if (has) { tx = h.x + side * (F.range - 8); ty = h.y; }
      else { tx = h.x + side * (F.range + 80 + e.slot * 90); ty = h.y + (e.slot > .5 ? 1 : -1) * (30 + e.slot * 30); }
      const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
      if (d > 6) { const sp = F.spd * (F.ai === 'shoot' ? 1 : has ? 1 : .7); e.x += dx / d * sp * dt; e.y += dy / d * sp * .7 * dt; e.anim = 'walk'; e.moving = true; }
      else e.anim = 'idle';
      if (fly) e.z = fly + Math.sin(e.animT * 3) * 6;
      const adx = Math.abs(h.x - e.x), ady = Math.abs(h.y - e.y);
      if (F.ai === 'tele' && e.cd <= 0 && Math.random() < dt * .8 && getTok(e)) { teleFoe(e); break; }
      if (F.ai === 'shoot' && e.cd <= 0 && ady < 26 && adx < 520) { setFoe(e, 'windup'); break; }
      if (F.ai === 'charge' && has && ady < 16 && adx > 120 && adx < 420) { setFoe(e, 'windup'); e.charge = true; SFX.warn(); break; }
      if (has && ady < 12 && adx < F.range + 10 && F.ai !== 'shoot') { e.charge = false; setFoe(e, 'windup'); }
      break;
    }
    case 'windup': {
      e.anim = 'windup'; e.dir = h.x > e.x ? 1 : -1;
      if (e.st > F.wind * (e.charge ? 1.4 : 1) * D.wind) {
        setFoe(e, 'atk');
        if (F.ai === 'shoot') { G.shots.push({ k: 'orb', x: e.x + e.dir * 20, y: e.y, z: e.z, vx: e.dir * 300, vy: 0, l: 2.4, t: 0, dmg: F.dmg, own: 'foe', col: '#ff3fd8', r: 10 }); SFX.orb(); }
      }
      break;
    }
    case 'atk': {
      e.anim = F.thug ? 'punch1' : 'walk'; e.p = e.st / F.atk;
      if (F.ai === 'dash' || e.charge) {
        const sp = e.charge ? 540 : 380; e.x += e.dir * sp * dt; e.anim = e.charge ? 'run' : 'walk'; e.moving = true;
        if (!e.atkDone && Math.abs(h.x - e.x) < e.rad + 22 && Math.abs(h.y - e.y) < 18 && h.z < 40) { e.atkDone = true; hurtHero(F.dmg * (e.charge ? 1.3 : 1), e.dir, !!e.charge); }
        if (e.st > (e.charge ? .6 : .38) || e.x < G.camX + 20 || e.x > G.camX + VW - 20) setFoe(e, 'recover');
      } else if (F.ai !== 'shoot') {
        if (!e.atkDone && e.st > .07) {
          e.atkDone = true;
          const dx = (h.x - e.x) * e.dir;
          if (dx > -10 && dx < F.range + 16 && Math.abs(h.y - e.y) < 20 && h.z < 45) hurtHero(F.dmg, e.dir, F.ai === 'charge');
        }
        if (e.st > F.atk) setFoe(e, 'recover');
      } else if (e.st > F.atk) setFoe(e, 'recover');
      break;
    }
    case 'recover': {
      e.anim = 'idle';
      if (e.st > (e.charge ? .9 : .42)) { releaseTok(e); e.cd = rnd(F.cool[0], F.cool[1]) * D.cool; e.charge = false; setFoe(e, 'approach'); }
      break;
    }
    case 'hurt': {
      e.anim = 'hurt'; e.x += e.kb * dt; e.kb *= Math.pow(.03, dt);
      if (e.st > .3) { setFoe(e, 'approach'); e.cd = Math.max(e.cd, .35); }
      break;
    }
    case 'down': {
      e.anim = 'down'; e.vz -= GRAV * dt; e.z += e.vz * dt; e.x += e.kb * dt;
      if (e.thrown && e.z > 4) {
        for (const o of G.ents) {
          if (o === e || o.kind !== 'foe' || !hittable(o) || e.thrownHit.has(o)) continue;
          if (Math.abs(o.x - e.x) < o.rad + e.rad + 6 && Math.abs(o.y - e.y) < 26) { e.thrownHit.add(o); hurtFoe(o, 14, Math.sign(e.kb) || 1, !o.boss, 'throw'); }
        }
      }
      if (e.z <= 0) {
        e.z = 0;
        if (e.thrown) { e.thrown = false; G.shake = Math.max(G.shake, 8); puff(e.x, e.y, 8); }
        if (!e.bounced && e.vz < -200) { e.vz = -e.vz * .3; e.bounced = true; puff(e.x, e.y, 6); SFX.land(); }
        else { e.vz = 0; e.kb *= Math.pow(.004, dt); }
      }
      if (e.st > (e.dead ? .8 : 1) && e.z <= 0) { e.bounced = false; if (e.dead) setFoe(e, 'dying'); else setFoe(e, 'getup'); }
      break;
    }
    case 'getup': {
      e.anim = 'getup'; e.p = e.st / .4; if (e.st > .4) { setFoe(e, 'approach'); e.inv = .25; if (fly) e.z = fly; }
      if (fly) e.z = lerp(0, fly, e.p);
      break;
    }
    case 'dying': {
      if (e.st > .45) {
        for (let i = 0; i < 18 * Q.parts + 6; i++) G.fx.push({ k: 'pix', x: e.x + rnd(-20, 20), y: e.y - rnd(0, 40), vx: rnd(-90, 90), vy: rnd(-260, -60), l: rnd(.4, .9), t: 0, col: pick(['#29f3ff', '#ff3fd8', '#ffe14a', '#b48bff']), s: rnd(3, 7) });
        SFX.zap(); e.remove = true;
        const nc = Math.floor(rnd(F.coins[0], F.coins[1] + .99)); for (let i = 0; i < nc; i++) addItem('coin', e.x, e.y, 30, 0, rnd(-120, 120));
        if (Math.random() < .14 * G.D.heal) addItem(Math.random() < .5 ? 'soda' : 'pizza', e.x, e.y, 30);
      }
      break;
    }
  }
  e.y = clamp(e.y, GY0, GY1);
  if (G.lock != null && e.state !== 'enter' && e.state !== 'down') e.x = clamp(e.x, G.camX + 20, G.camX + VW - 20);
}
function teleFoe(e) {
  const h = G.hero;
  ring(e.x, e.y, '#b48bff', 60); SFX.tele();
  e.x = clamp(h.x - h.dir * 60, G.camX + 30, G.camX + VW - 30); e.y = h.y;
  ring(e.x, e.y, '#22e8ff', 60);
  e.dir = h.x > e.x ? 1 : -1; e.charge = false; setFoe(e, 'windup'); e.alpha = 0;
}

/* ---------------- bosses ---------------- */
function bossUpdate(e, dt) {
  const h = G.hero, F = e.F, D = G.D;
  if (e.alpha != null && e.state !== 'vanish') e.alpha = Math.min(1, e.alpha + dt * 4);
  const ph2 = e.hp < e.maxHp * .5;
  const spd = F.spd * (ph2 ? 1.25 : 1);
  const adx = Math.abs(h.x - e.x), ady = Math.abs(h.y - e.y);
  const face = () => { e.dir = h.x > e.x ? 1 : -1; };
  const thresholds = F.boss === 1 ? [.5] : F.boss === 2 ? [.66, .33] : [.7, .4];
  if (e.sum < thresholds.length && e.hp < e.maxHp * thresholds[e.sum] && e.state !== 'enter') {
    e.sum++;
    const kinds = F.boss === 1 ? ['punk', 'punk'] : F.boss === 2 ? ['bot', 'bot'] : (e.sum === 1 ? ['drone', 'drone'] : ['bot', 'glitch']);
    kinds.forEach((k, i) => G.spawnQ.push({ t: k, side: i ? -1 : 1, d: i * .4 }));
    SFX.roar(); G.shake = 8; popText(e.x, e.y - F.h - 20, 'کمک!', '#ff3a5a', 30);
  }
  switch (e.state) {
    case 'enter': {
      e.dir = -1; e.x -= 120 * dt; e.anim = 'walk'; e.moving = true;
      if (e.x < G.camX + VW - 170) { setFoe(e, 'idle'); e.cd = 1; }
      break;
    }
    case 'idle': {
      face(); e.anim = 'walk';
      if (F.boss === 1) {
        mv(e, h.x - e.dir * 74, h.y, spd, dt);
        if (e.cd <= 0) {
          if (adx < 110 && ady < 18) { e.move = 'punch'; e.n = 0; setFoe(e, 'windup'); }
          else if (adx > 230 && ady < 26 && Math.random() < .6) { e.move = 'charge'; setFoe(e, 'windup'); SFX.warn(); }
          else if (Math.random() < .5 * dt * 3) { e.move = 'slam'; setFoe(e, 'windup'); }
        }
      } else if (F.boss === 2) {
        mv(e, h.x - e.dir * 150, h.y, spd, dt);
        if (e.cd <= 0) {
          const r = Math.random();
          if (adx < 190 && ady < 20 && r < .55) { e.move = 'punch'; setFoe(e, 'windup'); }
          else if (r < .8 && adx > 140) { e.move = 'spread'; e.n = ph2 ? 2 : 1; setFoe(e, 'windup'); }
          else { e.move = 'stomp'; setFoe(e, 'windup'); }
        }
      } else {
        mv(e, h.x - e.dir * 230, clamp(h.y + Math.sin(G.t * .8) * 50, GY0, GY1), spd * .8, dt); e.anim = 'idle';
        if (e.cd <= 0) {
          const r = Math.random();
          if (r < .35) { e.move = 'orbs'; e.n = ph2 ? 2 : 1; setFoe(e, 'windup'); }
          else if (r < .65) { e.move = 'slash'; setFoe(e, 'vanish'); SFX.tele(); }
          else { e.move = 'laser'; setFoe(e, 'windup'); e.ly = h.y; SFX.warn(); }
        }
      }
      break;
    }
    case 'vanish': {
      e.alpha = Math.max(0, 1 - e.st * 4);
      if (e.st > .35) { e.x = clamp(h.x - h.dir * 80, G.camX + 50, G.camX + VW - 50); e.y = h.y; face(); e.alpha = 0; setFoe(e, 'windup'); }
      break;
    }
    case 'windup': {
      const wd = { punch: .42, charge: .75, slam: .45, spread: .5, stomp: .45, orbs: .5, slash: .38, laser: .95 }[e.move] * D.wind * (ph2 ? .85 : 1);
      if (e.move !== 'laser') face();
      e.anim = 'windup';
      if (F.boss === 2) e.armF = lerp(e.armF || .2, 1.6, .2);
      if (e.move === 'laser') e.ly = lerp(e.ly, h.y, dt * 2.5);
      if (e.st > wd) {
        setFoe(e, 'atk');
        if (e.move === 'slam' || e.move === 'stomp') { e.vz = 820; e.z = 1; e.jx = (h.x - e.x) / .9; SFX.jump(); }
        if (e.move === 'spread') fireSpread(e);
        if (e.move === 'orbs') fireOrbs(e);
        if (e.move === 'laser') { G.shots.push({ k: 'laser', y: e.ly, t: 0, l: .42, dmg: F.dmg * 1.4, own: 'foe', hit: false }); SFX.laser(); G.shake = 9; }
      }
      break;
    }
    case 'atk': {
      e.anim = 'punch1'; e.p = clamp(e.st / .3, 0, 1);
      if (e.move === 'punch') {
        if (F.boss === 2) { e.ext = Math.sin(clamp(e.st / .4, 0, 1) * Math.PI) * 80; e.armF = -1.45; }
        else e.x += e.dir * 150 * dt;
        if (!e.atkDone && e.st > .1) {
          e.atkDone = true;
          const dx = (h.x - e.x) * e.dir;
          if (dx > -10 && dx < F.range + (F.boss === 2 ? 70 : 20) && ady < 26 && h.z < 60) hurtHero(F.dmg, e.dir, F.boss === 2 || e.n === 1);
        }
        if (e.st > .4) {
          if (F.boss === 1 && e.n === 0) { e.n = 1; setFoe(e, 'windup'); e.st = .22; }
          else { e.ext = 0; e.armF = .2; recoverBoss(e, .6); }
        }
      } else if (e.move === 'charge') {
        e.anim = 'run'; e.x += e.dir * 580 * dt; e.moving = true;
        if (Math.random() < .5) puff(e.x - e.dir * 30, e.y, 1);
        if (!e.atkDone && Math.abs(h.x - e.x) < e.rad + 26 && ady < 24 && h.z < 50) { e.atkDone = true; hurtHero(F.dmg * 1.4, e.dir, true); }
        if (e.st > .8 || e.x < G.camX + 50 || e.x > G.camX + VW - 50) { G.shake = 8; SFX.land(); recoverBoss(e, 1.1); }
      } else if (e.move === 'slam' || e.move === 'stomp') {
        e.anim = 'jump'; e.vz -= GRAV * 1.1 * dt; e.z += e.vz * dt; e.x += e.jx * dt;
        e.x = clamp(e.x, G.camX + 60, G.camX + VW - 60);
        if (e.z <= 0 && e.st > .1) {
          e.z = 0; G.shake = 14; SFX.boom(); vib(80); puff(e.x, e.y, 14);
          G.shots.push({ k: 'wave', x: e.x, y: e.y, r: 20, t: 0, l: 1.3, dmg: F.dmg, own: 'foe', hit: false, col: F.boss === 1 ? '#ffe14a' : '#ff3fd8' });
          if (Math.abs(h.x - e.x) < 80 && ady < 30 && h.z < 20) hurtHero(F.dmg * 1.2, h.x > e.x ? 1 : -1, true);
          recoverBoss(e, .8);
        }
      } else if (e.move === 'spread' || e.move === 'orbs') {
        if (e.st > .35) { if (e.n > 1) { e.n--; setFoe(e, 'windup'); e.st = .25; } else { e.armF = .2; recoverBoss(e, .7); } }
      } else if (e.move === 'slash') {
        e.handF = Math.sin(clamp(e.st / .3, 0, 1) * Math.PI);
        if (!e.atkDone && e.st > .1) {
          e.atkDone = true; ring(e.x + e.dir * 50, e.y, '#ff3fd8', 90);
          const dx = (h.x - e.x) * e.dir;
          if (dx > -10 && dx < F.range + 20 && ady < 30 && h.z < 60) hurtHero(F.dmg, e.dir, true);
        }
        if (e.st > .4) { e.handF = 0; recoverBoss(e, .7); }
      } else if (e.move === 'laser') { if (e.st > .5) recoverBoss(e, .8); }
      break;
    }
    case 'recover': { e.anim = 'idle'; if (e.st > e.rec) { setFoe(e, 'idle'); e.cd = rnd(.4, 1) * D.cool * (ph2 ? .7 : 1); } break; }
    case 'hurt': { e.anim = 'hurt'; e.x += e.kb * dt; e.kb *= Math.pow(.05, dt); e.ext = 0; if (e.st > .45) { setFoe(e, 'idle'); e.cd = .3; } break; }
  }
  e.y = clamp(e.y, GY0, GY1);
  if (e.state !== 'enter') e.x = clamp(e.x, G.camX + 40, G.camX + VW - 40);
}
function mv(e, tx, ty, sp, dt) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
  if (d > 8) { e.x += dx / d * sp * dt; e.y += dy / d * sp * .75 * dt; e.moving = true; } else e.anim = 'idle';
}
function recoverBoss(e, t) { setFoe(e, 'recover'); e.rec = t; }
function fireSpread(e) {
  for (const oy of [-46, 0, 46]) G.shots.push({ k: 'pix', x: e.x + e.dir * 50, y: clamp(e.y + oy, GY0, GY1), z: 90, vx: e.dir * 330, vy: 0, l: 3, t: 0, dmg: e.F.dmg * .8, own: 'foe', col: '#ffe14a', r: 12 });
  SFX.pew(); G.shake = 4;
}
function fireOrbs(e) {
  for (let i = 0; i < 5; i++) G.shots.push({ k: 'orb', x: e.x + e.dir * 40, y: e.y, z: 70, vx: e.dir * 250, vy: (i - 2) * 38, l: 3.2, t: 0, dmg: e.F.dmg * .8, own: 'foe', col: pick(['#ff3fd8', '#29f3ff', '#b48bff']), r: 12 });
  SFX.orb();
}
function bossDie(e) {
  e.hp = 0; e.dead = true; setFoe(e, 'dying'); e.anim = 'hurt';
  G.slow = .25; G.slowT = 1.6; G.shake = 16; SFX.boom(); vib(200);
  G.zoom = { t: 0, l: 2, x: e.x, y: e.y - e.F.h * .45, z: 1.45 };
  for (const o of G.ents) if (o.kind === 'foe' && o !== e && !o.dead) { o.hp = 0; o.dead = true; setFoe(o, 'down'); o.vz = 300; o.kb = 200; o.z = 1; }
  G.spawnQ = []; G.shots = G.shots.filter(s => s.own === 'hero');
  G.score += e.F.score;
  unlock('boss' + e.F.boss);
  if (!G.bossHit) unlock('nohit');
  if (!G.bossWeapon && !G.hero.weapon) unlock('fists');
}
function bossDyingUpdate(e, dt) {
  e.st += dt; e.animT += dt; e.flash = Math.sin(e.st * 40) > 0 ? .1 : 0;
  if (Math.random() < dt * 14) {
    const x = e.x + rnd(-50, 50), y = e.y - rnd(20, e.F.h);
    ring(x, y, pick(['#ffe14a', '#ff3fd8', '#29f3ff']), rnd(40, 90), y);
    for (let i = 0; i < 6; i++) G.fx.push({ k: 'spark', x, y, vx: rnd(-300, 300), vy: rnd(-300, 200), l: .4, t: 0, col: pick(['#ffe14a', '#ff3fd8', '#fff']) });
    if (Math.random() < .5) SFX.boom();
  }
  if (e.st > 2.2) {
    for (let i = 0; i < 60 * Q.parts + 10; i++) G.fx.push({ k: 'pix', x: e.x + rnd(-40, 40), y: e.y - rnd(0, e.F.h), vx: rnd(-240, 240), vy: rnd(-400, -60), l: rnd(.6, 1.2), t: 0, col: pick(['#29f3ff', '#ff3fd8', '#ffe14a', '#b48bff']), s: rnd(4, 9) });
    for (let i = 0; i < e.F.coins[0]; i++) addItem('coin', e.x, e.y, 40, 0, rnd(-280, 280));
    e.remove = true; G.flashT = .35;
    if (G.mode === 'survival') { G.boss = null; musPlay(['s1', 's2', 's3'][G.stage]); }
    else stageWon();
  }
}
function stageWon() {
  const h = G.hero; h.state = 'victory'; h.anim = 'victory'; h.inv = 99; h.z = 0; h.vz = 0; h.n2T = 0;
  G.state = 'won'; G.endT = 0; musPlay('win');
  G.banner = { t: 0, dur: 2.6, a: 'ناک‌اوت!', b: '', col: '#ffe14a' };
}

/* ---------------- fx helpers ---------------- */
function popText(x, y, s, col, size) { G.fx.push({ k: 'txt', x, y, s, col, size: size || 20, t: 0, l: .9 }); }
function ring(x, y, col, r, yy) { G.fx.push({ k: 'ring', x, y: yy != null ? yy : y - 40, col, r, t: 0, l: .4 }); }
function puff(x, y, n) { for (let i = 0; i < n * Q.parts + 1; i++) G.fx.push({ k: 'puff', x: x + rnd(-14, 14), y, vx: rnd(-60, 60), vy: rnd(-40, -10), r: rnd(6, 13), l: rnd(.3, .55), t: 0 }); }

/* ---------------- main update ---------------- */
function update(dt) {
  G.t += dt;
  for (let i = TOASTS.length - 1; i >= 0; i--) { TOASTS[i].t += dt; if (TOASTS[i].t > 3.2) TOASTS.splice(i, 1); }
  if (G.mode === 'fight' && G.F && (G.state === 'fight' || G.state === 'fightEnd')) { fightUpdate(dt); return; }
  if (G.state === 'menu') { G.camX += 40 * dt; updateFx(dt); return; }
  if (G.state === 'story') { if (G.story) G.story.t += dt; return; }
  if (!['play', 'won', 'over', 'bonusEnd'].includes(G.state)) return;
  if (G.hitStop > 0) { G.hitStop -= dt; dt *= .05; }
  if (G.slowT > 0) { G.slowT -= dt; dt *= G.slow; if (G.slowT <= 0) G.slow = 1; }
  if (G.zoom) { G.zoom.t += dt / Math.max(G.slow, .25); if (G.zoom.t > G.zoom.l) G.zoom = null; }
  G.stageT += dt;
  const S = G.S, h = G.hero;
  if (G.banner) { G.banner.t += dt; if (G.banner.t > G.banner.dur) G.banner = null; }
  if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; }
  if (G.goT > 0) G.goT -= dt;
  if (G.flashT > 0) G.flashT -= dt;
  G.shake *= Math.pow(.004, dt);

  if (G.state === 'play' || G.state === 'over') heroUpdate(h, dt);
  else h.animT += dt;

  if (G.state === 'play' && h.state !== 'intro') {
    if (G.mode === 'story') {
      if (!G.waveOn) {
        if (G.wi < S.waves.length && h.x > S.waves[G.wi].at) startWave(S.waves[G.wi]);
        else if (G.wi >= S.waves.length && !G.boss && h.x > S.boss.at) startBoss();
      }
    } else if (G.mode === 'survival') {
      if (!G.waveOn && G.survT > 0) { G.survT -= dt; if (G.survT <= 0) nextSurvWave(); }
    } else if (G.mode === 'bonus') {
      G.bonusT -= dt;
      if (G.bonusT <= 0 || (G.car && G.car.dead)) { G.state = 'bonusEnd'; G.endT = 0; h.state = 'victory'; h.anim = 'victory'; h.inv = 99; }
    }
    if (G.spawnQ.length) {
      const alive = G.ents.filter(e => e.kind === 'foe' && !e.dead && !e.boss).length;
      const q = G.spawnQ[0]; q.d -= dt;
      if (q.d <= 0 && alive < (G.boss ? 3 : 4 + G.D.extra)) { G.spawnQ.shift(); spawnFoe(q.t, q.side); }
    }
    if (G.waveOn && !G.boss && !G.spawnQ.length && !G.ents.some(e => e.kind === 'foe')) {
      G.waveOn = false;
      if (G.mode === 'survival') { G.survT = 2.4; G.score += G.wave * 100; h.hp = Math.min(h.maxHp, h.hp + 12); popText(h.x, h.y - 150, '+' + fa(12), '#5dff9b', 22); }
      else { G.lock = null; G.wi++; G.goT = 3; SFX.go(); }
    }
  }
  for (let i = G.ents.length - 1; i >= 0; i--) {
    const e = G.ents[i];
    if (e.kind === 'foe') { if (e.boss && e.state === 'dying') bossDyingUpdate(e, dt); else foeUpdate(e, dt); }
    else if (e.kind === 'crate' || e.kind === 'car') { if (e.flash > 0) e.flash -= dt; e.wob = (e.wob || 0) * Math.pow(.01, dt); }
    if (e.remove) G.ents.splice(i, 1);
  }
  const foes = G.ents.filter(e => e.kind === 'foe' && e.state !== 'down' && e.state !== 'grabbed');
  for (let i = 0; i < foes.length; i++) for (let j = i + 1; j < foes.length; j++) {
    const a = foes[i], b = foes[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.abs(dx) + Math.abs(dy) * 1.5;
    const min = (a.rad + b.rad) * .9;
    if (d < min) { const push = (min - d) * .5 * dt * 8, s = dx >= 0 ? 1 : -1; a.x -= s * push; b.x += s * push; a.y -= (dy >= 0 ? 1 : -1) * push * .4; b.y += (dy >= 0 ? 1 : -1) * push * .4; }
  }
  for (let i = G.items.length - 1; i >= 0; i--) {
    const it = G.items[i]; it.t += dt;
    if (it.z > 0 || it.vz > 0) { it.vz -= GRAV * .8 * dt; it.z += it.vz * dt; it.x += it.vx * dt; if (it.z <= 0) { it.z = 0; it.vz = it.vz < -150 ? -it.vz * .35 : 0; it.vx *= .5; } }
    if (it.type === 'coin' && h && h.state !== 'dead') {
      const dx = h.x - it.x, dy = h.y - it.y, d = Math.hypot(dx, dy) || 1;
      if (d < 160 && it.t > .35) { it.x += dx / d * 620 * dt; it.y += dy / d * 620 * dt; }
      if (d < 26 && it.t > .35) { G.items.splice(i, 1); addCoins(1); G.runCoins++; ev('coins'); SFX.coin(); }
    }
  }
  updateShots(dt);
  updateFx(dt);
  for (let i = G.ghosts.length - 1; i >= 0; i--) { G.ghosts[i].t += dt; if (G.ghosts[i].t > G.ghosts[i].l) G.ghosts.splice(i, 1); }
  if (G.mode === 'story') {
    let target = G.lock != null ? G.lock : h.x - VW * .38;
    target = clamp(target, G.camMin, S.len - VW);
    G.camX += (target - G.camX) * Math.min(1, dt * 5);
    if (G.lock == null) G.camMin = Math.max(G.camMin, G.camX);
  }
  if (G.state === 'won') { G.endT += dt; if (G.endT > 3 && !G.endShown) { G.endShown = true; saveGame(); stageClearScreen(); } }
  if (G.state === 'bonusEnd') { G.endT += dt; if (G.endT > 2.2 && !G.endShown) { G.endShown = true; bonusResult(); } }
}
function updateShots(dt) {
  const h = G.hero;
  for (let i = G.shots.length - 1; i >= 0; i--) {
    const s = G.shots[i]; s.t += dt;
    if (s.k === 'wave') {
      s.r += 430 * dt;
      if (s.own === 'hero') {
        for (const e of G.ents) { if (e.kind !== 'foe' || !hittable(e) || s.hitSet.has(e)) continue; if (Math.abs(Math.abs(e.x - s.x) - s.r) < 30 && Math.abs(e.y - s.y) < 34) { s.hitSet.add(e); hurtFoe(e, s.dmg, e.x > s.x ? 1 : -1, true, 'hammer'); } }
      } else if (!s.hit && Math.abs(Math.abs(h.x - s.x) - s.r) < 24 && Math.abs(h.y - s.y) < 34 && h.z < 16) { s.hit = true; hurtHero(s.dmg, h.x > s.x ? 1 : -1, true); }
    } else if (s.k === 'laser') {
      if (!s.hit && s.t > .05 && Math.abs(h.y - s.y) < 26 && h.z < 90) { s.hit = true; hurtHero(s.dmg, G.boss && h.x > G.boss.x ? 1 : -1, true); }
    } else {
      s.x += s.vx * dt; s.y += (s.vy || 0) * dt;
      if (s.y < GY0 || s.y > GY1) { s.vy = -(s.vy || 0); s.y = clamp(s.y, GY0, GY1); }
      if (s.own === 'hero') {
        for (const e of G.ents) {
          if (!hittable(e)) continue;
          if (Math.abs(e.x - s.x) < e.rad + 12 && Math.abs(e.y - s.y) < 28 + (e.boss ? 10 : 0) + (e.kind === 'car' ? 16 : 0)) { hurtFoe(e, s.dmg, s.vx > 0 ? 1 : -1, false, 'gun'); s.t = s.l; break; }
        }
      } else if (Math.abs(h.x - s.x) < 18 + (s.r || 8) && Math.abs(h.y - s.y) < 20 && h.z < (s.z || 40) + 30 && h.z + 120 > (s.z || 0)) {
        if (hurtHero(s.dmg, s.vx > 0 ? 1 : -1, false)) s.t = s.l;
      }
      if (s.x < G.camX - 80 || s.x > G.camX + VW + 80) s.t = s.l;
      if (Math.random() < .5 * Q.parts) G.fx.push({ k: 'spark', x: s.x, y: s.y - (s.z || 0), vx: -s.vx * .1 + rnd(-30, 30), vy: rnd(-30, 30), l: .18, t: 0, col: s.col || '#b6ff4a' });
    }
    if (s.t >= s.l) G.shots.splice(i, 1);
  }
}
function updateFx(dt) {
  for (let i = G.fx.length - 1; i >= 0; i--) {
    const f = G.fx[i]; f.t += dt;
    if (f.k === 'spark' || f.k === 'pix') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.k === 'pix' ? 300 : 600) * dt; }
    else if (f.k === 'debris') { f.x += f.vx * dt; f.vz -= GRAV * dt; f.z += f.vz * dt; f.r += f.vr * dt; if (f.z < 0) { f.z = 0; f.vz *= -.35; f.vx *= .6; f.vr *= .5; } }
    else if (f.k === 'puff') { f.x += f.vx * dt; f.y += f.vy * dt; }
    else if (f.k === 'txt') f.y -= 50 * dt;
    if (f.t >= f.l) G.fx.splice(i, 1);
  }
  if (G.rain.length) for (const r of G.rain) { r.y += r.v * dt; r.x -= r.v * .18 * dt; if (r.y > VH) { r.y = -20; r.x = Math.random() * (VW + 200); if (Math.random() < .3) G.fx.push({ k: 'splash', x: G.camX + Math.random() * VW, y: GY0 + Math.random() * (GY1 - GY0), t: 0, l: .3 }); } }
}

/* ---------------- rendering ---------------- */
function drawLayer(c, L, par, y) {
  const w = L.lw, off = ((G.camX * par) % w + w) % w;
  for (let x = -off; x < VW; x += w) c.drawImage(L, x, y, w, L.lh);
}
function renderWorld(c) {
  const A = G.art, T = A.T;
  if (!A.skyG) { const g = c.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, T.sky[0]); g.addColorStop(.55, T.sky[1]); g.addColorStop(1, T.sky[2]); A.skyG = g; }
  c.fillStyle = A.skyG; c.fillRect(0, 0, VW, 380);
  if (!A.stars) { const R = mulberry(7); A.stars = []; for (let i = 0; i < 70; i++) A.stars.push([R() * 1400, R() * 220, R() * 1.6 + .4, R() * 6]); }
  c.fillStyle = '#fff';
  for (const s of A.stars) { c.globalAlpha = .35 + Math.sin(G.t * 2 + s[3]) * .3; c.fillRect((s[0] - G.camX * .03 + 1400) % 1400 * (VW / 1400) * 1.2, s[1], s[2], s[2]); }
  c.globalAlpha = 1;
  c.drawImage(A.moon, VW * .68 - G.camX * .02, 20, 220, 220);
  drawLayer(c, A.far, .12, 380 - A.far.lh + 6);
  if (G.stage === 1) drawFerris(c);
  drawLayer(c, A.mid, .4, 380 - A.mid.lh + 20);
  if (G.stage === 2) drawFlyers(c);
  drawLayer(c, A.wall, 1, 356 - A.wall.lh + 6);
  if (G.stage === 2) drawHolo(c);
  drawLayer(c, A.ground, 1, 356);
  c.save(); c.beginPath(); c.rect(0, 382, VW, VH - 382); c.clip();
  c.globalAlpha = G.stage === 0 ? .2 : .12; c.translate(0, 382 * 2 - 4); c.scale(1, -1);
  drawLayer(c, A.wall, 1, 356 - A.wall.lh + 6);
  c.restore();
  if (!A.fadeG) { const g = c.createLinearGradient(0, 380, 0, VH); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,2,14,.7)'); A.fadeG = g; }
  c.fillStyle = A.fadeG; c.fillRect(0, 380, VW, VH - 380);
}
function drawFerris(c) {
  const x = ((1100 - G.camX * .12) % 1800 + 1800) % 1800 - 200, y = 190, R = 130, a0 = G.t * .25;
  c.save(); c.globalCompositeOperation = 'lighter';
  c.beginPath(); c.moveTo(x - 60, 380); c.lineTo(x, y); c.lineTo(x + 60, 380); neon(c, '#7a3bd0', 2, false);
  c.beginPath(); c.arc(x, y, R, 0, TAU); neon(c, '#ff3fd8', 2.4);
  c.beginPath(); for (let i = 0; i < 12; i++) { const a = a0 + i * TAU / 12; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } neon(c, '#ffe14a', 1, false);
  for (let i = 0; i < 12; i++) { const a = a0 + i * TAU / 12; glowDot(c, x + Math.cos(a) * R, y + Math.sin(a) * R + 10, 12, ['#29f3ff', '#ff3fd8', '#ffe14a'][i % 3], .8); }
  c.restore();
}
function drawFlyers(c) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const sp = 60 + i * 23, y = 120 + (i * 37) % 150, dir = i % 2 ? 1 : -1;
    const x = ((G.t * sp * dir + i * 400 - G.camX * .3) % (VW + 300) + VW + 300) % (VW + 300) - 150;
    const g = c.createLinearGradient(x - dir * 80, 0, x, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, i % 3 ? 'rgba(255,63,216,.6)' : 'rgba(41,243,255,.6)');
    c.fillStyle = g; c.fillRect(Math.min(x, x - dir * 80), y - 1.5, 80, 3);
    glowDot(c, x, y, 7, '#ffffff', .9);
  }
  c.restore();
}
function drawHolo(c) {
  const x = ((900 - G.camX) % 1920 + 1920) % 1920 - 100, y = 170;
  if (x < -300 || x > VW + 200) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  c.globalAlpha = .55 + Math.sin(G.t * 13) * .08 + (Math.random() < .04 ? -.4 : 0);
  const g = c.createLinearGradient(0, y + 90, 0, 356); g.addColorStop(0, 'rgba(41,243,255,.25)'); g.addColorStop(1, 'rgba(41,243,255,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(x + 30, y + 80); c.lineTo(x + 170, y + 80); c.lineTo(x + 120, 350); c.lineTo(x + 80, 350); c.fill();
  c.font = '84px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = 'rgba(41,243,255,.75)'; c.fillText('N2', x + 100, y + 20 + Math.sin(G.t * 2) * 4);
  c.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 14; i++) c.fillRect(x + 20, y - 24 + i * 6 + (G.t * 30) % 6, 160, 2);
  c.restore();
}
function shadow(c, x, y, r, z) { c.fillStyle = 'rgba(0,0,0,.4)'; ell(c, x, y + 2, r * (1 - Math.min(z, 200) / 400), r * .3 * (1 - Math.min(z, 200) / 400)); c.fill(); }
function renderCrate(c, e, x, y) {
  c.save(); c.translate(x, y); c.rotate(Math.sin(G.t * 40) * (e.wob || 0) * .1);
  const g = e.gold;
  c.fillStyle = g ? '#6b4a08' : '#3a2412'; rr(c, -24, -46, 48, 46, 4); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.fillStyle = g ? '#e0aa22' : '#7a4a22'; rr(c, -20, -42, 40, 38, 3); c.fill();
  c.beginPath(); c.moveTo(-20, -42); c.lineTo(20, -4); c.moveTo(20, -42); c.lineTo(-20, -4); c.strokeStyle = g ? '#8a5f0a' : '#3a2412'; c.lineWidth = 4; c.stroke();
  c.beginPath(); rr(c, -24, -46, 48, 46, 4); c.globalAlpha = .7; neon(c, g ? '#ffe14a' : '#ffb340', 1.2, false); c.globalAlpha = 1;
  if (g) star(c, 0, -23, 9, '#fff3b0');
  else { c.font = '13px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffd48a'; c.fillText('?', 0, -23); }
  if (g) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, Math.sin(G.t * 3) * 16, -30 + Math.cos(G.t * 4) * 10, 10, '#ffffff', .8); c.restore(); }
  if (e.flash > 0) { c.fillStyle = 'rgba(255,255,255,.6)'; rr(c, -24, -46, 48, 46, 4); c.fill(); }
  c.restore();
}
function renderEnt(c, e) {
  const x = e.x - G.camX, y = e.y - e.z;
  if (x < -220 || x > VW + 220) return;
  if (e.kind === 'crate') { renderCrate(c, e, x, y); return; }
  if (e.kind === 'car') { drawCar(c, x, y, e, G.t); return; }
  const P = poseOf(e);
  c.save(); c.translate(x, y); c.scale(CS, CS); c.translate(-x, -y);
  const flick = (e.kind === 'hero' && e.inv > 0 && !['victory', 'special', 'dash'].includes(e.state) && !(e.n2T > 0) && Math.sin(G.t * 40) > .3);
  if (flick) c.globalAlpha = .45;
  if (e.kind === 'hero') {
    if (e.n2T > 0) {
      c.save(); c.globalCompositeOperation = 'lighter';
      glowDot(c, x, y - 60, 95 + Math.sin(G.t * 12) * 8, '#ff3fd8', .35); glowDot(c, x, y - 60, 60, '#29f3ff', .25);
      c.beginPath(); for (let i = 0; i < 3; i++) { const a = G.t * 9 + i * 2.1; c.moveTo(x + Math.cos(a) * 40, y - 60 + Math.sin(a) * 60); c.lineTo(x + Math.cos(a + .4) * 55, y - 60 + Math.sin(a + .4) * 70); } neon(c, '#ffe14a', 1.6);
      c.restore();
    }
    if (e.state === 'special') {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(x, y - 60, 90 - i * 18, 26 - i * 5, 0, G.t * 18 + i, G.t * 18 + i + 4); neon(c, i % 2 ? '#ff3fd8' : '#29f3ff', 3, false); }
      c.restore();
    }
    drawNima(c, x, y, e.dir, P, LOOK, e.weapon, 1, G.t, nimaMood(e));
  } else {
    e.F.draw(c, e, x, y, P, e.animT);
    if (e.state === 'windup' && !e.boss) { c.font = '26px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.fillStyle = Math.sin(G.t * 30) > 0 ? '#ff3a5a' : '#ffe14a'; c.fillText('!', x, y - e.h - 18); }
    if (e.boss && e.state === 'windup' && ['charge', 'slam', 'stomp'].includes(e.move)) text(c, '!!', x, y - e.h - 30, { font: '30px Bungee, Impact, sans-serif', fill: Math.sin(G.t * 30) > 0 ? '#ff3a5a' : '#ffe14a', stroke: OUT, sw: 5 });
    if (e.state === 'hurt' || (e.state === 'down' && !e.dead) || e.state === 'getup' || e.state === 'grabbed') {
      for (let i = 0; i < 3; i++) { const a = G.t * 6 + i * 2.1; star(c, x + Math.cos(a) * 20, y - e.h - 6 + Math.sin(a) * 6, 5, '#ffe14a'); }
    }
    if (e.hpShow > 0 && !e.boss && !e.dead) {
      const w = 46, hp = Math.max(0, e.hp / e.maxHp);
      c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, x - w / 2 - 2, y - e.h - 34, w + 4, 8, 4); c.fill();
      c.fillStyle = hp > .5 ? '#5dff9b' : hp > .25 ? '#ffe14a' : '#ff4d6d'; rr(c, x - w / 2, y - e.h - 32, Math.max(2, w * hp), 4, 2); c.fill();
    }
  }
  c.globalAlpha = 1;
  if (e.flash > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - e.h * .5, e.h * .55, '#ffffff', .5); c.restore(); }
  c.restore();
}
function star(c, x, y, r, col) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.5; c.stroke();
}
function renderItem(c, it) {
  const x = it.x - G.camX, y = it.y - it.z;
  if (x < -60 || x > VW + 60) return;
  if (it.type === 'coin') { shadow(c, x, it.y, 8, it.z); drawCoin(c, x, y - 10 - Math.abs(Math.sin(it.t * 5)) * 3, it.t, 1); return; }
  shadow(c, x, it.y, 18, it.z);
  const b = Math.sin(it.t * 4) * 3;
  const col = WPN[it.type] ? WPN[it.type].col : '#5dff9b';
  c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 18 + b, 34, col, .35); c.restore();
  if (WPN[it.type]) {
    drawWeaponIcon(c, it.type, x - 4, y - 14 + b, .8, G.t);
    const h = G.hero;
    if (h && Math.abs(h.x - it.x) < 48 && Math.abs(h.y - it.y) < 28 && G.state === 'play') {
      text(c, 'بردار!', x, y - 78 + b, { font: '20px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', stroke: OUT, sw: 5 });
      c.beginPath(); c.moveTo(x - 7, y - 62 + b); c.lineTo(x + 7, y - 62 + b); c.lineTo(x, y - 54 + b); c.closePath(); c.fillStyle = col; c.fill();
    }
  } else drawFood(c, it.type, x, y - 16 + b, 1.1);
}
function renderShot(c, s) {
  if (s.k === 'wave') {
    const a = 1 - s.t / s.l;
    for (const d of [-1, 1]) {
      const x = s.x + d * s.r - G.camX;
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
      c.beginPath(); c.ellipse(x, s.y, 16, 10, 0, 0, TAU); neon(c, s.col, 3);
      c.beginPath(); c.moveTo(x, s.y); c.lineTo(x, s.y - 34); neon(c, s.col, 3);
      c.restore();
    }
    return;
  }
  if (s.k === 'laser') {
    const a = 1 - s.t / s.l;
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
    const g = c.createLinearGradient(0, s.y - 60, 0, s.y + 10); g.addColorStop(0, 'rgba(255,58,90,0)'); g.addColorStop(.6, 'rgba(255,58,90,.9)'); g.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = g; c.fillRect(0, s.y - 60, VW, 70); c.restore(); return;
  }
  const x = s.x - G.camX, y = s.y - (s.z || 0);
  shadow(c, x, s.y, 10, s.z || 0);
  c.save(); c.globalCompositeOperation = 'lighter';
  if (s.k === 'bul') { c.beginPath(); c.moveTo(x - Math.sign(s.vx) * 26, y); c.lineTo(x, y); neon(c, '#b6ff4a', 4); }
  else if (s.k === 'pix') { glowDot(c, x, y, 20, s.col, .8); c.fillStyle = '#fff'; c.fillRect(x - 6, y - 6, 12, 12); }
  else { glowDot(c, x, y, 24, s.col, .9); c.fillStyle = '#fff'; circ(c, x, y, 5); c.fill(); }
  c.restore();
}
function renderFx(c) {
  for (const f of G.fx) {
    const a = 1 - f.t / f.l, x = f.x - G.camX;
    if (f.k === 'spark') { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.beginPath(); c.moveTo(x, f.y); c.lineTo(x - f.vx * .04, f.y - f.vy * .04); c.strokeStyle = f.col; c.lineWidth = 2.6; c.stroke(); c.restore(); }
    else if (f.k === 'pix') { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.fillStyle = f.col; c.fillRect(x - f.s / 2, f.y - f.s / 2, f.s, f.s); c.restore(); }
    else if (f.k === 'star') { c.save(); c.globalAlpha = a; star(c, x, f.y, 26 * f.s * (.6 + f.t / f.l), '#fff6b0'); c.restore(); }
    else if (f.k === 'ring') { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.beginPath(); c.ellipse(x, f.y + 40, f.r * easeOut(f.t / f.l), f.r * .3 * easeOut(f.t / f.l), 0, 0, TAU); neon(c, f.col, 3); c.restore(); }
    else if (f.k === 'puff') { c.fillStyle = `rgba(180,170,220,${a * .35})`; circ(c, x, f.y, f.r * (1 + f.t / f.l)); c.fill(); }
    else if (f.k === 'debris') { c.save(); c.translate(x, f.y - f.z); c.rotate(f.r); c.globalAlpha = Math.min(1, a * 2); c.fillStyle = f.col; c.fillRect(-f.w / 2, -2.5, f.w, 5); c.restore(); }
    else if (f.k === 'txt') { c.globalAlpha = Math.min(1, a * 2); text(c, f.s, x, f.y, { font: f.size + 'px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: f.col, stroke: OUT, sw: 5 }); c.globalAlpha = 1; }
    else if (f.k === 'comic') {
      const s = f.t < .1 ? f.t / .1 * 1.25 : 1.25 - (f.t - .1) * .4;
      c.save(); c.translate(x, f.y); c.rotate(-.15); c.scale(s, s); c.globalAlpha = Math.min(1, a * 3);
      text(c, f.s, 0, 0, { font: '30px Bungee, Impact, sans-serif', fill: f.col, stroke: OUT, sw: 7 }); c.restore();
    }
    else if (f.k === 'flashm') { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, f.y, 34, '#b6ff4a', a); c.restore(); }
    else if (f.k === 'splash') { c.strokeStyle = `rgba(160,230,255,${a * .5})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, f.y, 10 * (f.t / f.l) + 2, 3 * (f.t / f.l) + 1, 0, 0, TAU); c.stroke(); }
  }
}
function render() {
  const c = cx;
  c.setTransform(SC * DPR, 0, 0, SC * DPR, 0, 0);
  if (G.state === 'story') { renderStory(c); renderToasts(c); return; }
  if (G.mode === 'fight' && G.F) { renderFight(c); renderToasts(c); return; }
  if (!G.art) { c.fillStyle = '#07051a'; c.fillRect(0, 0, VW, VH); return; }
  c.save();
  if (G.shake > .3) c.translate(rnd(-G.shake, G.shake), rnd(-G.shake, G.shake) * .6);
  if (G.zoom) {
    const Z = G.zoom, u = Z.t / Z.l, k = u < .2 ? ease(u / .2) : u > .75 ? 1 - ease((u - .75) / .25) : 1;
    const zf = 1 + (Z.z - 1) * k, fx = Z.x - G.camX, fy = Z.y;
    c.translate(fx, fy); c.scale(zf, zf); c.translate(-fx, -fy);
  }
  renderWorld(c);
  const b = G.boss;
  if (b && b.state === 'windup' && b.move === 'laser') {
    const a = .25 + Math.abs(Math.sin(G.t * 16)) * .35;
    c.fillStyle = `rgba(255,58,90,${a * .5})`; c.fillRect(0, b.ly - 26, VW, 52);
    c.strokeStyle = `rgba(255,58,90,${a + .3})`; c.setLineDash([14, 10]); c.lineWidth = 2; c.strokeRect(-4, b.ly - 26, VW + 8, 52); c.setLineDash([]);
  }
  if (b && b.state === 'windup' && b.move === 'charge') {
    c.fillStyle = `rgba(255,225,74,${.15 + Math.abs(Math.sin(G.t * 14)) * .2})`;
    const x0 = b.x - G.camX; c.fillRect(b.dir > 0 ? x0 : 0, b.y - 22, b.dir > 0 ? VW - x0 : x0, 44);
  }
  for (const e of G.ents) { if (e.kind !== 'crate' && !(e.alpha != null && e.alpha < .2)) shadow(c, e.x - G.camX, e.y, (e.rad || 18) * 1.5 * (e.kind === 'car' ? 1 : CS), e.z); }
  for (const s of G.shots) if (s.k === 'wave' || s.k === 'laser') renderShot(c, s);
  for (const g of G.ghosts) {
    const gx = g.x - G.camX, gy = g.y - g.z;
    c.save(); c.globalAlpha = .35 * (1 - g.t / g.l); c.globalCompositeOperation = 'lighter';
    c.translate(gx, gy); c.scale(CS, CS); c.translate(-gx, -gy);
    drawNima(c, gx, gy, g.dir, poseOf(g), LOOK, g.weapon, 1, G.t, 'angry');
    c.restore();
  }
  const list = [];
  for (const e of G.ents) list.push(e);
  for (const it of G.items) list.push({ kind: 'item', y: it.y, it });
  list.sort((a, b2) => a.y - b2.y);
  for (const e of list) { if (e.kind === 'item') renderItem(c, e.it); else renderEnt(c, e); }
  for (const s of G.shots) if (s.k !== 'wave' && s.k !== 'laser') renderShot(c, s);
  renderFx(c);
  if (G.rain.length && G.state !== 'menu') {
    c.strokeStyle = 'rgba(170,230,255,.28)'; c.lineWidth = 1.2; c.beginPath();
    for (const r of G.rain) { c.moveTo(r.x, r.y); c.lineTo(r.x - 4, r.y + 16); }
    c.stroke();
  }
  c.restore();
  if (!G.vig) {
    const v = document.createElement('canvas'); v.width = 256; v.height = 144; const x = v.getContext('2d');
    const g = x.createRadialGradient(128, 72, 40, 128, 72, 150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(3,0,14,.65)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 144); G.vig = v;
  }
  c.drawImage(G.vig, 0, 0, VW, VH);
  if (G.hero && G.hero.n2T > 0) { c.fillStyle = `rgba(255,63,216,${.06 + Math.sin(G.t * 8) * .03})`; c.fillRect(0, 0, VW, VH); }
  if (G.flashT > 0) { c.fillStyle = `rgba(255,255,255,${G.flashT * 1.5})`; c.fillRect(0, 0, VW, VH); }
  if (['play', 'won', 'paused', 'over', 'bonusEnd'].includes(G.state)) renderHUD(c);
  if (G.state === 'menu') renderMenuHero(c);
  renderToasts(c);
}
function renderMenuHero(c) {
  shadow(c, VW * .1, 478, 44, 0);
  drawNima(c, VW * .1, 478, 1, poseOf({ anim: 'idle', animT: G.t }), LOOK, 'bat', 1.55, G.t, (G.t % 6) < 1 ? 'wink' : 'smile');
  shadow(c, VW * .9, 478, 40, 0);
  drawArian(c, VW * .9, 478, -1, poseOf({ anim: 'bjj', animT: G.t + 1 }), 1.5, G.t, 'smile');
}
function renderToasts(c) {
  TOASTS.slice(0, 2).forEach((T, i) => {
    const k = T.t < .3 ? easeOut(T.t / .3) : T.t > 2.8 ? 1 - (T.t - 2.8) / .4 : 1;
    const w = 330, x = VW / 2 - w / 2, y = (G.mode === 'fight' ? 150 : 64) + i * 58 - (1 - k) * 30;
    c.save(); c.globalAlpha = Math.max(0, k);
    c.fillStyle = 'rgba(10,4,30,.9)'; rr(c, x, y, w, 50, 12); c.fill(); c.beginPath(); rr(c, x, y, w, 50, 12); neon(c, T.col, 1.6, false);
    drawCoin(c, x + w - 28, y + 25, G.t, 1.3);
    text(c, T.a, x + w / 2 - 10, y + 17, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff' });
    if (T.b) text(c, T.b, x + w / 2 - 10, y + 37, { font: '14px Vazirmatn, Tahoma, sans-serif', fill: T.col });
    c.restore();
  });
}

/* ---------------- HUD ---------------- */
function bar(c, x, y, w, h, v, cols, glow) {
  c.fillStyle = 'rgba(5,2,20,.75)'; rr(c, x - 2, y - 2, w + 4, h + 4, (h + 4) / 2); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.5; c.stroke();
  if (v > 0) {
    const g = c.createLinearGradient(x, 0, x + w, 0); cols.forEach((col, i) => g.addColorStop(i / (cols.length - 1), col));
    c.fillStyle = g; rr(c, x, y, Math.max(h, w * v), h, h / 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.3)'; rr(c, x + 3, y + 1.5, Math.max(0, w * v - 6), h * .3, h * .15); c.fill();
  }
  if (glow) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5 + Math.sin(G.t * 8) * .3; rr(c, x - 2, y - 2, w + 4, h + 4, (h + 4) / 2); neon(c, glow, 1.5, false); c.restore(); }
}
function renderHUD(c) {
  const h = G.hero; if (!h) return;
  const m = 18;
  c.save(); c.beginPath(); c.arc(m + 34, m + 34, 32, 0, TAU); c.fillStyle = 'rgba(10,4,30,.85)'; c.fill(); c.clip();
  drawNima(c, m + 27, m + 124, 1, { legF: 0, legB: 0, armF: .2, armB: -.1, tilt: 0, bob: 0, lie: 0, spin: 1 }, LOOK, null, .92, G.t, nimaMood(h));
  c.restore();
  c.beginPath(); c.arc(m + 34, m + 34, 32, 0, TAU); neon(c, h.n2T > 0 ? '#ff3fd8' : (SKINS[LOOK.skin] || SKINS.normal).rim, 2.2);
  text(c, 'نیما', m + 74, m + 8, { font: '19px Lalezar, Vazirmatn, Tahoma, sans-serif', align: 'left', fill: '#fff', stroke: OUT, sw: 4 });
  for (let i = 0; i < G.lives; i++) heart(c, m + 124 + i * 20, m + 9, 7);
  bar(c, m + 74, m + 24, 200, 14, h.hp / h.maxHp, h.hp / h.maxHp < .3 ? ['#ff2a5a', '#ff7a4a'] : ['#5dff9b', '#c8ff5a', '#ffe14a']);
  bar(c, m + 74, m + 46, 150, 7, h.en / 100, ['#29f3ff', '#7b8cff'], h.en >= 50 ? '#29f3ff' : null);
  bar(c, m + 74, m + 61, 150, 7, h.n2T > 0 ? h.n2T / 8 : h.rage / 100, ['#ff3a5a', '#ff3fd8', '#ffe14a'], h.rage >= 100 || h.n2T > 0 ? '#ff3fd8' : null);
  text(c, 'N2', m + 240, m + 64, { font: '11px Bungee, Impact, sans-serif', fill: h.rage >= 100 ? '#ffe14a' : '#a99ed6' });
  const wx = m + 300, wy = m + 34;
  c.fillStyle = 'rgba(10,4,30,.8)'; rr(c, wx - 26, wy - 26, 52, 52, 10); c.fill();
  c.strokeStyle = h.weapon ? WPN[h.weapon].col : 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.stroke();
  if (h.weapon) {
    drawWeaponIcon(c, h.weapon, wx - 2, wy + 4, .5, G.t);
    const W = WPN[h.weapon], fr = clamp(h.wdur / Math.round(W.dur * durMul()), 0, 1);
    c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, wx - 24, wy + 30, 48, 6, 3); c.fill();
    c.fillStyle = fr < .3 ? '#ff4d6d' : W.col; rr(c, wx - 24, wy + 30, Math.max(3, 48 * fr), 6, 3); c.fill();
  } else {
    c.save(); c.translate(wx, wy); c.fillStyle = SKIN; circ(c, 0, 0, 11); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(-6 + i * 5, -8); c.lineTo(-6 + i * 5, -2); } c.stroke(); c.restore();
  }
  drawCoin(c, wx + 48, wy - 12, G.t, 1.1);
  text(c, fa(SAVE.coins), wx + 62, wy - 11, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', align: 'left', fill: '#ffe14a', stroke: OUT, sw: 4 });
  text(c, String(G.score).padStart(6, '0'), VW / 2, m + 18, { font: '24px Bungee, Impact, sans-serif', fill: '#fff', glow: '#ff3fd8', blur: 12 });
  const label = G.mode === 'survival' ? 'موج ' + fa(Math.max(1, G.wave)) : G.mode === 'bonus' ? 'بونوس' : 'مرحله ' + fa(G.stage + 1);
  text(c, label, VW / 2, m + 44, { font: '16px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: THEMES[G.stage].neon[1] });
  if (G.mode === 'bonus' && G.car) {
    const tl = Math.max(0, Math.ceil(G.bonusT));
    text(c, fa(tl), VW / 2, 98, { font: '46px Bungee, Impact, sans-serif', fill: tl <= 5 ? '#ff3a5a' : '#ffe14a', stroke: OUT, sw: 7 });
    const w = Math.min(420, VW * .42);
    text(c, 'ماشین نئونی', VW / 2, VH - 60, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', stroke: OUT, sw: 5 });
    bar(c, VW / 2 - w / 2, VH - 44, w, 14, G.car.hp / G.car.maxHp, ['#7a3bd0', '#29f3ff']);
  }
  if (G.combo >= 3) {
    const s = 1 + Math.max(0, G.comboT - 1.2) * 2;
    c.save(); c.translate(VW - 150, 112); c.rotate(-.08); c.scale(s, s);
    text(c, 'x' + G.combo, 0, 0, { font: '34px Bungee, Impact, sans-serif', fill: '#ffe14a', stroke: OUT, sw: 7 });
    text(c, 'کمبو', 0, 28, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#ff3fd8', stroke: OUT, sw: 4 });
    c.restore();
  }
  const b = G.boss;
  if (b && !b.remove) {
    const w = Math.min(460, VW * .45), x = VW / 2 - w / 2, y = VH - 44;
    text(c, b.F.name, VW / 2, y - 16, { font: '20px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', stroke: OUT, sw: 5 });
    bar(c, x, y, w, 14, Math.max(0, b.hp / b.maxHp), ['#ff2a5a', '#ff3fd8', '#b48bff'], '#ff3a5a');
  }
  if (G.goT > 0 && G.lock == null && G.mode === 'story') {
    c.globalAlpha = Math.sin(G.t * 10) > 0 ? 1 : .35;
    text(c, 'برو!', VW - 120, VH / 2 - 40, { font: '36px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#ffe14a', stroke: OUT, sw: 6 });
    c.beginPath(); c.moveTo(VW - 150, VH / 2); c.lineTo(VW - 90, VH / 2); c.lineTo(VW - 110, VH / 2 - 18); c.moveTo(VW - 90, VH / 2); c.lineTo(VW - 110, VH / 2 + 18); neon(c, '#ffe14a', 4);
    c.globalAlpha = 1;
  }
  if (G.banner) {
    const B = G.banner, k = B.t < .3 ? easeOut(B.t / .3) : B.t > B.dur - .3 ? 1 - (B.t - (B.dur - .3)) / .3 : 1;
    c.save(); c.globalAlpha = k;
    c.fillStyle = 'rgba(6,2,22,.72)'; c.fillRect(0, VH * .36, VW, B.b ? 104 : 80);
    c.fillStyle = B.col; c.fillRect(0, VH * .36, VW, 2); c.fillRect(0, VH * .36 + (B.b ? 102 : 78), VW, 2);
    c.translate((1 - k) * 80, 0);
    text(c, B.a, VW / 2, VH * .36 + 38, { font: '46px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', glow: B.col, blur: 18 });
    if (B.b) text(c, B.b, VW / 2, VH * .36 + 80, { font: '22px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: B.col });
    c.restore();
  }
  if (isTouch && G.state === 'play') renderControls(c);
  else if (G.state === 'play' && G.stageT < 8 && !isTouch) text(c, 'حرکت: جهت‌ها/WASD   ضربه: J   پرش: K   ویژه: L   دش: I   حالت N2: U   مکث: Esc', VW / 2, VH - 16, { font: '15px Vazirmatn, Tahoma, sans-serif', fill: 'rgba(255,255,255,.6)' });
  if (G.state === 'play') {
    const p = BTN.pause; c.fillStyle = 'rgba(10,4,30,.6)'; circ(c, p.x, p.y, p.r); c.fill(); c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); neon(c, '#29f3ff', 1.6, false);
    c.fillStyle = '#fff'; c.fillRect(p.x - 7, p.y - 9, 5, 18); c.fillRect(p.x + 2, p.y - 9, 5, 18);
  }
}
function heart(c, x, y, r) {
  c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .6, y - r * 1.3, x, y - r * .4); c.bezierCurveTo(x + r * .6, y - r * 1.3, x + r * 1.6, y - r * .2, x, y + r * .9);
  c.fillStyle = '#ff3f7a'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke();
}
function renderControls(c) {
  const J = INP.joy;
  const bx = J.id != null ? J.ox : J.bx, by = J.id != null ? J.oy : J.by;
  c.save();
  c.globalAlpha = J.id != null ? .9 : .5;
  c.fillStyle = 'rgba(10,4,30,.35)'; circ(c, bx, by, 64); c.fill();
  c.beginPath(); c.arc(bx, by, 64, 0, TAU); neon(c, '#29f3ff', 1.6, false);
  const kx = bx + INP.mx * 48, ky = by + INP.my * 48;
  const g = c.createRadialGradient(kx - 6, ky - 6, 2, kx, ky, 30); g.addColorStop(0, '#9ff9ff'); g.addColorStop(1, '#1b6c9a');
  c.fillStyle = g; circ(c, kx, ky, 28); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
  c.restore();
  const h = G.hero;
  const btn = (b, col, held, label, icon) => {
    c.save(); c.globalAlpha = held ? 1 : .78;
    const s = held ? .92 : 1;
    c.fillStyle = held ? rgba(col, .45) : 'rgba(10,4,30,.5)'; circ(c, b.x, b.y, b.r * s); c.fill();
    c.beginPath(); c.arc(b.x, b.y, b.r * s, 0, TAU); neon(c, col, 2.2, false);
    icon(b.x, b.y, b.r * s);
    if (label) text(c, label, b.x, b.y + b.r * s + 13, { font: '14px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', stroke: OUT, sw: 4 });
    c.restore();
  };
  const near = (h.state === 'idle' || h.state === 'walk') && nearItem(h, false);
  const grabbing = h.state === 'grab';
  btn(BTN.atk, near ? '#5dff9b' : grabbing ? '#ffe14a' : '#ff3fd8', INP.held.atk, near ? 'بردار' : grabbing ? (h.grabN >= 2 ? 'پرت کن' : 'زانو') : 'ضربه', (x, y) => {
    if (h.weapon) drawWeaponIcon(c, h.weapon, x - 4, y + 6, .55, G.t);
    else { c.fillStyle = SKIN; rr(c, x - 15, y - 13, 30, 26, 9); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke(); c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(x - 15 + i * 7.5, y - 13); c.lineTo(x - 15 + i * 7.5, y - 3); } c.stroke(); }
  });
  btn(BTN.jump, '#29f3ff', INP.held.jump, grabbing ? 'پرت' : 'پرش', (x, y) => { c.beginPath(); c.moveTo(x - 12, y + 6); c.lineTo(x, y - 8); c.lineTo(x + 12, y + 6); c.strokeStyle = '#fff'; c.lineWidth = 4.5; c.stroke(); });
  btn(BTN.dash, h.dashCd > 0 ? '#6b6290' : '#5dff9b', INP.held.dash, 'دش', (x, y) => { c.beginPath(); c.moveTo(x - 10, y - 9); c.lineTo(x, y); c.lineTo(x - 10, y + 9); c.moveTo(x, y - 9); c.lineTo(x + 10, y); c.lineTo(x, y + 9); c.strokeStyle = '#fff'; c.lineWidth = 3.5; c.stroke(); });
  btn(BTN.sp, h.en >= 50 ? '#ffe14a' : '#6b6290', INP.held.sp, 'ویژه', (x, y, r) => {
    c.beginPath(); c.arc(x, y, r - 5, -Math.PI / 2, -Math.PI / 2 + TAU * h.en / 100); c.strokeStyle = h.en >= 50 ? '#ffe14a' : '#29f3ff'; c.lineWidth = 4; c.stroke();
    star(c, x, y, 13, h.en >= 50 ? '#ffe14a' : '#8a82b0');
  });
  if (h.rage >= 100 && !(h.n2T > 0)) {
    const pulse = 1 + Math.sin(G.t * 10) * .08;
    btn({ x: BTN.n2.x, y: BTN.n2.y, r: BTN.n2.r * pulse }, '#ff3fd8', INP.held.n2, 'خشم', (x, y) => text(c, 'N2', x, y + 1, { font: '18px Bungee, Impact, sans-serif', fill: '#fff', glow: '#ff3fd8', blur: 10 }));
  }
}

/* ---------------- input ---------------- */
function toLogical(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / SC, y: (e.clientY - r.top) / SC }; }
function btnAt(p) {
  const keys = ['atk', 'jump', 'dash', 'sp', 'pause'];
  if (G.state === 'fight' ? (G.F && rageOK(G.F.P)) : (G.hero && G.hero.rage >= 100)) keys.push('n2');
  for (const k of keys) { const b = k === 'pause' && G.state === 'fight' ? { x: BTN.pause.x, y: BTN.pause.y + 64, r: BTN.pause.r } : BTN[k]; if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.3) return k; }
  return null;
}
function press(k) {
  auInit();
  if (k === 'atk') INP.atkE = true; else if (k === 'jump') INP.jumpE = true; else if (k === 'sp') INP.spE = true;
  else if (k === 'dash') INP.dashE = true; else if (k === 'n2') INP.n2E = true; else if (k === 'pause') pauseGame();
  INP.held[k] = true;
}
cv.addEventListener('pointerdown', ev0 => {
  ev0.preventDefault(); auInit();
  if (G.state !== 'play' && G.state !== 'fight') return;
  const p = toLogical(ev0);
  const k = btnAt(p);
  if (k) { INP.ptr[ev0.pointerId] = k; press(k); return; }
  if (p.x < VW * .5 && INP.joy.id == null) {
    INP.joy.id = ev0.pointerId; INP.joy.ox = clamp(p.x, 80, VW * .4); INP.joy.oy = clamp(p.y, 140, VH - 70); INP.ptr[ev0.pointerId] = 'joy';
    joyMove(p);
  }
  try { cv.setPointerCapture(ev0.pointerId); } catch (e) { }
}, { passive: false });
cv.addEventListener('pointermove', ev0 => {
  const r = INP.ptr[ev0.pointerId]; if (!r) return;
  const p = toLogical(ev0);
  if (r === 'joy') joyMove(p);
  else if (r !== 'pause') { const k = btnAt(p); if (k && k !== r && k !== 'pause') { INP.held[r] = false; INP.ptr[ev0.pointerId] = k; press(k); } }
});
const endPtr = ev0 => {
  const r = INP.ptr[ev0.pointerId]; if (!r) return;
  if (r === 'joy') { INP.joy.id = null; INP.mx = 0; INP.my = 0; } else INP.held[r] = false;
  delete INP.ptr[ev0.pointerId];
};
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr); cv.addEventListener('lostpointercapture', endPtr);
function joyMove(p) {
  const J = INP.joy, dx = p.x - J.ox, dy = p.y - J.oy, d = Math.hypot(dx, dy), mx = 48;
  const k = d > mx ? mx / d : 1;
  INP.mx = dx * k / mx; INP.my = dy * k / mx;
  if (Math.abs(INP.mx) < .15) INP.mx = 0; if (Math.abs(INP.my) < .15) INP.my = 0;
}
const KEYMAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', KeyJ: 'atk', KeyZ: 'atk', Space: 'atk', KeyK: 'jump', KeyX: 'jump', KeyL: 'sp', KeyC: 'sp', KeyI: 'dash', ShiftLeft: 'dash', KeyU: 'n2', KeyV: 'n2' };
addEventListener('keydown', ev0 => {
  if (ev0.code === 'Escape' || ev0.code === 'KeyP') { if (G.state === 'play' || G.state === 'fight') pauseGame(); else if (G.state === 'paused') resumeGame(); return; }
  if (G.state === 'story' && (ev0.code === 'Space' || ev0.code === 'Enter' || ev0.code === 'KeyJ')) { storyTap(); return; }
  const k = KEYMAP[ev0.code]; if (!k) return;
  ev0.preventDefault();
  if (!INP.keys[k] && (G.state === 'play' || G.state === 'fight') && ['atk', 'jump', 'sp', 'dash', 'n2'].includes(k)) press(k);
  INP.keys[k] = true; keyAxes();
});
addEventListener('keyup', ev0 => { const k = KEYMAP[ev0.code]; if (!k) return; INP.keys[k] = false; INP.held[k] = false; keyAxes(); });
function keyAxes() {
  if (INP.joy.id != null) return;
  const K = INP.keys; INP.mx = (K.r ? 1 : 0) - (K.l ? 1 : 0); INP.my = (K.d ? 1 : 0) - (K.u ? 1 : 0);
  if (INP.mx && INP.my) { INP.mx *= .8; INP.my *= .8; }
}
