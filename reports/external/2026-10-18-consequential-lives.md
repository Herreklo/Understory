# External review, 18 October 2026: "How I would try to make The Lab substantially more sophisticated"

From an outside reviewer, given the review archive of 18 October (main at 00ff494 with the open rounds 25d, H26, M26). Kept as received, with its link decorations removed. The standing rule applies: external reviews are read and checked against the code, never acted on reactively. The lab's reading of it is at the end.

---

After looking again at the latest source snapshot and comparing it with research in cognitive architectures, artificial societies, psychology, and social simulation, I think there are some promising directions worth investigating. And I don't think the solution is necessarily to build a larger psychological model.

My central hypothesis is that The Lab needs stronger connections between what people experience, what they believe, what they want, what they do, and how those actions change the world around them. That may sound obvious, but it has significant implications for the architecture.

Your current system already models quite a lot: HEXACO personality facets, values, aptitudes, and situational tendencies; emotions, stress, habits, attachments, memories, and self-image; friendships, romantic relationships, rivalries, group dynamics, and personal pursuits; decisions with recorded reasons, plus partial knowledge held by observers; a persistent world with events, jobs, organizations, and changing circumstances. So I wouldn't recommend throwing this away and starting with an entirely different AI approach. What I would investigate is whether the existing components can be made to operate as a more coherent, causally interconnected system.

## 1. The biggest opportunity: people should interpret what happens to them

Consider a band performing terribly at its first important concert. In a relatively simple simulation, the event produces changes to confidence, stress, reputation, relationships, and possibly musical motivation. That's useful. But those effects are often predefined by the event type. What interests me more is a system in which different people interpret the same event differently, and those interpretations influence their futures.

One event, four possible interpretations. The band performs badly; the audience leaves early. Emma: "I wasn't prepared." Practices harder, becomes more disciplined. Jonas: "The others let me down." Trust falls; starts considering another band. Leah: "Maybe I'm not meant for this." Avoids performing; privately keeps writing songs. Daniel: "At least we tried something new." Pushes the band toward more experiments. (Illustrative possible outcomes, not predetermined personality-to-reaction mappings.)

The critical point is that these interpretations shouldn't be assigned arbitrarily. They could depend on expectations, previous experiences, responsibility, relationships, personality, self-image, and current goals. Then the interpretations could generate new beliefs and motivations that affect future decisions. The chain becomes: an event occurs; the person perceives and interprets it; beliefs, emotions and expectations update; goals and relationships are reconsidered; the person acts on those changes; the world responds, creating further experiences.

This creates the possibility of genuine development without requiring enormous changes to core personality traits. Someone might remain fundamentally cautious while gradually becoming more willing to perform publicly because they've accumulated evidence that they can succeed. Someone else might remain highly ambitious but change their ambitions from fame to artistic independence. Those can be meaningful life changes even when their underlying HEXACO profile barely moves. This is the first area I'd investigate seriously. There is established research behind it, including computational emotion-appraisal systems and autobiographical memory models.

## 2. Existing systems I'd study, and what I'd take from them

I wouldn't copy any of them wholesale. The interesting opportunity is to combine selected mechanisms with The Lab's existing deterministic engine, observer system, and causal experiments.

- FAtiMA Toolkit (GAIPS): emotions and interpretation. Characters evaluate events emotionally, beliefs affect reactions, social relationships influence decisions. What I'd investigate: treating emotion as a response to the perceived meaning of events, rather than primarily as a state modifier.
- PsychSim (Pynadath, Marsella): people reasoning about other people. Agents model what they believe other agents think and may do. What I'd investigate: a person acting on their expectations of a specific other person's reactions, rather than only on affection, trust, or general traits.
- Talk of the Town (Ryan et al., AIIDE): knowledge, rumours and mistaken beliefs. Characters observe events, share information, forget, misremember and lie. What I'd investigate: a social world where specific information travels through relationships and produces actual decisions, not merely reputation-score changes.
- Comme il Faut and Versu: reusable social situations. Versu uses social practices that give autonomous agents opportunities to act without directly controlling their choices. What I'd investigate: reusable social scenarios (auditions, rehearsals, disagreements, negotiations, hiring, public performances) with participants retaining agency.
- Generative Agents (Park et al., 2023): observation, reflection and planning. What I'd investigate: memory-informed reflection and future planning, without adopting an LLM as the decision engine.
- Winnow and Felt (Kreminski et al.): story sifting, finding narratively interesting sequences within large event histories; Winnow can detect developing patterns before the sequence has finished. What I'd investigate: recognising when an emerging relationship, rivalry, ambition, or series of setbacks deserves attention, without scripting its ending.

Of these, I'd prioritise FAtiMA, PsychSim, and Talk of the Town, because they concern how a person's experiences and beliefs actually influence behaviour. Story sifting becomes especially valuable when turning the simulation into something a person can explore or play.

An important qualification: these aren't six proven solutions. Each makes different assumptions and solves a different problem; some were research demonstrations rather than scalable engines. Fully recursive theory-of-mind reasoning can become computationally expensive and difficult to validate. I would borrow the principles first, rather than the implementations.

## 3. A more explicit model of goals and intentions

The Lab already has `Want` and `Pursuit` structures in `src/world.ts`, with urgency, plans, effort, progress, setbacks, and outcomes. But the experiments still report that 62% of adults pursue nothing across ten years. That doesn't mean those people literally want nothing; it means the system records no qualifying pursuit for them. I wouldn't solve that by making everybody pursue a major project at all times. Instead, I'd consider a distinction between levels of motivation:

| Level | Example | Typical duration |
| --- | --- | --- |
| Immediate need | Get some rest after work | Hours or days |
| Short-term intention | Practice guitar before Friday | Days |
| Active goal | Become confident performing live | Months |
| Sustained ambition | Make a living from music | Years |
| Personal value | Maintain independence | Potentially lifelong |

A person wouldn't need an active goal at every level. Someone might have no major ambitions and still make hundreds of meaningful decisions through everyday needs, commitments and relationships.

Belief–Desire–Intention (BDI) distinguishes what an agent believes, what it would like to achieve, and what it has actually committed to pursuing. That last distinction is valuable: wanting to become a musician doesn't mean deciding to become one; deciding doesn't guarantee acting; acting doesn't mean remaining committed when circumstances change. BDI systems have also explored combining prepared plans with dynamically constructed alternatives when a plan fails.

Example: Emma, 24, wants to perform professionally; her current intention is to audition for a local band; the obstacle is that she cannot attend rehearsals; the competing commitment is income from evening shifts. Alternatives: negotiate a different shift pattern; practise independently for another year; abandon the audition and keep her job. Her employer then has a decision to make, depending on staffing, their relationship, her work history. Now the employer is also simulated: maybe they want to help but cannot afford to lose staff; maybe another employee swaps shifts; maybe Emma finds another job. A personal ambition has begun interacting with the environment and other people's ambitions. This is the kind of complexity I would seek: not additional attributes, but additional meaningful dependencies. The key research question would be whether richer intentions produce coherent, persistent differences in people's lives, or merely more activity.

## 4. Memory more active in decision-making

The Lab records events, relationship memories, self-stories, and acquired reactions. I'd investigate whether memory retrieval could become more context-dependent. A person doesn't reconsider their entire history before every decision; specific circumstances bring particular experiences to mind. A musician asked to perform with a former bandmate might recall a betrayal, a wonderful concert, a humiliating argument, or the last successful collaboration, depending on present emotional state, current goals, the other person, and the situation. Research on autobiographical memory (Conway) emphasises that remembering is an active process connected to the self-concept and current goals.

What I'd explore: the world retains the factual event; the person retains a memory or interpretation of it; when something relevant occurs, the person retrieves one or several memories, weighted by relevance, recency, emotional significance, repetition, and personal meaning; those memories temporarily influence appraisal and decision-making. A remembered event might also contribute to a longer-lasting conclusion ("the last three people who promised to help me eventually disappeared"), a personal generalisation that influences future trust. One warning: I'd be careful not to simulate false memories by modifying historical events. The objective history and the person's account of it should remain separate; that matters especially if the same world eventually supports a detective game.

## 5. The town should develop beliefs about specific actions, not just reputations

The existing `Belief` structure represents estimates about characteristics and tendencies. Event records already contain participants, causes, visibility, and who witnessed something. I'd bring these closer together. Instead of only knowing that somebody's trustworthiness is estimated at 0.4, an individual might believe "Jonas took credit for a song Emma wrote"; another might believe "Emma is falsely accusing Jonas because she's jealous"; a third might know exactly what happened. These beliefs should carry a source, degree of confidence, and history. Crucially, people should be able to act on those beliefs even when they're false.

Example: Jonas takes credit for a song Emma wrote. Emma knows; she loses trust, becomes reluctant to collaborate, may confront him. Leah hears Emma's account; she trusts Emma but likes Jonas; she is conflicted and may ask someone else. A local promoter hears a distorted version and incorrectly believes Emma is difficult to work with. Someone offers Emma another opportunity, which makes it easier for her to leave the band. One event has affected multiple lives through information, interpretation, and subsequent decisions, not a scripted chain. I wouldn't expect every event to spread like this; most should have little effect beyond those involved. But consequential events should sometimes propagate through relationships and institutions in ways that make sense. This is directly relevant to a weakness in the archived results: only around 6% of tracked weighty-event consequences reached somebody outside the initial event's participants. Increasing that percentage alone isn't the goal; an indiscriminate rumour system would produce meaningless consequences. The goal is plausible propagation.

The technical distinction I'd make: world facts (what occurred); individual beliefs (what a particular person thinks occurred, and why); individual responses (what that person decides to do based on those beliefs). The event system provides the first layer and the witness system part of the second. The missing work is making beliefs more expressive and consequential.

## 6. People should live inside institutions that have histories of their own

`Group` tracks members, works, standing, chemistry, former members, and historical events. But a persistent band, company, club, newspaper, or community organisation could have an identity that shapes its members' behaviour: norms and traditions developed through repeated behaviour; commitments, resources, responsibilities, collective goals; a reputation that varies across audiences; a history of successes, failures, conflicts, influential members; expectations that newcomers learn and sometimes challenge. A band with a reputation for experimental music: its audience expects experimentation; a newcomer joins because of it; an existing member wants a more commercial direction; the band's identity becomes part of the conflict. Social practices (Versu) are useful here: an audition, rehearsal, board meeting, job interview, or family dinner has roles, expectations, social rules, and opportunities to act; individuals can follow or violate them. A musician refusing to rehearse because the songwriter has too much control can become a dispute about the band's decision-making norms; the norms might change; the changes influence who wants to join and how future disputes are resolved. I would explore a distinction between a group's current membership and the ongoing identity of the organisation. People shape groups, groups shape people, and both retain the consequences of their shared past.

## 7. Emotions as appraisal and coping, not just intensity

Two people are fired. One is angry because the dismissal was unfair; another relieved because they wanted to leave; a third frightened because the family depends on the income; a fourth embarrassed because friends will judge. Emotional appraisal evaluates events in relation to goals, expectations, responsibility, controllability, and personal significance (EMA, Marsella and Gratch). What interests me most is what happens afterward: an angry person seeks confrontation; an anxious one reassurance; a discouraged one withdraws; a resilient one reinterprets the setback; and the same person responds differently depending on how much control they believe they have. It would connect systems The Lab already contains: events → expectations → emotions → coping strategies → decisions → changed circumstances. Emotions would influence which goals feel urgent, which memories become relevant, which options the person considers, and how they understand what happens next. I would make this a focused experiment rather than an enormous new subsystem; often the realistic response is temporary.

## 8. Be careful about adding more personality variability

The draft round 27 proposes person-specific fluctuations around stable trait levels. The theory is relevant (Mischel and Shoda's stable if-then patterns). However, I'd investigate a question before implementing substantial additional variation: are The Lab's people too predictable because their traits are too stable, or because their situations and internal interpretations aren't rich enough? Those are different problems. Suppose somebody nearly always refuses a risky opportunity. You could introduce variability and make them occasionally accept. But perhaps the more interesting solution is to give them a reason to accept: a trusted friend offers support, their financial situation changes, or a recent success alters their confidence. The second creates variation the player can understand. That doesn't eliminate the value of natural fluctuation; it suggests testing contextual causes before increasing random variability. I'd compare the approaches rather than assume either is better.

## 9. How I would use LLMs and modern AI research

Replacing the decision system with an LLM is tempting; I wouldn't do it by default, nor rule it out. Generative Agent Simulations of 1,000 People (Park et al., 2024) matched survey responses 85% as accurately as participants repeated their own answers two weeks later: a specific normalised survey result, not 85% general realism. Centaur (2025) was trained on 60,000 participants across 160 psychological experiments and performed well on held-out decisions. Learned models can capture patterns hand-written rules miss. But The Lab has strengths typical LLM-driven simulations struggle to guarantee: inspectable decision rules, deterministic replay, explicit world state, controlled counterfactuals. I wouldn't give those up lightly.

A hybrid, only where it proves useful: world facts and consequences, deterministic simulation; available actions and constraints, structured rules; personality, motivation and decisions, the existing engine, possibly enriched by learned models; dialogue and descriptions, authored grammar or optional language-model assistance; story discovery, event-pattern detection; validation, deterministic tests, behavioural comparisons, human evaluation. One experiment: an LLM proposes possible strategies for an unusual problem (a musician who cannot afford equipment: borrow, save, fundraise, collaborate, find work); the world validates which exist; the person model evaluates which the character considers, wants, and can attempt. This introduces complexity, cost, reproducibility challenges, and another source of errors; I would require evidence it improves the experience before adopting it.

## 10. The research method matters as much as the new mechanisms

Preserve the experimental discipline: seeded simulation, ablation switches, the witness scoreboard, counterfactual tests, archived comparisons. But distinguish questions more explicitly:

| Question | How I would investigate it |
| --- | --- |
| Do people behave consistently with their histories? | Controlled behavioural tests and history-swapping experiments |
| Do experiences change later choices? | Matched counterfactual worlds |
| Do relationships produce understandable differences? | Repeated situations with different relationship histories |
| Does information travel plausibly? | Multi-person propagation experiments |
| Do groups develop distinct cultures? | Longitudinal comparisons across groups |
| Do humans understand these simulated people? | Blinded participant studies |
| Are the resulting lives interesting? | Independent narrative evaluations and interaction tests |

Be cautious about any one psychological benchmark: a model can reproduce expected frequencies of divorces, friendships or career changes while producing unconvincing individual stories. Matching aggregate patterns does not establish that the mechanism is correct; external validity requires separate work.

Three revealing experiments. A, same person, different life: two otherwise identical worlds; in one a person receives an important opportunity; follow ten years with unrelated randomness held constant; compare beliefs, interests, goals, skills, relationships and decisions, not only outcomes. Does experience produce coherent development or isolated numerical differences? B, one event, a social network: a consequential experience involving others (betrayal, generosity, public success, a broken commitment); follow who learns of it, what they believe, whether beliefs change actions; repeat across networks. Can an event create believable second- and third-order consequences without indiscriminate contagion? C, five people form a band: different skills, ambitions, constraints, relationships, interests; a year of rehearsals, opportunities, disagreements, changing ability, creative work; compare starting circumstances and interventions. Does the collaboration produce understandable, distinctive histories, or mostly random success and relationship changes? C ties to the original inspiration without committing The Lab to being a music game, and exposes weaknesses a general town simulation might hide: can someone develop an ambition through another's encouragement; can a group develop a distinct identity; can two talented people collaborate badly while a less skilled group becomes exceptional together?

## 11. A possible architecture for the longer term

Not an immediate rewrite. World and history (people, places, organisations, resources, factual events, constraints); individual minds (traits and values; beliefs and memory; needs and intentions; emotional appraisal; relationships; skills and learning); actions and interactions (choices, conversations, collaboration, conflicts, plans, consequences); domain systems (music and culture; work and economics; sport; institutions; places and movement); experience and presentation (observation, visualisation, narrative discovery, interaction, possible games). The arrows are bidirectional. One principle I'd strongly favour: a factual world event is represented once, while multiple people can have different interpretations of it. A conceptual separation of responsibilities, not a recommendation to introduce five elaborate subsystems now; the current engine already spans much of it.

## 12. What I'd investigate first, and what I'd leave alone

| Direction | Potential impact | My concern |
| --- | --- | --- |
| Event interpretation and aftermath | Very high | Can introduce artificial, overly dramatic reactions |
| Persistent intentions and alternative plans | Very high | Can produce repetitive goal loops |
| Beliefs about specific acts and information spread | Very high | Complexity grows with the social network |
| Contextual memory retrieval | High | Risk of redundant representations and hidden feedback loops |
| Institutional identity and group culture | High | Requires sufficiently developed environments |
| Appraisal-driven emotion and coping | High | Could duplicate existing emotions and stress |
| More trait variation | Uncertain | Might conceal missing situational depth with randomness |
| LLM reasoning or dialogue | Potentially useful | Expense, consistency and evaluation difficulty |
| Larger population | Limited immediate benefit | Scales existing weaknesses along with strengths |

"First" is not "must be built now". Some changes may turn out not to help; that is a useful research result.

## 13. The model needs a way to make its complexity observable

A visual research interface, independent of any game: select a person and see a timeline of major experiences, evolving commitments, important relationships, and personal beliefs; select a decision and investigate why: what they believed at that moment, which experiences influenced them, what other options were available, what changed afterward. The most useful part would be inspecting alternative histories: what happens if Emma never experiences that first disastrous concert, or interprets it differently? Such a tool could identify where the model has real causal depth and where the apparent story is a sequence of loosely related events. It could be a research instrument, a simulation viewer, or eventually part of a game.

## My overall recommendation

The Lab's strongest existing asset is its combination of persistent personal state, inspectable decisions, observer-limited knowledge, and reproducible counterfactual experiments. Protect it. But shift the next phase away from "what additional psychological qualities can we simulate?" toward "how can what happens to one person meaningfully change what that person, and the people around them, do next?" The three areas I'd investigate most seriously: event appraisal and persistent consequences; enduring motivations and flexible planning; socially transmitted knowledge and institutional consequences. The deeper question isn't whether Emma has 24 facets, ten values, several memories, and an emotional state. It's whether Emma at 35 is meaningfully the product of everything that happened to her at 15, 20, and 30, and whether that history helps explain what she'll do at 40. Not every experience needs to change her. But when something important happens, it should sometimes leave a lasting, understandable mark on her possibilities. The possibility I find most compelling is that you may not need to make individual people vastly more complicated. You may need to make their lives much more consequential.

---

## The lab's reading (18 October 2026)

Checked against the code and the measured results, not acted on. Its central claim, more consequential lives rather than more complicated people, is what the consequence map and the what-ifs already show (22% of weighty events lead anywhere, 5% reach outside the event), and its three priorities are aftermath, wants and gossip in the lab's words. New in it: one factual event with many interpretations, kept apart from the record; levels of motivation and the difference between wanting, deciding, acting and staying committed; groups with norms that outlive members; experiment C. Its challenge to round 27 (section 8) is fair and goes into 27's pre-registration as what would change our minds. What it does not weigh: every direction in it adds machinery and none of its experiments is a human read; WHY.md's first warning and the exit criterion put the human reading first. The order of work does not change.
