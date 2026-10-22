// Does a state decide anything? For one state, every present-years decision that weighs it is scored again as the engine scores it
// (decide.ts `score`, the truth view, the person's own variability) with the state neutralised, as the honest-why test neutralises a
// reason (decide.ts `honestWhy`): its considerations read at their neutral value. A decision flips when the likeliest answer changes (in
// the situation grammar, the answers are families); it turns when the chosen answer's odds fall below half, honest-why's own test.
// The counter reads the decision through the predict hook and changes nothing in the world.
// A state is named by its considerations' ids: an exact id ('identity'), a prefix ending in ':' or '*' ('mark:' or 'mark*'), or a
// /regular expression/. A state that should be counted this way needs considerations with their own ids, and `neutral` set where 0.5
// is not "as if it were not there".
import { score, truthView, type Option } from '../../decide';
import type { Person, World } from '../../world';

export function stateMatcher(state: string): (id: string) => boolean {
  const re = state.match(/^\/(.*)\/$/);
  if (re) return id => new RegExp(re[1]).test(id);
  if (state.endsWith('*')) return id => id.startsWith(state.slice(0, -1));
  if (state.endsWith(':')) return id => id.startsWith(state);
  return id => id === state;
}
// The options as they would be without the state.
export function neutralised(options: Option[], match: (id: string) => boolean): Option[] {
  return options.map(o => ({
    ...o,
    considerations: o.considerations.map(c => (match(c.id) ? { ...c, input: () => c.neutral ?? 0.5 } : c)),
  }));
}

export interface FlipRow {
  decisions: number; // every present-years decision
  weighed: number; // those where some answer carries the state
  flips: number; // the likeliest answer changes without it
  turns: number; // the chosen answer's odds fall below half without it
  shift: number; // the sum of |p(chosen) with − p(chosen) without|
}
export interface Flips {
  state: string;
  all: FlipRow;
  byTrigger: Record<string, FlipRow>;
}
const row = (): FlipRow => ({ decisions: 0, weighed: 0, flips: 0, turns: 0, shift: 0 });
// The kind of decision, as recordStats names it for the norms table.
const triggerOf = (rec: any) =>
  String(rec?.trigger ?? '?')
    .replace(/:.*$/, '')
    .replace(/^a want.*/, 'want')
    .replace(/^whether to go on.*/, 'go on');

// Count one state's flips over a world's present years. Install after the world is built; any predict hook already there still runs.
export function countFlips(w: World, state: string): Flips {
  const match = stateMatcher(state);
  const out: Flips = { state, all: row(), byTrigger: {} };
  const prev = w.hooks.predict;
  w.hooks.predict = (w2: World, p: Person, options: Option[], chosenId: string, rec: any) => {
    prev?.(w2, p, options, chosenId, rec);
    const k = triggerOf(rec);
    const rows = [out.all, (out.byTrigger[k] ??= row())];
    for (const r of rows) r.decisions++;
    if (!options.some(o => o.considerations.some(c => match(c.id)))) return;
    const view = truthView(w2);
    const before = score(options, view, p.variability);
    const after = score(neutralised(options, match), view, p.variability);
    const top = (s: typeof before) => s.reduce((a, b) => (b.p > a.p ? b : a)).id;
    const pb = before.find(o => o.id === chosenId)!.p;
    const pa = after.find(o => o.id === chosenId)!.p;
    const odds = (x: number) => x / Math.max(1e-6, 1 - x);
    for (const r of rows) {
      r.weighed++;
      if (top(before) !== top(after)) r.flips++;
      if (odds(pa) < odds(pb) * 0.5) r.turns++;
      r.shift += Math.abs(pb - pa);
    }
  };
  return out;
}
