# Scaling contract

Rules for engine code, so the person model can run a city: about 100,000 people, a few thousand simulated monthly, the rest by a coarse yearly pass. Each rule says why. Code that follows them costs time in proportion to the people it touches, and gives a town exactly what it gives today.

## 1. People meet through settings, never through the town

Any rule that pairs people, or picks someone, draws from a bounded setting:
- household;
- workplace staff;
- school class;
- neighbourhood (about 80 people);
- venue or routine;
- group;
- the person's own ties.

**Why:** a loop over everyone, done for everyone, grows with the square of the population. At 3,000 people it is most of the engine's time. In round 19, school pairs alone were 70,000 contacts a month at 3,000 people.

**How:** use `staffOf(w, job)`, `around(w, p)` and `near(w, ids)`. In a town of one neighbourhood they return the whole town in the engine's order, so nothing changes there.

## 2. No loop over people inside a loop over people

If a step for one person needs others, take them from that person's settings (`around`). The same goes for a step per event: news, reactions, witnesses.

## 3. Looking at a bond must not create one

`bond(w, a, b)` creates an entry. Code that only reads uses `peekBond`, or reads only the people around. **Why:** creating a bond for every adult in town on every ask fills memory with the square of the population and slows every bond loop after it.

## 4. News travels by setting and reach

A public act is heard in the neighbourhoods of those involved, plus their workplaces. **Why:** "everyone hears" means everyone holds beliefs about everyone, and that does not fit in memory at city size. For someone notable, reach will grow with fame. Fame is then a quantity in the world: how far news about you travels.

## 5. Read recent history from the end

Use `recent(w, months)`. Never filter the whole record. **Why:** the record grows with population times years.

## 6. Membership changes go through tracked fields

Changes to someone's job or presence call `moved()`, so the indexes stay right. A new kind of membership (a club, a class, a venue) gets an index, not a scan.

## 7. Dice belong to people

Anything that happens to a background person uses dice keyed to them: world seed, person, year and kind. **Why:** their life must not depend on who else is simulated in full, so a person met in year 20 has the past they would have had anyway.

## 8. Ids must fit a city

Bond keys are `a × 100000 + b`, which breaks past 100,000 people. Use `a × 2²⁶ + b`, which stays exact up to 67 million people. The scale branch does this, and gives each background neighbourhood its own range of ids from 1,000,000 up.

## 9. A rule about one person is written once

A rule that reads and changes only one person goes in a function that takes the person, such as growing older, the body, retirement, or becoming a parent. **Why:** the background lives these rules by the engine's own formulas, by calling the same function. A rule written inline in a loop over the town has to be copied, and a copy drifts. The yearly maturing step is now `mature(w, p)`. Illness and death (`bodyTick`, `mortality`) and retirement should follow.

## 10. Workplaces are asked for by kind

Code that wants a particular workplace asks for a kind in a person's neighbourhood (`placeOf(w, 'bar', hoodOf(w, p))`), never for a fixed id such as `'bar'`. **Why:** a city has one bar per neighbourhood. In a town the kind has one instance with the kind's own id, so nothing changes there.

## 11. The town stays the town

Every scaling change must pass the identity test: on town-sized worlds the branch's run hashes the same as the engine's. That covers every event and who knew it, every bond and every belief. A change that fails it is a change to the model, not to its scale, and goes through a round.
