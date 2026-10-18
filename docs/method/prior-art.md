# Prior art: what we take, and what we don't

## Where the model stands
Its strengths are long life continuity, inspectable causes (every decision carries its reasons), runs that repeat exactly, and an honest test of whether knowing a person beats guessing from the situation. Its weaknesses are turning that state into a human experience (story surfacing, presentation) and the missing external validation. The individual ingredients all exist elsewhere; this combination, measured, does not.

## What we take
- **Talk of the Town / Bad News** (Ryan, Summerville, Mateas and others): characters hold beliefs about each other that spread by telling and change on the way: misremembered, forgotten, made up or lied about. **Used in:** reputation. What the town says about someone is beliefs moving through it, wrong ones included.
- **Story sifting** (Felt, Winnow, Centrifuge: Kreminski, Johnson-Bey and others): patterns over the event log that find storyful sequences, including while they are still unfolding. **Used in:** surfacing what matters, and measuring arcs.
- **Neighborly** (Johnson-Bey; MIT licence, archived 2026): rules that come from a trait and apply to everyone who matches ("warms to people with X"), removed with their source. **Used in:** opinions and moral lines, generated from values rather than written by hand. Its export of a whole run as tables queryable with SQL is useful for diagnosis.
- **External review of R19:** the simulation decides and a language model writes only the words; controlled what-ifs, changing one thing with history and luck held fixed; describe the project as interpretable and internally tested, never as realistic.

## What we don't take
- **Neighborly's code:** Python, unmaintained, and every part is a thinner version of something the lab already has. Its traits are tag bundles, relationships drift at random, nothing observes anyone, and decisions carry no reasons.
- **LLM-agent societies** (Generative Agents, Concordia, AgentSociety, Project Sid): more expressive, but runs don't repeat, every decision costs a model call, and causes are opaque. Their lesson is expression, which the words-only rule covers.

## Lessons
- Town simulations of this kind made rich histories that few people read; Neighborly's own paper names its missing story sifting and missing evaluation metric. The lab has the evaluation. Sifting and presentation are what stand between the simulation and an experience.
- Stanford's 1,000-person study shows what validating against real people takes. The lab's claim is narrower and testable: humans can learn these people.
