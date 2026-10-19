// The engine's own arithmetic (docs/scale/portability.md, rule 3). JavaScript leaves the last digits of Math.exp, log, pow, tanh and
// cos to the engine that runs it; these are built only from addition, subtraction, multiplication, division and Math.sqrt, which
// IEEE 754 rounds exactly everywhere, so the same seed gives the same world in any browser, any Node, or a port to another language.
// Each is within a few parts in 10^16 of the true value over the ranges the engine uses (checked in npm test by mathtest.ts).

// ln 2 and π/2 in two parts: the first has trailing zero bits, so k times it is exact for the k the engine meets (fdlibm's split).
const LN2_HI = 6.9314718036912381649e-1,
  LN2_LO = 1.90821492927058770002e-10,
  INV_LN2 = 1.4426950408889634,
  PIO2_HI = 1.57079632673412561417,
  PIO2_LO = 6.07710050650619224932e-11,
  TWO_OVER_PI = 0.6366197723675814,
  SQRT2 = 1.4142135623730951;

// Powers of two from 2^-1074 to 2^1023, made by doubling and halving, which are exact.
const P2_MIN = -1074,
  P2 = new Float64Array(1023 - P2_MIN + 1);
P2[-P2_MIN] = 1;
for (let i = 1; i <= 1023; i++) P2[-P2_MIN + i] = P2[-P2_MIN + i - 1] * 2;
for (let i = -1; i >= P2_MIN; i--) P2[-P2_MIN + i] = P2[-P2_MIN + i + 1] / 2;
const pow2 = (k: number) => P2[-P2_MIN + k];

/** v × 2^k, exact unless the result is subnormal. */
function scale2(v: number, k: number): number {
  if (k > 1023) return v * pow2(1023) * pow2(k - 1023);
  if (k < -1022) return v * pow2(-1022) * pow2(Math.max(P2_MIN, k + 1022));
  return v * pow2(k);
}

// 1/n! for the Taylor series, each rounded once.
const INV_FACT: number[] = [1];
for (let n = 1; n <= 27; n++) INV_FACT[n] = INV_FACT[n - 1] / n;

function ownExp(x: number): number {
  if (x !== x) return NaN;
  if (x > 709.782712893384) return Infinity;
  if (x < -745.1332191019412) return 0;
  const k = Math.round(x * INV_LN2);
  const r = x - k * LN2_HI - k * LN2_LO; // |r| ≤ 0.35
  let p = INV_FACT[14];
  for (let n = 13; n >= 0; n--) p = p * r + INV_FACT[n];
  return scale2(p, k);
}

/** x = m × 2^e with m in [√½, √2). */
function split(x: number): [number, number] {
  let m = x,
    e = 0;
  if (m < 2.2250738585072014e-308) {
    m *= pow2(54);
    e -= 54;
  }
  while (m >= 65536) {
    m *= 1 / 65536;
    e += 16;
  }
  while (m < 1 / 65536) {
    m *= 65536;
    e -= 16;
  }
  while (m >= 2) {
    m *= 0.5;
    e++;
  }
  while (m < 1) {
    m *= 2;
    e--;
  }
  if (m > SQRT2) {
    m *= 0.5;
    e++;
  }
  return [m, e];
}

/** log m for m in [√½, √2), with f = m − 1 exact: f − (f²/2 − s·(f²/2 + R)), s = f/(2 + f) (fdlibm's arrangement, which keeps
 * the rounding of the series small against f). */
function logReduced(m: number): number {
  const f = m - 1,
    s = f / (2 + f),
    z = s * s,
    hfsq = 0.5 * f * f;
  let R = 2 / 27;
  for (let n = 25; n >= 3; n -= 2) R = R * z + 2 / n;
  R *= z;
  return f - (hfsq - s * (hfsq + R));
}

function ownLog(x: number): number {
  if (x !== x || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (x === Infinity) return Infinity;
  const [m, e] = split(x);
  return e * LN2_HI + (e * LN2_LO + logReduced(m));
}

// The exact product a·b as hi + lo (Dekker), without a fused multiply-add, which not every language guarantees.
function twoProd(a: number, b: number): [number, number] {
  const p = a * b;
  const ca = 134217729 * a,
    ah = ca - (ca - a),
    al = a - ah;
  const cb = 134217729 * b,
    bh = cb - (cb - b),
    bl = b - bh;
  return [p, ah * bh - p + ah * bl + al * bh + al * bl];
}

/** x^y for x > 0 and finite y, as 2^(y·log2 x): the exponent's whole part is carried exactly, so pow(0.5, y) is as exact as 2^−y.
 * The rest of y·log2 x is not, so accuracy falls off as |y·log x| grows (about 10^−14 relative at y = 200); the engine's exponents
 * are 1.4, 1.5 and halvings. A negative base, an infinite y or a NaN base give NaN. */
function ownPow(x: number, y: number): number {
  if (x !== x || y !== y) return NaN;
  if (y === 0 || x === 1) return 1;
  if (x === 0) return y > 0 ? 0 : Infinity;
  if (x < 0) return NaN; // the engine never raises a negative number to a power
  if (x === Infinity) return y > 0 ? Infinity : 0;
  const [m, e] = split(x);
  const [th, tl] = twoProd(y, e); // y·e, exactly
  const ym = y * logReduced(m) * INV_LN2; // y·log2 m, small when y is
  const n = Math.round(th + ym);
  const f = th - n + tl + ym; // th − n is exact
  if (n > 2000) return Infinity;
  if (n < -2000) return 0;
  return scale2(ownExp(f * LN2_HI + f * LN2_LO), n);
}

function ownTanh(x: number): number {
  if (x !== x) return NaN;
  const a = x < 0 ? -x : x;
  let t: number;
  if (a > 22) t = 1;
  else if (a < 1) {
    // Lambert's continued fraction, tanh a = a/(1 + c); written a − a·c/(1 + c) so the rounding in c is scaled down by c/(1 + c) ≤ 0.24.
    const a2 = a * a;
    let c = 0;
    for (let k = 14; k >= 1; k--) c = a2 / (2 * k + 1 + c);
    t = a - (a * c) / (1 + c);
  } else t = 1 - 2 / (ownExp(2 * a) + 1);
  return x < 0 ? -t : t;
}

/** cos x for |x| up to about 10^5 (the engine's arguments are within 2π). */
function ownCos(x: number): number {
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  const k = Math.round(x * TWO_OVER_PI);
  const r = x - k * PIO2_HI - k * PIO2_LO; // |r| ≤ π/4
  const r2 = r * r;
  const q = ((k % 4) + 4) % 4;
  if (q === 0 || q === 2) {
    let c = INV_FACT[22];
    for (let n = 20; n >= 0; n -= 2) c = -c * r2 + INV_FACT[n];
    return q === 0 ? c : -c;
  }
  let s = INV_FACT[23];
  for (let n = 21; n >= 1; n -= 2) s = -s * r2 + INV_FACT[n];
  s *= r;
  return q === 1 ? -s : s;
}

export const exp = (x: number) => ownExp(x);
export const log = (x: number) => ownLog(x);
export const pow = (x: number, y: number) => ownPow(x, y);
export const tanh = (x: number) => ownTanh(x);
export const cos = (x: number) => ownCos(x);

/** The engine's own functions, by name (for the accuracy check). */
export const own = { exp: ownExp, log: ownLog, pow: ownPow, tanh: ownTanh, cos: ownCos };
