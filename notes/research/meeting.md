# Feelings meet their object

_Research for P4 (`notes/build-plan.md` section 4), 26 October 2026, on `main` at `f28cc65` with round 44's feelings turned on (`ON=feelings`). Throwaway worlds 9001–9024, ten present years (twenty for demography). Scripts and full output: `notes/research/sources/meeting-scripts/` (`meet.ts`, `why.ts`, `demog.ts`, `analyse.py`, `analyse-out.txt`). Figures are a mean per world with its 95% interval between worlds, or pooled where said. No engine file was changed, no fresh world was run and nothing was read._

## In short

- **They already meet. The feeling is muted.** Within a year of a resentment, holder and object decide something with each other in 95% of cases. The holder does so in 83%, but the resentment is weighed in only 14%. In 62% of the holder's decisions with the object, it is muted by round 44's v4 rule: "a feeling does not weigh where its cause is the event the situation answers". Most of those are the immediate answer to the wrong, where muting is right. But 247 are the old wound (`oldwound.ts`), the one situation built to bring the wronged back to the wrongdoer months later, and there the rule mutes 84% of the resentments the meeting is about.
- **No feeling changes an act toward its object.** Of the resentments, guilts and gratitudes reaching 0.3, **0.9% ±0.4** change an act toward their object within a year: the holder decides with the object, and removing the feeling flips the answer.
- **The door is a matcher, not the queue.** In 87% of the months when a feeling could raise a meeting, the holder has no other matched situation. A raised meeting would compete in 13% of them and displace about 14 decisions a world-decade in 1,785, under 1%. The queue avoids that but skips the scheduler's cap, so the queue stays the door for the object's answer.
- **Recommendation on round 44's code: fold it into P4.** Make one round, "feelings that meet their object", behind the `feelings` switch, with one primary counter. Do not read P1 alone, and do not start again (below).
- **Demography is not a cause.** On 24 paired worlds over twenty years, births are 7.5 a world-decade with feelings on and 7.2 off (+0.3 ±0.8). The failure on CI's six worlds is a fragile check meeting six different towns.
- **Estimate, shrunk: about 4%** of held feelings changing an act toward their object within a year, against 0.9% today. Stop under 2.5%.

## What the science says

- **Two motives, not one.** A wrong raises two motives toward the wrongdoer, avoidance and revenge, and lowers benevolence. Forgiveness is the decline of the first two (McCullough et al. 1998; the TRIM). It unfolds in three ways that are measured apart: forbearance (they never rise), trend forgiveness (a lasting decline) and temporary forgiveness (McCullough, Fincham & Tsang 2003). The decline is fast at first, then has a long tail. Round 44's resentment already follows this curve: its half-life is three months while strong, then 24.
- **What moves it is the situation more than the person** (Fehr, Gelfand & Nag 2010; 175 studies, 26,006 people). The wrongdoer's intent goes with forgiveness at r = −.49, state empathy at .51, an apology at .42 and state anger at −.41. Victim dispositions matter less (agreeableness about .2). Rumination raises revenge through anger (McCullough, Bono & Root 2007): meeting renews the grudge, which round 44's `meet()` does.
- **People forgive whom they value** (the valuable-relationships hypothesis: McCullough et al. 2010; McCullough, Kurzban & Tabak 2013). Closeness pushes toward repair, and distance toward avoidance or revenge.
- **Approach feelings.** Gratitude draws the holder toward the giver ("find, remind, bind": Algoe 2012) and goes with repaying them (r = .37). Guilt draws toward amends, and shame toward hiding unless the harm can be repaired (g = .47 against −.34; `feelings-and-traits.md`).
- **So a meeting has three answers:** have it out, let it go or keep away for resentment; make amends or not for guilt; thank or repay for gratitude. Which one depends on intensity, on whether the cause still stands and on the relationship's value. Traits move it at the decision sizes the project uses (r ≈ .1–.3): forgiveness and patience against revenge, social boldness against avoidance, anxiety toward it.

## What games did

| Game | What brings the two together | Where it failed |
| --- | --- | --- |
| **Crusader Kings III** | A hook is a held lever on a named person, spent when one wants something of them. Round 44's debt asked first is the same idea. A scheme is a held intent toward one target that progresses month by month. | Hooks and schemes are paced by timers: a strong hook's reuse waits about five years, as players report. Section 2 forbids that pacing. |
| **The Sims** | Wants name a person ("make friends with X"). | Nothing brings the two together. The player must invite the person, autonomy rarely acts on a want, and Sims 4's whims read as random and were replaced in 2022. A feeling with a target is inert without a meeting, which is round 44's finding. |
| **Dwarf Fortress** | Grudges meet by place. Dwarves share one fort and a meeting hall, and talking to the person one holds a grudge against gives a bad thought. | The meeting changes only mood. Mood is what spirals into tantrums, and the grudge never chooses an act toward its object. |
| **Shadow of Mordor (Nemesis)** | The orc who survived comes back to the player: the grudge raises the meeting. | It works because the player is the object every time. It is the one design here where the feeling decides who meets. |

**Inside Understory, round 33's reckoning** was a held state raising a meeting (weight 1.2, a 36-month wait). Readers saw it and preferred the lives without it in 9 of 12 pairs. It recurred where nothing had changed ("Nobody was surprised any more"), 48% of reckonings led to anything, and marriages fell 19%. Its lessons are fail-ifs 2 and 3 below.

## The door

| Holder-months when a feeling could raise a meeting (0.3+, cause standing, object in town, a shared place) | per world-decade | holder's month otherwise empty | a rival at 0.8–0.9 | at 1.0 | above 1 |
| --- | --- | --- | --- | --- | --- |
| resentment | 133 ±18 | 85.5% | 5.0% | 9.0% | 0.5% |
| guilt | 91 ±11 | 83.2% | 5.6% | 10.5% | 0.7% |
| gratitude | 671 ±109 | 87.4% | 3.0% | 8.9% | 0.7% |

- **A matcher** (`situations/index.ts`) leaves the scheduler as it is. If each eligible month raises a meeting with a chance proportional to intensity (c × v), then c = 0.1 to 0.25 gives a meeting within a year to **18% to 35%** of strong feelings (resentment 9% to 20%, guilt 15% to 32%, gratitude 35% to 62%). That is at most 41 to 102 meetings a world-decade; fewer in practice, since a meeting changes its feeling. Weighed by intensity (about 0.8 to 1.2), it displaces at most 14 situations a world-decade and loses to anything weightier.
- **The queue** displaces nothing but runs a month late, outside the one-a-month cap. The cap is grandfathered and not to be changed by a feelings round (section 2), so the queue is kept for **the object's answer**, as with `request-answer` and `reckon-answer`.
- **Redirecting** existing matchers toward the object reaches 2.8% of eligible months. It is too small to be the door.

## What round 44 left

1. **Round 44's code: fold it, don't read P1 alone, don't start again.**
   - Reading P1 alone costs a reading (about 7% of a week's Fable bar). The reading cannot see P1 (0.29 lines a busiest page), and it would guard a mechanism that changes an act toward its object for 1 held feeling in 100.
   - Starting again throws away four passing checks, when the cause of failure is now placed: the meeting gap, and a mute rule wider than the restatement it was written to stop.
   - Folding makes one experiment, not a bundle. P1 holds no claim of its own: it failed its counter and is the substrate. Round 44 never ran as a full round, so P4 is the arc's first.
   - It overrides the plan's branch ("P4 may carry P1's code only if P1 read no worse on its own"). That is the lead's process call, to be recorded with its date in the plan's section 6 before the build.
2. **Demography: a fragile check, not a stop.**
   - On CI's seeds 1–6, feelings on also redraw the thirty past years: world 1 starts with 72 people against 84, and has 780 couple-months against 1,247 and 5 births against 17. Off sits at a ratio of 0.66, 0.06 above the line.
   - On four blocks of six throwaway worlds, the off arm ranges from 0.59 to 0.97. One block fails with feelings off.
   - Paired over 24 worlds, on and off agree. Births are +0.3 ±0.8 a world-decade, deaths +0.1 ±0.6 and marriages −0.1 ±0.6. Splits are −0.8 ±0.5: fewer couples fall below the like at which children are rare (5.9% against 7.8%).
   - A neutral change runs the check on 24 worlds before P4's sizing, with its bar unchanged. P4's sizing reports births, deaths, marriages and splits paired (fail-if 3).
3. **The counter: a held feeling changes an act toward its object within a year.**
   - Of resentments, guilts and gratitudes reaching 0.3, the counter is the share whose holder, within twelve months, decides with the object and the feeling flips that decision. It is computed on round 44's pre-registered machinery (`flip.ts`). Today it is 0.9% ±0.4.
   - It counts per feeling, not per decision weighed, so adding incidental weighings cannot pass it, and it is what a player would see.
   - A round that works clears it because its new decisions are built on the feeling. Where round 44 weighed a feeling as one consideration among many (resentment, for example, in a request), it flipped 11–14% of decisions; the debt called in flipped 40% of confidences. A raised meeting gives the feeling its own answers. Unmuting the old wound changes its reasons more than its acts: where the old wound does weigh a resentment, it flipped 0 of 46, because forgiveness and liking already decide it.
   - Round 44's own counter (flips among decisions weighing the four kinds) is reported beside it. With about 33 meetings a world-decade at about 15%, it moves from 4.95% to about 8%.

## The proposal, for the design job

A resentment, guilt or gratitude at 0.3 or more, whose cause stands, with the object in a shared place, may raise **a meeting** (a matcher). Each month its chance is the intensity times the holder's approach for that kind, from facets, and never a timer, count or quota. Its weight is 0.6 + 0.6 × intensity. Its answers are the kind's own (above). The feeling is the meeting's own consideration, keyed `feel:<kind>` so that `flip.ts` counts it. Every answer changes the feeling: had out halves it, let go ends its standing, kept away lowers the holder's seeking of the object, amends and thanks pay it. So the same state cannot raise the meeting twice. The object answers through the queue. The mute rule narrows to the immediate answer (`provocation`, `row-answer`, `aftermath`), so the old wound weighs the grudge it is about.

**Estimate.** Raised in 18–35% of strong feelings and flipped in 10–25% of those, on top of today's 0.9%: 3% to 10%, centre 5%. Shrunk by a quarter, **about 4%**. Stop under 2.5%, nearly three times today's.

## This fails if …

1. **Feelings still change no act toward their object.** Sizing check: the primary counter, paired with P4's parts off. Stop under 2.5%, and a power check that 24 worlds tell 4% from 2.5%.
2. **The meeting recurs where nothing changed** (round 33). Sizing check: no holder and object meet twice without their feeling changing in between (zero, by construction), and something follows within a year of at least 60% of meetings: a feeling ends or loses its standing, a tie begins or ends, a debt is paid, or a lasting change. Stop under 50%.
3. **It crowds out the rest of a life** (round 33's marriages fell 19%). Sizing check: matched situations displaced at most 2% of decisions; births, deaths, marriages, splits and hires paired over 24 worlds and twenty years, inside the off arm's interval, or named.
4. **Revenge turns into feuds the town does not otherwise have.** Sizing check: round 44's check 4 (wrongs, answers in kind, rows, dislikes, friendships ended per thousand adult-years) inside the off arm's interval, or said with its mechanism.
5. **It reads as a script: every wrong, the same visit.** Sizing check: strong resentments raise a meeting within a year in between 15% and 60% of cases, and the raising rate differs between the holder's top and bottom thirds of forgiveness (and of social boldness, for keeping away) by at least 1.3×. The lines meetings decide add no template to the top 25, and the copy share does not rise.

_Sources: McCullough et al. 1998 (JPSP 75); McCullough, Fincham & Tsang 2003 (JPSP 84); McCullough, Bono & Root 2007 (JPSP 92); McCullough et al. 2010 (Emotion 10); McCullough, Kurzban & Tabak 2013 (BBS 36); Fehr, Gelfand & Nag 2010 (Psych. Bull. 136); Algoe 2012; the games and emotion sources in `sources/feelings-games.md` and `sources/feelings-science.md`; the Dwarf Fortress wiki, "Grudge"; CK3 player reports on hooks (Steam forums); Sims 4 Wants and Fears guides (simscommunity.info, 2022)._
