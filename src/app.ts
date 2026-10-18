// The lab page: build a world, run it, read lives from both sides of the wall.
import { buildWorld, runYears } from './build';
import { pickWitness, scoreAll, hunches, hindsight } from './witness';
import { titleAt, age, fullName, year, live, mood, topSources, peekBond, belief, facet, type World, type Person, type Event, nameOf } from './world';
import { FACETS, FACET_BY_ID, VALUES, APTITUDES, DIMS } from './core';
import { SETTING } from './setting';
import { EXPR } from './families';
import { wantLabel } from './time';

let W: World;
let sel: number | null = null;
let view: 'people' | 'chronicle' = 'people';
let side: 'felt' | 'truth' = 'felt';
let filt: 'in' | 'all' = 'in';
let chronFilter: 'twists' | 'major' | 'all' = 'major';
let sortBy = 'eventful';

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: string) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
const linkify = (s: string) =>
  esc(s).replace(/@(\d+)/g, (_, id) => {
    const p = W.byId.get(+id);
    return p ? `<button class="nm" type="button" data-id="${p.id}">${esc(nameOf(W, p.id))}</button>` : '?';
  });
const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => W.byId.get(+id)?.first ?? '?');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function statusOf(p: Person): string {
  const a = Math.floor(age(W, p));
  if (p.status === 'dead') return `died ${year(p.diedAt!)}, aged ${a}`;
  if (p.status === 'away') return `${p.awayKind === 'study' ? 'studying in the city' : 'living in the city'} since ${year(p.awaySince!)}`;
  if (a < 6) return 'small child';
  if (a < 18) return 'at school';
  if (p.job) {
    const pl = W.placeById.get(p.job)!;
    return p.lead ? titleAt(pl) : `${pl.role} at ${pl.name}`;
  }
  if (p.retired) return 'retired';
  if (p.givenUp) return 'not working';
  return 'out of work';
}
const evScore = (p: Person) => p.events.reduce((s, i) => s + (W.events[i].t >= W.startPresent ? W.events[i].w : 0), 0);
const knownBy = (e: Event) => W.witness != null && (e.knownBy.has(W.witness) || e.who.includes(W.witness));

function facetWords(id: string, z: number) {
  const f = FACET_BY_ID[id];
  const a = Math.abs(z);
  const d = z >= 0 ? f.high : f.low;
  return a < 0.6 ? d : a < 1.3 ? d + ' (somewhat)' : a < 2.1 ? d : d + ' (very)';
}

let fate = 1;
function start(seed: number, years = 10, runSeed = 1) {
  fate = runSeed;
  W = buildWorld(seed, runSeed);
  pickWitness(W);
  runYears(W, years);
  scoreAll(W);
  sel = null;
  render();
}

function renderTop() {
  $('yr').textContent =
    `${year(W.startPresent)}–${year(W.t)} · fate ${W.runSeed} · witness: ${fullName(W.byId.get(W.witness!)!)}, ${statusOf(W.byId.get(W.witness!)!)}`;
  ($('seed') as HTMLInputElement).value = String(W.seed);
  const present = W.events.filter(e => e.t >= W.startPresent);
  const c = (t: string[]) => present.filter(e => t.includes(e.type)).length;
  const twists = present.filter(e => e.surprise != null && e.w >= 1 && e.surprise > 0.5 && (e.explain ?? 0) > 0.5).length;
  const items: [number, string][] = [
    [live(W).length, 'living here'],
    [c(['born']), 'born'],
    [c(['death']), 'died'],
    [c(['married']), 'married'],
    [c(['divorce', 'split']), 'split up'],
    [c(['left']), 'left town'],
    [c(['home']), 'came home'],
    [c(['pursuit']), 'went after something'],
    [present.filter(e => e.type === 'want:achieved' && /got there/.test(e.text)).length, 'got there'],
    [c(['gaveup']), 'gave up'],
    [c(['shout', 'walkout', 'shutout', 'numb', 'quitpride']), 'breaking points'],
    [twists, 'twists'],
  ];
  $('sum').innerHTML = items.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
}
function renderList() {
  let ps = W.people.filter(p => filt === 'all' || p.status === 'in');
  const sorts: Record<string, (a: Person, b: Person) => number> = {
    eventful: (a, b) => evScore(b) - evScore(a),
    known: (a, b) => hunches(W, b).length - hunches(W, a).length,
    age: (a, b) => age(W, b) - age(W, a),
    name: (a, b) => fullName(a).localeCompare(fullName(b)),
  };
  ps.sort(sorts[sortBy]);
  if (sel == null || !W.byId.get(sel)) sel = (ps.find(p => p.id !== W.witness) ?? ps[0] ?? W.people[0]).id;
  $('plist').innerHTML = ps
    .map(
      p =>
        `<li class="${p.status !== 'in' ? 'gone' : ''}"><button type="button" data-id="${p.id}" aria-current="${p.id === sel}"><span class="n">${esc(fullName(p))}</span><span class="e">${Math.floor(age(W, p))}</span><span class="m">${esc(statusOf(p))}${p.id === W.witness ? ' · witness' : ''}</span></button></li>`,
    )
    .join('');
}

function eventLine(e: Event, showWhy: boolean, p?: Person) {
  const age0 = p ? ` · ${Math.floor((e.t - p.born) / 12)}` : '';
  const twist = e.surprise != null && e.w >= 1 && e.surprise > 0.5 && (e.explain ?? 0) > 0.5;
  return `<li class="${e.w >= 2 ? 'hi' : ''} ${twist ? 'twist' : ''}"><span class="d">${year(e.t)}<br><small>${MON[e.t % 12]}${age0}</small></span><div><div class="t">${linkify(e.text)}${twist ? ' <span class="chip acc">twist</span>' : ''}</div>${
    showWhy && e.causes.length
      ? `<div class="w">${e.causes
          .filter(c => !c.key?.startsWith('against:'))
          .slice(0, 3)
          .map(c => linkify(c.label))
          .join('; ')}</div>`
      : ''
  }</div></li>`;
}

function renderFelt(p: Person) {
  const wit = W.byId.get(W.witness!)!;
  if (p.id === wit.id)
    return `<p class="note">This is the witness. You can't be a mystery to yourself, or at least the lab doesn't model that yet.</p>`;
  const known = p.events.map(i => W.events[i]).filter(e => e.t >= W.startPresent - 120 && knownBy(e));
  const hs = hunches(W, p);
  const learnedIf = p.ifThens
    .filter(x =>
      p.events.some(i => {
        const e = W.events[i];
        return e.t >= W.startPresent && knownBy(e) && e.causes.some(c => c.label === x.words);
      }),
    )
    .map(x => x.words);
  const facts: string[] = [];
  if (p.partner != null) facts.push(`${p.pstat === 'married' ? 'married to' : 'seeing'} @${p.partner}`);
  const kids = p.kids.map(k => W.byId.get(k)!);
  if (kids.length) facts.push(`${kids.length} child${kids.length > 1 ? 'ren' : ''}`);
  const b = peekBond(W, wit.id, p.id);
  const fam = b
    ? b.fam > 0.6
      ? 'someone you see all the time'
      : b.fam > 0.25
        ? 'someone you know a little'
        : 'someone you barely know'
    : 'someone you have never really spoken to';
  // How they seem: from the witness's own belief about their state (fed by what the close see at the kitchen table and by strain that showed), never from the truth.
  const sb = belief(W, wit.id, p.id, 'state:low');
  const fresh = sb && sb.n > 0 && W.t - sb.last <= 12;
  const today =
    p.status === 'in'
      ? !fresh
        ? ''
        : sb!.m > 0.4
          ? sb!.m > 0.9
            ? 'seems low lately, and worn thin'
            : 'seems low lately'
          : sb!.m < -0.3
            ? 'seems in good spirits'
            : 'seems much as usual'
      : '';
  const big = p.events
    .map(i => W.events[i])
    .filter(e => e.t >= W.startPresent && e.surprise != null && e.surprise > 0.45 && e.w >= 1 && knownBy(e))
    .sort((a, b) => b.surprise! - a.surprise!)
    .slice(0, 2);
  const marks = p.marks.filter(m => W.events[m.cause] && knownBy(W.events[m.cause])).map(m => m.text);
  // Their days: the routines you'd know about, from what you've seen or from knowing them well.
  // Habits the witness has actually learned (through contact or a logged habit event); closeness alone is not knowledge.
  const habitKnown = (id: string) =>
    !!wit.tried[`knows:${p.id}:${id}`] ||
    p.events.some(i => {
      const e = W.events[i];
      return (
        (e.type === 'habit:new' || e.type === 'habit:back') &&
        e.text.includes(SETTING.habits.find(h => h.id === id)!.label.replace(/^is /, '')) &&
        knownBy(e)
      );
    });
  const days = p.habits.filter(h => !h.broken && habitKnown(h.id)).map(h => `${p.first} ${h.label}.`);
  const stopped = p.habits
    .filter(
      h =>
        h.broken != null &&
        W.t - h.broken < 36 &&
        p.events.some(i => {
          const e = W.events[i];
          return e.type === 'habit:broke' && e.t === h.broken && knownBy(e);
        }),
    )
    .map(h => `Has stopped: ${h.label.replace(/^is /, '').replace(/^has /, '')}.`);
  // The ledger: everything the witness has seen this person do, as counts by kind, including the acts that were not news.
  // The chronicle is what a player would feel; this is what they could count on.
  const ledger = new Map<string, number>();
  for (const e of W.events) {
    if (e.t < W.startPresent || e.who[0] !== p.id || !e.decision || (e.knownBy.get(wit.id) !== 'seen' && !e.who.includes(wit.id))) continue;
    const x = EXPR[e.type];
    if (!x || (x.solo && x.family === 'withdrawal')) continue;
    const thing =
      (
        { deadline: 'the work', chance: 'a spot at the open night', oldwound: 'the old business', obligation: 'help', authorship: 'song' } as Record<
          string,
          string
        >
      )[(e.decision.trigger ?? '').replace(/:.*$/, '')] ?? 'something';
    const label = x
      .text('', e.who[1] != null && e.who[1] !== p.id ? 'someone' : '', thing, p.sex === 'f' ? 'herself' : 'himself')
      .replace(/^\s+/, '')
      .replace(/someone's someone's/g, "someone's")
      .replace(/as if it were 's own/g, 'as if it were their own')
      .replace(/ was 's\b/g, ' was theirs');
    ledger.set(label, (ledger.get(label) ?? 0) + 1);
  }
  const seenActs = [...ledger.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([k, n]) => `${k}${n > 1 ? ` · ${n} times` : ''}`);
  // What they're after: only what has shown.
  const after = p.wants
    .filter(
      x =>
        !x.done &&
        x.pursuit &&
        p.events.some(i => {
          const e = W.events[i];
          return (e.type === 'pursuit' || e.type === 'tell' || e.type === 'follow') && e.t >= x.pursuit!.since && knownBy(e);
        }),
    )
    .map(x =>
      x.pursuit!.owner != null
        ? `Going along with @${x.pursuit!.owner}'s plan: ${wantLabel(W, W.byId.get(x.pursuit!.owner)!, x)}.`
        : `Working toward something: ${wantLabel(W, p, x)}.`,
    );
  return `
    <section><h3>What you know</h3><p class="prose">${esc(fullName(p))}, ${Math.floor(age(W, p))}, ${esc(statusOf(p))}${facts.length ? ', ' + linkify(facts.join(', ')) : ''}. ${esc(fam[0].toUpperCase() + fam.slice(1))}. ${esc(today ? today[0].toUpperCase() + today.slice(1) + '.' : '')}${marks.length ? ' ' + esc(marks.join('. ').replace(/^./, c => c.toUpperCase())) + '.' : ''}</p></section>
    <section><h3>Your sense of them</h3>${hs.length || learnedIf.length ? `<ul class="hunch">${hs.map(h => `<li>${esc(h.text)}</li>`).join('')}${learnedIf.map(x => `<li>You have noticed: ${esc(x)}.</li>`).join('')}</ul>` : '<p class="note">You have no real sense of them yet. You would need to see them under pressure.</p>'}</section>
    ${seenActs.length ? `<section><h3>What you have seen them do</h3><ul class="hunch">${seenActs.map(x => `<li>${esc(p.first)} ${esc(x)}</li>`).join('')}</ul></section>` : ''}
    ${days.length || stopped.length || after.length ? `<section><h3>Their days</h3><ul class="hunch">${[...after, ...days, ...stopped].map(x => `<li>${linkify(x)}</li>`).join('')}</ul></section>` : ''}
    <section><h3>What you've seen and heard</h3>${known.length ? `<ol class="story">${known.map(e => eventLine(e, false, p)).join('')}</ol>` : '<p class="note">Nothing yet.</p>'}</section>
    ${
      big.length
        ? `<section><h3>Looking back</h3>${big
            .map(e => {
              const h = hindsight(W, e);
              return `<div class="hind"><div class="t">${linkify(e.text)}</div><div class="w"><b>You could have seen it:</b> ${h.seen.length ? linkify(h.seen.join('; ')) : 'nothing, really'}.</div><div class="w"><b>You couldn't have known:</b> ${h.unseen.length ? linkify(h.unseen.join('; ')) : 'nothing; it was all there'}.</div></div>`;
            })
            .join('')}</section>`
        : ''
    }`;
}

function renderTruth(p: Person) {
  const row = (label: string, z: number, x = '') =>
    `<div class="row"><span>${label}</span><span class="v ${z <= -1.2 ? 'b1' : z < -0.5 ? 'b2' : z < 0.5 ? '' : z < 1.2 ? 'b3' : 'b4'}">${(z >= 0 ? '+' : '−') + Math.abs(z).toFixed(1)}</span><span class="x">${x}</span></div>`;
  const sig = new Set(p.signatures.map(s => s.facet));
  const dims =
    (['H', 'E', 'X', 'A', 'C', 'O'] as const)
      .map(
        d =>
          `<div class="dim"><h4>${DIMS[d]} <span class="v">${(p.dims[d] >= 0 ? '+' : '−') + Math.abs(p.dims[d]).toFixed(1)}</span></h4><div class="rows">${FACETS.filter(
            f => f.dim === d,
          )
            .map(f =>
              row(f.name + (sig.has(f.id) ? ' <span class="chip acc">signature</span>' : ''), facet(p, f.id), facetWords(f.id, facet(p, f.id))),
            )
            .join('')}</div></div>`,
      )
      .join('') +
    `<div class="dim"><h4>Between</h4><div class="rows">${row('Altruism', facet(p, 'altruism'), facetWords('altruism', facet(p, 'altruism')))}</div></div>`;
  const vals = Object.entries(p.values)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => row(VN[k] + (p.coreValues.includes(k) ? ' <span class="chip acc">core</span>' : ''), v))
    .join('');
  const apts = APTITUDES.map(a => row(a.name, p.aptitudes[a.id])).join('');
  const skills = Object.entries(p.skills)
    .filter(([, s]) => s.r > 1010 || s.interest === 2)
    .sort((a, b) => b[1].r - a[1].r)
    .map(
      ([k, s]) =>
        `<div class="row"><span>${k}${s.interest === 2 ? ' <span class="chip">passion</span>' : ''}</span><span class="v">${Math.round(s.r)}</span><span class="x">ceiling ${Math.round(s.ceil)}</span></div>`,
    )
    .join('');
  const bonds: [Person, any][] = [];
  for (const q of W.people) {
    if (q === p) continue;
    const r = peekBond(W, p.id, q.id);
    if (r && (r.fam > 0.3 || Math.abs(r.like) > 0.3)) bonds.push([q, r]);
  }
  bonds.sort((a, b) => Math.abs(b[1].like) + b[1].fam - (Math.abs(a[1].like) + a[1].fam));
  const bondHtml = bonds
    .slice(0, 8)
    .map(
      ([q, r]) =>
        `<div class="rel"><div class="h"><span>${linkify('@' + q.id)}${q.status !== 'in' ? ` <span class="chip">${q.status}</span>` : ''}</span><span class="o">like ${r.like.toFixed(2)} · respect ${r.respect.toFixed(2)} · trust ${r.trust.toFixed(2)}</span></div>${
          r.mem.length
            ? `<div class="why">${r.mem
                .slice(-3)
                .map((m: any) => `${esc(m.text)} (${year(m.t)})`)
                .join('; ')}</div>`
            : ''
        }</div>`,
    )
    .join('');
  const wants = p.wants
    .slice()
    .reverse()
    .map(x => {
      const pu = x.pursuit;
      const how = pu
        ? pu.owner != null
          ? `tagging along with ${linkify('@' + pu.owner)}`
          : `pursued since ${year(pu.since)}, ${Math.round(pu.progress * 100)}%${pu.visible ? '' : ', in secret'}${pu.setbacks ? `, ${pu.setbacks} setback${pu.setbacks > 1 ? 's' : ''}` : ''}`
        : 'only wished for';
      return `<li>${linkify(wantLabel(W, p, x))} <span class="x">(for ${VN[x.value] ?? x.value}, since ${year(x.since)}; ${how})</span>${x.done ? ` · <b>${x.done}</b>` : ' · open'}</li>`;
    })
    .join('');
  const habits = p.habits
    .map(
      h =>
        `<li>${esc(h.label)} <span class="x">(since ${year(h.since)}, ${esc(plain(h.from))}${h.broken != null ? `; stopped ${year(h.broken)}: ${esc(plain(h.breakWhy ?? ''))}` : ''})</span></li>`,
    )
    .join('');
  const att = p.attachments.map(a => `${esc(a.label)} ${(a.like >= 0 ? '+' : '−') + Math.abs(a.like).toFixed(2)}`).join(' · ');
  const bm = W.beliefs.get(W.witness!);
  const witnessBeliefs: string[] = [];
  if (bm)
    for (const [k, b] of bm) {
      const [sid, key] = k.split('|');
      if (+sid === p.id && FACET_BY_ID[key])
        witnessBeliefs.push(`${FACET_BY_ID[key].name} ${(b.m >= 0 ? '+' : '−') + Math.abs(b.m).toFixed(1)} ±${b.v.toFixed(2)} (${b.n} obs)`);
    }
  return `
    <section><h3>Who they are</h3><p class="prose">${p.signatures.map(s => `<b>${esc(facetWords(s.facet, s.z))}</b>`).join(', ')}${p.tension ? `; ${esc(p.tension.label)}` : ''}. Core values: ${p.coreValues.map(v => VN[v]).join(', ')}. Variability ${p.variability.toFixed(2)} (${p.variability < 0.6 ? 'steady' : p.variability > 0.95 ? 'erratic' : 'ordinary'}: the spread of their day-to-day behaviour).</p><p class="prose"><b>If-then:</b> ${p.ifThens.map(x => esc(x.words)).join('; ')}. <b>Self-story:</b> ${p.selfStory.length ? p.selfStory.map(x => esc(x.text)).join('; ') : 'none in particular'}.${p.foundingPast.length ? ' Founder: ' + esc(p.foundingPast.join('; ')) + '.' : ''}${p.marks.length ? ' Marks: ' + esc(p.marks.map(m => m.text).join('; ')) + '.' : ''}${p.exceptions.length ? ' Exceptions: ' + linkify(p.exceptions.map(x => x.text).join('; ')) + '.' : ''}${p.phase ? ' Phase: ' + esc(p.phase.label) + '.' : ''}</p></section>
    ${
      p.status === 'in'
        ? `<section><h3>Now</h3><p class="prose">Mood ${mood(W, p).toFixed(2)} · stress ${p.stress.toFixed(2)} (${
            topSources(p, 3)
              .map(s => plain(s.label))
              .join(', ') || 'nothing much'
          }) · health ${p.health.toFixed(2)} · savings ${p.savings.toFixed(0)}${p.drinks ? ' · drinking since ' + year(p.drinkSince) : ''}. On their mind: ${
            p.emotions
              .filter(e => e.until > W.t)
              .map(e => plain(e.label))
              .join(', ') || 'nothing in particular'
          }.</p></section>`
        : ''
    }
    <section><h3>Wants and pursuits</h3><p class="prose">Drive ${(p.drive >= 0 ? '+' : '−') + Math.abs(p.drive).toFixed(1)} (${p.drive > 0.6 ? 'goes after things' : p.drive < -0.6 ? 'wishes more than tries' : 'ordinary'}).</p>${wants ? `<ul class="plainlist">${wants}</ul>` : '<p class="note">None recorded.</p>'}</section>
    <section><h3>Habits</h3>${habits ? `<ul class="plainlist">${habits}</ul>` : '<p class="note">No routines to speak of.</p>'}</section>
    <section><h3>Attachments</h3><p class="prose">${att || 'None yet.'} · drawn to ${p.attraction === 'both' ? 'both women and men' : p.attraction === 'f' ? 'women' : 'men'}.</p></section>
    <section><h3>Personality</h3>${dims}</section>
    <section class="two"><div><h3>Values</h3><div class="rows">${vals}</div></div><div><h3>Aptitudes</h3><div class="rows">${apts}</div></div></section>
    <section><h3>Skills</h3><div class="rows">${skills || '<p class="note">Nothing beyond the basics.</p>'}</div></section>
    <section><h3>Bonds (their view)</h3>${bondHtml || '<p class="note">Knows nobody well.</p>'}</section>
    <section><h3>What the witness believes about them</h3>${witnessBeliefs.length ? `<p class="prose mono">${witnessBeliefs.join(' · ')}</p>` : '<p class="note">Nothing.</p>'}</section>
    <section><h3>Everything that happened</h3><ol class="story">${p.events
      .map(i => W.events[i])
      .map(e => eventLine(e, true, p))
      .join('')}</ol></section>`;
}

function renderDetail() {
  const p = W.byId.get(sel!);
  if (!p) return;
  $('detail').innerHTML = `<header><h2>${esc(fullName(p))}</h2><p class="sub">${Math.floor(age(W, p))} · ${esc(statusOf(p))}</p></header>
    <div class="seg" id="side"><button type="button" data-s="felt" aria-pressed="${side === 'felt'}">Felt (what the witness knows)</button><button type="button" data-s="truth" aria-pressed="${side === 'truth'}">Truth (designer only)</button></div>
    <div class="pane">${side === 'felt' ? renderFelt(p) : renderTruth(p)}</div>`;
}
function renderChron() {
  const evs = W.events.filter(
    e =>
      e.t >= W.startPresent &&
      (chronFilter === 'all'
        ? e.w >= 1
        : chronFilter === 'major'
          ? e.w >= 1.5
          : e.surprise != null && e.w >= 1 && e.surprise > 0.5 && (e.explain ?? 0) > 0.5),
  );
  const byYear: Record<string, Event[]> = {};
  for (const e of evs) (byYear[year(e.t)] ||= []).push(e);
  $('chron').innerHTML =
    `<div class="seg" id="cf"><button type="button" data-c="twists" aria-pressed="${chronFilter === 'twists'}">Twists</button><button type="button" data-c="major" aria-pressed="${chronFilter === 'major'}">Major</button><button type="button" data-c="all" aria-pressed="${chronFilter === 'all'}">Everything</button></div>
    <p class="note">A twist is an event the witness didn't expect but could have seen coming. Click a name to open that person.</p>
    ${
      Object.keys(byYear)
        .map(y => `<div class="yh">${y}</div><ol class="story">${byYear[y].map(e => eventLine(e, true)).join('')}</ol>`)
        .join('') || '<p class="note">Nothing here.</p>'
    }`;
}
function render() {
  renderTop();
  renderList();
  if (view === 'people') renderDetail();
  else renderChron();
  $('peopleView').hidden = view !== 'people';
  $('chron').hidden = view !== 'chronicle';
}

document.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
  if (!b) return;
  if (b.dataset.id) {
    sel = +b.dataset.id;
    if (filt === 'in' && W.byId.get(sel)!.status !== 'in') {
      filt = 'all';
    }
    if (view !== 'people') {
      view = 'people';
    }
    render();
    if (b.closest('.detail, .chron')) $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (b.dataset.s) {
    side = b.dataset.s as any;
    renderDetail();
    return;
  }
  if (b.dataset.v) {
    view = b.dataset.v as any;
    document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.v === view)));
    render();
    return;
  }
  if (b.dataset.c) {
    chronFilter = b.dataset.c as any;
    renderChron();
    return;
  }
  if (b.dataset.f) {
    filt = b.dataset.f as any;
    document.querySelectorAll('#filt button').forEach(x => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.f === filt)));
    renderList();
    return;
  }
});
($('sort') as HTMLSelectElement).addEventListener('change', ev => {
  sortBy = (ev.target as HTMLSelectElement).value;
  renderList();
});
$('ctl').addEventListener('submit', ev => {
  ev.preventDefault();
  start(Math.max(1, parseInt(($('seed') as HTMLInputElement).value, 10) || 1));
});
// ---------- downloads, so a life can be handed to a reviewer without the lab ----------
// Inside the claude.ai viewer, files go through the downloads capability (the viewer confirms); elsewhere, a plain browser download.
async function save(name: string, text: string, type = 'text/plain') {
  const claude = (window as any).claude;
  if (claude?.use) {
    try {
      const dl = await claude.use('downloads');
      if (dl) {
        await dl.save({ filename: name, data: text });
        return;
      }
    } catch (e: any) {
      if (e?.code === 'declined') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function saveUrl(name: string, url: string) {
  const r = await fetch(url);
  save(name, await r.text());
}
const strip = (html: string) =>
  html
    .replace(/<li[^>]*>/g, '\n- ')
    .replace(/<h3>/g, '\n\n## ')
    .replace(/<\/h3>/g, '\n')
    .replace(/<br>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
function lifeText(p: Person) {
  const wit = W.byId.get(W.witness!)!;
  return `# ${fullName(p)}, ${Math.floor(age(W, p))}, ${plain(statusOf(p))}\nWorld ${W.seed}, fate ${W.runSeed}. Witness: ${fullName(wit)}, ${plain(statusOf(wit))}. Years ${year(W.startPresent)}–${year(W.t)}.\n\n# FELT (what the witness could know)\n${strip(renderFelt(p))}\n\n# TRUTH (designer only)\n${strip(renderTruth(p))}\n`;
}
function worldText() {
  const wit = W.byId.get(W.witness!)!;
  const evs = W.events.filter(e => e.t >= W.startPresent && e.w >= 1);
  let out = `# Person Model Lab · world ${W.seed}, fate ${W.runSeed} · ${year(W.startPresent)}–${year(W.t)} · witness ${fullName(wit)}\n\n## Chronicle (major events, with their causes)\n`;
  for (const e of evs)
    out += `${year(e.t)} ${MON[e.t % 12]}: ${plain(e.text)}${
      e.causes.length
        ? '  [' +
          e.causes
            .filter(c => !c.key?.startsWith('against:'))
            .slice(0, 3)
            .map(c => plain(c.label))
            .join('; ') +
          ']'
        : ''
    }${e.surprise != null && e.surprise > 0.5 && (e.explain ?? 0) > 0.5 ? '  {twist}' : ''}\n`;
  out += `\n\n## Lives\n`;
  for (const p of W.people.slice().sort((a, b) => evScore(b) - evScore(a))) if (age(W, p) >= 14) out += `\n\n${lifeText(p)}`;
  return out;
}
function worldJson() {
  const people = W.people.map(p => ({ ...p, friends: [...p.friends], events: undefined }));
  const events = W.events
    .filter(e => e.t >= W.startPresent - 120)
    .map(e => ({
      ...e,
      knownBy: [...e.knownBy],
      decision: e.decision
        ? {
            trigger: e.decision.trigger,
            chosen: e.decision.chosen,
            options: e.decision.options,
            pWitness: e.decision.pWitness,
            honest: e.decision.honest,
          }
        : undefined,
    }));
  return JSON.stringify(
    { seed: W.seed, runSeed: W.runSeed, t: W.t, startPresent: W.startPresent, witness: W.witness, people, events, groups: W.groups },
    (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v),
  );
}
$('dlworld').addEventListener('click', () => save(`world-${W.seed}-${W.runSeed}.txt`, worldText()));
$('dllife').addEventListener('click', () => {
  const p = W.byId.get(sel!);
  if (p) save(`${fullName(p).replace(/\s+/g, '-')}-world-${W.seed}.txt`, lifeText(p));
});
$('dljson').addEventListener('click', () => save(`world-${W.seed}-${W.runSeed}.json`, worldJson(), 'application/json'));
$('srclist').innerHTML = [
  ...[
    'world',
    'rng',
    'core',
    'features',
    'families',
    'setting',
    'generate',
    'inclination',
    'decide',
    'grammar',
    'threads',
    'time',
    'group',
    'life',
    'love',
    'persona',
    'drama',
    'projects',
    'regard',
    'witness',
    'build',
    'app',
    'tools/predict',
    'tools/board',
    'tools/measure',
    'tools/story',
    'tools/consequences',
    'tools/audit',
    'tools/invariants',
    'tools/lovetest',
    'tools/test',
    'tools/replay',
    'tools/demography',
    'tools/twoworlds',
    'tools/read',
  ].map(f => `${f}.ts`),
  'board.sh',
  'page.html',
  'package.json',
  'tsconfig.json',
]
  .map(f => `<button class="lnk" type="button" data-src="${f}">${f}</button>`)
  .join('');
document.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest('button[data-src], button[data-doc]') as HTMLButtonElement | null;
  if (!b) return;
  const f = b.dataset.src ?? b.dataset.doc!;
  saveUrl(
    f
      .replace(/\.ts$/, '.ts.txt')
      .replace(/\.html$/, '.html.txt')
      .replace(/\.json$/, '.json.txt')
      .replace(/\.md$/, '.md'),
    'source/' + f,
  );
});
$('newtown').addEventListener('click', () => start(1 + Math.floor(Math.random() * 99999)));
$('refate').addEventListener('click', () => start(W.seed, 10, fate + 1));
$('more').addEventListener('click', () => {
  if (W.t - W.startPresent >= 12 * 50) return;
  runYears(W, 10);
  scoreAll(W);
  render();
});
start(5);
