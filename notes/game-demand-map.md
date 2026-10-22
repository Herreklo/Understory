# Game demand map

Which engine capabilities the game ideas need, and therefore which engine work unlocks the most games. Ideas come from the open notebook of 20 October 2026: its seven familiar ideas and twenty seeds. Capability status is read from the repo (`docs/STATUS.md`, `SUMMARY.md`).

The map is descriptive. It ranks engine work by how many ideas would use it; it never ranks or rules out a game. A game *needs* a capability when it would not be that game without it. Every game also needs the front door (`src/boundary.ts`: reads of what the player could know, player commands), so it is left out of the counts. The marks are judgement, not measurement.

## Three layers

Every idea draws on three layers of the world, in different mixes:

- **Substance:** what really happens. People develop, learn, build ties, make things, form organisations, meet opportunities and live with consequences. A band manager who knows everything about a musician still faces real problems of money, time, practice and chemistry.
- **Knowledge:** what anyone believes about it. People see different things, remember imperfectly, tell stories and sometimes deceive.
- **Agency:** what the player can do in it. Each game gives its own commands, goals and ways of finding out what matters.

In the engine, substance is the record and the people (TRUTH), knowledge is the witness and accounts (FELT), and agency is the front door.

## Capabilities

| Code | Layer | Capability | What it means | Status | Exit point |
| --- | --- | --- | --- | --- | --- |
| C | Substance | Consequences that last and reach | Events that change where someone lives, works, who they see, what they want, and reach people outside them | Weak: 22% lead anywhere, 6% reach outsiders | 2 |
| T | Substance | Inner life of close ties | Friends, family, colleagues and bandmates with more than liking | Partners and rivals only | 1 |
| P | Substance | Ventures, causes and deciders | Plans with backers, opponents and someone who decides | Built, thin: a café rarely opens | 2 |
| O | Substance | Organisations | Groups with norms, resources and an identity that outlives their members | Missing; no exit point names it | none |
| B | Substance | Background and generations | Family, class and upbringing; what passes down | Missing beyond inherited traits | proposed work 7 |
| G | Substance | Potential and growth | Aptitude becoming skill through exposure; life changing people | Partial: skills from exposure; life moves people 3% | 8 |
| W | Substance | Wants and pursuits | Goals pursued through the town's doors, with obstacles | Partial: 62% of adults pursue nothing | 2 |
| V | Substance | Rivalry and succession | Contenders, grudges, heat that cools | Built: 22% of adults have a rival | 1 |
| M | Substance | City scale | A city of 100,000 on the same people model | Not met | 7 |
| R | Knowledge | Reading people | Beliefs about a person learned from what they were seen to do, apart from the truth | Built; holds (+5.5 on the key slice) | 6 |
| A | Knowledge | Accounts that travel | A belief about a specific act, with a source, passed on and bent | Next: round 31 | 2, 6 |
| H | Knowledge | Records and traces | Documents, artefacts and physical evidence with provenance | Overstory's lane; the engine supplies the event record | none |
| S | Agency | Story sifting | Finding storyful sequences in the record as they unfold | Not built | proposed work 4 |
| X | Agency | Clean counterfactuals | The same world from a choice, branched so only what follows from it differs | Built (`whatif.ts`, `clone.ts`) | none |
| L | Substance | Leverage | Debts, favours and fear as reasons someone says yes when asked, and passes an ask on | Missing | none |

## What each idea needs

| Idea | Needs |
| --- | --- |
| Band manager | R, G, T, W, O |
| Football manager or agent | R, G, T, W |
| Detective | R, A, C, H |
| Newspaper | A, C, S, R |
| Hotel or business | T, O, P, R |
| Life simulation | T, W, C, R |
| World observer | S, C, B, X |
| 01 Festival programmer | P, R, G, O |
| 02 Academy | G, W, R, B |
| 03 Casting and production | R, T, O |
| 04 Neighbourhood mediator | A, P, R, V |
| 05 Town politics | A, P, C, M |
| 06 Heritage restoration | H, B, C |
| 07 Archivist | B, H, A |
| 08 Museum curator | A, S, H |
| 09 Union representative | O, T, P, A |
| 10 Scene-builder | O, G, C, P |
| 11 Matchmaker and host | R, T, A |
| 12 Travel writer | S, C, R |
| 13 Fixer | R, A, T, W |
| 14 Family legacy | B, A, C, V |
| 15 Crisis coordinator | C, T, P, M |
| 16 Counterfactual observatory | X, C, S |
| 17 Social archaeology | H, B, A, C |
| 18 Many-lives anthology | C, B, T |
| 19 Radio producer | A, S, R |
| 20 Rival institutions | O, P, V |

## Demand against status

| Capability | Ideas that need it (of 27) | Status | Leverage |
| --- | --- | --- | --- |
| R Reading people | 14 | Built | Keep it holding |
| C Consequences | 13 | Weak | **High** |
| A Accounts | 12 | Next | **High** |
| T Close ties | 10 | Missing beyond partners | **High** |
| P Ventures and deciders | 8 | Thin | Medium |
| O Organisations | 7 | Missing, no criterion | **Medium, unowned** |
| B Background | 7 | Missing | Medium |
| S Sifting | 6 | Not built | Medium |
| G, W, H | 5 each | Partial / Overstory | Lower |
| V Rivalry | 3 | Built | Low |
| X, M | 2 each | Built / not met | Low for games; M is a criterion in its own right |

## What it says

**Substance is where the engine is weakest.** 25 of the 27 ideas need at least one substance capability, and 19 need two or more. The knowledge layer is the most widely shared single mechanism (20 of 27 ideas need reading people or accounts) and the one that already works best. Lives that change little, consequences that stop early and ties without inner life hold back more ideas than anything in the knowledge layer.

**Consequences are the most-needed capability that is weak.** Thirteen ideas depend on events changing lives and reaching other people. Accounts carry part of the reach; wants and pursuits carry the rest, and "who wants things" (proposed work 1) is not on the current priority list.

**Close ties are the most-needed capability that is missing.** Exit point 1 already asks for it. The band-for-a-year experiment (proposed work 8) tests close ties, organisations and growth in one setting, and is the origin in `WHY.md`.

**Organisations are needed and unowned.** Seven ideas, from the band to rival institutions, need groups whose identity outlives their members. No exit point asks for it, so no round can build it yet; it can be thought through as a concept now.

**Random lives versus selected ones.** Exit point 5 asks whether cold readers find random lives worth reading. A game shows selected lives. Testing the two separately tells apart lives that are thin from a page that shows their thin parts.

## Ideas added later

Not in the counts above, which cover the notebook's 27.

| Idea | Needs | Source |
| --- | --- | --- |
| Inquest: a ghost works out the holes that lined up to kill them, then closes one | A, H, X, C | Overstory, 22 October 2026 (requests 11, 14–16; `notes/time-and-moments.md`) |
| The hidden kingpin: find the person who runs others, mostly young people, from three steps away | R, A, O, T, L | Øystein, 22 October 2026 |

**The hidden kingpin.** Someone in the town gets others to do harm for them, through intermediaries, and the player works out who from incomplete evidence. Each recruit has their own reason for saying yes (money, a debt, an older sibling, fear, wanting to belong), and understanding why one said yes leads to the next link. Pressure reshapes the network: a removed middleman is replaced, someone gets out, someone talks. Multiplayer shapes: the kingpin as a hidden player acting only through the town's people (as in Scotland Yard); a traitor among the investigators who uses true evidence; players as families pulling their own child out. Precedents: Covert Action (1990), whose generated networks became a recognisable template; Shadow of Mordor's Nemesis hierarchy; and Rain World's scavengers, who hold one reputation of the player per region, built from gifts and killings and acted on with tolls and ambushes. A shared opinion is far more readable to a player than many separate ones, and the kingpin needs one: what the network believes about who talked.

It needs three things to hold:

- The kingpin is not the most connected person: they hide among ordinary ties (family, work, the football club), or players solve the graph instead of the people.
- The kingpin lives in the town and can be reached.
- Who leads and who is recruited never follows origin or ethnicity (Rule 8), and the game is fictional and names no real case.

Leverage (L) is the new capability. It would also serve town politics (05), the union representative (09) and the fixer (13), and the kingpin is the hardest test of organisations (`notes/organisations-concept.md`): a group whose head stays hidden and which outlives its members.

## Decisions for the owner

1. Whether "who wants things" returns to the priority list after accounts.
2. Whether the band-for-a-year experiment moves up, as the test of close ties.
3. Whether the exit criterion should name organisations.
4. Whether exit point 5 should also be judged on selected lives, beside random ones.
