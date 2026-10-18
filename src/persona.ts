// A way of being: what a person's temperament and their own history make of them, and how it shows.
//
// Nothing here is stored or authored per person. A persona is computed from three things every person already has: their traits and
// values (shared dimensions, so people resemble each other), their own history (which nobody shares, so nobody is the same), and a seed
// of their own (for the part of each style that traits do not explain). Anyone met for the first time in year twenty already has theirs.
//
// Depth, from history (characteristic adaptations: McAdams 1995; if-then signatures shaped by experience: Mischel and Shoda 1995):
//  - sore spots: what gets to this person in particular, from what was done to them (passed over, run down behind their back, let go);
//    they act as acquired if-thens, so a touched sore spot changes how they answer, and the record says why ('touchy about being
//    passed over since the skipper's job, 2031')
//  - fears: from losses and frights (froze in a storm, out of work, left)
//  - pride points: what they need remembered (the post they got, the café they opened, the night they put on)
//  - rules to live by: values given an origin ('never asks anyone for anything, not since the sawmill let her go'); they enter
//    decisions as the person's story about themselves
//  - formative memories: the events of their own life they come back to
// Surface (how they come across):
//  - humour: a mix of four styles, not a type (Martin et al. 2003: affiliative, self-enhancing, aggressive, self-defeating), about a
//    third of each explained by traits (Veselka et al. 2010), the rest their own; and wit, how funny they are
//  - voice: how much they talk, how blunt, dry, warm and formal, from traits with their own share
//  - quirks: oddities built from their strongest traits, filled in from their own life (their trade's things, their people, their
//    years), so a quirk means something and is theirs alone
//  - small loves: two or three things they light up about
import { Rng, hash, clamp } from './rng';
import { SETTING } from './setting';
import { OFF, type World, type Person, type Event, age, year, live, likeOf, remember, addEvent, broadcast, bond } from './world';
import { ev, traitCause, stateCause, eventCause } from './grammar';
import type { Feature } from './features';
import { around } from './scale';

export interface Persona {
  humour: { warm: number; coping: number; cutting: number; selfMocking: number; wit: number };
  voice: { talk: number; blunt: number; dry: number; warm: number; formal: number };
  quirks: { text: string; facet: string; dir: 1 | -1; pattern: string }[];
  loves: string[];
  sore: { key: string; text: string; feature: Feature; facet: string; shift: number; from: number }[];
  fears: { key: string; text: string; feature: Feature; facet: string; shift: number; from: number }[];
  pride: { text: string; from: number }[];
  rules: { key: string; text: string; from: number }[];
  formative: number[];
}

const f = (p: Person, k: string) => p.facets[k] ?? 0;
const v = (p: Person, k: string) => p.values[k] ?? 0;
// A style: a share explained by the composite, the rest the person's own. Both parts are unit-variance, so the result is too.
const mix = (r: Rng, composite: number, share: number) => share * composite + Math.sqrt(1 - share * share) * r.normal();
const norm = (ws: [number, number][]) => { let s = 0, ss = 0; for (const [wt, x] of ws) { s += wt * x; ss += wt * wt; } return s / Math.sqrt(ss || 1); };

export function humourOf(p: Person, r: Rng) {
  const g = p.aptitudes;
  return {
    warm: mix(r, norm([[0.45, f(p, 'sociability')], [0.3, f(p, 'liveliness')], [0.2, f(p, 'socialBoldness')], [0.2, f(p, 'gentleness')]]), 0.55),
    coping: mix(r, norm([[-0.4, f(p, 'anxiety')], [0.35, f(p, 'liveliness')], [0.2, f(p, 'inquisitiveness')], [0.2, f(p, 'socialSelfEsteem')]]), 0.5),
    cutting: mix(r, norm([[-0.4, f(p, 'gentleness')], [-0.3, f(p, 'patience')], [-0.25, f(p, 'fairness')], [-0.2, f(p, 'modesty')]]), 0.55),
    selfMocking: mix(r, norm([[0.35, f(p, 'anxiety')], [0.3, f(p, 'dependence')], [-0.35, f(p, 'socialSelfEsteem')]]), 0.5),
    wit: mix(r, norm([[0.4, g.language ?? 0], [0.3, g.socialInsight ?? 0], [0.25, f(p, 'inquisitiveness')], [0.2, f(p, 'liveliness')]]), 0.5),
  };
}
export function voiceOf(w: World, p: Person, r: Rng) {
  return {
    talk: mix(r, norm([[0.5, f(p, 'sociability')], [0.35, f(p, 'liveliness')], [0.2, f(p, 'socialBoldness')]]), 0.6),
    blunt: mix(r, norm([[0.35, f(p, 'sincerity')], [-0.35, f(p, 'gentleness')], [0.3, f(p, 'socialBoldness')]]), 0.6),
    dry: mix(r, norm([[-0.4, f(p, 'liveliness')], [0.3, p.aptitudes.reasoning ?? 0], [0.2, f(p, 'inquisitiveness')]]), 0.5),
    warm: mix(r, norm([[0.4, f(p, 'gentleness')], [0.35, f(p, 'altruism')], [0.3, f(p, 'sentimentality')]]), 0.6),
    formal: mix(r, norm([[0.35, f(p, 'organisation')], [0.3, v(p, 'tradition')], [-0.3, f(p, 'unconventionality')], [0.25, (age(w, p) - 45) / 15]]), 0.6),
  };
}

// ---------- quirks: a trait's patterns, filled in from the person's own life ----------
// Each pattern names what it needs ({thing}: something of their trade or their own; {person}: someone of theirs; {place}: a spot in
// town; {year}: a year of theirs; {lost}: someone they lost). A pattern whose needs this life cannot fill is skipped.
type Q = { facet: string; dir: 1 | -1; text: string };
const QUIRKS: Q[] = [
  // perfectionism
  { facet: 'perfectionism', dir: 1, text: 'cleans {thing} every Sunday, whether it needs it or not' },
  { facet: 'perfectionism', dir: 1, text: 'redoes {chore} if anyone else has done it' },
  { facet: 'perfectionism', dir: 1, text: 'notices within the hour if {thing} has been moved' },
  { facet: 'perfectionism', dir: 1, text: 'has rewritten the same letter to {person} four times and not sent it' },
  { facet: 'perfectionism', dir: -1, text: 'has never once put {thing} back where it belongs' },
  { facet: 'perfectionism', dir: -1, text: 'has been halfway through painting {possession} since {year}' },
  { facet: 'perfectionism', dir: -1, text: 'mends everything with tape, including {thing}' },
  // organisation
  { facet: 'organisation', dir: 1, text: 'keeps a notebook of every {count} since {year}' },
  { facet: 'organisation', dir: 1, text: 'has the {chore} on a rota pinned to {door}, and {person} is on it' },
  { facet: 'organisation', dir: 1, text: 'labels the jars in {room}, including the one that says "labels"' },
  { facet: 'organisation', dir: -1, text: 'has lost {thing} so often that {person} keeps a spare' },
  { facet: 'organisation', dir: -1, text: 'still has the Christmas lights up from {year}' },
  { facet: 'organisation', dir: -1, text: 'keeps important papers in {hiding}, along with everything else' },
  // sentimentality
  { facet: 'sentimentality', dir: 1, text: 'keeps {memento} in the kitchen drawer' },
  { facet: 'sentimentality', dir: 1, text: 'still sets out {lost}\'s cup at Christmas' },
  { facet: 'sentimentality', dir: 1, text: 'keeps every {keepsake} since {year}' },
  { facet: 'sentimentality', dir: 1, text: 'cannot hear {tune} without leaving the room' },
  { facet: 'sentimentality', dir: -1, text: 'threw out everything of {lost}\'s within the week' },
  { facet: 'sentimentality', dir: -1, text: 'sold {possession} the day after {person} said they were fond of it' },
  { facet: 'sentimentality', dir: -1, text: 'does not keep photographs, not even of {person}' },
  // inquisitiveness
  { facet: 'inquisitiveness', dir: 1, text: 'knows the history of every {townthing} in Skarvik' },
  { facet: 'inquisitiveness', dir: 1, text: 'took apart {thing} to see how it worked, and kept the spare parts' },
  { facet: 'inquisitiveness', dir: 1, text: 'has read everything the library has on {topic}, twice' },
  { facet: 'inquisitiveness', dir: -1, text: 'has never once been further than {nearby}' },
  { facet: 'inquisitiveness', dir: -1, text: 'has watched the same {programme} every week since {year}' },
  { facet: 'inquisitiveness', dir: -1, text: 'has eaten {food} for lunch every working day since {year}' },
  // unconventionality
  { facet: 'unconventionality', dir: 1, text: 'swims off {place} on New Year\'s morning, alone' },
  { facet: 'unconventionality', dir: 1, text: 'painted {possession} a colour the whole street talked about' },
  { facet: 'unconventionality', dir: 1, text: 'keeps {odd} and will tell you why at length' },
  { facet: 'unconventionality', dir: 1, text: 'puts {food} on everything, including things that should not have it' },
  { facet: 'unconventionality', dir: -1, text: 'has worn the same kind of jacket since {year}' },
  { facet: 'unconventionality', dir: -1, text: 'has had the same haircut as {person}\'s since {year}' },
  { facet: 'unconventionality', dir: -1, text: 'thinks {topic} is no fit subject for conversation' },
  // anxiety
  { facet: 'anxiety', dir: 1, text: 'rings {person} whenever the weather turns' },
  { facet: 'anxiety', dir: 1, text: 'checks {thing} twice before leaving, then once more' },
  { facet: 'anxiety', dir: 1, text: 'has a bag packed in {hiding}, in case' },
  { facet: 'anxiety', dir: -1, text: 'slept through the storm of {year} and still does not see what the fuss was' },
  { facet: 'anxiety', dir: -1, text: 'left {thing} out in the rain for a week and was not bothered' },
  { facet: 'anxiety', dir: -1, text: 'lent {possession} to someone they had just met' },
  // fearfulness
  { facet: 'fearfulness', dir: 1, text: 'will not go out on the water, in a fishing town, not since {year}' },
  { facet: 'fearfulness', dir: 1, text: 'takes the long way round to avoid {place} after dark' },
  { facet: 'fearfulness', dir: 1, text: 'will not let {person} near the {danger}' },
  { facet: 'fearfulness', dir: -1, text: 'goes out to {place} in weather that keeps everyone else in' },
  { facet: 'fearfulness', dir: -1, text: 'climbed onto the roof of {building} in {year}, for a bet' },
  { facet: 'fearfulness', dir: -1, text: 'took {possession} out in the storm of {year} to see what it would do' },
  // liveliness
  { facet: 'liveliness', dir: 1, text: 'whistles the same three bars of {tune} everywhere' },
  { facet: 'liveliness', dir: 1, text: 'dances in {room} when {tune} comes on the radio' },
  { facet: 'liveliness', dir: 1, text: 'has a nickname for everyone at {workplace}' },
  { facet: 'liveliness', dir: -1, text: 'has a face that does not move, which some people at {workplace} take for disapproval' },
  { facet: 'liveliness', dir: -1, text: 'said "fine" when {person} told {obj} the big news' },
  { facet: 'liveliness', dir: -1, text: 'sits through {event} without once looking up' },
  // sociability
  { facet: 'sociability', dir: 1, text: 'knows everyone\'s birthday, including {person}\'s dog' },
  { facet: 'sociability', dir: 1, text: 'cannot get from home to {place} in under an hour, for stopping to talk' },
  { facet: 'sociability', dir: 1, text: 'has had {person} round for coffee every {weekday} for years' },
  { facet: 'sociability', dir: -1, text: 'times the shopping for when {place} is empty' },
  { facet: 'sociability', dir: -1, text: 'lets the phone ring out, even when it is {person}' },
  { facet: 'sociability', dir: -1, text: 'has a back way home from {workplace} so as not to meet anyone' },
  // social boldness
  { facet: 'socialBoldness', dir: 1, text: 'stands up at every council meeting, whatever {topic} is on the agenda' },
  { facet: 'socialBoldness', dir: 1, text: 'once told the mayor what {she} thought of {topic}, at a funeral' },
  { facet: 'socialBoldness', dir: 1, text: 'sings at {event}, whether asked or not' },
  { facet: 'socialBoldness', dir: -1, text: 'has never once spoken at a meeting at {workplace}, and has opinions about every one' },
  { facet: 'socialBoldness', dir: -1, text: 'sends {person} to make the phone calls' },
  { facet: 'socialBoldness', dir: -1, text: 'stands at the very back at {event}' },
  // prudence
  { facet: 'prudence', dir: 1, text: 'keeps cash in {hiding}, just in case' },
  { facet: 'prudence', dir: 1, text: 'took three years to decide on {possession}' },
  { facet: 'prudence', dir: 1, text: 'has written down what {possession} cost, and what it would cost now' },
  { facet: 'prudence', dir: -1, text: 'bought {possession} on a handshake in an afternoon' },
  { facet: 'prudence', dir: -1, text: 'has started {wish} three times and finished it never' },
  { facet: 'prudence', dir: -1, text: 'bet {person} a week\'s wages on the {sport} and lost' },
  // greed avoidance
  { facet: 'greedAvoidance', dir: -1, text: 'talks about {wish} as if it were already ordered' },
  { facet: 'greedAvoidance', dir: -1, text: 'has the biggest {possession} on the street and mentions it' },
  { facet: 'greedAvoidance', dir: -1, text: 'knows what everyone at {workplace} earns, to the krone' },
  { facet: 'greedAvoidance', dir: 1, text: 'drives the oldest car in Skarvik and calls {possession} a luxury' },
  { facet: 'greedAvoidance', dir: 1, text: 'gave {person} the money for {wish} and never mentioned it again' },
  { facet: 'greedAvoidance', dir: 1, text: 'turned down the pay rise at {workplace} in {year}' },
  // modesty
  { facet: 'modesty', dir: -1, text: 'tells the story of {boast} to anyone new in town' },
  { facet: 'modesty', dir: -1, text: 'has a photograph of {boast} where you cannot miss it' },
  { facet: 'modesty', dir: -1, text: 'corrects {person} whenever the story of {boast} is told wrong' },
  { facet: 'modesty', dir: 1, text: 'changes the subject whenever {boast} comes up' },
  { facet: 'modesty', dir: 1, text: 'let {person} take the credit for {chore} and said nothing' },
  { facet: 'modesty', dir: 1, text: 'has never once mentioned {boast}; {person} had to tell everyone' },
  // forgiveness
  { facet: 'forgiveness', dir: -1, text: 'has not said a word to {grudge} since {grudgeyear}' },
  { facet: 'forgiveness', dir: -1, text: 'still crosses the road rather than pass {grudge}' },
  { facet: 'forgiveness', dir: -1, text: 'has a long memory for who did what at {workplace} in {year}' },
  { facet: 'forgiveness', dir: 1, text: 'had {grudge} round for coffee a month after it all' },
  { facet: 'forgiveness', dir: 1, text: 'has forgotten what {person} did in {year}, and means it' },
  { facet: 'forgiveness', dir: 1, text: 'sends a Christmas card to {grudge} every year, regardless' },
  // aesthetic
  { facet: 'aesthetic', dir: 1, text: 'stops to look at the light over {place} every evening, whoever is waiting' },
  { facet: 'aesthetic', dir: 1, text: 'has {room} arranged just so, and moves things back if you touch them' },
  { facet: 'aesthetic', dir: 1, text: 'cried at {event} and will not say why' },
  { facet: 'aesthetic', dir: -1, text: 'sees no point in curtains, or in {room}' },
  { facet: 'aesthetic', dir: -1, text: 'painted {possession} the colour that was cheapest' },
  { facet: 'aesthetic', dir: -1, text: 'talks through {event} and does not see why not' },
  // diligence
  { facet: 'diligence', dir: 1, text: 'has not taken a sick day since {year}' },
  { facet: 'diligence', dir: 1, text: 'was at {workplace} on the morning of {person}\'s wedding' },
  { facet: 'diligence', dir: 1, text: 'does {chore} before anyone else is up' },
  { facet: 'diligence', dir: -1, text: 'has a reason ready for every Monday at {workplace}' },
  { facet: 'diligence', dir: -1, text: 'has been about to fix {thing} since {year}' },
  { facet: 'diligence', dir: -1, text: 'is always the last into {workplace} and the first out' },
  // patience
  { facet: 'patience', dir: -1, text: 'has a hammer-shaped dent in {thing} from {year}' },
  { facet: 'patience', dir: -1, text: 'hung up on {person} three times in one evening' },
  { facet: 'patience', dir: -1, text: 'swears at {thing} by name' },
  { facet: 'patience', dir: 1, text: 'has been teaching {person} the same knot for years' },
  { facet: 'patience', dir: 1, text: 'waited forty minutes for {person} at {place} and said nothing about it' },
  { facet: 'patience', dir: 1, text: 'has been untangling {thing} on Sunday afternoons since {year}' },
  // altruism
  { facet: 'altruism', dir: 1, text: 'shovels {person}\'s steps before {own} own' },
  { facet: 'altruism', dir: 1, text: 'drives {person} to the doctor in town every month' },
  { facet: 'altruism', dir: 1, text: 'brings {food} to whoever is ill, whether they want it or not' },
  { facet: 'altruism', dir: -1, text: 'has never once lent {thing} to anyone' },
  { facet: 'altruism', dir: -1, text: 'charged {person} for the petrol, to the krone' },
  // gentleness
  { facet: 'gentleness', dir: 1, text: 'feeds a stray cat at {place} that everyone else chases off' },
  { facet: 'gentleness', dir: 1, text: 'has a kind word for the worst {chore} at {workplace}' },
  { facet: 'gentleness', dir: -1, text: 'has a score out of ten for everyone\'s {food}' },
  { facet: 'gentleness', dir: -1, text: 'told {person} exactly what was wrong with their {possession}' },
  // sincerity
  { facet: 'sincerity', dir: -1, text: 'tells a different story about {boast} depending on who is listening' },
  { facet: 'sincerity', dir: -1, text: 'is a great friend of whoever is running {workplace} this year' },
  { facet: 'sincerity', dir: -1, text: 'admired {person}\'s new {wishthing} to {pface} and laughed about it afterwards' },
  { facet: 'sincerity', dir: 1, text: 'told {person} the {food} was terrible, to {pface}' },
  { facet: 'sincerity', dir: 1, text: 'has never once called anyone\'s {food} lovely and meant otherwise' },
  // dependence
  { facet: 'dependence', dir: 1, text: 'rings {person} before every decision, however small' },
  { facet: 'dependence', dir: 1, text: 'has not been to {place} alone since {year}' },
  { facet: 'dependence', dir: -1, text: 'mended {possession} alone rather than ask {person}' },
  { facet: 'dependence', dir: -1, text: 'did not tell anyone about {year} until it was over' },
  // flexibility
  { facet: 'flexibility', dir: -1, text: 'has sat in the same seat at {place} for {years} years' },
  { facet: 'flexibility', dir: -1, text: 'has argued about {topic} with {person} since {year}' },
  { facet: 'flexibility', dir: -1, text: 'will not use {thing} the new way' },
  { facet: 'flexibility', dir: 1, text: 'agrees with whoever spoke last about {topic}' },
  { facet: 'flexibility', dir: 1, text: 'has moved seats at {place} every time someone asked' },
];

// The life material a pattern is filled from: things of their trade and their own, their people, their years.
function material(w: World, p: Person, r: Rng) {
  const M = (SETTING as any).material ?? {};
  const job = p.job ? w.placeById.get(p.job) : undefined; const trade = (job && M.trade?.[job.skill]) ?? M.trade?.[Object.entries(p.skills).sort((a, b) => b[1].r - a[1].r)[0]?.[0] ?? ''] ?? M.anything;
  const people = [p.partner, ...p.kids, ...p.parents, ...p.friends].map(id => id != null ? w.byId.get(id) : undefined).filter((q): q is Person => !!q && q.status === 'in');
  const lost = [...p.parents, p.partner, ...p.kids].map(id => id != null ? w.byId.get(id) : undefined).filter((q): q is Person => !!q && q.status === 'dead');
  const born = year(p.born); const years = Array.from({ length: Math.max(1, year(w.t) - born - 14) }, (_, i) => born + 15 + i);
  const mine = p.events.map(i => w.events[i]).filter(e => e.w >= 1.4 && e.t <= w.t);
  const boast = mine.filter(e => ['promoted', 'opened', 'night:good', 'gotgood', 'rescue', 'bought'].includes(e.type) && e.who[0] === p.id).at(-1);
  const grudgeE = mine.filter(e => e.who[1] === p.id && ['dismiss', 'needle', 'dressdown', 'blame', 'scheme:found', 'shout'].includes(e.type)).at(-1);
  const grudge = grudgeE ? w.byId.get(grudgeE.who[0]) : undefined;
  const poss = p.attachments.filter(a => a.key !== 'home').map(a => a.label);
  const own = p.sex === 'f' ? 'her' : 'his';
  return {
    thing: r.pick(trade ?? M.anything ?? ['the kettle']), count: r.pick(M.counts ?? ['boat that came in']), memento: r.pick(M.mementos ?? ['a stone from the beach']),
    keepsake: r.pick(M.keepsakes ?? ['Christmas card']), townthing: r.pick(M.townthings ?? ['house']), nearby: r.pick(M.nearby ?? ['the next town']),
    place: r.pick(M.places ?? ['the quay']), odd: r.pick(M.odd ?? ['a stuffed puffin']), tune: r.pick(M.tunes ?? ['an old waltz']), hiding: r.pick(M.hiding ?? ['the biscuit tin']), room: r.pick(M.rooms ?? ['the living room']), chore: r.pick(M.chores ?? ['the washing-up']), door: r.pick(M.doors ?? ['the fridge']), topic: r.pick(M.topics ?? ['the war']), programme: r.pick(M.programmes ?? ['quiz show']), food: r.pick(M.foods ?? ['fish cakes']), danger: r.pick(M.dangers ?? ['the quay edge']), building: r.pick(M.buildings ?? ['the church']), event: r.pick(M.events ?? ['the Christmas concert']), weekday: r.pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']), sport: r.pick(M.sports ?? ['football']), workplace: job ? job.name : undefined, possessive: p.sex === 'f' ? 'her' : 'his', obj: p.sex === 'f' ? 'her' : 'him', she: p.sex === 'f' ? 'she' : 'he',
    wish: r.pick(M.wishes ?? ['a new boat']), wishthing: r.pick(['kitchen', 'car', 'boat', 'haircut', 'jacket']), possession: poss.length ? r.pick(poss) : r.pick(M.possessions ?? ['the front door']),
    ...(() => { const q = people.length ? r.pick(people) : undefined; return { person: q?.first, pface: q ? `${q.sex === 'f' ? 'her' : 'his'} face` : undefined }; })(), lost: lost.length ? r.pick(lost).first : undefined, year: years.length ? String(r.pick(years)) : undefined,
    years: String(Math.max(3, Math.min(40, Math.round(age(w, p) - 18)))), boast: boast ? boastText(w, boast, p) : undefined,
    grudge: grudge && grudge.status !== 'dead' ? grudge.first : undefined, grudgeyear: grudgeE ? String(year(grudgeE.t)) : undefined, own,
  } as Record<string, string | undefined>;
}
function boastText(w: World, e: Event, p?: Person) {
  const pl = e.type === 'promoted' ? w.places.find(x => e.text.includes(x.name)) : undefined; const she = p?.sex === 'f' ? 'she' : 'he';
  const what = e.type === 'gotgood' ? e.text.match(/good on the (\w+)/)?.[1] : undefined; const word = what ? ((SETTING as any).skillWords?.[what] ?? what) : 'it';
  return e.type === 'promoted' ? (pl ? `the year ${she} made ${pl.title}` : `the year ${she} got the job`) : e.type === 'opened' ? 'opening the café' : e.type === 'night:good' ? 'the festival' : e.type === 'gotgood' ? `getting good at ${word}` : e.type === 'rescue' ? 'the day in the storm' : 'the boat';
}
function quirksOf(w: World, p: Person, r: Rng, taken?: Set<string>, used?: Map<string, number>): Persona['quirks'] {
  const mat = material(w, p, r);
  // The strongest traits (and the unconventional, who have more oddities and stranger ones) choose the patterns.
  const ranked = [...new Set(QUIRKS.map(q => q.facet))].map(k => [k, f(p, k)] as const).filter(([, z]) => Math.abs(z) > 0.8).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const n = clamp(Math.round(1 + 0.6 * f(p, 'unconventionality') + 0.4 * Math.abs(ranked[0]?.[1] ?? 0) + r.normal() * 0.5), 0, 3);
  const out: Persona['quirks'] = [];
  for (const [k, z] of ranked) {
    if (out.length >= n) break;
    const dir = (z > 0 ? 1 : -1) as 1 | -1;
    let fits = QUIRKS.filter(q => q.facet === k && q.dir === dir).map(q => ({ q, text: fill(q.text, mat) })).filter(x => x.text && !taken?.has(x.text!));
    // A pattern two others in town already have is passed over when another fits: a town knows each oddity as someone's.
    if (used && fits.some(x => (used.get(x.q.text) ?? 0) < 2)) fits = fits.filter(x => (used.get(x.q.text) ?? 0) < 2);
    if (!fits.length) continue;
    const pick = r.pick(fits); out.push({ text: pick.text!, facet: k, dir, pattern: pick.q.text });
  }
  return out;
}
const fill = (t: string, m: Record<string, string | undefined>) => { let ok = true; const s = t.replace(/\{(\w+)\}/g, (_, k) => { const x = m[k]; if (x == null) ok = false; return x ?? ''; }); return ok ? s : undefined; };

function lovesOf(p: Person, r: Rng): string[] {
  const L = ((SETTING as any).loves ?? []) as { text: string; facets?: Record<string, number> }[];
  if (!L.length) return [];
  const sc = L.map(x => [x.text, Object.entries(x.facets ?? {}).reduce((s, [k, wt]) => s + wt * (p.facets[k] ?? p.values[k] ?? 0), 0) + r.normal() * 0.8] as const).sort((a, b) => b[1] - a[1]);
  return sc.slice(0, 2 + (r.chance(0.3) ? 1 : 0)).map(([t]) => t);
}

// ---------- depth: what history has made of them ----------
function depthOf(w: World, p: Person) {
  const sore: Persona['sore'] = [], fears: Persona['fears'] = [], pride: Persona['pride'] = [], rules: Persona['rules'] = [];
  const evs = p.events.map(i => w.events[i]).filter(e => e.t <= w.t);
  const done = new Set<string>();
  // Being marked: likelier for the anxious and the unforgiving, and for a weighty or public blow; an old mark fades unless something renews it.
  const marked = (e: Event, key: string) => { const yrs = (w.t - e.t) / 12; const z = 0.7 * f(p, 'anxiety') - 0.4 * f(p, 'forgiveness') + 0.6 * (e.w - 1.2) + (((e as any).seen ?? e.vis) === 'public' ? 0.4 : 0) - 0.06 * yrs - 0.6; return new Rng(hash(w.seed, p.id, key, e.id)).next() < 1 / (1 + Math.exp(-2 * z)); };
  const add = <T extends { key: string; from: number }>(arr: T[], x: T) => { if (done.has(x.key) || !marked(w.events[x.from], x.key)) return; done.add(x.key); arr.push(x); };
  for (const e of evs.slice().reverse()) {
    const y = year(e.t); const victim = e.who[1] === p.id; const actor = e.who[0] === p.id;
    if (e.type === 'passed' && actor) add(sore, { key: 'overlooked', text: `touchy about being passed over, since the ${e.text.match(/for ([^;]+);/)?.[1] ?? 'top'}'s job (${y})`, feature: 'standing', facet: 'patience', shift: -0.7, from: e.id });
    if (e.type === 'scheme:found' && victim) add(sore, { key: 'betrayed', text: `slow to trust anyone at work since ${y}`, feature: 'challenged', facet: 'forgiveness', shift: -0.6, from: e.id });
    if (['needle', 'dressdown', 'sarcasm', 'rake'].includes(e.type) && victim && e.vis !== 'private' && e.w >= 0.9) add(sore, { key: 'shownup', text: `cannot bear being shown up in front of people, not since ${y}`, feature: 'public', facet: 'patience', shift: -0.5, from: e.id });
    if (e.type === 'dismiss' && victim) add(fears, { key: 'workless', text: `afraid of being out of work again, since ${y}`, feature: 'money', facet: 'prudence', shift: 0.6, from: e.id });
    if (['divorce', 'split'].includes(e.type) && (actor || victim)) add(fears, { key: 'left', text: `afraid of being left, since ${y}`, feature: 'love', facet: 'dependence', shift: 0.6, from: e.id });
    if (e.type === 'froze' && actor) add(fears, { key: 'danger', text: `has not trusted ${p.sex === 'f' ? 'herself' : 'himself'} in a crisis since ${y}`, feature: 'danger', facet: 'fearfulness', shift: 0.6, from: e.id });
    if (e.type === 'death' && p.parents.includes(e.who[0]) && age(w, p) - (w.t - e.t) / 12 < 20) add(fears, { key: 'loss', text: `lost a parent young, in ${y}, and holds on tight to the people left`, feature: 'need', facet: 'sentimentality', shift: 0.5, from: e.id });
    if (['promoted', 'opened', 'night:good', 'gotgood', 'rescue'].includes(e.type) && actor) pride.push({ text: `${boastText(w, e, p)} (${y})`, from: e.id });
    // Rules to live by: a value, given its origin.
    if (e.type === 'dismiss' && victim && f(p, 'dependence') < 0) add(rules, { key: 'self-reliant', text: `never asks anyone for anything, not since ${y}`, from: e.id });
    if (e.type === 'scheme:found' && victim && f(p, 'sincerity') > 0) add(rules, { key: 'honest', text: `says things to your face, after what was said behind ${p.sex === 'f' ? 'her' : 'his'} back in ${y}`, from: e.id });
    if (e.type === 'night:bad' && actor) add(rules, { key: 'self-reliant', text: `does everything ${p.sex === 'f' ? 'herself' : 'himself'} now, since the night the helpers let ${p.sex === 'f' ? 'her' : 'him'} down (${y})`, from: e.id });
    if (['visit', 'show', 'rescue'].includes(e.type) && victim && f(p, 'altruism') > 0) add(rules, { key: 'kind', text: `never turns anyone away, because someone once did not turn ${p.sex === 'f' ? 'her' : 'him'} away (${y})`, from: e.id });
  }
  // Round 18b: more of what happens to people leaves a shape (behind OFF=marks).
  if (!OFF.has('marks')) for (const e of evs.slice().reverse()) {
    const y = year(e.t); const actor = e.who[0] === p.id; const victim = e.who[1] === p.id; const him = p.sex === 'f' ? 'her' : 'him'; const his = p.sex === 'f' ? 'her' : 'his';
    const dead = e.type === 'death' && e.who.includes(p.id) && !actor ? w.byId.get(e.who[0]) : undefined;
    if (dead && (dead.partner === p.id || p.kids.includes(dead.id) || p.parents.includes(dead.id))) add(fears, { key: 'loss', text: `has held on tight to the people left since ${dead.first} died (${y})`, feature: 'need', facet: 'sentimentality', shift: 0.5, from: e.id });
    if (e.type === 'ill' && actor && e.w >= 2) add(fears, { key: 'illness', text: `has taken no chances with ${his} health since ${y}`, feature: 'safety', facet: 'prudence', shift: 0.5, from: e.id });
    if (e.type === 'absent' && victim) add(sore, { key: 'letdown', text: `remembers who was not there for ${him} in ${y}`, feature: 'need', facet: 'forgiveness', shift: -0.5, from: e.id });
    if (e.type === 'setback' && actor) add(fears, { key: 'money', text: `has been careful with every krone since ${y}`, feature: 'money', facet: 'prudence', shift: 0.5, from: e.id });
    if (e.type === 'home' && actor) add(rules, { key: 'rooted', text: `will not leave Skarvik again, not after the years away (back in ${y})`, from: e.id });
    if (['show', 'visit'].includes(e.type) && actor && e.who[1] != null && !pride.length) { const q = w.byId.get(e.who[1]); if (q) pride.push({ text: `being there for ${q.first} when it mattered (${y})`, from: e.id }); }
  }
  if (!OFF.has('marks')) { const kidE = p.kids.map(k => w.byId.get(k)).filter((k): k is Person => !!k && age(w, k) >= 22).flatMap(k => k.events.map(i => w.events[i]).filter(e => e.who[0] === k.id && ['promoted', 'married', 'opened', 'gotgood'].includes(e.type))).at(-1); if (kidE) pride.push({ text: `how ${w.byId.get(kidE.who[0])!.first} turned out`, from: kidE.id }); }
  const formative = evs.filter(e => e.w >= 1.5 && e.who.includes(p.id)).sort((a, b) => b.w - a.w).slice(0, 3).map(e => e.id);
  return { sore: sore.slice(0, 2), fears: fears.slice(0, 2), pride: pride.slice(0, 2), rules: rules.slice(0, 2), formative };
}

// The persona at this moment: surface from traits and the person's own seed (fixed for life), depth from history (grows with it).
export function persona(w: World, p: Person): Persona {
  const cache = (p as any)._persona as { at: number; ps: Persona } | undefined;
  if (cache && cache.at === p.events.length) return cache.ps;
  const r = new Rng(hash(w.seed, p.id, 'persona'));
  const humour = humourOf(p, r), voice = voiceOf(w, p, r);
  const held = (p as any)._quirks as Persona['quirks'] | undefined;
  const quirks = held ?? quirksOf(w, p, new Rng(hash(w.seed, p.id, 'quirks', Math.floor(p.events.length / 25)))); // given out by the town (personaTick); before that, read from the person alone
  const loves = lovesOf(p, new Rng(hash(w.seed, p.id, 'loves')));
  const ps: Persona = { humour, voice, quirks, loves, ...depthOf(w, p) };
  (p as any)._persona = { at: p.events.length, ps };
  return ps;
}

// Plain words for a persona, for reading lives cold and for the page.
export function describe(w: World, p: Person): string[] {
  const ps = persona(w, p); const out: string[] = [];
  const h = ps.humour; const style = (Object.entries({ warm: h.warm, coping: h.coping, cutting: h.cutting, selfMocking: h.selfMocking }) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  if (h.wit > 0.8 || style[1] > 1) out.push(({ warm: 'the one who gets a room laughing', coping: 'laughs things off, even the bad things', cutting: 'funny at other people\'s expense', selfMocking: 'makes jokes about ' + (p.sex === 'f' ? 'herself' : 'himself') + ' before anyone else can' } as Record<string, string>)[style[0]] + (h.wit > 1 ? ', and genuinely quick' : ''));
  else if (h.wit < -1) out.push('does not really do jokes');
  const vv = ps.voice; const said: string[] = [];
  if (vv.talk > 1) said.push('talks a lot'); else if (vv.talk < -1) said.push('says little');
  if (vv.blunt > 1) said.push(`says exactly what ${p.sex === 'f' ? 'she thinks' : 'he thinks'}`); if (vv.dry > 1) said.push('dry'); if (vv.warm > 1.1) said.push('warm with everyone'); if (vv.formal > 1.2) said.push('a bit formal');
  if (said.length) out.push(said.join(', '));
  for (const q of ps.quirks) out.push(q.text);
  if (ps.loves.length) out.push('loves ' + ps.loves.map(x => x.replace(/\btheir\b/, p.sex === 'f' ? 'her' : 'his')).join(', ').replace(/, ([^,]*)$/, ' and $1'));
  for (const s of [...ps.sore, ...ps.fears]) out.push(s.text);
  for (const r of ps.rules) out.push(r.text);
  for (const t of [...new Set(ps.pride.map(pr => pr.text.replace(/ \(\d{4}\)$/, '')))]) out.push(`proud of ${t}`);
  return out;
}

// ---------- the month: history becomes character, and humour makes its own moments ----------
const on = () => !OFF.has('persona');
// Sore spots and fears are if-thens acquired from experience; rules to live by join the person's story about themselves.
function sync(w: World, p: Person, ps: Persona) {
  const acquired = [...ps.sore, ...ps.fears].slice(0, 3).map(x => ({ feature: x.feature, facet: x.facet, shift: x.shift, words: x.text, acquired: true }));
  p.ifThens = [...p.ifThens.filter(x => !(x as any).acquired), ...acquired];
  for (const r of ps.rules) if (!p.selfStory.some(s => s.key === r.key && s.text === r.text)) { p.selfStory = p.selfStory.filter(s => s.key !== r.key); p.selfStory.push({ key: r.key, text: r.text, weight: 0.6 }); }
}
// A misfortune of their own in the last year, in words, for the ones who joke about it.
function misfortune(w: World, p: Person) {
  const e = p.events.map(i => w.events[i]).filter(e => w.t - e.t <= 12 && e.t <= w.t).reverse().find(e => ['passed', 'setback', 'plan:failed', 'dismiss', 'divorce', 'split', 'night:bad', 'council:no', 'scheme:found'].includes(e.type) && e.who.includes(p.id));
  if (!e) return undefined;
  return { e, words: ({ passed: 'being passed over', setback: 'losing the money', 'plan:failed': 'the plan that came to nothing', dismiss: 'getting the sack', divorce: 'the divorce', split: 'the break-up', 'night:bad': 'the festival', 'council:no': 'the council', 'scheme:found': 'what came out' } as Record<string, string>)[e.type] };
}
function joke(w: World, p: Person, ps: Persona) {
  const h = ps.humour; const styles = (Object.entries({ warm: h.warm, coping: h.coping, cutting: h.cutting, selfMocking: h.selfMocking }) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const [style, z] = styles[0]; if (z < 0.8 && h.wit < 0.8) return;
  const r = w.rng; const M = (SETTING as any).material ?? {}; const self = p.sex === 'f' ? 'herself' : 'himself';
  let text = '', who = [p.id], causes: any[] = [], evidence: any[] = [];
  if (style === 'coping') { const m = misfortune(w, p); if (!m) return; text = `@${p.id} has been making jokes about ${m.words} since the week it happened.`; causes = [eventCause(w, m.e.id, 0.5)]; evidence = [ev(p.id, 'anxiety', -1, 0.5, 0.5)]; }
  else if (style === 'cutting') { const t = around(w, p).filter(q => q !== p && age(w, q) >= 16 && likeOf(w, p.id, q.id) < -0.1 && bond(w, p.id, q.id).fam > 0.2).sort((a, b) => likeOf(w, p.id, a.id) - likeOf(w, p.id, b.id))[0]; if (!t) return; text = r.pick([`@${p.id} has a name for @${t.id} that has caught on, and @${t.id} knows it.`, `@${p.id} does an impression of @${t.id} that the whole of ${r.pick((M.places ?? ['the Anchor']) as string[])} asks for.`, `@${p.id} has a joke about @${t.id} that will not die.`]); who = [p.id, t.id]; evidence = [ev(p.id, 'gentleness', -1, 0.6, 0.6), ev(p.id, 'bond:' + t.id, -1, 0.5, 0.6)]; }
  else if (style === 'selfMocking') { const f0 = p.events.map(i => w.events[i]).filter(e => e.t <= w.t && e.who[0] === p.id && ['froze', 'late', 'plan:failed', 'passed', 'rough', 'walkout'].includes(e.type)).at(-1); text = `@${p.id} tells the story of ${f0 ? ({ froze: 'the day ' + (p.sex === 'f' ? 'she' : 'he') + ' froze', late: 'the missed deadline', 'plan:failed': 'the plan that came to nothing', passed: 'being passed over', rough: 'the job done badly', walkout: 'walking out' } as Record<string, string>)[f0.type] : 'every one of ' + (p.sex === 'f' ? 'her' : 'his') + ' own disasters'} better than anyone, and always against ${self}.`; if (f0) causes = [eventCause(w, f0.id, 0.4)]; evidence = [ev(p.id, 'socialSelfEsteem', -1, 0.4, 0.5)]; }
  else { const place = r.pick(M.places ?? ['the Anchor']); const mine = material(w, p, new Rng(hash(w.seed, p.id, 'joke', w.t)));
    const story = r.pick([`the time ${mine.thing} went over the side`, mine.person ? `${mine.person}'s plans for ${mine.wish}` : `the plans for ${mine.wish}`, `the council's plan ${r.pick(((w.placeById.get('council') as any)?.plans ?? ['to widen the road']) as string[])}`, `the ferry that left without the priest`, `the summer the sheep got into the churchyard`, `what ${mine.person ?? 'the vicar'} said at the co-op`]); text = `@${p.id} had the whole of ${place} laughing about ${story}.`; evidence = [ev(p.id, 'sociability', 1, 0.5, 0.5), ev(p.id, 'liveliness', 1, 0.4, 0.5)]; }
  const e = addEvent(w, { type: 'humour', who, text, causes: [...causes, stateCause(h.wit > 1 ? 'genuinely quick' : 'that sense of humour', 0.4)], vis: 'local', evidence, w: 0.9 });
  broadcast(w, e);
  if (style === 'cutting' && who[1] != null) remember(w, w.byId.get(who[1])!, p, e.id, -0.15, -0.05, -0.05, 'made me a joke');
  if (style === 'warm') for (const q of around(w, p).filter(q => q !== p && e.knownBy.get(q.id) === 'seen')) { const b = bond(w, q.id, p.id); b.like = Math.min(1, b.like + 0.03); }
}
// Quirks are given out in turn, at sixteen and again at thirty and fifty, and a sentence someone else in town holds is not given twice.
function giveQuirks(w: World) {
  if (OFF.has('townquirks')) return;
  const L = live(w).filter(p => age(w, p) >= 16);
  const stage = (p: Person) => age(w, p) >= 50 ? 2 : age(w, p) >= 30 ? 1 : 0;
  const due = L.filter(p => (p as any)._quirkStage !== stage(p)); if (!due.length) return;
  const taken = new Set<string>(), used = new Map<string, number>();
  for (const q of L) if (!due.includes(q)) for (const x of ((q as any)._quirks ?? []) as Persona['quirks']) { taken.add(x.text); used.set(x.pattern, (used.get(x.pattern) ?? 0) + 1); }
  for (const p of due) {
    const qs = quirksOf(w, p, new Rng(hash(w.seed, p.id, 'quirks', stage(p))), taken, used);
    (p as any)._quirks = qs; (p as any)._quirkStage = stage(p); (p as any)._persona = undefined;
    for (const x of qs) { taken.add(x.text); used.set(x.pattern, (used.get(x.pattern) ?? 0) + 1); }
  }
}
export function personaTick(w: World) {
  giveQuirks(w);
  if (!on()) return;
  for (const p of live(w)) {
    if (age(w, p) < 16) continue;
    const ps = persona(w, p);
    if ((p as any)._synced !== p.events.length) { sync(w, p, ps); (p as any)._synced = p.events.length; }
    if (w.rng.chance(0.008) && w.t - (p.tried['humour']?.t ?? -99) > 18) { p.tried['humour'] = { t: w.t, ok: true, n: (p.tried['humour']?.n ?? 0) + 1 }; joke(w, p, ps); }
  }
}
// Everyday lines in the person's own detail: when the moment shows a trait they have a quirk for, every other time it is the quirk.
export function quirkLine(w: World, p: Person, facetKey: string, z: number, n: number): string | undefined {
  if (!on() || n % 2 === 1) return undefined;
  const q = persona(w, p).quirks.find(q => q.facet === facetKey && q.dir === Math.sign(z));
  return q?.text;
}
