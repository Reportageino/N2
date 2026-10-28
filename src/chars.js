/* ===================== N2 — characters ===================== */
const OUT = '#0c0720';

/* arm angles: 0 = hanging down, negative = forward, -PI = straight up */
function poseOf(e) {
  const t = e.animT || 0, p = clamp(e.p || 0, 0, 1);
  const P = { legF: 0, legB: 0, armF: .18, armB: -.12, tilt: 0, bob: 0, lie: 0, spin: 1, squash: 1 };
  const punch = q => q < .45 ? easeOut(q / .45) : 1 - ease((q - .45) / .55) * .85;
  switch (e.anim) {
    case 'idle': P.bob = Math.sin(t * 4) * 1.6; P.armF = .2 + Math.sin(t * 4) * .06; P.armB = -.1 - Math.sin(t * 4) * .06; break;
    case 'walk': { const s = Math.sin(t * 11); P.legF = s * .55; P.legB = -s * .55; P.armF = -s * .5; P.armB = s * .5; P.bob = -Math.abs(Math.cos(t * 11)) * 3; break; }
    case 'run': { const s = Math.sin(t * 17); P.legF = s * .8; P.legB = -s * .8; P.armF = 1.1; P.armB = 1.3; P.tilt = .35; P.bob = -Math.abs(Math.cos(t * 17)) * 4; break; }
    case 'punch1': { const k = punch(p); P.armF = -.3 - 1.3 * k; P.armB = .35; P.tilt = .1 * k; P.legF = -.25; P.legB = .25; break; }
    case 'punch2': { const k = punch(p); P.armB = -.2 - 1.45 * k; P.armF = .6; P.tilt = .14 * k; P.legF = -.3; P.legB = .3; break; }
    case 'uppercut': { const k = punch(p); P.armF = lerp(.6, -2.75, k); P.armB = .5; P.tilt = -.12 * k; P.bob = -7 * k; P.legF = -.35; P.legB = .4; break; }
    case 'swingA': { const k = ease(clamp(p / .55, 0, 1)); P.armF = lerp(2.1, -1.55, k); P.armB = lerp(1.2, -.6, k); P.tilt = lerp(-.12, .2, k); P.legF = -.35; P.legB = .35; break; }
    case 'swingB': { const k = ease(clamp(p / .55, 0, 1)); P.armF = lerp(-3.6, -.55, k); P.armB = lerp(-2.6, .3, k); P.tilt = lerp(-.18, .24, k); P.legF = -.4; P.legB = .4; P.bob = 3 * k; break; }
    case 'swingC': { const k = ease(clamp(p / .5, 0, 1)); P.armF = lerp(2.4, -1.75, k); P.armB = lerp(1.6, -.9, k); P.tilt = lerp(-.25, .3, k); P.legF = -.6; P.legB = .55; P.bob = 2; break; }
    case 'shoot': { const r = Math.max(0, 1 - p * 3); P.armF = -1.57 + .25 * r; P.armB = -1.35 + .2 * r; P.tilt = -.06 * r; P.legF = -.2; P.legB = .25; break; }
    case 'jump': P.legF = -.7; P.legB = .55; P.armF = -2.3; P.armB = .9; P.bob = 0; break;
    case 'kick': P.legF = -1.5; P.legB = .55; P.armF = .9; P.armB = -2.2; P.tilt = -.2; break;
    case 'hurt': P.tilt = -.35; P.armF = -2.5; P.armB = 2.4; P.legF = .25; P.legB = -.2; break;
    case 'down': P.lie = 1; P.armF = -2.8; P.armB = 2.9; P.legF = -.25; P.legB = .3; break;
    case 'getup': P.lie = 1 - ease(p); P.armF = .6; P.legF = -.5; P.legB = .5; break;
    case 'pick': { const k = Math.sin(p * Math.PI); P.tilt = .55 * k; P.armF = lerp(.2, -.4, k); P.bob = 7 * k; P.legF = -.5 * k; P.legB = .5 * k; break; }
    case 'special': P.armF = -1.57; P.armB = 1.57; P.legF = -.45; P.legB = .45; P.spin = Math.cos(t * 34); P.bob = -6; break;
    case 'windup': P.armF = 1.3; P.armB = 1.0; P.tilt = -.2; P.legF = -.3; P.legB = .3; break;
    case 'victory': P.armF = -3.0; P.armB = -2.6; P.bob = -Math.abs(Math.sin(t * 6)) * 10; break;
    case 'fstance': { const b = Math.sin(t * 5); P.armF = -2.25 + b * .06; P.armB = -1.95 - b * .06; P.legF = -.4; P.legB = .42; P.bob = 2.2 + b * 1.2; P.tilt = .08; break; }
    case 'bjj': { const b = Math.sin(t * 4); P.armF = -1.75 + b * .08; P.armB = -1.5 - b * .08; P.legF = -.52; P.legB = .55; P.bob = 4.2 + b; P.tilt = .22; break; }
    case 'fwalk': { const s = Math.sin(t * 10); P.legF = -.25 + s * .35; P.legB = .25 - s * .35; P.armF = -2.2; P.armB = -1.95; P.tilt = .1; P.bob = 1 - Math.abs(Math.cos(t * 10)) * 2.5; break; }
    case 'jab': { const k = punch(p); P.armF = lerp(-2.25, -1.55, k); P.armB = -1.95; P.tilt = .08 + .12 * k; P.legF = -.4; P.legB = .42; P.bob = 2.2; break; }
    case 'cross': { const k = punch(p); P.armB = lerp(-1.95, -1.5, k); P.armF = -2.4; P.tilt = .1 + .2 * k; P.legF = -.42; P.legB = .5; P.bob = 3; break; }
    case 'fkick': { const k = punch(p); P.legF = lerp(-.4, -1.6, k); P.legB = .25; P.armF = -2.3; P.armB = -1.7; P.tilt = -.2 * k; break; }
    case 'hkick': { const k = punch(p); P.legF = lerp(-.4, -2.25, k); P.legB = .3; P.armF = -1.1; P.armB = -2.6; P.tilt = -.42 * k; break; }
    case 'lowk': { const k = punch(p); P.legF = lerp(-.5, -1.35, k); P.legB = .95; P.bob = 11; P.armF = -2.3; P.armB = -2; P.tilt = .1 - .25 * k; break; }
    case 'lowp': { const k = punch(p); P.legF = -.95; P.legB = .95; P.bob = 11.5; P.armF = lerp(-2.2, -1.45, k); P.armB = -2.0; P.tilt = .15 + .2 * k; break; }
    case 'crouch': P.legF = -.95; P.legB = .95; P.bob = 11.5; P.armF = -2.3; P.armB = -2.05; P.tilt = .15; break;
    case 'cblock': P.legF = -.95; P.legB = .95; P.bob = 11.5; P.armF = -2.85; P.armB = -2.7; P.tilt = .05; break;
    case 'block': P.armF = -2.85; P.armB = -2.7; P.tilt = -.08; P.legF = -.4; P.legB = .45; P.bob = 2.5; break;
    case 'hitH': P.tilt = -.4; P.armF = -.9; P.armB = -.5; P.legF = -.3; P.legB = .45; P.bob = 2; break;
    case 'hitM': P.tilt = .5; P.armF = .2; P.armB = .1; P.legF = -.3; P.legB = .45; P.bob = 3; break;
    case 'airhit': P.lie = .55 + .45 * Math.min(1, p); P.armF = -2.9; P.armB = 2.7; P.legF = -.6; P.legB = .4; break;
    case 'fall': { const k = ease(p); P.lie = k; P.armF = lerp(-1, -2.9, k); P.armB = lerp(-.5, 2.8, k); P.legF = -.4 * k; P.legB = .3 * k; break; }
    case 'shoot': P.tilt = 1.0; P.legF = -1.0; P.legB = 1.05; P.bob = 13.9; P.armF = -1.35; P.armB = -1.15; break;
    case 'roll': P.legF = -1.45; P.legB = -1.35; P.bob = 16; P.armF = -2.6; P.armB = -2.4; P.rot = p * TAU; break;
    case 'gtop': P.legF = -1.45; P.legB = -1.35; P.bob = 16; P.tilt = .45; P.armF = -.7 + Math.sin(t * 16) * .55; P.armB = -.9 - Math.sin(t * 16) * .4; break;
    case 'armbar': P.legF = -1.5; P.legB = -1.35; P.bob = 16; P.tilt = -.5; P.armF = -1.05 + Math.sin(t * 9) * .08; P.armB = -.9; break;
    case 'downArm': P.lie = 1; P.armF = -2.3 + Math.sin(t * 18) * .08; P.armB = 2.6 + Math.sin(t * 20) * .3; P.legF = -.3 + Math.sin(t * 14) * .2; P.legB = .3; break;
    case 'chokeA': P.legF = -.9; P.legB = -.8; P.bob = 3; P.tilt = .05; P.armF = -1.7; P.armB = -1.55; break;
    case 'chokeV': P.legF = -1.55; P.legB = -1.5; P.bob = 30; P.tilt = -.2; P.armF = -2.6 + Math.sin(t * 22) * .5; P.armB = -1.8 + Math.cos(t * 20) * .5; break;
    case 'heelA': P.lie = 1; P.legF = -.55; P.legB = -.35; P.armF = -.3; P.armB = -.2; break;
    case 'heelV': P.lie = 1; P.armF = -1.57 + Math.sin(t * 18) * .6; P.armB = 2.6 + Math.cos(t * 16) * .3; P.legF = -.25; P.legB = .2; break;
    case 'triangle': P.lie = 1; P.legF = -1.1; P.legB = -.8; P.armF = -1.3; P.armB = -1.0; break;
    case 'triV': P.legF = -1.45; P.legB = -1.35; P.bob = 16; P.tilt = 1.25; P.armF = -1.6 + Math.sin(t * 20) * .5; P.armB = -1.2 + Math.cos(t * 18) * .4; break;
    case 'bow': P.tilt = .55; P.armF = .15; P.armB = .1; P.legF = -.08; P.legB = .08; break;
    case 'grab': P.armF = -1.25; P.armB = -1.0; P.legF = -.3; P.legB = .3; P.tilt = .06; break;
    case 'knee': { const k = Math.sin(p * Math.PI); P.legF = -1.7 * k; P.armF = -1.3; P.armB = -1.1; P.tilt = .1 + .1 * k; P.bob = -3 * k; break; }
    case 'throw': { const k = ease(p); P.armF = lerp(-1.3, -3.5, k); P.armB = lerp(-1, -3.3, k); P.tilt = lerp(.1, -.5, k); P.legF = -.5; P.legB = .5; break; }
    case 'dash': P.tilt = .45; P.armF = 1.2; P.armB = 1.4; P.legF = -.75; P.legB = .85; P.bob = 2; break;
    case 'sit': P.legF = -1.45; P.legB = -1.35; P.armF = -1.1; P.armB = -.4; P.bob = 16; break;
    case 'flex': P.armF = -1.1 + Math.sin(t * 5) * .1; P.armB = -2.9; P.tilt = -.05; P.legF = -.3; P.legB = .35; break;
  }
  return P;
}

/* ---------------- Nima (hero) — based on the reference sheet ---------------- */
const SKIN = '#e2a684', SKIN_D = '#c3825f', SKIN_L = '#f0bf9f', HAIR = '#211510', BEARD = '#1c120c', BEARD_L = '#3b271a';
const SKINS = {
  normal: { name: 'فلانل چهارخانه', price: 0, shirt: 'plaid', tee: '#f2f1ec', pants: '#4a72a8', pantsD: '#37598a', shoe: '#d9d6cf', sole: '#ffffff', rim: '#29f3ff', cap: true },
  halloween: { name: 'ماسک هالووین', price: 0, shirt: '#2a1640', pants: '#27304d', pantsD: '#1d2440', shoe: '#2a2236', sole: '#ff8a1f', rim: '#ff8a1f', hood: true },
  track: { name: 'ست ورزشی', price: 300, shirt: '#1f2c6b', stripe: '#ffffff', zip: true, pants: '#1f2c6b', pantsD: '#18225a', pstripe: '#ffffff', shoe: '#f4f4f4', sole: '#5dff9b', rim: '#5dff9b', cap: true },
  neon: { name: 'کاپشن نئونی', price: 600, shirt: '#16131f', trim: '#29f3ff', tee: '#ff3fd8', pants: '#1b1b26', pantsD: '#121219', shoe: '#15151c', sole: '#29f3ff', rim: '#ff3fd8', cap: true },
  gold: { name: 'طلایی', price: 1200, shirt: '#d9a92b', shine: true, tee: '#1a1a1a', chain: true, pants: '#22222c', pantsD: '#18181f', shoe: '#f5d36b', sole: '#ffffff', rim: '#ffe14a', cap: true }
};
let PLAID = null;
function plaidPat(c) {
  if (!PLAID) {
    const p = document.createElement('canvas'); p.width = p.height = 24; const x = p.getContext('2d');
    x.fillStyle = '#7e2534'; x.fillRect(0, 0, 24, 24);
    x.fillStyle = 'rgba(30,40,78,.88)'; x.fillRect(0, 8, 24, 8); x.fillRect(8, 0, 8, 24);
    x.fillStyle = 'rgba(16,22,46,.65)'; x.fillRect(8, 8, 8, 8);
    x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(0, 19, 24, 1.4); x.fillRect(19, 0, 1.4, 24);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 3, 24, 1); x.fillRect(3, 0, 1, 24);
    PLAID = p;
  }
  if (!c._plaid) c._plaid = c.createPattern(PLAID, 'repeat');
  return c._plaid;
}
function shirtFill(c, K, dark) {
  if (K.shirt === 'plaid') return plaidPat(c);
  if (K.shine) { const g = c.createLinearGradient(-20, -86, 20, -36); g.addColorStop(0, '#fff1a8'); g.addColorStop(.4, '#e6b53a'); g.addColorStop(1, '#9c6f12'); return g; }
  return dark ? shade(K.shirt, -.3) : K.shirt;
}
function drawWeaponInHand(c, w, glowT) {
  c.lineJoin = 'round';
  if (w === 'bat') {
    c.fillStyle = '#3a2618'; rr(c, -2.6, 18, 5.2, 18, 2.4); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(-3, 34); c.lineTo(-6.5, 82); c.quadraticCurveTo(0, 88, 6.5, 82); c.lineTo(3, 34); c.closePath();
    const g = c.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#b97a3b'); g.addColorStop(.45, '#f0c07a'); g.addColorStop(1, '#a0652e');
    c.fillStyle = g; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.beginPath(); c.moveTo(-4.6, 52); c.lineTo(4.6, 52); c.moveTo(-5.2, 60); c.lineTo(5.2, 60); neon(c, '#ff3fd8', 2.4);
  } else if (w === 'pipe') {
    c.fillStyle = '#5b6680'; rr(c, -4, 14, 8, 10, 2); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(0, 24); c.lineTo(0, 86); c.lineCap = 'round';
    c.globalCompositeOperation = 'lighter'; neon(c, '#29f3ff', 5.5); c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#5b6680'; rr(c, -4.5, 84, 9, 9, 2); c.fill(); c.strokeStyle = OUT; c.stroke();
  } else if (w === 'gun') {
    c.fillStyle = '#2b2f45'; rr(c, -12, 20, 10, 9, 3); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#7c4dff'; rr(c, -6, 14, 15, 36, 6); c.fill(); c.stroke();
    c.fillStyle = '#3b2c7a'; rr(c, -1, 48, 7, 12, 3); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(4, 20); c.lineTo(4, 44); c.globalCompositeOperation = 'lighter'; neon(c, '#b6ff4a', 3); c.globalCompositeOperation = 'source-over';
    glowDot(c, 2.5, 60, 9 + Math.sin(glowT * 20) * 2, '#b6ff4a', .7);
  } else if (w === 'skate') {
    c.fillStyle = '#16301f'; rr(c, -7, 14, 14, 78, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.beginPath(); rr(c, -7, 14, 14, 78, 7); c.globalCompositeOperation = 'lighter'; neon(c, '#5dff9b', 1.8, false); c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#ff3fd8'; c.beginPath(); c.moveTo(0, 40); c.lineTo(4, 52); c.lineTo(-4, 52); c.closePath(); c.fill();
    for (const wy of [26, 80]) { c.fillStyle = '#cfd6ff'; circ(c, -9, wy - 4, 3.6); c.fill(); circ(c, -9, wy + 4, 3.6); c.fill(); }
  } else if (w === 'chair') {
    c.strokeStyle = '#ffb340'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-12, 18); c.lineTo(-12, 86); c.moveTo(12, 18); c.lineTo(12, 86); c.moveTo(-12, 74); c.lineTo(12, 74); c.stroke();
    c.fillStyle = '#c4462f'; rr(c, -14, 16, 28, 26, 4); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#e0563a'; rr(c, -16, 50, 32, 8, 3); c.fill(); c.stroke();
  } else if (w === 'sign') {
    c.fillStyle = '#555c78'; rr(c, -2.5, 14, 5, 16, 2); c.fill();
    c.fillStyle = '#100822'; rr(c, -22, 28, 44, 64, 6); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.beginPath(); rr(c, -18, 32, 36, 56, 5); c.globalCompositeOperation = 'lighter'; neon(c, '#ff3fd8', 2); c.globalCompositeOperation = 'source-over';
    c.save(); c.translate(0, 60); c.rotate(Math.PI / 2); c.font = '17px Lalezar, Vazirmatn, Tahoma, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#29f3ff'; c.fillText('باز است', 0, 0); c.restore();
  } else if (w === 'hammer') {
    c.fillStyle = '#4a2f1c'; rr(c, -3, 14, 6, 60, 3); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    const g = c.createLinearGradient(-20, 70, 20, 94); g.addColorStop(0, '#fff3b0'); g.addColorStop(.5, '#ffcc33'); g.addColorStop(1, '#a87612');
    c.fillStyle = g; rr(c, -20, 68, 40, 26, 6); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 81, 30 + Math.sin(glowT * 8) * 4, '#ffd23a', .55); c.restore();
    c.fillStyle = '#fff'; c.globalAlpha = .8; star(c, 8, 76, 4, '#ffffff'); c.globalAlpha = 1;
  }
}
/* mood: smile | happy | angry | hurt | wink | confused | blink */
function drawNima(c, x, y, dir, P, look, weapon, s, t, mood) {
  s = s || 1; t = t || 0;
  const K = SKINS[look.skin] || SKINS.normal;
  c.save(); c.translate(x, y); c.scale(dir * s * (P.spin || 1), s);
  if (P.lie) { c.translate(0, -10 * P.lie); c.rotate(-Math.PI / 2 * P.lie); }
  c.translate(0, P.bob);
  if (P.rot) { c.translate(0, -55); c.rotate(P.rot); c.translate(0, 55); }
  c.lineJoin = 'round'; c.lineCap = 'round';
  const hipY = -34;
  const tiltGroup = fn => { c.save(); c.translate(0, hipY); c.rotate(P.tilt); c.translate(0, -hipY); fn(); c.restore(); };
  const leg = (xx, a, col) => {
    limb(c, xx, hipY, a, 28, 15, col, 0, 0, OUT);
    c.save(); c.translate(xx, hipY); c.rotate(a);
    if (K.pstripe) { c.strokeStyle = K.pstripe; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, 0); c.lineTo(-5, 26); c.stroke(); }
    c.fillStyle = K.shoe; ell(c, 4, 30, 12, 7, 0); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.fillStyle = K.sole; rr(c, -7, 32, 23, 4, 2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(2, 26); c.lineTo(8, 27); c.stroke();
    c.restore();
  };
  const sleeve = (dark) => shirtFill(c, K, dark);
  // back arm (sleeve + hand)
  tiltGroup(() => {
    c.save(); c.translate(-3, -70); c.rotate(P.armB);
    c.fillStyle = sleeve(true); rr(c, -6.5, -6.5, 13, 30, 6.5); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.3; c.stroke();
    c.fillStyle = SKIN_D; circ(c, 0, 27, 6.8); c.fill(); c.stroke();
    c.restore();
  });
  leg(-4, P.legB, K.pantsD);
  leg(5, P.legF, K.pants);
  tiltGroup(() => {
    // hips / belt
    c.fillStyle = K.pants; rr(c, -19, -47, 40, 16, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    // torso: a bit chubby, like the reference
    const torso = () => { c.beginPath(); c.moveTo(-15, -84); c.quadraticCurveTo(-26, -63, -21, -37); c.quadraticCurveTo(1, -29, 24, -37); c.quadraticCurveTo(30, -63, 17, -84); c.quadraticCurveTo(1, -90, -15, -84); c.closePath(); };
    torso(); c.fillStyle = shirtFill(c, K); c.fill();
    c.save(); torso(); c.clip();
    if (K.tee) { // open shirt shows the tee at the front
      c.fillStyle = K.tee; c.beginPath(); c.moveTo(7, -90); c.lineTo(19, -90); c.lineTo(29, -62); c.lineTo(26, -34); c.lineTo(9, -32); c.quadraticCurveTo(5, -60, 7, -90); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(8, -86); c.quadraticCurveTo(6, -60, 9, -33); c.stroke();
    }
    if (K.stripe) { c.fillStyle = K.stripe; c.fillRect(-22, -70, 50, 3); c.fillRect(-22, -64, 50, 2); }
    if (K.zip) { c.strokeStyle = '#d7dcff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(13, -86); c.lineTo(15, -34); c.stroke(); }
    if (K.trim) { c.beginPath(); c.moveTo(-22, -40); c.quadraticCurveTo(1, -32, 26, -40); c.moveTo(8, -88); c.quadraticCurveTo(6, -60, 9, -33); c.globalCompositeOperation = 'lighter'; neon(c, K.trim, 1.6, false); c.globalCompositeOperation = 'source-over'; }
    if (K.shine) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-14 + ((t * 40) % 60), -90, 6, 60); }
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-26, -46, 60, 12);
    c.restore();
    torso(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    if (K.shirt === 'plaid') { // collar + pocket
      c.fillStyle = plaidPat(c); c.beginPath(); c.moveTo(2, -88); c.lineTo(10, -76); c.lineTo(7, -88); c.closePath(); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.4; rr(c, -12, -74, 11, 10, 2); c.stroke();
      c.fillStyle = '#e8e2d2'; circ(c, 5.5, -70, 1.2); c.fill(); circ(c, 5, -58, 1.2); c.fill();
    }
    if (K.chain) { c.strokeStyle = '#ffe14a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-4, -84); c.quadraticCurveTo(10, -62, 22, -82); c.stroke(); c.fillStyle = '#ffe14a'; circ(c, 9, -66, 3.6); c.fill(); }
    if (K.hood) { c.strokeStyle = '#ff8a1f'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(6, -80); c.lineTo(5, -64); c.moveTo(13, -80); c.lineTo(14, -65); c.stroke(); c.fillStyle = '#ff8a1f'; circ(c, 5, -63, 2); c.fill(); circ(c, 14, -64, 2); c.fill(); }
    // neon rim light on the back edge
    c.save(); c.beginPath(); c.moveTo(-16, -80); c.quadraticCurveTo(-25, -62, -20.5, -42); c.globalAlpha = .7; neon(c, K.rim, 1.6, false); c.restore();
    drawNimaHead(c, look, t, mood);
    // front arm + weapon
    c.save(); c.translate(3, -70); c.rotate(P.armF);
    if (weapon) drawWeaponInHand(c, weapon, t);
    c.fillStyle = shirtFill(c, K); rr(c, -7, -7, 14, 31, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    if (K.shirt === 'plaid') { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, 19); c.lineTo(6, 19); c.stroke(); }
    if (K.stripe) { c.strokeStyle = K.stripe; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -4); c.lineTo(-4, 20); c.stroke(); }
    if (K.trim) { c.beginPath(); c.moveTo(-6, 20); c.lineTo(6, 20); c.globalCompositeOperation = 'lighter'; neon(c, K.trim, 1.4, false); c.globalCompositeOperation = 'source-over'; }
    c.fillStyle = SKIN; circ(c, 0, 27, 7.2); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.restore();
  });
  c.restore();
}
function drawNimaHead(c, look, t, mood) {
  const K = SKINS[look.skin] || SKINS.normal;
  const long = look.beard === 'long';
  const hx = 5, hy = -102;
  mood = mood || 'smile';
  if (mood === 'smile' && (t % 3.7) < .12) mood = 'blink';
  if (K.hood) {
    c.fillStyle = '#2a1640'; circ(c, hx - 2, hy - 1, 33); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    c.save(); c.beginPath(); c.arc(hx - 2, hy - 1, 33, Math.PI * .62, Math.PI * 1.55); neon(c, '#ff8a1f', 1.6, false); c.restore();
  } else {
    // short dark hair at the back / sides
    c.fillStyle = HAIR; ell(c, hx - 10, hy + 1, 21, 22); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
  }
  // face (round, full cheeks)
  c.fillStyle = K.hood ? '#160b22' : SKIN; ell(c, hx + 1, hy, 26.5, 27.5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  if (!K.hood) {
    c.fillStyle = SKIN_L; ell(c, hx + 12, hy - 10, 9, 6, -.3); c.globalAlpha = .45; c.fill(); c.globalAlpha = 1;
    // ear
    c.fillStyle = SKIN; ell(c, hx - 15, hy + 1, 6.5, 8.5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.strokeStyle = SKIN_D; c.lineWidth = 1.8; c.beginPath(); c.arc(hx - 15, hy + 1, 3.6, -1.2, 1.6); c.stroke();
    // side hair (short fade) above the ear
    c.fillStyle = HAIR; c.beginPath(); c.moveTo(hx - 21, hy - 14); c.quadraticCurveTo(hx - 12, hy - 18, hx - 7, hy - 12); c.lineTo(hx - 8, hy - 5); c.quadraticCurveTo(hx - 15, hy - 8, hx - 21, hy - 6); c.closePath(); c.fill();
  }
  // beard — full and thick
  const chin = long ? 54 : 36;
  c.beginPath(); c.moveTo(hx - 10, hy - 7);
  c.quadraticCurveTo(hx - 17, hy + 12, hx - 12, hy + 22);
  c.quadraticCurveTo(hx - 4, hy + chin - 4, hx + 10, hy + chin);
  c.quadraticCurveTo(hx + 24, hy + chin - 6, hx + 27, hy + 18);
  c.quadraticCurveTo(hx + 30, hy + 10, hx + 27.5, hy + 4);
  c.lineTo(hx + 22, hy + 6);
  c.quadraticCurveTo(hx + 12, hy + 12, hx + 2, hy + 7);
  c.quadraticCurveTo(hx - 5, hy + 3, hx - 5, hy - 7);
  c.closePath(); c.fillStyle = BEARD; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
  c.strokeStyle = BEARD_L; c.lineWidth = 1.3; c.beginPath();
  for (let i = 0; i < (long ? 9 : 7); i++) { const bx = hx - 9 + i * 4.4, by = hy + 12 + (i % 2) * 3; c.moveTo(bx, by); c.quadraticCurveTo(bx + 2, by + 6, bx + 1, hy + chin - 8 + (i % 3) * 2); }
  c.stroke();
  if (K.hood) { // original mask design: neon bolts + glowing eyes
    c.save(); c.translate(hx + 10, hy - 4); c.rotate(.06);
    c.fillStyle = '#f3efe6'; ell(c, 0, 0, 18, 23); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    c.fillStyle = 'rgba(0,0,0,.08)'; ell(c, -4, 4, 13, 17); c.fill();
    c.beginPath(); c.moveTo(-9, -21); c.lineTo(-3, -12); c.lineTo(-8, -9); c.lineTo(-1, 2);
    c.moveTo(13, -16); c.lineTo(8, -8); c.lineTo(12, -6); c.lineTo(6, 4);
    c.globalCompositeOperation = 'lighter'; neon(c, '#ff8a1f', 1.8); c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#1a0d06'; ell(c, -5, -2, 4.6, 3.4, -.25); c.fill(); ell(c, 9, -2, 4.6, 3.4, .25); c.fill();
    const col = mood === 'angry' ? '#ff3a3a' : '#ff8a1f', fl = .75 + Math.sin(t * 7) * .25;
    glowDot(c, -5, -2, 9, col, fl); glowDot(c, 9, -2, 9, col, fl);
    c.fillStyle = '#ffd08a'; circ(c, -5, -2, 1.6); c.fill(); circ(c, 9, -2, 1.6); c.fill();
    c.strokeStyle = 'rgba(40,20,10,.55)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-2, 13); c.quadraticCurveTo(3, 16, 8, 13); c.stroke();
    c.restore();
    return;
  }
  // nose (prominent, rounded)
  c.fillStyle = SKIN_D; c.beginPath(); c.moveTo(hx + 19, hy - 6); c.quadraticCurveTo(hx + 30, hy + 2, hx + 27, hy + 7); c.quadraticCurveTo(hx + 22, hy + 9, hx + 18, hy + 5); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,225,200,.6)'; circ(c, hx + 25, hy + 1, 1.6); c.fill();
  // mouth under the mustache
  if (mood === 'happy' || mood === 'hurt' || mood === 'angry') {
    c.fillStyle = '#5a1e1e'; c.beginPath();
    if (mood === 'happy') { c.moveTo(hx + 9, hy + 14); c.quadraticCurveTo(hx + 17, hy + 26, hx + 26, hy + 14); c.closePath(); }
    else if (mood === 'hurt') { ell(c, hx + 17, hy + 18, 5, 4.4); }
    else { rr(c, hx + 9, hy + 14, 16, 6, 2); }
    c.fill();
    c.fillStyle = '#fff'; if (mood === 'happy') { c.fillRect(hx + 11, hy + 14, 13, 3); } else if (mood === 'angry') { c.fillRect(hx + 10, hy + 15, 14, 4); c.strokeStyle = '#5a1e1e'; c.lineWidth = 1; c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(hx + 10 + i * 3.5, hy + 15); c.lineTo(hx + 10 + i * 3.5, hy + 19); } c.stroke(); }
  } else if (mood === 'confused') {
    c.fillStyle = '#5a1e1e'; ell(c, hx + 17, hy + 17, 2.6, 3); c.fill();
  } else {
    c.strokeStyle = '#c96f5f'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx + 10, hy + 16); c.quadraticCurveTo(hx + 17, hy + 20, hx + 24, hy + 15.5); c.stroke();
  }
  // thick mustache
  c.beginPath(); c.moveTo(hx + 4, hy + 13); c.quadraticCurveTo(hx + 10, hy + 6, hx + 18, hy + 8); c.quadraticCurveTo(hx + 25, hy + 6, hx + 29, hy + 12);
  c.quadraticCurveTo(hx + 20, hy + 14, hx + 4, hy + 13); c.closePath(); c.fillStyle = BEARD; c.fill();
  // cheek blush
  c.fillStyle = 'rgba(255,120,110,.22)'; ell(c, hx + 25, hy - 2, 4, 3); c.fill();
  // eyes (brown, slightly hooded like the reference)
  const eyes = [hx + 6, hx + 18];
  eyes.forEach((ex, i) => {
    const closed = mood === 'happy' || mood === 'blink' || (mood === 'wink' && i === 1) || mood === 'hurt';
    if (closed) {
      c.strokeStyle = OUT; c.lineWidth = 2.6; c.beginPath();
      if (mood === 'hurt') { c.moveTo(ex - 4, hy - 7); c.lineTo(ex + 3, hy - 4); c.lineTo(ex - 4, hy - 1); }
      else if (mood === 'blink') { c.moveTo(ex - 4.5, hy - 4); c.lineTo(ex + 4.5, hy - 4); }
      else { c.moveTo(ex - 4.5, hy - 3); c.quadraticCurveTo(ex, hy - 9, ex + 4.5, hy - 3); }
      c.stroke(); return;
    }
    const sq = mood === 'angry' ? .7 : 1;
    c.fillStyle = '#fff'; ell(c, ex, hy - 4, 4.8, 4.2 * sq); c.fill();
    c.fillStyle = '#4a2c18'; ell(c, ex + 1.2, hy - 3.6, 3.2, 3.5 * sq); c.fill();
    c.fillStyle = '#140a05'; circ(c, ex + 1.4, hy - 3.6, 1.5); c.fill();
    c.fillStyle = '#fff'; circ(c, ex + 2.3, hy - 5, 1.1); c.fill();
    c.strokeStyle = OUT; c.lineWidth = 2.4; c.beginPath(); c.moveTo(ex - 5, hy - 5.5 + (sq < 1 ? 1.5 : 0)); c.quadraticCurveTo(ex, hy - 9.5 + (sq < 1 ? 3 : 0), ex + 5.2, hy - 5.5); c.stroke();
    c.strokeStyle = 'rgba(140,70,45,.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex - 4, hy + 1); c.quadraticCurveTo(ex, hy + 2.5, ex + 4, hy + .8); c.stroke();
  });
  // thick eyebrows
  c.strokeStyle = HAIR; c.lineWidth = 4.2; c.lineCap = 'round';
  const br = mood === 'angry' ? [[hx + 1, hy - 15], [hx + 10, hy - 11]] : mood === 'confused' ? [[hx + 1, hy - 17], [hx + 10, hy - 19]] : [[hx + 1, hy - 13], [hx + 10, hy - 15]];
  c.beginPath(); c.moveTo(br[0][0], br[0][1]); c.lineTo(br[1][0], br[1][1]); c.stroke();
  const br2 = mood === 'angry' ? [[hx + 14, hy - 11], [hx + 24, hy - 14]] : [[hx + 14, hy - 15], [hx + 24, hy - 13]];
  c.beginPath(); c.moveTo(br2[0][0], br2[0][1]); c.lineTo(br2[1][0], br2[1][1]); c.stroke();
  // backwards cap: washed tan with leather strap + brass buckle at the front
  const cap = look.cap, capD = shade(cap, -.28), capL = shade(cap, .22);
  c.beginPath(); c.moveTo(hx - 19, hy - 13); c.quadraticCurveTo(hx - 41, hy - 18, hx - 49, hy - 6); c.quadraticCurveTo(hx - 36, hy - 2, hx - 17, hy - 6); c.closePath();
  c.fillStyle = capD; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 21, hy - 10); c.quadraticCurveTo(hx - 38, hy - 13, hx - 45, hy - 7); c.stroke();
  c.beginPath(); c.moveTo(hx - 25, hy - 6); c.bezierCurveTo(hx - 24, hy - 39, hx + 29, hy - 41, hx + 28, hy - 9);
  c.quadraticCurveTo(hx + 2, hy - 15, hx - 25, hy - 6); c.closePath();
  c.fillStyle = cap; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.strokeStyle = capL; c.lineWidth = 3; c.beginPath(); c.moveTo(hx - 16, hy - 22); c.quadraticCurveTo(hx - 8, hy - 32, hx + 4, hy - 33); c.stroke();
  c.strokeStyle = capD; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx + 1, hy - 35); c.quadraticCurveTo(hx - 3, hy - 20, hx - 3, hy - 11); c.moveTo(hx + 1, hy - 35); c.quadraticCurveTo(hx + 12, hy - 22, hx + 14, hy - 12); c.stroke();
  c.fillStyle = capD; circ(c, hx + 1, hy - 35, 2.3); c.fill();
  c.beginPath(); c.moveTo(hx + 11, hy - 12); c.quadraticCurveTo(hx + 19, hy - 28, hx + 27, hy - 12); c.closePath(); c.fillStyle = HAIR; c.fill();
  c.fillStyle = '#6b4528'; rr(c, hx + 9, hy - 16, 19, 6, 2); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#d4ab52'; rr(c, hx + 15, hy - 17, 6, 8, 1.5); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,240,200,.5)'; c.lineWidth = .8; c.beginPath(); c.moveTo(hx + 10, hy - 13); c.lineTo(hx + 14, hy - 13); c.moveTo(hx + 22, hy - 13); c.lineTo(hx + 27, hy - 13); c.stroke();
}
function nimaMood(h) {
  if (!h) return 'smile';
  if (h.state === 'hurt' || h.state === 'down' || h.state === 'dead') return 'hurt';
  if (h.state === 'victory' || h.state === 'pick') return 'happy';
  if (h.n2T > 0 || h.state === 'special') return 'angry';
  if (h.state === 'atk' || h.state === 'grab' || h.state === 'throw' || h.state === 'dash' || h.state === 'jkick') return 'angry';
  if (h.happyT > 0) return 'happy';
  return 'smile';
}

/* ---------------- generic neon thug ---------------- */
function drawThug(c, x, y, dir, P, k, s, t) {
  // k: {skin, body, pants, rim, w, head(c,t,k)}
  s = s || 1; const w = k.w || 1;
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  if (P.lie) { c.translate(0, -10 * P.lie); c.rotate(-Math.PI / 2 * P.lie); }
  c.translate(0, P.bob); c.lineJoin = 'round'; c.lineCap = 'round';
  const hipY = -34;
  const tg = fn => { c.save(); c.translate(0, hipY); c.rotate(P.tilt); c.translate(0, -hipY); fn(); c.restore(); };
  tg(() => limb(c, -2, -68, P.armB, 25, 12 * w, shade(k.body, -.25), 7.5 * w, shade(k.skin, -.2), OUT));
  for (const [xx, a, col] of [[-4, P.legB, shade(k.pants, -.25)], [5, P.legF, k.pants]]) {
    limb(c, xx, hipY, a, 28, 14 * w, col, 0, 0, OUT);
    c.save(); c.translate(xx, hipY); c.rotate(a); c.fillStyle = '#1b1830'; ell(c, 4, 30, 11 * w, 6.5, 0); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(); c.restore();
  }
  tg(() => {
    c.beginPath(); c.moveTo(-15 * w, -84); c.quadraticCurveTo(-25 * w, -60, -19 * w, -36); c.quadraticCurveTo(0, -30, 21 * w, -36);
    c.quadraticCurveTo(27 * w, -60, 16 * w, -84); c.quadraticCurveTo(0, -90, -15 * w, -84); c.closePath();
    c.fillStyle = k.body; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .8; neon(c, k.rim, 1.4, false); c.restore();
    if (k.chest) k.chest(c, t, w);
    k.head(c, t, k);
    limb(c, 3, -68, P.armF, 25, 12 * w, k.body, 7.5 * w, k.skin, OUT);
  });
  c.restore();
}
const angryEyes = (c, x1, x2, y, col) => {
  c.fillStyle = '#fff'; ell(c, x1, y, 4, 4.4); c.fill(); ell(c, x2, y, 4, 4.4); c.fill();
  c.fillStyle = col || '#1a1030'; circ(c, x1 + 1.2, y + .8, 2.4); c.fill(); circ(c, x2 + 1.2, y + .8, 2.4); c.fill();
  c.strokeStyle = OUT; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x1 - 5, y - 7); c.lineTo(x1 + 4, y - 4); c.moveTo(x2 - 4, y - 4.5); c.lineTo(x2 + 5, y - 7.5); c.stroke();
};
const PUNK = {
  skin: '#f0bf98', body: '#1f1a3d', pants: '#2b2350', rim: '#ff3fd8',
  head(c, t) {
    const hx = 4, hy = -104;
    c.fillStyle = this.skin; circ(c, hx, hy, 23); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    // mohawk
    c.beginPath(); c.moveTo(hx - 18, hy - 12);
    for (let i = 0; i < 5; i++) { const a = -2.5 + i * .3; c.lineTo(hx + Math.cos(a) * 36, hy + Math.sin(a) * 36); c.lineTo(hx + Math.cos(a + .15) * 22, hy + Math.sin(a + .15) * 22); }
    c.closePath(); c.fillStyle = '#ff3fd8'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; neon(c, '#ff3fd8', 1.5, false); c.restore();
    // visor
    c.fillStyle = '#16123a'; rr(c, hx - 2, hy - 10, 28, 10, 5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(hx + 1, hy - 5); c.lineTo(hx + 23, hy - 5); c.globalCompositeOperation = 'lighter'; neon(c, '#29f3ff', 2); c.globalCompositeOperation = 'source-over';
    c.strokeStyle = OUT; c.lineWidth = 2.4; c.beginPath(); c.moveTo(hx + 10, hy + 12); c.quadraticCurveTo(hx + 16, hy + 9, hx + 21, hy + 12); c.stroke();
    c.fillStyle = 'rgba(255,90,120,.3)'; ell(c, hx + 20, hy + 4, 4, 3); c.fill();
  }
};
const BRUTE = {
  skin: '#b88063', body: '#13283a', pants: '#1c2b3f', rim: '#5dff9b', w: 1.45,
  chest(c, t, w) { c.fillStyle = '#5dff9b'; c.globalAlpha = .9; rr(c, -9, -66, 22, 5, 2.5); c.fill(); c.globalAlpha = 1; },
  head(c, t) {
    const hx = 4, hy = -100;
    c.fillStyle = this.skin; rr(c, hx - 22, hy - 24, 46, 46, 18); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    c.fillStyle = '#20161a'; rr(c, hx - 12, hy + 8, 34, 15, 7); c.fill();
    c.fillStyle = '#0f2b2a'; rr(c, hx - 4, hy - 9, 30, 11, 5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(hx, hy - 3.5); c.lineTo(hx + 22, hy - 3.5); c.globalCompositeOperation = 'lighter'; neon(c, '#5dff9b', 2.4); c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#2a3a4a'; circ(c, hx - 18, hy - 2, 8); c.fill(); c.strokeStyle = OUT; c.stroke();
    c.beginPath(); c.arc(hx, hy - 6, 26, Math.PI * 1.08, Math.PI * 1.85); c.strokeStyle = '#2a3a4a'; c.lineWidth = 4; c.stroke();
  }
};
const KING1 = {
  skin: '#c88b68', body: '#3a1257', pants: '#24103a', rim: '#ffe14a', w: 1.55,
  chest(c, t, w) {
    c.beginPath(); c.moveTo(-14, -82); c.quadraticCurveTo(4, -60, 20, -82); c.strokeStyle = '#ffe14a'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#ffe14a'; circ(c, 4, -67, 5); c.fill();
  },
  head(c, t) {
    const hx = 4, hy = -104;
    c.fillStyle = this.skin; rr(c, hx - 24, hy - 24, 50, 48, 20); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.8; c.stroke();
    // neon crown hair
    c.beginPath(); c.moveTo(hx - 20, hy - 18); c.lineTo(hx - 16, hy - 42); c.lineTo(hx - 6, hy - 26); c.lineTo(hx + 4, hy - 48); c.lineTo(hx + 12, hy - 26); c.lineTo(hx + 22, hy - 42); c.lineTo(hx + 24, hy - 18); c.closePath();
    c.fillStyle = '#ffd23a'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; neon(c, '#ffe14a', 1.6, false); c.restore();
    angryEyes(c, hx + 6, hx + 19, hy - 3, '#7a1010');
    c.fillStyle = '#2a1410'; rr(c, hx - 4, hy + 8, 30, 16, 7); c.fill();
    c.fillStyle = '#fff'; rr(c, hx + 4, hy + 10, 14, 5, 2); c.fill();
  }
};
function drawPunk(c, e, x, y, P, t) { drawThug(c, x, y, e.dir, P, PUNK, 1, t); }
function drawBrute(c, e, x, y, P, t) { drawThug(c, x, y, e.dir, P, BRUTE, 1.08, t); }
function drawKing1(c, e, x, y, P, t) { drawThug(c, x, y, e.dir, P, KING1, 1.45, t); }

function drawBot(c, e, x, y, P, t) {
  c.save(); c.translate(x, y); c.scale(e.dir, 1);
  if (P.lie) { c.translate(0, -8); c.rotate(-Math.PI / 2 * P.lie); }
  const roll = e.state === 'atk' ? t * 30 : t * 10 * (e.moving ? 1 : 0);
  // wheel
  c.fillStyle = '#1b1d30'; circ(c, 0, -12, 12); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
  c.strokeStyle = '#29f3ff'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 3; i++) { const a = roll + i * 2.09; c.moveTo(0, -12); c.lineTo(Math.cos(a) * 9, -12 + Math.sin(a) * 9); } c.stroke();
  const by = -44 + Math.sin(t * 9) * 2 + P.bob * .5;
  c.save(); c.translate(0, by); c.rotate(e.state === 'windup' ? -.25 : e.state === 'atk' ? .3 : 0);
  c.fillStyle = '#2c3052'; circ(c, 0, 0, 25); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .7; neon(c, '#29f3ff', 1.4, false); c.restore();
  c.fillStyle = '#0a1024'; rr(c, -6, -13, 28, 22, 8); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
  c.strokeStyle = e.state === 'windup' ? '#ff3fd8' : '#29f3ff'; c.lineWidth = 2.6;
  c.beginPath(); c.moveTo(0, -6); c.lineTo(5, -2); c.lineTo(0, 2); c.moveTo(16, -6); c.lineTo(11, -2); c.lineTo(16, 2); c.stroke();
  c.strokeStyle = '#8a90c0'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -24); c.lineTo(-10, -38); c.stroke();
  glowDot(c, -10, -39, 8, Math.sin(t * 8) > 0 ? '#ff3fd8' : '#29f3ff', .9);
  c.restore(); c.restore();
}
function drawGlitch(c, e, x, y, P, t) {
  c.save(); c.translate(x, y - 8 + Math.sin(t * 5) * 4); c.scale(e.dir, 1);
  if (P.lie) c.rotate(-Math.PI / 2 * P.lie);
  const a = e.alpha == null ? 1 : e.alpha;
  const shape = (ox, col, al) => {
    c.globalAlpha = al * a;
    c.beginPath(); c.moveTo(-22 + ox, -10); c.bezierCurveTo(-26 + ox, -80, 30 + ox, -80, 24 + ox, -10);
    for (let i = 0; i < 4; i++) { const xx = 24 + ox - (i + 1) * 11.5; c.quadraticCurveTo(xx + 6, 2 + Math.sin(t * 9 + i) * 5, xx, -10); }
    c.closePath(); c.fillStyle = col; c.fill();
  };
  c.globalCompositeOperation = 'lighter';
  shape(-3, '#ff2a6a', .45); shape(3, '#22e8ff', .45);
  c.globalCompositeOperation = 'source-over';
  shape(0, '#6a2bd9', .9);
  c.globalAlpha = a; c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
  const arm = e.state === 'atk' ? -1.5 : e.state === 'windup' ? .9 : .2 + Math.sin(t * 6) * .2;
  limb(c, 6, -36, arm, 22, 9, '#7c3bf0', 6, '#b48bff', OUT);
  c.fillStyle = '#fff'; ell(c, 4, -50, 5, 6); c.fill(); ell(c, 16, -50, 5, 6); c.fill();
  c.fillStyle = '#1a0838'; circ(c, 6, -49, 2.6); c.fill(); circ(c, 18, -49, 2.6); c.fill();
  if (Math.random() < .12) { c.fillStyle = 'rgba(41,243,255,.7)'; c.fillRect(-24, -60 + Math.random() * 50, 50, 3); }
  c.globalAlpha = 1; c.restore();
}
function drawDrone(c, e, x, y, P, t) {
  c.save(); c.translate(x, y); c.scale(e.dir, 1);
  if (P.lie) c.rotate(-Math.PI / 2 * P.lie);
  c.strokeStyle = '#8a90c0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-26, -6); c.lineTo(26, -6); c.stroke();
  for (const px of [-28, 28]) { c.fillStyle = 'rgba(180,220,255,.35)'; ell(c, px, -10, 16 * Math.abs(Math.sin(t * 40)) + 3, 3); c.fill(); }
  c.fillStyle = '#2a2f55'; ell(c, 0, 0, 24, 16); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .7; neon(c, '#b48bff', 1.4, false); c.restore();
  c.fillStyle = '#10051e'; circ(c, 8, 1, 9); c.fill();
  const ch = e.state === 'windup' ? '#ffffff' : '#ff3fd8';
  glowDot(c, 9, 1, 14, '#ff3fd8', .9); c.fillStyle = ch; circ(c, 9, 1, 3.4); c.fill();
  c.restore();
}
function drawArcadeBoss(c, e, x, y, P, t) {
  c.save(); c.translate(x, y); c.scale(e.dir, 1);
  if (P.lie) { c.rotate(-Math.PI / 2 * P.lie * .3); }
  const s = 1.15; c.scale(s, s);
  // treads
  c.fillStyle = '#1a1830'; rr(c, -52, -26, 104, 26, 13); c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#3b3760'; for (let i = 0; i < 6; i++) { circ(c, -40 + i * 16, -13, 7); c.fill(); }
  const bob = Math.sin(t * 6) * 2 + (e.state === 'windup' ? 4 : 0);
  c.translate(0, bob);
  // back arm
  const armA = e.armB != null ? e.armB : .3;
  limb(c, -30, -120, armA, 46, 18, '#3b2c7a', 15, '#ffe14a', OUT);
  // cabinet body
  c.beginPath(); c.moveTo(-40, -26); c.lineTo(-44, -150); c.lineTo(-30, -176); c.lineTo(38, -176); c.lineTo(46, -150); c.lineTo(42, -26); c.closePath();
  const g = c.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#2a1458'); g.addColorStop(1, '#4a1d8a');
  c.fillStyle = g; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .8; neon(c, '#ffe14a', 1.6, false); c.restore();
  // marquee
  c.fillStyle = '#ff3fd8'; rr(c, -30, -174, 66, 18, 4); c.fill();
  c.font = '13px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText('ARC', 3, -164);
  // screen face
  c.fillStyle = '#071226'; rr(c, -28, -150, 60, 48, 6); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke();
  const mood = e.state === 'windup' || e.state === 'atk' ? 1 : 0;
  c.fillStyle = mood ? '#ff3fd8' : '#29f3ff';
  const px = (gx, gy) => c.fillRect(-24 + gx * 4, -146 + gy * 4, 3.4, 3.4);
  const eyes = mood ? [[2, 3], [3, 4], [4, 5], [10, 5], [11, 4], [12, 3]] : [[3, 3], [3, 4], [3, 5], [11, 3], [11, 4], [11, 5]];
  eyes.forEach(p => px(p[0], p[1]));
  const mouth = mood ? [[4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [4, 9], [10, 9]] : [[5, 8], [6, 9], [7, 9], [8, 9], [9, 8]];
  mouth.forEach(p => px(p[0], p[1]));
  c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 12; i++) c.fillRect(-28, -150 + i * 4, 60, 1.4);
  // control panel
  c.fillStyle = '#1b0f3a'; c.beginPath(); c.moveTo(-40, -96); c.lineTo(44, -96); c.lineTo(48, -80); c.lineTo(-44, -80); c.closePath(); c.fill(); c.strokeStyle = OUT; c.stroke();
  c.strokeStyle = '#ccc'; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -92); c.lineTo(-23, -104); c.stroke(); c.fillStyle = '#ff3a3a'; circ(c, -23, -106, 5); c.fill();
  ['#29f3ff', '#ffe14a', '#5dff9b'].forEach((col, i) => { c.fillStyle = col; circ(c, 6 + i * 11, -88, 4); c.fill(); });
  c.fillStyle = '#ffe14a'; c.globalAlpha = .7 + Math.sin(t * 6) * .3; rr(c, -12, -60, 26, 6, 3); c.fill(); c.globalAlpha = 1;
  // front arm
  const arm = e.armF != null ? e.armF : .2, ext = e.ext || 0;
  limb(c, 28, -120, arm, 46 + ext, 18, '#4a37a0', 16, '#ffe14a', OUT);
  c.restore();
}
function drawNeonKing(c, e, x, y, P, t) {
  c.save(); c.translate(x, y - 26 + Math.sin(t * 2.6) * 6); c.scale(e.dir, 1);
  if (P.lie) c.rotate(-Math.PI / 2 * P.lie * .5);
  c.globalAlpha = e.alpha == null ? 1 : e.alpha;
  const s = 1.3; c.scale(s, s);
  // cape
  c.beginPath(); c.moveTo(-14, -98);
  c.bezierCurveTo(-44, -60, -52 + Math.sin(t * 3) * 6, -20, -40 + Math.sin(t * 4) * 8, 6);
  c.quadraticCurveTo(-10, -2 + Math.sin(t * 5) * 4, 22, 6);
  c.bezierCurveTo(24, -30, 22, -70, 14, -98); c.closePath();
  const g = c.createLinearGradient(0, -100, 0, 10); g.addColorStop(0, '#3a0d6a'); g.addColorStop(1, '#0d0526');
  c.fillStyle = g; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= .8; neon(c, '#b48bff', 1.5, false); c.restore();
  // body
  c.fillStyle = '#16102e'; rr(c, -14, -98, 30, 56, 12); c.fill(); c.strokeStyle = OUT; c.stroke();
  c.beginPath(); c.moveTo(1, -94); c.lineTo(1, -46); c.globalCompositeOperation = 'lighter'; neon(c, '#ff3fd8', 2); c.globalCompositeOperation = 'source-over';
  // floating hands
  const hf = e.handF || 0;
  for (const [hx, hy, col] of [[-26, -66 + Math.sin(t * 4) * 4, '#29f3ff'], [30 + hf * 30, -70 + Math.cos(t * 4) * 4 - hf * 10, '#ff3fd8']]) {
    c.fillStyle = '#f2eeff'; circ(c, hx, hy, 8.5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    glowDot(c, hx, hy, 16, col, .45);
  }
  // mask head
  c.fillStyle = '#f2eeff'; ell(c, 2, -116, 19, 22); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.fillStyle = '#10051e'; ell(c, -4, -118, 4.6, 6.4, -.2); c.fill(); ell(c, 10, -118, 4.6, 6.4, .2); c.fill();
  const ec = e.state === 'windup' ? '#ff3a3a' : '#29f3ff';
  glowDot(c, -4, -118, 9, ec, .95); glowDot(c, 10, -118, 9, ec, .95);
  c.strokeStyle = '#10051e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -104); c.quadraticCurveTo(3, -100, 10, -104); c.stroke();
  // crown
  const cols = ['#29f3ff', '#ff3fd8', '#ffe14a', '#5dff9b', '#b48bff'];
  for (let i = 0; i < 5; i++) {
    const ax = -14 + i * 8, h = i === 2 ? 28 : i % 2 ? 18 : 22;
    c.beginPath(); c.moveTo(ax - 4, -134); c.lineTo(ax, -134 - h); c.lineTo(ax + 4, -134);
    c.globalCompositeOperation = 'lighter'; neon(c, cols[i], 2); c.globalCompositeOperation = 'source-over';
  }
  c.restore();
}

/* weapon icons (HUD / pickups), pointing up-right */
function drawWeaponIcon(c, w, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-2.4); c.translate(0, -50);
  drawWeaponInHand(c, w, t || 0);
  c.restore();
}
function drawFood(c, type, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round';
  if (type === 'pizza') {
    c.beginPath(); c.moveTo(-16, -8); c.lineTo(16, -8); c.lineTo(0, 18); c.closePath(); c.fillStyle = '#ffcf5a'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    c.fillStyle = '#e8743b'; rr(c, -17, -13, 34, 7, 3.5); c.fill(); c.stroke();
    c.fillStyle = '#e0303a'; circ(c, -5, -2, 3.5); c.fill(); circ(c, 5, 0, 3); c.fill(); circ(c, 0, 8, 2.6); c.fill();
  } else {
    c.fillStyle = '#29f3ff'; rr(c, -9, -16, 18, 30, 4); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    c.fillStyle = '#cfd6ff'; rr(c, -8, -19, 16, 5, 2); c.fill(); c.stroke();
    c.fillStyle = '#ff3fd8'; rr(c, -9, -6, 18, 9, 2); c.fill();
    c.fillStyle = '#fff'; c.font = '8px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N2', 0, -1.5);
  }
  c.restore();
}

/* ---------------- props ---------------- */
function drawCoin(c, x, y, t, s) {
  const k = Math.cos(t * 6); s = s || 1;
  c.save(); c.translate(x, y); c.scale(Math.max(.15, Math.abs(k)) * s, s);
  c.fillStyle = k > 0 ? '#ffd23a' : '#e0a91a'; circ(c, 0, 0, 8); c.fill(); c.strokeStyle = '#7a4d05'; c.lineWidth = 1.8; c.stroke();
  c.fillStyle = '#fff3b0'; c.font = '9px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (k > 0) c.fillText('N', 0, .5);
  c.restore();
}
function drawCar(c, x, y, e, t) {
  const r = e.hp / e.maxHp, dmg = r > .75 ? 0 : r > .5 ? 1 : r > .25 ? 2 : 3;
  c.save(); c.translate(x, y);
  if (e.flash > 0) c.translate(Math.sin(t * 90) * 3, 0);
  c.save(); c.globalCompositeOperation = 'lighter'; const g0 = c.createRadialGradient(0, 0, 10, 0, 0, 140); g0.addColorStop(0, 'rgba(255,63,216,.5)'); g0.addColorStop(1, 'rgba(255,63,216,0)'); c.fillStyle = g0; ell(c, 0, 0, 140, 22); c.fill(); c.restore();
  // body
  c.beginPath(); c.moveTo(-120, -22); c.lineTo(-118, -50); c.lineTo(-70, -58); c.lineTo(-45, -92); c.lineTo(40, -94); c.lineTo(72, -60); c.lineTo(118, -52); c.lineTo(122, -22); c.closePath();
  const g = c.createLinearGradient(0, -94, 0, -22); g.addColorStop(0, '#7a3bd0'); g.addColorStop(1, '#2a0f5a');
  c.fillStyle = g; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .8; neon(c, '#29f3ff', 1.6, false); c.restore();
  // windows
  const glass = dmg >= 2 ? 'rgba(20,20,40,.9)' : 'rgba(120,220,255,.55)';
  c.fillStyle = glass; c.beginPath(); c.moveTo(-40, -86); c.lineTo(-6, -86); c.lineTo(-6, -60); c.lineTo(-60, -60); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(2, -86); c.lineTo(36, -86); c.lineTo(60, -60); c.lineTo(2, -60); c.closePath(); c.fill();
  if (dmg >= 1) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-30, -80); c.lineTo(-20, -70); c.lineTo(-26, -64); c.moveTo(-20, -70); c.lineTo(-10, -76); c.moveTo(20, -78); c.lineTo(30, -68); c.lineTo(40, -72); c.stroke(); }
  // door seam, handle, stripe
  c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, -60); c.lineTo(-2, -24); c.stroke();
  c.fillStyle = '#ff3fd8'; c.fillRect(-110, -42, 225, 4);
  c.fillStyle = '#ffe9a0'; rr(c, 108, -48, 12, 8, 3); c.fill(); c.fillStyle = '#ff3a5a'; rr(c, -120, -48, 8, 8, 3); c.fill();
  // dents
  c.fillStyle = 'rgba(0,0,0,.35)';
  const dents = [[-80, -40, 14], [30, -38, 12], [80, -46, 10], [-30, -36, 16], [60, -30, 12], [-100, -32, 9]];
  for (let i = 0; i < dmg * 2; i++) { const d = dents[i]; ell(c, d[0], d[1], d[2], d[2] * .6); c.fill(); }
  if (dmg >= 2) { c.save(); c.translate(-2, -24); c.rotate(.5); c.fillStyle = '#3d1a78'; c.fillRect(-58, -36, 58, 34); c.strokeStyle = OUT; c.strokeRect(-58, -36, 58, 34); c.restore(); }
  // wheels
  for (const wx of [-74, 74]) {
    const flat = dmg >= 3 && wx > 0;
    c.fillStyle = '#111'; ell(c, wx, -16, 20, flat ? 14 : 19); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#b8bfd8'; circ(c, wx, -16, 8); c.fill();
    c.strokeStyle = '#29f3ff'; c.lineWidth = 2; c.beginPath(); c.arc(wx, -16, 13, 0, TAU); c.stroke();
  }
  c.restore();
}

/* ---------------- King Arian (final boss) — from his character sheet ---------------- */
const AR = { skin: '#eebf9f', skinD: '#d39c79', skinL: '#f8d9c4', hair: '#2b1c14', hairL: '#55392a', beard: '#2b1a12', beardL: '#47321f', jk: '#2d2e35', jkD: '#1f2026', jkL: '#4a4d57', tee: '#1b2236', jeans: '#22232b', jeansD: '#17181e', shoe: '#6e5d4c', shoeD: '#3d3229', shoeL: '#9a8670' };
let DENIM = null;
function denimPat(c) {
  if (!DENIM) {
    const p = document.createElement('canvas'); p.width = p.height = 10; const x = p.getContext('2d');
    x.fillStyle = AR.jk; x.fillRect(0, 0, 10, 10); x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 1;
    for (let i = -10; i < 20; i += 3) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 10, 10); x.stroke(); }
    DENIM = p;
  }
  if (!c._denim) c._denim = c.createPattern(DENIM, 'repeat');
  return c._denim;
}
function drawArian(c, x, y, dir, P, s, t, mood) {
  s = s || 1; t = t || 0;
  c.save(); c.translate(x, y); c.scale(dir * s * (P.spin || 1), s);
  if (P.lie) { c.translate(0, -10 * P.lie); c.rotate(-Math.PI / 2 * P.lie); }
  c.translate(0, P.bob);
  if (P.rot) { c.translate(0, -55); c.rotate(P.rot); c.translate(0, 55); }
  c.lineJoin = 'round'; c.lineCap = 'round';
  const hipY = -34;
  const tg = fn => { c.save(); c.translate(0, hipY); c.rotate(P.tilt); c.translate(0, -hipY); fn(); c.restore(); };
  const leg = (xx, a, col) => {
    limb(c, xx, hipY, a, 28, 16, col, 0, 0, OUT);
    c.save(); c.translate(xx, hipY); c.rotate(a);
    c.fillStyle = AR.shoe; c.beginPath(); c.moveTo(-8, 21); c.lineTo(6, 21); c.quadraticCurveTo(19, 26, 18, 33); c.lineTo(-8, 34); c.closePath(); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.fillStyle = AR.shoeD; rr(c, -9, 32, 28, 5, 2); c.fill(); c.stroke();
    c.strokeStyle = AR.shoeL; c.lineWidth = 1.3; c.beginPath(); c.moveTo(0, 24); c.lineTo(6, 25); c.moveTo(2, 27.5); c.lineTo(9, 28.5); c.stroke();
    c.restore();
  };
  const sleeve = back => {
    c.fillStyle = denimPat(c); rr(c, -7.5, -7, 15, 27, 7); c.fill();
    if (back) { c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); }
    c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    c.fillStyle = back ? AR.skinD : AR.skin; rr(c, -5, 19, 10, 8, 3); c.fill();
    c.fillStyle = back ? AR.jkD : AR.jkL; rr(c, -7.5, 14, 15, 6, 3); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.8; c.stroke();
  };
  if (!P.legsOnly) tg(() => {   // back arm + steel watch
    c.save(); c.translate(-3, -70); c.rotate(P.armB);
    sleeve(true);
    c.fillStyle = '#9aa3b0'; rr(c, -5.5, 22, 11, 4.5, 1.5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = AR.skinD; circ(c, 0, 29, 7.2); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.restore();
  });
  leg(-4, P.legB, AR.jeansD); leg(5, P.legF, AR.jeans);
  if (P.legsOnly) { c.restore(); return; }
  tg(() => {
    c.fillStyle = AR.jeans; rr(c, -20, -48, 42, 16, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
    const torso = () => { c.beginPath(); c.moveTo(-17, -87); c.quadraticCurveTo(-28, -64, -23, -38); c.quadraticCurveTo(1, -31, 26, -38); c.quadraticCurveTo(31, -64, 19, -87); c.quadraticCurveTo(1, -93, -17, -87); c.closePath(); };
    torso(); c.fillStyle = denimPat(c); c.fill();
    c.save(); torso(); c.clip();
    c.fillStyle = AR.tee; c.beginPath(); c.moveTo(6, -92); c.lineTo(22, -92); c.lineTo(31, -60); c.lineTo(28, -34); c.lineTo(10, -33); c.quadraticCurveTo(4, -60, 6, -92); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(7, -88); c.quadraticCurveTo(4, -60, 9, -34); c.stroke();
    c.fillStyle = '#b9bec9'; [-80, -66, -52].forEach(yy => { circ(c, 4.5, yy, 1.5); c.fill(); });
    c.fillStyle = AR.jkL; rr(c, -15, -79, 15, 5, 1.5); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; rr(c, -15, -79, 15, 15, 2); c.stroke();
    c.fillStyle = '#b9bec9'; circ(c, -7.5, -76.5, 1.2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-25, -58); c.quadraticCurveTo(-9, -55, 5, -58); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-30, -46, 64, 14);
    c.restore();
    torso(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
    c.fillStyle = AR.jkL; c.strokeStyle = OUT; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(1, -90); c.lineTo(10, -75); c.lineTo(6, -91); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-13, -88); c.lineTo(-6, -79); c.lineTo(-2, -90); c.closePath(); c.fill(); c.stroke();
    // BJJ black belt
    c.fillStyle = '#121214'; rr(c, -21, -46, 44, 7, 2); c.fill(); c.lineWidth = 1.6; c.stroke();
    c.fillStyle = '#c4262e'; c.fillRect(-13, -46, 7, 7);
    c.save(); c.translate(14, -41); c.fillStyle = '#121214'; c.rotate(.25); rr(c, -3, 0, 6, 15, 2); c.fill(); c.stroke(); c.rotate(-.5); rr(c, -3, 0, 6, 13, 2); c.fill(); c.stroke(); c.restore();
    c.save(); c.beginPath(); c.moveTo(-18, -82); c.quadraticCurveTo(-27, -62, -22.5, -42); c.globalAlpha = .75; neon(c, '#ffe14a', 1.6, false); c.restore();
    drawArianHead(c, t, mood, P.lie > .5 || P.rot);
    c.save(); c.translate(3, -70); c.rotate(P.armF);   // front arm + leather wristband
    sleeve(false);
    c.fillStyle = '#5a2f1c'; rr(c, -5.5, 22, 11, 4.5, 1.5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = AR.skin; circ(c, 0, 29, 7.4); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
    c.restore();
  });
  c.restore();
}
function drawArianHead(c, t, mood, noCrown) {
  const hx = 5, hy = -104;
  mood = mood || 'smile';
  if (mood === 'smile' && (t % 4.1) < .12) mood = 'blink';
  // floating neon crown
  if (!noCrown) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const cy = hy - 64 + Math.sin(t * 3) * 2.5;
  c.beginPath(); c.moveTo(hx - 13, cy + 8); c.lineTo(hx - 15, cy - 6); c.lineTo(hx - 6, cy + 1); c.lineTo(hx + 3, cy - 11); c.lineTo(hx + 12, cy + 1); c.lineTo(hx + 21, cy - 6); c.lineTo(hx + 19, cy + 8); c.closePath();
  c.globalAlpha = .9; neon(c, '#ffe14a', 1.8); c.globalAlpha = .2; c.fillStyle = '#ffe14a'; c.fill();
  c.restore();
  }
  c.fillStyle = AR.hair; ell(c, hx - 9, hy + 1, 20, 22); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke();
  c.fillStyle = AR.skin; ell(c, hx + 1, hy + 1, 25, 27); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.fillStyle = AR.skinL; c.globalAlpha = .45; ell(c, hx + 12, hy - 8, 9, 6, -.3); c.fill(); c.globalAlpha = 1;
  c.fillStyle = AR.skin; ell(c, hx - 14, hy + 2, 6.5, 8.5); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
  c.strokeStyle = AR.skinD; c.lineWidth = 1.8; c.beginPath(); c.arc(hx - 14, hy + 2, 3.6, -1.2, 1.6); c.stroke();
  // trimmed full beard
  c.beginPath(); c.moveTo(hx - 9, hy - 4);
  c.quadraticCurveTo(hx - 14, hy + 14, hx - 8, hy + 22);
  c.quadraticCurveTo(hx + 1, hy + 33, hx + 12, hy + 33);
  c.quadraticCurveTo(hx + 24, hy + 30, hx + 26, hy + 16);
  c.quadraticCurveTo(hx + 28, hy + 9, hx + 26.5, hy + 5);
  c.lineTo(hx + 21, hy + 7); c.quadraticCurveTo(hx + 12, hy + 12, hx + 3, hy + 8); c.quadraticCurveTo(hx - 4, hy + 4, hx - 4, hy - 4);
  c.closePath(); c.fillStyle = AR.beard; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
  c.strokeStyle = AR.beardL; c.lineWidth = 1.1; c.beginPath();
  for (let i = 0; i < 6; i++) { const bx = hx - 6 + i * 5; c.moveTo(bx, hy + 14 + (i % 2) * 2); c.lineTo(bx + 1, hy + 24 + (i % 3)); }
  c.stroke();
  c.fillStyle = AR.skinD; c.beginPath(); c.moveTo(hx + 20, hy - 7); c.quadraticCurveTo(hx + 29, hy + 3, hx + 26, hy + 6); c.quadraticCurveTo(hx + 22, hy + 7, hx + 19, hy + 4); c.closePath(); c.fill();
  if (mood === 'angry' || mood === 'hurt' || mood === 'happy') {
    c.fillStyle = '#5a1e1e'; c.beginPath();
    if (mood === 'happy') { c.moveTo(hx + 10, hy + 14); c.quadraticCurveTo(hx + 17, hy + 24, hx + 25, hy + 14); c.closePath(); }
    else if (mood === 'hurt') ell(c, hx + 17, hy + 17, 4.6, 4.2);
    else rr(c, hx + 10, hy + 13.5, 15, 6, 2);
    c.fill();
    if (mood !== 'hurt') { c.fillStyle = '#fff'; c.fillRect(hx + 11, hy + 14, 13, 3); }
  } else {
    c.strokeStyle = '#b8665a'; c.lineWidth = 2.8; c.beginPath(); c.moveTo(hx + 11, hy + 16.5); c.quadraticCurveTo(hx + 18, hy + 18, hx + 24, hy + 13.5); c.stroke();
  }
  c.beginPath(); c.moveTo(hx + 6, hy + 13); c.quadraticCurveTo(hx + 12, hy + 7, hx + 18, hy + 9); c.quadraticCurveTo(hx + 24, hy + 7, hx + 28, hy + 12); c.quadraticCurveTo(hx + 19, hy + 13.5, hx + 6, hy + 13); c.closePath(); c.fillStyle = AR.beard; c.fill();
  [hx + 7, hx + 19].forEach(ex => {
    if (mood === 'blink' || mood === 'hurt' || mood === 'happy') {
      c.strokeStyle = OUT; c.lineWidth = 2.6; c.beginPath();
      if (mood === 'hurt') { c.moveTo(ex - 4, hy - 7); c.lineTo(ex + 3, hy - 4); c.lineTo(ex - 4, hy - 1); }
      else if (mood === 'happy') { c.moveTo(ex - 4.5, hy - 3); c.quadraticCurveTo(ex, hy - 8.5, ex + 4.5, hy - 3); }
      else { c.moveTo(ex - 4.5, hy - 4); c.lineTo(ex + 4.5, hy - 4); }
      c.stroke(); return;
    }
    c.fillStyle = '#fff'; ell(c, ex, hy - 4, 4.6, 3.3); c.fill();
    c.fillStyle = '#3a2416'; ell(c, ex + 1.2, hy - 3.8, 2.9, 3.1); c.fill();
    c.fillStyle = '#100804'; circ(c, ex + 1.4, hy - 3.8, 1.4); c.fill();
    c.fillStyle = '#fff'; circ(c, ex + 2.2, hy - 5, 1); c.fill();
    c.strokeStyle = OUT; c.lineWidth = 2.8; c.beginPath(); c.moveTo(ex - 5, hy - 5.5); c.lineTo(ex + 5, hy - 6.2); c.stroke();
  });
  c.strokeStyle = AR.hair; c.lineWidth = 4.8;
  const ang = mood === 'angry' ? 3 : 1.2;
  c.beginPath(); c.moveTo(hx + 1, hy - 13.5); c.lineTo(hx + 11, hy - 12 + ang); c.stroke();
  c.beginPath(); c.moveTo(hx + 14, hy - 12 + ang); c.lineTo(hx + 25, hy - 14); c.stroke();
  // voluminous quiff
  c.beginPath();
  c.moveTo(hx - 20, hy - 4);
  c.quadraticCurveTo(hx - 27, hy - 26, hx - 14, hy - 39);
  c.quadraticCurveTo(hx - 2, hy - 51, hx + 14, hy - 47);
  c.quadraticCurveTo(hx + 31, hy - 45, hx + 32, hy - 30);
  c.quadraticCurveTo(hx + 27, hy - 32, hx + 23, hy - 28);
  c.quadraticCurveTo(hx + 25, hy - 20, hx + 21, hy - 15);
  c.quadraticCurveTo(hx + 6, hy - 22, hx - 8, hy - 18);
  c.quadraticCurveTo(hx - 12, hy - 10, hx - 9, hy - 3);
  c.closePath();
  c.fillStyle = AR.hair; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.6; c.stroke();
  c.strokeStyle = AR.hairL; c.lineWidth = 2.2; c.beginPath();
  c.moveTo(hx - 12, hy - 31); c.quadraticCurveTo(hx, hy - 45, hx + 18, hy - 41);
  c.moveTo(hx - 6, hy - 25); c.quadraticCurveTo(hx + 6, hy - 37, hx + 25, hy - 35);
  c.moveTo(hx - 17, hy - 20); c.quadraticCurveTo(hx - 15, hy - 33, hx - 4, hy - 39);
  c.stroke();
}
