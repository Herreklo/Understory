// Round 22: the consequence map. For every weighty event, what follows from it in the record within three years: weighty
// descendants (later events that cite it, directly or through a chain), turns (descendants that change something that does not
// revert by itself), how deep the chains go and how far they reach. Counts traceable consequences only.
//   tsx src/tools/consequences.ts run A B → out-cons/A-B.json ;  tsx src/tools/consequences.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { OFF, type World, type Event } from '../world';
const OUT = process.env.CONS_OUT ?? 'out-cons';
mkdirSync(OUT, { recursive: true });
const TEXTURE = new Set(['everyday', 'noticed', 'table', 'habit:new', 'habit:broke', 'habit:back', 'tell', 'ill']);
export const TURNS = new Set([
  'hired',
  'dismiss',
  'walkout',
  'quitpride',
  'promoted',
  'retired',
  'stepdown',
  'left',
  'home',
  'dating',
  'married',
  'divorce',
  'split',
  'friends',
  'madeup',
  'cooled',
  'mended',
  'group:formed',
  'group:joined',
  'group:left',
  'group:split',
  'numb',
  'sober',
  'bought',
  'setback',
  'takenup',
  'gaveup',
  'want:achieved',
  'want:failed',
  'want:abandoned',
  'regret',
  'rivalry',
  'grudge',
  'peace',
  'opened',
  'plan:failed',
  'council:no',
  'council:yes',
  'scheme:found',
  'born',
]);
const weighty = (e: Event) => e.w >= 0.8 && !TEXTURE.has(e.type);
// A coarse label for which part of the model an event comes from (by its decision's situation, else its type).
function system(e: Event) {
  const tr = String((e.decision as any)?.trigger ?? '').replace(/:.*$/, '');
  const ty = e.type;
  if (tr === 'row' || tr === 'row-answer' || ty === 'care' || ty === 'couple:pattern' || ['dating', 'married', 'divorce', 'split'].includes(ty))
    return 'couples';
  if (/^(contest|rival|grudge|scheme|peace|passed|promoted|stepdown|undermined)/.test(tr || ty) || ['rivalry', 'rivals', 'grudge'].includes(ty))
    return 'drama';
  if (/^(plan|pitch|backing|council|opened|night|turneddown)/.test(tr || ty)) return 'plans';
  if (/^group/.test(tr || ty) || ['performed', 'authorship', 'spark'].includes(ty)) return 'groups';
  if (/^thread/.test(ty) || tr === 'strain') return 'threads';
  if (ty === 'humour' || ty === 'regret') return 'persona';
  if (['friends', 'madeup', 'cooled', 'mended', 'dislike', 'misread', 'reachout'].includes(ty) || tr === 'reachout') return 'friendship';
  if (/^(want|pursuit|takenup|gaveup|gotgood|goforit|pushon|setback|bought)/.test(ty) || tr === 'a want') return 'wants';
  if (
    ['hired', 'dismiss', 'walkout', 'quitpride', 'retired', 'deadline', 'risk', 'judgement', 'criticised'].includes(ty) ||
    ['deadline', 'risk', 'judgement', 'criticised'].includes(tr)
  )
    return 'work';
  if (['left', 'home', 'arrived', 'stayed', 'follow', 'unfollow'].includes(ty)) return 'home';
  if (['death', 'born', 'accident', 'loss'].includes(ty) || tr === 'loss' || tr === 'support') return 'life';
  return tr ? `situation:${tr}` : 'other';
}
type Row = { type: string; sys: string; desc: number; wdesc: number; turns: number; depth: number; reach: number };
if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    rule = process.argv[5] ?? 'on';
  const out: { seed: number; rows: Row[]; wantCaused: number; wantOrigin: number; wants: number }[] = [];
  for (let seed = A; seed <= B; seed++) {
    OFF.clear();
    if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const t0 = w.t;
    runYears(w, 10);
    const kids = new Map<number, number[]>();
    for (const f of w.events) {
      if (f.t < t0) continue;
      const seen = new Set<number>();
      for (const c of f.causes)
        if (c.ref != null && c.ref >= 0 && c.ref < f.id && !seen.has(c.ref)) {
          seen.add(c.ref);
          (kids.get(c.ref) ?? kids.set(c.ref, []).get(c.ref)!).push(f.id);
        }
    }
    const rows: Row[] = [];
    for (const e of w.events) {
      if (e.t < t0 || e.t > t0 + 84 || !weighty(e)) continue;
      // Breadth-first over descendants within three years, recording depth.
      const depth = new Map<number, number>([[e.id, 0]]);
      const q = [e.id];
      let maxD = 0;
      while (q.length) {
        const id = q.shift()!;
        for (const k of kids.get(id) ?? []) {
          if (depth.has(k) || w.events[k].t > e.t + 36) continue;
          const d = depth.get(id)! + 1;
          depth.set(k, d);
          q.push(k);
          if (weighty(w.events[k])) maxD = Math.max(maxD, d);
        }
      }
      depth.delete(e.id);
      const D = [...depth.keys()].map(k => w.events[k]);
      const reach = new Set<number>();
      for (const f of D) if (weighty(f)) for (const id of f.who) if (!e.who.includes(id)) reach.add(id);
      rows.push({
        type: e.type,
        sys: system(e),
        desc: D.length,
        wdesc: D.filter(weighty).length,
        turns: D.filter(f => TURNS.has(f.type)).length,
        depth: maxD,
        reach: reach.size,
      });
    }
    const pres = w.events.filter(e => e.t >= t0 && weighty(e));
    out.push({ seed, rows, wantCaused: pres.filter(e => e.causes.some(c => c.kind === 'want')).length, wantOrigin: 0, wants: pres.length });
    console.error(`consequences: world ${seed}`);
  }
  OFF.clear();
  writeFileSync(`${OUT}/${rule === 'on' ? '' : rule + '-'}${A}-${B}.json`, JSON.stringify(out));
} else {
  const rule = process.argv[3] ?? 'on';
  const all: { seed: number; rows: Row[]; wantCaused: number; wants: number }[] = [];
  for (const f of readdirSync(OUT).filter(f => f.endsWith('.json') && (rule === 'on' ? /^\d/.test(f) : f.startsWith(rule + '-'))))
    all.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
  all.sort((a, b) => a.seed - b.seed);
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const T = (n: number) =>
    [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[], d = 2) => {
    const m = mean(v);
    const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1));
    return `${m.toFixed(d)} ±${((T(v.length) * sd) / Math.sqrt(v.length)).toFixed(d)}`;
  };
  const R = all.flatMap(x => x.rows);
  const share = (rows: Row[], f: (r: Row) => boolean) => rows.filter(f).length / Math.max(1, rows.length);
  console.log(
    `${rule === 'on' ? '' : `OFF=${rule} · `}${all.length} worlds · weighty events in the first seven present years, followed for three years · ${R.length} sources`,
  );
  console.log(`  with any weighty descendant   ${ci(all.map(x => share(x.rows, r => r.wdesc > 0)))}`);
  console.log(`  with a turn                   ${ci(all.map(x => share(x.rows, r => r.turns > 0)))}`);
  const dd = R.map(r => r.depth).sort((a, b) => a - b);
  console.log(
    `  chain depth (weighty): median ${dd[Math.floor(dd.length / 2)]}, 90th ${dd[Math.floor(0.9 * dd.length)]}, max ${dd[dd.length - 1]} · reaching someone outside the source: ${ci(all.map(x => share(x.rows, r => r.reach > 0)))}`,
  );
  console.log(
    `  weighty events that give a want as a reason: ${((100 * all.reduce((s, x) => s + x.wantCaused, 0)) / all.reduce((s, x) => s + x.wants, 0)).toFixed(0)}% (a want records no event it came from, so these chains stop at the want)`,
  );
  const table = (key: (r: Row) => string, min: number, title: string) => {
    const g = new Map<string, Row[]>();
    for (const r of R) (g.get(key(r)) ?? g.set(key(r), []).get(key(r))!).push(r);
    console.log(`\n${title} (at least ${min} sources), sorted by turn share; DEAD END = turns < 5% and weighty descendants < 15%`);
    console.log(
      `  ${'kind'.padEnd(26)}${'n'.padStart(6)}${'weighty desc'.padStart(14)}${'turn'.padStart(8)}${'depth≥2'.padStart(9)}${'reach'.padStart(8)}`,
    );
    for (const [k, rows] of [...g].filter(([, v]) => v.length >= min).sort((a, b) => share(b[1], r => r.turns > 0) - share(a[1], r => r.turns > 0))) {
      const wd = share(rows, r => r.wdesc > 0),
        tu = share(rows, r => r.turns > 0);
      console.log(
        `  ${k.padEnd(26)}${String(rows.length).padStart(6)}${(100 * wd).toFixed(0).padStart(13)}%${(100 * tu).toFixed(0).padStart(7)}%${(100 * share(rows, r => r.depth >= 2)).toFixed(0).padStart(8)}%${(100 * share(rows, r => r.reach > 0)).toFixed(0).padStart(7)}%${tu < 0.05 && wd < 0.15 ? '  DEAD END' : ''}`,
      );
    }
  };
  table(r => r.sys, 30, 'By part of the model');
  table(r => r.type, 30, 'By kind of event');
}
