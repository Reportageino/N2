/* ===================== N2 — menus & loop ===================== */
const $ = id => document.getElementById(id);
const SCREENS = ['s-title', 's-diff', 's-cust', 's-shop', 's-ach', 's-set', 's-story', 's-pause', 's-over', 's-clear', 's-win'];
function showScreen(id) { SCREENS.forEach(s => { $(s).hidden = s !== id; }); }
function hideScreens() { showScreen(null); }
const CAPS = ['#c8a477', '#9aa0ab', '#1d1d26', '#29f3ff', '#ff3fd8', '#5dff9b', '#9b6bff', '#ff8a1f'];

function refreshTitle() {
  $('coins-t').textContent = fa(SAVE.coins);
  const D = dailyToday();
  $('daily').textContent = SAVE.daily.done ? 'چالش امروز انجام شد ✓' : `چالش امروز: ${D.name}  (${fa(Math.min(SAVE.daily.prog, D.goal))}/${fa(D.goal)})  — جایزه ${fa(DAILY_REWARD)} سکه`;
  $('b-cont').hidden = !SAVE.run;
}
function toMenu() {
  G.state = 'menu'; G.mode = 'story'; G.ents = []; G.items = []; G.shots = []; G.fx = []; G.ghosts = []; G.boss = null; G.banner = null; G.hero = null; G.zoom = null;
  G.rain = []; G.shake = 0; G.flashT = 0; G.story = null; G.F = null;
  if (!G.art || G.stage !== 0) { G.stage = 0; G.art = buildStage(0); }
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  saveGame(); musPlay('menu'); refreshTitle(); showScreen('s-title');
}
function goFull() {
  try { if (document.fullscreenEnabled && !document.fullscreenElement && !window.N2Android) document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { }
  try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { }
}
function newGame(diff) {
  G.diff = diff; G.D = DIFFS[diff]; G.lives = G.D.lives; G.score = 0; G.stageScore = 0;
  hideScreens(); goFull(); runStep(0);
}
function continueGame() {
  const r = SAVE.run; if (!r) return;
  G.diff = r.diff; G.D = DIFFS[r.diff]; G.lives = Math.max(1, r.lives); G.score = r.score; G.stageScore = r.score;
  hideScreens(); goFull(); runStep(r.step);
}
function pauseGame() {
  if (G.state !== 'play' && G.state !== 'fight') return;
  G.prevState = G.state; G.state = 'paused'; INP.mx = INP.my = 0; INP.joy.id = null; INP.ptr = {}; INP.held = {};
  $('b-psnd').textContent = 'صدا: ' + (SET.mus || SET.sfx ? 'روشن' : 'خاموش');
  showScreen('s-pause'); saveGame();
  try { AU.ctx && AU.ctx.suspend(); } catch (e) { }
}
function resumeGame() {
  if (G.state !== 'paused') return;
  hideScreens(); G.state = G.prevState || 'play';
  try { AU.ctx && AU.ctx.resume(); } catch (e) { }
}
function restartCurrent() {
  try { AU.ctx && AU.ctx.resume(); } catch (e) { }
  hideScreens();
  if (G.mode === 'survival') startSurvival();
  else if (G.mode === 'fight') startFight(G.fightFrom);
  else if (G.mode === 'bonus') startBonus(G.stage);
  else { G.lives = G.D.lives; G.score = G.stageScore; startStage(G.stage); }
}
function stageClearScreen() {
  G.score += 1000 * (G.stage + 1) + Math.max(0, Math.round(300 - G.stageT)) * 5;
  $('clear-t').textContent = 'مرحله ' + fa(G.stage + 1) + ' تمام شد!';
  $('clear-score').textContent = G.score;
  $('clear-sub').textContent = `سکه‌های این مرحله: ${fa(G.runCoins)}`;
  SAVE.run = { diff: G.diff, step: G.step + 1, score: G.score, lives: G.lives }; saveGame();
  showScreen('s-clear');
}
function bonusResult() {
  const r = clamp(G.bonusDmg / (G.car ? G.car.maxHp : 1), 0, 1), destroyed = G.car && G.car.dead;
  const reward = Math.round(r * 120) + (destroyed ? 80 : 0);
  addCoins(reward); saveGame();
  $('clear-t').textContent = destroyed ? 'ماشین داغون شد!' : 'وقت تمام شد!';
  $('clear-score').textContent = '+' + reward;
  $('clear-sub').textContent = `${fa(Math.round(r * 100))}٪ خرابی — سکه‌های جمع‌شده: ${fa(G.runCoins)}`;
  SAVE.run = { diff: G.diff, step: G.step + 1, score: G.score, lives: G.lives }; saveGame();
  showScreen('s-clear');
}
function gameOverScreen() {
  if (G.mode === 'fight') {
    $('over-t').textContent = 'کینگ آریان برد! اُس!';
    $('over-score').textContent = fa(G.F ? G.F.wins[0] : 0) + ' - ' + fa(G.F ? G.F.wins[1] : 2);
    $('over-sub').textContent = 'نکته: وقتی شیرجه می‌زنه بپر، وقتی قفل کرد سریع ضربه بزن!';
    $('over-list').hidden = true; $('b-retry').textContent = 'مبارزه دوباره';
    showScreen('s-over'); return;
  }
  const surv = G.mode === 'survival';
  $('over-t').textContent = surv ? 'تا موج ' + fa(G.wave) + ' دوام آوردی!' : 'نیما شکست خورد!';
  $('over-score').textContent = G.score;
  $('b-retry').textContent = surv ? 'دوباره' : 'دوباره از همین مرحله';
  const L = $('over-list');
  if (surv) {
    SAVE.surv = (SAVE.surv || []).concat([{ s: G.score, w: G.wave, d: todayKey() }]).sort((a, b) => b.s - a.s).slice(0, 5); saveGame();
    $('over-sub').textContent = 'بهترین رکوردها';
    L.innerHTML = SAVE.surv.map((r, i) => `<div><span>${fa(i + 1)}. موج ${fa(r.w)}</span><span>${r.s}</span></div>`).join('');
    L.hidden = false;
  } else { $('over-sub').textContent = `سکه‌ها: ${fa(SAVE.coins)}`; L.hidden = true; }
  showScreen('s-over');
}
function winGame() {
  if (G.diff === 'hard') unlock('hardwin');
  const b = store.get('best', {}); const nb = Math.max(b[G.diff] || 0, G.score); b[G.diff] = nb; store.set('best', b);
  SAVE.run = null; saveGame();
  G.state = 'menu'; musPlay('win');
  $('win-score').textContent = G.score; $('win-best').textContent = 'بهترین امتیاز: ' + fa(nb);
  showScreen('s-win');
}

/* ---------- customization ---------- */
function syncCust() {
  const sk = $('o-skin'); sk.innerHTML = '';
  for (const k in SKINS) {
    const b = document.createElement('button'); b.className = 'chip'; b.dataset.v = k;
    b.textContent = SAVE.owned[k] ? SKINS[k].name : SKINS[k].name + ' · ' + fa(SKINS[k].price);
    if (!SAVE.owned[k]) b.style.opacity = .55;
    b.setAttribute('aria-pressed', LOOK.skin === k); sk.appendChild(b);
  }
  for (const b of $('o-beard').children) b.setAttribute('aria-pressed', b.dataset.v === LOOK.beard);
  for (const b of $('o-cap').children) b.setAttribute('aria-pressed', b.dataset.v === LOOK.cap);
}
function buildCust() {
  const cap = $('o-cap');
  CAPS.forEach(col => { const b = document.createElement('button'); b.className = 'sw'; b.dataset.v = col; b.style.background = col; b.setAttribute('aria-label', 'رنگ کلاه'); cap.appendChild(b); });
  $('o-skin').addEventListener('click', ev0 => {
    const b = ev0.target.closest('button'); if (!b) return;
    if (!SAVE.owned[b.dataset.v]) { SFX.ui(); openShop('skin'); return; }
    LOOK.skin = b.dataset.v; store.set('look', LOOK); syncCust(); SFX.ui();
  });
  const bind = (id, key) => $(id).addEventListener('click', ev0 => { const b = ev0.target.closest('button'); if (!b) return; LOOK[key] = b.dataset.v; store.set('look', LOOK); syncCust(); SFX.ui(); });
  bind('o-beard', 'beard'); bind('o-cap', 'cap');
}
const prevC = $('prev'), pc = prevC.getContext('2d');
let prevT = 0;
function renderPreview(dt) {
  prevT += dt;
  const W = prevC.width, H = prevC.height;
  pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, W, H);
  const cyc = prevT % 9, weapons = ['bat', 'pipe', 'skate', 'sign', 'hammer'];
  let anim = 'idle', p = 0, wpn = null, mood = 'smile';
  if (cyc > 2 && cyc < 3.6) anim = 'walk';
  else if (cyc >= 3.6 && cyc < 6) { const k = (cyc - 3.6) % .8; wpn = weapons[Math.floor(prevT / 9) % weapons.length]; anim = k < .4 ? 'swingA' : 'swingB'; p = (k % .4) / .4; mood = 'angry'; }
  else if (cyc >= 6.6 && cyc < 8) { anim = 'victory'; mood = 'happy'; }
  else if (cyc >= 8) mood = 'wink';
  pc.fillStyle = 'rgba(0,0,0,.35)'; ell(pc, W / 2, H - 46, 90, 18); pc.fill();
  drawNima(pc, W / 2 - 10, H - 46, 1, poseOf({ anim, animT: prevT, p }), LOOK, wpn, 3.2, prevT, mood);
}

/* ---------- shop ---------- */
let shopTab = 'skin';
function openShop(tab) { shopTab = tab || shopTab; renderShop(); showScreen('s-shop'); }
function renderShop() {
  $('coins-s').textContent = fa(SAVE.coins);
  $('tab-skin').setAttribute('aria-pressed', shopTab === 'skin'); $('tab-up').setAttribute('aria-pressed', shopTab === 'up');
  const g = $('shop-grid'); g.innerHTML = '';
  if (shopTab === 'skin') {
    for (const k in SKINS) {
      const K = SKINS[k], own = !!SAVE.owned[k], eq = LOOK.skin === k;
      const d = document.createElement('div'); d.className = 'card' + (own ? ' owned' : '');
      const cvs = document.createElement('canvas'); cvs.width = 240; cvs.height = 240;
      const x = cvs.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.3)'; ell(x, 120, 222, 60, 10); x.fill();
      drawNima(x, 112, 222, 1, poseOf({ anim: 'idle', animT: 0 }), Object.assign({}, LOOK, { skin: k }), null, 1.6, 1, 'smile');
      d.appendChild(cvs);
      d.insertAdjacentHTML('beforeend', `<b>${K.name}</b>`);
      const b = document.createElement('button'); b.className = 'btn ' + (own ? '' : 'gd');
      b.textContent = eq ? 'پوشیده' : own ? 'بپوش' : fa(K.price) + ' سکه';
      b.disabled = eq;
      b.addEventListener('click', () => {
        if (own) { LOOK.skin = k; store.set('look', LOOK); SFX.ui(); renderShop(); return; }
        if (SAVE.coins < K.price) { b.textContent = 'سکه کافی نیست'; SFX.hurt(); setTimeout(renderShop, 900); return; }
        SAVE.coins -= K.price; SAVE.owned[k] = 1; LOOK.skin = k; store.set('look', LOOK); saveGame(); SFX.pickup(); renderShop();
      });
      d.appendChild(b); g.appendChild(d);
    }
  } else {
    for (const k in UPGRADES) {
      const U = UPGRADES[k], lv = SAVE.up[k] || 0, max = U.prices.length, price = U.prices[lv];
      const d = document.createElement('div'); d.className = 'card' + (lv >= max ? ' owned' : '');
      d.insertAdjacentHTML('beforeend', `<b>${U.name}</b><span class="small">${U.desc}</span><span class="small">سطح ${fa(lv)} از ${fa(max)}</span>`);
      const b = document.createElement('button'); b.className = 'btn gd';
      b.textContent = lv >= max ? 'کامل' : fa(price) + ' سکه'; b.disabled = lv >= max;
      b.addEventListener('click', () => {
        if (SAVE.coins < price) { b.textContent = 'سکه کافی نیست'; SFX.hurt(); setTimeout(renderShop, 900); return; }
        SAVE.coins -= price; SAVE.up[k] = lv + 1; saveGame(); SFX.pickup(); renderShop();
      });
      d.appendChild(b); g.appendChild(d);
    }
  }
}

/* ---------- achievements ---------- */
function renderAch() {
  const D = dailyToday();
  $('daily2').textContent = SAVE.daily.done ? 'چالش امروز انجام شد ✓' : `چالش امروز: ${D.name}  (${fa(Math.min(SAVE.daily.prog, D.goal))}/${fa(D.goal)})`;
  const n = ACH.filter(a => SAVE.ach[a.id]).length;
  $('ach-list').innerHTML = `<div class="ach done"><span class="ic">${n}</span><div><b>${fa(n)} از ${fa(ACH.length)} باز شده</b><span>هر دستاورد سکه جایزه دارد</span></div></div>` +
    ACH.map(a => `<div class="ach${SAVE.ach[a.id] ? ' done' : ''}"><span class="ic">${SAVE.ach[a.id] ? '✓' : '?'}</span><div><b>${a.name}</b><span>${a.desc} — ${fa(a.reward)} سکه</span></div></div>`).join('');
}

/* ---------- settings ---------- */
function syncSet() {
  const on = v => v ? 'روشن' : 'خاموش';
  $('t-mus').textContent = on(SET.mus); $('t-mus').setAttribute('aria-pressed', SET.mus);
  $('t-sfx').textContent = on(SET.sfx); $('t-sfx').setAttribute('aria-pressed', SET.sfx);
  $('t-vib').textContent = on(SET.vib); $('t-vib').setAttribute('aria-pressed', SET.vib);
  $('t-q').textContent = SET.q === 'high' ? 'بالا' : 'سبک'; $('t-q').setAttribute('aria-pressed', SET.q === 'high');
}
function toggleSet(k) {
  if (k === 'q') { SET.q = SET.q === 'high' ? 'low' : 'high'; applyQuality(); resize(); G.art = buildStage(G.stage); }
  else SET[k] = !SET[k];
  store.set('set', SET); auVol(); syncSet(); SFX.ui();
}

/* ---------- wiring ---------- */
function wire() {
  const on = (id, fn) => $(id).addEventListener('click', ev0 => { ev0.stopPropagation(); auInit(); SFX.ui(); fn(); });
  on('b-start', () => showScreen('s-diff'));
  on('b-cont', continueGame);
  on('b-surv', () => { goFull(); startSurvival(); });
  on('b-vs', () => { goFull(); G.diff = 'normal'; G.D = DIFFS.normal; G.score = 0; startFight('menu'); });
  on('b-shop', () => openShop('skin'));
  on('b-cust', () => { syncCust(); showScreen('s-cust'); });
  on('b-ach', () => { renderAch(); showScreen('s-ach'); });
  on('b-set', () => { syncSet(); showScreen('s-set'); });
  on('tab-skin', () => { shopTab = 'skin'; renderShop(); });
  on('tab-up', () => { shopTab = 'up'; renderShop(); });
  on('b-normal', () => newGame('normal'));
  on('b-hard', () => newGame('hard'));
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { SFX.ui(); refreshTitle(); showScreen('s-title'); }));
  ['mus', 'sfx', 'vib', 'q'].forEach(k => $('t-' + k).addEventListener('click', ev0 => { ev0.preventDefault(); toggleSet(k); }));
  $('s-story').addEventListener('click', () => { auInit(); storyTap(); });
  on('b-skip', () => storyEnd());
  on('b-resume', resumeGame);
  on('b-restart', restartCurrent);
  on('b-psnd', () => { const v = !(SET.mus || SET.sfx); SET.mus = SET.sfx = v; store.set('set', SET); auVol(); $('b-psnd').textContent = 'صدا: ' + (v ? 'روشن' : 'خاموش'); });
  on('b-quit', toMenu);
  on('b-retry', () => { if (G.mode === 'fight') startFight(G.fightFrom); else if (G.mode === 'survival') startSurvival(); else { G.lives = G.D.lives; G.score = G.stageScore; hideScreens(); startStage(G.stage); } });
  on('b-omenu', toMenu);
  on('b-next', () => { hideScreens(); runStep(G.step + 1); });
  on('b-again', () => showScreen('s-diff'));
  on('b-wmenu', toMenu);
  document.addEventListener('pointerdown', () => auInit(), { passive: true });
  addEventListener('resize', resize);
  addEventListener('orientationchange', () => setTimeout(resize, 200));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseGame(); saveGame(); } });
  buildCust();
}
window.n2Pause = () => { pauseGame(); saveGame(); };
window.n2Back = () => {
  if (G.state === 'play' || G.state === 'fight') { pauseGame(); return true; }
  if (G.state === 'paused') { resumeGame(); return true; }
  if (G.state === 'story') { storyEnd(); return true; }
  const open = SCREENS.find(s => !$(s).hidden);
  if (open && open !== 's-title') { toMenu(); return true; }
  return false;
};

/* ---------- loop ---------- */
let last = 0;
function frame(ts) {
  const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
  if (G.state !== 'paused') update(dt);
  INP.atkE = INP.jumpE = INP.spE = INP.dashE = INP.n2E = false;
  render();
  if (!$('s-cust').hidden) renderPreview(dt);
  requestAnimationFrame(frame);
}
async function boot() {
  applyQuality(); resize(); wire();
  try {
    await Promise.race([
      Promise.all(['24px Lalezar', '24px Bungee', '16px Vazirmatn', 'bold 16px Vazirmatn'].map(f => document.fonts.load(f))),
      new Promise(r => setTimeout(r, 3500))
    ]);
  } catch (e) { }
  G.stage = 0; G.art = buildStage(0);
  $('loading').hidden = true;
  toMenu();
  requestAnimationFrame(t => { last = t; frame(t); });
}
boot();
