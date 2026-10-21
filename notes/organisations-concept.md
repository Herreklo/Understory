# Organisations: a concept

A concept for groups and workplaces that have a character of their own and keep it when their members change. Ideas only: nothing here is built, and nothing here changes the engine until a round takes it on. The exit criterion's ninth point (`docs/STATUS.md`, merged 20 October 2026) names the goal; this note is one way to reach it.

## The question

What does a group hold that none of its members holds, and how does it survive turnover?

Seven of the game ideas need an answer (`notes/game-demand-map.md`): the band, the hotel, the festival, the production company, the union, the scene and the rival institutions. The stories players tell about organisations are about exactly this: "that club always sells its best player", "nobody lasts as drummer in that band", "the paper never printed anything against the mill".

## What exists today

A group (`src/group.ts`) has members, a founder, its works, standing, chemistry, former members, a memory of its rows and warnings, recruitment, replacement and break-up. A workplace is a place (`src/setting.ts`: the mill, the harbour, the paper, the council and others) with roles, a skill and a cap, and hiring weighs regard.

What none of them has is a character. Chemistry is computed from the people in the group now, so a group is exactly its current members. The one thing that looks like a group habit, the row escalation (a second row in three years earns a word, a third an asking-to-leave), is the same in every group.

## Culture is norms, held by members

A **norm** is a group's expected answer in a kind of situation it meets: "we hear each other out", "we don't take outside money", "the founder has the last word", "mistakes are covered for, never reported".

A norm has no existence apart from its members. Each member holds a belief about it, with the same Gaussian form as every other belief in the engine: how strongly the group expects that answer. The group's norm is the spread of those beliefs, weighted by how long each member has been there.

This is the central choice, for three reasons. There is no hidden group mind, so a group never becomes one giant personality. A norm survives exactly as long as people carry it. And the engine already has every piece needed to learn, hold and show a belief.

## How a norm acts

Inside the group's own situations (who to take on, money, a row at rehearsal, a mistake at work, who decides), a member's belief in the norm is a consideration for the expected answer. It is weighed like any other, at most a factor of 1, and scaled by how attached the member is: years in the group and liking for the others.

It is given as a reason in the group's voice: "the band had always heard each other out", "at the paper you did not print that". A member can act against it. Then the reason says so ("though at the mill nobody ever reported anyone"), and others see it.

## Where norms come from

- **Founding.** Where the founders' traits and values agree on an answer, it starts as a weak norm. A group founded by the conscientious starts orderly; one founded by the bold starts reckless.
- **A moment.** A weighty, public situation answered one way becomes "how we do things here": a member caught with the takings and thrown out, a night when everyone stayed to help. It works like a person's marks: likelier the weightier and more public the moment.
- **Repetition.** The same answer given three times in three years in the same kind of situation becomes a norm, as pressure answered the same way becomes a phase for a person.

## How a norm passes on

- **Learning by watching.** A newcomer learns a norm from what members are seen to do, through the witness's machinery. Evidence counts more the further the act is from what the town usually does, so a group's distinctive habits are learned fastest. This path needs nothing that does not exist today.
- **Being told.** A long-standing member can tell a newcomer how things are done. This would use accounts that travel, which the engine does not yet have (rounds 29 to 31 were not kept). The design works without it; telling would make norms pass on faster and let them be passed on wrong.
- **Fit.** Groups recruit people who fit their norms, and members whose own inclinations run against a norm feel the strain and are likelier to leave. Over time members become more alike than the town. This is the attraction–selection–attrition idea from organisational psychology, where homogeneity within organisations has been measured but the effect is modest. The engine should show it modestly, not as a sorting machine.

## Why a norm lasts, or doesn't

When confederates set an arbitrary norm in a laboratory group and were then replaced one by one with newcomers, the norm decayed back toward what newcomers would judge on their own. The further the norm sat from that natural answer, the faster it decayed: a moderately arbitrary norm still held about 70% of judgements four generations on, and a strongly arbitrary one about 5% (MacNeil & Sherif 1976, following Jacobs & Campbell 1961).

The design above produces that shape without a decay setting. Each member acts on their own inclinations plus the norm. When a norm is far from what members would choose anyway, their acts stray from it more often, so newcomers see weaker evidence and hold a weaker belief. Each generation inherits less. A norm close to the members' nature passes on almost whole; an arbitrary one fades within a few turnovers, unless fit keeps recruiting people who agree with it.

This is a prediction the engine can be tested against before anyone reads a page. It is a shape taken from research, not a realism claim.

## Breaking and drifting

- **Broken in public.** An act against a norm by a respected member is strong evidence against it, and the norm weakens in everyone who saw it. That is a story: "after Ben took the label's money, nobody pretended anymore".
- **Drift.** Old members hold older beliefs. When the group's practice has moved, an old member's line on the page says so: "it used to be different".

## The group's own account

A group has a short self-story: its two or three strongest norms and the moments they came from. This is what the group says about itself, and it can differ from what members now do. When the account and the practice part, the group is living on its reputation, which a player or a journalist can find out.

A cold reader should be able to say what a group is like in one sentence from its self-story and its record.

## Workplaces

The same mechanism serves a workplace. The members are the people who work at the place, its norms are about the job (how mistakes are handled, whether people cover for each other, what the paper prints, how the council decides), and its binding is contractual: leaving costs a wage, and selection is the hiring decision that already exists. This is what the hotel and newspaper ideas need.

## What a player would see

- A norm named on the page, with the moment it came from.
- A newcomer who changes the group, or is changed by it.
- A norm broken in public, and what followed.
- An old member saying it used to be different.
- Two groups doing the same thing in opposite ways, for reasons the player can trace.

## How it could be tested

1. **Turnover.** Run groups and workplaces until every founder has gone. In their own kinds of situation, do they still choose more like their own past than like other groups? Norms close to the members' nature should hold; arbitrary ones should fade within a few turnovers.
2. **The group adds something.** With norms off, the same people choose the same way whatever group they are in. With norms on, the group shows in their choices.
3. **Readability.** Inside groups, a witness who holds beliefs about the group's norms predicts members' choices better than one who does not.
4. **The cold read.** A reader can say what four of five groups are like in one sentence.
5. **Consequence.** A norm must decide things: a set share of decisions inside groups has a norm as its top reason, passing the counterfactual check. Otherwise it is cut.

## Where it fits

Its natural first home is the band-for-a-year experiment (`docs/STATUS.md`, proposed work 8), where close ties, living changing people and a group's character can be tested together. The row escalation is the cheapest first norm: the same rule, made each group's own. Learning by watching comes first; being told waits for accounts that travel.

At city scale, a background organisation would hold each norm as one number, given out as members' beliefs when it comes into focus, as `docs/scale/contract.md` requires. Three norms per organisation is enough.

## Risks

- **A group as a giant personality.** Avoided by holding norms only in members' beliefs, and worth checking: no group's norms should decide more than its members' own traits do.
- **Norms that decide nothing.** The consequence test above cuts them.
- **Rule 8.** A norm is about how a group acts in a situation, never about who may belong.
- **Cost.** A belief per member per norm, at most three norms per organisation, is small next to bonds.

## Open questions

- When a band splits, does each half keep its norms, and do they drift apart?
- Can one person carry a norm from one group into another, such as a manager who moves clubs?
- How does a group's reputation outside it form, and can it differ from its self-story? This needs accounts that travel.
- What happens to someone in two groups whose norms conflict?

## References

- Schneider, B. (1987). The people make the place. *Personnel Psychology*. The attraction–selection–attrition framework. Summary: https://aura-lab.siue.edu/theories/attraction-selection-attrition-framework/
- MacNeil, M. K. & Sherif, M. (1976). Norm change over subject generations as a function of arbitrariness of prescribed norms. Includes the account of Jacobs & Campbell (1961). https://brocku.ca/MeadProject/Sherif/Sherif_1976a.html
