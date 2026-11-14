/**
 * Index: a card-index drawer holding one card per project. The drawer has a
 * proud front with a label holder, a cup pull and the knob of the rod that
 * runs through the cards' notches. The card under the pointer stands up and
 * lifts; the ones in front lean forward and the ones behind lean back,
 * staggered outwards on the lift curve. Each card's face carries a heading and
 * one ruled line per technology the project used. At rest the newest project
 * is half drawn out. The slider is the stagger, in ms.
 *
 * The data: the page's own projects when it has them (window.PORTFOLIO),
 * otherwise a built-in list, so the figure stands alone on the bench.
 */
const {
  Cam, circ, clamp, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, reflect, register,
} = HL;

const FALLBACK = [
  ["sales", "2025", 3], ["retail", "2026", 3], ["docs", "2025", 3], ["erp-crm", "2025", 3],
  ["permits", "2025", 3], ["presales", "2025", 2], ["resourcing", "2025", 3], ["psa", "2020", 3],
];
const SRC = (globalThis.PORTFOLIO && globalThis.PORTFOLIO.projects) || null;
// Project 01 is the front card; the list is read back to front.
const DATA = (SRC ? SRC.map((p) => [p.code || p.name.toLowerCase().split(" ")[0], p.year, p.stack.length]) : FALLBACK).slice(0, 9);
const N = DATA.length;

const W = 76, H = 48, G = 12, TW = 20, TH = 7, TABS = [5, 28, 51], TK = 1.4;
const REST = -12, BACK = -24, FWD = 18, LIFT = 15, R_TH = -3, R_LIFT = 9;
const X0 = -5, X1 = W + 5, Y0 = -9, Y1 = (N - 1) * G + 9, WH = 19, WR = 6, WT = 2.4;
const FY = Y1 + 0.6, FT = 2.2, FH = 28; // the drawer front: proud of the box, taller than its walls

const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** Card i, back to front: which project it holds, its tab position, and its notched, filleted outline. */
function card(i) {
  const k = N - 1 - i, t0 = TABS[k % 3], m = W / 2;
  const shape = fillet(
    [[0, 0], [m - 4, 0], [m - 4, 4], [m + 4, 4], [m + 4, 0], [W, 0], [W, H], [t0 + TW, H], [t0 + TW, H + TH], [t0, H + TH], [t0, H], [0, H]],
    [1, 0.6, 1.4, 1.4, 0.6, 1, 3, 1.6, 2.2, 2.2, 1.6, 3],
  );
  return { k, t0, shape, lines: DATA[k][2] };
}

function pose(P, i, shape, lines, th, lift) {
  const yb = i * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
  const w = (u, v) => P(u, yb + v * s, v * c + lift);
  const wb = (u, v) => P(u, yb + v * s - TK * c, v * c + TK * s + lift);
  const rules = [];
  for (let r = 0; r < lines; r++) rules.push(seg(w(6, H - 19 - r * 7), w(W - 6 - r * 9, H - 19 - r * 7)));
  return {
    back: poly(shape.map((p) => wb(p[0], p[1]))),
    face: poly(shape.map((p) => w(p[0], p[1]))),
    head: seg(w(6, H - 10), w(W * 0.55, H - 10)),
    rules: rules.join(""),
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.7);
  fit(C, [[X0, Y0, 0], [X1, FY + FT, -8], [X1, Y0, 0], [X0, FY + FT, 0], [X0, Y0, H + TH], [X1, Y0, H + TH + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  const outer = rrect(X0, Y0, X1, Y1, WR, 6), inner = rrect(X0 + WT, Y0 + WT, X1 - WT, Y1 - WT, WR - WT, 6);

  const g = mk("g", {}, svg);
  reflect(svg, g, P, front, outer, 0, 14);
  // the box's far half: body, the rim's inner edge, the floor seam along the far walls
  mk("path", { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), class: "sil" }, g);
  mk("path", { d: poly(ringAt(P, inner, WH)), class: "nf" }, g);
  mk("path", { d: open(ringAt(P, run(inner, (q) => !front(q)), 2.5)), class: "nf lo" }, g);

  const cards = [];
  for (let i = 0; i < N; i++) {
    const { k, t0, shape, lines } = card(i);
    const grp = mk("g", {}, g);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    const head = mk("path", { class: "nf" }, grp), rules = mk("path", { class: "nf lo" }, grp);
    cards.push({ k, t0, shape, lines, back, face, head, rules, a: tween(REST), z: tween(0) });
  }
  // rest: the newest project half drawn out, its face the one bright mark
  const restI = cards.reduce((b, cd, i) => (DATA[cd.k][1] > DATA[cards[b].k][1] ? i : b), N - 1);
  tset(cards[restI].a, R_TH, 0, 0); tset(cards[restI].z, R_LIFT, 0, 0);

  // the near half of the box: its side walls' rim, then the front plate with its fittings
  const oT = LR(ringAt(P, run(outer, front), WH)), iF = LR(ringAt(P, run(inner, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), class: "fo" }, g);
  mk("path", { d: open(oT), class: "nf lo" }, g);
  mk("path", { d: open(iF), class: "nf" }, g);
  const plate = rrect(X0 - 1.5, -1, X1 + 1.5, FH, 3.5, 6);
  const onF = (ring, y) => ring.map((q) => P(q.u, y, q.v));
  mk("path", { d: poly(hull(onF(plate, FY).concat(onF(plate, FY + FT)))), class: "sil" }, g);
  mk("path", { d: poly(onF(rrect(X0 - 0.4, 0.1, X1 + 0.4, FH - 1.1, 2.6, 6), FY + FT)), class: "nf lo" }, g);
  const hx = (X0 + X1) / 2;
  mk("path", { d: poly(onF(rrect(hx - 11, 17, hx + 11, 24, 1.6, 4), FY + FT)), class: "nf" }, g); // label holder
  mk("path", { d: poly(onF(rrect(hx - 9.4, 18.4, hx + 9.4, 22.6, 0.8, 4), FY + FT)), class: "nf lo" }, g);
  mk("path", { d: poly(onF(rrect(hx - 10, 7, hx + 10, 12.5, 2.7, 5), FY + FT)), class: "nf" }, g); // cup pull
  mk("path", { d: open(onF(rrect(hx - 8, 8.4, hx + 8, 11.2, 1.4, 5), FY + FT).slice(0, 14)), class: "nf lo" }, g);
  const knob = circ(1.7, 12).map((q) => ({ u: hx + q.u, v: 3.4 + q.v }));
  mk("path", { d: poly(onF(knob, FY + FT)), class: "nf" }, g); // the rod's end

  // hit bands along the RESTING top edges: they never move, and nothing draws them
  const top = (i) => P(W / 2, i * G + H * Math.sin(rad(REST)), H * Math.cos(rad(REST)));
  const c0 = top(0), c1 = top(1), d = [c1[0] - c0[0], c1[1] - c0[1]];
  const px0 = P(0, 0, 0), px1 = P(1, 0, 0), ex = [px1[0] - px0[0], px1[1] - px0[1]];
  const HALF = W / 2 + 6, det = d[0] * ex[1] - d[1] * ex[0];
  function hit([x, y]) {
    const qx = x - c0[0], qy = y - c0[1];
    const s = (qx * ex[1] - qy * ex[0]) / det, r = (d[0] * qy - d[1] * qx) / det;
    if (Math.abs(r) > HALF || s < -0.5 || s > N - 0.5 + 1.2) return -1;
    return clamp(Math.round(s), 0, N - 1);
  }

  function draw(cd, i, th, lift) {
    const q = pose(P, i, cd.shape, cd.lines, th, lift);
    if (q.face === cd.drawn) return;
    cd.drawn = q.face;
    cd.back.setAttribute("d", q.back); cd.face.setAttribute("d", q.face);
    cd.head.setAttribute("d", q.head); cd.rules.setAttribute("d", q.rules);
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    cards.forEach((cd, i) => { draw(cd, i, tval(cd.a, now), tval(cd.z, now)); if (!tdone(cd.a, now) || !tdone(cd.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : restI;
    act = a;
    cards.forEach((cd, i) => {
      const delay = Math.abs(i - from) * stag;
      const th = a < 0 ? (i === restI ? R_TH : REST) : i < a ? BACK : i > a ? FWD : 0;
      const z = a < 0 ? (i === restI ? R_LIFT : 0) : a === i ? LIFT : 0;
      tset(cd.a, th, now, delay); tset(cd.z, z, now, delay);
      const lit = a < 0 ? i === restI : i === a;
      cd.face.classList.toggle("hi", lit); cd.head.classList.toggle("hi", lit);
    });
    read.textContent = a < 0 ? "rest" : `${DATA[cards[a].k][0]} · ${DATA[cards[a].k][1]}`;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return {
    set: (v) => { stag = v; },
    // the page's list can pull a project's card: k is the project's place in the list, -1 puts it back
    pick: (k) => setActive(k < 0 ? -1 : cards.findIndex((cd) => cd.k === k)),
    destroy: bag.dispose,
  };
}

hairline({
  name: "index",
  means: "A drawer of project cards: the one under the pointer stands up, and the cards around it lean away in turn.",
  rules: [1, 2, 5, 10],
  range: [0, 40, 90],
  tour: [[150, 120], [215, 150], [260, 175], null],
  mount,
});
