## Round

<!-- e.g. 26 — the closest person decides whether to be there. Scale: S12 — … -->

**Outcome (one line, as in BOARD / SCALE.md):**

## Checklist

- [ ] Pre-registration was committed and pushed before any code (commit: )
- [ ] Seeds claimed in `docs/seeds.md`, all fresh
- [ ] The change sits behind a switch (`OFF=`)
- [ ] Smoke run on throwaway seeds only
- [ ] Tested on fresh worlds, with and without
- [ ] Cold reads done blind, before any metric was read
- [ ] Headline numbers re-derived by a separate agent from the raw files
- [ ] Gate: scoreboard paired within ±2 (non-couple decisions; overall beside it), or `ident.ts` / `sig.ts` identical where nothing should change
- [ ] Scale only: a town-sized world is identical to main's
- [ ] Outcome recorded, whatever it was; nothing tuned after a result
- [ ] `docs/STATUS.md` / `docs/ARCHITECTURE.md` (or `docs/scale/`) describe the design as it now is
- [ ] Moves exit-criterion point:

Merge with a merge commit. Then tag (`r26` / `s12`), attach raw outputs to the release, and update `NOW.md`.
