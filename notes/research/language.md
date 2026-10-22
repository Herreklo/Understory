# A page that feels lived in

_Research, 22 October 2026, after Øystein's pilot reading and the two outside readers of the prediction study, who all found the lives repetitive. Why the page repeats, what makes generated text feel lived in rather than generated, and the rounds that follow. Exit point 5. Evidence: `sources/language-page.md` (our page measured, with its rules and a checked sample) and `sources/language-prior-art.md` (17 systems and studies, 37 sources)._

## Why our page repeats, measured

In round 40's busiest pack (3,429 lines, 48 versions), **21% of lines are extra copies** of a line already on the same page. The other packs on file give 16–21%. Readers have marked 2,290 repeat faults in 22 answer files. Split by cause:

| Cause | Share of the copies | Share of readers' repeat faults | What it is |
| --- | --- | --- | --- |
| **Selection** | 68% | 48% | routine shown every time: the town calendar, band routine, a want's end said again after the event that ended it |
| **Acts** | 18% | 37% | the same story act three or more times, or twice between the same two people, and the second time changes nothing |
| **Words** | 13% | 2.5% | a story act recurring at a fair rate, in the same words |

- **The summer festival alone draws 19% of every repeat fault on file.** "X told X to count her in for the summer festival" is faulted 7.8 times per hundred readings; "the best night the town had had in years" 12.7.
- **Readers barely fault friendships and small kindnesses** (0.3–0.5 per hundred), although they are a quarter of the page. Round 35 found readers chose the longer page 70% of the time. So cut what readers fault, not what is common.
- **Varied words already work where they exist:** acts with several wordings recur in new words 64% of the time. But 100 of 115 acts have one wording, and wording would touch only 13% of the copies.
- **Nothing is called back.** 82.5% of lines are never referred to again. 6% of lines carry a particular that varies (a place, an object). 0.6% use the 128 quirk patterns built from the person's own life. 9 lines in 3,429 recall a specific earlier event by what it was.
- **Reasons repeat too:** 67% of reason phrases recur within their life ("they genuinely like each other" 206 times).

The split between selection and acts depends on a list of routine kinds; the measurement gives both. The words share is the most certain number, and the smallest.

## What others did

- **Particulars from state, not varied words.** RimWorld's art descriptions and Dwarf Fortress's engravings depict a real recorded event, so an object becomes a callback. Kate Compton's "10,000 bowls of oatmeal": text can be unique and still feel the same; Emily Short adds that text tied to no mechanic becomes decoration players skip.
- **Raw simulation reads as a log.** Ryan: it "will almost always lack story structure"; Dwarf Fortress's famous stories were picked out and retold by players. Montfort's Curveship separates what happened from its telling: frequency ("every Sunday that winter…") replaces twelve lines with one.
- **Repetition is noticed** when a distinctive line recurs (Skyrim's "arrow in the knee") or a small pool cycles fast: Crusader Kings' events fire twice a year and players ask for repeat tracking; Football Manager's press has fewer than ten questions a week. No study gives a threshold.
- **Specific beats general, with a fallback.** Storylets and Left 4 Dead's dialogue pick the most specific eligible line; Wildermyth splits a line by a hero's trait and relationship; Crusader Kings chooses paragraphs by condition. Each split multiplies writing.
- **Hearsay.** Caves of Qud tells events through biased in-world accounts; Talk of the Town's people hold beliefs that spread and can be false. Ours can tell an event from the person's, a rival's or the town's side, from beliefs the engine already holds.
- **Language models.** Generative Agents invented 1.3% of what agents said about each other and sounded "overly formal"; stories written with AI help were more alike as a set; temperature 0 still gave 80 different outputs in 1,000 runs. Readers mostly cannot detect AI text, yet 85% of gamers are negative about generative AI in games, most of all those who play for story.

## Rules for our page

1. **Spend on particulars, then selection, then acts, and only last on words.**
2. **A particular is state.** A place, an object or a habit is a thing in the world with an ID, which a line can name and a later line can name again. No particular is invented by the words.
3. **The page selects.** Routine folds into one line with its span ("has played the festival every year since 2027"); an echo of the line above is dropped; a persona note is said once; the cause is always kept.
4. **Call back by what it was:** "not since the night the band fell apart at the Anchor", not "what she did last year".
5. **Ration marked phrases, not plain ones.** An image, an idiom or a judging word at most once a page; "married" and "moved" may repeat as "said" does in fiction.
6. **Every clause carries the IDs of what it claims.** A frame states its claims, so a check can fail any line with no event behind it. This is our rule "nothing on a page claims what did not happen", made mechanical.
7. **Language models only offline.** A model may draft variants of a phrase table; people curate, lint and commit them; the engine runs only on frozen tables. A live model fails determinism, truth and cost (a city of 100,000 writes about a million lines a year), and players distrust it. If a game ever words live, it does so from a closed list of facts with IDs, checked clause by clause, cached, and never inside the engine.

**Engine or setting.** The engine owns the frames, the selection, the callbacks and the IDs. A setting owns the lexicon: places, objects, occasions, institutions, its register. One grammar then serves the town, a football club and a medieval village, and a translation rewrites whole sentences per language, never glued fragments. Most of what makes a page feel lived in, the particulars, is setting content; most of what makes it read as a story, selection and callbacks, is engine.

## The rounds, in order

1. **Neutral:** frames carry the IDs of what they claim, and CI fails an orphan clause; the page measure becomes a diagnostic (`src/tools/diag/`), so every later round reports its repeat share.
2. **Selection** (an experiment on the page only; behaviour identical): fold the calendar and band routine with their span, drop a want's echo, say each persona note once; leave friendships and kindnesses. Expected: copies fall from 21% to about 12%, festival faults by most of their 19%.
3. **Particulars and callbacks:** events carry a place and, where the setting has one, an object, from the 160 materials and the venues the setting already holds; a line recalls a specific earlier event by what it was. Needs an engine change, so it has a switch.
4. **Acts that recur change something:** a second occurrence between the same people moves the bond or opens a feeling, generalising the third-time rule in `threads.ts`. This is the feelings round's work (`feelings-and-traits.md`), not a separate one.
5. **A second recurring occasion** in the town, so the festival is not the only one (setting content).
6. **Wording variants last,** for marked phrases only, drafted offline if at all.

## Dangers, each with a check

| Danger | Check |
| --- | --- |
| Oatmeal: new words, the same lives | repeat share and callback share measured together; a round that raises variety but not callbacks does not pass |
| Selection hides the cause | blind readers still answer "why" for the folded lines |
| A false claim | an orphan clause fails CI |
| A callback to what the person cannot know | a hearsay or recall line cites only beliefs the person holds |
| Nonsense combinations | every frame rendered over 1,000 random states; unresolved slots and broken agreement fail |
| Rule 8 | no identity term fills a judging slot; a linter runs over a whole rendered world |
| The AI feel | a list of model tics (delve, tapestry, testament…) stays at zero in committed tables |
| Translation | one pseudo-localised pass and one gendered language over all frames before a setting ships |

## This fails if …

1. **Readers still find it repetitive with the copies halved.** Sizing check: copies under 12%; then one cheap sitting on the folded pages, and stop if repeat faults per hundred readings fall by less than a third.
2. **The shorter page reads worse,** as in round 35. Sizing check: lines a year fall by at most a fifth, and only from routine kinds.
3. **Particulars are decoration:** a place named that nothing returns to. Sizing check: the share of named places and objects named again later in the same life; stop below a fifth.
4. **Callbacks are wrong:** a line recalls what did not happen, or what the person could not know. Sizing check: the orphan check and the belief check fail nothing over 20 worlds.
5. **Authoring cost runs away.** Sizing check: writer-hours per act stay under two per language, and a frame with no reading gain is not extended to other acts.
