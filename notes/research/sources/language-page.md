# The page: where the repetition comes from

Read-only measurement, 22 October 2026. Data: `reports/40-reading-busiest-pack.txt` (48 versions, 3,429 lines), cross-checked on round 40's random pack and both of round 41's packs; readers' faults in all 22 answer files on file (rounds 29–41 and M38); the code on `main`. Scripts and raw outputs: `language-scripts/` (`inventory.py`, `analysis.py`, `faults.py`, `reasons.py`, `compare.py`, `*-out.txt`).

## Tables

**T1. What the code can say**

| Source | Count |
| --- | --- |
| Acts answering a situation (`families.ts`) | 115 expressions (3 never logged), 148 wordings |
| ... with one wording / with several | **100 / 15** (the 15 have 3–4 each: `cold`, `confide`, `visit`, `absent`, `criticise`, `defend`, `stonewall` and 8 more) |
| Line templates with a person token, all engine files | 550 in 30 files (`families.ts` 148, `time.ts` 79, `group.ts` 37, `steer.ts` 33, `love.ts` 27, `social.ts` 27, the rest under 20 each) |
| Reason wordings (`motives.json`) | 25 facets, 198 phrases (for and against); of 50 facet poles, 23 have one wording, 15 two, 12 three or more |
| `grammar.ts` / `telling.ts` / `page.ts` / `witness.ts` | 16 / 27 / 6 / 3 template literals; about 160 quoted reason labels in `grammar.ts` |
| Particulars in `setting.ts` and `persona.ts` | 160 material items, 128 quirk patterns, 27 small loves, 15 habits, 12 band names, a 14-pattern song-title generator |
| **Realised in the pack** | 808 distinct lines (names, numbers, years, titles normalised) in 3,429; 360 seen once; the top 25 are 26% of all lines, the top 50 are 39% |

**T2. Lines repeated within a version (busiest pack)**

| | Lines in a repeat group | Extra copies (beyond the first) |
| --- | --- | --- |
| All | 1,254 (37% of lines) | **734 (21% of lines)** |
| Selection (routine kind) | 815 (65%) | 501 (68%) |
| Acts (story act, 3+ times, or twice with the same people) | 241 (19%) | 134 (18%) |
| Words (story act, twice, different people) | 198 (16%) | 99 (13%) |
| *If routine lines were judged by the act rules instead* | acts 62%, words 38% | acts 67%, words 33% |
| *Looser key (prefixes such as "Noticed:" and "1 year"/"2 years" merged)* | 1,290 | 753: selection 67%, acts 19%, words 13% |

Across packs (extra copies, and their split selection / acts / words): 40 busiest 21% (68 / 18 / 13); 40 random 16% (64 / 22 / 13); 41 busiest 21% (67 / 24 / 9); 41 random 18% (57 / 32 / 12). Routine kinds are 48–54% of all lines in every pack.

**T3. Extra copies by kind of line (busiest pack)**

| Kind | Lines | Share of lines | Extra copies | Verdict |
| --- | --- | --- | --- | --- |
| Story act (everything not below) | 1,568 | 45.7% | 134 + 99 | acts + words |
| Small kindness (the hat, visits, promises kept, money lent) | 425 | 12.4% | 85 | selection |
| Habit and persona note ("is now…", "Noticed:", "Typical:") | 324 | 9.4% | 18 | selection |
| Band routine (songs, gigs, joining) | 299 | 8.7% | 113 | selection |
| Town calendar (summer festival, harbour day, open night) | 273 | 8.0% | 106 | selection |
| Friendship made / ended / renewed | 232 / 122 / 121 | 13.9% | 100 / 40 / 35 | selection |
| A want's end said after the event that ended it | 65 | 1.9% | 4 | selection (implied) |

**T4. Readers' `repeat` faults (22 files, 2,290 of 11,764 faults; 2,283 matched to a line; 128,555 line-readings)**

By the within-version verdict of the line quoted: **selection 1,091 (48%)**, **acts 837 (37%)**, **words 56 (2.5%)**, a line not repeated in its own version 299 (13%; 121 of them also appear in the other version of the pair, so are partly an artefact of paired reading).

| Kind of line | Repeat faults | Line-readings | Per 100 |
| --- | --- | --- | --- |
| A want's end said again | 146 | 2,664 | **5.5** |
| Town calendar | 507 | 10,461 | **4.8** |
| Habit and persona | 208 | 11,572 | 1.8 |
| Band routine | 198 | 11,464 | 1.7 |
| Story act | 1,046 | 61,072 | 1.7 |
| Friendship ended | 49 | 3,882 | 1.3 |
| Small kindness | 79 | 15,698 | 0.5 |
| Friendship made | 36 | 7,565 | 0.5 |
| Friendship renewed | 14 | 4,177 | 0.3 |

Top 15 templates (35% of all repeat faults; the top 5 are 23%):

| # | Template | Faults | Line-readings | Per 100 | Kind |
| --- | --- | --- | --- | --- | --- |
| 1 | X told X to count her in for the summer festival. | 248 | 3,198 | 7.8 | town |
| 2 | The summer festival that X put on was the best night the town had had in years. | 137 | 1,079 | 12.7 | town |
| 3 | X had stopped talking about anything that mattered; they were polite with each other, and that was all. | 52 | 727 | 7.2 | story |
| 4 | X brought a song to BAND, "T", and everyone knew at once it was the best thing they had. | 48 | 807 | 5.9 | band |
| 5 | X brought a song to BAND, "T", and it did not come to much. | 44 | 1,391 | 3.2 | band |
| 6 | X gave X the money without being asked twice. | 34 | 1,258 | 2.7 | kindness |
| 7 | X tells the story of the day she froze better than anyone, and always against herself. | 31 | 143 | 21.7 | story (persona) |
| 8 | The council said yes to X's summer festival. | 29 | 499 | 5.8 | town |
| 9 | X finally told X what had been kept back. | 28 | 805 | 3.5 | story |
| 10 | X stopped seeing each other, and that was that. | 26 | 1,206 | 2.2 | friendship |
| 11 | X took the credit for a year that X had carried. | 25 | 808 | 3.1 | story |
| 12 | Nothing had changed since Y: X had stopped bringing things up with X. | 25 | 621 | 4.0 | story |
| 13 | BAND played the Anchor; X froze and the rest fell apart around her. | 24 | 188 | 12.8 | band |
| 14 | X brought a song to BAND, "T", and it was good. | 24 | 1,521 | 1.6 | band |
| 15 | X said, not quite joking, that she could play the open night if she wanted to. | 23 | 325 | 7.1 | town |

The summer festival alone (rows 1, 2, 8, 15) draws 437 faults: 19% of every repeat fault on file.

**T5. Selection and callbacks (busiest pack)**

| Measure | Value |
| --- | --- |
| Lines a version | 71.4 (29–107); random pack 47.6 |
| Lines a year (ten-year page) | **7.1** |
| Routine kinds (T3, all but story acts) | 54% of lines |
| Events the page already folds away ("and N more times between") | 37 in the whole pack |
| Lines a later reason in the same version refers to | **599 (17.5%)**; 82.5% are referred to by nothing |
| ... story acts / routine kinds | 29% / 8% (friendship made 1%, habits 1%, kindness 6%, band 13%, town 16%, renewed 19%) |
| Reason phrases repeated within their version | 4,974 of 7,469 (67%); "they genuinely like each other" 206, "likes things done properly and on time" 188 |

**T6. Particulars and callbacks in the words (busiest pack)**

| Measure | Lines | Share |
| --- | --- | --- |
| Names a place, a time of year or day, or an object | 1,106 | 32% |
| ... fixed in the template (the same in every instance: "the summer festival", "the hat", "at X's door") | 862 | 25% |
| ... **varies between instances** ("in front of everyone at the sawmill/clinic/Anchor", "fixed the old pickup/letterbox") | **210** | **6%** |
| A song title (generated) | 129 | 4% |
| A quirk line filled from the person's own life (128 patterns in `persona.ts`) | **21** | **0.6%** |
| Repeat notes ("It had happened before, in 2028", "the third time since") | 235 | 7% |
| Recalls an earlier event in words, generically ("what X did last year", "the old business", "Nothing had changed since") | about 280 | 8% |
| Recalls a specific earlier event by what it was ("not after the summer festival", "the night the band played") | **9** | **0.3%** |

**T7. Do the variants work?** When a family act recurs in one version: with several wordings in code, 145 of 228 recurrences (64%) came in new words; with one wording, 88 of 324 (27%), and those only because a filler (place, topic) differed.

## Rules used

- **Normalising:** names (from the setting's name lists, so a full or first name) → X, a list of people → X; band names → BAND; song titles → "T"; years → Y; other numbers → N; ordinals → ORD; she/he, her/his/him, herself/himself merged. The page's own repeat notes are stripped before comparing.
- **Repeat group:** lines in one version with the same normalised text. "Extra copies" counts all but the first.
- **Kind:** a line matches a list of regular expressions for the routine kinds in T3 (`analysis_kinds.py`); everything else is a story act.
- **Verdict**, first rule that fires: (1) a routine kind → **selection**; (2) a story act seen 3+ times in the version, or twice with exactly the same other people → **acts**; (3) a story act seen twice with different people → **words**.
- **Reader faults** are matched to a line by their quote (rounds 29–41) or line number (M38), and take that line's verdict in that version; a fault whose line is not repeated under the exact key is tried under the looser key.
- **Callbacks:** a line counts as referred to if a later line's reason quotes its text (with or without its year) or shares 60% of its words and its year.

## Findings

**1. Words are the smallest cause.** The code has one wording for 100 of its 115 acts, and almost every non-family template (friendships, the festival, songs, habits) has one or two. That is narrow, but the numbers say it matters least. Story acts repeated in the same words, at a rate a life could carry (twice, different people), are 13% of the extra copies and draw **2.5%** of readers' repeat faults. Where variants exist they work: 64% of recurrences come out in new words, against 27% for single-wording acts (T7). More variants would make the page less verbatim, and readers would still see the same thing happening again.

**2. Selection is the largest share of the copies, but only part of it bothers readers.** Routine kinds are 54% of every page, and they give 68% of the extra copies. Readers fault some routine heavily and some hardly at all. The town calendar (4.8 faults per 100 readings) and the second announcement of a want already met (5.5) are the worst lines on the page. The summer festival alone draws 19% of every repeat fault on file. Friendships made and renewed, and small kindnesses, are faulted at 0.3–0.5 per 100. They are also the lines nothing ever refers to again (1–6%). Judgement: readers tolerate these as background but notice the calendar, because it is one event said by everyone, every year, in identical words.

**3. Acts recur more than a story carries.** The same story act three or more times, or twice between the same two people, gives 18% of the copies but **37% of readers' repeat faults**. The lines are the ones a story turns on: secrets told and kept back, the same row with the same partner, being passed over, "kept away when needed", strokes. In the engine, the second occurrence changes nothing. Only the page notes it ("It had happened before"), and `threads.ts`'s rule that a third thread becomes "how this person is now" covers one mechanism. Another 13% of faults land on lines that repeat a meaning under a different template, such as "started practising guitar" and then "got there: people have started to talk about her guitar". Judgement: this is acts and selection together, not words.

**4. The page is a log.** Seven lines a year are shown. 82.5% of lines are never referred to again by any reason, 71% of story acts and 92% of routine lines. The page's folding hides 37 events in the whole pack. Two thirds of reason phrases repeat within the same life. Round 35's finding stands against cutting blindly: readers chose the longer page 70% of the time, and round 36 found scores follow the number of *kinds* of line (+0.06 a kind), not the number of lines. Selection should therefore cut what readers fault (the calendar, echoes, persona notes said twice), not friendships.

**5. Particulars barely exist on the page, though the setting has them.** A third of lines name a place, time or object, but three quarters of those are fixed in the template ("the summer festival", "the hat"). Only 6% of lines carry a detail that differs from one instance to the next. Most of those are a workplace name, which the act's situation supplies. The setting holds 160 material items and 128 quirk patterns built from each person's life, and they reach 21 lines (0.6%). Callbacks in words are almost all generic ("what Tom did last year", "the old business"). Nine lines in 3,429 recall an earlier event by what it was. The mechanism for a callback exists: the ↳ line and the cited event in a reason. The line's own words never use it. Judgement: this is why lives read as generated even where nothing repeats, and no reader fault kind counts it.

**6. What humans said.** Only summaries are on file; no free text is committed. Q3's two readers "both rated the people's logic 4 of 5, both found the lives repetitive, and neither wanted another round" (`docs/STATUS.md`). BOARD round 29 calls the lives "repetitive and lifeless". The owner's pilot of 22 October found the lives "samey" and reasons "that never say what was felt" (`notes/research/feelings-and-traits.md`). It also counted ten strokes in one version (`out-feelings/audit.md` §5), an act recurring with nothing growing from the count. The owner's Quiz II found the page made a skilled reader worse (BOARD l.600–613). The pilot itself was never written up.

**Limits.** The kind lists are mine and decide the selection share. With the routine lines judged by the act rules instead, the copies split 67% acts and 33% words (T2), so the selection/acts boundary is soft, while "words is smallest" holds either way. The busiest pack is the extreme. The random packs repeat less (16–18% extra copies) but split the same way.

## Verdict

Rough split of the repetition (judgement, built on T2 and T4): **selection about 40%, acts about 35%, particulars about 15%, words about 10%.** The particulars share is not measured as repetition. It is the "generated, not lived-in" share that no fault counts. Confidence: high that words is the smallest cause and that the festival is the single largest line. Medium on the selection–acts split, because the town calendar is both (one civic event in the setting, said every year by everyone). Low on the particulars share.

The three changes the numbers point to:

1. **Select the calendar and the echoes** (page only, a neutral-looking change judged as an experiment). Show a town or band routine once per life with "every year since 2027". Drop a want's "got there" when the line above already says it. Say a persona note once. These kinds draw 46% of repeat faults from 28% of line-readings. Leave friendships and kindnesses alone (0.3–0.5 per 100).
2. **Give a recurring act a consequence** (engine). The second time the same act passes between the same people, or a story act comes round a third time, it should escalate, end something or become a standing trait said once, generalising `threads.ts`'s third-thread rule. This targets the 37% of faults on acts. The town also needs a second recurring occasion, so the festival stops standing in for civic life.
3. **Let lines carry their particulars and their past** (words, drawing on state already held). Name the cited event's substance in the line ("would not lend him a penny, not after the till"). Fill place, object and season slots from the material and quirk lists the setting already has, which today reach 0.6% of lines. More wording variants are cheap and help less: about 13% of copies and 2.5% of faults.

## Appendix: 30 repeat groups, drawn at random (seed 40) from the 520 in the busiest pack

"Check" is my own reading of the rule's verdict after seeing the lines.

| # | Version | Verdict | Kind | k | People | Years | Line (first two) | Check |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | P23A | words | story | 2 | different | 2026, 2034 | Hilda Brook told Oliver what Oliver wanted to hear. / Arthur told Hilda Brook what Hilda Brook wanted to hear. | agree |
| 2 | P02B | selection | friend ended | 2 | different | 2034, 2035 | Lynn Lee and Sarah Baker drifted out of each other's lives. / Sarah Baker and Greta Moore drifted out of each other's lives. | agree |
| 3 | P12B | selection | friend made | 2 | different | 2031, 2032 | Eric found a friend in Oliver Sayer. / Oliver Sayer found a friend in Vera Lyons. | agree |
| 4 | P14B | selection | band | 2 | different | 2027, 2028 | Neil Waller was the first to say Kate Moore's song was the best thing they had. / Neil Lyons was the first to say… | agree |
| 5 | P10B | selection | friend made | 3 | different | 2027, 2029, 2035 | John found a friend in Sylvia Newman. / Bert found a friend in John. | agree |
| 6 | P07A | words | story | 2 | different | 2030, 2031 | Oliver found reasons to be busy while Terry was going through it. / Terry found reasons to be busy while Agnes was going through it. | agree |
| 7 | P18A | selection | friend ended | 2 | different | 2027, 2031 | Vera and Edward drifted out of each other's lives. / Edward and Sean drifted out of each other's lives. | agree |
| 8 | P14A | acts | story | 3 | different | 2027, 2031, 2035 | Kate Moore wasn't there for Agnes when it mattered. / …for Mark Waller when it mattered. It had happened before, in 2028. | agree |
| 9 | P22A | words | story | 2 | different | 2032, 2032 | Lily was passed over for skipper; Peter Eden got the job. / Edward Myers was passed over for skipper; Peter Eden got the job. | disagree: one event told twice, selection |
| 10 | P02B | words | story | 2 | different | 2029, 2035 | Ellen Baker went cold on Sarah Baker and stayed that way for weeks. / Tara went cold on Sarah Baker… | agree |
| 11 | P07A | selection | kindness | 2 | different | 2030, 2030 | Steve Holmes slipped a folded note into the hat for Terry when nobody was looking. / Ellen slipped a folded note… | agree |
| 12 | P04A | selection | town | 2 | different | 2028, 2035 | Ryan told Rose Hale to count him in for the summer festival. / Ryan told Amelia Kemp to count him in… | agree |
| 13 | P10B | words | story | 2 | different | 2026, 2027 | John kept away just when Eve Hughes needed people. / John kept away just when Tess Lee needed people. | agree, close to acts |
| 14 | P23A | acts | story | 3 | different | 2027, 2030, 2031 | Eve finally told Hilda Brook what had been kept back. (×2 with Hilda) | agree |
| 15 | P04A | selection | band | 3 | same | 2027, 2032, 2033 | Ryan brought a song to the Harbour Lights, "Thin Ferry", and everyone knew at once it was the best thing they had. / …to Red Sky, "Staying on a Friday", and everyone knew… | agree |
| 16 | P09B | words | story | 2 | different | 2026, 2029 | Sophie went to Hilda and apologised. / Sophie went to Mona and apologised. It had happened before, in 2023. | agree |
| 17 | P16A | acts | story | 2 | same | 2028, 2032 | Nora Ash had a go at Larry about never going anywhere, and it was not about never going anywhere for long. (×2) | agree |
| 18 | P06A | selection | persona | 2 | same | 2028, 2034 | Noticed: Toby tells people what they want to hear. (×2) | agree |
| 19 | P13A | words | story | 2 | different | 2026, 2031 | Sean Ash took the credit for a year that Sam Hale had carried. / …that Oliver Dale had carried. | agree |
| 20 | P16B | acts | story | 3 | different | 2034, 2035, 2035 | Owen Moore and Larry Scott buried the hatchet, 1 year after the skipper's job. / Maisie and Larry Scott buried the hatchet… | agree (one contest, many lines) |
| 21 | P08A | selection | kindness | 2 | different | 2026, 2032 | Mark had promised Oscar Nash to pay it back by the end of the month, and did it. / Audrey had promised Oscar Nash… | agree |
| 22 | P05B | selection | band | 2 | different | 2032, 2034 | Vera Baker let people think the best of Trevor's song was Vera Baker's. / Alan let people think… | agree, close to acts |
| 23 | P20B | selection | friend made | 2 | different | 2034, 2034 | Steve and Oliver are friends now. / Steve and Gary are friends now. | agree |
| 24 | P03B | acts | story | 2 | same | 2029, 2035 | Mary told Harry Lee what Harry Lee wanted to hear. (×2, the second "the third time") | agree |
| 25 | P16A | selection | town | 2 | same | 2032, 2035 | Larry got his part of the summer festival done with hours to spare. (×2) | agree |
| 26 | P17B | selection | friend made | 2 | different | 2026, 2031 | Tara found a friend in Andy Myers. / Susie found a friend in Tara. | agree |
| 27 | P11B | words | story | 2 | different | 2031, 2034 | Jonah Kemp picked holes in Harry Hughes's work in front of everyone. / Steve picked holes in Jonah Kemp's work… | agree |
| 28 | P08B | words | story | 2 | different | 2026, 2026 | Oscar and Olive are both after the headteacher's job, and it shows. / Terry and Oscar are both after… | disagree: one contest told twice, selection |
| 29 | P16A | acts | story | 2 | same | 2026, 2027 | Nora Ash decided to stay with Larry and give it another go. / Larry decided to stay with Nora Ash… It had happened before, in 2024. | agree |
| 30 | P08B | words | story | 2 | different | 2028, 2032 | Terry went to Oscar and apologised. / Alex Shaw went to Oscar and apologised. | agree |

Agreement on 28 of 30. Both disagreements move words to selection: one event, such as a contest for a post, told once from each side. The words share in T2 is, if anything, a little high.
