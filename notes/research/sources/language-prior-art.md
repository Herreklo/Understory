# How others made generated text feel lived-in, and where it failed

**[D]** marks what a primary or first-hand source documents; **[I]** marks my inference. Numbers point to the source list.

## What each source did

| Source | What made text specific | Cost | What failed, with evidence |
| --- | --- | --- | --- |
| **RimWorld** | A grammar resolver fills symbols from objects (`{PAWN_nameDef}`), with articles and gender [D 1]. An artwork's description is generated from a *tale*, the record of a real colony event, so a statue depicts a death that happened [D 2]. | Low; one grammar serves many outputs | Players reroll the descriptions with mods [D 2]. Sylvester: detail that never reaches the player's mental model "degraded into noise" [D 3] |
| **Dwarf Fortress** | Legends records every figure and event; engravings and artifacts depict recorded events, so objects work as callbacks [D 4] | Text cheap, simulation very costly | Raw history reads as a log. The famous stories were curated and retold by players [D 5]. Ryan: raw output "will almost always lack story structure" [D 6] |
| **Caves of Qud** | Events are generated first and rationalised afterwards with replacement grammars, then told through biased, conflicting in-world accounts [D 7, 8] | Scoped to five sultans per run [D 8] | [I] Rationalising invents causes, which our rule forbids. The biased teller is what we can take |
| **Wildermyth** | Hand-written events are cast with generated heroes. Lines split by personality stat above a threshold (`<hero.bookish/loner/80:…>`) and by relationship (rival, friend, lover, neutral), at five intensity levels [D 9] | Each split multiplies lines: five per intensity slot [D 9] | [I] Testing each version takes forcing stats in an editor [D 9] |
| **Crusader Kings III** | Text is scoped to characters (`GetSheHe`); `triggered_desc` and `first_valid` choose a paragraph by condition [D 10] | Translators change only the quoted arguments inside script brackets [D 11] | The same event fires twice in a year, and players ask for repeat-tracking [D 12]. French needs agreement functions per language [D 11] |
| **Football Manager** | News, press and inbox are templates over match facts; answers move morale | Low | A player counted fewer than ten press questions recurring weekly [D 13]. Defenders say real press is samey [D 13]. Repetition is tolerated when the text has consequence, and still resented |
| **The Sims** | No sentences at all: Simlish, icons. [I] Players supply the story (apophenia [D 3]) | Low | [I] It says nothing specific, but it never contradicts the world either |
| **Compton; Short** | "10,000 bowls of plain oatmeal": perceptual uniqueness is the metric [D 14]. Text tied to no mechanic becomes decorative, and players skip it [D 15] | — | Variety of form without variety of consequence |
| **Tracery; Expressionist** | Additive, portable grammars [D 16]. Expressionist's symbols carry tags, and each output returns the tags it expanded [D 17], so the engine knows what a line claims | Tagging is the cost | [I] Untagged grammars have no state, hence the nonsense combinations of bots |
| **Curveship (Montfort)** | Separates what happened from its telling: order, frequency ("every winter…"), speed, focalisation [D 18] | Engineering, not writing | Its research advances are in order and focalisation only [D 18] |
| **Storylets; Left 4 Dead** | Content with prerequisites and effects; the most specific eligible line wins, with general fallback [D 19–21] | Additive: writers add lines independently | [I] The thin fallbacks are heard most |
| **Talk of the Town; Bad News** | Characters hold beliefs about others that spread, decay and may be false [D 22]. In Bad News a live actor voices a simulated town of several hundred people, fed by a hidden operator [D 23] | A human in the loop | The award-winning version had a person doing the wording [D 23]. Ryan: curation decides the result [D 6] |
| **Hades** | More than 22,000 voiced lines keyed to the exact game state; characters must never run out of things to say [D 24, 25]. Hades II: 400,000 words [D 26] | Vast | Players still report stale lines arriving hours late [D 25] |
| **Skyrim** | — | — | A guard line spoken by many guards became the "arrow in the knee" meme [D 27]. Repetition is noticed when a distinctive line has many speakers and short gaps |
| **LLM narration** | Generative Agents recall and narrate their own simulated lives [D 28] | Inference per line | 1.3% of statements about other agents were hallucinated; the agents added embellishments and sounded "overly formal" [D 28]. AI Dungeon produced offensive text unprompted [D 29]. Stories written with AI help were more alike as a set [D 30]. LLM style words such as "delves" rose about 25-fold [D 31]. In an FDG 2026 study, sifting heuristics made no significant difference; narration quality may compensate [D 32] |

Readers mostly cannot detect AI text: their heuristics are flawed [D 33], and they scored 46.6% on poems, below chance [D 34]. Yet 85% of gamers are negative about generative AI in games, and players who play for story are the most negative [D 35]. **[I]** So the risk lies in provenance and the label more than in the prose.

## 1. Variety

**Ranked by evidence: particulars, then selection, then varied acts, then varied words.**

- Varied words alone read as oatmeal [D 14, 15]. LLMs make each bowl richer and the bowls more alike [D 30].
- Particulars that come from state work. RimWorld's art and Dwarf Fortress's engravings name a real past event [D 2, 4], and Hades is remembered for lines tied to the moment [D 25].
- Selection works. Raw logs lack structure [D 6], and the famous Dwarf Fortress stories were curated by players [D 5].
- Repetition is noticed when a distinctive line recurs across speakers [D 27], or a small pool cycles fast: CK3's events [D 12], FM's press questions [D 13].
- There is no published threshold. Controlling repetition raised chatbot quality ratings [D 36], but nobody has measured a count for procedural prose.
- **[I] Working rule:** a *marked* phrase (an image, an idiom, an evaluative word) at most once per page and rarely across one sitting's pages. *Plain* phrasing ("married", "moved to") may repeat freely, as "said" does in fiction. Spend variation on marked words.

## 2. Lived-in

1. **Particulars that are state:** a named place, an object with a history, a habit the engine counts. Each particular is an entity with an ID.
2. **Callbacks** to an earlier line on the page [D 2, 15]. They are cheap, because reasons are already logged.
3. **Frequency and summary:** "Every Sunday that winter he walked to the mill" replaces twelve log lines [I from D 18]. This is the strongest single fix for a page that reads like a log.
4. **Focalisation and hearsay:** the same event told by the person, a rival, or the town. They draw on the engine's beliefs [D 22] and never invent disagreement.
5. **Gaps:** leave out routine and keep cause; readers fill the rest [D 3].
6. **Voice:** one narrator register per setting, supplied by the game as a lexicon and register layer, not as new frames.

## 3. Language models for wording

| | For | Against |
| --- | --- | --- |
| Richness | Fluent and varied | Homogenises across lives [D 30]; recognisable tics [D 31] |
| Truth | — | Embellishes [D 28], which breaks "nothing on a page that did not happen" |
| Determinism | — | Temperature 0 still varies: 80 distinct completions in 1,000 runs on standard vLLM [D 37]. This breaks CI identity |
| Scale | — | [I] 100,000 people × ~10 lines a year is ~1M lines, tens of millions of tokens per simulated year |
| Players | Most cannot detect it [D 33, 34] | Most reject it once known [D 35] |
| Rule 8 | — | Unprompted offensive output is documented [D 29] |

**[I] Where a model is safe:**

- **Offline drafting.** A model drafts phrase-table variants per act and register. People curate them, lint them, and commit them; the engine uses only frozen tables. The result is deterministic, free at runtime, reviewable and translatable.
- **Optional runtime wording in a game, never in the engine.** The model gets a closed fact list with IDs. A checker maps every clause back to an ID, or the template is shown instead. Output is cached by event hash. Understory's page never depends on it.

## 4. Grammars and libraries

- **Typed, tagged slots** [D 17]: every frame states what it claims.
- **Preconditions on state, most specific first, general fallback** [D 19, 21].
- **No-repeat memory per page and per sitting** [D 12].
- **Whole-sentence frames per language**, with gender and number passed through language functions [D 1, 10, 11]. Glued fragments break agreement [I].
- **Settings supply the lexicon** (places, institutions, objects, press), never frames. One grammar then serves music, football and mystery [I].
- **Rule 8:**
  - identity is never a slot in an evaluative frame;
  - pronouns come from data;
  - controversy lives in acts and convictions;
  - a linter checks a deny-list and identity-in-evaluative-frame patterns.
- **Cost [I]:** about 3 frames × 2–3 registers per act, plus a summary frame and a hearsay frame. That is roughly 1–2 writer-hours per act per language, plus testing. It scales with acts, not population.

## 5. Dangers and checks

| Danger | Check |
| --- | --- |
| Oatmeal | Over 24 pages, count recurring marked 4-grams and the share of lines with a particular or callback. Set targets before reading |
| False claim | Every clause carries an event or entity ID. CI fails on any orphan |
| Nonsense combination | Render every act × 1,000 random states. Fail on unresolved slots, contradictions or broken agreement |
| Rule 8 | Lint the full rendered corpus of a throwaway world, plus a red-team set |
| Selection hides cause | Blind readers must still answer "why" for the selected lines |
| Impossible callback | Hearsay cites only beliefs the character holds |
| AI feel | Style-word list (delve, tapestry, testament…) at zero in committed tables |
| Nondeterminism | Page-text hash identical across two runs |
| Translation | A pseudo-localisation pass and one gendered language over all frames |
| Tone break | Register tags on adjacent lines. Flag comedy within a month of grief |
| Cost runaway | Writer-hours per act. Stop adding registers when a reading shows no gain |

## Sources

1. RimWorld Wiki, Modding Tutorials/GrammarResolver. https://rimworldwiki.com/wiki/Modding_Tutorials/GrammarResolver
2. Steam discussion, RimWorld art descriptions are generated from a tale and a seed. https://steamcommunity.com/app/294100/discussions/0/1643170903484501774
3. Sylvester, T. (2013). The Simulation Dream. https://www.gamedeveloper.com/design/the-simulation-dream
4. Dwarf Fortress (Wikipedia; legends mode). https://en.wikipedia.org/wiki/Dwarf_Fortress
5. Oilfurnace: an illustrated Dwarf Fortress tale, PC Gamer. https://pcgamer.com/oilfurnace-an-illustrated-dwarf-fortress-tale
6. Ryan, J. (2018). Curating Simulated Storyworlds, UCSC; notes by E. Short. https://escholarship.org/uc/item/1340j5h2 ; https://emshort.blog/2019/05/21/curating-simulated-storyworlds-james-ryan/
7. Grinblat, J. (2018). Procedurally Generating History in Caves of Qud, GDC. https://gdcvault.com/play/1024990/Procedurally-Generating-History-in-Caves
8. Caves of Qud (Wikipedia); Sultan (Qud wiki). https://en.wikipedia.org/wiki/Caves_of_Qud ; https://wiki.cavesofqud.com/wiki/Sultan
9. Wildermyth Wiki, Modding variant text. https://wildermyth.com/wiki/Modding_variant_text
10. CK3 Wiki, Localization. https://ck3.paradoxwikis.com/Localization
11. Steam Workshop discussion on translating CK3 script (Select_CString). https://steamcommunity.com/workshop/filedetails/discussion/2220143908/4425436358665934992
12. Steam discussions, CK3 repeated events. https://steamcommunity.com/app/1158310/discussions/0/3838801919839423509
13. Steam discussion, FM17 press conferences. https://steamcommunity.com/app/482730/discussions/0/135512931347683702 ; FM Scout poll https://www.fmscout.com/q-18007-Opinions-on-press-conferences-wanted.html
14. Compton, K. So you want to build a generator (quoted in). https://en.wikipedia.org/wiki/Procedural_generation
15. Short, E. (2016). Bowls of Oatmeal and Text Generation. https://emshort.blog/2016/09/21/bowls-of-oatmeal-and-text-generation/
16. Compton, Kybartas, Mateas (2015). Tracery: An Author-Focused Generative Text Tool, ICIDS. https://www.springerprofessional.de/en/tracery-an-author-focused-generative-text-tool/6884562
17. Ryan, Seither, Mateas, Wardrip-Fruin (2016). Expressionist, ICIDS. https://ojs.aaai.org/index.php/AIIDE/article/view/12840
18. Montfort, N. Curveship and narrative theory; Curveship's Automatic Narrative Style (FDG 2011). https://nickm.com/post/?p=449 ; https://www.nickm.com/if/montfort_fdg_2011.pdf
19. Short, E. (2016). Beyond Branching: Quality-Based and Salience-Based Narrative Structures. https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/
20. Short, E. (2019). Storylets: You Want Them. https://emshort.blog/2019/11/29/storylets-you-want-them/
21. Ruskin, E. (2012). AI-driven Dynamic Dialog through Fuzzy Pattern Matching, GDC; notes by Short. https://www.gdcvault.com/play/1015528/ ; https://emshort.blog/2012/03/16/gdc-2012-talk-on-dynamic-dialogue/
22. Ryan, Summerville, Mateas, Wardrip-Fruin (2015). Toward Characters Who Observe, Tell, Misremember, and Lie (Talk of the Town), EXAG workshop; described in [6], ch. 6. https://escholarship.org/uc/item/1340j5h2
23. Ryan, Summerville, Samuel (2016). Bad News: A Game of Death and Communication, CHI EA. https://eis.ucsc.edu/papers/ryanEtAl_BadNewsCHI2016.pdf
24. Kasavin & Korb (2021). Breathing Life into Greek Myth: The Dialogue of Hades, GDC. https://gdcvault.com/play/1026975/Breathing-Life-into-Greek-Myth
25. GeekDad interview with Kasavin (2019); Steam thread on stale lines. https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/ ; https://steamcommunity.com/app/1145360/discussions/0/2987539784417139179
26. Multiplayer.it, Hades II script size. https://multiplayer.it/notizie/hades-2-include-linee-dialogo-50-in-piu-primo-titolo.html
27. Arrow in the knee (Wikipedia). https://en.wikipedia.org/wiki/Arrow_in_the_knee
28. Park et al. (2023). Generative Agents, §6.5.2, §7.1.2, §3.1.1 fn 3. https://arxiv.org/html/2304.03442
29. The Register (2021) on AI Dungeon's filter and output. https://www.theregister.com/2021/04/30/ai_dungeon_filter_vulnerabilities/ ; https://www.theregister.com/2021/10/08/ai_game_abuse/
30. Doshi & Hauser (2024). Generative AI enhances individual creativity but reduces the collective diversity of novel content, Science Advances. https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532
31. Kobak et al. (2024). Delving into LLM-assisted writing in biomedical publications through excess vocabulary. https://arxiv.org/abs/2406.07016 ; Language Log summary https://languagelog.ldc.upenn.edu/nll/?p=64877
32. Lessard, Friedrich, Paré-Chouinard, Kosseim (2026). Narrative Gold Digging: Sifting and Narrating Stories from a Procedural Simulation, FDG. https://www.jonathanlessard.net/?p=357
33. Jakesch, Hancock, Naaman (2023). Human heuristics for AI-generated language are flawed, PNAS. https://pmc.ncbi.nlm.nih.gov/articles/PMC10089155
34. Porter & Machery (2024). AI-generated poetry is indistinguishable from human-written poetry and is rated more favorably, Scientific Reports. https://pmc.ncbi.nlm.nih.gov/articles/PMC11564748
35. Quantic Foundry (2025) survey on generative AI in games, via GamesMarket. https://www.gamesmarket.global/quantic-foundry-most-gamers-are-negative-about-the-use-of-gen-ai-in-video-games
36. See, Roller, Kiela, Weston (2019). What makes a good conversation?, NAACL. https://aclanthology.org/N19-1170/
37. He, H. / Thinking Machines (2025). Defeating Nondeterminism in LLM Inference (summary thread). https://community.openai.com/t/defeating-nondeterminism-in-llm-inference/1358623
