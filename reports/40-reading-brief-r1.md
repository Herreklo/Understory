# Reading brief

You are reading lives written by a simulation of a small town. The file `pairs-r1.txt` holds twelve people (P01 to P12). Each person is shown twice, as version A and version B: two versions of the same person's life over the same ten years. Things may differ between them. Nobody has told you why, and you should not try to guess what the difference is meant to be. Read each version as a life.

Each line is something that happened, with its year. The text in square brackets after a line is the reason given for it. A line starting with ↳ is an earlier event that a reason refers to, shown under it.

For every version (24 in all), give:
- **score**: 1 to 5, how worth reading this life is. 1: a list of things that happened; 3: a life you could follow; 5: a life you would want to read more of.
- **faults**: up to three, each with a `kind` and an exact `quote` from the text. Kinds:
  - `unfit reason`: a reason that does not explain the act it is given for;
  - `repeat`: something repeated the way a writer would have cut;
  - `wording`: broken or clumsy language;
  - `out of nowhere`: something that happens with nothing leading to it;
  - `false line`: something the text claims that cannot be true, or contradicts itself.
- **good reasons**: up to two exact quotes of a reason that made an act make sense to you, if there are any.

For each pair, also say which version you would rather read on (`prefer`: "A" or "B").

Be honest and specific. Quote exactly. Do not be kind.

Write your answer as JSON only, to the file named in your instructions, in this shape:

```json
{
  "reader": "<your role>",
  "pairs": {
    "P01": {
      "A": { "score": 3, "faults": [{ "kind": "repeat", "quote": "..." }], "good": ["..."] },
      "B": { "score": 4, "faults": [], "good": [] },
      "prefer": "B"
    }
  }
}
```
