// The human quiz: items for a blind test of whether a person, reading what the player would read, can predict a choice better than the notebook.
// Each item is frozen at the moment of a decision: the witness's page about the person as it stood then (who they are to you, your sense of
// them, how they seem, what you have seen them do, what you know happened), the situation in plain words, and the options. Only decisions
// on the scoreboard's key slice qualify: a person the witness knows, a kind of situation the witness has never seen them answer, and
// circumstances that leave the answer open. Every reader's guess at the same moment is stored beside the truth, so a human's score can
// be set beside the notebook's, the page-evidence reader's and the calibrated witness's on exactly the same items.
// Version 2 (round 13) adds what a resident would also know at that moment: the other person in the situation, what they are to each other,
// how they seem to get on from what the witness has seen pass between them, what the witness knows happened between the two, and how people in
// Skarvik usually go in that spot (the base rate, in words). Every reader already had the bond and the base rate; the human page now has them too.
//   tsx src/quiz.ts run A B      → out-quiz/items-A-B.json (base rates from BASE_DIR, default out-9b)
//   tsx src/quiz.ts pack          → quiz-items.json (all items, shuffled, ids assigned)
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness, hunches } from './witness';
import { makePredictor, Tendencies, TEXT_HOLDER, type BaseTable, type Guesses } from './predict';
import { observe, age, belief, peekBond, fullName, year, type World, type Person, type Event } from './world';
import { family } from './grammar';
import { EXPR } from './families';
import { Rng } from './rng';

const OUT = process.env.QUIZ_OUT ?? 'out-quiz'; mkdirSync(OUT, { recursive: true });
const BASE_DIR = process.env.BASE_DIR ?? 'out-9b';

// Questions, by kind of situation. Each is built only from what was visible: the event or circumstance that prompted the decision and
// the people in it. A kind is asked only when its prompt carries no trait of the person (temptation and obligation cite one, so they are left out).
type Pr = { he: string; his: string; him: string; tHe: string; tHis: string; tHim: string };
type Q = { ask: (P: string, T: string, sit: string, pr: Pr) => string; opts: Record<string, string> };
const Q: Record<string, Q> = {
  asked: { ask: (P, T, _s, pr) => `${T} asks ${P} what ${pr.he} really thinks of ${pr.tHis} plan.`, opts: { honesty: '{P} tells {T} plainly what is wrong with it', dishonesty: '{P} tells {T} what {T} wants to hear' } },
  criticised: { ask: (_P, _T, sit) => `${sit}.`, opts: { anger: '{P} hits back', humility: '{P} takes it on the chin', pride: "{P} digs in and won't budge" } },
  provocation: { ask: (P, _T, sit, pr) => `${sit}. How does ${P} take it?`, opts: { anger: '{P} hits back', humility: '{P} lets it go', pride: '{P} goes cold, or sulks' } },
  'request-answer': { ask: (_P, _T, sit) => `${sit}.`, opts: { generosity: '{P} gives the money', refusal: '{P} says no' } },
  collection: { ask: (P, _T, sit) => `${sit}. The hat goes round at the Anchor. What does ${P} put in?`, opts: { generosity: '{P} gives generously', refusal: '{P} gives little or nothing' } },
  newcomer: { ask: (P, T, sit) => `${sit}. ${P} will be working alongside ${T}.`, opts: { warmth: '{P} makes {T} feel at home', withdrawal: '{P} keeps a distance' } },
  support: { ask: (P, T, sit, pr) => `${sit}. ${T} needs people around now, and ${P} is close to ${pr.tHim}.`, opts: { warmth: '{P} is there for {T}', lapse: "{P} isn't there when it matters" } },
  notice: { ask: (P, T, sit) => `${sit}. ${P} is one of the people closest to ${T}.`, opts: { warmth: '{P} sits {T} down and asks what is going on', lapse: '{P} sees it, and says nothing' } },
  answer: { ask: (P, _T, sit) => `${sit}. What does ${P} say?`, opts: { seeking: '{P} opens up', withdrawal: '{P} says it is nothing' } },
  discovery: { ask: (P, _T, sit) => `${sit}. Now ${P} knows.`, opts: { discretion: '{P} keeps it quiet', disclosure: '{P} tells someone else' } },
  risk: { ask: (P, _T, sit) => `${cap(sit)}, and ${P} is there.`, opts: { courage: '{P} goes out into it', caution: '{P} hangs back' } },
  danger: { ask: (P, _T, sit) => `${sit}. ${P} is right there.`, opts: { courage: '{P} goes in to help', caution: '{P} freezes, or holds back' } },
  deadline: { ask: (P, _T, sit) => `${cap(sit)}, and it is ${P}'s to do.`, opts: { duty: '{P} gets it done', lapse: '{P} lets it slide' } },
  harbourday: { ask: (P) => `The harbour day needs someone to run it. Nobody else has said yes. Does ${P}?`, opts: { duty: '{P} takes it on', lapse: '{P} leaves it to someone else' } },
  oldwound: { ask: (P, T, sit) => `${sit}. Months later, ${P} and ${T} are together again in front of other people.`, opts: { leniency: '{P} lets it go', severity: '{P} drags it up' } },
  hometruth: { ask: (P, T) => `${T} asks ${P} how things really are.`, opts: { honesty: '{P} tells the truth', dishonesty: '{P} says everything is fine' } },
  chance: { ask: (P) => `${P} has played for years, and the Anchor has an open night with a spot free.`, opts: { openness: '{P} takes the spot', reluctance: '{P} shies away' } },
  strain: { ask: (P, _T, sit, pr) => `${P} has been under strain for a while: ${sit.replace(/^strain had been building: /i, '')}. How does it come out?`, opts: { anger: '{P} takes it out on someone', withdrawal: '{P} pulls back into {himself}', seeking: '{P} leans on someone' } },
  loss: { ask: (P, _T, sit) => `${sit}. How does ${P} cope?`, opts: { seeking: '{P} reaches out to someone', withdrawal: '{P} pulls back into {himself}' } },
};
// "gives generously" → "give generously", for "most people would …"; also the verb after ", or" / ", and".
const verb = (v: string) => ({ is: 'be', "isn't": 'not be', has: 'have', does: 'do', goes: 'go' } as Record<string, string>)[v] ?? (/ies$/.test(v) ? v.replace(/ies$/, 'y') : /(ch|sh|ss|x)es$/.test(v) ? v.replace(/es$/, '') : v.replace(/s$/, ''));
const bare = (s: string) => s.replace(/^(\S+)/, (_, v) => verb(v)).replace(/, (or|and) (\S+)/g, (_, c, v) => `, ${c} ${verb(v)}`).replace(/ and won't (\w+)/g, ' and not $1').replace(/ and (\w+s)\b/g, (m, v) => /^(his|this|its|hers)$/.test(v) ? m : ` and ${verb(v)}`).replace(/\b(himself|herself)\b/g, 'themselves');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const trigKey = (t: string) => t.replace(/:.*$/, '');

export interface Item {
  id?: string; seed: number; year: number; trigger: string; you: { first: string; job: string };
  person: { name: string; first: string; age: number; job: string; how: string; facts: string[] };
  page: { sense: string[]; seems: string; seen: string[]; known: { year: number; text: string }[] };
  other?: { name: string; age: number; job: string; tie: string; feel: string[]; between: { year: number; text: string }[]; pFeel?: number }; // pFeel: the witness's belief about the person's feeling for the other (for the round-13 check; not shown)
  town?: string; // how people here usually go in this spot
  why?: string[]; // version 3: the reasons the town's record gives for what the person did, shown after the reveal
  question: string; options: { id: string; text: string }[]; answer: string; happened: string;
  readers: { notebook: string; base: string; page: string; witness: string; pair?: string; pWitness: number; pPage: number; pBase?: number };
}

// A first name, with the surname's initial when someone else in town has the same first name.
export function who(w: World, id: number, witness: number): string { if (id === witness) return `${w.byId.get(id)!.first} (you)`; const q = w.byId.get(id); if (!q) return 'someone'; const twin = w.people.some(x => x !== q && x.first === q.first && x.status !== 'dead'); return twin ? `${q.first} ${q.last.charAt(0)}.` : q.first; }
const sentence = (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)).replace(/\.\.(?=\s|$)/g, '.'); // an initial that ends a sentence keeps one full stop
// Ledger lines need a noun where the act had one: what kind of thing, by the situation the act answered.
export const LEDGER_THING: Record<string, string> = { deadline: 'the work', chance: 'a spot at the open night', oldwound: 'the old business', obligation: 'help', temptation: 'something', authorship: 'song' };
function pageOf(w: World, p: Person, witness: number) {
  const name = (s: string) => sentence(s.replace(/@(\d+)/g, (_, id) => who(w, +id, witness)));
  const known = (e: Event) => e.knownBy.has(witness) || e.who.includes(witness);
  const b = peekBond(w, witness, p.id);
  const how = b ? (b.fam > 0.6 ? 'someone you see all the time' : b.fam > 0.25 ? 'someone you know a little' : 'someone you barely know') : 'someone you have never really spoken to';
  const facts: string[] = []; if (p.partner != null) facts.push(`${p.pstat === 'married' ? 'married to' : 'seeing'} ${w.byId.get(p.partner)!.first}`); if (p.kids.length) facts.push(`${p.kids.length} child${p.kids.length > 1 ? 'ren' : ''}`);
  const sense = hunches(w, p).map(h => h.text.replace(/ on [^:]+:/, ':')); // "You'd bet: feels entitled to more.
  const sb = belief(w, witness, p.id, 'state:low'); const fresh = sb && sb.n > 0 && w.t - sb.last <= 12;
  const seems = !fresh ? '' : sb!.m > 0.9 ? 'seems low lately, and worn thin' : sb!.m > 0.4 ? 'seems low lately' : sb!.m < -0.3 ? 'seems in good spirits' : 'seems much as usual';
  const ledger = new Map<string, number>();
  for (const e of w.events) { if (e.t < w.startPresent || e.who[0] !== p.id || !e.decision || (e.knownBy.get(witness) !== 'seen' && !e.who.includes(witness))) continue; const x = EXPR[e.type]; if (!x || (x.solo && x.family === 'withdrawal')) continue; const thing = LEDGER_THING[(e.decision.trigger ?? '').replace(/:.*$/, '')] ?? 'something'; const label = x.text('', e.who[1] != null && e.who[1] !== p.id ? 'someone' : '', thing, p.sex === 'f' ? 'herself' : 'himself').trim().replace(/someone's someone's/g, "someone's").replace(/as if it were 's own/g, 'as if it were their own').replace(/ was 's\b/g, ' was theirs'); ledger.set(label, (ledger.get(label) ?? 0) + 1); }
  const seen = [...ledger.entries()].sort((a, c) => c[1] - a[1]).slice(0, 14).map(([k, n]) => `${k}${n > 1 ? ` (${n} times)` : ''}`);
  const knownEv = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent - 120 && e.w > 0.25 && known(e)).slice(-25).map(e => ({ year: year(e.t), text: e.text })); // names resolved when the item is written
  return { how, facts, sense, seems, seen, known: knownEv };
}

// The other person, as the witness would know them at that moment: who they are to the person, how the two seem to get on (the witness's
// belief about what one feels for the other, built from what passed between them; family, partners and friendships are public), and the
// events between the two that the witness knows of.
function otherOf(w: World, p: Person, t: Person, witness: number) {
  // Names stay as @id placeholders until the item is written, so the page and the question name people the same way.
  const T = `@${t.id}`, P = `@${p.id}`; const wf = w.byId.get(witness)!.sex === 'f';
  const tie = t.id === witness ? `you are ${P}'s ${p.partner === t.id ? (p.pstat === 'married' ? (wf ? 'wife' : 'husband') : 'partner') : p.parents.includes(t.id) ? (wf ? 'mother' : 'father') : t.parents.includes(p.id) ? (wf ? 'daughter' : 'son') : family(p, t) ? (wf ? 'sister' : 'brother') : p.friends.has(t.id) ? 'friend' : p.job != null && p.job === t.job ? 'workmate' : 'neighbour, no more'}`
    : p.partner === t.id ? `${p.pstat === 'married' ? 'married to' : 'seeing'} ${P}` : p.parents.includes(t.id) ? `${P}'s ${t.sex === 'f' ? 'mother' : 'father'}` : t.parents.includes(p.id) ? `${P}'s ${t.sex === 'f' ? 'daughter' : 'son'}`
    : family(p, t) ? `${P}'s ${t.sex === 'f' ? 'sister' : 'brother'}` : p.friends.has(t.id) ? `a friend of ${P}'s` : p.job != null && p.job === t.job ? `works with ${P}` : p.circle.includes(t.id) || t.circle.includes(p.id) ? `in the same crowd as ${P}` : `no close tie to ${P} that you know of`;
  const word = (m: number) => m > 0.5 ? 'is fond of' : m > 0.15 ? 'gets on with' : m < -0.5 ? "can't stand" : m < -0.15 ? 'has no love for' : 'is neither here nor there about';
  const you = (x: Person) => x.id === witness ? 'you' : `@${x.id}`;
  const feel: string[] = []; const feelSign: number[] = [];
  for (const [a, b] of [[p, t], [t, p]] as const) {
    if (a.id === witness) { const r = peekBond(w, a.id, b.id); if (r) feel.push(`You ${word(r.like).replace(/^is /, 'are ').replace(/^has /, 'have ').replace(/^gets /, 'get ')} @${b.id}.`); continue; }
    const bl = belief(w, witness, a.id, 'bond:' + b.id);
    if (bl && bl.n > 0) { feel.push(`From what you've seen, @${a.id} ${word(bl.m)} ${you(b)}.`); if (a === p) feelSign.push(bl.m); }
  }
  if (!feel.length) feel.push(`You've never seen much pass between them.`);
  const known = (e: Event) => e.knownBy.has(witness) || e.who.includes(witness);
  const between = w.events.filter(e => e.t >= w.startPresent - 120 && e.t <= w.t && e.who.includes(p.id) && e.who.includes(t.id) && e.w > 0.2 && known(e)).slice(-8).map(e => ({ year: year(e.t), text: e.text }));
  return { name: T, age: Math.floor(age(w, t)), job: t.job ? w.placeById.get(t.job)!.name : t.retired ? 'retired' : 'not working', tie, feel, between, pFeel: feelSign[0] };
}

// The reasons the record gives, in plain words, for the reveal: the trait's pole ('lets go of wrongs'; 'though …' when it argued against),
// a bond by its sign at the moment ('fond of Rolf'), and nothing for a middling trait or for the situation the question already stated.
function whyOf(causes: { kind: string; label: string }[], bond: any, sit: string, name: (s: string) => string): string[] {
  const out: string[] = [];
  for (const c of causes) {
    const raw = name(c.label).replace(/(?<! [A-Z])\.$/, ''); if (!raw || (sit && raw.startsWith(sit.slice(0, 30)))) continue;
    if (c.kind === 'bond') { const m = raw.match(/^(How .+ feels about|Trust in|Respect for) (.+)$/i); if (!m || !bond) continue; const o = m[2]; const ax = /^how/i.test(m[1]) ? 'like' : /^trust/i.test(m[1]) ? 'trust' : 'respect'; const v = bond[ax] ?? 0;
      const t = ax === 'like' ? (v > 0.15 ? `fond of ${o}` : v < -0.15 ? `no love for ${o}` : '') : ax === 'trust' ? (v > 0.15 ? `trusts ${o}` : v < -0.15 ? `doesn't trust ${o}` : '') : (v > 0.15 ? `respects ${o}` : v < -0.15 ? `little respect for ${o}` : ''); if (t) out.push(t); continue; }
    if (c.kind === 'trait' && !raw.includes(':') && !raw.includes('@') && raw.split(' ').length <= 3 && /^[A-Z][a-z]+( [a-z]+)?$/.test(raw)) continue; // a middling trait: not a reason
    out.push(raw.replace(/^(Despite )?[A-Za-z ]+: /, (_m, d) => d ? 'though ' : ''));
  }
  return out.slice(0, 3);
}

const mode = process.argv[2];
if (mode === 'run') {
  const A = +process.argv[3], B = +process.argv[4];
  const table: BaseTable = new Map();
  for (const f of readdirSync(BASE_DIR).filter(f => f.startsWith('base-'))) { const j = JSON.parse(readFileSync(`${BASE_DIR}/${f}`, 'utf8')); for (const [k, m] of j.base as [string, [string, number][]][]) { const t = table.get(k) ?? new Map(); for (const [o, n] of m) t.set(o, (t.get(o) ?? 0) + n); table.set(k, t); } }
  const items: Item[] = []; let withT = 0, dropped = 0;
  for (let seed = A; seed <= B; seed++) {
    const w = buildWorld(seed, 1); const wit = pickWitness(w);
    const pending: { g: Guesses; p: Person; page: ReturnType<typeof pageOf>; rec: any; other?: ReturnType<typeof otherOf> | null; tid?: number; at: { name: string; age: number; job: string; youJob: string; bond: any } }[] = []; const used = new Set<number>();
    let current: { p: Person; rec: any } | null = null;
    const pred = makePredictor(table, (_w2, g) => {
      if (!current || w.t < w.startPresent + 24 || used.has(current.p.id) || pending.length >= 10) return;
      if (!(g.known && g.novel && g.contested) || !Q[trigKey(g.trigger)] || g.n > 3) return;
      const page = pageOf(w, current.p, wit.id); if (page.known.length < 6 || !page.sense.length) return;
      const tid = current.rec.target as number | undefined; const tq = tid != null && tid !== current.p.id ? w.byId.get(tid) : undefined;
      const at = { name: fullName(current.p), age: Math.floor(age(w, current.p)), job: current.p.job ? w.placeById.get(current.p.job)!.name : current.p.retired ? 'retired' : 'not working', youJob: wit.job ? w.placeById.get(wit.job)!.name : 'not working', bond: tq ? { ...(peekBond(w, current.p.id, tq.id) ?? { like: 0, trust: 0, respect: 0 }) } : null }; // as they stood at the decision
      used.add(current.p.id); pending.push({ g: { ...g }, p: current.p, page, rec: current.rec, other: tq ? otherOf(w, current.p, tq, wit.id) : null, tid: tq?.id, at });
    }, new Tendencies());
    w.hooks.predict = (w2, p, o, c, rec) => { current = { p, rec }; pred(w2, p, o, c, rec); current = null; };
    w.hooks.observed = (w2, e, how, _tag, hasText) => { if (hasText) observe(w2, TEXT_HOLDER, e, how); };
    runYears(w, 10);
    const byRec = new Map(w.events.filter(e => e.decision).map(e => [e.decision, e] as const));
    const name = (s: string) => sentence(s.replace(/@(\d+)/g, (_, id) => who(w, +id, wit.id)));
    for (const { g, p, page, rec, other, tid, at } of pending) {
      const e = byRec.get(rec); if (!e) continue; const q = Q[trigKey(g.trigger)];
      const c0 = e.causes[0]; const sit = c0 && (c0.kind === 'event' || c0.kind === 'state') ? name(c0.label).replace(/[.\s]+$/, '') : '';
      if (!sit && !['asked', 'harbourday', 'hometruth', 'chance'].includes(trigKey(g.trigger))) continue;
      const tid0 = rec.target ?? e.who[1]; const tp = tid0 != null && tid0 !== p.id ? w.byId.get(tid0) : undefined; const T = tp ? who(w, tp.id, wit.id) : 'someone'; const P = who(w, p.id, wit.id);
      const f = p.sex === 'f', tf = tp?.sex === 'f', tyou = false;
      const pr: Pr = { he: f ? 'she' : 'he', his: f ? 'her' : 'his', him: f ? 'her' : 'him', tHe: tyou ? 'you' : tf ? 'she' : 'he', tHis: tyou ? 'your' : tf ? 'her' : 'his', tHim: tyou ? 'you' : tf ? 'her' : 'him' };
      const fill = (s: string) => sentence(s.replace(/\{P\}/g, P).replace(/\{T\}/g, T).replace(/\{himself\}/g, f ? 'herself' : 'himself'));
      const opts = (rec.options as { id: string }[]).map(o => ({ id: o.id, text: q.opts[o.id] ? fill(q.opts[o.id]) : '' }));
      if (opts.some(o => !o.text)) continue;
      if (tp) withT++; if (tp && tid !== tp.id) { dropped++; continue; } // the page must show the other person as they stood at the moment; skip the rare item whose target was not recorded
      const baseText = opts.find(o => o.id === g.base)!.text.replace(new RegExp('^' + P.replace(/[.()]/g, '\\$&') + ' '), ''); const k10 = Math.round(10 * g.top.base);
      const town = `${g.top.base >= 0.5 ? 'Most people in Skarvik, in this spot, would' : 'The commonest answer in Skarvik, in this spot, is to'} ${bare(baseText.replace(new RegExp(T.replace(/[.()]/g, '\\$&'), 'g'), 'them'))} (about ${k10} in 10).`;
      items.push({ seed, year: year(e.t), trigger: trigKey(g.trigger), you: { first: wit.first, job: at.youJob }, person: { name: at.name, first: P, age: at.age, job: at.job, how: page.how, facts: page.facts },
        page: { sense: page.sense, seems: page.seems, seen: page.seen, known: page.known.map(k => ({ year: k.year, text: name(k.text) })) },
        other: tp && other && trigKey(g.trigger) !== 'strain' ? { name: T, age: other.age, job: other.job, tie: other.tie.replace(/@(\d+)/g, (_, id) => who(w, +id, wit.id)), feel: other.feel.map(name), between: other.between.map(k => ({ year: k.year, text: name(k.text) })), pFeel: other.pFeel } : undefined, town, question: fill(q.ask(P, T, sit, pr)).replace(/\.\./g, '.'), options: opts, answer: g.chosen, happened: name(e.text), why: whyOf(e.causes, at.bond, sit, name),
        readers: { notebook: g.noteOrBase, base: g.base, page: g.text, witness: g.cal, pair: g.sit, pWitness: g.p.cal, pPage: g.p.text, pBase: g.top.base } });
    }
    console.error(`quiz: world ${seed}: ${items.filter(i => i.seed === seed).length} items`);
  }
  writeFileSync(`${OUT}/items-${A}-${B}.json`, JSON.stringify(items)); console.error(`quiz: items with another person ${withT}, dropped for an unrecorded target ${dropped}`);
} else if (mode === 'pack') {
  const all: Item[] = []; for (const f of readdirSync(OUT).filter(f => f.startsWith('items-'))) all.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
  const r = new Rng(20261017); const kinds = new Map<string, number>();
  const shuffled = all.map(x => [r.next(), x] as const).sort((a, b) => a[0] - b[0]).map(x => x[1]).filter(x => { const n = kinds.get(x.trigger) ?? 0; kinds.set(x.trigger, n + 1); return n < 25; }); // no kind more than 25 items
  shuffled.forEach((x, i) => { x.id = `q${String(i + 1).padStart(3, '0')}`; });
  writeFileSync(process.env.QUIZ_FILE ?? 'quiz-items.json', JSON.stringify(shuffled));
  const acc = (k: keyof Item['readers']) => (100 * shuffled.filter(x => x.readers[k] === x.answer).length / shuffled.length).toFixed(1);
  console.log(`${shuffled.length} items from ${new Set(shuffled.map(x => x.seed)).size} worlds · by kind: ${[...new Set(shuffled.map(x => x.trigger))].map(t => `${t} ${shuffled.filter(x => x.trigger === t).length}`).join(', ')}`);
  console.log(`on these items: notebook ${acc('notebook')}% · page-evidence ${acc('page')}% · calibrated witness ${acc('witness')}% · base rate ${acc('base')}%`);
}
