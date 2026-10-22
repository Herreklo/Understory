// Motives: a trait said as what it makes a person want, fear or feel, the way a person gives a reason for what they did. People explain
// intentional acts by reasons (desires, beliefs, feelings) and keep traits for the background (Malle 1999; Malle, Knobe and Nelson 2007),
// so the trait sets the weight of a consideration and the motive is what the page says. Words only: nothing here is read by a decision.
//
// The words are data, in `motives.json` (portability rule 7): each pole of each facet has a wording, and its own wording where it meets
// the kinds of answer it most often explains. Each has two forms: the reason as given for the act (`for`), and the same pull when it argued
// against the act (`against`). Tokens: {she} {her} (possessive) {obj} {hers} {self}, and {t} for the other person (an @id); a wording with
// {t} is used only when there is one. This file is the reader.
import data from './motives.json';

type Wording = { for: string; against: string };
type Entry = { hi: Wording; lo: Wording; hiBy?: Record<string, Wording>; loBy?: Record<string, Wording> };
export type Voice = { she: string; her: string; obj: string; hers: string; self: string };

const M: Record<string, Entry> = data.facets;
const VOICES: Record<'f' | 'm', Voice> = data.voices;

export const voiceOf = (sex: 'f' | 'm'): Voice => ({ ...VOICES[sex] });

// The motive for a trait reason: the facet, which pole the person is at, the kind of answer (if the reason belongs to a decision), whether
// it argued against the act, and who the other person was. Undefined when the facet has no wording (the trait label stands).
export function motive(facet: string, high: boolean, kind: string | undefined, against: boolean, v: Voice, t?: string): string | undefined {
  const e = M[facet];
  if (!e) return undefined;
  const by = high ? e.hiBy : e.loBy;
  const pick = (w: Wording | undefined) => (w ? (against ? w.against : w.for) : undefined);
  let s = pick(kind ? by?.[kind] : undefined);
  if (s && s.includes('{t}') && !t) s = undefined;
  s ??= pick(high ? e.hi : e.lo)!;
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
