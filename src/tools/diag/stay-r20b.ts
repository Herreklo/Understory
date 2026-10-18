// Diagnosis after round 20b's result (used worlds 1871–1873): who faces the decision to stay, why, and how often it ends a marriage.
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { likeOf } from '../../world';
const rows: any[] = [];
let likeAll: number[] = [];
for (const seed of [1871, 1872, 1873]) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const log: any[] = [];
  (w as any).loveLog = log;
  let seen = 0;
  for (let m = 0; m < 120; m++) {
    tick(w);
    for (; seen < log.length; seen++) {
      const x = log[seen];
      if (x.stay == null) continue;
      rows.push({ ...x, like: likeOf(w, x.a, x.b), back: likeOf(w, x.b, x.a) });
    }
    if (m % 12 === 0)
      for (const p of w.people) if (p.status === 'in' && p.partner != null && p.pstat === 'married') likeAll.push(likeOf(w, p.id, p.partner));
  }
  for (const e of w.events)
    if (e.decision && (e.decision as any).trigger === 'stay' && rows.length < 4)
      console.log(JSON.stringify((e.decision as any).options.map((o: any) => [o.id, +o.p.toFixed(2)])));
}
const q = (v: number[], x: number) => {
  const s = v.slice().sort((a, b) => a - b);
  return s[Math.floor(x * (s.length - 1))];
};
const by = (f: (x: any) => boolean, name: string) => {
  const g = rows.filter(f);
  console.log(
    `${name.padEnd(40)} n ${String(g.length).padStart(4)} · ended ${((100 * g.filter(x => x.stay === 'endit').length) / Math.max(1, g.length)).toFixed(0)}%`,
  );
};
console.log(
  `married partners' liking for each other, sampled yearly: median ${q(likeAll, 0.5).toFixed(2)}, 25th ${q(likeAll, 0.25).toFixed(2)}, 10th ${q(likeAll, 0.1).toFixed(2)}; below 0.3: ${((100 * likeAll.filter(x => x < 0.3).length) / likeAll.length).toFixed(0)}%`,
);
by(() => true, 'all decisions');
by(x => x.like < 0.3 && x.distance <= 0.5 && !x.scorned, 'only: liking under 0.3');
by(x => x.distance > 0.5, 'drifted apart (> 0.5)');
by(x => x.scorned, 'shown contempt in the last year');
by(x => x.kids, 'children at home');
by(x => !x.kids, 'no children at home');
by(x => x.like >= 0.15, 'liking 0.15 or more');
by(x => x.like < 0, 'liking below zero');
