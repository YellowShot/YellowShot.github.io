/*
 * The data-dot portrait. A photo (content.js → portrait) is sampled onto a grid; each bright cell
 * becomes a dot. On load the dots fly in from scattered grid positions and assemble, centre first.
 * The pointer pushes them away like a magnet and springs pull them home; a click sends a ripple.
 * Without a photo the same engine draws the initials, so the hero is never empty.
 * It sleeps whenever the dots are still or off screen, and draws a still portrait under reduced motion.
 */
(() => {
  "use strict";
  const cv = document.getElementById("portrait");
  if (!cv) return;
  const D = window.PORTFOLIO || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const readout = document.getElementById("portrait-read");
  const ctx = cv.getContext("2d");
  const css = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const K = 70, C = 11, R = 90, PUSH = 2600;          // spring, damping, pointer radius (px), push strength
  let W = 0, H = 0, dpr = 1, step = 6, parts = [], buckets = [[], [], [], []];
  let source = null, mx = -9999, my = -9999, ripples = [], raf = 0, last = 0, clock = 0, visible = true;
  let ink = "#ececef", acc = "#4ade80";

  const say = (t) => { if (readout && readout.textContent !== t) readout.textContent = t; };

  /* ── sources: a luminance grid (0..1, bright = big dot) of cols × rows ── */
  function fromImage(img, cols, rows) {
    const c = document.createElement("canvas"); c.width = cols; c.height = rows;
    const g = c.getContext("2d", { willReadFrequently: true });
    // cover-fit, keeping the upper part of the photo (where a face usually is)
    const s = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    g.drawImage(img, (cols - w) / 2, (rows - h) * 0.3, w, h);
    const px = g.getImageData(0, 0, cols, rows).data, L = new Float32Array(cols * rows);
    for (let i = 0; i < L.length; i++) L[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    // stretch contrast between the 3rd and 97th percentiles
    const sorted = Float32Array.from(L).sort(), lo = sorted[(L.length * 0.03) | 0], hi = sorted[(L.length * 0.97) | 0];
    for (let i = 0; i < L.length; i++) L[i] = clamp((L[i] - lo) / Math.max(0.05, hi - lo), 0, 1);
    // A light backdrop would fill the frame with dots. Inverting would turn the face into a negative, so
    // instead mask out what matches the backdrop (sampled from the top and side borders) and keep the
    // subject's true brightness: the portrait reads like a lit photo on black.
    const border = [];
    for (let x = 0; x < cols; x++) border.push(L[x]);
    for (let y = 0; y < rows * 0.7; y++) { border.push(L[y * cols]); border.push(L[y * cols + cols - 1]); }
    border.sort((a, b) => a - b);
    const bg = border[(border.length / 2) | 0];
    if (bg > 0.5) {
      const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
      for (let i = 0; i < L.length; i++) L[i] = Math.max(0.16, L[i]) * smooth(0.06, 0.2, Math.abs(L[i] - bg));
    }
    return L;
  }
  function fromText(text, cols, rows) {
    const scale = 4, c = document.createElement("canvas"); c.width = cols * scale; c.height = rows * scale;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `600 ${Math.round(c.height * 0.5)}px "Space Grotesk", system-ui, sans-serif`;
    g.fillText(text, c.width / 2, c.height * 0.52);
    const px = g.getImageData(0, 0, c.width, c.height).data, L = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let sum = 0;
      for (let j = 0; j < scale; j++) for (let i = 0; i < scale; i++) sum += px[(((y * scale + j) * c.width) + x * scale + i) * 4 + 3];
      L[y * cols + x] = sum / (scale * scale * 255);
    }
    return L;
  }

  /* ── build the dots for the current size; fly in only on the first build ── */
  function build(flyIn) {
    if (!source) return;
    const cols = clamp(Math.round(W / 5.2), 74, 120), rows = Math.round(cols * (H / W)); // ≥74 so phones keep the features
    step = W / cols;
    const L = source(cols, rows);
    const cx = W / 2, cy = H / 2, maxD = Math.hypot(cx, cy);
    parts = []; buckets = [[], [], [], []];
    // portrait focus: the lower part (shoulders, clothing) fades a little so the face leads
    const fade = (y) => { const t = clamp((y / rows - 0.6) / 0.4, 0, 1); return 1 - 0.42 * t * t * (3 - 2 * t); };
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const v = L[y * cols + x] * (source.photo ? fade(y) : 1);
      if (v < 0.14) continue;
      const tx = (x + 0.5) * step, ty = (y + 0.5) * step;
      const p = { tx, ty, x: tx, y: ty, vx: 0, vy: 0, s: step * (0.28 + 0.62 * Math.pow(v, 0.85)), d: 0 };
      if (flyIn) {
        // start somewhere on the page grid around the frame, wait by distance from the centre
        p.x = tx + (Math.random() - 0.5) * W * 1.6;
        p.y = ty + (Math.random() - 0.5) * H * 1.6;
        p.d = (Math.hypot(tx - cx, ty - cy) / maxD) * 0.7 + Math.random() * 0.25;
      }
      parts.push(p);
      buckets[Math.min(3, Math.floor(v * 4))].push(p);
    }
  }

  function size(flyIn) {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    build(flyIn);
    draw();
  }

  /* ── draw: four ink weights, plus accent for the dots the pointer is touching ── */
  const ALPHA = [0.28, 0.5, 0.72, 0.95];
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const near = [], R2 = (R * 1.25) ** 2;
    ctx.fillStyle = ink;
    for (let b = 0; b < 4; b++) {
      ctx.globalAlpha = ALPHA[b];
      ctx.beginPath();
      for (const p of buckets[b]) {
        if (clock < p.d) continue;
        const dx = p.x - mx, dy = p.y - my;
        if (dx * dx + dy * dy < R2) { near.push(p); continue; }
        ctx.rect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.fill();
    }
    if (near.length) {
      ctx.globalAlpha = 1; ctx.fillStyle = acc; ctx.beginPath();
      for (const p of near) ctx.rect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ── physics: springs home, a push from the pointer, impulses from ripples ── */
  function tick(dt) {
    clock += dt;
    let moving = false;
    ripples = ripples.filter((rp) => (rp.r += 520 * dt) < Math.hypot(W, H));
    for (const p of parts) {
      if (clock < p.d) { moving = true; continue; }
      let ax = (p.tx - p.x) * K - p.vx * C, ay = (p.ty - p.y) * K - p.vy * C;
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d < R && d > 0.01) { const f = (1 - d / R) ** 2 * PUSH; ax += (dx / d) * f; ay += (dy / d) * f; }
      for (const rp of ripples) {
        const ex = p.tx - rp.x, ey = p.ty - rp.y, e = Math.hypot(ex, ey), band = Math.abs(e - rp.r);
        if (band < 22 && e > 0.01) { const f = (1 - band / 22) * 900 * (1 - rp.r / Math.hypot(W, H)); ax += (ex / e) * f; ay += (ey / e) * f; }
      }
      p.vx += ax * dt; p.vy += ay * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (Math.abs(p.vx) + Math.abs(p.vy) > 0.6 || Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.3) moving = true;
      else { p.x = p.tx; p.y = p.ty; p.vx = p.vy = 0; }
    }
    return moving || ripples.length > 0 || mx > -999;
  }

  function loop(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000 || 0);
    last = now;
    const more = tick(dt);
    draw();
    if (clock > 1.4 && mx < -999 && !ripples.length) say("rest");
    raf = more && visible && !reduced.matches && !document.hidden ? requestAnimationFrame(loop) : 0;
  }
  const wake = () => { if (!raf && visible && !reduced.matches && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  /* ── input ── */
  const at = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointermove", (e) => { if (reduced.matches) return; [mx, my] = at(e); say("scatter"); wake(); });
  cv.addEventListener("pointerleave", () => { mx = my = -9999; wake(); });
  cv.addEventListener("pointerdown", (e) => {
    if (reduced.matches) return;
    const [x, y] = at(e);
    ripples.push({ x, y, r: 0 });
    say("ripple");
    wake();
  });

  /* ── lifecycle ── */
  function colours() { ink = css("--ink", "#ececef"); acc = css("--accent", "#4ade80"); draw(); }
  new MutationObserver(colours).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", colours);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(cv);
  document.addEventListener("visibilitychange", wake);
  let rz = 0;
  // rebuild only on a real size change (the observer also fires once on load, which must not cut the fly-in)
  new ResizeObserver(() => {
    clearTimeout(rz);
    rz = setTimeout(() => { const r = cv.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) size(false); }, 120);
  }).observe(cv);

  function start(src) {
    source = src;
    colours();
    const fly = !reduced.matches;
    if (!fly) clock = 99;
    size(fly);
    say(fly ? "assembling" : "rest");
    wake();
  }
  const fallback = () => {
    const go = () => start((c, r) => fromText(D.initials || "JP", c, r));
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(go, go);
  };
  if (D.portrait) {
    const img = new Image();
    img.onload = () => { const src = (c, r) => fromImage(img, c, r); src.photo = true; start(src); };
    img.onerror = fallback;
    img.src = D.portrait;
  } else fallback();
})();
