# Game shapes: one engine, many games

Can one engine of people carry every kind of game in the notebook? This note answers that, says how flexible the engine should be, and names what must be settled now so that no later game is blocked. Capability codes (R, A, T, O…) are those of `notes/game-demand-map.md`. Engine facts are read from `Herreklo/Understory` (`src/`, `docs/`); Overstory facts from `Herreklo/Game-labratory`.

How each game plays is Overstory's to design. This note is the engine's side: what games need from it, and the rules of the contract between them.

## The answer

Yes, one engine can carry all of them, on two conditions. The engine is the authority on people: what they want, feel, decide and believe, how they grow, and what lasts. Each game brings its own domain as a simulation beside the engine: how a match is played, how a song lands, how a hotel's books balance, how evidence is found.

It cannot carry them all equally at once. The first game decides which engine work comes first, and the engine should not grow a mode for any game.

Four rules should be settled now, because the front door's next part (#22) is designed around them. Two directions should be set when the work they shape begins. Everything else can wait for the game that needs it.

## How games differ

The games in the notebook differ along six lines.

| | Band manager | Football manager | Hotel | Detective | Newspaper | Family legacy | World observer |
|---|---|---|---|---|---|---|---|
| **Where the player stands** | A person who runs something small | A person who runs something large | A person who runs something large | One person, or a small team | A person who decides what is told | A line of people, one after another | No one |
| **What the player controls** | Individuals, one by one | Individuals and structure | Mostly structure | Their own acts | What is published | The head of the family's acts | Nothing; where to look |
| **What the player reads** | Their own people, closely | Their squad closely, others through scouts | Many people, through others' reports | Strangers, from evidence and testimony | The town, through sources | Their own family over generations | The truth |
| **The clock of play** | Evenings and months | Matches and seasons | Shifts and seasons | Hours and days | Days | Years and generations | Any |
| **The reach of the world** | A circle of a few hundred | A city's football world | The staff, guests and suppliers | Wherever the case leads | The whole town | A family and its town | A city |
| **The domain the game builds** | Music and its business | Football | Hospitality | Crime and evidence | Publishing | Inheritance and standing | None |

The other ideas fall along the same lines. The fixer, matchmaker and mediator stand where the detective stands. The festival programmer, union representative and radio producer run something. The archivist and the social archaeologist read the past from traces. The anthology and the counterfactual observatory stand where the observer stands.

Three findings come out of the table:

- **Where the player stands is the deepest difference.** It decides what the player can know and what the world knows about the player.
- **Control and reading vary independently.** A band manager controls and reads the same people. A detective controls one person and reads strangers.
- **Every game has a domain of its own.** Rich people cannot make up for a shallow game (`WHY.md`).

## What the engine has for each line

"Designed" means written in the engine's docs and not yet built.

| Line | What the engine has | What is missing |
|---|---|---|
| **Where the player stands** | The witness: one working adult, picked automatically (preferring the bar, the paper or the clinic), or none. Their choices are made like anyone's, but they arrive knowing ten years of public news, hear more local news than others, and their reads are written into the record. Explanations and surprise are scored against what they know. Everyone else also holds beliefs about the people whose acts they see or hear of. | Choosing or making the witness. Saying which of the witness's decisions are the player's. |
| **What the player controls** | Nothing yet. The front door's part two (#22) designs the first command: an act, who does it and toward whom. The engine checks its conditions, and if they hold, the other person's own decision answers. | Orders inside an organisation, standing instructions, structural levers (roles, rules, who is hired). |
| **What the player reads** | What the player knows is kept apart from what is true. Beliefs are learned from what people are seen to do, and reading people works. People remember the acts done to them. | Accounts that travel (the arc stopped at round 31), reports from people the player relies on, reads of a group, traces. |
| **The clock of play** | A monthly clock. Each person meets at most one matched situation a month, besides answers queued from the month before and the decisions couples, groups and plans raise. | Anything shorter than a month. |
| **The reach of the world** | Built: a city of neighbourhoods of about 80, one of each kind of workplace per neighbourhood, and promotion of a neighbourhood into focus (3.8 to 5.1 seconds each). A month at about 2,600 people runs in about 2.2 seconds. Designed: focus that follows the player's story, usually 1,000 to 3,000 people. Not yet timed: a month of a city of 100,000 (exit point 7). | Institutions bigger than a neighbourhood. Focus that follows an organisation whose members live all over the city. |
| **The domain** | The setting pack names places (each with one role, one skill and room for three to six), skills as aptitude weights, and kinds of group (a band of two to four). A small music domain sits inside the engine: a song's quality, and a show's quality from the songs, the members' skill, their chemistry and the front person's nerves. | Every other domain. |

## Settle now: four rules

These cost little now. They are design rules for #22, which is on the priority list, and for Overstory's first scenes. Building them is #22's work.

### 1. The player acts; people decide

The player is a person in the world, or no one. Never a hand from above.

- **The player's person is the witness.** The engine's whole layer of knowing is built around the witness. It covers what they arrived knowing, what they hear, their written reads, and explanations scored against what they know. The game chooses who the witness is when the world is created: a newcomer arriving with no ties, or someone who has lived the thirty years. The engine generates that person by its own rules from the conditions the game asks for.
- **The game names which of that person's decisions are the player's.** A band manager's own love life can run by itself or be played. The engine still weighs every option for the player's person, so a game can make acting against one's nature cost something, as Crusader Kings does with stress.
- **The world reads the player as the player reads the world.** Everyone who sees the player's acts takes them as evidence about the player's character. The player's reputation is what people believe about them. A person already remembers the acts done to them, so a broken promise is remembered by the one it was made to.
- **The player never sets anyone else's choice.** An order, a request or an offer is an act of the player's person. The other person answers it through their own decision. Authority and contracts weigh in that answer, but it stays theirs, with its reasons: "did as told, though she thought it wrong".
- **A team is the player's person plus people the player directs.** What they find out reaches the player when they tell it. The same holds for a hotel's heads of department, a club's scouts and a paper's reporters. This depends on accounts that travel.
- **Observer games have no player person.** The game reads the world directly.

### 2. People in the engine, domains beside it

The engine decides what people do. A game's domain simulation decides what comes of it in its domain: how the set sounded, who won the match, how full the hotel is, what the forensics show.

A domain simulation follows the engine's discipline. It is deterministic and keeps the engine's arithmetic and order (portability rules 3 and 4), so a saved game replays exactly. Every outcome carries its reasons, and a language model only writes words.

It reads people through the front door: skill, form, strain, chemistry, what they believe. It commits outcomes back through the same door as events: "the gig drew forty people; the second half fell flat". It never decides a person's act. When the drummer blames the singer afterwards, that is the drummer's decision, made by the engine in answer to the event. The front door has no command to commit an outcome yet; #22 needs one.

The engine's own music domain stays, as the default for the town and for the band experiment. A game that brings its own music simulation turns it off and commits its own outcomes through the same command.

For Overstory, the standing rule "the engine decides, Unity draws" becomes three parts: the engine decides people, the game's domain simulation decides its domain, Unity draws.

### 3. Two clocks, one truth

The month is the clock of lives, and it belongs to the engine. The scene is the clock of play, and it belongs to the game: an evening, a match, an interview, a shift.

- **A scene plays situations the engine raised.** It brings forward a situation the engine matched or queued for someone this month and plays it now, with the player present. A scene never makes up a situation, because a situation with no cause in the world is a scripted one, and its decision would have no true reason.
- **Inside a scene, every choice a person makes is the engine's.** It goes into the record like any other decision, with its reasons.
- **The domain simulation decides the domain's outcomes**, which are committed as events.
- **Only the scene's own state stays local.** That means where people stand, the lines of dialogue a language model writes, the light. Overstory already treats local scene state this way.
- **A person who met their matched situation in a scene meets no other matched situation that month.** Everything else in the month runs as usual.
- **Every choice draws on the chooser's own dice.** A world replays exactly from its versioned snapshot and the player's commands.

Overstory rates two clocks as research and notes that nobody has defined what a scene commits. This rule is that definition.

### 4. Select, never script

A game may choose:

- **The world and the moment.** It can search many seeds for a good start. A band about to form, a club in debt, a death with three people who had reasons.
- **The starting conditions**, through the setting pack and the world's creation.
- **Whom to follow, what to show and which scenes to play.**
- **External events**, from the setting's timeline: the economy, the seasons, the town's day. These are fixed in the pack, not aimed at the player.

A game may never write a person's act into a life, change a decision, or make the world react to the player except through people.

A game may author a cause of its own domain or setting: a fire at the mill, a will read out, a gig that drew forty people. It is recorded through the front door as an event with its reasons, and people answer it through their own decisions. What no game authors is what a person does about it, or how that turns out.

This is what makes "nobody knows who the murderer is" true, for the player and the designer alike, and what makes every playthrough unique. It also means the murderer's motive is real: it is the reasons in the record.

What it costs: games depend on the engine making enough happen. The rate of consequential events (exit point 2) becomes a game requirement. Story sifting becomes core infrastructure, used to choose worlds at the start and to decide where to look during play.

## Set when the work begins: two directions

### 5. One kind of organisation, from two people to hundreds

Today a group is a band of two to four, and a workplace is a place with one role, one leader and room for three to six. Membership can be marked voluntary or contractual, but only voluntary is used. Every neighbourhood has one of each kind of workplace.

The games need a club with a squad, staff and an academy; a hotel with departments; a paper with desks; a police station. They need one concept that scales:

- an organisation has members with roles, and can have units (a department, the squad) with leaders of their own;
- membership is voluntary or contractual, and the difference changes what leaving costs;
- it has norms carried in what its members believe (exit point 9, `notes/organisations-concept.md`);
- it can draw members from the whole city.

A band is its smallest case. A city has local institutions, one per neighbourhood (a school, a bar), and city institutions, one or a few per city (a club, a paper, a big hotel, the council). City institutions are an addition to what is built.

When: as the design of exit point 9 begins. The organisations note already treats groups and workplaces as one thing.

### 6. Focus follows people and organisations

Today focus is whole neighbourhoods. A hotel of 150 staff living in 40 neighbourhoods would bring about 3,200 people into focus, past the usual range, and take about three minutes to promote.

Focus should take in:

- the player's organisation, wherever its members live;
- their close ties: partners, family, close friends, the boss at a second job;
- the organisation's counterparts: venues and a label for a band, suppliers and rivals for a hotel.

At large sizes, close ties can sit one tier down, as full people who make no decisions of their own until a story touches them. The city design has this tier ("in view", designed, not built).

When: before the first game at the size of a club or hotel. For a band, today's rule is affordable.

## How flexible it should be

As flexible as data allows, and no more:

- The rules of people are universal. No setting, no country and no game is written into them.
- Everything about a setting is data in a pack: places, trades, skills, kinds of organisation, the era, the timeline, the words. Today the pack, the acts and their words are written as code, with some functions among them (`setting.ts`, `families.ts`, `motives.ts`; a known debt under portability rule 7). Moving them to data is real work and comes before a second pack.
- Everything about a domain is the game's, apart from the music default.
- There are no game modes. The engine has no football switch and no detective setting.

The test is that a new game needs a new pack, a domain simulation and a front end, and no change to an engine rule. A second pack very unlike the town is the proof, and the right time for it is the first game.

Flexibility to resist:

- an engine clock shorter than a month;
- new domain systems inside the engine;
- games writing into the world except through commands;
- a director that aims events at the player;
- a language model deciding anything.

## Where it stops

- **Action and reflex play.** Scenes are conversations, choices and outcomes, not seconds of movement. None of the notebook's games needs reflexes.
- **Authored plots.** A fixed mystery with a twist written in advance conflicts with rule 4. A game can author the premise (a body found, a will read out) as a cause of its domain, but not who did it or what anyone does next. The engine makes something closer to nonfiction than fiction, so the games must be built around player-driven, systemic stories. The notebook's games already are.
- **Everyone deep at once.** A few thousand people at full depth at a time; the rest of the city exists in full but is lived once a year. Until a city month is timed (exit point 7), games with a wide reach carry that risk.
- **Quiet worlds.** If a small cast meets too little that matters, rule 4 forbids forcing it. The fix lies in the engine (exit point 2), in choosing worlds, and in wider focus. This is the largest risk to the games.

## What can wait

| What | When it is needed |
|---|---|
| Which game comes first | When exit points 1, 2 and 9 are close: close ties, consequences and groups are what every game in the table is made of |
| Domain simulations | With the first game, built in the game's own repo |
| The setting pack as data | Before the second pack |
| Each game's levers: orders, standing instructions, rules, roles | In the first game's design |
| The player's person changing: an heir, a transfer | A game that spans generations or careers |
| One world entered from several positions | After the first game; a world is already plain data, so a person can carry across |
| A short clock for a small set of people | The detective game, if scenes alone cannot carry an investigation in which people talk among themselves over days |
| Neighbourhoods leaving focus | Long games where the story moves across the city |
| Fame: how far news about someone travels | The newspaper, the radio producer, football stardom |
| Serious crime | The detective game. The engine has small dishonest acts today: taking a little, lying to cover, letting someone take the blame |
| Physical traces and records | Overstory's lane; the engine supplies the record |

## What is already right

These are why every shape is possible, and no single game should trade them away:

- **The front door.** Games meet the engine through one boundary that hands out plain data.
- **Determinism.** A saved world is a versioned snapshot, and a seed makes the same world in any JavaScript engine. Replays and what-ifs come free.
- **Knowing apart from truth.** What the player knows is kept apart from what happened, which is the heart of every game in the table.
- **Every decision carries its reasons.** This lets an interface answer "why?" at any depth, and makes a detective's motive real.
- **The setting is content.** It is a pack, not rules.

## Decisions for the owner

1. Adopt rules 1 to 4 for every game, written where both projects read them. Change Overstory's standing rule to "the engine decides people, the game's domain simulation decides its domain, Unity draws".
2. Ask #22 to carry rules 1 to 3. The game chooses the witness when the world is created, and names which of their decisions are the player's. Commands are acts of the witness. A scene can bring forward a situation the engine raised and play it now. Domain outcomes can be committed as events.
3. Free #22's first command from the stopped accounts arc. Inviting someone to a rehearsal can be remembered through the memory a person already keeps of acts done to them.
4. Keep the engine's music domain as the default for the town and the band experiment, replaceable by a game's own.
5. Set directions 5 and 6 when the design of exit point 9 and the first large game begin.
