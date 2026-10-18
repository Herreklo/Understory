# Scale track at S11b: reference snapshot

This tag (`scale-s11b`) is a frozen reference, never merged. It is the Person Model Lab at round 19c with the city-scale changes as they stood after step S11b. It is kept so every result in the scale log can be traced to the exact code that produced it.

- `src/`, `scale/`, `package.json`, `tsconfig.json`: the branch as run (round 19c plus the scale changes). `npm install`, then the commands in `scale-track/HOW-TO-RUN.md`.
- `scale-track/SCALE.md`: the log of steps S0–S11b, with every pre-registration, result and correction.
- `scale-track/docs/`: the design, the scaling contract, the list of changes to the engine, and the full diff of `src/` against round 19c (`branch.diff`).
- `scale-track/bench/`: the harness, step scripts and report generator, as used.
- `scale-track/city-scale.html`: the City Scale report.

The raw outputs of every step are attached to this tag's GitHub release. The live scale track is on `main`, under `scale/` and `docs/scale/`. It is carried onto the current engine from S12 on.
