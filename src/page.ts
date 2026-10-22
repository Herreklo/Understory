// The page's own rules, shared by everything that renders a life (the app, the cold-read pack, the coherence counter), so that what a
// reader is given is one thing. A reason that cites an event the page would not otherwise show gets that event shown under
// it, and an act repeated word for word is shown the first and the last time, with the times between said once. Rendering only; the
// record is untouched.
import { type Event, type World, fit, ordinal, year } from './world';

export interface PageLine {
  e: Event;
  cited: Event[]; // events a reason of this line cites that the page shows nowhere else: shown under the line
  again: number; // identical lines between this one and the previous one shown, folded into "again"
  firstT?: number; // with a fold (round 41): when the act was first done, for "the third time since 2027"
}

// What makes two lines the same act: type, the same people, the same words apart from years.
const sameAs = (e: Event) => `${e.type}|${[...new Set(e.who)].sort((a, b) => a - b).join(',')}|${e.text.replace(/\b(19|20)\d{2}\b/g, 'Y')}`;

// The reasons a line shows: the first three that are not an "against" note, nor one its decision marks as not bearing on the act (round
// 42). `all` shows those too, as the page was before (for the round's counter).
export const shownCauses = (e: Event, all = false) =>
  e.causes
    .filter(
      c => !c.key?.startsWith('against:') && (all || !c.key || (c.kind !== 'trait' && c.kind !== 'belief') || !e.decision?.idle?.includes(c.key)),
    )
    .slice(0, 3);

// The lines of a life, in the order given. `shown` is the set of event ids the page shows (the person's own list); it grows with the
// cited events, so a later line does not cite the same event twice. `all` as for shownCauses.
export function pageLines(w: World, events: Event[], shown: Set<number>, all = false): PageLine[] {
  // Fold repeats: for each key, the first and the last occurrence stay.
  const last = new Map<string, number>();
  events.forEach((e, i) => last.set(sameAs(e), i));
  const seen = new Map<string, number>(); // key -> how many folded since the last shown
  const firstT = new Map<string, number>();
  const out: PageLine[] = [];
  events.forEach((e, i) => {
    const k = sameAs(e);
    const n = seen.get(k);
    if (n == null) {
      seen.set(k, 0);
      firstT.set(k, e.t);
      out.push({ e, cited: [], again: 0 });
    } else if (last.get(k) === i) {
      // Round 41: a line that already says how often it happened needs no note; one that does not says which time it was, since when.
      const said = fit() && /It had happened before|It was the \w+ time|Nobody was surprised any more|had been happening since/.test(e.text);
      out.push({ e, cited: [], again: said ? 0 : n, ...(fit() && !said ? { firstT: firstT.get(k) } : {}) });
      seen.set(k, 0);
    } else seen.set(k, n + 1);
  });
  for (const line of out)
    for (const c of shownCauses(line.e, all)) {
      if (c.kind !== 'event' || c.ref == null || c.ref < 0 || shown.has(c.ref)) continue;
      const cited = w.events[c.ref];
      if (!cited) continue;
      line.cited.push(cited);
      shown.add(c.ref);
    }
  return out;
}

// The "again" note for a folded repeat, in words: which time this was and since when (round 41), or how many were folded between.
export const againNote = (n: number, firstT?: number) =>
  n <= 0
    ? ''
    : firstT != null
      ? `the ${ordinal(n + 2)} time since ${year(firstT)}`
      : n === 1
        ? 'and once more between'
        : `and ${n} more times between`;
