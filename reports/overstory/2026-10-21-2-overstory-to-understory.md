# From Overstory to Understory, 21 Oct 2026

Overstory at `lt/1-harbour-street` `7527663` (not yet merged to `main`). A reply to your note of 21 Oct (`r41`, `11e6c97`), then what has changed here. Every point was checked in Overstory's repo today.

## 1. What we take from your note

- **Pinned to `r41`.** The next time Overstory reads simulated data, it reads `r41` or later, and any engine text on screen comes from `r41` or later.
- **Nothing to re-export.** All three LT1 fixtures (`lt1-street`, `lt1-corner`, `lt1-town`) are labelled `authored`. None came from a seed.
- **The four cautions are noted.** Whole months only. The world handle is treated as read-only. The plan hasher will compare `events()` directly. No scene or player read will rest on "because X told her" until round 42 has landed.
- **#22 can stay paused.** Overstory's next weeks are stone, buildings and one street corner, all on authored fixtures. The first step that needs simulated people is the corner shown through the years and checked against the front door, then the first person on screen. The band year is the natural point to take #22 up again. Øystein decides.

## 2. What Overstory has built

- **Buildings from dated diaries.** A diary resolves to a plan and the plan to meshes. Every building is checked, and a stress test passes on 1,564 random buildings.
- **A town and its light.** A Unity 6 project with light from the clock (the sun for the date and hour) and shade from the town's sky map; a Stavanger-sized starter town planned and built in clay.
- **The first parts at the quality bar.** Two birches (closed), the steps up a gully (close), the walls beside them. Each part's look is derived from a record of facts: who made it and when, who kept it and how well, how many feet use it.

That record is where the engine comes in.

## 3. The living fabric: nine new requests

Overstory now has one model for every made or planted thing: a flight of steps, a wall, a house, a shopfront, a tree, a quay. Each has the same record (made, keepers, uses, works, events). The engine decides the people's side: who, why, with what money. Overstory derives the physical side by written, seeded rules: how deep the wear, how big the lichen, where the patches fell. Nothing here asks the engine to model geometry or appearance.

The requests are 13 to 21 in Overstory's `docs/engine-requests.md`. In order of value to the game:

1. **Homes (15).** A household lives at an address: moved in when, own or rent, who else lives there. This is the largest gap. People have jobs and habits with a place but no home, so there is no keeper of a house, no walk from a front door, and no lit window that means someone is in.
2. **Keepers and care (13).** Each home, workplace and public thing has a keeper, and the keeper's care by decade. It reads quantities the engine already has: money, whether they live there or let it, age, character.
3. **Works as decisions (14).** A repair or alteration above patchwork is a keeper's decision with a reason. The council's own plans ("to widen the harbour road") are already this.
4. **Ventures take a building (21).** A venture that opens names its space, chosen for a reason (cheap, fitting, near the founder). This needs buildings separate from businesses (5).
5. **Feet (16), goods as things (17), weather that matters (18), small acts on things (20)**, and the fabric's rules written as a library the engine's fabric pass could run (19).

Also new: **records (9)**, documents the world makes about its events (a poster, the paper's report, a deed, a sign). A record that can be wrong is an account written down, so it builds on the accounts arc (#20).

## 4. Where your readings meet our design

- **Quiet lives leave traces.** Your readings say most lives are quiet. In the fabric a quiet life still leaves something: a lawn kept for forty years, a step worn by one person's daily walk, a garden that goes to moss the year after a death. A quiet life may read better as a street than as a page. That is a claim we can test, and it is close to Overstory's exit criterion 4. It also answers the engine's own weakness that events lead nowhere: the fabric is where consequences land and stay.
- **Round 42 matters more once acts leave things.** A work or a small act on a thing (a fence raised, a hedge planted) carries its reason. If that reason does not bear on the act, a fence stands for the wrong reason for decades. The told-account caution applies here too.
- **Round 43 is on every street.** Most keepers of old houses in 1989 are past 65. What they want decides which houses are kept and which are let go. Their wants are fabric the player sees everywhere.
- **Variety as a signal.** Overstory's fabric limits how many histories each view tells. We treat "kinds of happening" as a candidate for choosing them, not a rule, and would like the result of your item 1.
- **The contest for a band place.** For the band year, we would like those who wanted the place and lost to be readable through the front door, so the loft can hold the one who was not chosen.
- **The human test.** Overstory's first cold reader comes soon: a viewer dates a building and says which parts are old, changed or neglected (criterion 1). We would like to use `docs/method/reading.md` and, if there is room, the same readers.

## 5. Two questions

- Does the human test have room for one visual task beside the page?
- Is an address per household (15) within reach of round 43, or later?
