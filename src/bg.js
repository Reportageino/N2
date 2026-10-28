/* ===================== N2 — neon stages art ===================== */
const THEMES = [
  { name: 'خیابان نئون', sky: ['#04021a', '#170838', '#4c0f5e'], far: '#0f0a29', mid: '#170f37', wall: '#1d1340', neon: ['#ff3fd8', '#29f3ff', '#ffe14a', '#9b6bff'], moon: '#ff9ae8', ground: '#0f0a22', side: '#221a42' },
  { name: 'شهربازی آرکید', sky: ['#0a0220', '#2c0846', '#7a1a6e'], far: '#1a0a33', mid: '#22103f', wall: '#2a1048', neon: ['#ffe14a', '#ff3fd8', '#29f3ff', '#ff8a3d'], moon: '#ffe9a0', ground: '#140a26', side: '#2d1650' },
  { name: 'پشت‌بام برج', sky: ['#010616', '#05203d', '#0d5170'], far: '#06142b', mid: '#0a1c38', wall: '#0e2240', neon: ['#29f3ff', '#5dff9b', '#b48bff', '#ff3fd8'], moon: '#bff8ff', ground: '#0b1626', side: '#152a44' }
];
const SIGNS = [['NEON', 'L'], ['کافه', 'F'], ['۲۴ ساعته', 'F'], ['RAMEN', 'L'], ['N2', 'L'], ['پیتزا', 'F'], ['OPEN', 'L'], ['گیم‌نت', 'F'], ['NOODLE', 'L'], ['آبمیوه', 'F'], ['KARAOKE', 'L'], ['شب‌گرد', 'F']];

function makeLayer(w, h, fn) {
  const d = Q.layerDpr, c = document.createElement('canvas');
  c.width = Math.ceil(w * d); c.height = Math.ceil(h * d);
  const x = c.getContext('2d'); x.scale(d, d); x.lineJoin = 'round'; x.lineCap = 'round';
  fn(x, w, h); c.lw = w; c.lh = h; return c;
}
function signBox(c, x, y, w, h, txt, kind, col, R) {
  c.fillStyle = 'rgba(8,4,24,.92)'; rr(c, x, y, w, h, 6); c.fill();
  c.save(); c.shadowColor = col; c.shadowBlur = 16; c.strokeStyle = col; c.lineWidth = 2.6; rr(c, x + 3, y + 3, w - 6, h - 6, 5); c.stroke(); c.restore();
  c.save();
  const fs = kind === 'F' ? h * .62 : h * .48;
  c.font = (kind === 'F' ? `${fs}px Lalezar, Vazirmatn, Tahoma` : `${fs}px Bungee, Impact, sans-serif`);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = col; c.shadowBlur = 18; c.fillStyle = col; c.fillText(txt, x + w / 2, y + h / 2 + (kind === 'F' ? 2 : 1));
  c.shadowBlur = 4; c.fillStyle = '#fff'; c.globalAlpha = .85; c.fillText(txt, x + w / 2, y + h / 2 + (kind === 'F' ? 2 : 1));
  c.restore();
}
function vertSign(c, x, y, txt, col) {
  const n = txt.length, h = n * 26 + 14;
  c.fillStyle = 'rgba(8,4,24,.92)'; rr(c, x, y, 30, h, 5); c.fill();
  c.save(); c.shadowColor = col; c.shadowBlur = 14; c.strokeStyle = col; c.lineWidth = 2.2; rr(c, x + 2.5, y + 2.5, 25, h - 5, 4); c.stroke();
  c.font = '18px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
  for (let i = 0; i < n; i++) c.fillText(txt[i], x + 15, y + 20 + i * 26);
  c.restore();
}
function windowsGrid(c, x, y, w, h, R, cols, cell, lit) {
  for (let yy = y + 8; yy < y + h - 8; yy += cell) for (let xx = x + 6; xx < x + w - 8; xx += cell * .8) {
    if (R() < lit) { c.fillStyle = rgba(pick2(R, cols), .35 + R() * .45); c.fillRect(xx, yy, cell * .45, cell * .55); }
    else { c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(xx, yy, cell * .45, cell * .55); }
  }
}
function pick2(R, a) { return a[(R() * a.length) | 0]; }

function buildStage(si) {
  const T = THEMES[si], R = mulberry(1337 + si * 99);
  const L = {};
  // far skyline
  L.far = makeLayer(1800, 380, (c, w, h) => {
    if (si === 2) { // city far below + clouds
      for (let i = 0; i < 70; i++) { const bw = 20 + R() * 50, bh = 40 + R() * 120, bx = R() * w; c.fillStyle = T.far; c.fillRect(bx, h - bh, bw, bh); windowsGrid(c, bx, h - bh, bw, bh, R, T.neon, 7, .35); }
      for (let i = 0; i < 260; i++) { c.fillStyle = rgba(pick2(R, T.neon), .5 + R() * .5); c.fillRect(R() * w, h - R() * 70, 1.6, 1.6); }
      c.globalAlpha = .18; for (let i = 0; i < 9; i++) { c.fillStyle = '#7fd8ff'; ell(c, R() * w, 120 + R() * 120, 120 + R() * 160, 14 + R() * 18); c.fill(); } c.globalAlpha = 1;
      return;
    }
    let x = -20;
    while (x < w) {
      const bw = 50 + R() * 90, bh = 140 + R() * 220;
      c.fillStyle = T.far; c.fillRect(x, h - bh, bw, bh);
      if (R() < .5) { c.fillRect(x + bw * .3, h - bh - 20, bw * .4, 22); }
      windowsGrid(c, x, h - bh, bw, bh, R, T.neon, 11, .28);
      if (R() < .55) { c.save(); c.shadowColor = pick2(R, T.neon); c.shadowBlur = 10; c.strokeStyle = c.shadowColor; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 4, h - bh + 6); c.lineTo(x + 4, h); c.stroke(); c.restore(); }
      if (R() < .5) { c.strokeStyle = '#3a2f60'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + bw / 2, h - bh); c.lineTo(x + bw / 2, h - bh - 34); c.stroke(); c.save(); c.shadowColor = '#ff3a5a'; c.shadowBlur = 10; c.fillStyle = '#ff3a5a'; circ(c, x + bw / 2, h - bh - 35, 2.6); c.fill(); c.restore(); }
      x += bw + R() * 16;
    }
    if (si === 1) { // tents
      for (let i = 0; i < 5; i++) { const tx = 100 + i * 360 + R() * 80, tw = 120 + R() * 60; c.fillStyle = '#2a1048'; c.beginPath(); c.moveTo(tx, h); c.lineTo(tx + tw / 2, h - 110); c.lineTo(tx + tw, h); c.fill(); c.save(); c.shadowColor = '#ffe14a'; c.shadowBlur = 10; c.strokeStyle = '#ffe14a'; c.lineWidth = 2; c.stroke(); c.restore(); }
    }
  });
  // mid buildings + big signs
  L.mid = makeLayer(1900, 330, (c, w, h) => {
    let x = 0, k = 0;
    while (x < w) {
      const bw = 120 + R() * 130, bh = si === 2 ? 60 + R() * 90 : 170 + R() * 150;
      const top = h - bh;
      const g = c.createLinearGradient(0, top, 0, h); g.addColorStop(0, shade(T.mid, .08)); g.addColorStop(1, T.mid);
      c.fillStyle = g; c.fillRect(x, top, bw, bh);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + bw - 8, top, 8, bh);
      windowsGrid(c, x, top + 40, bw - 10, bh - 40, R, T.neon, 16, .22);
      if (si !== 2 && R() < .85) {
        const sg = SIGNS[(k + si * 3) % SIGNS.length]; k++;
        const sw = Math.min(bw - 20, sg[1] === 'F' ? 90 + sg[0].length * 7 : 30 + sg[0].length * 16);
        signBox(c, x + (bw - sw) / 2, top + 12 + R() * 30, sw, 42, sg[0], sg[1], pick2(R, T.neon), R);
      }
      if (R() < .4 && si !== 2) vertSign(c, x + bw - 40, top + 70, pick2(R, ['BAR', 'LUCK', 'NEON', 'CAFE', 'ZONE']), pick2(R, T.neon));
      x += bw + 6 + R() * 30;
    }
    if (si === 2) {
      // distant hologram towers
      for (let i = 0; i < 3; i++) { const tx = 200 + i * 620; c.fillStyle = shade(T.mid, .1); c.fillRect(tx, 40, 60, h - 40); windowsGrid(c, tx, 40, 60, h - 40, R, T.neon, 12, .4); c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 16; c.strokeStyle = '#29f3ff'; c.lineWidth = 2; c.strokeRect(tx + 4, 44, 52, h - 48); c.restore(); }
    }
  });
  // wall / foreground facade (scrolls with the street)
  L.wall = makeLayer(1920, 236, (c, w, h) => {
    if (si === 2) return buildRoofWall(c, w, h, T, R);
    let x = 0, k = 0;
    while (x < w) {
      const sw = 300 + R() * 80;
      const base = shade(T.wall, (R() - .5) * .25);
      c.fillStyle = base; c.fillRect(x, 0, sw, h);
      // bricks hint
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1;
      for (let yy = 8; yy < 90; yy += 12) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + sw, yy); c.stroke(); }
      // upper windows
      for (let i = 0; i < 2; i++) {
        const wx = x + 30 + i * (sw / 2), ww = sw / 2 - 60;
        const lit = R() < .7, col = pick2(R, T.neon);
        c.fillStyle = lit ? rgba(col, .22) : 'rgba(0,0,0,.4)'; c.fillRect(wx, 12, ww, 54);
        if (lit) { c.fillStyle = rgba(col, .35); c.fillRect(wx, 12, ww, 8); c.fillStyle = 'rgba(0,0,0,.35)'; if (R() < .5) { ell(c, wx + ww * .4, 58, 10, 18); c.fill(); circ(c, wx + ww * .4, 36, 8); c.fill(); } }
        c.strokeStyle = '#0c0720'; c.lineWidth = 3; c.strokeRect(wx, 12, ww, 54); c.beginPath(); c.moveTo(wx + ww / 2, 12); c.lineTo(wx + ww / 2, 66); c.stroke();
      }
      // shop
      const col = pick2(R, T.neon);
      const sy = 100;
      if (si === 1) {
        // arcade window with cabinets
        c.fillStyle = 'rgba(10,4,30,.9)'; c.fillRect(x + 20, sy + 20, sw - 40, h - sy - 22);
        for (let i = 0; i < 4; i++) {
          const ax = x + 36 + i * ((sw - 72) / 4), aw = (sw - 72) / 4 - 10, cc = pick2(R, T.neon);
          c.fillStyle = '#1c0e3a'; c.fillRect(ax, sy + 50, aw, h - sy - 52);
          c.save(); c.shadowColor = cc; c.shadowBlur = 14; c.fillStyle = rgba(cc, .8); c.fillRect(ax + 6, sy + 58, aw - 12, 30); c.restore();
          c.fillStyle = rgba(cc, .9); c.fillRect(ax, sy + 42, aw, 8);
        }
        c.save(); c.shadowColor = col; c.shadowBlur = 18; c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(x + 20, sy + 20, sw - 40, h - sy - 22); c.restore();
        signBox(c, x + sw / 2 - 90, sy - 30, 180, 44, k % 2 ? 'ARCADE' : 'گیم‌نت', k % 2 ? 'L' : 'F', col, R);
        // string lights
        for (let i = 0; i < 16; i++) { const lx = x + i * sw / 16 + 6, ly = 84 + Math.sin(i * .9) * 5; c.save(); c.shadowColor = T.neon[i % 4]; c.shadowBlur = 8; c.fillStyle = T.neon[i % 4]; circ(c, lx, ly, 3); c.fill(); c.restore(); }
      } else {
        // awning
        for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? rgba(col, .85) : '#140b30'; c.beginPath(); const ax = x + 24 + i * (sw - 48) / 8; c.moveTo(ax, sy); c.lineTo(ax + (sw - 48) / 8, sy); c.lineTo(ax + (sw - 48) / 8 + 3, sy + 22); c.lineTo(ax - 3, sy + 22); c.fill(); }
        // shop window glow
        const gg = c.createLinearGradient(0, sy + 26, 0, h); gg.addColorStop(0, rgba(col, .45)); gg.addColorStop(1, rgba(col, .08));
        c.fillStyle = gg; c.fillRect(x + 30, sy + 28, sw * .55, h - sy - 30);
        c.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 3; i++) { rr(c, x + 44 + i * 40, sy + 70 + (i % 2) * 10, 26, h - sy - 74, 6); c.fill(); }
        c.strokeStyle = '#0c0720'; c.lineWidth = 4; c.strokeRect(x + 30, sy + 28, sw * .55, h - sy - 30);
        // door
        const dx = x + 50 + sw * .55; c.fillStyle = '#0d0820'; c.fillRect(dx, sy + 40, 56, h - sy - 40);
        c.save(); c.shadowColor = col; c.shadowBlur = 10; c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(dx + 3, sy + 43, 50, h - sy - 46); c.restore();
        c.fillStyle = col; circ(c, dx + 46, sy + 90, 2.5); c.fill();
        const sg = SIGNS[(k * 5 + 2) % SIGNS.length];
        signBox(c, x + 30, sy - 34, Math.min(sw - 60, 190), 36, sg[0], sg[1], col, R);
        // vending / bins
        if (R() < .6) { const vx = x + sw - 64; c.fillStyle = '#1b1238'; rr(c, vx, h - 92, 40, 92, 4); c.fill(); c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 12; c.fillStyle = 'rgba(41,243,255,.55)'; c.fillRect(vx + 6, h - 84, 28, 40); c.restore(); for (let i = 0; i < 6; i++) { c.fillStyle = T.neon[i % 4]; c.fillRect(vx + 8 + (i % 3) * 9, h - 80 + ((i / 3) | 0) * 16, 6, 10); } }
      }
      // pipes
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + sw - 6, 0); c.lineTo(x + sw - 6, h); c.stroke();
      x += sw; k++;
    }
    // lamp posts
    for (let i = 0; i < 3; i++) {
      const lx = 280 + i * 640;
      c.fillStyle = '#0c0720'; c.fillRect(lx - 3, 30, 6, h - 30);
      c.fillRect(lx - 3, 30, 34, 6);
      c.save(); c.shadowColor = '#ffe9b0'; c.shadowBlur = 24; c.fillStyle = '#fff6d8'; rr(c, lx + 16, 34, 22, 8, 4); c.fill(); c.restore();
      const g = c.createLinearGradient(0, 40, 0, h); g.addColorStop(0, 'rgba(255,233,176,.28)'); g.addColorStop(1, 'rgba(255,233,176,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(lx + 18, 42); c.lineTo(lx + 36, 42); c.lineTo(lx + 80, h); c.lineTo(lx - 26, h); c.closePath(); c.fill();
    }
  });
  // ground tile
  L.ground = makeLayer(640, VH - 356, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, shade(T.ground, .12)); g.addColorStop(1, shade(T.ground, -.35));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (si === 0) {
      c.fillStyle = T.side; c.fillRect(0, 0, w, 24);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 6, 24); c.stroke(); }
      c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 10; c.strokeStyle = '#29f3ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 25); c.lineTo(w, 25); c.stroke(); c.restore();
      c.save(); c.shadowColor = '#ffe14a'; c.shadowBlur = 12; c.fillStyle = '#ffe14a'; for (let x = 20; x < w; x += 160) c.fillRect(x, 96, 80, 5); c.restore();
      for (let i = 0; i < 4; i++) { const px = R() * w, py = 40 + R() * (h - 60); const pg = c.createRadialGradient(px, py, 0, px, py, 50); pg.addColorStop(0, rgba(pick2(R, T.neon), .22)); pg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = pg; ell(c, px, py, 60, 12); c.fill(); }
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const cx0 = R() * w, cy0 = 40 + R() * (h - 50); c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 + 14, cy0 + 4); c.lineTo(cx0 + 22, cy0 - 3); c.stroke(); }
    } else if (si === 1) {
      let y = 4, rh = 14, row = 0;
      while (y < h) { const tw = 40 + row * 6; for (let x = -(row % 2) * tw / 2; x < w; x += tw) { c.fillStyle = ((x / tw + row) | 0) % 2 ? 'rgba(255,63,216,.10)' : 'rgba(0,0,0,.28)'; c.fillRect(x, y, tw, rh); } c.strokeStyle = 'rgba(255,63,216,.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); y += rh; rh += 4; row++; }
      c.save(); c.shadowColor = '#ffe14a'; c.shadowBlur = 10; c.strokeStyle = '#ffe14a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 3); c.lineTo(w, 3); c.stroke(); c.restore();
      for (let i = 0; i < 40; i++) { c.fillStyle = rgba(pick2(R, T.neon), .7); c.save(); c.translate(R() * w, 10 + R() * (h - 14)); c.rotate(R() * 3); c.fillRect(-3, -1.2, 6, 2.4); c.restore(); }
    } else {
      c.strokeStyle = 'rgba(41,243,255,.12)'; c.lineWidth = 1;
      for (let y = 8, s = 10; y < h; y += s, s += 3) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      for (let x = 0; x < w; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (x - w / 2) * .25, h); c.stroke(); }
      c.save(); c.shadowColor = '#5dff9b'; c.shadowBlur = 12; c.strokeStyle = 'rgba(93,255,155,.6)'; c.lineWidth = 4; c.beginPath(); c.ellipse(320, 100, 180, 50, 0, 0, TAU); c.stroke();
      c.font = '60px Bungee, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(93,255,155,.35)'; c.save(); c.translate(320, 100); c.scale(1, .3); c.fillText('H', 0, 0); c.restore(); c.restore();
      c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 10; c.strokeStyle = '#29f3ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 2); c.lineTo(w, 2); c.stroke(); c.restore();
    }
  });
  // moon
  L.moon = makeLayer(220, 220, (c) => {
    const g = c.createRadialGradient(110, 110, 0, 110, 110, 110); g.addColorStop(0, rgba(T.moon, .5)); g.addColorStop(.45, rgba(T.moon, .15)); g.addColorStop(1, rgba(T.moon, 0));
    c.fillStyle = g; c.fillRect(0, 0, 220, 220);
    const m = c.createLinearGradient(0, 60, 0, 160); m.addColorStop(0, '#fff'); m.addColorStop(1, T.moon);
    c.fillStyle = m; circ(c, 110, 110, 46); c.fill();
    c.fillStyle = T.sky[1]; for (let i = 0; i < 5; i++) c.fillRect(60, 118 + i * 9, 100, 3 + i * .6);
  });
  L.T = T;
  return L;
}
function buildRoofWall(c, w, h, T, R) {
  // parapet + rooftop gear
  for (let x = 0; x < w; x += 480) {
    // water tank
    const tx = x + 60;
    c.fillStyle = '#16233c'; for (const lx of [tx + 8, tx + 70]) c.fillRect(lx, 110, 6, 80);
    c.fillStyle = '#1d3150'; rr(c, tx, 30, 84, 86, 10); c.fill(); c.strokeStyle = '#0c0720'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(41,243,255,.35)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(tx, 46 + i * 18); c.lineTo(tx + 84, 46 + i * 18); c.stroke(); }
    // antenna + dish
    const ax = x + 220;
    c.strokeStyle = '#2b3d5e'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, h); c.lineTo(ax, 10); c.moveTo(ax - 16, 40); c.lineTo(ax + 16, 40); c.moveTo(ax - 10, 70); c.lineTo(ax + 10, 70); c.stroke();
    c.save(); c.shadowColor = '#ff3a5a'; c.shadowBlur = 12; c.fillStyle = '#ff3a5a'; circ(c, ax, 8, 3.5); c.fill(); c.restore();
    c.fillStyle = '#c8d4ea'; c.beginPath(); c.ellipse(ax + 90, 110, 34, 22, -.5, 0, TAU); c.fill(); c.strokeStyle = '#0c0720'; c.stroke();
    // AC boxes
    for (let i = 0; i < 2; i++) { const bx = x + 320 + i * 70; c.fillStyle = '#1a2b46'; rr(c, bx, 130, 60, 60, 5); c.fill(); c.stroke(); c.strokeStyle = 'rgba(93,255,155,.5)'; c.beginPath(); c.arc(bx + 30, 160, 18, 0, TAU); c.stroke(); }
  }
  // parapet
  c.fillStyle = '#122039'; c.fillRect(0, 186, w, h - 186);
  c.save(); c.shadowColor = '#29f3ff'; c.shadowBlur = 14; c.strokeStyle = '#29f3ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 190); c.lineTo(w, 190); c.stroke(); c.restore();
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 2; for (let x = 0; x < w; x += 60) { c.beginPath(); c.moveTo(x, 192); c.lineTo(x, h); c.stroke(); }
}
