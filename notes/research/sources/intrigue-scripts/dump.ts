// Intrigue audit (research, 22 Oct 2026): run throwaway worlds and dump the present record, compactly, for analysis in Python.
// Reads the world only; changes nothing in the engine. One JSONL file per seed.
//   ./run.sh notes/research/sources/intrigue-scripts/dump.ts A B [years] [outdir]
// Per event: id, t, type, who, causes (ref ids), w, vis, trigger, chosen, family of the chosen option's label,
// whether the witness knows it (end of run), and, at the moment it happened, whether who[0] and who[1] were friends,
// partners or kin, who[0]'s liking and trust of who[1], and how many people were friends of both.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { live, peekBond } from '../../../../src/world';
import { rivalries } from '../../../../src/drama';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const years = Number(process.argv[4] ?? 8);
const out = process.argv[5] ?? 'out-intrigue';
mkdirSync(out, { recursive: true });
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w);
  const t0 = w.t;
  const rows: any[] = [];
  const at = new Map<number, any>();
  let seen = w.events.length;
  let secretMonths = 0,
    adultMonths = 0,
    promiseMonths = 0;
  for (let i = 0; i < years * 12; i++) {
    tick(w);
    for (const p of live(w)) {
      if (w.t - p.born < 18 * 12) continue;
      adultMonths++;
      if (p.secrets.length) secretMonths++;
      if (p.promises.length) promiseMonths++;
    }
    for (let k = seen; k < w.events.length; k++) {
      const e = w.events[k];
      const [a, b] = e.who;
      if (a == null || b == null) continue;
      const pa = w.byId.get(a),
        pb = w.byId.get(b);
      if (!pa || !pb) continue;
      at.set(e.id, {
        fr: pa.friends?.has(b) ? 1 : 0,
        pt: pa.partner === b ? 1 : 0,
        kin: pa.parents.includes(b) || pa.kids.includes(b) || pb.parents.some(x => pa.parents.includes(x)) ? 1 : 0,
        lk: Math.round((peekBond(w, a, b)?.like ?? 0) * 100) / 100,
        tu: Math.round((peekBond(w, a, b)?.trust ?? 0) * 100) / 100,
        cf: [...(pa.friends ?? [])].filter(x => pb.friends?.has(x)).length, // friends of both, at that moment
      });
    }
    seen = w.events.length;
  }
  for (const e of w.events) {
    if (e.t < t0) continue;
    const d: any = e.decision;
    rows.push({
      id: e.id,
      t: e.t - t0,
      ty: e.type,
      who: e.who,
      c: e.causes.filter(c => c.ref != null && c.ref >= 0).map(c => c.ref),
      ct: e.causes.filter(c => c.ref != null && c.ref >= 0).map(c => w.events[c.ref!]?.type),
      w: e.w,
      vis: e.vis,
      tr: d?.trigger ?? null,
      ch: d?.chosen ?? null,
      ex: d?.expr ?? null,
      kw: e.knownBy.has(wit.id) || e.who.includes(wit.id) ? 1 : 0,
      kn: e.knownBy.size,
      ...(at.get(e.id) ?? {}),
    });
  }
  const meta = {
    seed,
    t0,
    months: years * 12,
    pop: live(w).length,
    adultMonths,
    secretMonths,
    promiseMonths,
    rivalries: rivalries(w).map(r => ({ stake: r.stake, src: r.src ?? null, since: r.since - t0, over: r.over == null ? null : r.over - t0, outcome: r.outcome ?? null, n: r.events.length })),
  };
  writeFileSync(`${out}/${seed}.jsonl`, JSON.stringify(meta) + '\n' + rows.map(r => JSON.stringify(r)).join('\n') + '\n');
  console.log(seed, rows.length, 'events', meta.pop, 'people');
}
