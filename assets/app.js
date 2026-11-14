/* Portfolio runtime: renders content.js, hosts the hairline figure, and runs the page's motion. */
(() => {
  "use strict";
  const D = window.PORTFOLIO;
  // projects marked hidden stay in content.js but are left off the site (the drawer figure reads this list too)
  D.projects = D.projects.filter((p) => !p.hidden);
  // newest work first, by end month then start month (the drawer figure reads this same order)
  D.projects.sort((a, b) => (b.end || b.year).localeCompare(a.end || a.year) || (b.start || "").localeCompare(a.start || ""));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /** One element: h("p", { class: "x" }, "text", child, ...). */
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === "html") el.innerHTML = v; else el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  const svg = (inner, vb = "0 0 24 24") => {
    const t = document.createElement("template");
    t.innerHTML = `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
    return t.content.firstChild;
  };
  const ARROW = '<path d="M5 12h14M13 6l6 6-6 6"/>';

  /* ───────── content ───────── */
  document.title = `${D.name} — ${D.role}`;
  $$("[data-bind]").forEach((el) => { el.textContent = D[el.dataset.bind] ?? ""; });
  $("#year").textContent = new Date().getFullYear();
  if (!D.available) $(".pulse").style.background = "var(--ink-3)";

  // headline: lines → words, each word its own index for the cascade
  let wi = 0;
  const headline = $("#headline");
  D.headline.forEach((line) => {
    const l = h("span", { class: "line" });
    line.split(" ").forEach((word, k, all) => {
      const accent = /^\*.*\*[.,!?]?$/.test(word);
      const text = word.replace(/\*/g, "");
      const w = h("span", { class: "w" + (accent ? " accent" : ""), style: `--i:${wi++}` }, text);
      l.append(w, k < all.length - 1 ? " " : "");
    });
    headline.append(l);
  });
  headline.setAttribute("aria-label", D.headline.join(" ").replace(/\*/g, ""));

  // marquee: the list twice, so the loop is seamless at -50%
  const mq = $("#marquee");
  for (let r = 0; r < 2; r++) D.stack.forEach((s) => mq.append(h("span", { class: "marquee-item", "aria-hidden": r ? "true" : null }, s)));

  // about
  const st = $("#statement");
  D.about.statement.split(" ").forEach((w, i, a) => st.append(h("span", { class: "sw" }, w), i < a.length - 1 ? " " : ""));
  D.about.paragraphs.forEach((p, i) => $("#about-text").append(h("p", { class: "reveal", style: `--d:${i}` }, p)));
  D.about.stats.forEach((s, i) =>
    $("#stats").append(h("div", { class: "stat reveal", style: `--d:${i}` },
      h("dt", {}, s.label),
      h("dd", { "data-count": s.value, "data-dec": s.decimals || 0 }, h("span", {}, "0"), s.suffix ? h("small", {}, s.suffix) : null))));

  // work
  D.projects.forEach((p, i) => {
    const idx = String(i + 1).padStart(2, "0");
    // A row is a link only when the project has a real URL; otherwise it is a button that selects the
    // project (drawer + run panel), so a placeholder "#" can never send the visitor back to the top.
    const link = p.url && p.url !== "#" ? p.url : null;
    const label = `${p.name}: ${p.kind}, ${p.period || p.year}`;
    const row = link
      ? h("a", { class: "row", href: link, target: "_blank", rel: "noopener noreferrer", "data-i": i, "aria-label": `${label} (opens in a new tab)` })
      : h("button", { class: "row", type: "button", "data-i": i, "aria-pressed": "false", "aria-label": `${label}. Show details` });
    row.append(
      h("span", { class: "p-idx" }, idx),
      h("span", { class: "p-name" }, p.name, link ? h("span", { class: "p-out" }, svg(ARROW)) : null),
      h("span", { class: "p-kind" }, p.nda ? h("span", { class: "nda", title: "Client name withheld under NDA" }, "NDA") : null, p.nda ? h("br") : null, p.kind),
      h("span", { class: "p-year" }, p.periodShort || p.period || p.year),
      // a mini flow track: one diamond per step of the project's flow; on hover they light in turn
      // and a data packet runs along them (a tiny version of the run panel)
      h("span", { class: "p-flow", "aria-hidden": "true", style: `--n:${(p.flow || p.stack).length}` },
        (p.flow || p.stack).map((_, k) => h("i", { style: `--k:${k}` }))),
      h("div", { class: "p-detail" }, h("p", {}, p.summary), h("div", { class: "p-tags" }, p.stack.map((t) => h("span", { class: "tagpill" }, t)))));
    $("#projects").append(h("li", { class: "project reveal", style: `--d:${i}` }, row));
  });

  // toolbox
  // one glyph per kind of work, chosen by the card's `icon` in content.js
  const GLYPHS = {
    layers: '<path d="M17 5l12 6-12 6-12-6z"/><path d="M5 16l12 6 12-6"/><path d="M5 21l12 6 12-6"/>',
    flow: '<rect x="10" y="3" width="14" height="7" rx="2"/><rect x="10" y="24" width="14" height="7" rx="2"/><path d="M17 10v4M17 20v4M12 14h10l-5 6z"/>',
    link: '<path d="M14.5 19.5l5-5"/><path d="M12.5 15.5l-3 3a4.6 4.6 0 0 0 6.5 6.5l3-3"/><path d="M21.5 18.5l3-3a4.6 4.6 0 0 0-6.5-6.5l-3 3"/>',
    code: '<path d="M12 10l-7 7 7 7M22 10l7 7-7 7M19.5 7l-5 20"/>',
    check: '<rect x="5" y="7" width="24" height="22" rx="3.5"/><path d="M5 13h24M11 4v6M23 4v6M12.5 21l3.5 3.5 6-6.5"/>',
    data: '<ellipse cx="17" cy="9" rx="11" ry="4"/><path d="M6 9v16c0 2.2 4.9 4 11 4s11-1.8 11-4V9"/><path d="M6 17c0 2.2 4.9 4 11 4s11-1.8 11-4"/>',
  };
  const ORDER = Object.keys(GLYPHS);
  D.toolbox.forEach((t, i) =>
    $("#bento").append(h("article", { class: "card reveal", style: `--d:${i % 3}` },
      h("div", { class: "card-top" }, h("span", {}, String(i + 1).padStart(2, "0")), (() => { const g = svg(GLYPHS[t.icon] || GLYPHS[ORDER[i % ORDER.length]], "0 0 34 34"); g.classList.add("card-glyph"); return g; })()),
      h("h3", {}, t.title), h("p", {}, t.body),
      h("div", { class: "p-tags" }, t.tags.map((x) => h("span", { class: "tagpill" }, x))))));

  // experience
  D.experience.forEach((j, i) =>
    $("#timeline").append(h("article", { class: "job reveal", style: `--d:${i % 2}` },
      h("div", { class: "job-period" }, j.period),
      h("div", { class: "job-body" },
        h("h3", { class: "job-role" }, j.role), h("span", { class: "job-company" }, j.company),
        h("p", { class: "job-summary" }, j.summary),
        h("ul", {}, j.highlights.map((x) => h("li", {}, x)))))));

  // testimonial and education (either can be left out of content.js)
  if (D.testimonial) {
    const T = D.testimonial, q = $("#quote");
    $(".q-label", q).textContent = T.label || "Recommendation";
    $(".quote-title", q).textContent = T.title || "";
    if (!T.title) $(".quote-title", q).remove();
    $(".quote-traits", q).replaceChildren(...(T.traits || []).map((t) => h("li", {}, t)));
    $("blockquote", q).textContent = T.quote;
    $(".q-author", q).textContent = T.author;
    $(".q-context", q).textContent = T.context;
    $(".q-avatar", q).textContent = T.author.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  } else $(".quote-sec").remove();

  /* ───────── section arrows: down = next section, up = previous section ─────────
     Down hides at the end of the page, up hides at the very top. Sections carry their own top padding
     below the nav, so each press lands exactly on a section's top. */
  (() => {
    const next = $("#next"), prev = $("#prev");
    if (!next || !prev) return;
    const tops = () => $$("main > section, .flow > section").filter((s) => s.offsetHeight > 0).map((s) => s.getBoundingClientRect().top + scrollY);
    const nextTop = () => tops().find((t) => t > scrollY + 100) ?? null;           // the first section starting below the nav
    const prevTop = () => { const above = tops().filter((t) => t < scrollY - 4); return above.length ? above[above.length - 1] : (scrollY > 4 ? 0 : null); };
    const go = (top) => { if (top != null) scrollTo({ top: Math.max(0, top), behavior: reduced.matches ? "auto" : "smooth" }); };
    const update = () => {
      const atEnd = nextTop() == null || scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      next.classList.toggle("off", atEnd);
      prev.classList.toggle("off", prevTop() == null);
      next.tabIndex = atEnd ? -1 : 0;
      prev.tabIndex = prevTop() == null ? -1 : 0;
    };
    next.addEventListener("click", () => go(nextTop()));
    prev.addEventListener("click", () => go(prevTop()));
    let tick = false;
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; update(); }); } }, { passive: true });
    addEventListener("resize", update);
    update();
  })();
  if (D.education && D.education.length) {
    D.education.forEach((e, i) => $("#education").append(h("li", { class: "reveal", style: `--d:${i}` },
      h("span", { class: "edu-period" }, e.period), h("span", { class: "edu-name" }, e.title), h("span", { class: "edu-place" }, e.place))));
  } else { $(".edu-title").remove(); $("#education").remove(); }

  // contact
  $("#mail").href = `mailto:${D.email}`;
  D.socials.forEach((s) => $("#socials").append(h("li", {}, h("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", "data-scramble": "" }, h("span", {}, s.label), svg(ARROW)))));

  /* ───────── theme ───────── */
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : !matchMedia("(prefers-color-scheme: light)").matches);
  $("#theme").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    const swap = () => { root.dataset.theme = next; try { localStorage.setItem("theme", next); } catch (e) {} };
    if (document.startViewTransition && !reduced.matches) document.startViewTransition(swap); else swap();
  });

  /* ───────── mobile menu ───────── */
  const menu = $("#menu"), sheet = $("#sheet");
  const setMenu = (open) => { sheet.hidden = !open; menu.setAttribute("aria-expanded", String(open)); };
  menu.addEventListener("click", () => setMenu(sheet.hidden));
  $$("a", sheet).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ───────── reveal ───────── */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.matches(".stat")) count(e.target.querySelector("[data-count]"));
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  $$(".reveal, .sec-head").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });
  // the hero plays in on load
  // (a reflow commits the hidden state first; a timeout, not rAF, so a throttled tab still plays it)
  void headline.offsetHeight;
  setTimeout(() => { $$(".hero .reveal").forEach((el) => el.classList.add("in")); headline.classList.add("in"); }, 60);

  /* counters */
  function count(el) {
    if (!el) return;
    const to = +el.dataset.count, dec = +el.dataset.dec, out = el.firstChild;
    const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduced.matches) { out.textContent = nf.format(to); return; }
    const t0 = performance.now(), dur = 1700;
    const step = (now) => {
      const t = clamp((now - t0) / dur, 0, 1), e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      out.textContent = nf.format(to * e);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ───────── scroll-linked: progress, nav, statement, timeline ───────── */
  const bar = $(".progress span"), nav = $("#nav"), words = $$(".sw", st);
  const rail = $(".timeline-rail"), tl = $("#timeline"), flow = $(".flow"), spine = $(".spine");
  let lastY = scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("hide", y > vh * 0.9 && y > lastY + 2 && sheet.hidden);
    if (y < lastY - 2 || y < vh * 0.9) nav.classList.remove("hide");
    lastY = y;
    const r = st.getBoundingClientRect();
    const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.3), 0, 1);
    const on = Math.round(p * words.length * 1.08);
    words.forEach((w, i) => w.classList.toggle("on", i < on));
    const tr = tl.getBoundingClientRect();
    rail.style.setProperty("--p", clamp((vh * 0.62 - tr.top) / tr.height, 0, 1).toFixed(4));
    $$(".job", tl).forEach((j) => j.classList.toggle("on", j.getBoundingClientRect().top < vh * 0.62));
    // the spine fills from the middle of the screen and lands exactly when the page can scroll no further
    const fr = flow.getBoundingClientRect(), foot = document.querySelector(".footer").offsetHeight;
    const travel = fr.height + foot - vh * 0.5;
    spine.style.setProperty("--p", clamp((vh * 0.5 - fr.top) / Math.max(1, travel), 0, 1).toFixed(4));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ───────── nav: active section and the sliding pill ───────── */
  const links = $$(".nav-links a"), pill = $(".nav-pill");
  let active = null;
  function pillTo(a) {
    if (!a) { pill.style.opacity = "0"; return; }
    pill.style.opacity = "1";
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  links.forEach((a) => a.addEventListener("pointerenter", () => pillTo(a)));
  $(".nav-links").addEventListener("pointerleave", () => pillTo(active));
  const sio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    active = links.find((a) => a.hash === "#" + e.target.id) || null;
    links.forEach((a) => a.classList.toggle("active", a === active));
    pillTo(active);
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["top", "about", "work", "toolbox", "experience", "contact"].forEach((id) => sio.observe(document.getElementById(id)));

  /* ───────── pointer niceties (fine pointers only) ───────── */
  if (fine.matches) {
    // bento spotlight
    $$(".card").forEach((c) => c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    }));
    // magnetic buttons
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        if (reduced.matches) return;
        const r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* ───────── work: the list, the run panel and the index drawer, linked both ways ───────── */
  const rows = $$("#projects .project");
  const restProject = D.projects.reduce((b, p, i) => (p.year > D.projects[b].year ? i : b), D.projects.length - 1);
  const codeOf = (p) => p.code || p.name.toLowerCase().split(" ")[0];
  let indexFig = null, shownRun = -1;
  function showRun(i) {
    if (i === shownRun) return;
    shownRun = i;
    const p = D.projects[i], run = $("#run");
    rows.forEach((r, k) => r.classList.toggle("lit", k === i));
    run.classList.remove("swap"); void run.offsetWidth; run.classList.add("swap");
    $(".run-name", run).textContent = p.name;
    $(".run-kind", run).textContent = `${p.kind} · ${p.role}${p.nda ? " · under NDA" : ""}`;
    $(".run-flow", run).replaceChildren(...(p.flow || p.stack).map((s, k) => h("li", { style: `--k:${k}` }, s)));
    $(".run-summary", run).textContent = p.summary;
    $(".run-metric", run).textContent = p.metric;
    $(".run-year", run).textContent = p.period || p.year;
  }
  /* Stick the drawer and panel beside the list only when the whole of them fits under the nav.
     Decided on load and resize only (never per project), with room for the longest flow, so hovering
     rows can never flip it. */
  function fitSide() {
    const side = $(".work-side");
    side.classList.toggle("stuck", side.offsetHeight + 104 + 56 <= innerHeight);
  }
  addEventListener("resize", fitSide);
  if (document.fonts) document.fonts.ready.then(fitSide);
  showRun(restProject);
  // hover previews a project; a click pins it, so the drawer and panel stay on it after the pointer leaves
  let pinned = -1;
  const home = () => (pinned >= 0 ? pinned : restProject);
  const goHome = () => { if (indexFig) indexFig.pick(pinned); showRun(home()); };
  rows.forEach((li, i) => {
    li.addEventListener("pointerenter", () => { showRun(i); if (indexFig) indexFig.pick(i); });
    li.addEventListener("focusin", () => { showRun(i); if (indexFig) indexFig.pick(i); });
    const btn = li.querySelector("button.row");
    if (btn) btn.addEventListener("click", () => {
      pinned = pinned === i ? -1 : i; // a second click on the pinned project lets it go
      rows.forEach((r, k) => { r.classList.toggle("pinned", k === pinned); const b = r.querySelector("button.row"); if (b) b.setAttribute("aria-pressed", String(k === pinned)); });
      showRun(pinned >= 0 ? pinned : i);
      if (indexFig) indexFig.pick(pinned >= 0 ? pinned : i);
    });
  });
  $("#projects").addEventListener("pointerleave", goHome);
  $("#projects").addEventListener("focusout", (e) => { if (!e.currentTarget.contains(e.relatedTarget)) goHome(); });

  /* ───────── flow: step statuses and the spine ───────── */
  const steps = $$(".sec-head.step:not([data-own-status])");
  const stepIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    stepIO.unobserve(e.target);
    const st = e.target.querySelector(".status"), label = st.querySelector("b");
    const ms = 420 + ((steps.indexOf(e.target) * 197) % 600);
    st.dataset.state = "run"; label.textContent = "Running";
    setTimeout(() => { st.dataset.state = "ok"; label.textContent = `Succeeded · ${(ms / 1000).toFixed(1)}s`; e.target.classList.add("done"); }, reduced.matches ? 0 : ms + 300);
  }), { rootMargin: "0px 0px -18% 0px" });
  steps.forEach((s) => stepIO.observe(s));

  /* ───────── text scramble on hover ───────── */
  const GLYPH = "01<>/{}[]#*+=_";
  $$("[data-scramble]").forEach((el) => {
    const target = el.querySelector("span") || el;
    const text = target.textContent;
    let id = 0;
    el.addEventListener("pointerenter", () => {
      if (reduced.matches) return;
      cancelAnimationFrame(id);
      const t0 = performance.now();
      const step = (now) => {
        const k = (now - t0) / 420;
        target.textContent = [...text].map((c, i) => (c === " " || i / text.length < k ? c : GLYPH[(Math.random() * GLYPH.length) | 0])).join("");
        if (k < 1) id = requestAnimationFrame(step); else target.textContent = text;
      };
      id = requestAnimationFrame(step);
    });
  });

  /* ───────── clock ───────── */
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: D.timezone, timeZoneName: "short" });
  const tick = () => $$("[data-clock]").forEach((el) => { el.textContent = fmt.format(new Date()); });
  tick(); setInterval(tick, 10000);

  /* ───────── copy email ───────── */
  const toast = $("#toast");
  let tt = 0;
  const say = (m) => { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2200); };
  // the async clipboard API needs a focused, secure page; fall back to a hidden selection, then to telling the visitor
  function legacyCopy(text) {
    const ta = h("textarea", { readonly: "", style: "position:fixed;top:-100px;opacity:0" });
    ta.value = text; document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  $("#copy").addEventListener("click", async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(D.email); ok = true; } catch (e) { ok = legacyCopy(D.email); }
    say(ok ? "Copied " + D.email : "Couldn’t copy — email me at " + D.email);
  });

  /* ───────── the hairline host ───────── */
  // The page plays the bench's part: it makes the stage and the svg, owns the read-out and the slider.
  window.hairline = (figure) => {
    if (figure.name === "index") return hostIndex(figure);
    const stage = $("#stage"), slider = $("#intensity"), readEl = $("#read");
    const [lo, mid, hi] = figure.range;
    const at = (i) => (i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid));
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figure.means);
    const svgEl = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    let text = "rest";
    const read = {
      get textContent() { return text; },
      set textContent(v) { text = v == null ? "" : String(v); readEl.textContent = label(text); },
    };
    const handle = figure.mount({ stage, svg: svgEl, read }, at(+slider.value));
    slider.addEventListener("input", () => handle.set(at(+slider.value)));
    let touring = null;
    if (!reduced.matches) touring = HL.tour(stage, figure.tour || HL.LAP);
    keyboard(stage, () => { if (touring) { touring.stop(); touring = null; } });
  };

  /* The index drawer: its read-out names a project, which lights that row and fills the run panel. */
  function hostIndex(figure) {
    const stage = $("#stage2"), readEl = $("#read2");
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figure.means);
    const svgEl = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    let text = "rest";
    const read = {
      get textContent() { return text; },
      set textContent(v) {
        text = v == null ? "" : String(v);
        readEl.textContent = text;
        const code = text.split(" · ")[0], i = D.projects.findIndex((p) => codeOf(p) === code);
        if (i >= 0) showRun(i);
        else if (pinned >= 0) setTimeout(() => indexFig && indexFig.pick(pinned), 0); // back to the pinned card
        else showRun(restProject);
      },
    };
    indexFig = figure.mount({ stage, svg: svgEl, read }, figure.range[1]);
    fitSide();
  }

  /* The read-out speaks keyboard: "key 1·4" → "F". */
  const KEYMAP = [
    ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "Backspace"],
    ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Enter"],
    ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "ShiftRight"],
    ["ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "ControlRight"],
  ];
  const NAMES = { Tab: "tab", Backspace: "bksp", CapsLock: "caps", Enter: "enter", ShiftLeft: "shift", ShiftRight: "shift", ControlLeft: "ctrl", MetaLeft: "meta", AltLeft: "alt", Space: "space", AltRight: "alt", ControlRight: "ctrl", Comma: ",", Period: "." };
  const keyName = (code) => NAMES[code] || code.replace(/^Key|^Digit/, "");
  function label(t) {
    const m = /^key (\d)·(\d+)$/.exec(t);
    return m ? `key ${keyName(KEYMAP[+m[1]][+m[2]])}` : t;
  }
  const ALIAS = { Digit1: "KeyQ", Digit2: "KeyW", Digit3: "KeyE", Digit4: "KeyR", Digit5: "KeyT", Digit6: "KeyY", Digit7: "KeyU", Digit8: "KeyI", Digit9: "KeyO", Digit0: "KeyP", Minus: "Backspace", Equal: "Backspace", Backquote: "Tab", Escape: "Tab", Semicolon: "Enter", Quote: "Enter", BracketLeft: "Backspace", BracketRight: "Backspace", Backslash: "Backspace", Slash: "ShiftRight", MetaRight: "AltRight", IntlBackslash: "ShiftLeft" };

  /** Real keystrokes press the drawn keys: each is sent to the stage as a pointer at that key's top. */
  function keyboard(stage, onFirst) {
    // The figure's own camera and layout (figure/keycaps.js), so a key's centre lands on its cap.
    const U = 15, M = 7, ZC = -7, W = 12.5 * U, Dp = 4 * U, PLANE = 11.8;
    const WIDTHS = [[1.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.25], [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], [1.25, 1.25, 1.5, 5.5, 1.5, 1.5]];
    const C = HL.Cam(45, 0.5, 1.58);
    HL.fit(C, [[-M, -M, ZC], [W + M, Dp + M, ZC - 10], [W + M, -M, ZC], [-M, Dp + M, ZC], [-M, -M, 13.8]], 200, 166);
    const P = HL.proj(C), pts = {};
    WIDTHS.forEach((row, r) => {
      let x = 0;
      row.forEach((w, c) => { pts[KEYMAP[r][c]] = P(x + (w * U) / 2, r * U + U / 2, PLANE); x += w * U; });
    });
    const fig = stage.closest("figure"), hint = fig.querySelector(".plate-caption > span"), original = hint.innerHTML;
    const mail = $("#mail");
    let msg = "", up = 0, first = true;
    const send = (type, p) => {
      const r = stage.getBoundingClientRect();
      stage.dispatchEvent(new PointerEvent(type, { pointerType: "mouse", pointerId: 1, bubbles: false, clientX: r.left + (p[0] / 400) * r.width, clientY: r.top + (p[1] / 320) * r.height }));
    };
    // keystrokes belong to the keyboard only while it is on screen; anywhere else the page keeps its keys
    const onScreen = () => { const r = stage.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    // what the visitor types becomes the body of the email the button opens
    const updateMail = () => {
      const q = msg.trim() ? `?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(msg.trim())}` : "";
      mail.href = `mailto:${D.email}${q}`;
      mail.classList.toggle("has-msg", !!msg.trim());
    };
    addEventListener("keydown", (e) => {
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable], a, button")) return;
      if (e.ctrlKey || e.metaKey || e.altKey || !onScreen()) return;
      const code = ALIAS[e.code] || e.code, p = pts[code];
      if (!p) return;
      if (first) { first = false; onFirst(); }
      if (code === "Space") e.preventDefault(); // it would scroll the page away from the keys being pressed
      send("pointermove", p);
      clearTimeout(up);
      up = setTimeout(() => send("pointerleave", p), 240);
      if (e.key === "Backspace") msg = msg.slice(0, -1);
      else if (e.key === "Escape") msg = "";
      else if (e.key === "Enter") msg += "\n";
      else if (e.key.length === 1 && msg.length < 600) msg += e.key;
      updateMail();
      const shown = msg.replace(/\n/g, " ↵ ").slice(-34);
      if (!msg) { hint.innerHTML = original; return; }
      hint.replaceChildren(h("span", { class: "prompt" }, "›"), " ", h("span", { class: "typed" }, shown), h("span", { class: "caret" }));
    });
  }
})();
