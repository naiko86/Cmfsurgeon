/* Scroll-animated operating-room scenes behind the content (decorative, aria-hidden).
   Each section names its scene via data-scene. While scrolling, scenes cross-fade, their
   line art draws itself in (paths with class "draw" and pathLength="1") and layers
   (<g class="layer" data-depth>) drift with parallax. Honours prefers-reduced-motion. */
(() => {
  const stage = document.querySelector('.stage');
  if (!stage || !window.fetch) return;
  const conn = navigator.connection;
  if (conn && conn.saveData) return;

  const KEYS = ['orlight', 'instruments', 'surgeon'];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('[data-scene]')];
  const scenes = {};
  let portrait = false;
  let queued = false;
  let last = 0;
  let introUntil = 0;

  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

  // Wrap an element in a fresh <g> so we can transform it without clobbering its own transform.
  function wrap(el) {
    const g = document.createElementNS(SVG_NS, 'g');
    el.parentNode.insertBefore(g, el);
    g.appendChild(el);
    return g;
  }

  async function load(key) {
    const res = await fetch(`assets/scenes/${key}.svg`);
    if (!res.ok) throw new Error(`scene ${key}: ${res.status}`);
    const holder = document.createElement('div');
    holder.className = 'scene';
    holder.innerHTML = await res.text();
    const svg = holder.querySelector('svg');
    if (!svg) return;
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const paths = [...svg.querySelectorAll('.draw')];
    paths.forEach(p => { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; p.style.visibility = 'hidden'; });
    const layers = [...svg.querySelectorAll('.layer')].map(el => ({ g: wrap(el), depth: parseFloat(el.dataset.depth) || 0.3 }));
    const head = svg.querySelector('[data-pivot]');
    const pivot = head ? head.dataset.pivot.trim().split(/[\s,]+/).map(Number) : null;
    const swing = head && pivot && pivot.length === 2 && pivot.every(Number.isFinite) ? wrap(head) : null;
    const lights = [...svg.querySelectorAll('[id$="-beam"], [id$="-glow"]')];
    stage.appendChild(holder);
    scenes[key] = { holder, svg, paths, layers, swing, pivot, lights, opacity: 0, draw: 0, prog: 0.5, drawn: -1 };
  }

  function measure() {
    portrait = window.innerWidth / window.innerHeight < 0.9;
    Object.values(scenes).forEach(s => s.svg.setAttribute('viewBox', portrait ? '500 0 1000 1000' : '0 0 1600 1000'));
  }

  // Where each scene should be, given the current scroll position.
  function targets() {
    const vh = window.innerHeight;
    const probe = vh * 0.5;
    const fade = vh * 0.3;
    const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
    const t = {};
    KEYS.forEach(k => { t[k] = { w: 0, draw: 0, prog: 0.5 }; });
    for (const sec of sections) {
      const key = sec.dataset.scene;
      if (!t[key]) continue;
      const r = sec.getBoundingClientRect();
      const w = clamp(Math.min(probe - r.top + fade, r.bottom - probe + fade) / (2 * fade));
      if (w <= t[key].w) continue;
      t[key] = {
        w,
        // starts when the section enters at the bottom, complete once its top nears the top edge
        draw: atEnd && r.bottom <= vh + 4 ? 1 : clamp((vh - r.top) / (vh * 0.88)),
        prog: clamp((probe - r.top) / Math.max(r.height, 1)),
      };
    }
    return t;
  }

  function render(s) {
    s.holder.style.opacity = (s.opacity * (portrait ? 0.7 : 0.85)).toFixed(3);
    if (s.opacity < 0.004) return;
    if (Math.abs(s.draw - s.drawn) > 0.0005) {
      const n = Math.max(s.paths.length, 1);
      s.paths.forEach((p, i) => {
        const v = clamp((s.draw - (i / n) * 0.45) / 0.55);
        p.style.visibility = v <= 0 ? 'hidden' : '';
        p.style.strokeDashoffset = (1 - v).toFixed(4);
      });
      s.drawn = s.draw;
    }
    s.lights.forEach(el => { el.style.opacity = (0.2 + 0.8 * clamp(s.draw * 1.25 - 0.25)).toFixed(3); });
    if (reduce.matches) return;
    const off = s.prog - 0.5;
    s.layers.forEach(L => L.g.setAttribute('transform', `translate(0 ${(-off * L.depth * 140).toFixed(1)})`));
    if (s.swing) s.swing.setAttribute('transform', `rotate(${(off * 7).toFixed(2)} ${s.pivot[0]} ${s.pivot[1]})`);
  }

  function frame(now) {
    queued = false;
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now;
    // Slower easing right after load so the first scene visibly draws itself in.
    const tau = now < introUntil ? 700 : 260;
    const k = reduce.matches ? 1 : 1 - Math.exp(-dt / tau);
    const t = targets();
    let moving = false;
    for (const key of KEYS) {
      const s = scenes[key];
      if (!s) continue;
      const g = t[key];
      const goalDraw = reduce.matches ? 1 : g.draw;
      s.opacity += (g.w - s.opacity) * k;
      s.draw += (goalDraw - s.draw) * k;
      s.prog += (g.prog - s.prog) * k;
      if (Math.abs(g.w - s.opacity) > 0.002 || Math.abs(goalDraw - s.draw) > 0.002 || Math.abs(g.prog - s.prog) > 0.002) moving = true;
      render(s);
    }
    if (moving) request();
    else last = 0;
  }

  function request() {
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  }

  Promise.allSettled(KEYS.map(load)).then(() => {
    introUntil = performance.now() + 2200;
    measure();
    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', () => { measure(); request(); });
    reduce.addEventListener?.('change', request);
  });
})();
