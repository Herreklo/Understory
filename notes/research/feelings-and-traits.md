# Feelings and traits

_Research, 22 October 2026, after Øystein's pilot reading. What a feeling should be in the engine, which properties and skills people need, and the rounds that could follow. Exit points 5 (worth reading) and 1 (close ties with an inner life). Evidence: four files in `sources/feelings-*.md` (games, emotion science, traits, a code audit), with every source; names in brackets point into them. Reviewed by Fable 5.1; its four blocking findings are fixed here._

## The problem, in our terms

The pilot found that Rose Lane's acts made sense, but her life was samey and what she felt was never said. The audit says why:

- **Feelings are decoration.** 50 `addEmotion` sites write 41 kinds, and no act choice, consideration or situation reads one. `mood()` has one reader: the page panel. Only grief and a new baby change anything, as habit-break multipliers, and `hate<id>` gates one repeat event.
- **There is no anger, guilt, fear, shame or pride as a state.** Anger is an act family pulled by patience. A grieving person and an indebted one meet `strain` with the same acts. `p.owes` is declared and never read. On the page, felt states are 0.7% of 7,450 reasons, and 47.6% of reasons name only an event or a state ("Steve Moore died"; "age 63").
- **What works as feeling today is bonds and stress:** liking, respect and trust toward a named person (54 sites, 8% of reasons) and stress with named sources. They read best because they have an object.

So the engine has the slots and the wording sites, and nothing behind them. A person's 25 facets reach the page through one good-or-bad number and a handful of answers.

## What games teach

Thirteen systems are in `sources/feelings-games.md`, among them the Sims 4, RimWorld, Crusader Kings III, Dwarf Fortress, Football Manager, Versu, Prom Week, the EMA and GAMYGDALA models, and the Nemesis system. Six rules follow, each drawn from more than one of them:

1. **A kind earns its place only through acts it alone pulls toward.** Dwarf Fortress has 130 emotions, and 10 have a behaviour; GAMYGDALA changes no act by design; Sims 4 emotions unlock the player's menu, not the Sim's choices. _Our figure, not a study's:_ at most three families per kind, one of them its own.
2. **The response follows cause, target and whether the person can do anything, never size.** RimWorld picks a break by severity, so the letter blames "ate without table" in a firefight. CK3 and EMA choose by trait and by control.
3. **Two layers.** Feelings with a target act; mood has none, and only bends. One summed bar made RimWorld and Dwarf Fortress samey.
4. **Cap and group.** One feeling per kind and target, the strongest kept, so an irritation cannot dilute a death. _Our figure:_ about eight a person, after Dwarf Fortress's 8 + 8 memory slots. Versu keeps one feeling at a time, which assumes scene time; on a monthly clock a new feeling would erase grief.
5. **Habituation and lasting causes,** or the town converges on fine: under 1% of dwarves in well-kept forts are unhappy. Good things fade with repetition, and a feeling tied to a lasting fact holds until the fact changes.
6. **Words with a target and a cause, never meters.** Prom Week's meters invited manipulation, while Football Manager's labels over hidden numbers work. A strong feeling left unresolved changes the person, with its cause and year, as Dwarf Fortress's core memories, CK3's coping traits and Nemesis scars do. These are what players retell.

## The science, used

- **Which feeling** comes from how an event is seen. Does it matter to me? Who caused it? Is it settled or pending? Can it be repaired? Does it break a standard? (OCC; Scherer; Lazarus.) The links are probabilistic: weights that personality moves.
- **What it makes people do** depends more on whether harm can be repaired than on the label. Across 90 samples, shame approaches when the failure is reparable (g = .47) and avoids when it is not (g = −.34). Gratitude predicts repaying the giver (r = .37 across 91 studies). Anger is short-term attack and long-term repair: targets found the relationship stronger after 48% of episodes and weaker after 35%.
- **No episode lasts a month** (median 2–5 hours). What lasts months is a cause that keeps firing: it is still there, its object is met again, it is dwelt on. **So a monthly feeling persists by renewal, not by a timer.** Month-scale data exist only for grief (Bonanno's trajectories), grudges (forgiveness is fast, then has a long tail) and regret.
- **Feelings are news:** 80–95% of episodes are told to someone, most the same day. A feeling is something the town comes to know.
- **Weak spots.** Kinds are design categories, not natural kinds. Action tendencies predict acts weakly. Fear and anger on risk replicated only in part. Month durations other than the three above are extrapolated. Shares come from Western samples: starting odds, never targets.

## Traits

- **Size.** A 1-SD trait difference should move a single decision by r ≈ .1–.3, and a life outcome by .1–.2. Above .5, people become predictable.
- **Feelings are mostly situation.** For forgiveness, the offender's intent (r −.49), an apology (.42) and empathy (.51) outweigh agreeableness (.22). Personality sets four knobs per kind (proneness, intensity, duration, handling); the event does the rest.
- **The knobs, from facets we have:**

  | Feeling | Set by |
  | --- | --- |
  | Anger | low patience, gentleness and flexibility (HEXACO places anger in low agreeableness, not emotionality) |
  | Grief | sentimentality; dependence makes it chronic |
  | Guilt | sincerity, fairness, altruism |
  | Shame | low social self-esteem; it turns aggressive only through blaming others |
  | Envy | low self-esteem in a domain one cares about; low honesty-humility makes it malicious |
  | Worry | anxiety; organisation lowers it |

## Properties and skills

**The test.** A property earns its place only if it:
1. changes a decision, or how someone is read;
2. shares under half its variance with what exists;
3. predicts something that matters at r ≥ .10 beyond the existing set;
4. can be read by a player, or its consequences can, within a year;
5. yields a story the current set cannot;
6. is one number, made from what the person has.

**Cut, in a neutral change:** `selfBias` and `lastProvoked`, which have no reader. `owes` stays, because feelings part one gives it its job; SUMMARY names that round. **Give a job or cut:** creativity and unconventionality, with 13 and 24 references in `src/`.

**Change, each as its own experiment:**
- Values follow traits at r ≈ .55–.6, against modest links in the literature: cap them at .4.
- Skills never decay: lose about half the gain a year unused (physical skills slower), and gain in proportion to practice × (ceiling − rating), which gives plateaus.

**Two general skills belong in the engine,** because every setting has people in it:
- **Reading people.** Its ceiling comes from social insight. It sets how fast and how truly beliefs about another's feeling, intent or honesty update, and who notices grief or a lie before it is said. What others can see is capped by acquaintance. Emotional stability is almost invisible to strangers (self–other r .08) and visible to family (.43); extraversion shows at once (.22). Reading people multiplies that cap; it does not replace it. It is also the player's own task, which makes it the natural test of skill-based play.
- **Keeping one's head.** It starts from patience and low anxiety, and hard feelings lived through with support raise it. It is the handling knob: lashing out, hiding, how long worry lasts.

Self-control is diligence and prudence renamed. A single emotional-intelligence score is unreliable. Persuasion and comforting are setting skills, built on these two.

## The proposal

**A feeling** holds:
- a kind;
- its cause (an event);
- its object (a person, a prospect or the self);
- an intensity;
- whether the cause still stands.

**Each month** it fades at its kind's rate unless renewed, and repeated good things fade faster. A person holds one per kind and object.

**In a situation that involves its object,** a feeling reweights the families offered and **may add its own family to the offer.** That is what lets a griever at `strain` act differently from a debtor; reweighting alone was Versu's failure. The act within the family follows the cause and whether the person can do anything.

**When it decides,** it is the reason, worded with its object: "still sore at Ralph over the expense claims", not "it hit hard". The counterfactual check on the top reason keeps causes from going diffuse, the Prom Week failure. A feeling left unresolved past its kind's horizon becomes a lasting change, with its cause and year. Mood stays as it is, with no object.

**The first four kinds** have a person as object, because a feeling about someone makes a story and a callback:

| Kind | Trigger, from events we already have | Pulls (own family first) | Fades | Knobs |
| --- | --- | --- | --- | --- |
| Grief | a death, a break-up, a lost job or home | reluctance; withdrawal; seeking a few | by trajectory drawn at onset | sentimentality, dependence |
| Resentment | a named person wronged me or mine, unrepaired | severity; anger; withdrawal from them | fast, with a long tail; renewed on meeting; an apology ends it | patience, forgiveness, gentleness |
| Guilt | my act harmed someone I value | humility (apologise); honesty; generosity | ends when amends are accepted | sincerity, fairness, altruism |
| Gratitude | another's costly help, not owed | warmth toward the giver; generosity; duty | until repaid; leaves a bond gain | altruism, sentimentality |

The existing `addEmotion` sites already say which event gives which feeling; they gain a kind, an object and readers. Resentment and guilt use `owes`. Reluctance and severity, two of the five families that today appear in two or fewer situation types, get work.

**Second, if the first is kept:** worry, shame, pride, envy and regret, with keeping one's head. Left out at a monthly scale: anything too brief to cross a tick, endings that are not states (relief, disappointment), and what bonds, needs or mood already hold.

**Estimate.** Wherever a feeling decides, the reason changes by construction. How often it flips the act is unsized; the sizing decides, against fails-if 2.

## Rounds this could become

These are not slotted. The planning step after this research decides what enters "Next" and in what order, with Øystein.

1. **Neutral:**
   - cut `selfBias` and `lastProvoked`;
   - name the secret in "carrying something nobody knew";
   - say who the dead person was to the subject;
   - give the habit line its job-loss event.
2. **Illness that recurs gets worse and counts,** a small fix behind its own switch.
3. **Feelings, part one:** the four kinds, behind `OFF=feelings`. The `work` act gains `onlyIf: job` here, written in BOARD, since `loss` and `discovery` offer it.
4. **Feelings, part two,** if part one is kept. This is the arc's second and last full round before it returns to research.
5. **Later:** reading people, once the accounts arc is back; skills that decay; values loosened. Each is its own round.

## This fails if …

1. **Everyone is always sore at someone.** Sizing check: the share of adult-months carrying each kind, switch on against off. Stop if any kind is active in over a quarter of adults, or if grief-months exceed twice the switch-off count of grief emotions.
2. **Feelings add reasons but change no acts,** as round 32's friendship record decided 0.9%. Sizing check: the share of decisions where removing the feeling flips the family. Stop below 5%.
3. **It adds a new repeat.** "Still sore at Ralph" eight times in a life is the old problem in new words. Sizing check: the repeat share and the top-25 share (on the audit's normalisation, 22% today) must not rise.
4. **Resentment escalates into feuds the town does not otherwise have.** Sizing check: rows, ended friendships and retaliation per thousand adult-years stay inside the switch-off interval, or the round says plainly that it changes them, and through which mechanism.
5. **Readers still cannot say what was felt.** Sizing check: every line a feeling decided names the kind and the object, on all sizing pages.
