# A page that feels lived in

_Research, 22 October 2026, after Øystein's pilot reading and the two outside readers of the prediction study, who all found the lives repetitive. It covers why the page repeats, what makes generated text feel lived in rather than generated, and the rounds that could follow. Exit points 5 and 3. The evidence is in two files: `sources/language-page.md` (our page measured, with its rules, a checked sample and the scripts in `sources/language-scripts/`) and `sources/language-prior-art.md` (15 systems and studies, 37 sources). Reviewed by Fable 5.1, whose blocking finding is fixed here._

## Why our page repeats, measured

In round 40's busiest pack (3,429 lines, 48 versions), **21% of lines are extra copies** of a line already on the same page; the other packs on file give 16–21%. Readers have marked 2,290 repeat faults across 22 answer files. Split by cause:

| Cause | Share of the copies | Share of readers' repeat faults | What it is |
| --- | --- | --- | --- |
| **Selection** | 68% | 48% | routine shown every time: the town calendar, band routine, a want's end said again after the event that ended it |
| **Acts** | 18% | 37% | the same story act three or more times, or twice between the same two people, with the second time changing nothing |
| **Words** | 13% | 2.5% | a story act recurring at a fair rate, in the same words |

- **The summer festival alone draws 19% of every repeat fault on file.** "X told X to count her in for the summer festival" is faulted 7.8 times per hundred readings, and "the best night the town had had in years" 12.7.
- **Readers barely fault friendships and small kindnesses** (0.3–0.5 per hundred), though together they are a quarter of the page. A shorter page also costs: in round 35, readers chose the longer page 70% of the time, with the score rising 0.16 for every ten lines. So we cut what readers fault, not what is common.
- **Varied words work where they exist.** Acts with several wordings come back in new words 64% of the time. But 100 of the 115 acts have one wording, and varying words would reach only 13% of the copies.
- **Nothing is called back.** 82.5% of lines are never referred to again. Only 6% carry a particular that varies, such as a place or an object. 9 lines in 3,429 recall a specific earlier event by what it was.

The split between selection and acts depends on a list of what counts as routine; the source gives both readings. The words share is the most certain number, and the smallest. The reasons repeat too (67% of reason phrases recur within a life); that is left to the wording round already in "Next".

## What others did

- **Particulars come from the world's state, not from varied words.** RimWorld's art descriptions and Dwarf Fortress's engravings depict a real recorded event, so the object becomes a callback. Kate Compton's "10,000 bowls of oatmeal" names the trap: text can be unique and still feel the same.
- **Raw simulation reads as a log.** Ryan found it "will almost always lack story structure", and Dwarf Fortress's famous stories were picked out and retold by players. Montfort's Curveship separates what happened from how it is told: one line saying how often something happened ("every Sunday that winter…") replaces twelve.
- **Repetition gets noticed** when a distinctive line recurs (Skyrim's "arrow in the knee") or a small pool of lines cycles fast. Crusader Kings' events fire twice a year, and players ask for repeat tracking. No study gives a threshold.
- **Specific beats general, with a fallback.** Storylets and Left 4 Dead's dialogue pick the most specific line that fits, and Crusader Kings chooses paragraphs by condition. Every split multiplies the writing.
- **Language models.** Generative Agents invented 1.3% of what agents said about each other. Stories written with AI help were more alike as a set. Even at temperature 0, one model gave 80 different outputs in 1,000 runs. Readers mostly cannot spot AI text, yet 85% of gamers are negative about generative AI in games, and players who play for story most of all.

## Rules for our page

1. **Spend on particulars, then selection, then acts, and only last on words.**
2. **A particular is state.** A place, an object or a habit is a thing in the world with an ID, which a line can name and a later line can name again. The words never invent one.
3. **The page selects.** Routine folds into one line with its span ("has played the festival every year since 2027"). A line that only echoes the one above is dropped. A persona note is said once. The cause is always kept.
4. **Call back by what it was:** "not since the night the band fell apart at the Anchor", not "what she did last year".
5. **Ration marked phrases, not plain ones.** An image, an idiom or a judging word appears at most once a page. Plain words like "married" and "moved" may repeat, as "said" does in fiction.
6. **Every clause carries the IDs of what it claims,** so a check can fail any line with no event behind it. This makes our rule that nothing on a page claims what did not happen mechanical.
7. **Language models only offline.** A model may draft variants of a phrase table, which people curate, lint and commit, and the engine runs only on frozen tables. Live, a model breaks determinism and truth, costs too much at city scale (a city of 100,000 writes about a million lines a year), and players distrust it.

**Engine or setting.** The engine owns the frames, the selection, the callbacks and the IDs. A setting owns the lexicon: places, objects, occasions, institutions, its voice. So most of what makes a page *read as a story* is engine work, and most of what makes it *feel lived in* is setting content. One grammar then serves a town, a football club or a village. A translation rewrites whole sentences, never glued fragments.

## Rounds this could become

These are not slotted yet. The planning step after this research decides what enters "Next", and when, with Øystein. A page round changes no behaviour, but it is still an experiment, because it claims an effect on how a page reads. It may run beside a behaviour round only if it touches none of that round's files (`grammar.ts`, `page.ts`).

1. **Neutral:**
   - Frames carry the IDs of what they claim, and CI fails any clause with no event behind it (exit point 3).
   - The page measure becomes a diagnostic in `src/tools/diag/`, so every later round reports its repeat share.
   - CI also gets a frame render over random states, a Rule 8 lint over a whole rendered world, a list of model tics kept at zero, and one pseudo-localised pass.
2. **Selection,** on the page only. Fold the town calendar and drop the want echoes first: they are the most faulted per reading (4.8 and 5.5 per hundred). Expected: copies fall from 21% to about 18%, and festival faults lose most of their 19% share. Folding band routine and persona notes as well would bring copies to 14–15%, but cost about a fifth of the lines, which by round 35's slope reads worse. Size that line loss before deciding.
3. **Particulars and callbacks.** Events carry a place, and an object where the setting has one, drawn from the 160 materials and the venues it already holds. A line recalls a specific earlier event by what it was. This needs an engine change, so it gets a switch.
4. **Acts.** The feelings round does this work without a rule of its own: a second wrong renews resentment, a second apology ends guilt. That round reports the acts share of repeat faults (37% today) as a check.
5. **Later:** a second recurring occasion in the town (setting content), and wording variants for marked phrases only, drafted offline, at under two writer-hours per act per language.

## This fails if …

1. **The copies fall but the most-faulted lines remain.** Sizing check, on 20 throwaway worlds: the copy share, and the frequency of the fifteen most-faulted templates. Stop if the selection round removes less than half of those templates' occurrences.
2. **The shorter page reads worse,** as round 35 predicts: 0.16 per ten lines. Sizing check: lines a year fall by at most a tenth, and only from routine kinds. The predicted score change, by that slope, is written into the pre-registration.
3. **Particulars are decoration:** a place gets named that nothing returns to. Sizing check: the share of named places and objects named again later in the same life. Stop below a fifth.
4. **Callbacks are wrong,** recalling what did not happen or what the person could not know. Sizing check: over 20 worlds, no clause fails the ID check, and every recall line cites only a belief the person holds.
5. **New words, the same lives (the oatmeal).** Sizing check: the repeat share and the callback share are measured together. A round that raises variety but not callbacks does not pass.
