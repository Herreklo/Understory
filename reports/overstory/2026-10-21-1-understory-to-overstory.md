# From Understory to Overstory, 21 Oct 2026

Engine at `main` `11e6c97`, tag `r41`. This covers what changed since `rH28`, the tag Overstory reads. Every point was checked in the engine's code or docs today.

## 1. The engine's order has changed

Overstory's `NOW.md` says the engine's order is housekeeping, then the accounts arc (#20), then #22 and #23. That is out of date. The engine's plan for the week of 26 Oct (`SUMMARY.md`, "Next, in order") is:

1. a reading that counts every fault (method);
2. the first human test, run beside the rounds;
3. round 42, reasons that bear on the act chosen;
4. round 43, wants for the quiet majority (most of whom are past 65);
5. the band for a year, the milestone the two projects share;
6. housekeeping.

#20, #22 and #23 are paused. LT1 and LT2 stay on fixtures labelled `authored` for longer than planned. Moving #22 up is Øystein's call.

## 2. The same seed now makes a different world

Rounds 40 and 41 were kept and are on by default. Anything exported from a seed at `rH28` will not match `r41`. When Overstory next reads simulated data, pin to `r41` or later, and re-export or relabel any fixture labelled `simulated` that came from `rH28`.

The front door itself (`src/boundary.ts`) has not changed since `rH28`.

## 3. What people now do

On by default since round 40:

- **Wants that answer what happens around them.** A colleague buys a house, a band is seen playing, a blow lands, a round birthday comes.
- **Contests out of season, and for a place in a band.** A band's new member is chosen from those who wanted the place.
- **A blow can change something that lasts.** The blows are a death close by, a break-up, being passed over, or being shamed.
- **People tell a friend what they saw.** It can pass on, bent, and now and then names the wrong person.

For the band and the rehearsal loft, the contest for a band place and the telling matter most.

## 4. The page's words (round 41)

- Spans are said in words: "no progress for two years", "retired from the clinic".
- A repeat says which time it is: "the third time since 2027".
- A friendship's end says what changed: "Tara started at the harbour fleet".
- Lines are checked against the person when said: no "baby at home" for a three-year-old.

If Overstory shows any engine text, take it from `r41` or later.

## 5. Four cautions

These come from an outside review on 21 Oct, checked against the code.

- **`advance` with part of a month runs a whole month.** Pass whole months only. The fix is queued as housekeeping.
- **The handle from `createWorld` is the world itself.** It is cast to another type, so nothing stops a caller changing it when the code runs. Treat it as read-only. The front door's part two (#22) is where a real boundary gets designed.
- **A told account can be cited as a reason by the wrong event.** If an account changed whom someone turned to, any event between those two people that month can cite it, not only the act it decided. Don't build a scene or a player's read on "because X told her" yet. This matters for the first player command ("she remembers being asked").
- **The engine's identity check skips each person's list of events.** This matters only when comparing exports across versions. Compare `events()` directly.

## 6. What the readings say, for the game

- **Readers prefer variety, but it may not be the cause.** Blind AI readers prefer lives in which more kinds of thing happen. It is not yet shown that variety is the cause, rather than length or conflict. For the camera and for story sifting, the number of kinds of happening is a candidate signal, not a proven one. A test that separates the two is item 1 of the engine's plan.
- **Most lives are still quiet.** The busiest lives now read clearly better. A random adult reads only "no worse", and most people's ten years are quiet. Choose who is on screen. Don't assume a random neighbour has a story.
- **A decision's reasons are not always the real ones.** About 70% of the time, the reason the engine gives first actually decided the choice: take it away and the choice changes. Reasons that don't fit the act are the fault readers quote most, and round 42 works on that. This supports Overstory's rule "evidence, not verdicts": show a reason as someone's account, not as the truth.
- **No human has read a life since the third quarter.** The human test is item 2 of the engine's plan and runs beside the rounds. Overstory's exit point 4 is a blind viewer test, so the two could share readers and method (`docs/method/reading.md` in Understory).
