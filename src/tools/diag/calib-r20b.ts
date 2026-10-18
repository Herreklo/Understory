// Calibration only (train worlds): where attachment anxiety's mean comes from.
import { buildWorld } from '../../build';
import { live, age } from '../../world';
import { loving } from '../../love';
const m = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
const fa: number[] = [],
  fd: number[] = [],
  fs: number[] = [],
  an: number[] = [],
  lost: number[] = [],
  parted: number[] = [];
for (const seed of [1501, 1502, 1503, 1504, 1505]) {
  const w = buildWorld(seed, 1);
  for (const p of live(w)) {
    if (age(w, p) < 18) continue;
    fa.push(p.facets.anxiety);
    fd.push(p.facets.dependence);
    fs.push(p.facets.socialSelfEsteem);
    const parents = p.parents.map(id => w.byId.get(id)!).filter(Boolean);
    lost.push(parents.some(q => q.status === 'dead' && q.diedAt != null && (q.diedAt - p.born) / 12 < 16) ? 1 : 0);
    parted.push(
      parents.length === 2 &&
        w.events.some(
          e =>
            (e.type === 'divorce' || e.type === 'split') &&
            e.who.includes(parents[0].id) &&
            e.who.includes(parents[1].id) &&
            e.t - p.born >= 0 &&
            (e.t - p.born) / 12 < 16,
        )
        ? 1
        : 0,
    );
    an.push(loving(w, p).anxiety);
  }
}
console.log(
  `facet means: anxiety ${m(fa).toFixed(2)} dependence ${m(fd).toFixed(2)} socialSelfEsteem ${m(fs).toFixed(2)}; lost a parent young ${(100 * m(lost)).toFixed(0)}%, parents parted young ${(100 * m(parted)).toFixed(0)}%; attachment anxiety mean ${m(an).toFixed(2)}`,
);
