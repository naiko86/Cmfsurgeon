/* Scroll-scrubbed film hero. One video plays forward and backward with the scroll.
   Phones, portrait tablets, short landscape phones and reduced motion get the static
   image hero from the CSS and never download the video. */
(() => {
  const film = document.querySelector('.film');
  if (!film) return;
  const stage = film.querySelector('.film-stage');
  const video = film.querySelector('.film-video');
  const poster = film.querySelector('.film-poster');
  const VIDEO_URL = 'assets/hero-scrub.mp4';

  // Must match the media query in styles.css exactly.
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  const MQLS = GATES.map(q => matchMedia(q));

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

  // Split marked lines into word spans once, with ordered thresholds.
  film.querySelectorAll('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.style.setProperty('--th', (i / words.length * 0.5).toFixed(3));
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  const bands = [...film.querySelectorAll('.band')].map((el, i, all) => ({
    el, a: parseFloat(el.dataset.a), b: parseFloat(el.dataset.b),
    first: i === 0, last: i === all.length - 1, op: -1, k: -1
  }));

  let target = 0, shown = 0, rafId = null, lastTick = 0;
  let scrubOn = false, inited = false, onScreen = true;
  let seekBusy = false, pendingTime = null;
  let loadK = 0, loadStart = 0;

  function heroProgress() {
    const r = film.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
  }

  function requestSeek(t) {
    if (!video.duration) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    video.currentTime = Math.min(t, video.duration - 0.04);
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
  });
  video.addEventListener('error', () => {
    seekBusy = false; pendingTime = null;
    stage.classList.add('video-failed');
  });

  function updateBands(p) {
    for (const band of bands) {
      const { a, b } = band;
      const f = Math.min(0.02, (b - a) / 3);
      let op = (band.first ? 1 : smoothstep(p, a, a + f)) * (band.last ? 1 : 1 - smoothstep(p, b - f, b));
      if (p < a || p > b) op = 0;
      let k = clamp((p - a) / Math.min(0.03, (b - a) * 0.35), 0, 1);
      if (band.first) k = Math.max(k, loadK);
      if (Math.abs(op - band.op) > 0.008 || (op === 0) !== (band.op === 0) || (op === 1) !== (band.op === 1)) {
        band.op = op;
        band.el.style.opacity = op.toFixed(3);
        band.el.style.visibility = op === 0 ? 'hidden' : 'visible';
      }
      if (Math.abs(k - band.k) > 0.008 || (k === 1) !== (band.k === 1) || (k === 0) !== (band.k === 0)) {
        band.k = k;
        band.el.style.setProperty('--k', k.toFixed(3));
      }
    }
  }

  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.16, dt / 16.667));
    if (loadK < 1) loadK = clamp((now - loadStart) / 900, 0, 1);
    const settled = Math.abs(target - shown) < 0.0005;
    if (settled) shown = target;
    requestSeek(shown * (video.duration || 0));
    updateBands(shown);
    if (settled && loadK >= 1) { rafId = null; lastTick = 0; }
    else rafId = requestAnimationFrame(tick);
  }

  function onScroll() {
    target = heroProgress();
    if (rafId === null && onScreen) rafId = requestAnimationFrame(tick);
  }

  async function loadVideo() {
    try {
      const res = await fetch(VIDEO_URL, { priority: 'low' });
      if (!res.ok) throw new Error(res.status);
      video.src = URL.createObjectURL(await res.blob());
      video.load();
      video.addEventListener('loadeddata', () => {
        requestSeek(heroProgress() * video.duration);
        stage.classList.add('video-ready');
      }, { once: true });
    } catch (e) {
      stage.classList.add('video-failed');
    }
  }

  function initOnce() {
    if (inited) return;
    inited = true;
    poster.style.backgroundImage = "url('assets/hero-poster.jpg')";
    let started = false;
    const start = () => { if (!started) { started = true; loadVideo(); } };
    const img = new Image();
    img.onload = start; img.onerror = start;
    img.src = 'assets/hero-poster.jpg';
    setTimeout(start, 4000);
    new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen && scrubOn) onScroll(); }).observe(film);
  }

  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    film.classList.add('scrub');
    initOnce();
    loadStart = performance.now();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    bands.forEach(b => { b.op = -1; b.k = -1; });
    shown = target = heroProgress();
    updateBands(shown);
    onScroll();
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    film.classList.remove('scrub');
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    bands.forEach(b => { b.el.style.opacity = ''; b.el.style.visibility = ''; b.el.style.removeProperty('--k'); });
  }
  function applyMode() {
    if (MQLS.some(m => m.matches)) disableScrub(); else enableScrub();
  }
  MQLS.forEach(m => m.addEventListener('change', applyMode));
  applyMode();

  // Section entrances below the film
  const items = document.querySelectorAll('.section-head, .tile, .glass, .portrait, .stats, .connect-copy, .card-stack, .intro-lead');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', ((i % 3) * 0.08) + 's'); io.observe(el); });
  }
})();
