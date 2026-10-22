# Intriguing lives in games and emergent narrative: what did it, and who did it

[n] is a source below. "(inferred)" marks my reading, not a source's claim. Sources marked _excerpt_ in the list were read only through search excerpts or abstracts. For each system the work is split three ways:

- **M**, mechanism in characters: state a person holds and decides from.
- **D**, director or authoring: something outside the people that reads the drama or the plot and pushes toward it.
- **S**, selection afterwards: sifting, curation, ordering on the page. It never writes back to the world.

The rule this note serves: only M may make a life more dramatic; S may choose what is shown; D is out. `feelings-games.md` covers feelings (moods, breaks, stress) in the same systems and is not repeated. `language-prior-art.md` covers text, grammars and callbacks.

## What "storyful" means, by those who measured it

**Ryan [1–4].** Emergent stories "actually happen", which gives them the pleasures of nonfiction. Ryan names eight appeals: the actual, the personal, the uncanny and farcical, the unauthored or co-authored, the uncovered, the improbable, the vast and the ephemeral [2]. The pain is that a raw simulation trace "will almost always lack story structure" and reads like a debug log [2,3]. His central claim is that the generators that succeed (Dwarf Fortress, The Sims) are the ones whose players are moved to curate and retell them, so emergent narrative needs curation [1,2]. He lists the ways it fails [3]:

- **Boringness:** what is modelled is not engaging.
- **The wrong grain:** too coarse or too fine.
- **No modularity:** pieces cannot recombine.
- **Modelling gaps:** possibilities the other systems suggest but nothing models.
- **Causality under utility scoring:** when many weighted factors each partly cause an act, the cause is too diffuse to narrate. Prom Week is his example. His remedies are _contingent unlocking_ (an act becomes possible only after a finite set of prior conditions) and _causal bookkeeping_ (record how an outcome became available).

His recipe for finding what to tell (tellability, after Labov) is to start from the most interesting final event, chain backwards through its causes, and stop at an event that needs no explanation [3]. He argues against drama management: an outside modulator breaks the nonfiction pleasure [3]. His working methods are to overgenerate and curate, and "apophenia hacking": the curator elaborates on output without contradicting it [4]. Emily Short's critique of the curation thesis is that it misses what makes a generator good in the first place [2]:

- systems that interlock;
- modelled stakes and motivations;
- symbolically rich parts that can mean more than one thing;
- expressive range.

**Retellings, measured [11,12].** Kreminski, Samuel, Melcer and Wardrip-Fruin coded 40 player retellings (20 of Civilization VI, 20 of Stellaris) and then ran an ablation on Prom Week [11]. The codebook is a usable list of what readers treat as story:

- named characters;
- extrapolated flavour (the player adds what the game did not model);
- in-world dialogue;
- non-mechanical reasons ("he couldn't bear to leave the home");
- **reversals** (a trend or power relation inverts, or someone changes their mind);
- **character development** (the earlier self contrasted with the present one).

Findings:

- **Reversals:** retellings with no reversals read as a "steady rise". Up to three felt most compelling, and more began to feel incoherent. This was anecdotal.
- **The Prom Week ablation:** with social reasoning replaced by random choice, the two retellings held 8 or more reversals each in 1,500–2,000 words. With reasoning on, both held 6 or fewer. Both players found the reasoning version easier to tell, more coherent and more supportive. Surprise did not differ between the versions. One player said they began to understand characters' personalities "and why they had made those decisions". The study had **n = 2 players**.
- **What players found storyful in Stellaris:** a named leader gaining a trait (read as character development), tension building between rival factions, decisive battles, and scripted events involving named leaders.
- **Sharing:** Stellaris's subreddit had about half Civ's membership but about 1.8 times its retelling posts.
- **Extrapolative narrativization:** players seize on coincidences and juxtapositions. A governor gains an addiction trait during a troubled period, and the player writes the stress as its cause, although the game never linked the two.
- **The authors' advice:** give evocative hooks (traits) that can be read more than one way, leave some things underdetermined, model individuals and let them take part in many kinds of event, and model intentionality or give hooks to infer it.

Eladhari proposes retellings as the fourth layer of an interactive narrative and as an instrument of critique [12].

**Believability [53,54].** Gomes et al. list measurable dimensions of believability: coherent behaviour, change with experience, awareness, understandable behaviour, personality, predictability, and social and emotional expressiveness [54]. Tanenbaum's three lenses are believability, adaptivity and performativity [53]. Both put change and understandable cause next to predictability; neither treats surprise as a dimension of its own (inferred).

## The systems

### Talk of the Town, Hennepin, Bad News, Sheldon County (Ryan and others)

- **M:** Big Five traits, per-pair charge and spark, and beliefs that spread, mutate, fade and are lied about (see `feelings-games.md`, `docs/method/prior-art.md`). Hennepin is a finer-grained successor whose runs take a day or two; Sheldon County is a podcast generated from it [4].
- **D:** none in the simulation.
- **S:** Bad News is the success. Ryan sifted a generated town by hand during play, and an actor (Ben Samuel) performed it for one participant, who had to find and notify the next of kin of a dead resident [4]. Hennepin and Sheldon County try to automate that sifting [4].
- **Went wrong:** by Ryan's own account, the simulated knowledge was "not very prone to generating narrative intrigue". Characters mostly passed on facts like hair and eye colour [4]. **Beliefs alone are not intrigue; beliefs about acts with stakes are** (inferred). The award-winning version needed a human curator and performer [4].

### Story sifting: Felt, Winnow, Synthesizer, Select the Unexpected, Centrifuge

- **S:**
  - _Felt_ (2019): sifting patterns are Datalog queries over the event log for a "narratively potent" sequence. The canonical example is a _violation of hospitality_: a visitor arrives, a resident shows them hospitality, and the same resident later harms them, unless the visitor left in between [5].
  - _Winnow_ (2021): sifting incrementally, while the simulation runs, and partially, finding the opening of a pattern not yet finished [6].
  - _Synthesizer_ (2020): induces patterns from a few marked examples, such as "romantic failure followed by romantic success" [7].
  - _Select the Unexpected_ (2022): a statistical heuristic that flags the unlikely [8].
  - _Centrifuge_ (2021): patterns built as a node graph [9].
- **M, by use:** in Felt and Why Are We Like This?, characters themselves query the log ("characters use sifting to reason about their world") [5,10]. A pattern that a character runs over its own memories is that character's recall, which is mechanism. A pattern that scores a life for interest and feeds that score back into decisions is a director (inferred).
- **D, the counter-example:** Awash (Clothier and Millard, 2023) uses an incremental sifter to spot stories that are possible, then has a drama manager nudge the simulation to complete them [14]. That is exactly what the rule forbids.
- **What the patterns look for** (gathered from [5–8]): violated hospitality or trust, betrayal after a favour, failure followed by success, reversals of status, a rivalry's escalation and payoff, the unlikely act given what came before. These are almost all relations between two people across time (inferred).
- **Went wrong:** writing patterns is slow and error-prone [7]. None of these papers reports a reader study of which sifted patterns readers find storyful. The evidence is the retelling studies above.

### RimWorld (Sylvester)

- **D:** the storytellers. Booth's AI Director inspired them [16 *excerpt*]. They draw events from a categorised database by the colony's state, and "the storyteller eases off when the colony population drops" [16]. Cassandra runs a rising curve with pushes and breathing room; Phoebe leaves long gaps; Randy is random. Threat points scale with difficulty from 10% to 220%, and an adaptation score grows over time and falls when the colony takes damage [17]. Colonist arrivals follow a "population intent" curve [17]. All of this is a director acting on threats and arrivals, not on colonists' decisions.
- **M:**

  - **Opinion:** runs −100..100. Below −20 a colonist is a rival; above +20, a friend.
  - **Talk:** chitchat +10, deep talk +15 weighted by a hidden compatibility, slight −5, insult −15.
  - **Insults compound:** their odds rise up to 6× at opinion −100, and 2.3× for the Abrasive trait.
  - **Social fights:** each insult has a 4% chance to start one. A fight leaves both with either +38 (cathartic) or −22 for 20 days.
  - **Breakups:** a dumped partner holds −50 against the one who left (−70 for an ex-spouse).
  - **Killers:** the killer of a parent or child carries −80 [18].

  These rules are where the stories of feuds and grief come from (inferred).

- **Theory [15]:**
  - The _player-model principle_: anything in the game model that never reaches the player's model "is worthless".
  - _Apophenia_: players supply intent from suggestive simple behaviour.
  - _Story-richness_: the share of interactions that interest the player.
  - Keep "hairball" systems out of what the player must read.
  - Centre situations on human values and primal emotions.
  - Use "hair complexity", flavour that does not feed back into the core.
  - "The game is a co-author, not an author."
  - In practice, features that do not feed stories are simplified or cut, and achievements were left out because they would interrupt them [19].
- **What players retell:** chains where systems collide. Sylvester's example is a raid during a fire; Rock, Paper, Shotgun's is a pop star maimed, broken and turned "deranged" [16].
- **Went wrong:**
  - Mental breaks blame the last trifle (`feelings-games.md`).
  - The romance model drew a public analysis (Claudia Lo, 2016) showing it encoded sex-asymmetric assumptions: no bisexual men, and women far less likely to initiate. Sylvester promised a partial fix [20]. A mechanism keyed to identity reads as the designer's prejudice, not the character's (inferred). Rule 8 here forbids it already.
  - The more legible RimWorld is, the more it "constrains the imagination" compared with Dwarf Fortress [16]. Sylvester treats this as a trade, not a fault.

### Crusader Kings II and III (Paradox)

- **M:**
  - Traits drive AI values (`feelings-games.md`), and in CK3 "everything has a root cause": a trait traces to a bully or a battle [26 *excerpt*].
  - **Relations** come in tiers: friend +60, best friend +120 (lifelong), rival −60, nemesis −120 (lifelong, needs a rival first). A rival's death _removes_ 35 stress; a friend's death adds 10. High-vengefulness characters seek to harm their rivals [21].
  - **Secrets** (murder, adultery and others) can be exposed or used to blackmail. A target who refuses blackmail is exposed. Agreement gives a weak hook (one use) or a strong one (reusable every five years, and blocking the target from war, factions or imprisoning you). A Criminal secret's hook is open-ended [22].
  - **Schemes:** murder, seduce, sway, fabricate a hook.
  - Oltner: "the AI agents behind the character drive the emergent storytelling" [26 *excerpt*].
- **D / authoring:** events are hand-written vignettes triggered by state. CK2 grew dark event chains; chance joining two scripted events produced the famous "child of Satan" run [25]. Fåhraeus wanted "emergence detection": music for mournful moments, and adjusting the random generator to steer play toward interesting paths [25]. That is a director. For the Charlemagne expansion he planned "railroaded events" telling one life [24].
- **Why players retell it:** thousands of independent characters with ambitions; dynastic time, where you play the heir and inherit the dead man's enemies; and interlocking intrigue, war and family [24]. The audience grew to role-players and "Sims fans" [24]. Fåhraeus regrets the time spent on technology and laws, "red herrings" next to the character systems [24].
- **Went wrong:**
  - **Events repeat.** CK3 players report a pool of roughly 20–30 events recycling within the first two decades of a run, the same event twice in a short window, and pop-up spam from travel and activity events. They ask for each playthrough to remember which events have fired [23 *excerpt*]. The vignettes are authored, so finite content meets a long clock (inferred).
  - Stress makes vice a build (`feelings-games.md`).

### Dwarf Fortress (Tarn and Zach Adams)

- **M:** dwarves are "actors in their own stories" [27]. Names, skills, family ties, likes and dislikes are the characterization; some drive mechanics, some only inform, and names do neither, purely as storytelling aids [30 *excerpt*]. World history comes from a zero-player strategy simulation of tracked historical figures, and "history is just a record of that" [27,31].
- **S:** Legends mode shows the record. Players are the curators: they retire forts to read legends, use DFHack or third-party viewers, and write retellings [31].
- **Boatmurdered** [28,29]: 14 Something Awful players, November 2006 to March 2007, each running the fort for one year and writing it up in character. What made it retold:

  - a recurring antagonist that escalated over years, the elephants, ending in the "Elephant War";
  - successive overseers judging their predecessors;
  - a rise and fall, "mostly fall", that ended in a catastrophe traced to a cause;
  - the writers' voices.

  The review names the risk: one dull writer stalls the whole story [28]. **The storyfulness was in the antagonist's persistence and the curators' voices** (inferred).

- **Went wrong:**
  - Adams: without enough dynamics "the output can be boring", and finding good moments needs post-processing [27].
  - Characters' motivation and goal-setting "continue to lag far behind" stories [27].
  - "Numbers usually make for poor stories" [27].
  - A quartermaster role was cut for adding little to stories [27].
  - Personality facets have effects the wiki says are not understood (`feelings-games.md`).
- Adams's own test for a new simulation layer is whether he sees "a little narrative forming" after playing it himself [56].

### The Sims

- **M:**
  - **Sims 2:** five aspirations (romance, family, knowledge, fortune, popularity) generate wants and fears. A Popularity Sim may fear public humiliation; a Family Sim, a relative's death. Fulfilled wants raise the aspiration meter, realised fears lower it, and failure brings a breakdown and a visiting therapist [32 *excerpt*, 33]. **Wants did not drive autonomy**: a Sim who wants cereal will not fetch it alone [32]. Memories record events (first kiss, promotions, deaths) with valence by aspiration, are raised in conversation, and shift personality over a lifetime [34 *excerpt*].
  - **Sims 3:** traits and lifetime wishes.
- **D:** none. **The player is the author.** Wright: games are a platform for players "to play out stories"; character development belongs in the player's hands [36 *excerpt*].
- **S:** players' own retellings. Alice and Kev (Burkinshaw, Sims 3, 2009) was a homeless father and daughter with the walls and the job taken away. Burkinshaw reported "with as little embellishment as possible" and admits he does not always separate the AI's reasons from his own direction. Kev's "insane"/"inappropriate" traits and Alice's need-driven theft drove events [35].
- **Went wrong:**
  - Wants that do not move the Sim make the Sim a menu (inferred, consistent with `feelings-games.md` on Sims 4).
  - Sims 4 whims were felt as trivial: "another whim to buy bees" [33].
  - Background lives disturb the player's story. Sims 3 story progression aged and moved unplayed households, and players bought control back with mods (NRaas, AwesomeMod, MCCC). Sims 4 players still ask to freeze unplayed households [37 *excerpt*].

### Shadow of Mordor: the Nemesis system (Monolith)

- **M:**
  - Uruks who do something notable, like killing Talion or surviving him, are promoted to captain. **A captain who kills the player gains power** [39].
  - Survivors remember and come back scarred: the one thrown into a fire returns burnt [39].
  - Captains have strengths, weaknesses, and rivals they hate or fear, and fight each other for supremacy [38,39].
  - De Plater built detail only at "anchors" players latch onto, like being killed, and left the middle for players to fill [38].
- **D:** none in the hierarchy's politics, though the rules are authored.
- **S:** the hierarchy screen.
- **Went wrong:**
  - Destructoid called it "gimmicky": looks and weaknesses without personality [39].
  - Two reviewers found it flat late or dull early [39].
  - Warner Bros. holds US patent 10,926,179 (granted February 2021, maintainable to 2035) on the hierarchy and its vendettas [40]. Overstory should keep that in view if it ever builds an enemy hierarchy keyed to the player's deaths (inferred, not legal advice).
- The lesson: **a consequence that changes a character's standing because of a specific past encounter, shown with the scar**.

### Wildermyth (Worldwalker)

- **Authoring with M casting:** writers author event "plays" with roles. Heroes are cast by personality, with tight and loose casting balanced so that events still occur and characters stay distinct. Lines vary by personality and by relationship (rival, friend, lover) [41]. "The focus here is on character development, NOT on plot" [41]. Transformations change body and play. Heroes age, retire and return in later campaigns as Legacy [41].
- **Went wrong:** the team cannot predict who fills a role, so it keeps tuning for consistency [41]. Each split multiplies lines (`language-prior-art.md`). The content is authored, so it is finite (inferred).

### Caves of Qud: mythic biographies (Grinblat and Bucklew)

- **D by design:** five sultans per world. The system first decides that an event happens, then rationalises a cause from the sultan's state: "the effect causes the cause" [42]. There are 10 domains (ice, glass, might, chance and others) and 19 event types [42].
- **Why it coheres:** a few properties per sultan (a domain, affiliations) are shared across many events and act as "glue", so players draw causal links through apophenia [42]. History reaches the player as biased in-world accounts on shrines and in books [42].
- **Went wrong for us:** rationalising after the fact invents causes, which the engine forbids. **What carries over is the glue: a person's few lasting properties recurring across their events** (inferred).

### Ultima Ratio Regum (Mark R. Johnson)

- **M plus generated culture:** cultures, religions, norms and ideologies set how each culture's individuals speak (greetings, insults, naming archetypes, sentence length) and what their artefacts depict [43]. The player reconstructs a conspiracy from clues in that material [43].
- **Lesson:** history becomes interesting when it is _evidence the player must interpret_ (inferred). It sits close to Understory's witness, which is its knowledge layer.

### Football Manager (Sports Interactive)

- **M:** hidden personality attributes read through labels (`feelings-games.md`); favoured and disliked clubs and personnel. Players can stay loyal to an old manager, and punishing a favourite can turn a faction [45]. Promises whose breach costs according to the player's influence [45]. Jacobson calls the game "a story-telling platform" generating 20,000–100,000 new people a year, and says it must be believable [44].
- **Domain structure** (inferred): the season, the league table, the transfer window and derbies give a public calendar of stakes and a scoreboard everyone reads.
- **S:** news, stats histories, career tables.
- **What players retell:** wonderkids, whose hidden potential is revealed slowly over seasons. Jacobson calls the famous ones mostly "statistical errors" in the data [44 *excerpt*]. The myth comes from hidden potential plus uncertainty plus a long career (inferred).
- **Went wrong:** press conferences are repetitive and inconsequential (`feelings-games.md`, `language-prior-art.md`).

### The counter-examples: directors

- **Left 4 Dead's AI Director** [46]: it estimates each survivor's "emotional intensity" and tracks the maximum of the four. It cycles Build Up (full threat until intensity peaks), Sustain Peak (3–5 s), Peak Fade (wait for a natural lull) and Relax (minimal threat for 30–45 s). The model was Counter-Strike's "spiky" pacing; "constant combat is fatiguing; long inactivity is boring". At most 30 infected exist at once. **Pure D, and it works for a 20-minute run.** It has no people with histories.
- **Façade** [47]: a drama manager sequences 27 beats, about half per playthrough, to fit an Aristotelian tension arc. Each beat is about 100 joint dialogue behaviours, about 2,500 in all. Two people took five years. Pure D plus authored content, so it cannot last decades (inferred).
- **Versu** [48]: strong autonomy. Each agent chooses from its own beliefs and desires. The drama manager "rarely" overrides; it suggests and "tweaks the desires of the participants", which is a soft D. The decisive finding: **only the player may choose against what the character's simulation prefers, so NPCs "will not exercise" opportunities for change and "continue to play supporting roles"** [48]. Character arcs with epilogues are authored per character [48].
- **Thespian** [49]: an author writes linear scripts, and "fitting" tunes the agents' goal weights until the agents perform them. The agents then stay "true to their motivations" when play deviates. That is D written into M's parameters.
- **Late commitment** (Swartjes and Theune) [52]: undecided facts about the world are fixed only when they become useful to the story, as in improv. The selection is by story value, so it is D.
- **CK2's proposed emergence detection** [25], **RimWorld's storytellers** [17] and **Awash** [14] are covered above.

### The academic critique

- **The narrative paradox** (Aylett; Louchart and Aylett) [50]: freedom of interaction against the structure of interesting stories. Their answer was emergent narrative, characters improvising as in role-play and Forum Theatre, tested in FearNot!. Its authors later said the character-centred approach loses predictability (`feelings-games.md`, FAtiMA).
- **Walsh** [51 *excerpt*]: emergence and narrative are "incommensurable". Narrative and simulation are distinct, in some respects antithetical, modes of representation. On his account emergent narrative is a misnomer: simulation yields material, and narrative is made by a teller (inferred from the excerpt). This agrees with Ryan's curation thesis.
- **Believability** [53,54]: dimensions above. Tanenbaum and Bizzocchi's close reading of Oblivion shows where personalisation breaks the illusion [53 *excerpt*].
- **Invisible depth, from industry:** Bethesda's Radiant AI was rough and visible in Oblivion. In Skyrim it was "more prevalent and more complex" and less noticed: a dead NPC's relative takes over their role, and NPCs quarrel over dropped items [55]. Smooth depth disappears.

## Where it went wrong: four failures

1. **Repetition.** CK3's event pool recycles within two decades [23]; FM's press questions [`feelings-games.md`]; Sims 4 whims [33]; Hades lines arrive stale (`language-prior-art.md`). All are _authored_ pools meeting a long clock. A pool of situations is safe only if what varies is who, why and what follows (inferred).
2. **Forced drama.**
   - Directors make the pacing, but the pacing then belongs to no one. RimWorld's raids answer the colony's wealth, not any person's choice [17].
   - Versu's desire tweaks and Thespian's fitting make characters perform the plot [48,49].
   - Prom Week with random choices produced more reversals and less coherence [11]. More events is not more story.
3. **Invisible depth.** Dwarf Fortress facets [`feelings-games.md`], Skyrim's Radiant AI [55], Sylvester's player model [15]. Talk of the Town's rich beliefs were about trivia [4].
4. **Noise.** Raw logs read as debug output [2,3]; Dwarf Fortress needs post-processing [27]; a student telling Stellaris "missed important things" among too many [11]. 8 or more reversals read as incoherent [11].

## Rules for intriguing lives without a director

Each rule rests on more than one system, names the mechanism in people that would do it, and names a measure. None lets a decision read a story measure.

1. **A story is a chain of consequences with a named origin. Record causes when they happen, and let acts unlock only from prior conditions.**
   - _Evidence:_ Ryan's causality under utility scoring and his two remedies [3]; the Nemesis captain promoted _because_ he killed you, the scar from the fire [39]; CK3's root-caused traits [26]; Dwarf Fortress's core memories with cause and year; Prom Week's reasoning version read as more coherent than random choice [11].
   - _Mechanism:_ every consequence cites the event that enabled it (Understory has this), and the weightiest acts (revenge, leaving, reconciling, exposing) need a specific prior event between the same people, not a high score.
   - _Measure:_ the share of weighty events cited by a later weighty event (the consequence map's 22% today), and the median chain length.
2. **Persistent counterparts, rivals and allies, who remember and escalate by steps, are what get retold.**
   - _Evidence:_ the Nemesis captain [38,39]; CK3 rival to nemesis [21]; Boatmurdered's elephants [28]; Stellaris retellings' "building tension between rival factions" [11]; RimWorld's compounding insults [18]; Felt's hospitality-then-harm pattern [5].
   - _Mechanism:_ a relation with memory that changes state only through events between the two (a slight, then a grudge, then an act), and that ends by peace, leaving, death or cooling. Understory has the grudge.
   - _Measure:_ the share of lives with a counterpart who recurs in 3 or more weighty events over ten years.
3. **Reversals make a story, but few of them: about one to three per told life.**
   - _Evidence:_ the retelling codebook (no reversals reads as a flat rise; more than three as incoherent) and the Prom Week ablation [11]; Ryan's "improbable" appeal [2]; Left 4 Dead shows peaks matter but are a director's [46].
   - _Mechanism:_ inertia. A status, bond or belief flips only when an event crosses a threshold held against it, so reversals are rare and each has a cause. Nothing counts reversals in order to produce them.
   - _Measure:_ reversals per ten-year life, as a distribution, where a reversal is the sign of a bond flipping, a lost post or standing, or an abandoned want. The check is that the share of lives with zero falls while the 90th percentile stays at or under about 4. The threshold of 3 rests on n = 2 and anecdote; treat it as a guess to calibrate.
4. **Everyone must be able to change, including against their own preference, and the change must be legible against the earlier self.**
   - _Evidence:_ Versu's NPCs could not, and stayed supporting roles [48]; the retelling code "character development" and Stellaris's trait gains [11]; CK3's coping traits and root causes [21,26]; Sims 2 memories shifting personality [34]; believability's "change with experience" [54].
   - _Mechanism:_ a state left unresolved past a horizon (a grudge, a loss, a failed want) shifts a facet, if-then or value, and records its origin. Sometimes, by the person's own traits (low conscientiousness, high openness), the choice goes to a lower-utility answer that sets a new want. That choice comes from the person's own draw, never from a story score. SUMMARY says "life barely changes people".
   - _Measure:_ the share of adults whose described way of being differs at year 10 from year 0, with the cause cited.
5. **Stakes come from wants that collide between people who meet, and from what can be lost. Knowledge becomes intrigue only when it is about acts with consequences.**
   - _Evidence:_ Talk of the Town's trivia beliefs [4]; Short's "stakes and motivations" and "interlocking systems" [2]; Sylvester's human values and primal emotions [15]; Sims 2 fears and aspiration failure [32]; CK3 secrets, hooks and the refused blackmail that exposes [22]; FM's promises [45]; Fåhraeus's lesson that technology and laws were red herrings and the characters were the game [24].
   - _Mechanism:_ secrets about acts (a debt, an affair, a deceit, a harm), held by someone else and usable as leverage, with exposure carrying a cost. Wants over the same scarce thing.
   - _Measure:_ the share of secrets and beliefs on the page that concern an act and later change a decision.
6. **Few, lasting hooks per person, recurring across their events, make a life cohere. What is left open invites the reader in.**
   - _Evidence:_ Qud's shared sultan properties as "glue" [42]; Kreminski et al.'s advice on evocative, partly underdetermined hooks [11]; Nemesis "anchors" with the middle left open [38]; Dwarf Fortress's names and likes [30]; FM's personality labels.
   - _Mechanism:_ Understory's two or three signature facets and if-thens should appear as the reasons across a life's different kinds of event, not only where they first fit.
   - _Measure:_ the share of a life's weighty events whose reasons include one of that person's signatures. Readers' recognition ("I remember when that started") is the outcome.
7. **Find stories afterwards and never steer toward them.**
   - _Evidence:_ Ryan's argument against drama management, and every curated success: Bad News, Boatmurdered, Alice and Kev, Legends mode [3,4,28,35]. The counter-example set is Left 4 Dead, Façade, Versu's tweaks, Thespian, CK2's proposed RNG steering, late commitment and Awash [14,25,46–49,52].
   - _Mechanism:_ a sifter (Felt or Winnow style patterns over the log, plus backward chaining from the weightiest event) may choose and order what the page shows. Its output is never read by `decide`, `steer` or any situation. A character recalling a pattern of its own memories (Felt's use [5]) is allowed; a score for interest is not.
   - _Measure:_ a dependency test that no engine system imports the sifter. Readers' scores with the sifted page against the chronological page.
8. **Depth that does not reach the page is wasted; repeats that do reach it cost twice.**
   - _Evidence:_ Sylvester's player-model principle [15]; Radiant AI growing invisible as it grew smooth [55]; Dwarf Fortress facets; CK3 and FM repetition [23]; Sims whims [33]; Compton's oatmeal (`language-prior-art.md`).
   - _Mechanism:_ each kind of state shows in acts that only it produces (`feelings-games.md` rule 1), and a kind of situation repeats in one life only when who, why or the outcome differs.
   - _Measure:_ the share of weighty events repeating a kind already had (32% today) must not rise; a "same situation, same partner, same answer" count per life.

## What is engine, what is domain

**Engine, any setting with people** (each appears in two or more of the systems above, across settings):

- wanting something scarce that another wants (a contest, a succession);
- the grudge and its cooling or payoff;
- betrayal after trust or a favour (the hospitality violation);
- a secret about an act, used as leverage or exposed;
- debt, favour and obligation (CK3 hooks, FM promises);
- loyalty tested between two attachments;
- a rise and fall in standing;
- a protégé who outgrows the mentor;
- jealousy and the triangle;
- a loss that changes someone;
- leaving and returning;
- a late bloom or a dropped ambition;
- what is believed against what is true (reputation, rumour, misunderstanding);
- a group's split and the factions in it;
- a promise kept or broken;
- inheritance and succession inside a family.

These need people, bonds, wants, beliefs and time, and nothing from a setting (inferred).

**Domain, belonging to a setting:**

- **Sport:** the season calendar, the table and the cup run, form and injury, transfers and windows, derbies, potential hidden behind numbers (the wonderkid).
- **Music:** the song and the record, the gig and the tour, the scene, creative differences over sound, signing and the label, a hit, fame and its loss.
- **Crime:** the deed, evidence and the alibi, investigation, guilt and confession, the law's verdict.
- **Politics:** office and elections, the vote count, coalition and defection, policy, scandal.

What a domain contributes is mostly a **public scoreboard and a calendar of stakes**, which a monthly town otherwise lacks: a fixed date when a contest is settled and everyone sees it (inferred from FM, CK succession, RimWorld raids). The engine should expose a way for a setting to declare such dates and tables. It must not make them, and it must not pace them by drama.

## Sources

1. Ryan, J. (2018). _Curating Simulated Storyworlds_. PhD, UC Santa Cruz. https://escholarship.org/uc/item/1340j5h2
2. Short, E. (2019). "Curating Simulated Storyworlds (James Ryan) – Ch 1-3". https://emshort.blog/2019/05/21/curating-simulated-storyworlds-james-ryan/
3. Short, E. (2019). "… Ch 4-5". https://emshort.blog/2019/05/23/curating-simulated-storyworlds-james-ryan-2/
4. Short, E. (2019). "… Ch 6f". https://emshort.blog/2019/05/28/curating-simulated-storyworlds-james-ryan-ch-6f/
5. Kreminski, M., Dickinson, M. and Wardrip-Fruin, N. (2019). Felt: a simple story sifter. ICIDS. Repository and README: https://github.com/mkremins/felt
6. Kreminski, M., Dickinson, M. and Mateas, M. (2021). Winnow: a domain-specific language for incremental story sifting. AIIDE. https://github.com/mkremins/winnow
7. Kreminski, M., Wardrip-Fruin, N. and Mateas, M. (2020). Toward example-driven program synthesis of story sifting patterns. https://ceur-ws.org/Vol-2862/paper18.pdf
8. Kreminski, M., Dickinson, M., Wardrip-Fruin, N. and Mateas, M. (2022). Select the unexpected: a statistical heuristic for story sifting. ICIDS, LNCS 13762, 292–308. _excerpt_ (bibliographic only)
9. Johnson-Bey, S. and Mateas, M. (2021). Centrifuge: a visual tool for authoring sifting patterns. PLIE. https://eis.ucsc.edu/papers/Johnson-Bey_Centrifuge_PLIE2021.pdf _excerpt_
10. Kreminski, M., Dickinson, M., Mateas, M. and Wardrip-Fruin, N. (2020). Why Are We Like This?: the AI architecture of a co-creative storytelling game. FDG; and AIIDE 2020 playable experiences. _excerpt_
11. Kreminski, M., Samuel, B., Melcer, E. and Wardrip-Fruin, N. (2019). Evaluating AI-based games through retellings. AIIDE. https://ojs.aaai.org/index.php/AIIDE/article/view/5223
12. Eladhari, M. P. (2018). Re-tellings: the fourth layer of narrative as an instrument for critique. ICIDS, LNCS 11318. _excerpt_
13. Kreminski, M. and Wardrip-Fruin, N. (2019). Generative games as storytelling partners. FDG. _excerpt_ (not cited above; background)
14. Clothier, K. and Millard, D. (2023). Awash: prospective story sifting with drama management. ICIDS. https://eprints.soton.ac.uk/482864 _excerpt_
15. Sylvester, T. (2013). The simulation dream. https://tynansylvester.com/2013/06/the-simulation-dream/
16. Game Developer (2016). How RimWorld fleshes out the Dwarf Fortress formula. https://www.gamedeveloper.com/design/how-i-rimworld-i-fleshes-out-the-i-dwarf-fortress-i-formula ; the L4D comparison from Wikipedia and press, _excerpt_
17. RimWorld Wiki, AI Storytellers. https://rimworldwiki.com/wiki/AI_Storytellers
18. RimWorld Wiki, Social. https://rimworldwiki.com/wiki/Social
19. Habrador (2019). Why RimWorld sold more than 1 million copies (notes on Sylvester, GDC 2017, "RimWorld: Contrarian, Ridiculous, and Impossible Game Design Methods", https://gdcvault.com/play/1024232). https://blog.habrador.com/2019/06/why-rimworld-sold-more-than-1-million.html
20. Kotaku (2016). RimWorld's gay women controversy, explained (on C. Lo's analysis in Rock, Paper, Shotgun). https://kotaku.com/rimworlds-gay-women-controversy-explained-1788555928 _excerpt_
21. CK3 Wiki, Relations. https://ck3.paradoxwikis.com/Relations
22. CK3 Wiki, Hooks. https://ck3.paradoxwikis.com/Hooks
23. Steam Community, Crusader Kings III discussions on repeated events, 2022–23 (e.g. https://steamcommunity.com/app/1158310/discussions/0/3838801919839423509). _excerpt_
24. PCGamesN (2015). How Crusader Kings 2 caught Paradox by surprise (Fåhraeus). https://www.pcgamesn.com/crusader-kings-ii/how-crusader-kings-2-caught-paradox-by-surprise
25. Kill Screen (2014). The fascinating story AI behind Crusader Kings 2's dark chain events (Fåhraeus, GDC). https://www.killscreen.com/fascinating-story-ai-behind-crusader-kings-2s-dark-chain-events/
26. TheSixthAxis (2019). Crusader Kings III preview (Oltner); PC Gamer, CK3 review ("root cause"). https://www.thesixthaxis.com/2019/10/23/crusader-kings-iii-preview-lifestyle-dynasty-religion-accessibility-knights-horse-pope/ _excerpt_
27. Game Developer. Q&A: dissecting the development of Dwarf Fortress with Tarn Adams. https://www.gamedeveloper.com/design/q-a-dissecting-the-development-of-i-dwarf-fortress-i-with-creator-tarn-adams
28. Kim, A. (2010). Game Narrative Review: Dwarf Fortress (Boatmurdered). GDC. https://media.gdcvault.com/gdc2010/GNR/Andy%20Kim_2010.pdf
29. Wikipedia, Boatmurdered; Let's Play Archive introduction. https://en.wikipedia.org/wiki/Boatmurdered , https://lparchive.org/Dwarf-Fortress-Boatmurdered/Introduction _excerpt_
30. Adams, T. (2019). Emergent narrative in Dwarf Fortress. In Short, T. X. and Adams, T. (eds.), _Procedural Storytelling in Game Design_. CRC Press. _excerpt_ (opening only)
31. Dwarf Fortress Wiki, Legends; Historical figure. https://dwarffortresswiki.org/index.php/v0.34:Legends _excerpt_
32. Knight, J. (2004). The Sims 2 Designer Diary #8 (aspirations), GameSpot; StrategyWiki, The Sims 2 Wants and Fears. https://strategywiki.org/wiki/The_Sims_2/Wants_and_Fears _excerpt_
33. SimsCommunity (2022). Looking back at The Sims 2 wants and fears. https://simscommunity.info/2022/08/31/looking-back-at-the-sims-2-wants-and-fears/
34. StrategyWiki, The Sims 2 Memories; GameSpot, The Sims 2 Designer Diary #3. https://strategywiki.org/wiki/The_Sims_2/Memories _excerpt_
35. TechCrunch (2009). Interview: Rob Burkinshaw, creator of homeless Sims. https://techcrunch.com/2009/06/18/interview-rob-burkinshaw-game-designer-and-creator-of-homeless-sims/
36. Wright, W. GamesBeat Q&A; Electronic Book Review response excerpt. https://gamesbeat.com/game-horizons-will-wright-qa-part-two/ _excerpt_
37. EA Forums, The Sims 4 unplayed households and story progression threads (e.g. https://forums.ea.com/discussions/the-sims-4-gameplay-en/inactive-households-stop-the-free-will/8546694). _excerpt_
38. GamesBeat (2015). Shadow of Mordor's Nemesis system draws from Burnout, football, and an architecture book (de Plater, DICE). https://gamesbeat.com/shadow-of-mordors-nemesis-system-draws-from-burnout-football-and-an-architecture-book/
39. Wikipedia, Middle-earth: Shadow of Mordor (Nemesis system; reception). https://en.wikipedia.org/wiki/Middle-earth:_Shadow_of_Mordor
40. Patent Arcade (2021). Warner Brothers granted patent for Nemesis system (US 10,926,179). https://www.patentarcade.com/2021/02/warner-brothers-granted-patent-for-nemesis-system-from-middle-earth-video-games.html
41. Turn Based Lovers. 10 turns interview with the Wildermyth developer; GDC Vault, "Getting players emotionally invested in procedural characters in Wildermyth". https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer , https://gdcvault.com/play/1027614
42. Grinblat, J. and Bucklew, C. B. (2017). Subverting historical cause & effect: generation of mythic biographies in Caves of Qud. FDG. https://freeholdgames.com/papers/Generation_of_mythic_biographies_in_Cavesofqud.pdf
43. Johnson, M. R. (2016). Procedural generation of linguistics, dialects, naming conventions and spoken sentences. DiGRA/FDG. https://pcgworkshop.com/archive/johnson2016procedural.pdf ; https://www.markrjohnsongames.com/games/ultima-ratio-regum/
44. The Drum (2021). How to build and rebuild a brand: Football Manager's 20-year route (Jacobson); Balls.ie, Jacobson on wonderkids. https://www.thedrum.com/news/2021/05/21/how-build-and-rebuild-brand-football-manager-s-20-year-route-the-top , https://www.balls.ie/gaming/football-manager-wonderkids-miles-jacobson-477312 _excerpt_
45. SortItOutSI, FM26 guide: how liked and disliked people/clubs work; TheSixthAxis (2025), Relationships through the lens of FM24. https://sortitoutsi.net/content/77604/fm26-guide-how-liked-and-disliked-peopleclubs-work , https://www.thesixthaxis.com/2025/05/31/relationships-through-the-lens-of-football-manager-2024/
46. Booth, M. (2009). The AI systems of Left 4 Dead. Valve, AIIDE keynote slides. https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf
47. Mateas, M. and Stern, A. (2003). Façade: an experiment in building a fully-realized interactive drama; Plotkin, A. (2008), notes on Mateas's talk on Façade. https://users.soe.ucsc.edu/~michaelm/tenurereview/publications/mateas-tidse2003.pdf , https://blog.zarfhome.com/2008/11/michael-mateas-talk-on-facade
48. Evans, R. and Short, E. (2014). Versu: a simulationist storytelling system. _IEEE TCIAIG_ 6(2). https://www.cs.uky.edu/~sgware/reading/papers/evans2014versu.pdf
49. Si, M., Marsella, S. and Pynadath, D. (2005). Thespian: using multi-agent fitting to craft interactive drama. AAMAS. https://www.khoury.northeastern.edu/~marsella/publications/abstracts/SiMarsPynAAMAS05-abstract.html _excerpt_
50. Louchart, S. and Aylett, R. (2003). Solving the narrative paradox in VEs: lessons from RPGs. IVA, LNCS 2792; Aylett, R. (1999). Narrative in virtual environments: towards emergent narrative. AAAI Fall Symposium. https://www.macs.hw.ac.uk/~ruth/narrative.html _excerpt_
51. Walsh, R. (2011). Emergent narrative in interactive media. _Narrative_ 19(1), 72–85. https://muse.jhu.edu/article/413054 _excerpt_
52. Swartjes, I. and Theune, M. (2008). Late commitment: virtual story characters that can frame their world; Let's pretend I had a sword. ICIDS/IVA. https://research.utwente.nl/en/publications/lets-pretend-i-had-a-sword-late-commitment-in-emergent-narrative/ _excerpt_
53. Tanenbaum, T. J. (2008). Believability, adaptivity and performativity: three lenses for the analysis of interactive storytelling. MA thesis, Simon Fraser University; Tanenbaum, J. and Bizzocchi, J. (2009). Close reading Oblivion. _Loading…_ https://summit.sfu.ca/item/8972 _excerpt_
54. Gomes, P., Paiva, A., Martinho, C. and Jhala, A. (2013). Metrics for character believability in interactive narrative. ICIDS, LNCS 8230, 223–228. _excerpt_
55. FRVR (2024). Bruce Nesmith on Radiant AI. https://frvr.com/blog/news/elder-scrolls-designer-explains-that-radiant-ai-is-an-enormous-investment-for-bethesda-but-every-improvement-actually-makes-it-less-noticeable-to-players/
56. PC Gamer (2026). "Dwarf Fortress creator says we have a natural lean towards human-made stories" (Adams at Gamescom). https://www.pcgamer.com/gaming-industry/game-development/dwarf-fortress-creator-says-we-have-a-natural-lean-towards-human-made-stories-but-but-were-all-going-to-be-very-sorely-tested-in-the-coming-years-by-ai/ _excerpt_
