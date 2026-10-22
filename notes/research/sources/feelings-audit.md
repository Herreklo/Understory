# Audit: what drives acts, what is felt, what reaches the page

Read-only audit of `src/` at commit ff774ee (branch `research/feelings`). Nothing was run; every number is a count from the source or from `reports/40-reading-busiest-pack.txt` (the round 40 pack: 48 versions, 3,429 lines, 7,450 bracketed reasons). The pack predates round 41, so a word-patch noted under fault (e) is not in it. No `*key*` file was opened.

Definitions. A *decision site* is a place where a property enters a weighed choice: a consideration constructor call (244 in `src/`: `facetC` 73, `bondC` 54, `privC` 34, `pubC` 34, `stateC` 16, `valueC` 10, `attachC` 10, `closeC` 7, `lastTime` 1), a `prefers` weight on one of the 115 acts, or a `decide()` option list (16 call sites). A *gate* decides who is offered a situation or an act, without weighing. *Reason text* is what a reader sees in square brackets.

## 1. Person properties

### 1a. Everything except facets

| Property | Set where | Decision sites (weighed) | Gates and other reads | In reason text? (pack, of 7,450) | Verdict |
|---|---|---|---|---|---|
| dims (6) | `generate.ts:76` from parents and culture | 0 | none; page profile `app.ts:266` | no | neither (an input to facets) |
| values (10) and coreValues | `generate.ts:116-135`; also nudges facets (LEAN) | 10 `valueC` (offer 1, migration 4, romance 1, love 3, stress 1) | every want is made from a core value (`money.ts:58-72`, 6 sites) | 4 reasons ("values loved ones") | drives acts but is hidden |
| aptitudes (9) | `generate.ts:176-181`, drift `yearly.ts:71-77` | 1 (`romance.ts:239`, school) | 6: habit `minAptitude` `time.ts:891`, `effects.ts:369`, `love.ts:138,156`, `social.ts:171`, skill inclination | 0 ("did well at school" absent) | drives acts but is hidden |
| skills (r, ceiling, interest) | `generate.ts:240`, `build.ts:107`, `work.ts` practice, `coarse.ts` | 1 (`chance.ts:49-52`) | work performance `work.ts:37` (feeds hiring, promotion, firing) | 138 ("a real gift" 70, "a strong record" 22, guitar 24) | drives acts and shows |
| perf (recent work) | `work.ts:53,288,326` | 9 (criticised 2, raised 1, drama 3, steer 1, group, other) | promotion and firing odds | "X's work had been strong all year" 50, "a fair/poor record" 3 | drives acts and shows |
| wants (9 kinds) | `money.ts` wantTick, `drama.ts:231,598`, `projects.ts`, `steer.ts:526`, `time.ts:81` | 6 (urgency, progress) plus pursuit steps in `time.ts`, `steer.ts` | `offer.ts:16`, `chance.ts:21` | 289 (3.9%) | drives acts and shows |
| habits (about 14) | `time.ts:895` formHabits, `work.ts:391` | 0 | venue for meeting and inviting (`steer.ts` 3, `time.ts` 3, `aftermath.ts` 4, `migration.ts` 2, `social.ts` 1); break hazard `time.ts:1000` | as lines ("no longer first in at work", 13 in pack) | drives acts (weakly) and shows |
| attachments (home, groups) | `time.ts:795,1051`, `work.ts:389` | 10 `attachC` (offer 2, migration 6, romance 2) | pseudo-facet `attach:home` | label text only ("rooted here", "nothing much holding them here"); felt-state "homesick" 1 | drives acts and shows |
| marks | `effects.ts:97,391`, `romance.ts:203`, `coarse.ts:677` (4 sites) | 0 | read by `persona.ts` depthOf (sore spots, rules) and `app.ts:177` | via the line they came from | drives acts (thin) and shows |
| exceptions | `effects.ts:419` (1 site) | read inside `facet(p,key,toward)` `world.ts:433` | one person, one trait | no | drives acts, hidden |
| selfStory (2 of 10 + rules) | `generate.ts:156-169`, `persona.ts:686-690`, `time.ts:137` | 1 per option in 19 of 20 families (`identityC`, `grammar.ts:152-204`) | | 128 (1.7%) "that is who X is: ..." | drives acts and shows |
| ifThens (1-3 of 18, plus acquired) | `generate.ts:140`, acquired `persona.ts:684` | inside `facet()` for any situation feature (`world.ts:432`); 7 refs in `grammar.ts` | | in 2,685 trait reasons (the worded ones) | drives acts and shows |
| signatures, tension | `generate.ts:87-107` (push facets past 1.2) | 0 after birth | page and tools only | no | shows but drives nothing (beyond the facets they set) |
| persona: humour, voice, quirks, loves | `persona.ts:58-167` | 0 | `quirkLine` swaps everyday wording; `joke()` writes events | in lines | shows but drives nothing |
| persona: sore spots, fears, pride, rules | `persona.ts:618` | become acquired if-thens and selfStory via `sync` `persona.ts:679-691` | | "touchy about..." lines | drives acts and shows |
| variability | `generate.ts:184` | in every softmax: `tau = 0.035 + 0.065*v` `decide.ts:183`, noise `grammar.ts:292` | | never | drives acts but is hidden |
| reactivity, constitution | `generate.ts:223-224` | 0 | stress gain `world.ts:746`; illness risk `body.ts:24`, health target | "a weak constitution" 9 | drives acts (indirectly) but is hidden |
| drive | `generate.ts:206` | 2 (`projects.ts:109`, `time.ts:223`) | | "the kind who goes after things" and kin, 24 | drives acts and shows |
| selfBias | `generate.ts:190` | 0 | no reader anywhere | no | neither |
| presentation | `generate.ts:185-189` | 0 | `social.ts:195` (what observers read of manner) | no | shows (in what the witness notices) but drives no act of its own |
| stress and sources | `addStress` `world.ts:744`; `stress.ts` (12 workplace and home source kinds, plus event sources such as grief and illness) | 9 (load/worn/own in deadline, obligation, raised, threads, time, steer, yearly) | `strain` situation fires at stress >= 0.45, break at > 0.85 (`strain.ts:15`); habit hazard; perf; health target; illness risk x1.3 above 0.7 | "worn down" 65; sources named on lines | drives acts and shows |
| emotions, mood | see section 2 | 0 | 3 behavioural reads | 49 felt-state reasons (0.7%) | shows but drives (almost) nothing |
| phase ("a closed-off stretch") | `grammar.ts:563` after the `shutout` act | inside `facet()` `world.ts:431` | -1.2 sociability, -0.8 liveliness for 8-16 months | no | drives acts, hidden |
| health, ill | `generate.ts:271`, `body.ts:21,53`, `effects.ts:83` | 0 | perf `work.ts:38,43`; pursuit effort x0.3 `time.ts:501`; habits skipped `time.ts:999`; retirement odds `work.ts:70`; gates `obligation.ts:71`, `request.ts:15`, `offer.ts:21`, `yearly.ts:16` | "health had worn down" 15, "age N" 50, "poor health" 2; the illness lines | drives acts (through gates and other systems) and shows (on the illness and death lines only) |
| savings (money) | `build.ts:108`, `coarse.ts:261`, heirs `body.ts:145` | 8 (collection, effects, love, projects, request, risk, steer, temptation) | | 98 ("money is fine" 55, "short of money", "in debt", etc. 43) | drives acts and shows |
| job, lead, jobSince | `work.ts` | 0 weighed | 25 situation gates in `situations/`; two acts need a job (`families.ts:119,468`) | job-loss and retirement lines | drives acts and shows |
| age, sex, attraction, pstat | `generate.ts`, `build.ts:63` | 0 | gates, pronouns, romance eligibility | "age N" 50 | gates only |
| partner, kids, parents, friends, circle, group | `romance.ts`, `social.ts`, `group.ts` | 0 weighed (they set the `family`/`friend` features and pick targets) | 100+ gates | in event lines | drives acts and shows |
| bonds: like, respect, trust | `remember()` in `world.ts` | 54 `bondC` | | 612 (8.2%), worded as feelings ("thinks the world of", "can't stand") | drives acts and shows |
| secrets | `grammar.ts:550` (6 acts flagged secret) | 0 | one situation (`discovery.ts:16`) | "carrying something nobody knew" 63 (never says what) | drives acts and shows, but without content |
| tried (last time) | `learned()` | 1 (`lastTime`, `request.ts:43`) | about 90 cooldown reads | "worked last time" and kin, few | drives acts (as a cooldown) and shows |
| threads | `threads.ts:60` | 0 | notice and answer situations; thread cost removes friends | "has not been herself for months", "came through it" | drives acts and shows |
| promises | `obligation.ts:27` | 0 | 1 situation | in lines | drives acts and shows |
| owes, lastProvoked | declared `world.ts:253,257` | 0 | no reader (`lastBreak` is read once, `strain.ts:15`) | no | neither |

### 1b. The 25 facets (24 HEXACO plus altruism)

All 25 drive acts and appear in reason text (worded motives in `src/motives.json`, 25 facets x high/low x per-family variants). The trait class (worded facets, if-thens and love ways) is 36.0% of all reasons (2,685). Wiring: `FAMILY_FACETS` (20 families, 16 facets), `ACTIVATION` (14 features, 14 facets), 258 `prefers` weights, 73 direct `facetC` sites, 18 if-then templates.

| Facet | Families wiring it | Features | If-then | `prefers` | Direct `facetC` | Pack reasons |
|---|---|---|---|---|---|---|
| socialBoldness | 1 | 2 | 2 | 33 | 8 | 152 |
| modesty | 2 | 3 | 1 | 24 | 6 | 263 |
| altruism | 4 | 1 | 2 | 29 | 1 | 258 |
| sincerity | 4 | 0 | 2 | 19 | 2 | 103 |
| gentleness | 3 | 1 | 1 | 20 | 1 | 211 |
| sociability | 2 | 0 | 1 | 16 | 4 | 65 |
| prudence | 1 | 3 | 0 | 11 | 7 | 24 |
| flexibility | 2 | 2 | 1 | 11 | 2 | 61 |
| diligence | 0 | 0 | 0 | 8 | 9 | 112 |
| anxiety | 0 | 3 | 1 | 6 | 7 | 62 |
| dependence | 2 | 1 | 0 | 9 | 3 | 70 |
| patience | 2 | 2 | 3 | 9 | 2 | 134 |
| forgiveness | 1 | 0 | 1 | 9 | 4 | 114 |
| fearfulness | 2 | 2 | 1 | 8 | 1 | 22 |
| organisation | 2 | 1 | 1 | 10 | 0 | 250 |
| sentimentality | 1 | 2 | 0 | 8 | 1 | 120 |
| fairness | 2 | 1 | 1 | 7 | 0 | 91 |
| greedAvoidance | 0 | 1 | 0 | 6 | 1 | 63 |
| socialSelfEsteem | 0 | 2 | 0 | 3 | 3 | 12 |
| inquisitiveness | 1 | 1 | 0 | 3 | 3 | 27 |
| perfectionism | 0 | 0 | 0 | 3 | 2 | 9 |
| liveliness | 0 | 0 | 0 | 4 | 0 | 104 |
| aesthetic | 0 | 0 | 0 | 1 | 2 | 13 |
| creativity | 0 | 0 | 0 | 1 | 2 | 104 |
| unconventionality | 0 | 1 | 0 | 0 | 1 | 11 |

Pseudo-facets: `love:*` (8 ways of loving and fighting, `love.ts:225`) and `attach:home`. Facets drift: `grammar.ts:569` adds 0.01 x plasticity per chosen act that matches a facet weight of 0.8 or more.

## 2. Feelings

### 2a. Every `addEmotion` call (50 call sites, 41 keys)

An emotion is `{key, label, v (signed mood hit), until, cause}`; a repeat with the same key replaces the old one (`world.ts:759`). Months are given as written.

| Key | Label | v | Months | File:line |
|---|---|---|---|---|
| recovered | back on their feet | +0.08 | 4 | body.ts:18 |
| ill | frightened by their own body | -0.18 | illness (3-11) | body.ts:76 |
| regret | left it too late with X | -0.15 | 12 | body.ts:178 |
| grief<id> | grieving X | -(0.32 partner, 0.22 child, 0.4 parent, 0.1 friend) x (1+0.3 sentimentality) | 30, 14, 36, 8 x (1+0.3 sent.) | body.ts:183 |
| rebuffed | turned away by X | -0.10 | 4 | drama.ts:445, time.ts:870 |
| found | exposed | -0.15 | 8 | drama.ts:473 |
| shame | ashamed | -0.12 x z01(fairness) | 4 | effects.ts:73 |
| ill | shaken | -0.15 | illness | effects.ts:94, danger.ts:36 |
| perf | still buzzing / humiliated at the open night | +0.15 / -0.15 | 6 | effects.ts:138 |
| helped | grateful | +0.10 | 6 | effects.ts:274 |
| ill | banged up | -0.08 | illness | effects.ts:386 |
| group | something starting with G | +0.12 | 8 | group.ts:177 |
| glow | still full of the night G played | +0.08 | 2 | group.ts:270 |
| show | still buzzing / the show that went wrong | +0.12 / -0.12 | 5 | group.ts:628 |
| notpicked | passed over | -0.10 | 6 | group.ts:775 |
| groupend | G is over | -0.10 x (1+0.3 sent.) | 10 | group.ts:826 |
| thrown | humiliated | -0.18 | 10 | group.ts:905 |
| wed | newly married (both) | +0.20 | 18 | romance.ts:52,53 |
| love | in love (both) | +0.15 | 6 | romance.ts:114,115 |
| breakup | divorced / heartbroken | -0.06 (the one who left), -0.12 dating, -0.20 married | 8 / 18 | romance.ts:143 |
| baby | a new baby (both) | +0.18 | 12 | romance.ts:195,196 |
| left | left by X | -0.20 | 18 | migration.ts:71 |
| miss<id> | misses X | -0.05 | 6 | migration.ts:114 |
| homesick | homesick | -0.1 x home.like | 18 | migration.ts:117 |
| want<kind> | a long want fulfilled / lost | +0.20 / -0.20 | 12 | time.ts:133 |
| setback | back to square one | -0.10 | 4 | time.ts:592 |
| gaveup | something let go of | -0.15 | 8 | time.ts:709 |
| lost<key> | misses the <attachment> | -0.15 x (1+0.3 sent.) | 12 | time.ts:1095 |
| praised | recognised | +0.10 | 6 | yearly.ts:30 |
| yearly key | proud of the day / embarrassed about the day | +0.12 / -0.10 | 6 | situations/yearly.ts:86,89 |
| refused | turned down | -0.15 | 8 | projects.ts:341 |
| planfailed | K came to nothing | -0.18 | 12 | projects.ts:374 |
| opened | something of their own | +0.25 | 12 | projects.ts:520 |
| night | the night went well / badly | +0.20 / -0.15 | 8 | projects.ts:590 |
| friend<id> | a new friend (both) | +0.06 | 6 | social.ts:448,449 |
| hate<id> | can't stand X | -0.03 | 999 | social.ts:505 |
| sober | sober, and proud of it | +0.08 | 12 | stress.ts:106 |
| thread | X has given up on him/her | -0.12 | 8 | threads.ts:245 |
| fired | humiliated | -0.2 - 0.05 x (-modesty) | 10 | work.ts:76 |
| promo | proud of the step up | +0.15 | 10 | work.ts:132 |
| passed | passed over | -0.12 | 8 | work.ts:174 |
| hired | glad of the work | +0.08 | 5 | work.ts:300 |
| retired | restless without the work / enjoying the quiet | -0.08 / +0.08 | 18 | work.ts:420 |

Sign: 22 keys negative only, 13 positive only, 6 either.

### 2b. Everything that reads emotions or mood

| Reader | File:line | What it changes |
|---|---|---|
| `mood()` = 0.5 + 0.06 liveliness - 0.05 anxiety + sum(active v) - 0.35 stress - 0.1 if ill, clamped 0-1 | `world.ts:765` | computed on demand, never stored |
| the page "Now" panel: mood number and "On their mind" labels | `app.ts:346-351` | display; the only reader of `mood()` |
| `habitTick`: any `grief*` emotion | `time.ts:982,1001` | habit-break hazard x3.5 (x0.5 for family habits); the grief label becomes the break's reason |
| `habitTick`: `baby` emotion | `time.ts:984,1004` | hazard x3 for solo and social habits |
| `hate<id>` | `social.ts:502-520` | gates a repeat "can't stand" event; removed when like rises above -0.1 |
| `homesick` removal | `migration.ts:184` | housekeeping |
| expiry | `stress.ts:18` | housekeeping |

No act choice, consideration, situation match or gate reads an emotion or the mood. Grief reaches decisions by a second route: `grief()` also adds stress with a named source (`body.ts:184`) and, for partner and children only, queues the `loss` situation (`body.ts:130,136`; `raised.ts:124`).

### 2c. What the engine can and cannot tell apart

- **Can tell apart, and acts on:** stress by named source (12 kinds) through the `strain` situation, which offers anger, withdrawal and seeking whatever the source was; liking, respect and trust toward one named person (`bondC`, with feeling words); acquired fears and sore spots (if-thens on a facet under a feature, `persona.ts:679`); a closed-off stretch after shutting someone out; grief and a new baby, but only as a habit-break multiplier.
- **Can tell apart, but only for the page:** 41 emotion labels (frightened, ashamed, grateful, humiliated, heartbroken, homesick, proud, embarrassed...). They differ in label and sign. Nothing reads the label.
- **Cannot tell apart:** anger from grief, in any state. There is no anger state. Anger is an act family (11 acts, offered in 8 situation types) pulled by patience (-1) and forgiveness (-0.5), and, where a situation wires a `like` consideration to it (contest, strain, drama, projects, provocation, love), by dislike of the target. Grief is a negative mood number, a +0.3 stress source called "grief for X", a habit multiplier, and the `loss` situation, whose only acts are seeking (`confide`, `call`) and withdrawal (`work`, `shutout`, `numb`, `skip`), capped at intensity 0.7. A grieving person who reaches a `strain` situation chooses among the same acts as a person stressed by money.
- **No state at all:** guilt (`p.owes` is declared at `world.ts:257` and never read), fear as an occurrent state (`fearfulness` is a trait; "frightened by their own body" is a mood number), shame (an emotion with a mood hit, `effects.ts:73`), pride (the `pride` family is driven by the modesty facet, not by any earned pride), envy, jealousy, contempt-as-feeling, joy as a driver.
- Parents and friends who grieve get an emotion and stress, but no `loss` situation (`body.ts:139-143`).

## 3. Act vocabulary

20 families, 115 acts (`families.ts`), offered by 38 situation entries found by pattern (several share a type); 16 non-social `decide()` sites sit beside them (migration 3, steer 5, projects 2, time 2, drama 2, romance 1, stress 1).

| Family | Acts | Situations offering it | Facets wired (`FAMILY_FACETS`) |
|---|---|---|---|
| humility | 12 | 9 (authorship, contest, criticised, groupstrain, love, provocation, reachout, row, turneddown) | modesty +0.8, patience +0.5, flexibility +0.4 |
| anger | 11 | 8 (contest, criticised, love, provocation, row, strain, threat, turneddown) | patience -1, forgiveness -0.5 |
| withdrawal | 11 | 10 (answer, confide, loss, love, newcomer, reckon, request, row, strain, effects) | sociability -0.8, dependence -0.5 |
| dishonesty | 8 | 5 (asked, authorship, hometruth, temptation, threat) | fairness -1, sincerity -0.6 |
| pride | 8 | 8 | modesty -1, flexibility -0.4 |
| duty | 8 | 5 (deadline, obligation, pitch, stay, yearly) | organisation +0.8 |
| generosity | 6 | 3 (backing, collection, effects) | altruism +1 |
| refusal | 6 | 3 | altruism -1 |
| lapse | 6 | 6 | organisation -0.8 |
| warmth | 6 | 5 (authorship, effects, newcomer, notice, support) | gentleness +0.6, altruism +0.5 |
| seeking | 5 | 6 (answer, confide, loss, reckon, request, strain) | dependence +1 |
| honesty | 5 | 4 (asked, hometruth, reckon, temptation) | fairness +0.8, sincerity +0.6 |
| courage | 5 | 4 (danger, risk, standup, stay) | fearfulness -0.8, socialBoldness +0.6 |
| caution | 3 | 3 (danger, risk, standup) | fearfulness +0.8, prudence +0.5 |
| openness | 3 | 2 (chance, offer) | inquisitiveness +0.8 |
| reluctance | 3 | 2 | sentimentality +0.8 |
| leniency | 3 | 3 (judgement, oldwound, threat) | altruism +0.7, gentleness +0.5 |
| severity | 3 | 2 | gentleness -1 |
| disclosure | 2 | 1 (discovery) | sociability +0.7, sincerity -0.5 |
| discretion | 1 | 1 | sincerity +0.6 |

Each situation offers 2 to 4 families (up to 5 considerations per option plus the identity consideration). Choice is softmax with `tau = 0.035 + 0.065 x variability`; the act within the family comes from `pickExpression` (facet `prefers` plus noise). Six acts carry `secret: true` (`skim`, `liecover`, `blame`, `allfine`, `whisper`, `whisperplan`); all six are in the dishonesty family.

## 4. What reaches the page (round 40 busiest pack)

### 4a. The 25 most frequent act lines (names and numbers normalised to X and N)

| # | Count | Line |
|---|---|---|
| 1 | 70 | X found a friend in X. |
| 2 | 57 | X and X became friends. |
| 3 | 54 | X and X are friends now. |
| 4 | 42 | X and X have become friends. |
| 5 | 41 | X and X stopped seeing each other, and that was that. |
| 6 | 38 | X and X lost touch. |
| 7 | 36 | X and X are on speaking terms again. |
| 8 | 33 | X and X drifted out of each other's lives. |
| 9 | 33 | X and X picked up where they had left off. |
| 10 | 30 | X told X everything, the parts nobody else knew. |
| 11 | 30 | X went to X and apologised. |
| 12 | 29 | The summer festival that X put on was the best night the town had had in years. |
| 13 | 24 | X told X to count him in for the summer festival. |
| 14 | 23 | X kept turning up at X's door with something or other. |
| 15 | 22 | X was back to normal with X, as if what X did a few months back were forgotten. |
| 16 | 22 | X went to X and offered to put the old business behind them. |
| 17 | 22 | X finally told X what had been kept back. |
| 18 | 21 | X owned up to a mistake at work. |
| 19 | 20 | X had left the wallet at home when the hat went round for X. |
| 20 | 20 | X had promised X to pay it back by the end of the month, and did it. |
| 21 | 20 | X was back to normal with X, as if what X did last year were forgotten. |
| 22 | 20 | X told X what X wanted to hear. |
| 23 | 20 | X put a note in the hat for X, and not a small one. |
| 24 | 20 | X told X how bad things had got. |
| 25 | 19 | X started trying to put things right with X, and tells everyone. |

The 25 lines hold 766 of 3,429 lines (22.3%); there are 1,079 distinct normalised lines. Friendship start and end lines alone (1-9) are 404 (11.8%).

### 4b. Reasons in brackets (7,450 across 3,369 lines)

| Class | Reasons | Share | Lines with at least one |
|---|---|---|---|
| trait (worded facets, if-thens, love ways) | 2,685 | 36.0% | 2,183 |
| event (a past event cited) | 1,879 | 25.2% | 1,639 |
| state (circumstance) | 1,666 | 22.4% | 1,468 |
| bond feeling (thinks the world of, can't stand...) | 612 | 8.2% | 587 |
| want | 289 | 3.9% | 277 |
| skill | 138 | 1.9% | 138 |
| self-story | 128 | 1.7% | 128 |
| felt state ("it hit hard", "frightened by their own health") | 49 | 0.7% | 49 |
| value | 4 | 0.1% | 4 |

Naming a trait or a feeling (trait + bond feeling + felt state + self-story + value): 3,478 reasons (46.7%). Naming only an event or a state: 3,545 (47.6%). Wants and skills: 427 (5.7%). By line: 2,479 of 3,429 (72%) carry at least one trait or feeling reason; 746 (22%) carry only event or state reasons; 60 carry no bracket. The most common state reasons: "together since N" 117, "they stopped seeing each other" 106, "carrying something nobody knew" 63, "money is fine" 55, "age N" 50, "not worn down" 50.

### 4c. Repetition of the same act line within one version

Names removed: 444 (version, line) pairs occur two or more times. The median count over all lines is 1; among repeated lines it is 2 (mean 2.27). Top five: 8 ("X and X are friends now", P10 A), 7 ("X told X to count him in for the summer festival", P22 A), 6 ("X and X lost touch", P17 A), 6 ("X and X became friends", P10 A), 5 (the festival "best night" sentence, in five versions). Names kept: 149 exact lines repeat, median 2, maximum 5 (the festival sentence about the same person). 312 of 3,429 lines (9%) belong to an exactly repeated line. The page already folds repeats and adds "(It was the third time since 2028)" notes, so these are counts after folding.

## 5. Faults the pilot found

| | Fault | Where | Cause | Smallest fix |
|---|---|---|---|---|
| a | "carrying something nobody knew" never names the secret (63 times as a reason; 71 lines contain the phrase) | `situations/discovery.ts:36`; the secret event `se` is in scope at `:17` | the label is a fixed string; the Instance has no `cause`, so `grammar.ts:388` falls through to `stateCause(inst.causeLabel)`. The secret's text is an act (took a little from X, lied to cover Y, let Z take the blame) held in `w.events[sid]` | add `cause: sid` to the Instance (`grammar.ts:388` then cites the event, and the page prints it under the line). Design call, marked as such: it shows the reader what the person kept back |
| b | repeated strokes (pilot: 10 in one version; the pack's maximum is 3, Toby and Rose Lane, so 10 is not reproduced here) | `body.ts:23,42-51` | risk per month is `0.0009 x exp((age-45)/14) x (1.3-0.3 constitution) x 1.8 if drinks x 1.3 if stress > 0.7`; the only brakes are no new illness while ill and a 9-month gap from the last onset. `lastIll` is one slot, overwritten each time, and the "another stroke" wording keeps matching `/stroke/`, so a stroke chain never ends while illnesses arrive within 48 months. No counter, no cap. Expected onsets from 60 to death, ignoring downtime: about 4.8 at constitution 0; a drinker with constitution -2 and stress above 0.7 has about 3.4 times that rate | keep a count in `lastIll`; after the second, change the consequence (a lasting loss of health target, early retirement through `work.ts:70`, a mark) or end the chain. Illness consequences today: health -0.2 to -0.4 relaxing at 8% a month; ill 3 to 11 months; stress +0.15 (partner +0.12); mood -0.1 and -0.18; performance -1; pursuit effort x0.3; habits skipped; mortality x2.2; a `loss` situation; nothing permanent, nothing that grows with the count |
| c | reasons that cite a death without saying who the dead person was to the subject (97 reasons contain "died"; e.g. "Steve Moore died of a sudden heart attack, aged 63" on a friend's visit to Rose Lane) | `body.ts:130,136` (`loss(..., '@id died')`), `raised.ts:137-138` (`loss`) and `:153` (`support` has `cause` but no `causeLabel`), `grammar.ts:388` | an event cause prints the event's own text, which has no relation word; `causeLabel` is used only for threads, where it gives "came through it, after 10 months of Ellen Baker died" (ungrammatical, pack line 186) | pass a relational label to `loss()` (`her husband Steve Moore died`), give `support` the same `causeLabel`, and let `grammar.ts:388` use it when the cited event is a death. The death event's `who` already lists the close kin (`body.ts:114`) |
| d | "no longer first in at work" with reason "no work to go to" (13 lines in the pack, 7 with that reason; the retirement line sits one line above) | `time.ts:1006` (`if (h.kind === 'work' && !p.job) hz = 1`), `:1010-1013` (reason string), `:961-978` (`breakHabit`, cause at `:971`) | the habit breaks the month the job goes, with a state cause that restates what the retirement or sacking event already said; `breakHabit` receives only the grief cause as `ref`, never the job-loss event | pass the retired/fired event as `ref` for `h.kind === 'work'`, or do not emit the line when the cause is the job loss itself |
| e | "buried herself in work" after retiring (pack: Sean Ash 2034 after retiring 2032; Rose Lane's thread lines cite the act in 2032 and 2034 after retiring in 2029 and 2030) | `families.ts:172-185` (the `work` act has no `onlyIf`; the two acts that need a job have `onlyIf: p => !!p.job` at `:119,468`); offered by `loss`, `discovery`, `request` (`only: {withdrawal: ['work', ...]}`) | a retired person (`jobSet(w,p,null)` in `retire()`, `work.ts:398`) still gets the act with `prefers diligence`, so the reason reads "will not leave a job half done". Round 41 added a words-only patch (`grammar.ts:426`, default on): text becomes "kept herself busy from morning to night" when `p.job == null`; the act, its stress relief and its diligence reason are unchanged | `onlyIf: p => !!p.job` on `work` and a retired-person act in its place (this changes behaviour, so it is an experiment, not a neutral change) |

## Findings

1. **Feelings are decoration.** Of 50 `addEmotion` sites and 41 keys, nothing that chooses an act reads an emotion or the mood. `mood()` has one reader, the page panel (`app.ts:346`). Two keys change behaviour (`grief*`, `baby`, as habit-break multipliers) and one gates a repeat event (`hate*`). Emotions reach the reader only as 49 "felt state" reasons (0.7% of 7,450).
2. **The engine cannot tell anger from grief as states, and has no guilt, fear, shame or pride that pull differently.** Grief is a mood number, a "grief for X" stress source of 0.3, a habit multiplier and (for partner and children only) a `loss` situation limited to seeking and withdrawal acts. A grieving and a debt-ridden person at `strain` choose among the same acts. Anger is a family pulled by patience and forgiveness. `p.owes` (apology owed) is declared and never read.
3. **What does steer acts is traits, bonds and stress.** Facets are 36.0% of reasons and 258 `prefers` weights; bonds (54 sites, feeling words) are 8.2%; stress with named sources has 9 weighed sites plus the `strain` situation. Judgement: these three already work as "feeling" in the player's eyes, which is why bonds and stress read best.
4. **The page is samey for three measurable reasons.** The top 25 normalised lines are 22.3% of all lines, and friendship start and end alone are 11.8%. 47.6% of reasons name only an event or a state, and 22% of lines have no trait or feeling reason at all. Within one version, 444 lines occur two to eight times. Judgement: the vocabulary is wide (115 acts) but is spent on few situation types; 5 of 20 families appear in two or fewer situation types (disclosure, discretion, openness, reluctance, severity), and generosity, refusal, caution and leniency in three.
5. **Several properties do work nobody can see, or none.** Values (10 sites, every want's origin) are named in 4 reasons; aptitudes, variability, reactivity and constitution are never named. `selfBias`, `owes` and `lastProvoked` have no reader. `dims`, `signatures`, `tension` and `presentation` drive no act after birth. Humour, voice, quirks and loves change wording only. Health, illness and age enter no weighed choice; they act through performance, retirement, habits and effort.
6. **Five faults are all located and small.** (a) and (c) are one-line label fixes at `discovery.ts:36` and `grammar.ts:388`. (d) is a missing `ref` in `habitTick`. (e) is a missing `onlyIf` on `work`; the round 41 patch rewrites the words but leaves the act and its reason. (b) is a missing counter in `lastIll`: illness has nothing that grows with recurrence, so ten strokes read as ten copies. The pack does not reproduce ten; the code allows it for a weak-constitution drinker.
7. **Judgement on what to add.** The cheapest route to different pulls is a small set of feeling states that choose which families a situation offers and weights, read from what already exists: grief (death, loss), anger (a wronged bond), fear (danger, illness, acquired fears), shame (fired, found out, humiliated) and pride (promotion, praise). The 50 existing sites already say which event gives which feeling, with a sign and a length. They would need a kind, a target and a reader. Properties to cut or merge first: `selfBias`, `owes`, `lastProvoked`, `signatures` as a stored field, `presentation` if observers keep reading true manner.
