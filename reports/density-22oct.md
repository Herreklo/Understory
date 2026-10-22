# Event density and reach, 22 October

`./run.sh src/tools/diag/density.ts run 9001 9020 && ./run.sh src/tools/diag/density.ts report`: 20 throwaway worlds (diag), default model, the usual 30-year past, 8 present years, the town at 81 ±4 people (all ages). Definitions are the consequence map's (`src/tools/consequence-defs.ts`): weighty is `w ≥ 0.8` and not texture; a turn is an event of a kind in `TURNS`; a consequence is a weighty descendant within three years; reach is people in weighty descendants outside the source's own. **Known**: the witness is in the record's `knownBy` or is one of the event's people, read at the end of the run (as the app counts it). **Could know**: known, or public, or one of its people or knowers is someone the witness knows (bond familiarity > 0.25, the line `witness.ts` uses). In a town of 81 that tier is loose: it covers 88% of weighty events. The witness left one world (9009) after 54 months, and that world stays in.

| Per 100 people a month (mean ±95%)                             | All         | Known      | Could know  |
| -------------------------------------------------------------- | ----------- | ---------- | ----------- |
| Weighty events                                                 | 13.55 ±0.61 | 6.83 ±0.58 | 11.92 ±0.68 |
| Turns (99% are themselves weighty)                             | 3.76 ±0.23  | 2.86 ±0.24 | 3.61 ±0.22  |
| Weighty events that lead to a turn (first 5 years, followed 3) | 1.49 ±0.17  | 1.04 ±0.13 | 1.37 ±0.16  |

**Overstory's unit**, in a town of 81: 2.52 ±0.10 weighty events a week, of which the witness knows **1.27 ±0.10**. That matches their count of about one. Knowable _turns_ come to 0.53 ±0.04 a week (known) and 0.67 ±0.04 (could know). This also matches the build plan's figures from round 41's map: about 11 weighty a month and about one leading to a turn.

**Most knowable turns are not consequences.** Of the turns the witness could know, 42% cite an event, and only 34% have a weighty ancestor within three years. The other two thirds arise on their own: a friendship forms or cools, someone is hired, a want is achieved. By their own kind, they are `friends` 30%, `cooled` 12%, `want:achieved` 9%, `hired` 7% and `mended` 5%.

**Where the consequence turns come from.** The table counts knowable turns descending from each part of the model. A turn with two sources counts for each. About 1,850 in all:

| Part                         | Sources /100/mo | Turn   | Reach    | Knowable-turn share | Kinds that carry it                                               |
| ---------------------------- | --------------- | ------ | -------- | ------------------- | ----------------------------------------------------------------- |
| Friendship                   | 2.02            | 27%    | **0%**   | **36%**             | `apologise` → `mended` (99% turn), `cooled`                       |
| Drama (positions, rivals)    | 0.63            | 37%    | 24%      | 20%                 | `promoted` (78% turn, 64% reach), `stepdown` (80%, 94%), `passed` |
| Work                         | 0.77            | 17%    | 16%      | 8%                  | `retired`, `hired`                                                |
| Couples                      | 1.57            | 7%     | 5%       | 8%                  | `married`, `split` (62% reach)                                    |
| Life                         | 0.74            | 8%     | 9%       | 5%                  | `death`: 62% turn, **88% reach, 4.1 people**, but 0.05 /100/mo    |
| Plans (go ahead)             | 0.05            | 100%   | **100%** | 4%                  | `plan`: 5.4 people reached each                                   |
| Wants                        | 1.48            | 4%     | 3%       | 3%                  | `want:achieved` as a source: 0% consequence                       |
| Groups                       | 0.31            | 8%     | 10%      | 2%                  |                                                                   |
| **Obligation** (promise due) | 0.24            | **0%** | 0%       | **0%**              | known to the witness 3% of the time                               |
| Loss / support               | 0.58            | 0–2%   | 0–1%     | <1%                 |                                                                   |

## What it says about phase A's order

The plan bets on "consequences that reach" first: obligation, then shared hardship. The data splits that bet in two.

- **Obligation is the weakest place to start.** Today it produces no turn and no reach, and the witness knows 3% of its events. A promise coming due happens privately and ends there. Building obligation means building turns and their visibility from zero. Requests and asks are no better: 4% turns, no reach.
- **Shared hardship has a working template.** Death is the one blow in the model that reaches. 88% of deaths reach someone beyond the dead, 4.1 people on average, and 62% lead to a turn. Death is rare, though. Blows people survive (`loss`, `support`, `strain`, `danger`) reach almost no one. A blow that binds or splits the people it hits would generalise what death already does. Lead arc 1 with it.
- **Close ties make the most knowable turns but no reach.** Friendship repair and cooling carry 36% of consequence turns, and none of them leave the pair. Arc 2 raises the count a player can act on, but not exit point 2.
- **Reach comes from positions.** Promotion, step-down, plans and arrivals reach people outside the pair, through a role or a venture others depend on. That is organisations' ground (arc 3), and the data gives it a stronger case than the plan does.
- **Wants stay last.** They are a dead end as sources (4% turn, 3% reach), though `want:achieved` is itself 9% of knowable turns.

**Verdict:** keep reach first, but lead arc 1 with shared hardship and leave obligation until it has a visible calling-in. For knowable turns alone, close ties win. For reach, positions and organisations beat obligation. Two thirds of knowable turns are not consequences at all. A consequence arc lengthens the chains behind the other third, so it moves the knowable-turn rate only if its blows and calls end in turns of their own.
