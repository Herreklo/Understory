// Read cold (round 20): five random adults from a test world, and the rows of three couples, in plain words.
//   tsx src/tools/diag/couples-r20.ts <seed>
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { age, live, year, likeOf, type Person, nameOf } from '../../world';
import { Rng } from '../../rng';
import { loving, attachmentWord } from '../../love';
const seed = +(process.argv[2] ?? 2445);
const w = buildWorld(seed, 1);
pickWitness(w);
const t0 = w.t;
runYears(w, 10);
const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
const r = new Rng(seed * 7 + 1);
const adults = live(w).filter(p => age(w, p) >= 25);
const style = (p: Person) => {
  const L = loving(w, p);
  const top = (['criticism', 'contempt', 'defensive', 'stonewall', 'repair'] as const).filter(k => L[k] > 0.8).join(', ');
  return `${attachmentWord(L)}, shows care in ${L.care}${top ? `, fights with ${top}` : ''}`;
};
console.log(`World ${seed}, ${year(t0)}–${year(w.t)}\n`);
for (const p of r.shuffle(adults.slice()).slice(0, 5)) {
  console.log(
    `== ${p.first} ${p.last}, ${Math.floor(age(w, p))}${p.partner != null ? `, with ${w.byId.get(p.partner)!.first} (${p.pstat})` : ''} · ${style(p)}`,
  );
  for (const i of p.events) {
    const e = w.events[i];
    if (e.t < t0 || e.w < 0.6) continue;
    console.log(
      `  ${year(e.t)}: ${plain(e.text)}${
        e.causes.length
          ? `  [${plain(
              e.causes
                .slice(0, 3)
                .map(c => c.label)
                .join('; '),
            )}]`
          : ''
      }`,
    );
  }
  console.log('');
}
// Couples with the most between them in the decade.
const pairs = new Map<string, number[]>();
for (const e of w.events) {
  if (e.t < t0) continue;
  const d = e.decision as any;
  if (
    !(
      (d && (d.trigger === 'row' || d.trigger === 'row-answer')) ||
      e.type === 'care' ||
      e.type === 'couple:pattern' ||
      e.type === 'divorce' ||
      e.type === 'split' ||
      e.type === 'married'
    )
  )
    continue;
  if (e.who.length < 2) continue;
  const k = [e.who[0], e.who[1]].sort((a, b) => a - b).join('-');
  (pairs.get(k) ?? pairs.set(k, []).get(k)!).push(e.id);
}
for (const [k, ids] of [...pairs].sort((a, b) => b[1].length - a[1].length).slice(0, 3)) {
  const [a, b] = k
    .split('-')
    .map(Number)
    .map(id => w.byId.get(id)!);
  console.log(
    `== ${a.first} and ${b.first} · ${a.first}: ${style(a)} · ${b.first}: ${style(b)} · liking now ${likeOf(w, a.id, b.id).toFixed(2)} / ${likeOf(w, b.id, a.id).toFixed(2)}`,
  );
  for (const id of ids) {
    const e = w.events[id];
    console.log(
      `  ${year(e.t)}: ${plain(e.text)}${e.w <= 0.2 ? ' (not in the chronicle)' : ''}  [${plain(
        e.causes
          .slice(0, 3)
          .map(c => c.label)
          .join('; '),
      )}]`,
    );
  }
  console.log('');
}
