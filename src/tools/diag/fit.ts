// Round 40's own count: the faults readers quoted in the four's lines in round 39, counted over the present years, and kinds of line a
// life (as kinds.ts). Each test here is written apart from the engine's own, so it checks the engine rather than repeating it.
//   tsx src/tools/diag/fit.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: FIT {...}
//   lapses           a want's lapse said ("had wanted it since …, and never went after it")
//   lapsesServed     … of someone who had acted on it since: played with a band or at the open night, or brought a song, for a want to be
//                    heard; did something toward the person, for a want to make things right with them
//   soreWinner       a contest act by the one who won the post, giving "still sore about …" as a reason
//   concedeAhead     giving way, with "<the one giving way> is ahead" as a reason
//   actsApart        a contest act over a post when either is no longer at the place, or picking holes in the other's work in a grudge
//                    when they no longer work together
//   cityAgainst      turning down a job in the city with "had wanted out since …" or "no work here" as the first reason
//   cityNoWish       … with both "had wanted out" and "had no wish to see anywhere else" among the reasons
import '../env';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { pageLines } from '../../page';
import { rivalries } from '../../drama';
import { age, live, nameOf, type World, type Person, type Event } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
const out = {
  seeds: [a, b],
  worlds: 0,
  lapses: 0,
  lapsesServed: 0,
  soreWinner: 0,
  concedeAhead: 0,
  contestActs: 0,
  actsApart: 0,
  cityDeclines: 0,
  cityAgainst: 0,
  cityNoWish: 0,
  examples: [] as string[],
};
const perWorld: { seed: number; all: number; top: number }[] = [];
const MUSIC = /open night|brought a song|\bband\b/;

for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  out.worlds++;
  const say = (e: Event) => {
    if (out.examples.length < 40)
      out.examples.push(`${seed} ${e.type}: ${e.text} [${e.causes.map(c => c.label).join('; ')}]`.replace(/@(\d+)/g, (_, id) => nameOf(w, +id)));
  };
  for (let m = 0; m < yrs * 12; m++) {
    const from = w.events.length;
    tick(w);
    for (let i = from; i < w.events.length; i++) {
      const e = w.events[i];
      if (e.t < w.startPresent) continue;
      const trig = String((e.decision as any)?.trigger ?? '');
      const x = w.byId.get(e.who[0]);
      if (!x) continue;
      if (e.type === 'want:lapsed') {
        out.lapses++;
        const want = x.wants.find(z => z.doneAt === e.id);
        if (want) {
          const since = want.since;
          const mine = w.events.slice(0, i).filter(f => f.t >= since && f.who.includes(x.id) && f.type !== 'want:wish');
          const served =
            want.kind === 'prove'
              ? mine.some(f => (f.type.startsWith('group:') || MUSIC.test(f.text)) && !/could play the open night if/.test(f.text))
              : want.kind === 'restore'
                ? mine.some(f => f.who[0] === x.id && f.who.includes(+want.target))
                : false;
          if (served) {
            out.lapsesServed++;
            say(e);
          }
        }
      }
      if (trig === 'rivalry' || trig === 'grudge') {
        out.contestActs++;
        const r = rivalries(w).find(z => z.events.includes(e.id));
        const y = w.byId.get(e.who.find(id => id !== x.id) ?? -1);
        if (r && y) {
          const won = r.winner === x.id || (r.stake === 'grudge' && r.b === x.id);
          if (won && e.causes.some(c => c.label.startsWith('still sore about'))) {
            out.soreWinner++;
            say(e);
          }
          const apart = r.stake === 'post' ? x.job !== r.place || y.job !== r.place : e.type === 'needle' && (x.job == null || x.job !== y.job);
          if (apart) {
            out.actsApart++;
            say(e);
          }
        }
        if (e.type === 'concede' && e.causes.some(c => c.label === `@${x.id} is ahead`)) {
          out.concedeAhead++;
          say(e);
        }
      }
      if (trig === 'offer' && e.type === 'decline') {
        out.cityDeclines++;
        const first = e.causes[0]?.label ?? '';
        if (first.startsWith('had wanted out') || first === 'no work here') {
          out.cityAgainst++;
          say(e);
        }
        if (e.causes.some(c => c.label.startsWith('had wanted out')) && e.causes.some(c => /no wish to see anywhere else/.test(c.label)))
          out.cityNoWish++;
      }
    }
  }
  const score = (p: Person) => p.events.reduce((t, i) => t + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const kinds = (p: Person) =>
    new Set(
      pageLines(
        w,
        p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
        new Set(p.events),
      ).map(l => l.e.type),
    ).size;
  const adults = live(w).filter(p => age(w, p) >= 18);
  const top3 = adults
    .slice()
    .sort((x, y) => score(y) - score(x) || x.id - y.id)
    .slice(0, 3);
  perWorld.push({
    seed,
    all: +(adults.reduce((t, p) => t + kinds(p), 0) / Math.max(1, adults.length)).toFixed(3),
    top: +(top3.reduce((t, p) => t + kinds(p), 0) / Math.max(1, top3.length)).toFixed(3),
  });
  console.error(`fit: world ${seed}`);
}
for (const x of out.examples) console.log('  ' + x);
const mean = (k: 'all' | 'top') => +(perWorld.reduce((t, x) => t + x[k], 0) / perWorld.length).toFixed(3);
const { examples, ...counts } = out;
console.log('FIT ' + JSON.stringify({ ...counts, kindsAll: mean('all'), kindsTop: mean('top'), perWorld }));
