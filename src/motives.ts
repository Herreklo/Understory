// Motives: a trait said as what it makes a person want, fear or feel, the way a person gives a reason for what they did. People explain
// intentional acts by reasons (desires, beliefs, feelings) and keep traits for the background (Malle 1999; Malle, Knobe and Nelson 2007),
// so the trait sets the weight of a consideration and the motive is what the page says. Words only: nothing here is read by a decision.
//
// The words are data, in `motives.json` (portability rule 7): each pole of each facet has a wording, and its own wording where it meets
// the kinds of answer it most often explains. Each has two forms: the reason as given for the act (`for`), and the same pull when it argued
// against the act (`against`). Tokens: {she} {her} (possessive) {obj} {hers} {self}, and {t} for the other person (an @id); a wording with
// {t} is used only when there is one. This file is the reader.
//
// Round 43w: a kind of answer spans unlike acts, and a reason readers fault is faulted on one act, not another (notes/research/wording.md).
// So a pole may also have its own wording for one act, the expression chosen or the type of an event that is no choice of expression,
// first in line before the kind's and the pole's. It keeps the pole's sense: only the words fit the act.
import data from './motives.json';

type Wording = { for: string; against: string };
type Entry = {
  hi: Wording;
  lo: Wording;
  hiBy?: Record<string, Wording>;
  loBy?: Record<string, Wording>;
  hiAct?: Record<string, Partial<Wording>>;
  loAct?: Record<string, Partial<Wording>>;
  hiEvent?: Record<string, Partial<Wording>>;
  loEvent?: Record<string, Partial<Wording>>;
};
// The act a reason is given for: the expression chosen, if the event is one, and the event's type.
export type Act = { expr?: string; type: string };
export type Voice = { she: string; her: string; obj: string; hers: string; self: string };

const M: Record<string, Entry> = data.facets;
const VOICES: Record<'f' | 'm', Voice> = data.voices;

export const voiceOf = (sex: 'f' | 'm'): Voice => ({ ...VOICES[sex] });

// The motive for a trait reason: the facet, which pole the person is at, the kind of answer (if the reason belongs to a decision), whether
// it argued against the act, who the other person was, and the act (round 43w). Undefined when the facet has no wording (the trait label
// stands).
export function motive(
  facet: string,
  high: boolean,
  kind: string | undefined,
  against: boolean,
  v: Voice,
  t?: string,
  act?: Act,
): string | undefined {
  const e = M[facet];
  if (!e) return undefined;
  const by = high ? e.hiBy : e.loBy;
  const pick = (w: Partial<Wording> | undefined) => {
    const s = w ? (against ? w.against : w.for) : undefined;
    return s && s.includes('{t}') && !t ? undefined : s;
  };
  const byAct = act ? (act.expr != null ? (high ? e.hiAct : e.loAct)?.[act.expr] : (high ? e.hiEvent : e.loEvent)?.[act.type]) : undefined;
  let s = pick(byAct) ?? pick(kind ? by?.[kind] : undefined);
  s ??= (high ? e.hi : e.lo)[against ? 'against' : 'for'];
  return s
    .replace(/\{t\}/g, t ?? 'them')
    .replace(/\{she\}/g, v.she)
    .replace(/\{her\}/g, v.her)
    .replace(/\{obj\}/g, v.obj)
    .replace(/\{hers\}/g, v.hers)
    .replace(/\{self\}/g, v.self);
}
export const MOTIVE_FACETS = Object.keys(M);
// Whether a pole of a facet has its own wording for a kind of answer, as `motive` would say it (round 42).
export function wordedFor(facet: string, high: boolean, kind: string, t?: string): boolean {
  const w = (high ? M[facet]?.hiBy : M[facet]?.loBy)?.[kind];
  return !!w && (!!t || !w.for.includes('{t}'));
}
