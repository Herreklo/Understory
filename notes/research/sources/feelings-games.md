# Feelings in games and agent systems: what they did, where it went wrong

[n] is a source below; "(inferred)" marks my reading, not a source's claim. *Monthly* marks a lesson that survives a monthly tick; *real time*, one that assumes a fast clock.

## The systems

**The Sims 4 (2014).** *State:* about 16 emotions (happy, sad, angry, tense, embarrassed, flirty, inspired…) in three intensities, set by moodlets that each carry one emotion, a weight and a timer of hours; the emotion with most points wins [2,4]. Sentiments, one-sided feelings toward a particular Sim, came only in 2020 [5]. *Changes:* unlocks emotion-only interactions, speeds matching skills (an angry Sim trains harder), a few emotional deaths [4,6]. *Seen:* plumbob colour, moodlets with cause and timer, walk and face. *Failed:* it drives the player's menu, not the Sim. PC Gamer saw no uncontrolled Sim in 30 hours "make a bold decision because of their emotions", and found the needed emotion easy to farm [1]. Moods flip on roughly four-hour timers and décor keeps Sims happy; the best-known fix mods add inertia and strip décor happiness [2,3]. **Shallow, spammy, saturated.**

**RimWorld.** *State:* one mood bar, 0–100: a base plus 350+ thought types. Memories last set times (a dead son, −20 for 30 days, up to 10 copies at ×0.75); situational thoughts last while true (ate without table, −3) [7,8]. *Changes:* below 35/20/5% a break fires on average every 4/0.8/0.5 days, drawn from that severity's pool (sad wander, binge, tantrum, berserk) weighted by traits, then Catharsis +40 for 3 days; above 50%, inspirations typed by skill passion [9,10]. *Seen:* every thought with number and timer; the break letter names a "final straw". *Failed:* breaks are picked by severity, not cause, so the letter blames the last trifle: players report "ate without table" as final straw mid-firefight and call breaks unrelated [11,12]. Sylvester's defence is apophenia: players supply meaning [13]. **Unexplained, blind to cause.**

**Crusader Kings III (2020).** *State:* up to three personality traits, each setting nine AI values (Compassionate +200 compassion) [15]; stress 0–400 in three levels [14]. *From:* acting against one's traits (a Compassionate ruler executing a prisoner: +42 in the dev diary), deaths of those close, prison, torture [14,16]. *Changes:* each new level fires a mental-break event whose options depend on traits: a coping trait (drunkard, flagellant, reclusive) or more stress; level 3 can bring lunacy, murder, suicide; at most one break per five years [14]. *Seen:* a stress bar; trait-marked options (observed). *Failed:* one number for the cost of disobeying yourself. A reviewer calls it a straitjacket for shy characters, whose every sway adds stress, and wants a penalty that builds over time [17]. Paradox advised picking coping traits strategically [16], turning vice into a build (inferred). **Mechanical, gameable.** Strength: trait, act and cost are readable before the choice.

**Dwarf Fortress (0.40, 2014 on).** *State:* 50 facets, 33 values, needs; 130 working emotions, each paired with its circumstance (annoyed after an argument) [18,19]; 8 short- and 8 long-term memory slots, one per category, strongest kept, relived through the year; core memories shift facets, shown with cause and year [20]. *From:* personality turns each thought into an emotion, so one event moves two dwarves differently. *Changes:* every emotion feeds one hidden stress number through a fixed divider; only 10 of 130 have their own behaviour at high stress (anguish: lie down crying; terror: flee) [18,21]; breakdowns run from tantrum to insanity [21]. *Failed:* labels over one number: ~120 emotions are flavour (inferred from [18]). Saturated: a community sample of 300 dwarves in well-kept forts was 45% happy or better, 55% fine, under 1% unhappy [21]. Invisible: the wiki says facets' wider effects are not understood [19]. Repeated tragedy desensitises a dwarf in three shown steps, ending in "doesn't really care about anything anymore" [22]. **Samey, invisible, saturated.**

**Football Manager.** *State:* hidden 1–20 personality attributes (professionalism, ambition, pressure, temperament, controversy, loyalty, sportsmanship), morale on a word scale, a happiness breakdown, dressing-room hierarchy and social groups [23,25]. *From:* playing time, promises, results, team talks, media [25]. *Changes:* training, performance, reactions, transfer requests; upsetting one player can turn his group [25]. *Seen:* never the numbers: personality labels (Model Professional) and media-handling styles (Volatile, Reserved) that map to hidden ranges, some masking others; staff reports, body language [23,24]. *Failed:* press conferences repetitive and inconsequential (2013) [26], still conceded to seem so in 2024 [27]; single players' team-talk reactions read as random [28]; FM21 added gestures and clearer body language [29]. **Spammy surface over few states.** Strength: hidden traits read through labels and reactions, the nearest model of learning people from incomplete evidence.

**Versu (Evans and Short).** *State:* one emotional state at a time from a fine Ekman-based set (embarrassed ≠ humiliated); a new one overrides; each remembers target and cause (annoyed with Brown, for his insult); the previous state is kept for mood-change rules [30]. *From:* acts, above all reactions; every dialogue line carries emotional effects. *Changes:* utility choice among what concurrent social practices offer. *Seen:* a portrait per state; clicking shows who and why [30]. *Learned:* agents scoring only a handful of options behave alike however differently they score, so each act must move several qualities; a shared public mood (shock at a body, opening grief, closing jokes) was wanted but never built [30]. A 20-minute episode took 1–2 months to write; cancelled 2014 [30,31]. **Content-hungry.**

**Prom Week / Comme il Faut.** *State:* 3 directional networks (buddy, romance, cool), 34 expiring statuses, some aimed (angry at, has a crush on), 44 traits, a labelled history [32]. *Changes:* volition is a weighted sum of 5,000+ influence rules; dialogue cites past events [32]. *Seen:* ranked wishes, meters. *Failed:* Ryan finds causality under utility scoring too diffuse to narrate, citing Prom Week [34]; a reviewer: change read off meters, unclear what depression does, visible reactions make play manipulation [33]. **Too many states, diffuse causes.**

**PsychSim / Thespian.** *State:* no emotion store: POMDP agents with weighted goals, beliefs, recursive models of others; five appraisals (relevance, congruence, accountability, control, novelty) read off decision-making [35,36]. *Changes:* utility maximisation; emotion is a by-product (inferred). *Seen:* generated explanations raised human trust from 5.4 to 6.2 of 7 and mission success from 65% to 92–96% [37]. *Failed:* recursion is costly, so models of others are simplified; goal weights must be fitted [35]. **Costly, authored through weights.**

**Talk of the Town (Ryan).** *State:* Big Five; per-pair charge and spark (−100..100); a grieving flag set on widowhood, cleared only by remarriage; beliefs that spread, mutate, fade and are lied about [38]. *Seen:* testimony. *Failed:* affect barely modelled; story value came from beliefs. Ryan: uncurated simulation reads like a debug log [34]. What people believe and hide mattered more than shades of feeling (inferred).

**GAMYGDALA.** *State:* 16 OCC emotions, eight about own goals (hope, fear, joy, relief…), eight social (gratitude, anger, pity, gloating…); exponential decay; summed into a pleasure-arousal-dominance mood [39,40]. *Changes:* nothing, by design [39]. *Failed:* no norms branch, so no pride, shame or reproach apart from goals [40]; it leaves the hard step, feeling to act, to every developer (inferred).

**FAtiMA.** OCC emotions with a threshold and decay per type (personality as emotional bias), mood −10..10; drove FearNot!'s bullying role-play. Its authors say the character-centred approach loses predictability and scales poorly to an author's goal; the toolkit moved to explicit dialogue structure [41].

**EMA (Marsella and Gratch).** Appraisal per proposition (desirability, likelihood, who caused it, controllability) mapped to hope, joy, fear, sadness, anger, guilt, surprise; mood is the untargeted, slow aggregate that only bends coping. Controllability picks coping: high, plan or seek support; low, wishful thinking, distancing (caring less about the goal), reinterpretation, shifting blame. Its OCC mapping was revised after testing against human data (anger needs controllability); it needs a hand-built domain model [42].

**Shadow of Mordor, Nemesis (added).** Orcs remember meetings with the player, carry scars, taunt with callbacks; de Plater built detail only at anchors players remember, like being killed, and let players fill gaps [43]. A feeling with a face, a target and a past event is what players retell.

## Lessons

1. **A kind of feeling earns its place only through acts it alone pulls toward.** Dwarf Fortress: 130 emotions, 10 behaviours; Sims 4 emotions unlock menus; GAMYGDALA outputs labels; Versu: different scorings over few options converge. Rule: each kind raises at most three act families (my figure; no study sets it), at least one no other kind raises; a label with no act of its own is wording. *Monthly.*

2. **Choose the response by cause and target, never from a pool by size.** RimWorld's severity pools read as unrelated; CK3 picks break options by trait; EMA picks coping by controllability and blame. Rule: response depends on kind, target, controllability, traits; size only decides whether to respond. *Monthly.*

3. **Two layers: feelings aimed at someone, which act; a mood aimed at no one, which only bends.** Versu, CiF's aimed statuses, the Sims' belated Sentiments, Nemesis, EMA. One summed bar made RimWorld and Dwarf Fortress samey. *Monthly*, but Versu's one-state override assumes scene time: monthly, a fresh irritation would erase grief, so hold several aimed feelings.

4. **Cap and group; strongest wins.** Dwarf Fortress: 8 + 8 slots, one per category; RimWorld: stack caps, ×0.75 per copy. Rule: about 8 live feelings per person, one per kind and target, so irritations cannot dilute a death. Caps are *monthly*; hour-long thoughts (ate without table, décor) assume *real time*: do not port them.

5. **Habituation and lasting feelings, or the town converges.** Dwarf Fortress's well-kept forts: under 1% unhappy; Sims happy by default; RimWorld counters with expectations that rise with wealth [7]. Rule: good things fade with repetition; a feeling tied to a lasting fact (loss, betrayal) holds until the fact changes or the person copes. *Monthly*: Dwarf Fortress's year of reliving and CK3's five-year break cadence are slow-clock designs already.

6. **Show feelings as words and acts, never meters; the player infers the number.** Versu's click-for-why, FM's labels over hidden traits, PsychSim's explanations work; Prom Week's meters and Sims moodlet numbers became manipulation and farming. Rule: report each feeling with target and event in the person's terms; never show magnitudes. *Monthly.*

7. **Few kinds; add one only when readers can tell it apart.** Prom Week's 34 statuses over 5,000 rules diffused causes; Dwarf Fortress's facets have unknown effects; FAtiMA retreated to authored structure. Rule: start near six kinds; add one only when a blind reading separates it from its neighbours. *Monthly.*

8. **A strong feeling left unresolved should change the person, with cause and date.** Dwarf Fortress's core memories (shown with cause and year), CK3's coping traits and Nemesis scars are what players retell. Rule: past a set horizon, an unresolved feeling becomes a trait shift or habit recording its origin. Native to a monthly clock.

## Sources

1. PC Gamer, *The Sims 4* review (2014). https://www.pcgamer.com/the-sims-4-review/
2. roburky, Emotional Inertia Classic (Sims 4 mod), design notes. https://roburky.itch.io/sims4-emotional-inertia
3. roburky, Meaningful Stories (Sims 4 mod). https://roburky.itch.io/sims4-meaningful-stories
4. SimsCommunity, The Sims 4 emotions guide (2022). https://simscommunity.info/2022/10/08/the-sims-4-emotions-guide/
5. SimsCommunity, Sims 4 update of 10 November 2020 (Sentiments). https://simscommunity.info/2020/11/10/the-sims-4-pc-console-new-update-november-10th-2020/
6. Game Developer, "The art of injecting emotion into The Sims 4" (Ryan Vaughan interview). https://www.gamedeveloper.com/design/the-art-of-injecting-emotion-into-i-the-sims-4-i-
7. RimWorld Wiki, Mood. https://rimworldwiki.com/wiki/Mood
8. RimWorld Wiki, Thoughts list. https://rimworldwiki.com/wiki/Thoughts_list
9. RimWorld Wiki, Mental break. https://rimworldwiki.com/wiki/Mental_break
10. RimWorld Wiki, Mental inspiration. https://rimworldwiki.com/wiki/Mental_inspiration
11. Steam discussion, RimWorld mental breaks and "final straw" (Nov 2023). https://steamcommunity.com/app/294100/discussions/0/3958162152969850693
12. Steam discussion, RimWorld minor breaks (Feb 2024). https://steamcommunity.com/app/294100/discussions/0/4204742223858868112
13. Stanford GDT, "How do you create apophenia?" (on Sylvester, *Designing Games*). https://gdt.stanford.edu/how-do-you-create-apophenia/
14. CK3 Wiki, Stress and mental breaks. https://ck3.paradoxwikis.com/Stress
15. CK3 Wiki, Traits (AI values per trait). https://ck3.paradoxwikis.com/Traits
16. Paradox, CK3 Dev Diary #31, "A Stressful Situation" (read through search excerpts; the forum blocked direct fetching). https://forum.paradoxplaza.com/forum/threads/ck3-dev-diary-31-a-stressful-situation.1399764/
17. TheSixthAxis, *Crusader Kings III* review. https://www.thesixthaxis.com/?p=363952
18. Dwarf Fortress Wiki, Emotion (DF2014). https://dwarffortresswiki.org/index.php/DF2014:Emotion
19. Dwarf Fortress Wiki, Personality facet (DF2014). https://dwarffortresswiki.org/index.php/DF2014:Personality_facet
20. Dwarf Fortress Wiki, Memory (thought) (DF2014). https://dwarffortresswiki.org/index.php/DF2014:Memory_(thought)
21. Dwarf Fortress Wiki, Stress (DF2014), with the community sample of 300 dwarves. https://dwarffortresswiki.org/index.php/DF2014:Stress
22. Dwarf Fortress Wiki, Thoughts and preferences (DF2014). https://dwarffortresswiki.org/index.php/DF2014:Thoughts_and_preferences
23. FM Scout, A guide to player personalities in Football Manager. https://www.fmscout.com/a-guide-to-player-personalities-football-manager.html
24. ProGameTalk, Football Manager 2021 player personality guide (media handling styles). https://progametalk.com/guides/football-manager-2021-player-personality-guide/
25. Passion4FM, How to improve players' morale and happiness. https://www.passion4fm.com/how-to-improve-players-morale-happiness-in-football-manager/
26. WhatCulture, "Football Manager 2013: 9 improvements we want to see". https://whatculture.com/gaming/football-manager-2013-9-improvements-we-want-to-see
27. SortItOutSI, FM24 guide to press conferences. https://sortitoutsi.net/content/68503/fm24-guide-press-conferences
28. FM Scout forum, "Why did this happen" (team-talk reactions). https://www.fmscout.com/q-6448-why-did-this-happen.html
29. PC Gamer, "Football Manager 2021's natural gestures". https://www.pcgamer.com/fm21-gameplay-new-features/
30. Evans, R. and Short, E. (2014). Versu: a simulationist storytelling system. *IEEE TCIAIG* 6(2). https://www.cs.uky.edu/~sgware/reading/papers/evans2014versu.pdf
31. Game Developer, "The end of Versu: Emily Short looks back". https://www.gamedeveloper.com/business/the-end-of-versu-emily-short-looks-back
32. McCoy, J. et al. (2014). Social story worlds with Comme il Faut. *IEEE TCIAIG* 6(2). https://cs.uky.edu/~sgware/reading/papers/mccoy2014cif.pdf
33. AV Club, *Prom Week* review. https://www.avclub.com/prom-week-review-browser-facebook
34. Ryan, J. (2018). *Curating Simulated Storyworlds* (PhD, UC Santa Cruz), https://escholarship.org/uc/item/1340j5h2, as summarised by E. Short: https://emshort.blog/2019/05/23/curating-simulated-storyworlds-james-ryan-2/
35. Pynadath, D. and Marsella, S. (2005). PsychSim: modeling theory of mind with decision-theoretic agents. IJCAI. https://mlanthology.org/ijcai/2005/pynadath2005ijcai-psychsim (summary: https://www.jimdavies.org/summaries/Pynadath2005.html)
36. Si, M., Marsella, S. and Pynadath, D. (2008). Modeling appraisal in theory of mind reasoning. IVA. https://people.ict.usc.edu/~pynadath/Papers/iva08.pdf
37. Wang, N., Pynadath, D. and Hill, S. (2016). Trust calibration within a human-robot team: comparing automatically generated explanations. HRI. https://people.ict.usc.edu/nwang/public_html/PDF/HRI_2016_NW_DVP_SGH.pdf
38. Ryan, J., *Talk of the Town* source (personality.py, relationship.py, person.py, life_event.py). https://github.com/james-owen-ryan/talktown
39. Popescu, A., Broekens, J. and van Someren, M. (2014). GAMYGDALA: an emotion engine for games. *IEEE Trans. Affective Computing* 5(1). https://research.tudelft.nl/en/publications/gamygdala-an-emotion-engine-for-games
40. GAMYGDALA source, Gamygdala.js. https://github.com/broekens/gamygdala
41. Mascarenhas, S. et al. (2021). FAtiMA Toolkit: toward an accessible tool for the development of socio-emotional agents. https://arxiv.org/abs/2103.03020
42. Marsella, S. and Gratch, J. (2009). EMA: a process model of appraisal dynamics. *Cognitive Systems Research* 10. https://www.cs.uky.edu/~sgware/reading/papers/marsella2009ema.pdf
43. GamesBeat, "Shadow of Mordor's Nemesis system draws from Burnout, football, and an architecture book" (de Plater, DICE 2015). https://gamesbeat.com/shadow-of-mordors-nemesis-system-draws-from-burnout-football-and-an-architecture-book/
