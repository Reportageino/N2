/* NIMA: Neon Rampage service worker — offline play after first visit */
const CACHE = 'nima-nr-v22';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'];
const IMGS = ['./img/nima/axeA.ebb72e41.webp','./img/nima/axeC.dc20402c.webp','./img/nima/batA.140e59ac.webp','./img/nima/batC.2b558640.webp','./img/nima/combo.285d8fb7.webp','./img/nima/dodge.fa94c2a5.webp','./img/nima/fall.3a29dfe2.webp','./img/nima/getup.2ae0d84d.webp','./img/nima/guard.661c046c.webp','./img/nima/hand_dodge.2725b013.webp','./img/nima/hand_guard.b1ad48ee.webp','./img/nima/hand_idleB.6f3e9e5f.webp','./img/nima/hand_jumpk.8948804b.webp','./img/nima/hand_rifle.b3384016.webp','./img/nima/hand_walkB.07668049.webp','./img/nima/hand_wpn1.a3cbea2f.webp','./img/nima/hand_wpn2.2178757e.webp','./img/nima/hit.a3af645c.webp','./img/nima/idleB.0680efdc.webp','./img/nima/jumpk.7d3e71b8.webp','./img/nima/kick.25e771e3.webp','./img/nima/pickB.4fb5479f.webp','./img/nima/pistol.c34cb951.webp','./img/nima/pistolA.55ad35d2.webp','./img/nima/pistolC.55bd260d.webp','./img/nima/rifle.ead356c6.webp','./img/nima/run.f71a21ff.webp','./img/nima/shotgunA.3649ecdd.webp','./img/nima/shotgunC.328c6128.webp','./img/nima/smgA.e5a582d5.webp','./img/nima/smgC.0da192c1.webp','./img/nima/stickA.48b1eec0.webp','./img/nima/stickC.f1dd2e63.webp','./img/nima/stomp.26666e92.webp','./img/nima/throwB.234152fc.webp','./img/nima/upper2.60edcb81.webp','./img/nima/victory.211104ef.webp','./img/nima/walkB.516053f5.webp','./img/nima/wpn1.da77afb8.webp','./img/nima/wpn2.457b9bc2.webp'];   // filled in by build.sh: every sprite sheet, cached in the background for offline play
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => { c.addAll(IMGS).catch(() => {}); })).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  // stale-while-revalidate: instant from cache, refreshed in the background (fonts included)
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
