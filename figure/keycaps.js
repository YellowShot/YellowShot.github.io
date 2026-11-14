/**
 * Keycaps: a 40% keyboard on a rounded case. Forty sculpted caps, each a
 * tapered solid whose top sits back from its foot, in four rows of different
 * heights, with homing bars on two keys of the home row and a long spacebar.
 * The pointer is projected onto the plane of the caps' tops; each cap sinks by
 * its distance to it, on its own spring, so a press spreads into its
 * neighbours. At rest a key is held down mid-word and the spacebar is half
 * pressed. The slider is the reach of a press, in key units.
 *
 * The pattern: a continuous field over discrete parts. Springs, a falloff by
 * distance to each cap's footprint, and a hit test on a fixed plane at the
 * caps' resting tops, which never moves.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rings, ringAt, rrect, run, seg, unproj,
  spring, stepS, mk, pointer, put, register, disposer, solid, reflect,
} = HL;

const U = 15, GAP = 1, SIDE = 1.9, BACKSET = 2.8, FRONT = 1.2, CB = 0.9, Z0 = 0.4, TRAVEL = 7.6;
// Widths in key units, far row first: a 12.5u forty.
const ROWS = [
  [1.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.25],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.25, 1.25, 1.5, 5.5, 1.5, 1.5],
];
const PROFILE = [12.8, 11.6, 11, 12]; // each row its own height, as a sculpted set is
const HOME = new Set(["1,4", "1,7"]); // the two keys a finger finds by touch
const REST_KEY = "1,3", SPACE = "3,3", PLANE = 11.8;
const W = 12.5 * U, D = ROWS.length * U, M = 7, ZC = -7;

/** The share of a full press at u reaches from the pointer: 1 → .31 at 42% → 0 at the edge. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 * (1 - (u - 0.417) / 0.583) ** 1.6 : 0;

/** Distance from a world point to a cap's footprint; 0 inside it. */
const reach = (k, [x, y]) => Math.hypot(Math.max(k.x0 - x, 0, x - k.x1), Math.max(k.y0 - y, 0, y - k.y1));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.58);
  fit(C, [[-M, -M, ZC], [W + M, D + M, ZC - 10], [W + M, -M, ZC], [-M, D + M, ZC], [-M, -M, PROFILE[0] + 1]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value, over = null;

  const g = mk("g", {}, svg);
  const [cr, ci] = rings(-M, -M, W + M, D + M, 9, 2.2);
  reflect(svg, g, P, front, cr, ZC, 12);
  put(solid(g), prism(P, front, cr, ci, ZC, 0));
  // the plate's well, one line inside the case's top, where the caps stand
  mk("path", { d: poly(ringAt(P, rrect(-2.2, -2.2, W + 2.2, D + 2.2, 4, 5), 0)), class: "nf lo" }, g);

  // Row by row from the back, left to right: a cap can only hide what is behind it in y or in x.
  const keys = [];
  ROWS.forEach((row, r) => {
    let x = 0;
    row.forEach((w, c) => {
      const x0 = x + GAP, x1 = x + w * U - GAP, y0 = r * U + GAP, y1 = (r + 1) * U - GAP, id = r + "," + c;
      const top = rrect(x0 + SIDE, y0 + BACKSET, x1 - SIDE, y1 - FRONT, 2.2, 4);
      const k = {
        r, c, id, x0, y0, x1, y1, h: PROFILE[r],
        foot: rrect(x0, y0, x1, y1, 2.6, 4), top,
        inner: rrect(x0 + SIDE + CB, y0 + BACKSET + CB, x1 - SIDE - CB, y1 - FRONT - CB, 1.4, 4),
        el: solid(g), drawn: NaN,
      };
      if (HOME.has(id)) k.bar = mk("path", { class: "nf" }, k.el.g);
      keys.push(k);
      x += w * U;
    });
  });
  const byId = new Map(keys.map((k) => [k.id, k]));
  const restKey = byId.get(REST_KEY), space = byId.get(SPACE);

  // Rest: one key held to the floor, its neighbours following a little, and the spacebar half down.
  const rp = [(restKey.x0 + restKey.x1) / 2, (restKey.y0 + restKey.y1) / 2];
  for (const k of keys) {
    k.rest = TRAVEL * falloff(reach(k, rp) / (1.1 * U));
    if (k === space) k.rest = TRAVEL * 0.38;
    k.sp = spring(k.rest, { eps: 0.02 });
  }

  function drawKey(k) {
    const d = clamp(k.sp.x, 0, TRAVEL);
    if (d === k.drawn) return;
    k.drawn = d;
    const z = k.h - d;
    put(k.el, {
      sil: poly(hull(ringAt(P, k.foot, Z0).concat(ringAt(P, k.top, z)))),
      crease: open(ringAt(P, run(k.inner, front), z)),
    });
    if (k.bar) {
      const cx = (k.x0 + k.x1) / 2, yb = k.y1 - FRONT - 3.2;
      k.bar.setAttribute("d", seg(P(cx - 3, yb, z), P(cx + 3, yb, z)));
    }
  }

  let lit = null;
  function light(k) {
    if (k === lit) return;
    if (lit) lit.el.sil.classList.remove("hi");
    lit = k;
    k.el.sil.classList.add("hi");
  }
  light(restKey);

  const B = register(stage, (dt) => {
    let m = false;
    for (const k of keys) { if (stepS(k.sp, dt)) m = true; drawKey(k); }
    return m;
  });
  bag.add(B.unregister);

  /** The cap under a world point on the tops' plane: the one it falls in, or the nearest within a gap. */
  function under(p) {
    let best = null, bd = 2.5;
    for (const k of keys) { const d = reach(k, p); if (d < bd) { bd = d; best = k; } }
    return best;
  }

  function retarget() {
    const k = over && under(over);
    if (!k) {
      for (const q of keys) q.sp.t = q.rest;
      light(restKey);
      read.textContent = "rest";
    } else {
      for (const q of keys) q.sp.t = TRAVEL * falloff(reach(q, over) / (R * U));
      light(k);
      read.textContent = k === space ? "space" : `key ${k.r}·${k.c}`;
    }
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], PLANE); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "keycaps",
  means: "A keyboard whose caps sink under the pointer, the press spreading into the keys around it.",
  rules: [1, 3, 5, 9],
  range: [0.7, 1.6, 2.6],
  tour: [[150, 150], [250, 170], [230, 210], null],
  mount,
});
