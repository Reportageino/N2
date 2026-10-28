/* ===================== N2 — comic story pages (read right-to-left) ===================== */
const STORY = {
  intro: [
    [
      { scene: 'city', cap: 'شهر نئون، ساعت ۲ بامداد...' },
      { scene: 'cafe', chars: [{ w: 'nima', x: .5, y: .92, s: 1.05, anim: 'sit', mood: 'happy', prop: 'pizza' }], say: 'بالاخره... یه پیتزای داغ!' },
      { scene: 'dark', cap: 'ناگهان همه نورها خاموش شد!', eyes: true }
    ],
    [
      { scene: 'holo', chars: [{ w: 'nking', x: .5, y: .95, s: .85 }], say: 'از امشب همه نورهای شهر مال منه! هاها!' },
      { scene: 'dark', chars: [{ w: 'nima', x: .5, y: .95, s: 1.05, anim: 'idle', mood: 'confused', prop: 'pizza' }], say: 'پیتزام... سرد شد؟!' },
      { scene: 'street', chars: [{ w: 'nima', x: .5, y: .95, s: 1.05, anim: 'flex', mood: 'angry' }], say: 'این دیگه شخصیه! بزن بریم!' }
    ]
  ],
  s1: [[
    { scene: 'street', chars: [{ w: 'king1', x: .5, y: .9, s: .75, anim: 'down' }], say: 'آخ... آرکیدوس انتقاممو می‌گیره!' },
    { scene: 'arcade', chars: [{ w: 'nima', x: .5, y: .95, s: 1.05, anim: 'victory', mood: 'happy' }], say: 'آرکید؟ من قهرمان همه بازیای آرکیدم!' },
    { scene: 'street', cap: 'ولی اول... یه ماشین نئونی سر راهه!', chars: [{ w: 'car', x: .62, y: .92, s: .7 }, { w: 'nima', x: .2, y: .95, s: .9, anim: 'idle', mood: 'angry', weapon: 'bat' }] }
  ]],
  s2: [[
    { scene: 'arcade', chars: [{ w: 'arcade', x: .5, y: .95, s: .62, anim: 'down' }], say: 'گیم... اوور... برای... من؟' },
    { scene: 'arcade', chars: [{ w: 'nima', x: .5, y: .95, s: 1.05, anim: 'idle', mood: 'wink' }], say: 'ادامه بازی نداری رفیق!' },
    { scene: 'roof', cap: 'پادشاه نئون بالای بلندترین برج شهره...', chars: [{ w: 'nking', x: .5, y: .82, s: .55 }] }
  ]],
  arian: [
    [
      { scene: 'roof', chars: [{ w: 'nima', x: .5, y: .95, s: 1.05, anim: 'victory', mood: 'happy' }], say: 'تمام شد! شهر نجات پیدا کرد!' },
      { scene: 'dark', cap: 'یه صدای آشنا از پشت سر...', eyes: true },
      { scene: 'mat', chars: [{ w: 'arian', x: .5, y: .95, s: 1.05, anim: 'bjj', mood: 'smile' }], say: 'فکر کردی شاه واقعی این شهر کیه؟' }
    ],
    [
      { scene: 'mat', chars: [{ w: 'nima', x: .5, y: .95, s: 1.05, anim: 'idle', mood: 'confused' }], say: 'آریان؟! تو دیگه چرا؟!' },
      { scene: 'mat', chars: [{ w: 'arian', x: .5, y: .95, s: 1.05, anim: 'bow', mood: 'smile' }], say: 'کمربند مشکی، بدون رحم. اُس!' },
      { scene: 'vs', cap: 'مبارزه نهایی: بهترین از ۳ راند', chars: [{ w: 'nima', x: .27, y: .95, s: .8, anim: 'fstance', mood: 'angry' }, { w: 'arian', x: .73, y: .95, s: .8, anim: 'bjj', mood: 'angry', dir: -1 }] }
    ]
  ],
  end: [[
    { scene: 'mat', chars: [{ w: 'arian', x: .3, y: .9, s: .9, anim: 'down', mood: 'hurt' }], say: 'تپ زدم! تپ زدم! تو شاهی!' },
    { scene: 'city', lit: true, cap: 'نورها به شهر نئون برگشتند.' },
    { scene: 'cafe', chars: [{ w: 'nima', x: .33, y: .92, s: .85, anim: 'sit', mood: 'happy', prop: 'pizza' }, { w: 'arian', x: .72, y: .92, s: .85, anim: 'sit', mood: 'happy', dir: -1 }], say: 'پیتزا داغه! نصفش مال تو آریان.' }
  ]]
};

function startStory(key, done) {
  G.state = 'story'; G.story = { key, page: 0, t: 0, done };
  showScreen('s-story');
}
function storyTap() {
  const S = G.story; if (!S) return;
  const n = STORY[S.key][S.page].length;
  if (S.t < n * .45 + .2) { S.t = n * .45 + .2; return; }
  S.page++; S.t = 0; SFX.ui();
  if (S.page >= STORY[S.key].length) storyEnd();
}
function storyEnd() { const S = G.story; if (!S) return; G.story = null; hideScreens(); S.done && S.done(); }

function wrapLines(c, s, maxW) {
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function storyScene(c, P, w, h, seed) {
  const R = mulberry(seed);
  const bgs = { mat: ['#1a0d2e', '#3d1f12'], vs: ['#2a0838', '#06243a'], city: ['#0a0526', '#3a0f5e'], cafe: ['#2a0f3e', '#5a1e4e'], dark: ['#020108', '#0d0518'], holo: ['#03101e', '#0a2a40'], street: ['#140630', '#4a0f5e'], arcade: ['#1a0638', '#521a78'], roof: ['#021024', '#0d4d6b'] };
  const b = bgs[P.scene] || bgs.city;
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, b[0]); g.addColorStop(1, b[1]); c.fillStyle = g; c.fillRect(0, 0, w, h);
  if (P.scene === 'city' || P.scene === 'holo' || P.scene === 'roof') {
    c.fillStyle = P.scene === 'roof' ? '#bff8ff' : '#ff9ae8'; c.globalAlpha = .9; circ(c, w * .75, h * .22, h * .1); c.fill(); c.globalAlpha = 1;
    let x = 0; while (x < w) { const bw = 20 + R() * 40, bh = h * (.25 + R() * .45); c.fillStyle = '#0c0624'; c.fillRect(x, h - bh, bw, bh);
      for (let yy = h - bh + 6; yy < h - 6; yy += 9) for (let xx = x + 4; xx < x + bw - 4; xx += 7) if (R() < (P.scene === 'city' && !P.lit ? .35 : .5)) { c.fillStyle = pick2(R, ['#ff3fd8', '#29f3ff', '#ffe14a']); c.globalAlpha = .7; c.fillRect(xx, yy, 3, 4); c.globalAlpha = 1; }
      x += bw + 3; }
    if (P.lit) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(w / 2, h, 10, w / 2, h, h); lg.addColorStop(0, 'rgba(255,63,216,.5)'); lg.addColorStop(1, 'rgba(255,63,216,0)'); c.fillStyle = lg; c.fillRect(0, 0, w, h); c.restore(); }
  }
  if (P.scene === 'holo') { c.save(); c.globalCompositeOperation = 'lighter'; const hg = c.createRadialGradient(w / 2, h * .55, 10, w / 2, h * .55, h * .6); hg.addColorStop(0, 'rgba(41,243,255,.45)'); hg.addColorStop(1, 'rgba(41,243,255,0)'); c.fillStyle = hg; c.fillRect(0, 0, w, h); c.restore(); }
  if (P.scene === 'cafe') {
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(w * .08, h * .12, w * .38, h * .4);
    c.save(); c.shadowColor = '#ff3fd8'; c.shadowBlur = 14; c.strokeStyle = '#ff3fd8'; c.lineWidth = 3; c.strokeRect(w * .08, h * .12, w * .38, h * .4); c.restore();
    c.font = `${h * .1}px Lalezar, Vazirmatn, Tahoma, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 12; c.fillStyle = '#9ff9ff'; c.fillText('کافه', w * .72, h * .2); c.restore();
    c.fillStyle = '#3a1a2a'; c.fillRect(0, h * .78, w, h * .22);
  }
  if (P.scene === 'street' || P.scene === 'arcade') {
    for (let i = 0; i < 5; i++) { const sx = i * w / 4 + R() * 20, col = pick2(R, ['#ff3fd8', '#29f3ff', '#ffe14a']); c.save(); c.shadowColor = col; c.shadowBlur = 12; c.strokeStyle = col; c.lineWidth = 2.5; c.strokeRect(sx, h * .15 + R() * h * .2, w * .16, h * .12); c.restore(); }
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, h * .78, w, h * .22);
    c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 10; c.strokeStyle = '#29f3ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h * .78); c.lineTo(w, h * .78); c.stroke(); c.restore();
  }
  if (P.scene === 'roof') { c.fillStyle = '#122039'; c.fillRect(0, h * .78, w, h * .22); c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 12; c.strokeStyle = '#29f3ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, h * .78); c.lineTo(w, h * .78); c.stroke(); c.restore(); }
  if (P.scene === 'mat') {
    c.fillStyle = '#2a1608'; c.fillRect(0, h * .74, w, h * .26);
    c.save(); c.shadowColor = '#ffe14a'; c.shadowBlur = 14; c.strokeStyle = '#ffe14a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, h * .74); c.lineTo(w, h * .74); c.stroke();
    c.font = `${h * .09}px Bungee, Impact, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffe14a'; c.globalAlpha = .85; c.fillText('KING', w / 2, h * .16); c.restore();
  }
  if (P.scene === 'vs') {
    c.fillStyle = 'rgba(255,63,216,.35)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * .58, 0); c.lineTo(w * .42, h); c.lineTo(0, h); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,225,74,.28)'; c.beginPath(); c.moveTo(w * .58, 0); c.lineTo(w, 0); c.lineTo(w, h); c.lineTo(w * .42, h); c.closePath(); c.fill();
    c.save(); c.font = `${h * .2}px Bungee, Impact, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#fff'; c.shadowBlur = 18; c.fillStyle = '#fff'; c.fillText('VS', w / 2, h * .5); c.restore();
  }
  if (P.eyes) { for (let i = 0; i < 4; i++) { const ex = w * (.2 + R() * .6), ey = h * (.3 + R() * .4); glowDot(c, ex, ey, 8, '#ff3a3a', .9); glowDot(c, ex + 12, ey, 8, '#ff3a3a', .9); } }
}
function storyChar(c, ch, w, h, t) {
  const x = ch.x * w, y = ch.y * h, s = ch.s * h / 230;
  const P = poseOf({ anim: ch.anim || 'idle', animT: t, p: .5 });
  c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, x, y, 40 * s, 9 * s); c.fill();
  const fake = { dir: ch.dir || 1, state: 'idle', animT: t, hp: 1, maxHp: 1, flash: 0 };
  if (ch.w === 'nima') {
    drawNima(c, x, y, ch.dir || 1, P, LOOK, ch.weapon || null, s, t, ch.mood);
    if (ch.prop === 'pizza') drawFood(c, 'pizza', x + 30 * s, y - (ch.anim === 'sit' ? 70 : 80) * s, s * 1.1);
  } else if (ch.w === 'arian') drawArian(c, x, y, ch.dir || -1, P, s, t, ch.mood);
  else if (ch.w === 'king1') drawThug(c, x, y, -1, P, KING1, s * 1.3, t);
  else if (ch.w === 'arcade') { fake.dir = -1; c.save(); c.translate(x, y); c.scale(s, s); drawArcadeBoss(c, fake, 0, 0, P, t); c.restore(); }
  else if (ch.w === 'nking') { fake.dir = -1; c.save(); c.translate(x, y); c.scale(s, s); drawNeonKing(c, fake, 0, 0, P, t); c.restore(); }
  else if (ch.w === 'car') { c.save(); c.translate(x, y); c.scale(s, s); drawCar(c, 0, 0, fake, t); c.restore(); }
}
function renderStory(c) {
  const S = G.story; if (!S) return;
  const page = STORY[S.key][S.page]; if (!page) return;
  c.fillStyle = '#07051a'; c.fillRect(0, 0, VW, VH);
  c.fillStyle = 'rgba(255,255,255,.03)'; for (let i = 0; i < VW; i += 6) for (let j = (i / 6 % 2) * 3; j < VH; j += 6) c.fillRect(i, j, 1.5, 1.5);
  const n = page.length, gap = 16, mx = 26, top = 40, ph = VH - 100, pw = (VW - mx * 2 - gap * (n - 1)) / n;
  page.forEach((P, i) => {
    const appear = clamp((S.t - i * .45) / .3, 0, 1); if (appear <= 0) return;
    const px = VW - mx - pw - i * (pw + gap), py = top;     // right-to-left
    const k = easeOut(appear), sc = .85 + .15 * k;
    c.save(); c.globalAlpha = k; c.translate(px + pw / 2, py + ph / 2); c.rotate((i % 2 ? 1 : -1) * .012); c.scale(sc, sc); c.translate(-pw / 2, -ph / 2);
    c.save(); rr(c, 0, 0, pw, ph, 8); c.clip();
    storyScene(c, P, pw, ph, 31 + i * 7 + S.page * 13);
    (P.chars || []).forEach(ch => storyChar(c, ch, pw, ph, G.t));
    c.restore();
    rr(c, 0, 0, pw, ph, 8); c.lineWidth = 5; c.strokeStyle = '#f2eeff'; c.stroke(); neon(c, ['#ff3fd8', '#29f3ff', '#ffe14a'][i % 3], 1.4, false);
    if (P.cap) {
      c.font = '17px Lalezar, Vazirmatn, Tahoma, sans-serif'; c.direction = 'rtl';
      const lines = wrapLines(c, P.cap, pw - 40), bw = Math.min(pw - 16, Math.max(...lines.map(l => c.measureText(l).width)) + 24), bh = lines.length * 22 + 12;
      c.fillStyle = '#ffe14a'; c.fillRect(pw - bw - 8, 8, bw, bh); c.strokeStyle = OUT; c.lineWidth = 2.5; c.strokeRect(pw - bw - 8, 8, bw, bh);
      c.fillStyle = '#1a0d2e'; c.textAlign = 'center'; c.textBaseline = 'middle';
      lines.forEach((l, j) => c.fillText(l, pw - 8 - bw / 2, 8 + 18 + j * 22));
      c.direction = 'ltr';
    }
    if (P.say) {
      c.font = '19px Lalezar, Vazirmatn, Tahoma, sans-serif'; c.direction = 'rtl';
      const lines = wrapLines(c, P.say, pw - 60), bw = Math.min(pw - 20, Math.max(...lines.map(l => c.measureText(l).width)) + 32), bh = lines.length * 25 + 18;
      const bx = (pw - bw) / 2, by = P.cap ? 60 : 14;
      c.fillStyle = '#fff'; rr(c, bx, by, bw, bh, 16); c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
      c.beginPath(); c.moveTo(pw / 2 - 10, by + bh - 1); c.lineTo(pw / 2 + 4, by + bh + 18); c.lineTo(pw / 2 + 14, by + bh - 1); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(pw / 2 - 10, by + bh); c.lineTo(pw / 2 + 4, by + bh + 18); c.lineTo(pw / 2 + 14, by + bh); c.stroke();
      c.fillStyle = '#1a0d2e'; c.textAlign = 'center'; c.textBaseline = 'middle';
      lines.forEach((l, j) => c.fillText(l, pw / 2, by + 22 + j * 25));
      c.direction = 'ltr';
    }
    c.restore();
  });
  if (S.t > n * .45 + .3) { c.globalAlpha = .5 + Math.sin(G.t * 5) * .3; text(c, 'برای ادامه صفحه را لمس کن', VW / 2, VH - 30, { font: '17px Lalezar, Vazirmatn, Tahoma, sans-serif', fill: '#fff' }); c.globalAlpha = 1; }
}
