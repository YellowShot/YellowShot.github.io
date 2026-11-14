/*
 * Motion layer: the interactive data-grid background, the scroll-scrubbed integration story,
 * and the marquee that leans with scroll speed. Everything honours prefers-reduced-motion and
 * stops drawing when nothing is on screen or the tab is hidden.
 */
(() => {
  "use strict";
  const D = window.PORTFOLIO;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  };

  /* ───────────────────────── background: a living data grid ─────────────────────────
     A dot grid that scrolls with the page. Dots near the pointer brighten and lean towards it;
     packets of data run along the grid lines; a click on empty space fires a burst. */
  function background() {
    const cv = document.getElementById("bg");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const G = 30, R = 150, SPEED = 230, TAIL = 70;
    let W = 0, H = 0, dpr = 1, dotCol = "#2b2c31", hiCol = "#4ade80";
    let mx = -9999, my = -9999, lastY = scrollY, packets = [], spawnIn = 0, raf = 0, last = 0;
    const base = document.createElement("canvas"), bctx = base.getContext("2d");

    function colours() {
      dotCol = css("--line-2", "#2b2c31");
      hiCol = css("--accent", "#4ade80");
      paintBase();
      if (!raf) frame(0);
    }
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      for (const c of [cv, base]) { c.width = W * dpr; c.height = (H + G) * dpr; }
      cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      paintBase();
      if (!raf) frame(0);
    }
    // the plain grid, painted once (one row taller, so it can slide by up to a cell as the page scrolls)
    function paintBase() {
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, W, H + G);
      bctx.fillStyle = dotCol;
      for (let y = 0; y <= H + G; y += G) for (let x = (W % G) / 2; x <= W; x += G) bctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
    const off = () => -(scrollY % G);
    function spawn(x, y, dir) {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const [dx, dy] = dir || dirs[(Math.random() * 4) | 0];
      packets.push({ x, y, dx, dy, d: 0, len: 160 + Math.random() * 360 });
    }
    function randomSpawn() {
      const ox = (W % G) / 2;
      const x = ox + Math.round(Math.random() * (W / G)) * G;
      const y = off() + Math.round(Math.random() * (H / G)) * G;
      spawn(x, y);
    }
    function frame(dt) {
      // a page laid out at zero size (a hidden or prerendering tab) has nothing to draw yet
      if (!W || !H || !base.width || !base.height) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W * dpr, (H + G) * dpr, 0, off(), W, H + G);
      // the pointer's halo: nearby dots brighten and lean in
      if (mx > -999) {
        const ox = (W % G) / 2, o = off();
        ctx.fillStyle = hiCol;
        for (let y = o + Math.floor((my - R - o) / G) * G; y <= my + R; y += G) {
          for (let x = ox + Math.floor((mx - R - ox) / G) * G; x <= mx + R; x += G) {
            const d = Math.hypot(x - mx, y - my);
            if (d >= R) continue;
            const k = 1 - d / R;
            ctx.globalAlpha = k * 0.85;
            const s = 1.5 + k * 1.6;
            ctx.fillRect(x + (mx - x) * k * 0.12 - s / 2, y + (my - y) * k * 0.12 - s / 2, s, s);
          }
        }
        ctx.globalAlpha = 1;
      }
      // packets with fading tails
      ctx.lineCap = "round";
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = hiCol;
      packets = packets.filter((p) => {
        p.d += SPEED * dt;
        const t = Math.min(p.d, TAIL), hx = p.x + p.dx * p.d, hy = p.y + p.dy * p.d;
        const fade = p.d > p.len ? Math.max(0, 1 - (p.d - p.len) / TAIL) : 1;
        if (fade <= 0) return false;
        const g = ctx.createLinearGradient(hx - p.dx * t, hy - p.dy * t, hx, hy);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, hiCol);
        ctx.globalAlpha = 0.75 * fade;
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(hx - p.dx * t, hy - p.dy * t); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = hiCol; ctx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
        return true;
      });
      ctx.globalAlpha = 1;
    }
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      spawnIn -= dt;
      if (spawnIn <= 0 && packets.length < 14) { randomSpawn(); spawnIn = 0.55 + Math.random() * 0.6; }
      frame(dt);
      raf = document.hidden || reduced.matches ? 0 : requestAnimationFrame(loop);
    }
    const start = () => { if (!raf && !document.hidden && !reduced.matches) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    addEventListener("resize", size);
    addEventListener("scroll", () => {
      const dy = scrollY - lastY; lastY = scrollY;
      packets.forEach((p) => { p.y -= dy; });           // packets ride the page with the grid
      if (!raf) frame(0);
    }, { passive: true });
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { mx = e.clientX; my = e.clientY; if (!raf) frame(0); } }, { passive: true });
    document.addEventListener("pointerleave", () => { mx = my = -9999; if (!raf) frame(0); });
    // a click on empty background fires a burst along the four grid lines through the nearest node
    addEventListener("pointerdown", (e) => {
      if (reduced.matches || e.target.closest("a, button, input, label, [data-hairline], .card, .project, .run, .plate, canvas.net")) return;
      const ox = (W % G) / 2, o = off();
      const x = ox + Math.round((e.clientX - ox) / G) * G, y = o + Math.round((e.clientY - o) / G) * G;
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) spawn(x, y, d);
      start();
    });
    document.addEventListener("visibilitychange", start);
    reduced.addEventListener("change", () => { if (reduced.matches) { packets = []; frame(0); } else start(); });
    new MutationObserver(colours).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", colours);

    size();
    colours();
    start();
  }

  /* ───────────────────────── the story: how a project runs, scrubbed by scroll ─────────────────────────
     Five stages zig-zag across the diagram. As the visitor scrolls, each connector draws, its stage
     lights up and drops its deliverables; the copy, the counters and the step chip follow along. */
  function story() {
    const track = document.getElementById("story"), S = D.story;
    if (!track || !S || !S.stages || !S.stages.length) { if (track) track.closest("section").remove(); return; }
    const sec = track.closest("section"), N = S.stages.length;
    sec.querySelector(".story-kicker").textContent = S.kicker || "";
    const stepsOl = sec.querySelector(".story-steps");
    S.stages.forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="ss-n">${String(i + 1).padStart(2, "0")}</span><div><h3></h3><p></p></div>`;
      li.querySelector("h3").textContent = s.title;
      li.querySelector("p").textContent = s.text;
      stepsOl.append(li);
    });
    const steps = [...stepsOl.children];

    // the diagram
    const svg = sec.querySelector(".story-svg");
    const gPaths = el("g", { class: "sv-paths" }, svg), gNodes = el("g", {}, svg), gPk = el("g", { class: "sv-packets" }, svg);
    const NW = 108, NH = 58, gap = (640 - NW * N) / Math.max(1, N - 1);
    const pos = S.stages.map((_, i) => ({ x: i * (NW + gap), y: i % 2 ? 262 : 140 }));
    const path = (d) => { const p = el("path", { d, class: "sv-path" }, gPaths); const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return { p, L, t: 0 }; };
    const links = pos.slice(1).map((b, i) => {
      const a = pos[i], ax = a.x + NW, ay = a.y + NH / 2, bx = b.x, by = b.y + NH / 2, mx = (ax + bx) / 2;
      return path(`M${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`);
    });
    const total = S.stages.reduce((n, s) => n + s.artifacts.length, 0);
    // each stage: an outer group places it, the inner one carries the animated classes
    const stages = S.stages.map((s, i) => {
      const { x, y } = pos[i], top = i % 2 === 0;
      const at = el("g", { transform: `translate(${x} ${y})` }, gNodes);
      const g = el("g", { class: "sv-node sv-stage" }, at);
      el("rect", { width: NW, height: NH, rx: 12 }, g);
      const n = el("text", { x: 14, y: 22, class: "sv-sub" }, g); n.textContent = String(i + 1).padStart(2, "0");
      const t = el("text", { x: 14, y: 42 }, g); t.textContent = s.name;
      const tick = el("path", { d: `M${NW - 26} 20 l5 5 9-10`, class: "sv-check" }, g);
      const tl = tick.getTotalLength(); tick.style.strokeDasharray = tl; tick.style.strokeDashoffset = tl;
      // deliverables stack above (even stages) or below (odd stages), joined to the stage by a stem
      const arts = s.artifacts.map((label, k) => {
        const cy = top ? -14 - (k + 1) * 30 : NH + 14 + k * 30;
        const ag = el("g", { transform: `translate(0 ${cy})` }, at);
        const inner = el("g", { class: "sv-art" }, ag);
        const r = el("rect", { width: 10, height: 24, rx: 7 }, inner);
        const tx = el("text", { x: 24, y: 16 }, inner); tx.textContent = label;
        el("circle", { cx: 12, cy: 12, r: 2.6 }, inner);
        r.setAttribute("width", Math.min(150, Math.ceil((tx.getComputedTextLength ? tx.getComputedTextLength() : label.length * 6.4) + 34)));
        return inner;
      });
      const stemY1 = top ? -14 - s.artifacts.length * 30 + 24 : NH + 14 + (s.artifacts.length - 1) * 30;
      const stem = el("line", { x1: 12, x2: 12, y1: top ? 0 : NH, y2: top ? stemY1 - 24 + 12 : stemY1 + 12, class: "sv-stem" }, at);
      at.insertBefore(stem, at.firstChild);
      return { g, tick, tl, arts, stem };
    });
    const pk = links.map((r, i) => ({ r, c: el("circle", { r: 3.2, class: "sv-pk" }, gPk), t: (i * 0.37) % 1 }));
    // widen the drawing to its widest deliverable, so a long label at the right edge is never clipped
    let right = 640;
    stages.forEach((st, i) => st.arts.forEach((art) => { right = Math.max(right, pos[i].x + Number(art.querySelector("rect").getAttribute("width")) + 2); }));
    svg.setAttribute("viewBox", `0 0 ${Math.ceil(right)} 460`);

    const cDone = sec.querySelector('[data-c="stages"]'), cArts = sec.querySelector('[data-c="arts"]');
    const state = sec.querySelector(".story-state"), bar = sec.querySelector(".story-bar span");
    const head = sec.querySelector(".sec-head"), chip = head.querySelector(".status"), chipLabel = chip.querySelector("b");
    let p = 0, shown = -1;
    const seg = (a, b) => clamp((p - a) / (b - a), 0, 1);

    function render() {
      let done = 0, delivered = 0;
      stages.forEach((st, i) => {
        const a = i / N;
        if (i > 0) { const l = links[i - 1]; l.t = ease(seg(a - 0.07, a + 0.01)); l.p.style.strokeDashoffset = l.L * (1 - l.t); }
        const on = p >= a + 0.01;
        st.g.classList.toggle("on", on);
        st.stem.style.opacity = on ? 1 : 0;
        let all = true;
        st.arts.forEach((art, k) => {
          const pop = ease(seg(a + 0.03 + k * 0.035, a + 0.08 + k * 0.035));
          art.style.opacity = pop;
          art.style.transform = `translate(0, ${(1 - pop) * 8}px)`;
          if (pop >= 1) delivered++; else all = false;
        });
        const finished = all && p >= (i + 1) / N - 0.02;
        st.tick.style.strokeDashoffset = finished ? 0 : st.tl;
        st.g.classList.toggle("done", finished);
        if (finished) done++;
      });
      const step = Math.min(N - 1, Math.floor(p * N));
      if (step !== shown) { shown = step; steps.forEach((li, k) => { li.classList.toggle("on", k === step); li.classList.toggle("past", k < step); }); }
      stages.forEach((st, i) => st.g.classList.toggle("cur", i === step && p > 0.005 && p < 0.97));
      cDone.textContent = `${done}/${N}`;
      cArts.textContent = `${delivered}/${total}`;
      const complete = p >= 0.97 && done === N;
      const run = p > 0.005 && !complete;
      state.textContent = complete ? "Delivered" : run ? "Running" : "Waiting";
      state.dataset.state = complete ? "ok" : run ? "run" : "";
      const cs = complete ? "ok" : run ? "run" : "";
      chip.dataset.state = cs;
      chipLabel.textContent = complete ? `Succeeded · ${N} stages` : run ? `Running · stage ${step + 1}/${N}` : "Waiting";
      head.classList.toggle("done", complete);
      bar.style.transform = `scaleX(${p})`;
    }

    let visible = false, raf = 0, last = 0;
    function packets(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      pk.forEach((k) => {
        const on = k.r.t >= 1;
        k.c.style.opacity = on ? 1 : 0;
        if (!on) return;
        k.t = (k.t + dt * (90 / k.r.L)) % 1;
        const pt = k.r.p.getPointAtLength(k.t * k.r.L);
        k.c.setAttribute("cx", pt.x.toFixed(1)); k.c.setAttribute("cy", pt.y.toFixed(1));
      });
      raf = visible && !reduced.matches ? requestAnimationFrame(packets) : 0;
    }
    function onScroll() {
      if (reduced.matches) { p = 1; render(); return; }
      const r = track.getBoundingClientRect();
      p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      render();
    }
    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      if (visible && !raf && !reduced.matches) { last = performance.now(); raf = requestAnimationFrame(packets); }
    }).observe(track);
    let ticking = false;
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
    addEventListener("resize", onScroll);
    reduced.addEventListener("change", onScroll);
    onScroll();
    if (reduced.matches) pk.forEach((k) => { k.c.style.opacity = 0; });
  }

  /* ───────────────────────── the marquee leans with scroll speed ───────────────────────── */
  function marquee() {
    const m = document.querySelector(".marquee");
    if (!m) return;
    let lastY = scrollY, lastT = performance.now(), skew = 0, target = 0, raf = 0;
    const step = () => {
      skew += (target - skew) * 0.12;
      target *= 0.9;
      m.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      raf = Math.abs(skew) > 0.02 || Math.abs(target) > 0.02 ? requestAnimationFrame(step) : 0;
      if (!raf) m.style.transform = "";
    };
    addEventListener("scroll", () => {
      if (reduced.matches) return;
      const now = performance.now(), v = (scrollY - lastY) / Math.max(1, now - lastT);
      lastY = scrollY; lastT = now;
      target = clamp(-v * 6, -10, 10);
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }

  /* ───────────────────────── my path: the life timeline, scrubbed sideways by scroll ─────────────────────────
     The section pins; scrolling down slides the milestone cards to the left, a giant year rolls to the
     milestone nearest the centre, that card lights up and the rail fills. Without pinning (reduced
     motion) the row is a normal horizontal scroller. */
  function path() {
    const track = document.getElementById("path-track"), items = D.path;
    if (!track || !items || !items.length) { if (track) track.closest("section").remove(); return; }
    const row = document.getElementById("path-row"), vp = row.parentElement, ticks = document.getElementById("path-ticks");
    const yearEl = document.getElementById("path-year"), fill = track.querySelector(".path-line span");
    items.forEach((m, i) => {
      const li = document.createElement("li");
      li.className = "path-card";
      li.innerHTML = `<div class="pc-top"><span class="pc-year"></span><span class="pc-tag"></span></div><h3></h3><p></p><span class="pc-n">${String(i + 1).padStart(2, "0")}</span>`;
      li.querySelector(".pc-year").textContent = m.year;
      li.querySelector(".pc-tag").textContent = m.tag;
      li.querySelector("h3").textContent = m.title;
      li.querySelector("p").textContent = m.text;
      row.append(li);
      const t = document.createElement("span");
      t.className = "pt";
      t.style.left = `${(i / Math.max(1, items.length - 1)) * 100}%`;
      // label a year once: repeated years (several milestones in one year) keep their node but no label
      t.innerHTML = `<i></i><b>${i > 0 && items[i - 1].year === m.year ? "" : m.year}</b>`;
      ticks.append(t);
    });
    const cards = [...row.children], tickEls = [...ticks.children];
    let overflow = 0, active = -1, shownYear = +items[0].year, yearRaf = 0;

    // card centres in row coordinates: scrolling glides the row so the active card sits in the middle
    let centres = [];
    function measure() {
      if (reduced.matches) { track.style.height = ""; row.style.transform = ""; overflow = 0; onScroll(); return; }
      row.style.transform = "";
      centres = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
      overflow = Math.max(1, centres[centres.length - 1] - centres[0]); // the distance the row travels
      track.style.height = `${innerHeight + overflow * 1.1}px`;
      onScroll();
    }
    // the big year counts towards the active milestone's year instead of jumping
    function rollYear(to) {
      cancelAnimationFrame(yearRaf);
      if (reduced.matches) { shownYear = to; yearEl.textContent = to; return; }
      const from = shownYear, t0 = performance.now(), dur = 420;
      const step = (now) => {
        const k = clamp((now - t0) / dur, 0, 1);
        shownYear = Math.round(from + (to - from) * ease(k));
        yearEl.textContent = shownYear;
        if (k < 1) yearRaf = requestAnimationFrame(step);
      };
      yearRaf = requestAnimationFrame(step);
    }
    function setActive(i) {
      if (i === active) return;
      active = i;
      cards.forEach((c, k) => { c.classList.toggle("on", k === i); c.classList.toggle("past", k < i); });
      tickEls.forEach((t, k) => t.classList.toggle("on", k <= i));
      rollYear(+items[i].year);
    }
    function onScroll() {
      let p = 1;
      if (!reduced.matches && overflow > 0) {
        const r = track.getBoundingClientRect();
        p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
        const f = p * (cards.length - 1), k = Math.floor(f), c = centres[k] + ((centres[Math.min(k + 1, centres.length - 1)] - centres[k]) * (f - k));
        row.style.transform = `translate3d(${(vp.clientWidth / 2 - c).toFixed(1)}px, 0, 0)`;
      }
      fill.style.transform = `scaleX(${p})`;
      // the active milestone follows progress, so the first and last cards (which never reach the
      // centre of the screen) still get their turn, and the rail's nodes match exactly
      if (!reduced.matches && overflow > 0) { setActive(Math.round(p * (cards.length - 1))); return; }
      // reduced motion: the row scrolls by itself, so take the card nearest the middle of the viewport
      const vr = vp.getBoundingClientRect(), mid = vr.left + vr.width / 2;
      let best = 0, bd = Infinity;
      cards.forEach((c, k) => { const b = c.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
      setActive(best);
    }
    let ticking = false;
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
    vp.addEventListener("scroll", onScroll, { passive: true }); // the reduced-motion scroller
    addEventListener("resize", measure);
    reduced.addEventListener("change", measure);
    if (document.fonts) document.fonts.ready.then(measure);
    measure();
  }

  background();
  path();
  story();
  marquee();
})();
