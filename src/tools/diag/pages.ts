// The page as a reading shows it, and what N1a counts on it (notes/build-plan.md, section 4): the copy share and the fifteen most-faulted
// templates (notes/research/language.md). The counting is ported from notes/research/sources/language-scripts (packlib.py's parsing and
// normalising, analysis.py's extra copies, faults.py's top fifteen), so a number from fresh worlds and one from a pack on file are the
// same number. A line's words are normalised before they are compared: names, bands, song titles, years, numbers, ordinals and
// pronouns are blanked, and a note saying how often it had happened is dropped.
import { SETTING } from '../../setting';
import { againNote, pageLines, shownCauses } from '../../page';
import { nameOf, year, type Person, type World } from '../../world';

// A person's present years as a pack shows them (pairarm.ts): each line numbered, so readers cite a fault by its line (M38), with its
// reasons and its "again" note; an earlier event shown under a line (↳) has no number of its own.
export function packPage(w: World, p: Person): string[] {
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
  const out: string[] = [];
  let n = 0;
  for (const { e, cited, again, firstT } of pageLines(w, events, new Set(p.events))) {
    const shown = shownCauses(e);
    const why = shown.length ? '  [' + shown.map(c => plain(c.label)).join('; ') + ']' : '';
    out.push(`${String(++n).padStart(3)}  ${year(e.t)}: ${plain(e.text)}${why}${again ? `  (${againNote(again, firstT)})` : ''}`);
    for (const x of cited) out.push(`       ↳ ${year(x.t)}: ${plain(x.text)}`);
  }
  return out;
}
// How much happens in a page: its lines, and its kinds of line (the event types on it), which readers score (round 36).
export function pageMeasure(w: World, p: Person) {
  const lines = pageLines(
    w,
    p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
    new Set(p.events),
  );
  return { lines: lines.length, kinds: new Set(lines.map(l => l.e.type)).size };
}

// The text of each line of a page, without its reasons, its cited events or its number (packlib.py's parse_pack and split_reasons).
const LINE = /^\s*(?:(\d+)\s+)?(\d{4}): (.*)$/;
const SUB = /^\s*(?:\d+\s+)?↳ (\d{4}): (.*)$/;
export function lineTexts(page: string[]): string[] {
  const out: string[] = [];
  for (const raw of page) {
    if (!raw.trim() || SUB.test(raw)) continue;
    const m = raw.match(LINE);
    if (!m) continue;
    const i = m[3].indexOf('  [');
    out.push((i >= 0 ? m[3].slice(0, i) : m[3]).trim());
  }
  return out;
}
// A pack file's versions, in order: each version's heading (P01, A) and its page.
export function packVersions(text: string): { id: string; page: string[] }[] {
  const out: { id: string; page: string[] }[] = [];
  for (const raw of text.split('\n')) {
    const h = raw.match(/^##### (P\d+), version ([AB]) — (.+?), (\d+) in (\d{4})/);
    if (h) out.push({ id: h[1] + h[2], page: [] });
    else out[out.length - 1]?.page.push(raw);
  }
  return out;
}

// packlib.py's norm, rule for rule.
const NAMES = (Object.values(SETTING.names) as string[][]).flat().filter(n => /^[A-Z][a-z]+$/.test(n));
const BANDS = [...new Set(SETTING.groupKinds.flatMap(k => k.names))]
  .filter(b => /^(?:the )?[A-Z][A-Za-z ]+$/.test(b) && b !== 'band')
  .sort((a, b) => b.length - a.length);
const ANY = NAMES.join('|');
const NAME = new RegExp(`\\b(?:${ANY})(?:\\s(?:${ANY}))?\\b`, 'g');
const NOTE =
  /\s*(It had happened before, in \d{4}\.|It was the \w+ time(?:, after [\d, and]+| since \d{4})?\.|It was not the first time\.|Nobody was surprised any more:[^.]*\.|\((?:the \w+ time since \d{4}|and (?:once more|\d+ more times) between)\))\s*$/;
export function stripNote(t: string): string {
  for (let prev: string | null = null; prev !== t; ) {
    prev = t;
    t = t.replace(NOTE, '').trim();
  }
  return t;
}
export function norm(t: string): string {
  t = stripNote(t).replace(/"[^"]*"/g, '"T"');
  for (const b of BANDS) t = t.split(b).join('BAND');
  return t
    .replace(NAME, 'X')
    .replace(/\bX(?:, X)*(?: and X)\b/g, 'X')
    .replace(/\b(19|20)\d{2}\b/g, 'Y')
    .replace(/\b\d+\b/g, 'N')
    .replace(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/g, 'ORD')
    .replace(/\b(she|he)\b/g, 'she')
    .replace(/\b(her|his|him)\b/g, 'her')
    .replace(/\b(herself|himself)\b/g, 'herself');
}

// The fifteen templates readers faulted most as repeats, over the 22 answer files on record (faults.py, faults-out.txt): the template,
// its repeat faults and its readings. The fifteenth ties at 23 with "X got there: to make things right with X, within the year.",
// which faults.py's order left out; it stays out, so the list is the one the research and the selection round name.
export const TEMPLATES: [string, number, number][] = [
  ['X told X to count her in for the summer festival.', 248, 3198],
  ['The summer festival that X put on was the best night the town had had in years.', 137, 1079],
  ['X had stopped talking about anything that mattered; they were polite with each other, and that was all.', 52, 727],
  ['X brought a song to BAND, "T", and everyone knew at once it was the best thing they had.', 48, 807],
  ['X brought a song to BAND, "T", and it did not come to much.', 44, 1391],
  ['X gave X the money without being asked twice.', 34, 1258],
  ['X tells the story of the day she froze better than anyone, and always against herself.', 31, 143],
  ["The council said yes to X's summer festival.", 29, 499],
  ['X finally told X what had been kept back.', 28, 805],
  ['X stopped seeing each other, and that was that.', 26, 1206],
  ['X took the credit for a year that X had carried.', 25, 808],
  ['Nothing had changed since Y: X had stopped bringing things up with X.', 25, 621],
  ['BAND played the Anchor; X froze and the rest fell apart around her.', 24, 188],
  ['X brought a song to BAND, "T", and it was good.', 24, 1521],
  ['X said, not quite joking, that she could play the open night if she wanted to.', 23, 325],
];
const TEMPLATE = new Map(TEMPLATES.map(([t], i) => [t, i]));

// What a set of pages holds: lines, extra copies (a line whose normalised words are already on the same page; analysis.py's excess),
// and each of the fifteen templates' lines.
export interface Copies {
  pages: number;
  lines: number;
  copies: number;
  templates: number[];
}
export function copies(pages: string[][]): Copies {
  const out: Copies = { pages: pages.length, lines: 0, copies: 0, templates: TEMPLATES.map(() => 0) };
  for (const page of pages) {
    const seen = new Map<string, number>();
    for (const t of lineTexts(page)) {
      const k = norm(t);
      seen.set(k, (seen.get(k) ?? 0) + 1);
      const i = TEMPLATE.get(k);
      if (i != null) out.templates[i]++;
    }
    for (const n of seen.values()) {
      out.lines += n;
      out.copies += n - 1;
    }
  }
  return out;
}
