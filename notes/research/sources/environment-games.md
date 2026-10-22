# Environment and shared conditions in games: prior art

For each system: what it does, whether any act reads it, and where it went wrong. "(inferred)" marks what I concluded rather than read. Gathered 22 Oct 2026.

## 1. The Sims 4: Seasons, and room environment

**Does.** Daily weather by season, with a forecast; seasons last 7, 14 or 28 days. Underdressed Sims can die of cold, and Sims can die of heat. Lightning can strike a Sim, more likely if it carries an umbrella. Umbrellas open automatically. Holidays come from a calendar, at most five traditions each [14][15]. Decor's "environment" value becomes a mood bonus; players say about 12 points per room maxes it [18].
**Changes acts?** Temperature does: outfits, and death. Emotions gate skill gain (Focused +2 to mental skills, Inspired +2 to creative ones) [16]. Decor reaches acts only through those gates (inferred).
**Went wrong.** Small positive moodlets stack until happiness is the default; a modder rebuilt it so that true happiness is rare [17]. Decor caps out ("decent decoration +1" in a rich room, per an EA bug report) [18]. Weather mostly adds activities, not choices between people (inferred).

## 2. RimWorld

**Does.** Mood is base mood plus the sum of thoughts. Breaks happen below 35%, 20% and 5%, with mean times between breaks of 4, 0.8 and 0.5 days [6][7]. Darkness (light below 30%) gives −5 mood, and work, movement and reading speed fall to ×80% at 0% light [2]. Ate without table −3 (1 day), soaking wet −3 (0.1 day), slept in cold or heat −4 [1]. Beauty is the average over an 8-tile radius in sight, from −15 to +15 mood [3]. Impressiveness = 65 × the mean + 35 × the minimum of scaled wealth, beauty, space and cleanliness, giving room thoughts from −2 to +8 [1][4].
**Shared events** [5]. Solar flare (0.15–0.5 days): power, heaters and turrets stop. Cold snap (−20 °C): crops die, hypothermia. Heat wave (+17 °C): heatstroke. Toxic fallout (2.5–10.5 days): 40% toxic buildup a day outdoors, death at 100%, −5 mood outside. Volcanic winter (7.5–40 days): −7 °C, light −30%, wildlife halved. Eclipse: solar power and crops stop. Aurora: +14 to watchers, and skygazing is 8× as likely to be chosen.
**Changes acts?** The physical effects do (light, heat, toxins, power), through stats and health. Room and weather thoughts only add to the bar. The aurora is the rare condition that changes what a pawn chooses to do.
**Went wrong.** The break message names only the last thought, so "ate without table" gets blamed [8]; mods remove or replace that thought [9].

## 3. Dwarf Fortress

**Does.** Personality shapes the emotion an event evokes, and memories replay it. Thoughts feed short-term stress (±100,000) and long-term stress (stressed at 25,000, haggard at 50,000, harrowed at 100,000; it rises at most 20,160 a year) [10][11]. The thought list covers room value, admiring fine furniture, miasma, smoke, missing chairs, and rain, snow or freakish weather; dwarves who like working outdoors ignore the rain [10]. Miasma's impact depends on personality [10][13]. Cave adaptation builds in the dark; sunlight then irritates or nauseates, and nausea brings vomiting [12].
**Changes acts?** Almost never directly: acts change only at a breakdown (tantrum, depression) or in insanity, which needs both kinds of stress high [11]. The exception is cave adaptation, whose vomiting leaves soldiers defenceless [12].
**Went wrong.** Cave adaptation "has no benefits" and costs more to fix than it is worth [12]. Because stress moves over years, one day of rain is invisible (inferred from [11]).

## 4. Frostpunk

**Does.** The cold deepens as the campaign goes on. A generator heats a zone, and hubs heat smaller ones [19][20]. Heat bands run from Comfortable (0 °C and up: no illness) to Very Cold (−31 to −40 °C: high risk); each 10 °C drop lowers the level by one [21]. A citizen's sickness risk combines home and workplace temperature, and the homeless are worst off [20]. City-wide hope and discontent can end the game in a revolt. Child labour and 24-hour shifts raise output and discontent. The finale is a great storm [19].
**Changes acts?** The cold forces the player's laws; citizens make no individual decisions (inferred).
**Went wrong.** Some critics found the dilemmas hollow because the game never judges the player's choices [19].

## 5. Banished

**Does.** Villagers need food, firewood and warm clothes, and fields yield nothing in winter. Hungry workers abandon work to look for food, so a town can collapse [22]. Without housing, grown children do not marry [23].
**Changes acts?** Only through survival needs that override jobs. Villagers have no individual personality; the review treats them only as a workforce [22]. The wandering is "maddening" [22].

## 6. Project Zomboid

**Does.** Water and power shut off on a random day; the usual default range is 0–30 days, though the setting codes differ by source. Fridges stop and food spoils, generators need fuel and must run outdoors, and water must be boiled [24].
**Changes acts?** Every plan the player makes. It is a shared deadline everyone can see coming. There are no NPC minds to read it (inferred).

## 7. Crusader Kings III

**Does.** Development runs 0–100, at +0.5% tax and levies per point, and spreads to neighbouring counties. Control below 100 costs 1% tax per point [25]. Winter (patch 1.3) is mild, normal or severe and raises army attrition and casualties; a developer said it does not affect play outside warfare [26]. I found no later DLC that extends it. Epidemics (Legends of the Dead) are Minor, Major or Apocalyptic. Their chance rises with development, markets and nearby outbreaks; infected characters gain a disease trait; rulers can isolate in the capital, close the gates or order the physician to "Control Plagues" [27].
**Changes acts?** Plague kills and so reshapes succession. Isolation is a decision, documented only for the player; AI use is unknown (inferred).
**Went wrong.** Small outbreaks become a repetitive stream of notifications [28].

## 8. Talk of the Town, Versu, PsychSim

- **Talk of the Town.** It has places (homes, businesses, parks). Characters meet only those at the same place, and businesses opening and closing move people in or out of town. Its rebuild, Neighborly, adds a global weather resource [29]. I found no weather or shared hardship in TotT itself (inferred).
- **Versu.** Social practices, motivations and emotions. It describes no physical environment [30].
- **PsychSim.** It has no locations [29]. Disaster World (2023) gives residents beliefs that can be wrong, and theory of mind, then simulates responses to a series of hurricanes [31]; the hurricane details were paywalled. In an earlier anthrax domain, a resident decides whether to leave by weighing the risk they believe falls on them and on their family and friends [32].

## Cross-cutting lessons

1. A condition changes acts only when a decision reads it. RimWorld's darkness and aurora do; its weather thoughts and DF's rain only move a bar (§2, §3).
2. A summed mood bar turns the environment into decoration and blames the wrong thing: the last −3 is named as the cause (§2, §3).
3. Positive environment moodlets push mood to a ceiling where it no longer tells people apart (§1).
4. A shared hardship becomes a story when it forces a choice about who bears the cost, as with Frostpunk's laws and Banished's firewood against food; without that choice it is attrition (§4, §5).
5. Shared conditions bite through stocks and deadlines (power, water, fuel, food), not through moods (§5, §6).
6. A condition confined to one system (CK3's winter, war only) stays out of lives; one that kills or moves people changes them (§7, §1).
7. Personality must vary how much a condition hits each person (DF's outdoor-lovers, miasma by personality), or it is the same for everyone (§3).
8. Believed risk drives the decision, not the true condition, and it can be wrong (§8).

## Sources

1. https://rimworldwiki.com/wiki/Thoughts
2. https://rimworldwiki.com/wiki/Light
3. https://rimworldwiki.com/wiki/Beauty
4. https://rimworldwiki.com/wiki/Room_stats
5. https://rimworldwiki.com/wiki/Events
6. https://rimworldwiki.com/wiki/Mental_break
7. https://rimworldwiki.com/wiki/Mood
8. https://steamcommunity.com/app/294100/discussions/0/3958162152969850693
9. https://steamcommunity.com/sharedfiles/filedetails/comments/2009759224
10. https://dwarffortresswiki.org/index.php/Thought
11. https://dwarffortresswiki.org/index.php/Stress
12. https://dwarffortresswiki.org/index.php/Cave_adaptation
13. https://dwarffortresswiki.org/index.php/Miasma
14. https://snootysims.com/wiki/sims-4/expansion-packs-sims-4-seasons/
15. https://www.playnews.gg/en/guides/the-sims-4-seasons-complete-guide-to-the-seasons-pack (via search summary)
16. https://www.carls-sims-4-guide.com/skills/skill-emotion.php (via search summary)
17. https://roburky.itch.io/sims4-happiness
18. https://steamcommunity.com/app/1222670/discussions/0/3088898048357930599/ ; https://forums.ea.com/idea/the-sims-4-bug-reports-en/snob-decorated-area/12180805 (via search summary)
19. https://en.wikipedia.org/wiki/Frostpunk
20. https://www.gamepressure.com/frostpunk/heat/z8a12d
21. https://frostpunk.fandom.com/wiki/Heat_level (stub; via search summary)
22. https://www.dedoimedo.com/games/banished.html
23. https://giantbomb.com/wiki/Games/Banished (via search summary)
24. https://wiki.indifferentbroccoli.com/ProjectZomboid/AllSandboxSettings ; https://xgamingserver.com/docs/project-zomboid/water-electricity ; https://pzfans.com/how-to-restore-power-and-water-in-project-zomboid/ (via search summary)
25. https://ck3.paradoxwikis.com/Development
26. https://www.gamepressure.com/newsroom/crusader-kings-3-patch-13-in-detail/zd2e06 ; https://forum.paradoxplaza.com/forum/threads/crusader-kings-3-dev-diary-49-a-cold-embrace.1458798 (via search summary)
27. https://devtrackers.gg/crusader-kings/p/8b2dd338-dev-diary-146-it-started-with-a-cough
28. https://aftermath.site/crusader-kings-iii-legends-dead-review/
29. Johnson-Bey, Nelson, Mateas, "Neighborly", CoG 2022: https://www.kmjn.org/publications/Neighborly_CoG22.pdf
30. https://versu.com/about/how-versu-works/
31. Pynadath et al., "Disaster World", CMOT 29(1):84–117, 2023: https://ideas.repec.org/a/spr/comaot/v29y2023i1d10.1007_s10588-022-09359-y.html
32. https://github.com/pynadath/psychsim (branch `disaster`, `domains/disaster/__main__.py`)
