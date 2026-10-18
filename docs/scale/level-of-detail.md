# City scale: level of detail

## The idea

A city of 100,000 people where everyone fully exists, but only a few thousand are simulated month by month. Detail follows what the player could come to know, not where people live. A person the player cannot reach needs to be true, not detailed: every big thing in their life happened and is on record, and the small things are made when someone first looks.

## Neighbourhoods

A city is split into neighbourhoods of about 80 people, roughly one town each, fixed when the city is founded.

- A household lives together. Partners share a home, and children under twenty live with a parent.
- School, routines, hobbies, the company people seek and partners are found inside a neighbourhood.
- A town smaller than about 120 people is a single neighbourhood. Every rule then gives exactly what the town rules give.

## Institutions

Every neighbourhood has its own workplaces: one of each kind the setting has (a sawmill, a school, a bar…), each with the kind's capacity, its own staff and its own leader. A town of one neighbourhood has exactly the setting's places.

- **Work is bounded by the jobs there are.** A workplace with room takes on the best-suited job seeker of its own neighbourhood. In focus, it then looks across the city if nobody local is looking. A venture opens in its founder's neighbourhood.
- **People arrive for jobs.** A slot nobody local can fill draws a newcomer from outside, by the town's rule: mostly young, and a third of those 27 and over bring a family. That is the only way people arrive.
- **A workplace without a leader makes one of its staff leader.** It does so by record, organisation and years there. The town's succession events follow: the promotion, the new leader's first staff meeting, and those passed over.

## Three tiers

**In focus: monthly, every system.** Whole neighbourhoods: the player's own, and every neighbourhood the player's story reaches. That covers the player's circle and two steps out, and anyone a current story touches, such as a rival, a candidate the player is courting or a critic. A typical focus is 1,000 to 3,000 people.

**In view: counterparts.** People outside focus who share a setting with someone in focus, such as a colleague at a big workplace or the bar staff at a regular venue. Full people form bonds with them and learn about them. They make no decisions of their own until their neighbourhood is promoted. (Designed, not yet built.)

**Background: the coarse yearly pass.** Everyone else. They are full people, with traits, values, aptitudes, family and a seed, and status `bg`. The monthly systems act only on people in town, so they pass over them. Once a year the pass lives their year.

## Two kinds of rule in the background

**Rules about one person run by the engine's own formulas.** The background uses the same formulas the town does, month by month through the year:
- growing older: personality maturing, and aptitudes and skill ceilings moving with age;
- the body: health, illness (with the engine's kinds and their follow-ups), and death;
- retirement;
- the part of strain that is the person's own, which rises with illness and eases by the town's rule;
- the steadying that comes with becoming a parent.

Fitted odds would drift from these whenever the population they are applied to drifts, so the background runs the rules themselves.

**Rules that depend on other people are drawn from fitted odds.** In the town these come from bonds and situations the background does not keep, so the background draws them from odds fitted to the full engine:
- finding a partner (then matched within the neighbourhood);
- splitting up;
- having a child;
- leaving the city with the household, or coming home;
- starting and stopping drinking;
- losing a job;
- savings drift.

The odds are fitted by one script (bench/fit.py) from full towns logged year by year: each person's state at the start of a year, and what happened to them during it. The fit is checked on towns it never saw, and refitted whenever the engine changes. Work, arrivals and leadership are neither: they come from the institutions.

Every big event goes into the record like any other, with its time, the people involved, and the weight the town gives that kind of event. A married couple that separates divorces, as in the town. Background events stay private in the record, so no monthly system reads news about strangers. Each also keeps how widely the town would have seen it (`seen`), so it marks a person as it would in the town.

## A background independent of everything outside it

A background neighbourhood's life does not depend on what happens anywhere else. It does not depend on the focus, on other neighbourhoods, or on when anyone is promoted.
- **Dice belong to people and neighbourhoods:** world seed, person or neighbourhood, year, and kind of outcome.
- **Ids and names are its own.** People born or arriving in a neighbourhood take ids from a range of its own, and first names that differ from their neighbours'.
- **Everything it draws from is its own:** partners from its own residents, workers from its own job seekers, newcomers for its own vacancies.

The only couplings are real ones, through family: a parent who dies in focus, or an inheritance.

## The spine and the texture

A background life has a **spine** and a **texture**.
- **The spine** is every big event with its date: birth, family, partnering and splits, children, illness, work, leadership, leaving and coming home, death. It is fixed once lived and never redrawn.
- **The texture** is the small things that make a person known: who their friends are, whom they dislike, their routines, what they have been seen to do. It is not kept in the background. It is made when the neighbourhood is promoted, by replaying the years on the promotion's own dice.

So the same neighbourhood promoted in year 20 or in year 25 has the same spine, but its friendships are drawn afresh. That is acceptable because nobody had seen them.

## Promotion: a neighbourhood comes into focus

When the player's story reaches someone, their whole neighbourhood is promoted together, so everyone in it arrives among the people they live with.

1. **The record stands, and so does the person.** Everything in the spine stays as it is, and so does everything they are now: health, illness, strain, money, work, family, traits. Promotion only adds texture.
2. **The neighbourhood's workplaces come into the monthly world**, with their staff and leaders.
3. **Routines** are drawn from people of the same age in the monthly world: each promoted adult gets as many as someone like them has.
4. **A circle of neighbours** is drawn from the neighbourhood, by the engine's own rule.
5. **The years they lived there are replayed.** The engine's contact rule runs over their settings: home, family, work, school, circle, routines, hobbies, public service and the company they seek. It runs only for pairs that include someone promoted, on the promotion's own dice. The clock is set back to when those months happened, so every rule that counts time sees months: one new friend at a time, memories fading, ties not kept up loosening. A person born or arrived later gets only the months since then.
6. **The clock is put back.** Anything written to the record during the replay is dated to the promotion and marked as backstory, so the record stays in time order.

Personality marks come out by themselves. Sore spots, fears, pride and rules to live by are read from a person's events. Background events are real events of the same kinds: a death, a split, a serious illness, a homecoming, a promotion, being passed over, freezing at a first staff meeting.

**Demotion is not built.** A neighbourhood that leaves the story stays in focus. Moving it back to the background would mean keeping its full state and catching it up when it returns.

## Public news becomes reach

In a town a public act is heard by everyone. In a city, news reaches the neighbourhoods of the people involved, and their workplaces. For a notable person, reach should grow with how known they are. Fame then becomes a quantity in the world: how far news about you travels, and how many people hold a belief about you. (Designed, not yet built.)

## What is lost at coarse detail

- **Small acts and their evidence.** A promoted person arrives with friends and dislikes, but nobody has seen them do anything.
- **Marks from small public moments.** Being shown up, let down or found out leaves a mark only in focus, so promoted people carry fewer marks.
- **Strain from other people.** Grief, loneliness and trouble at home are not lived in the background.
- **Chains between background people.** One person's grudge cannot make another move away; only the fitted odds act.
- **Situations and groups in the background.** No rivalries, collections or rows, and groups exist only through their members' big events.

## How we know it works

1. **Linear cost:** time per month grows about linearly with the number of people in focus.
2. **The town is unchanged:** on town-sized worlds, the scale branch's run hashes the same as the engine's. That covers every person, event, bond and belief.
3. **Coarse matches full:** in a city that is half monthly and half background from its founding, the two halves match after thirty years on age, partnership, children, work and drinking.
4. **The engine's rules hold in the background:** death rates by age match the full engine's.
5. **Capacity holds:** no workplace has more staff than room, every staffed background workplace has a leader, and background staff live where they work.
6. **The background is independent:** two cities from one seed are run with different focus lives and different promotions. Every other background neighbourhood comes out identical, every field and every event.
7. **Promotion changes nothing it should not:** every field of every person is the same just before and just after promotion, except the texture it adds.
8. **Promoted people are indistinguishable** from people always in focus on friends, the friendless share, people known well, routines and partnership. They carry fewer marks from history, about half to two thirds as many.
9. **The twin test:** the same founding is lived twice, once in focus and once in the background and then promoted, and once more only grown older. The same people are then asked the same situations. What counts is the change beyond growing older: how much of what lived experience changes in a person the background keeps.
