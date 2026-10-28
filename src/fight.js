/* ===================== N2 — Final: King Arian (Tekken-style 1v1) ===================== */
const FS = 1.5, FGY = 482, ARENA_W = 1500, FMAX = 180, ROUND_T = 60;

/* s = startup, a = active, r = recovery (seconds); hs/bs = hit/block stun; reach in world px */
const NM = {
  jab: { anim: 'jab', s: .07, a: .07, r: .13, dmg: 5, lvl: 'high', reach: 98, hs: .24, bs: .12, push: 30, next: { P: 'cross', K: 'mkick' } },
  cross: { anim: 'cross', s: .08, a: .07, r: .17, dmg: 7, lvl: 'high', reach: 104, hs: .28, bs: .14, push: 40, next: { P: 'upper', K: 'hkick' } },
  upper: { anim: 'uppercut', s: .12, a: .08, r: .3, dmg: 12, lvl: 'mid', reach: 92, launch: 560, push: 20 },
  mkick: { anim: 'fkick', s: .13, a: .08, r: .24, dmg: 10, lvl: 'mid', reach: 128, hs: .3, bs: .16, push: 70, heavy: 1, next: { K: 'hkick' } },
  hkick: { anim: 'hkick', s: .16, a: .09, r: .34, dmg: 14, lvl: 'high', reach: 138, kd: true, push: 60, heavy: 1 },
  lowk: { anim: 'lowk', s: .12, a: .08, r: .28, dmg: 8, lvl: 'low', reach: 128, hs: .3, bs: .2, push: 30, crouch: true, heavy: 1 },
  lowp: { anim: 'lowp', s: .08, a: .06, r: .16, dmg: 4, lvl: 'low', reach: 90, hs: .22, bs: .12, push: 20, crouch: true },
  jumpk: { anim: 'kick', s: .06, a: .22, r: .1, dmg: 11, lvl: 'mid', reach: 118, hs: .32, bs: .16, push: 60, air: true, heavy: 1 },
  special: { anim: 'uppercut', s: .14, a: .14, r: .36, dmg: 18, lvl: 'mid', reach: 120, launch: 680, push: 60, heavy: 1, name: 'آپرکات نئونی!' },
  rage: { anim: 'dash', s: .16, a: .3, r: .5, dmg: 6, lvl: 'mid', reach: 120, lunge: 760, hs: .6, bs: .3, push: 120, rage: true, name: 'RAGE ART: N2 RUSH!' }
};
const AM = {
  ajab: { anim: 'jab', s: .09, a: .07, r: .16, dmg: 6, lvl: 'high', reach: 98, hs: .24, bs: .12, push: 30, next: { P: 'hook' } },
  hook: { anim: 'cross', s: .12, a: .08, r: .24, dmg: 9, lvl: 'high', reach: 102, hs: .3, bs: .15, push: 50 },
  calf: { anim: 'lowk', s: .14, a: .08, r: .28, dmg: 9, lvl: 'low', reach: 128, hs: .32, bs: .2, push: 30, crouch: true, heavy: 1, name: 'Calf Kick!' },
  teep: { anim: 'fkick', s: .15, a: .09, r: .3, dmg: 10, lvl: 'mid', reach: 136, hs: .3, bs: .16, push: 150, heavy: 1, name: 'Teep!' },
  shoot: { anim: 'shoot', s: .3, a: .22, r: .5, lvl: 'throw', reach: 105, lunge: 520, grab: 'takedown', name: 'Double Leg!' },
  clinch: { anim: 'grab', s: .16, a: .1, r: .4, lvl: 'throw', reach: 86, grab: 'choke', name: 'Clinch!' },
  roll: { anim: 'roll', s: .2, a: .36, r: .5, lvl: 'throw', reach: 96, lunge: 430, grab: 'heel', name: 'Imanari Roll!' },
  rage: { anim: 'roll', s: .22, a: .32, r: .6, lvl: 'throw', reach: 110, lunge: 620, grab: 'berimbolo', rage: true, name: 'RAGE ART: Berimbolo!' }
};
const GRAP = {
  takedown: [{ t: .6, txt: 'Double Leg!', pose: 'takedown', impact: 6 }, { t: 2.4, txt: 'Armbar!', pose: 'armbar', sub: true, dmg: 22 }],
  choke: [{ t: .45, txt: 'Back Take!', pose: 'back' }, { t: 2.4, txt: 'Rear Naked Choke!', pose: 'choke', sub: true, dmg: 20 }],
  heel: [{ t: .5, txt: 'Imanari Roll!', pose: 'roll' }, { t: 2.2, txt: 'Heel Hook!', pose: 'heel', sub: true, dmg: 18 }],
  berimbolo: [{ t: .6, txt: 'Berimbolo!', pose: 'roll' }, { t: 2.3, txt: 'Triangle!', pose: 'triangle', sub: true, dmg: 32, hard: true }]
};

function mkF(who, x, dir) {
  return { who, x, z: 0, vz: 0, vx: 0, dir, hp: FMAX, trail: FMAX, meter: who === 'nima' ? Math.min(100, 35 * (SAVE.up.en || 0)) : 0, state: 'idle', st: 0, anim: 'fstance', animT: Math.random() * 3, p: 0, mv: null, mvId: 0, hitDone: false, buf: null, stun: 0, crouch: false, blocking: false, juggle: 0, rageUsed: false, combo: 0, comboDmg: 0, comboT: 0, think: .8, intent: 'hold', blockT: 0, inv: 0, lift: 0, flash: 0 };
}
const rageOK = f => f.hp < FMAX * .3 && f.hp > 0 && !f.rageUsed;
const canAct = f => ['idle', 'walk', 'crouch', 'block'].includes(f.state);
const isLatin = s => !/[؀-ۿ]/.test(s);

function startFight(from) {
  G.mode = 'fight'; G.fightFrom = from || 'menu';
  if (from !== 'story') { G.diff = G.diff || 'normal'; G.D = DIFFS[G.diff] || DIFFS.normal; }
  G.stage = 2; G.art = buildStage(2);
  G.ents = []; G.items = []; G.shots = []; G.fx = []; G.ghosts = []; G.boss = null; G.hero = null; G.zoom = null; G.rain = []; G.banner = null;
  G.F = { round: 0, wins: [0, 0], P: null, A: null, grap: null, cine: null, txts: [], timer: ROUND_T, phase: 'intro', phT: 0, upLatch: false, tipShown: false, dmgTaken: 0 };
  G.camX = ARENA_W / 2 - VW / 2;
  G.state = 'fight'; hideScreens(); musPlay('final');
  newRound();
}
function newRound() {
  const F = G.F; F.round++;
  const c0 = ARENA_W / 2;
  F.P = mkF('nima', c0 - 150, 1); F.A = mkF('arian', c0 + 150, -1);
  F.grap = null; F.cine = null; F.timer = ROUND_T; F.phase = 'intro'; F.phT = 0; F.dmgTaken = 0; F.fightShown = false; F.txts = [];
  G.slow = 1; G.slowT = 0; G.zoom = null; G.hitStop = 0;
  const last = F.wins[0] === 1 && F.wins[1] === 1;
  G.banner = { t: 0, dur: 1.5, a: last ? 'راند نهایی' : 'راند ' + fa(F.round), b: F.round === 1 ? 'نیما در برابر کینگ آریان' : '', col: '#ffe14a' };
  SFX.warn();
}
function callout(s, f, col) { G.F.txts.push({ s, f, t: 0, col: col || '#ffe14a' }); if (G.F.txts.length > 3) G.F.txts.shift(); }

/* ---------------- update ---------------- */
function fightUpdate(dt) {
  const F = G.F, P = F.P, A = F.A;
  if (G.banner) { G.banner.t += dt; if (G.banner.t > G.banner.dur) G.banner = null; }
  if (G.flashT > 0) G.flashT -= dt;
  G.shake *= Math.pow(.004, dt);
  F.txts.forEach(T => T.t += dt); F.txts = F.txts.filter(T => T.t < 1.5);
  let sdt = dt;
  if (G.hitStop > 0) { G.hitStop -= dt; sdt *= .05; }
  if (G.slowT > 0) { G.slowT -= dt; sdt *= G.slow; if (G.slowT <= 0) G.slow = 1; }
  if (G.zoom) { G.zoom.t += dt; if (G.zoom.t > G.zoom.l) G.zoom = null; }
  F.phT += dt;
  if (F.phase === 'intro') {
    if (F.phT > 1.5 && !F.fightShown) { F.fightShown = true; G.banner = { t: 0, dur: .9, a: 'مبارزه!', b: '', col: '#ff3fd8' }; SFX.go(); }
    if (F.phT > 2.2) {
      F.phase = 'fight';
      if (!F.tipShown) { F.tipShown = true; toast('وقتی آریان شیرجه زد، بپر!', 'عقب نگه دار = دفاع · پایین = نشستن', '#29f3ff'); }
    }
  } else if (F.phase === 'fight' && !F.grap && !F.cine) {
    F.timer -= sdt;
    if (F.timer <= 0) { F.timer = 0; roundOver(P.hp / FMAX >= A.hp / FMAX ? 0 : 1, true); }
  } else if (F.phase === 'ko') {
    const w = F.winner === 0 ? P : A;
    if (F.phT > 1.4 && canAct(w) && w.state !== 'win') { w.state = 'win'; w.st = 0; if (w === A) callout('Oss!', A, '#29f3ff'); }
    if (F.phT > 3.6 && G.state === 'fight') nextAfterRound();
  }
  if (F.cine) cineUpdate(sdt);
  else if (F.grap) grapUpdate(sdt);
  else {
    if (F.phase === 'fight') { playerInput(P, A, sdt); aiUpdate(A, P, sdt); }
    else for (const f of [P, A]) if (f.state === 'walk' || f.state === 'block' || f.state === 'crouch') { f.state = 'idle'; f.vx = 0; }
    fighterStep(P, A, sdt); fighterStep(A, P, sdt);
    separate(P, A);
    for (const f of [P, A]) { const o = f === P ? A : P; if (canAct(f) && f.z <= 0) f.dir = o.x > f.x ? 1 : -1; }
  }
  for (const f of [P, A]) {
    if (f.trail > f.hp) f.trail = Math.max(f.hp, f.trail - (f.state === 'hstun' || f.state === 'air' ? 0 : 45) * dt);
    if (f.comboT > 0) f.comboT -= sdt;
    if (f.flash > 0) f.flash -= dt;
  }
  const tgt = clamp((P.x + A.x) / 2 - VW / 2, 0, ARENA_W - VW);
  G.camX += (tgt - G.camX) * Math.min(1, dt * 6);
  updateFx(sdt);
}
function playerInput(P, A, dt) {
  const F = G.F, mx = INP.mx, my = INP.my, fwd = mx * P.dir;
  const blockHeld = !!INP.held.dash;
  const upNow = my < -.6, jumpPress = upNow && !F.upLatch; F.upLatch = upNow;
  if (P.state === 'atk') { if (INP.atkE) P.buf = 'P'; if (INP.jumpE) P.buf = 'K'; return; }
  if (P.state === 'jump') {
    P.vx = mx * 170;
    if ((INP.atkE || INP.jumpE) && !P.airAtk) { P.airAtk = true; startMove(P, 'jumpk'); }
    return;
  }
  if (P.state === 'bstun') { P.blocking = true; return; }
  if (!canAct(P)) return;
  P.crouch = my > .5;
  P.blocking = blockHeld || fwd < -.3;
  if (INP.n2E && rageOK(P)) { startMove(P, 'rage'); return; }
  if (INP.spE && P.meter >= 50) { P.meter -= 50; startMove(P, 'special'); return; }
  if (INP.atkE) { startMove(P, P.crouch ? 'lowp' : 'jab'); return; }
  if (INP.jumpE) { startMove(P, P.crouch ? 'lowk' : fwd > .3 ? 'hkick' : 'mkick'); return; }
  if (jumpPress && !blockHeld) { P.state = 'jump'; P.st = 0; P.vz = 640; P.z = .1; P.airAtk = false; P.vx = mx * 170; SFX.jump(); return; }
  if (P.crouch) { P.state = 'crouch'; P.vx = 0; }
  else if (blockHeld && Math.abs(fwd) < .3) { P.state = 'block'; P.vx = 0; }
  else if (Math.abs(fwd) > .25) { P.state = 'walk'; P.vx = fwd > 0 ? P.dir * 225 : -P.dir * 175; }
  else { P.state = 'idle'; P.vx = 0; }
}
function startMove(f, key) {
  const M = (f.who === 'nima' ? NM : AM)[key];
  f.state = 'atk'; f.mv = M; f.mvKey = key; f.mvId++; f.st = 0; f.p = 0; f.hitDone = false; f.buf = null; f.anim = M.anim; f.crouch = !!M.crouch; f.blocking = false;
  if (M.rage) {
    f.rageUsed = true; G.flashT = .3; G.shake = 10; SFX.power(); vib(80);
    callout(M.name, f, f.who === 'nima' ? '#ff3fd8' : '#ff3a5a'); G.slow = .35; G.slowT = .3;
  } else if (M.name) callout(M.name, f, f.who === 'nima' ? '#29f3ff' : '#ffe14a');
  if (M.lvl !== 'throw') SFX.whoosh();
}
function fighterStep(f, o, dt) {
  f.animT += dt; f.st += dt; if (f.inv > 0) f.inv -= dt;
  f.lift = 0;
  switch (f.state) {
    case 'idle': f.anim = f.who === 'arian' ? 'bjj' : 'fstance'; f.crouch = false; break;
    case 'walk': f.anim = 'fwalk'; f.crouch = false; break;
    case 'crouch': f.anim = f.blocking ? 'cblock' : 'crouch'; f.crouch = true; break;
    case 'block': f.anim = 'block'; f.crouch = false; break;
    case 'bstun': f.anim = f.crouch ? 'cblock' : 'block'; if (f.st > f.stun) f.state = f.crouch ? 'crouch' : 'idle'; break;
    case 'hstun': f.anim = f.hitLvl === 'mid' ? 'hitM' : 'hitH'; if (f.st > f.stun) f.state = 'idle'; break;
    case 'atk': {
      const M = f.mv; if (!M) { f.state = 'idle'; break; }
      f.anim = M.anim; f.p = clamp(f.st / (M.s + M.a), 0, 1);
      if (M.anim === 'roll') f.p = clamp(f.st / (M.s + M.a), 0, 1);
      if (M.lunge && f.st < M.s + M.a) f.vx = f.dir * M.lunge * (f.st < M.s ? .55 : 1);
      if (f.st >= M.s && f.st < M.s + M.a && !f.hitDone) tryHit(f, o, M);
      if (f.state !== 'atk') break;
      if (f.st >= M.s + M.a && f.buf && M.next && M.next[f.buf]) { startMove(f, M.next[f.buf]); break; }
      if (f.st >= M.s + M.a + M.r) { f.state = f.z > 0 ? 'jump' : 'idle'; f.mv = null; }
      break;
    }
    case 'jump': f.anim = 'jump'; break;
    case 'air': f.anim = 'airhit'; f.p = f.st * 2; break;
    case 'down': f.anim = 'down'; if (f.st > .7 && f.z <= 0) { f.state = 'getup'; f.st = 0; } break;
    case 'getup': f.anim = 'getup'; f.p = f.st / .4; if (f.st > .4) { f.state = 'idle'; f.inv = .2; f.juggle = 0; } break;
    case 'taunt': f.anim = 'bow'; if (f.st > .9) f.state = 'idle'; break;
    case 'win': f.anim = f.who === 'nima' ? 'victory' : 'bow'; break;
    case 'ko': f.anim = f.z > 0 ? 'airhit' : 'down'; f.p = 1; break;
  }
  f.x += f.vx * dt;
  const keepV = f.state === 'walk' || f.state === 'jump' || (f.state === 'atk' && f.mv && (f.mv.lunge || f.mv.air)) || f.state === 'air' || f.state === 'ko';
  if (!keepV) f.vx *= Math.pow(.0008, dt);
  else if (f.state === 'air' || f.state === 'ko') f.vx *= Math.pow(.3, dt);
  if (f.z > 0 || f.vz > 0) {
    f.vz -= GRAV * (f.state === 'air' ? .85 : 1) * dt; f.z += f.vz * dt;
    if (f.z <= 0) { f.z = 0; land(f); }
  }
  f.x = clamp(f.x, 50, ARENA_W - 50);
}
function land(f) {
  if (f.state === 'jump' || (f.state === 'atk' && f.mv && f.mv.air)) { f.state = 'idle'; f.mv = null; f.vz = 0; f.vx = 0; SFX.land(); puff(f.x, FGY, 4); }
  else if (f.state === 'air' || f.state === 'ko') {
    if (f.vz < -320) { f.vz = -f.vz * .28; f.z = .1; puff(f.x, FGY, 7); SFX.land(); G.shake = Math.max(G.shake, 6); }
    else { f.vz = 0; if (f.state === 'air') { f.state = 'down'; f.st = 0; } }
  } else f.vz = 0;
}
function separate(P, A) {
  const d = A.x - P.x, s = Math.sign(d) || 1, ad = Math.abs(d);
  if (ad < 64 && Math.abs(P.z - A.z) < 70) { const push = (64 - ad) / 2; P.x -= s * push; A.x += s * push; }
  const maxD = VW - 150;
  if (ad > maxD) { const pull = (ad - maxD) / 2; P.x += s * pull; A.x -= s * pull; }
  for (const f of [P, A]) f.x = clamp(f.x, 50, ARENA_W - 50);
  if (Math.abs(A.x - P.x) < 60 && Math.abs(P.z - A.z) < 70) {
    if (P.x <= 51) A.x = P.x + 64; else if (A.x <= 51) P.x = A.x + 64;
    else if (P.x >= ARENA_W - 51) A.x = P.x - 64; else if (A.x >= ARENA_W - 51) P.x = A.x - 64;
  }
}

/* ---------------- hits ---------------- */
function tryHit(a, d, M) {
  const F = G.F;
  if (d.inv > 0 || ['down', 'getup', 'ko', 'grappled', 'grappling', 'win'].includes(d.state)) return;
  const dx = (d.x - a.x) * a.dir;
  if (dx < -20 || dx > M.reach) return;
  const dAir = d.z > 30;
  const dLow = d.state === 'crouch' || (d.state === 'bstun' && d.crouch) || (d.state === 'atk' && d.mv && (d.mv.crouch || d.mv.anim === 'shoot' || d.mv.anim === 'roll'));
  if (M.lvl === 'high' && dLow && !dAir) return;
  if ((M.lvl === 'low' || M.lvl === 'throw') && dAir) return;
  if (M.lvl === 'throw') { a.hitDone = true; grapStart(M.grab, M.rage); return; }
  a.hitDone = true;
  const canBlock = ['idle', 'walk', 'crouch', 'block', 'bstun'].includes(d.state) && d.z <= 0;
  const blocked = canBlock && d.blocking && ((M.lvl !== 'low' && !d.crouch) || (M.lvl === 'low' && d.crouch));
  if (blocked) {
    d.state = 'bstun'; d.st = 0; d.stun = M.bs || .14; d.vx = a.dir * (M.push || 40) * 3.2;
    a.meter = Math.min(100, a.meter + 3); d.meter = Math.min(100, d.meter + 5);
    const hy = FGY - d.z - (M.lvl === 'low' ? 30 : 100) * FS;
    G.fx.push({ k: 'ring', x: d.x - a.dir * 30, y: hy + 40, col: '#29f3ff', r: 50, t: 0, l: .25 });
    for (let i = 0; i < 6; i++) G.fx.push({ k: 'spark', x: d.x - a.dir * 30, y: hy, vx: -a.dir * rnd(60, 260), vy: rnd(-200, 100), l: .2, t: 0, col: '#9ff9ff' });
    SFX.block(); G.hitStop = .035;
    if (d.who === 'arian') callout('Blocked', d, '#29f3ff');
    return;
  }
  const counter = d.state === 'atk' && d.mv && d.st < d.mv.s;
  const juggling = d.state === 'air';
  const comboing = a.comboT > 0 && (d.state === 'hstun' || juggling);
  if (comboing) a.combo++; else { a.combo = 1; a.comboDmg = 0; }
  let dmg = M.dmg * (counter ? 1.3 : 1);
  if (a.combo > 1) dmg *= Math.max(.35, 1 - .1 * (a.combo - 1));
  if (a.who === 'arian') dmg *= G.D.dmg * .85 + .15;
  dmg = Math.max(1, Math.round(dmg));
  d.hp = Math.max(0, d.hp - dmg); a.comboDmg += dmg; a.comboT = .9;
  if (d.who === 'nima') F.dmgTaken += dmg;
  a.meter = Math.min(100, a.meter + 6); d.meter = Math.min(100, d.meter + 4);
  d.mv = null; d.flash = .12;
  hitFx(a, d, M, dmg, counter);
  if (d.hp <= 0) { d.state = 'ko'; d.st = 0; d.vz = 520; d.z = Math.max(d.z, 1); d.vx = a.dir * 280; koFx(a, d); return; }
  if (M.rage && a.who === 'nima') { d.state = 'hstun'; d.st = 0; d.stun = 9; F.cine = { a, d, t: 0, n: 0 }; G.zoom = { t: 0, l: 2, x: (a.x + d.x) / 2, y: FGY - 120, z: 1.25 }; return; }
  if (M.launch || juggling) {
    d.state = 'air'; d.st = 0; d.vz = M.launch || Math.max(240, 430 - d.juggle * 45); d.z = Math.max(d.z, 1); d.vx = a.dir * 80; d.juggle++;
    if (d.juggle > 6) d.vz = 140;
  } else if (M.kd) { d.state = 'air'; d.st = 0; d.vz = 360; d.z = 1; d.vx = a.dir * 240; }
  else { d.state = 'hstun'; d.st = 0; d.stun = (M.hs || .25) * (counter ? 1.4 : 1); d.hitLvl = M.lvl; d.vx = a.dir * (M.push || 40) * 3; d.blocking = false; }
}
function hitFx(a, d, M, dmg, counter) {
  const hy = FGY - d.z - (M.lvl === 'low' ? 30 : M.lvl === 'mid' ? 75 : 120) * FS;
  const hx = d.x - a.dir * 18;
  const col = a.who === 'nima' ? (M.heavy ? '#ff3fd8' : '#ffe14a') : '#ff7a3a';
  for (let i = 0; i < 9 * Q.parts + 4; i++) G.fx.push({ k: 'spark', x: hx, y: hy, vx: a.dir * rnd(80, 460) + rnd(-80, 80), vy: rnd(-300, 140), l: rnd(.18, .38), t: 0, col });
  G.fx.push({ k: 'star', x: hx, y: hy, t: 0, l: .24, s: M.heavy ? 1.8 : 1.3 });
  popText(hx + rnd(-10, 10), hy - 40, fa(dmg), d.who === 'nima' ? '#ff6b8a' : '#fff', M.heavy ? 28 : 22);
  if (counter) G.fx.push({ k: 'comic', x: hx, y: hy - 80, t: 0, l: .7, s: 'COUNTER!', col: '#ff3a5a' });
  else if (M.heavy && Math.random() < .5) G.fx.push({ k: 'comic', x: hx, y: hy - 70, t: 0, l: .55, s: pick(['POW!', 'BAM!', 'WHAM!']), col: pick(['#ffe14a', '#ff3fd8', '#29f3ff']) });
  (M.heavy ? SFX.bat : SFX.punch)();
  G.hitStop = Math.max(G.hitStop, M.heavy || counter ? .09 : .05);
  G.shake = Math.max(G.shake, M.heavy ? 8 : 4);
  if (d.who === 'nima') vib(M.heavy ? 70 : 35);
}
function koFx(a, d) {
  G.slow = .22; G.slowT = 1.6; G.flashT = .35; G.shake = 16; SFX.boom(); vib(220);
  G.zoom = { t: 0, l: 2.2, x: d.x, y: FGY - 110, z: 1.4 };
  roundOver(a.who === 'nima' ? 0 : 1, false);
}
function roundOver(w, timeout) {
  const F = G.F; if (F.phase !== 'fight') return;
  F.phase = 'ko'; F.phT = 0; F.winner = w; F.wins[w]++;
  const perfect = w === 0 && F.dmgTaken === 0;
  G.banner = { t: 0, dur: 2.6, a: timeout ? 'وقت تمام!' : 'K.O.!', b: perfect ? 'پرفکت!' : w === 0 ? 'نیما راند را برد' : 'آریان راند را برد', col: w === 0 ? '#ffe14a' : '#ff3a5a' };
  if (perfect) unlock('perfect');
  if (timeout) SFX.warn();
}
function nextAfterRound() {
  const F = G.F;
  if (F.wins[0] >= 2 || F.wins[1] >= 2) fightOver(F.wins[0] >= 2);
  else newRound();
}
function fightOver(win) {
  G.state = 'fightEnd'; saveGame();
  if (win) {
    const r = G.diff === 'hard' ? 400 : 250;
    addCoins(r); unlock('arian'); G.score += 20000; saveGame();
    if (G.fightFrom === 'story') {
      document.getElementById('clear-t').textContent = 'کینگ آریان تپ زد!';
      document.getElementById('clear-score').textContent = G.score;
      document.getElementById('clear-sub').textContent = '+' + fa(r) + ' سکه — تو شاه واقعی شهر نئونی!';
      SAVE.run = { diff: G.diff, step: G.step + 1, score: G.score, lives: G.lives }; saveGame();
      showScreen('s-clear');
    } else {
      document.getElementById('over-t').textContent = 'بردی! شاه واقعی نیماست!';
      document.getElementById('over-score').textContent = '+' + r;
      document.getElementById('over-sub').textContent = 'سکه جایزه';
      document.getElementById('over-list').hidden = true;
      document.getElementById('b-retry').textContent = 'مبارزه دوباره';
      showScreen('s-over');
    }
  } else gameOverScreen();
}

/* ---------------- Nima's rage art cinematic ---------------- */
function cineUpdate(dt) {
  const F = G.F, C = F.cine, a = C.a, d = C.d; C.t += dt;
  a.animT += dt; d.animT += dt;
  const seq = ['jab', 'cross', 'fkick', 'jab', 'cross', 'hkick'];
  const i = Math.floor(C.t / .13);
  a.anim = seq[i % seq.length]; a.p = (C.t % .13) / .13;
  d.anim = i % 2 ? 'hitH' : 'hitM'; d.x = clamp(a.x + a.dir * 96, 50, ARENA_W - 50);
  if (i > C.n && C.n < 10) {
    C.n = i; const dmg = 3; d.hp = Math.max(0, d.hp - dmg); a.combo++; a.comboDmg += dmg; a.comboT = 1;
    const hy = FGY - rnd(90, 160) * FS * .8;
    for (let k = 0; k < 6; k++) G.fx.push({ k: 'spark', x: d.x, y: hy, vx: a.dir * rnd(100, 400), vy: rnd(-260, 160), l: .25, t: 0, col: pick(['#ff3fd8', '#29f3ff', '#ffe14a']) });
    G.fx.push({ k: 'star', x: d.x - a.dir * 10, y: hy, t: 0, l: .2, s: 1.2 });
    (i % 3 === 2 ? SFX.bat : SFX.punch)(); G.shake = 6;
    if (d.hp <= 0) { endCine(true); return; }
  }
  if (C.t > 1.5) endCine(false);
}
function endCine(ko) {
  const F = G.F, C = F.cine, a = C.a, d = C.d;
  F.cine = null; a.state = 'idle'; a.mv = null;
  if (!ko) { d.hp = Math.max(0, d.hp - 8); a.comboDmg += 8; }
  d.state = d.hp <= 0 ? 'ko' : 'air'; d.st = 0; d.vz = 720; d.z = 1; d.vx = a.dir * 320;
  G.fx.push({ k: 'comic', x: d.x, y: FGY - 260, t: 0, l: .9, s: 'N2 RUSH!', col: '#ff3fd8' });
  G.shake = 14; G.flashT = .25; SFX.boom(); ring(d.x, FGY, '#ff3fd8', 160);
  if (d.hp <= 0) koFx(a, d);
}

/* ---------------- BJJ grapples ---------------- */
function grapStart(type, rage) {
  const F = G.F, P = F.P, A = F.A;
  const side = Math.sign(A.x - P.x) || 1;
  F.grap = { type, ph: 0, t: 0, mash: 0, D: GRAP[type], side, ax: A.x, px: P.x };
  P.state = 'grappled'; A.state = 'grappling'; P.st = A.st = 0; P.vx = A.vx = 0; P.z = A.z = 0; P.vz = A.vz = 0; A.mv = null; P.mv = null;
  P.dir = side;
  callout(GRAP[type][0].txt, A, rage ? '#ff3a5a' : '#ffe14a');
  SFX.grab(); G.shake = 8; vib(60);
}
function grapUpdate(dt) {
  const F = G.F, g = F.grap, P = F.P, A = F.A, ph = g.D[g.ph];
  g.t += dt; P.animT += dt; A.animT += dt;
  grapPose(g, ph, P, A);
  if (ph.sub) {
    const per = (ph.hard ? .075 : .115) * (G.diff === 'hard' ? .82 : 1);
    if (INP.atkE || INP.jumpE || INP.spE || INP.dashE) { g.mash = Math.min(1, g.mash + per); tn({ w: 'square', f: 500 + g.mash * 900, l: .04, v: .08 }); P.flash = .06; }
    g.mash = Math.max(0, g.mash - .2 * dt);
    if (g.mash >= 1) return grapEscape();
    if (g.t > ph.t) return grapFinish(ph);
  } else if (g.t > ph.t) {
    if (ph.impact) {
      const dm = Math.round(ph.impact * (G.D.dmg * .85 + .15)); P.hp = Math.max(1, P.hp - dm); F.dmgTaken += dm;
      popText(P.x, FGY - 120, fa(dm), '#ff6b8a', 24); puff(P.x - g.side * 50, FGY, 10);
    }
    g.ph++; g.t = 0; G.shake = 10; SFX.land(); vib(80);
    callout(g.D[g.ph].txt, A, '#ff3a5a');
  }
}
function grapPose(g, ph, P, A) {
  const s = g.side, k = clamp(g.t / ph.t, 0, 1);
  P.dir = s; P.p = 0; A.p = 0; A.lift = 0; P.lift = 0; A.legsOver = false;
  switch (ph.pose) {
    case 'takedown':
      P.anim = 'fall'; P.p = k;
      A.dir = -s; A.anim = k < .45 ? 'shoot' : 'gtop'; A.x = lerp(g.ax, P.x - s * 40 * FS, ease(k)); A.lift = k < .45 ? 0 : 14;
      g.order = 'PA'; break;
    case 'armbar':
      P.anim = 'downArm'; A.dir = s; A.anim = 'armbar'; A.x = P.x - s * 104 * FS;
      g.order = 'PA'; break;
    case 'back':
      P.anim = 'chokeV'; A.dir = s; A.anim = 'chokeA'; A.x = lerp(g.ax, P.x - s * 34 * FS, ease(k));
      g.order = 'AParm'; break;
    case 'choke':
      P.anim = 'chokeV'; A.dir = s; A.anim = 'chokeA'; A.x = P.x - s * 34 * FS;
      g.order = 'AParm'; break;
    case 'roll':
      A.dir = -s; A.anim = 'roll'; A.p = k; A.x = lerp(g.ax, P.x + s * 60 * FS, k);
      if (g.type === 'heel') { P.anim = k < .5 ? 'hitM' : 'fall'; P.p = (k - .5) * 2; } else P.anim = 'hitM';
      g.order = 'PA'; break;
    case 'heel':
      P.anim = 'heelV'; A.dir = -s; A.anim = 'heelA'; A.x = P.x + s * 8 * FS;
      g.order = 'PA'; break;
    case 'triangle':
      P.anim = 'triV'; A.dir = -s; A.anim = 'triangle'; A.x = P.x + s * 62 * FS;
      g.order = 'APlegs'; break;
  }
}
function grapFinish(ph) {
  const F = G.F, P = F.P, A = F.A, g = F.grap;
  const dmg = Math.round(ph.dmg * (G.D.dmg * .85 + .15));
  P.hp = Math.max(0, P.hp - dmg); F.dmgTaken += dmg; A.comboDmg = dmg; A.combo = 1; A.comboT = 1.2;
  popText(P.x, FGY - 150, fa(dmg), '#ff6b8a', 30);
  G.fx.push({ k: 'comic', x: P.x, y: FGY - 230, t: 0, l: 1, s: 'TAP!', col: '#ff3a5a' });
  G.flashT = .2; G.shake = 12; SFX.ko(); vib(150);
  F.grap = null;
  const side = g.side;
  A.x = clamp(P.x + side * 140, 50, ARENA_W - 50); A.state = 'taunt'; A.st = 0; A.dir = -side;
  callout('Oss!', A, '#29f3ff');
  if (P.hp <= 0) { P.state = 'ko'; P.st = 0; P.z = 0; koFx(A, P); }
  else { P.state = 'down'; P.st = 0; P.z = 0; P.inv = 1.1; }
}
function grapEscape() {
  const F = G.F, P = F.P, A = F.A, g = F.grap;
  F.grap = null;
  callout('فرار کردی!', P, '#5dff9b'); SFX.pickup(); G.shake = 6;
  SAVE.stats.escapes = (SAVE.stats.escapes || 0) + 1; ev('escapes', 0);
  P.state = 'getup'; P.st = 0; P.inv = .6;
  A.x = clamp(P.x + g.side * 120, 50, ARENA_W - 50); A.dir = -g.side;
  A.state = 'hstun'; A.st = 0; A.stun = .8; A.hitLvl = 'mid'; A.vx = g.side * 160;
}

/* ---------------- King Arian AI ---------------- */
function aiUpdate(A, P, dt) {
  const hard = G.diff === 'hard';
  if (P.state === 'atk' && P.mv && canAct(A) && A.react !== P.mvId) {
    A.react = P.mvId;
    if (Math.random() < (hard ? .5 : .3)) {
      A.blocking = true; A.crouch = P.mv.lvl === 'low' ? Math.random() < .65 : false;
      A.state = A.crouch ? 'crouch' : 'block'; A.vx = 0; A.blockT = .45;
    }
  }
  if (A.blockT > 0) { A.blockT -= dt; if (A.blockT <= 0) { A.blocking = false; if (A.state === 'block' || A.state === 'crouch') { A.state = 'idle'; A.crouch = false; } } return; }
  if (!canAct(A)) return;
  const d = Math.abs(A.x - P.x), fwd = Math.sign(P.x - A.x) || 1;
  if (A.intent === 'approach') { A.state = 'walk'; A.vx = fwd * 190; A.blocking = false; }
  else if (A.intent === 'retreat') { A.state = 'walk'; A.vx = -fwd * 160; A.blocking = true; }
  else { A.state = 'idle'; A.vx = 0; }
  A.think -= dt;
  if (A.think > 0) return;
  A.think = rnd(.22, .5) * (hard ? .7 : 1);
  const pRec = P.state === 'atk' && P.mv && P.st > P.mv.s + P.mv.a;
  if (pRec && d < 115 && Math.random() < (hard ? .8 : .55)) { startMove(A, Math.random() < .5 ? 'hook' : 'clinch'); return; }
  if (P.state === 'down' || P.state === 'getup') {
    A.intent = 'hold';
    if (Math.random() < .25 && d > 140) { A.state = 'taunt'; A.st = 0; callout('Oss!', A, '#29f3ff'); }
    return;
  }
  if (rageOK(A) && d < 300 && Math.random() < .35) { startMove(A, 'rage'); return; }
  let o;
  if (P.z > 20) o = { hold: 3, teep: 2, retreat: 1 };
  else if (d > 270) o = { approach: 7, roll: d < 340 ? 1.2 : 0, hold: 1 };
  else if (d > 155) o = { approach: 4, shoot: 2.6, roll: 1, hold: 1.2, retreat: .5 };
  else if (d > 100) o = { teep: 2, calf: 2.2, shoot: 1.8, ajab: 1, hook: .8, approach: 1, retreat: 1, hold: .6 };
  else o = { ajab: 2.4, hook: 1.4, clinch: 2.2, calf: 1.2, retreat: 1.5, hold: 1 };
  if (P.state === 'crouch') { o.teep = (o.teep || 0) + 1.5; o.clinch = (o.clinch || 0) + .8; }
  if (P.state === 'block') { o.clinch = (o.clinch || 0) + 1.5; o.shoot = (o.shoot || 0) + 1; }
  let tot = 0; for (const k in o) tot += o[k];
  let r = Math.random() * tot, pickK = 'hold';
  for (const k in o) { r -= o[k]; if (r <= 0) { pickK = k; break; } }
  if (AM[pickK]) { startMove(A, pickK); if (pickK === 'ajab' && Math.random() < .45) A.buf = 'P'; A.intent = 'hold'; }
  else A.intent = pickK;
}

/* ---------------- rendering ---------------- */
function fMood(f) {
  if (['hstun', 'air', 'down', 'ko', 'grappled'].includes(f.state)) return 'hurt';
  if (f.state === 'win') return 'happy';
  if (f.state === 'atk' || f.state === 'bstun' || f.state === 'grappling') return 'angry';
  return 'smile';
}
function drawFighter(c, f, extra) {
  const x = f.x - G.camX, y = FGY - f.z - (f.lift || 0) * FS;
  const P = poseOf({ anim: f.anim, animT: f.animT, p: f.p });
  if (extra) Object.assign(P, extra);
  if (f.who === 'nima') drawNima(c, x, y, f.dir, P, LOOK, null, FS, G.t, fMood(f));
  else drawArian(c, x, y, f.dir, P, FS, G.t, fMood(f));
  if (!extra && (f.state === 'block' || f.state === 'bstun' || (f.state === 'crouch' && f.blocking))) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = f.state === 'bstun' ? .9 : .4;
    const sy = y - (f.crouch ? 55 : 95) * FS;
    c.beginPath(); c.ellipse(x + f.dir * 30 * FS, sy, 16 * FS, 42 * FS, 0, 0, TAU); neon(c, '#29f3ff', 2, false);
    c.restore();
  }
  if (f.flash > 0 && !extra) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 70 * FS, 80 * FS, '#ffffff', .4); c.restore(); }
}
function drawChokeArm(c, P) {
  const s = P.dir, x0 = P.x - G.camX, y0 = FGY;
  c.save(); c.translate(x0 - s * 20 * FS, y0 - 64 * FS); c.scale(s * FS, FS); c.rotate(-.1);
  c.fillStyle = denimPat(c); rr(c, 0, -7, 40, 14, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
  c.fillStyle = AR.jkL; rr(c, 32, -7.5, 7, 15, 3); c.fill(); c.stroke();
  c.fillStyle = AR.skin; circ(c, 44, 0, 7.4); c.fill(); c.stroke();
  c.restore();
}
function drawMat(c) {
  const cx0 = ARENA_W / 2 - G.camX;
  c.save();
  c.beginPath(); c.moveTo(cx0 - 520, 404); c.lineTo(cx0 + 520, 404); c.lineTo(cx0 + 700, VH - 8); c.lineTo(cx0 - 700, VH - 8); c.closePath();
  c.fillStyle = 'rgba(255,225,74,.05)'; c.fill();
  c.globalCompositeOperation = 'lighter'; neon(c, '#ffe14a', 1.6, false);
  c.beginPath(); c.ellipse(cx0, 462, 180, 36, 0, 0, TAU); c.globalAlpha = .45; neon(c, '#ff3fd8', 1.6, false);
  c.globalAlpha = .18; c.font = '46px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.save(); c.translate(cx0, 462); c.scale(1, .32); c.fillStyle = '#ffe14a'; c.fillText('KING ARIAN', 0, 0); c.restore();
  c.restore();
  // big neon sign above the parapet
  const sx = cx0, sy = 100;
  if (sx > -400 && sx < VW + 400) {
    c.save();
    c.fillStyle = 'rgba(8,4,24,.88)'; rr(c, sx - 150, sy - 34, 300, 68, 10); c.fill();
    c.strokeStyle = '#ffe14a'; c.lineWidth = 3; c.shadowColor = '#ffe14a'; c.shadowBlur = 18; rr(c, sx - 145, sy - 29, 290, 58, 8); c.stroke();
    c.font = '30px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const fl = Math.sin(G.t * 9) > -.9 ? 1 : .4;
    c.globalAlpha = fl; c.fillStyle = '#ffe14a'; c.shadowBlur = 22; c.fillText('KING ARIAN', sx, sy + 4);
    c.restore();
  }
}
function renderFight(c) {
  const F = G.F, P = F.P, A = F.A;
  c.save();
  if (G.shake > .3) c.translate(rnd(-G.shake, G.shake), rnd(-G.shake, G.shake) * .6);
  if (G.zoom) {
    const Z = G.zoom, u = Z.t / Z.l, k = u < .2 ? ease(u / .2) : u > .75 ? 1 - ease((u - .75) / .25) : 1;
    const zf = 1 + (Z.z - 1) * k, fx = Z.x - G.camX, fy = Z.y;
    c.translate(fx, fy); c.scale(zf, zf); c.translate(-fx, -fy);
  }
  renderWorld(c);
  drawMat(c);
  for (const f of [P, A]) shadow(c, f.x - G.camX, FGY, 36 * FS, f.z);
  const g = F.grap;
  if (g) {
    if (g.order === 'APlegs') { drawFighter(c, A); drawFighter(c, P); drawFighter(c, A, { legsOnly: true }); }
    else if (g.order === 'AParm') { drawFighter(c, A); drawFighter(c, P); drawChokeArm(c, P); }
    else { drawFighter(c, P); drawFighter(c, A); }
  } else {
    const first = A.state === 'atk' || P.state === 'hstun' || P.state === 'air' ? P : A;
    drawFighter(c, first); drawFighter(c, first === P ? A : P);
  }
  renderFx(c);
  c.restore();
  if (!G.vig) {
    const v = document.createElement('canvas'); v.width = 256; v.height = 144; const x = v.getContext('2d');
    const gr = x.createRadialGradient(128, 72, 40, 128, 72, 150); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(3,0,14,.65)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 144); G.vig = v;
  }
  c.drawImage(G.vig, 0, 0, VW, VH);
  if (F.cine) { c.fillStyle = `rgba(255,63,216,${.12 + Math.sin(G.t * 20) * .05})`; c.fillRect(0, 0, VW, VH); }
  if (g && g.D[g.ph].sub) { c.fillStyle = 'rgba(255,40,60,.08)'; c.fillRect(0, 0, VW, VH); }
  if (G.flashT > 0) { c.fillStyle = `rgba(255,255,255,${G.flashT * 1.5})`; c.fillRect(0, 0, VW, VH); }
  renderFightHUD(c);
}
function fBar(c, x, y, w, h, f, right) {
  c.fillStyle = 'rgba(5,2,20,.85)'; c.beginPath();
  if (right) { c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 10, y + h); c.lineTo(x - 10, y + h); }
  else { c.moveTo(x + 10, y); c.lineTo(x + w + 10, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); }
  c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.stroke();
  c.save(); c.clip();
  const tr = f.trail / FMAX, hp = f.hp / FMAX;
  const fill = (v, col) => { c.fillStyle = col; if (right) c.fillRect(x + w * (1 - v) - 10, y, w * v + 10, h); else c.fillRect(x, y, w * v + 10, h); };
  fill(tr, '#ff3a5a');
  const low = hp < .3;
  const grad = c.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, low ? '#ff9a7a' : '#fff59a'); grad.addColorStop(1, low ? '#e8203a' : '#ffb21a');
  fill(hp, grad);
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 10, y + 2, w + 20, h * .25);
  c.restore();
  if (rageOK(f)) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5 + Math.sin(G.t * 10) * .4;
    c.beginPath(); c.rect(x - 4, y - 4, w + 8, h + 8); neon(c, '#ff3a5a', 1.8, false); c.restore();
    text(c, 'RAGE', right ? x + w - 20 : x + 20, y + h + 30, { font: '14px Bungee, Impact, sans-serif', fill: '#ff3a5a', stroke: OUT, sw: 4 });
  }
}
function renderFightHUD(c) {
  const F = G.F, P = F.P, A = F.A;
  const m = 16, pr = 26, bw = Math.min(410, VW / 2 - 130), bh = 22, y = 22;
  const lx = m + pr * 2 + 10, rx = VW - lx - bw;
  // portraits
  for (const [f, cxp, col] of [[P, m + pr, '#29f3ff'], [A, VW - m - pr, '#ffe14a']]) {
    c.save(); c.beginPath(); c.arc(cxp, y + 14, pr, 0, TAU); c.fillStyle = 'rgba(10,4,30,.9)'; c.fill(); c.clip();
    const base = { legF: 0, legB: 0, armF: .2, armB: -.1, tilt: 0, bob: 0, lie: 0, spin: 1 };
    if (f === P) drawNima(c, cxp - 6, y + 106, 1, base, LOOK, null, .78, G.t, fMood(f));
    else drawArian(c, cxp + 6, y + 106, -1, base, .78, G.t, fMood(f));
    c.restore();
    c.beginPath(); c.arc(cxp, y + 14, pr, 0, TAU); neon(c, col, 2);
  }
  fBar(c, lx, y, bw, bh, P, false); fBar(c, rx, y, bw, bh, A, true);
  text(c, 'نیما', lx + 4, y + bh + 14, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', align: 'left', fill: '#fff', stroke: OUT, sw: 4 });
  text(c, 'کینگ آریان', rx + bw - 4, y + bh + 14, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', align: 'right', fill: '#ffe14a', stroke: OUT, sw: 4 });
  // round pips
  for (let i = 0; i < 2; i++) {
    for (const [wx, won] of [[lx + bw - 14 - i * 18, F.wins[0] > i], [rx + 14 + i * 18, F.wins[1] > i]]) {
      c.save(); c.translate(wx, y + bh + 14); c.rotate(Math.PI / 4);
      c.fillStyle = won ? '#ffe14a' : 'rgba(255,255,255,.12)'; c.fillRect(-5, -5, 10, 10); c.strokeStyle = OUT; c.lineWidth = 1.5; c.strokeRect(-5, -5, 10, 10);
      c.restore();
    }
  }
  // special meters
  for (const [f, x0, right] of [[P, lx, false], [A, rx, true]]) {
    const w = bw * .55, xm = right ? x0 + bw - w : x0, ym = y + bh + 30;
    c.fillStyle = 'rgba(5,2,20,.8)'; rr(c, xm, ym, w, 6, 3); c.fill();
    c.fillStyle = f.meter >= 50 ? '#29f3ff' : '#4a6fa8'; const mw = w * f.meter / 100;
    rr(c, right ? xm + w - mw : xm, ym, Math.max(0, mw), 6, 3); c.fill();
  }
  // timer
  c.fillStyle = 'rgba(8,4,24,.9)'; rr(c, VW / 2 - 38, y - 8, 76, 54, 8); c.fill(); c.beginPath(); rr(c, VW / 2 - 38, y - 8, 76, 54, 8); neon(c, '#ff3fd8', 1.6, false);
  text(c, String(Math.ceil(F.timer)), VW / 2, y + 20, { font: '34px Bungee, Impact, sans-serif', fill: F.timer < 10 ? '#ff3a5a' : '#fff' });
  // combo counters
  for (const [f, side] of [[P, -1], [A, 1]]) {
    if (f.combo >= 2 && f.comboT > 0) {
      const x = side < 0 ? 120 : VW - 120;
      text(c, fa(f.combo) + ' ضربه', x, 180, { font: '34px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#ffe14a', stroke: OUT, sw: 7 });
      text(c, fa(f.comboDmg) + ' آسیب', x, 214, { font: '18px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#ff3fd8', stroke: OUT, sw: 4 });
    }
  }
  // move callouts
  F.txts.forEach((T, i) => {
    const k = T.t < .15 ? T.t / .15 : 1, a = T.t > 1.1 ? 1 - (T.t - 1.1) / .4 : 1;
    const x = clamp(T.f.x - G.camX, 170, VW - 170);
    c.save(); c.globalAlpha = Math.max(0, a); c.translate(x, 196 + i * 44); c.rotate(-.05); c.scale(.6 + .4 * k, .6 + .4 * k);
    text(c, T.s, 0, 0, { font: isLatin(T.s) ? '30px Bungee, Impact, sans-serif' : '38px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: T.col, stroke: OUT, sw: 8 });
    c.restore();
  });
  // submission escape meter
  const g = F.grap;
  if (g && g.D[g.ph].sub) {
    const ph = g.D[g.ph], w = 340, x = VW / 2 - w / 2, yy = 168;
    c.globalAlpha = Math.sin(G.t * 14) > -.3 ? 1 : .55;
    text(c, 'سریع ضربه بزن تا فرار کنی!', VW / 2, yy - 26, { font: '26px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', stroke: OUT, sw: 6 });
    c.globalAlpha = 1;
    bar(c, x, yy, w, 18, g.mash, ['#5dff9b', '#29f3ff'], '#5dff9b');
    bar(c, x + 50, yy + 28, w - 100, 6, 1 - g.t / ph.t, ['#ff3a5a', '#ff8a1f']);
  }
  // banner
  if (G.banner) {
    const B = G.banner, k = B.t < .25 ? easeOut(B.t / .25) : B.t > B.dur - .3 ? 1 - (B.t - (B.dur - .3)) / .3 : 1;
    c.save(); c.globalAlpha = Math.max(0, k);
    c.fillStyle = 'rgba(6,2,22,.72)'; c.fillRect(0, VH * .36, VW, B.b ? 110 : 84);
    c.fillStyle = B.col; c.fillRect(0, VH * .36, VW, 2); c.fillRect(0, VH * .36 + (B.b ? 108 : 82), VW, 2);
    c.translate(VW / 2, VH * .36 + 40); c.scale(1 + (1 - k) * .4, 1 + (1 - k) * .4);
    text(c, B.a, 0, 0, { font: isLatin(B.a) ? '54px Bungee, Impact, sans-serif' : '52px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', glow: B.col, blur: 20 });
    if (B.b) text(c, B.b, 0, 44, { font: '22px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: B.col });
    c.restore();
  }
  if (G.state === 'fight') {
    if (isTouch) renderFightControls(c);
    else if (F.round === 1 && F.phT < 8) text(c, 'حرکت/پرش/نشستن: جهت‌ها   مشت: J   لگد: K   دفاع: I یا عقب   ویژه: L   ریج: U', VW / 2, VH - 16, { font: '15px Vazirmatn, Tahoma, sans-serif', fill: 'rgba(255,255,255,.65)' });
    const p = BTN.pause; c.fillStyle = 'rgba(10,4,30,.6)'; circ(c, p.x, p.y + 64, p.r); c.fill(); c.beginPath(); c.arc(p.x, p.y + 64, p.r, 0, TAU); neon(c, '#29f3ff', 1.6, false);
    c.fillStyle = '#fff'; c.fillRect(p.x - 7, p.y + 55, 5, 18); c.fillRect(p.x + 2, p.y + 55, 5, 18);
  }
}
function renderFightControls(c) {
  const J = INP.joy, P = G.F.P;
  const bx = J.id != null ? J.ox : J.bx, by = J.id != null ? J.oy : J.by;
  c.save(); c.globalAlpha = J.id != null ? .9 : .5;
  c.fillStyle = 'rgba(10,4,30,.35)'; circ(c, bx, by, 64); c.fill();
  c.beginPath(); c.arc(bx, by, 64, 0, TAU); neon(c, '#29f3ff', 1.6, false);
  const kx = bx + INP.mx * 48, ky = by + INP.my * 48;
  const gr = c.createRadialGradient(kx - 6, ky - 6, 2, kx, ky, 30); gr.addColorStop(0, '#9ff9ff'); gr.addColorStop(1, '#1b6c9a');
  c.fillStyle = gr; circ(c, kx, ky, 28); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
  c.restore();
  const mash = G.F.grap && G.F.grap.D[G.F.grap.ph].sub;
  const btn = (b, col, held, label, icon) => {
    const pulse = mash && (b === BTN.atk || b === BTN.jump) ? 1 + Math.sin(G.t * 24) * .08 : 1;
    c.save(); c.globalAlpha = held ? 1 : .8;
    const r = b.r * (held ? .92 : 1) * pulse;
    c.fillStyle = held ? rgba(col, .45) : 'rgba(10,4,30,.5)'; circ(c, b.x, b.y, r); c.fill();
    c.beginPath(); c.arc(b.x, b.y, r, 0, TAU); neon(c, col, 2.2, false);
    icon(b.x, b.y, r);
    text(c, label, b.x, b.y + r + 13, { font: '14px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff', stroke: OUT, sw: 4 });
    c.restore();
  };
  btn(BTN.atk, mash ? '#5dff9b' : '#ff3fd8', INP.held.atk, 'مشت', (x, y) => { c.fillStyle = SKIN; rr(c, x - 15, y - 13, 30, 26, 9); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke(); c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(x - 15 + i * 7.5, y - 13); c.lineTo(x - 15 + i * 7.5, y - 3); } c.stroke(); });
  btn(BTN.jump, mash ? '#5dff9b' : '#ffe14a', INP.held.jump, 'لگد', (x, y) => { c.fillStyle = '#d9d6cf'; c.beginPath(); c.moveTo(x - 10, y - 12); c.lineTo(x - 2, y - 12); c.lineTo(x - 2, y + 2); c.lineTo(x + 14, y + 4); c.lineTo(x + 14, y + 11); c.lineTo(x - 10, y + 11); c.closePath(); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke(); });
  btn(BTN.dash, '#29f3ff', INP.held.dash, 'دفاع', (x, y) => { c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x + 12, y - 8); c.lineTo(x + 10, y + 6); c.lineTo(x, y + 14); c.lineTo(x - 10, y + 6); c.lineTo(x - 12, y - 8); c.closePath(); c.fillStyle = 'rgba(41,243,255,.35)'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); });
  btn(BTN.sp, P.meter >= 50 ? '#29f3ff' : '#6b6290', INP.held.sp, 'ویژه', (x, y, r) => {
    c.beginPath(); c.arc(x, y, r - 5, -Math.PI / 2, -Math.PI / 2 + TAU * P.meter / 100); c.strokeStyle = P.meter >= 50 ? '#29f3ff' : '#4a6fa8'; c.lineWidth = 4; c.stroke();
    star(c, x, y, 13, P.meter >= 50 ? '#9ff9ff' : '#8a82b0');
  });
  if (rageOK(P)) {
    const pulse = 1 + Math.sin(G.t * 10) * .08;
    btn({ x: BTN.n2.x, y: BTN.n2.y, r: BTN.n2.r * pulse }, '#ff3a5a', INP.held.n2, 'ریج آرت', (x, y) => text(c, 'N2', x, y + 1, { font: '18px Bungee, Impact, sans-serif', fill: '#fff', glow: '#ff3a5a', blur: 10 }));
  }
}
