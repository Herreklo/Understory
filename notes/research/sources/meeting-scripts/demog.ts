// P4 research (26 Oct 2026): why births fall with feelings on. Throwaway worlds only. Reads the world; changes nothing in the engine.
//   ./run.sh notes/research/sources/meeting-scripts/demog.ts ARM A B [years] [outdir]
// ARM: off | on | on-grief | on-resentment | on-guilt | on-gratitude | on-owes (on, with that kind wiped from every person after each
// month, so it weighs in no later decision; `on-owes` deletes the debt slot instead). Per world, from the present on, as the demography
// check counts them: births, deaths, marriages, splits; each month, settled couples of an age to have children, the share of them whose
// lower like is under 0.2 (familyTick's ×0.3), their mean lower like, and adult-months holding a feeling toward their own partner.
import '../../../../src/tools/env';
import { mkdirSync, appendFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { ON, OFF, live, age, likeOf, P, type World } from '../../../../src/world';
import { feelingsOf } from '../../../../src/feelings';

const [ARM, A, B] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4])];
const YEARS = Number(process.argv[5] ?? 20);
const OUT = process.argv[6] ?? 'out-meeting';
mkdirSync(OUT, { recursive: true });
if (ARM === 'off') OFF.add('feelings');
else ON.add('feelings');
const WIPE = ARM.startsWith('on-') ? ARM.slice(3) : null;

function wipe(w: World) {
  if (!WIPE) return;
  if (WIPE === 'owes') {
    for (const p of w.people) delete p.owes;
    return;
  }
  const s = (w as any).feelings as Map<number, any[]> | undefined;
  if (!s) return;
  for (const [id, list] of s)
    s.set(
      id,
      list.filter(f => f.k !== WIPE),
    );
}

for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  const start = live(w).length;
  let coupleMonths = 0,
    lowLike = 0,
    likeSum = 0,
    towardPartner: Record<string, number> = {},
    adultMonths = 0;
  for (let m = 0; m < YEARS * 12; m++) {
    tick(w);
    wipe(w);
    for (const p of live(w)) {
      if (age(w, p) >= 18) adultMonths++;
      if (p.partner != null)
        for (const f of feelingsOf(w, p.id)) if (f.o === p.partner && f.v >= 0.12) towardPartner[f.k] = (towardPartner[f.k] ?? 0) + 1;
      if (p.partner == null || p.id > p.partner) continue;
      const q = P(w, p.partner);
      if (q.status !== 'in' || !(p.pstat === 'married' || w.t - p.psince >= 24)) continue;
      const mom = p.sex === q.sex ? (age(w, p) < age(w, q) ? p : q) : p.sex === 'f' ? p : q;
      const ma = age(w, mom);
      if (ma < 20 || ma > 43) continue;
      coupleMonths++;
      const lo = Math.min(likeOf(w, p.id, q.id), likeOf(w, q.id, p.id));
      likeSum += lo;
      if (lo < 0.2) lowLike++;
    }
  }
  const ev = w.events.filter(e => e.t >= t0);
  const n = (f: (e: any) => boolean) => ev.filter(f).length;
  const row = {
    seed,
    arm: ARM,
    years: YEARS,
    start,
    end: live(w).length,
    births: n(e => e.type === 'born' && /was born/.test(e.text)),
    deaths: n(e => e.type === 'death'),
    marriages: n(e => e.type === 'married'),
    splits: n(e => e.type === 'divorce' || e.type === 'split'),
    coupleMonths,
    lowLike,
    likeSum,
    adultMonths,
    towardPartner,
  };
  appendFileSync(`${OUT}/demog-${ARM}.jsonl`, JSON.stringify(row) + '\n');
  console.log(JSON.stringify(row));
}
