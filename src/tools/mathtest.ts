// The engine's own arithmetic against JavaScript's (in npm test): over a million arguments drawn across the ranges the engine uses,
// each function in src/mathx.ts is within 4×10⁻¹⁶ of the Math function, relative to the value, or absolute where the value is
// smaller than 1 in size (cos crosses zero, where a relative error means nothing). Math's own functions are only near-exact, so this
// checks that the engine's are as good, not which is closer to the truth.
import { own } from '../mathx';
import { Rng } from '../rng';

const BOUND = 4e-16,
  N = +(process.argv[2] ?? 200000);
const r = new Rng(9301);
const u = (a: number, b: number) => a + (b - a) * r.next();
const cases: [string, () => [number, number]][] = [
  [
    'exp',
    () => {
      const x = u(-60, 20);
      return [own.exp(x), Math.exp(x)];
    },
  ],
  [
    'log',
    () => {
      const x = Math.pow(10, u(-12, 3));
      return [own.log(x), Math.log(x)];
    },
  ],
  [
    'pow 0.5^y',
    () => {
      const y = u(0, 300);
      return [own.pow(0.5, y), Math.pow(0.5, y)];
    },
  ],
  [
    'pow x^1.4',
    () => {
      const x = r.next() || 0.5;
      return [own.pow(x, 1.4), Math.pow(x, 1.4)];
    },
  ],
  [
    'pow x^1.5',
    () => {
      const x = r.next() || 0.5;
      return [own.pow(x, 1.5), Math.pow(x, 1.5)];
    },
  ],
  [
    'tanh',
    () => {
      const x = u(-12, 12);
      return [own.tanh(x), Math.tanh(x)];
    },
  ],
  [
    'cos 2πv',
    () => {
      const x = 2 * Math.PI * r.next();
      return [own.cos(x), Math.cos(x)];
    },
  ],
];
let bad = 0;
for (const [name, draw] of cases) {
  let worst = 0;
  for (let i = 0; i < N; i++) {
    const [a, b] = draw();
    const e = Math.abs(a - b) / Math.max(1, Math.abs(b));
    const rel = Math.abs(b) >= 1 ? e : Math.abs(a - b) / Math.max(Math.abs(b), Number.MIN_VALUE);
    worst = Math.max(worst, name.startsWith('cos') ? e : rel);
  }
  const ok = worst <= BOUND;
  if (!ok) bad++;
  console.log(`${name.padEnd(10)} worst ${worst.toExponential(2)} ${ok ? 'ok' : 'OVER ' + BOUND}`);
}
for (const [f, x, want] of [
  ['exp', 0, 1],
  ['log', 1, 0],
  ['pow', 0, 0],
  ['tanh', 0, 0],
  ['cos', 0, 1],
] as const) {
  const got = f === 'pow' ? own.pow(0, 2) : (own as any)[f](x);
  if (got !== want) {
    console.log(`${f}(${x}) = ${got}, not ${want}`);
    bad++;
  }
}
if (bad) {
  console.log(`mathx: ${bad} out of bounds`);
  process.exitCode = 1;
} else console.log('mathx: every function within bounds');
