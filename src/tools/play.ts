// The slice (S1): a plain-text client that plays the witness of one town through the front door (src/boundary.ts) and nothing else.
// Rough on purpose: no art, no page, the engine's own sentences with names put in. Offered to Overstory to adopt or replace.
//
// How to play
//   ./run.sh src/tools/play.ts [seed]     play the witness of world <seed> (default 4, whose witness sings and knows many people)
//   Then type a command and press Enter:
//     (Enter) or n     the next month: what you saw or heard that matters to you
//     n 6              six months on
//     p                the people you know best, and who plays as far as you know (a band, practising, or what you heard)
//     i 64             ask person #64 to a rehearsal: with your band, or, if you have none, to start one
//     b                the bands in town
//     l 12             everything you saw or heard in the last twelve months
//     ?                this help;  q  quit
//   Commands can be piped in, one per line:  printf 'p\ni 64\nn 12\nb\nq\n' | ./run.sh src/tools/play.ts 4
//
// You see what the witness could know: events they saw or heard, people's names, ages and work, bands and habits (public), and your own
// feelings toward people. Never anyone's traits. An answer to an invitation gives its reasons as the engine records them.
import { createInterface } from 'readline';
import { bondOf, command, createWorld, events, groups, now, person, places, townIds, type Answer } from '../boundary';

const seed = Number(process.argv[2] ?? 4);
const h = createWorld({ seed });
const me = now(h).witness!;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEAR0 = now(h).year - Math.floor(now(h).t / 12);
const when = (t: number) => `${MONTHS[t % 12]} ${YEAR0 + Math.floor(t / 12)}`;
// Kinds of event that are the texture of a life, not news (the engine's own list, world.ts TEXTURE): left out of the month's digest.
const TEXTURE = new Set(['everyday', 'noticed', 'table', 'habit:new', 'habit:broke', 'habit:back', 'tell', 'ill']);
const SKILLS = ['guitar', 'vocals'];

const placeName = new Map(places(h).map(p => [p.id, p.name]));
// First names, or full names where two people in town share one; read again after every command.
let names = new Map<number, string>();
const refresh = () => {
  const ps = townIds(h).map(i => person(h, i)!);
  names = new Map(ps.map(p => [p.id, ps.some(q => q !== p && q.first === p.first) ? `${p.first} ${p.last}` : p.first]));
};
const name = (id: number) => names.get(id) ?? (person(h, id)?.first || `#${id}`);
const say = (s: string) => s.replace(/@(\d+)/g, (_, i) => name(Number(i)));
const age = (id: number) => Math.floor((now(h).t - person(h, id)!.born) / 12);
const bandOf = (id: number) => groups(h).find(g => g.ended == null && g.members.includes(id));
const known = (since: number) => events(h, since).filter(e => e.who.includes(me) || e.knownBy.some(([id]) => id === me));
// What you could know of someone's playing: a band (public), practising (a habit, public), or the last thing you saw or heard of it:
// an open night, a spark after a gig, or taking up or getting good at an instrument a band uses.
const PLAYED = new Set(['performed', 'takenup', 'spark', 'gotgood']);
const MUSIC = /guitar|vocals|singing/;
const plays = (id: number) => {
  const g = bandOf(id);
  if (g) return `plays in ${g.name}`;
  const x = person(h, id)!.habits.find(x => x.id === 'practise' && x.broken == null);
  if (x) return x.label;
  const was = groups(h).find(g => g.former.includes(id) || (g.ended != null && g.members.includes(id)));
  if (was) return `used to play in ${was.name}`;
  const e = known(0)
    .filter(e => PLAYED.has(e.type) && e.who[0] === id && (!['takenup', 'gotgood'].includes(e.type) || MUSIC.test(e.text)))
    .pop();
  return e ? `you heard: ${say(e.text).replace(/\.$/, '')} (${when(e.t)})` : '';
};
const feel = (id: number) => {
  const b = bondOf(h, me, id);
  const n = name(id);
  if (!b || b.fam < 0.1) return `You barely know ${n}`;
  if (b.like > 0.3) return `You are fond of ${n}`;
  if (b.like > 0.1) return `You like ${n}`;
  if (b.like < -0.25) return `You do not like ${n}`;
  return `You know ${n}`;
};
const line = (id: number) => {
  const p = person(h, id)!;
  const job = p.job != null ? `, works at ${placeName.get(p.job) ?? p.job}` : '';
  const pl = plays(id);
  return `#${id} ${p.first} ${p.last}, ${age(id)}${job}${pl ? `; ${pl}` : ''}. ${feel(id)}.`;
};

function intro() {
  const p = person(h, me)!;
  const job = p.job != null ? `, working at ${placeName.get(p.job) ?? p.job}` : '';
  const sing = SKILLS.filter(s => (p.skills[s]?.interest ?? 0) >= 1);
  console.log(`World ${seed}. ${when(now(h).t)}. You are ${p.first} ${p.last}, ${age(me)}${job}.`);
  console.log(sing.length ? `You play: ${sing.join(' and ')}.` : 'You play nothing: you can ask, but there is no rehearsal to ask anyone to.');
  console.log('Type ? for help.');
}

// The month's digest: what you saw or heard that touches you, your band, any band, or is big news.
function month(from: number) {
  const mine = bandOf(me)?.members ?? [];
  for (let t = from; t <= now(h).t; t++) {
    const all = known(t).filter(e => e.t === t);
    const shown = all.filter(
      e => !TEXTURE.has(e.type) && (e.who.includes(me) || e.who.some(i => mine.includes(i)) || e.type.startsWith('group:') || e.w >= 1.6),
    );
    console.log(`── ${when(t)} ──`);
    for (const e of shown) console.log('  ' + say(e.text));
    if (all.length > shown.length) console.log(`  (and ${all.length - shown.length} other things you saw or heard)`);
  }
}

function people() {
  const ids = townIds(h).filter(i => i !== me);
  const close = ids
    .map(i => [i, bondOf(h, me, i)?.fam ?? 0] as const)
    .filter(([, f]) => f >= 0.1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  console.log('People you know best:');
  for (const [i] of close) console.log('  ' + line(i));
  console.log('Who plays, as far as you know:');
  for (const i of ids.filter(i => plays(i) && age(i) >= 15)) console.log('  ' + line(i));
}

function bands() {
  const gs = groups(h).filter(g => g.ended == null || g.members.includes(me) || g.former.includes(me));
  if (!gs.length) console.log('No bands in town.');
  for (const g of gs) {
    const state = g.ended != null ? `split up in ${when(g.ended)}: ${g.how}` : `since ${when(g.since)}`;
    console.log(`  ${g.name}: ${g.members.map(name).join(', ') || 'nobody'}; ${state}; ${g.works.length} song${g.works.length === 1 ? '' : 's'}.`);
  }
}

function told(a: Answer) {
  if (!a.ok) return console.log(`  Not possible: ${say(a.why[0])}.`);
  const [e, ...then] = a.events;
  console.log('  ' + say(e.text));
  console.log(`    reasons: ${a.why.map(say).join('; ')}`);
  const p = e.decision?.pWitness;
  if (p != null) console.log(`    (you had thought it ${Math.round(p * 100)}% likely)`);
  for (const x of then) console.log('  ' + say(x.text));
}

function help() {
  console.log('  Enter or n: next month   n 6: six months   p: people   i <id>: invite to a rehearsal   b: bands   l 12: all you know   q: quit');
}

refresh();
intro();
const rl = createInterface({ input: process.stdin, terminal: process.stdin.isTTY });
const prompt = () => process.stdin.isTTY && process.stdout.write('> ');
prompt();
for await (const raw of rl) {
  const [cmd = 'n', arg] = raw.trim().split(/\s+/).filter(Boolean);
  if (!process.stdin.isTTY) console.log(`> ${raw.trim()}`);
  if (cmd === 'q') break;
  else if (cmd === 'n') {
    const from = now(h).t + 1;
    command(h, { kind: 'advance', months: Math.max(1, Number(arg ?? 1)) });
    month(from);
  } else if (cmd === 'p') people();
  else if (cmd === 'i' && arg) told(command(h, { kind: 'invite', by: me, to: Number(arg), what: 'rehearsal' }));
  else if (cmd === 'b') bands();
  else if (cmd === 'l') for (const e of known(now(h).t - Number(arg ?? 12) + 1)) console.log(`  ${when(e.t)}: ${say(e.text)}`);
  else help();
  refresh();
  prompt();
}
rl.close();
