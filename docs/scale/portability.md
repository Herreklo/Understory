# Portability contract

Rules for engine code, so the engine can move to another language, and sit under any game engine, without a redesign. Each rule says why. Code that follows them ports almost line for line, and a port can be proven correct against this engine, event by event.

`contract.md` says how the engine stays fast as the world grows; this file says how it stays movable. New engine code follows both. Code that does not yet follow a rule is listed under known debt in `docs/ARCHITECTURE.md`.

## 1. A game meets the engine only at the boundary

A game, or any front end outside this repo, talks to a world through `src/boundary.ts`, and only through it:
- **commands in:** `createWorld` (seed, run seed, past years, founding adults, whether to place the witness) and `command` (advance a number of months);
- **events out:** `events(h, since)`, the record from a month on, each event with its reasons, evidence, decision and who knows it;
- **queries:** `now`, `townIds` (in a city, everyone simulated month by month), `person`, `bondOf` (never creates a bond), `beliefsHeld`.

No query writes anything into the world.

The caller holds a world as a handle that the type checker keeps opaque. Everything the boundary gives back is plain data (numbers, strings, booleans, arrays and records), copied, so nothing the caller does to it can change the world. A Map becomes its entries and a Set its members, in the engine's own order; a negative zero is given as zero, since JSON cannot carry its sign. World state holds no NaN or infinity, which JSON cannot carry either.

The Understory page and the tools in `src/tools/` read the engine directly: they are the project's instruments, not games.

**Why:** with one boundary, a game and the engine can each change language, or be replaced, without the other noticing. A game built on the engine's internals is welded to them.

**Checked by** `src/tools/boundarytest.ts` (in `npm test`): a world run through the boundary hashes identical to one run directly, every answer survives a JSON round trip unchanged, reading the world and changing an answer leave it identical to a world nobody read, and reading the world through a handle does not type-check.

## 2. The record is the reference

`ident.ts record` writes the full event record of the identity seeds (11–13, the default model, a thirty-year past and eight years of present) as canonical JSON lines, one event per line with its keys sorted, in `out-reference/<seed>.jsonl`. It reads them through the boundary. They are about 9 MB a seed, so git does not keep them: the engine is deterministic, so any tag reproduces its records exactly, and a port is checked against the records of the tag it ports.

**Why:** a hash says that two engines differ, not where. A record lets a port be diffed line by line until it matches: the first line that differs is the first event a port gets wrong.

## 3. Arithmetic is the engine's own

Engine code does not call `Math.exp`, `Math.log`, `Math.pow`, `Math.tanh`, the trigonometric functions or anything like them. It uses addition, subtraction, multiplication, division and `Math.sqrt`, and its own functions built from them.

**Why:** those five operations are exactly rounded in every language that follows IEEE 754, so they give the same bits everywhere. The others are approximations whose last digits differ between JavaScript engines, compilers and machines, and a decision that turns on a last digit makes two engines part ways.

`src/mathx.ts` holds them: `exp`, `log`, `pow` (positive base), `tanh` and `cos`, each within 4×10⁻¹⁶ of JavaScript's over the ranges the engine uses (`src/tools/mathtest.ts`, in `npm test`).

**How:** integers that decide something (ids, keys, counts) stay exact. Division meant to be whole says so, with `Math.floor` or `Math.trunc`.

## 4. Order is the engine's own

No outcome depends on an order the language happens to give. The orders the engine relies on are these, and a port keeps them:
- a `Map` or a `Set` is read in insertion order (in a port: an insertion-ordered map, never a hash map read in hash order);
- an object's keys are read in JavaScript's order: keys that are whole numbers from 0 (array indices) first, ascending, then the rest in insertion order;
- every sort is stable, so ties keep the order they came in (in a port: a stable sort), and every comparator is a pure numeric difference, never NaN;
- strings that decide anything are compared by code point, never with `localeCompare`.

**Why:** iteration and tie order differ between languages, and a port that breaks one tie differs in everything after it.

## 5. State is typed

Every field a world, person, bond, couple or group carries is declared in its type. No `as any`, no flags or state kept under keys made of text.

**Why:** untyped state turns a port into detective work, and a typo in a text key fails silently.

## 6. State is data

Person, bond, belief, event, group and place state holds numbers, strings, booleans, arrays, records, Maps and Sets of them: no functions, no class instances with behaviour. A random stream (`Rng`) is an object around its state, a number, and a port keeps the number. The world's `hooks` are wiring, set when a world is built and its witness placed; they are rebuilt, never stored.

**Why:** data maps directly onto structs in any language, and it is what a saved game is. `src/tools/clone.ts` copies a world, and `whatif.ts check` proves the copy runs exactly as the original.

## 7. Content is data

The setting pack and the words acts are said in live in data the engine loads, not in its rules. Tuning constants are named, in one place per system.

**Why:** data moves to another language without translation, and a new setting, or the words in another language, needs no change to the engine.
