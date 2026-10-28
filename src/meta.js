/* ===================== N2 — progress, coins, achievements, daily challenge ===================== */
const SAVE = Object.assign({
  coins: 0, owned: { normal: 1, halloween: 1 }, up: { hp: 0, dur: 0, en: 0 }, ach: {},
  stats: { ko: 0, throws: 0, breaks: 0, coins: 0, n2: 0 },
  daily: { date: '', id: '', prog: 0, done: false },
  prog: { normal: 0, hard: 0 }, run: null, surv: []
}, store.get('save', {}));
['owned', 'up', 'ach', 'stats', 'daily', 'prog'].forEach(k => { if (typeof SAVE[k] !== 'object' || !SAVE[k]) SAVE[k] = {}; });
SAVE.owned.normal = 1; SAVE.owned.halloween = 1;
SAVE.stats.escapes = SAVE.stats.escapes || 0;
function saveGame() { store.set('save', SAVE); }

const UPGRADES = {
  hp: { name: 'جان بیشتر', desc: '+۱۵ جان در هر سطح', prices: [250, 500, 900] },
  dur: { name: 'سلاح محکم‌تر', desc: '+۲۰٪ دوام سلاح‌ها', prices: [200, 450, 800] },
  en: { name: 'شروع پرانرژی', desc: 'انرژی ویژه بیشتر در شروع مرحله', prices: [300, 700] }
};

const ACH = [
  { id: 'first', name: 'اولین ناک‌اوت', desc: 'یک دشمن را ناک‌اوت کن', reward: 20 },
  { id: 'combo25', name: 'دست‌گرمی', desc: 'کمبوی ۲۵ تایی بزن', reward: 50 },
  { id: 'combo50', name: 'استاد کمبو', desc: 'کمبوی ۵۰ تایی بزن', reward: 120 },
  { id: 'boss1', name: 'شاه‌کش', desc: 'سلطان خیابان را شکست بده', reward: 100 },
  { id: 'boss2', name: 'گیم اوور', desc: 'آرکیدوس را شکست بده', reward: 150 },
  { id: 'boss3', name: 'نور به شهر برگشت', desc: 'پادشاه نئون را شکست بده', reward: 250 },
  { id: 'nohit', name: 'دست‌نخورده', desc: 'یک باس را بدون آسیب دیدن ببر', reward: 200 },
  { id: 'fists', name: 'مشت آهنین', desc: 'یک باس را بدون سلاح ببر', reward: 200 },
  { id: 'throw10', name: 'پرتاب‌گر', desc: '۱۰ دشمن را پرت کن', reward: 80 },
  { id: 'break20', name: 'سلاح‌شکن', desc: '۲۰ سلاح بشکن', reward: 100 },
  { id: 'car', name: 'اوراقچی', desc: 'ماشین بونوس را کامل خرد کن', reward: 100 },
  { id: 'n2', name: 'حالت N2', desc: 'حالت خشم N2 را فعال کن', reward: 40 },
  { id: 'gold', name: 'گنج طلایی', desc: 'چکش طلایی را پیدا کن', reward: 60 },
  { id: 'surv10', name: 'نفس‌بُر', desc: 'در حالت بی‌پایان به موج ۱۰ برس', reward: 200 },
  { id: 'hardwin', name: 'افسانه نئون', desc: 'بازی را در سطح سخت تمام کن', reward: 500 },
  { id: 'rich', name: 'جیب پر', desc: 'در مجموع ۲۰۰۰ سکه جمع کن', reward: 150 },
  { id: 'arian', name: 'شاه واقعی', desc: 'کینگ آریان را شکست بده', reward: 300 },
  { id: 'escape3', name: 'لیز مثل ماهی', desc: '۳ بار از قفل‌های آریان فرار کن', reward: 120 },
  { id: 'perfect', name: 'پرفکت!', desc: 'یک راند را بدون آسیب دیدن ببر', reward: 150 }
];
const DAILIES = [
  { id: 'ko30', name: '۳۰ دشمن را ناک‌اوت کن', stat: 'ko', goal: 30 },
  { id: 'throw8', name: '۸ دشمن را پرت کن', stat: 'throws', goal: 8 },
  { id: 'break5', name: '۵ سلاح بشکن', stat: 'breaks', goal: 5 },
  { id: 'combo30', name: 'کمبوی ۳۰ تایی بزن', stat: 'combo', goal: 30, max: true },
  { id: 'wave8', name: 'در بی‌پایان به موج ۸ برس', stat: 'wave', goal: 8, max: true },
  { id: 'n2x3', name: '۳ بار حالت N2 را فعال کن', stat: 'n2', goal: 3 },
  { id: 'coins150', name: '۱۵۰ سکه جمع کن', stat: 'coins', goal: 150 }
];
const DAILY_REWARD = 150;
function todayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function dailyToday() {
  const k = todayKey();
  if (SAVE.daily.date !== k) {
    let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    SAVE.daily = { date: k, id: DAILIES[h % DAILIES.length].id, prog: 0, done: false }; saveGame();
  }
  return DAILIES.find(d => d.id === SAVE.daily.id) || DAILIES[0];
}
const TOASTS = [];
function toast(a, b, col) { TOASTS.push({ a, b: b || '', col: col || '#ffe14a', t: 0 }); }
function addCoins(n) { SAVE.coins += n; }
function unlock(id) {
  if (SAVE.ach[id]) return;
  const A = ACH.find(x => x.id === id); if (!A) return;
  SAVE.ach[id] = Date.now(); addCoins(A.reward); saveGame();
  toast('دستاورد: ' + A.name, '+' + fa(A.reward) + ' سکه');
  try { SFX.go(); } catch (e) { }
}
/* stat events: stat name, amount (or value for max-type) */
function ev(stat, n, isMax) {
  n = n == null ? 1 : n;
  if (!isMax && SAVE.stats[stat] != null) SAVE.stats[stat] += n;
  const D = dailyToday();
  if (!SAVE.daily.done && D.stat === stat) {
    SAVE.daily.prog = D.max ? Math.max(SAVE.daily.prog, n) : SAVE.daily.prog + n;
    if (SAVE.daily.prog >= D.goal) { SAVE.daily.done = true; addCoins(DAILY_REWARD); toast('چالش امروز انجام شد!', '+' + fa(DAILY_REWARD) + ' سکه', '#5dff9b'); saveGame(); }
  }
  const S = SAVE.stats;
  if (stat === 'ko' && S.ko >= 1) unlock('first');
  if (stat === 'combo' && n >= 25) unlock('combo25');
  if (stat === 'combo' && n >= 50) unlock('combo50');
  if (stat === 'throws' && S.throws >= 10) unlock('throw10');
  if (stat === 'breaks' && S.breaks >= 20) unlock('break20');
  if (stat === 'n2') unlock('n2');
  if (stat === 'coins' && S.coins >= 2000) unlock('rich');
  if (stat === 'wave' && n >= 10) unlock('surv10');
  if (stat === 'escapes' && S.escapes >= 3) unlock('escape3');
}
