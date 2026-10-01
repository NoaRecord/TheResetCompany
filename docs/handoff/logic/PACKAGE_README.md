# TheResetCompany — Logic / Balance v0.1 Handoff

This package contains the standalone v0.1 Employee Mode game-logic specification, balance data, event data, deterministic RNG, reference engine implementation, and fixed-seed tests prepared before Codex repository integration.

## Scope

Included:

- Employee Mode only
- 30 in-game days
- `WAIT`, `BANKED_RESET`, `GLOBAL_RESET`
- Pressure → Player Decision → Settlement flow
- `exhaustedUsers` as a persistent Game State property
- Banked / Global Reset logic
- six v0.1 Random Events
- xorshift32 seeded RNG
- Final Score
- Mr. Som evaluation keys
- Krog category/tag output
- fixed-seed and 30-day deterministic tests

Not included:

- Client Mode
- advanced Balance Lab
- Monte Carlo implementation
- DOE / Taguchi-style S/N
- Controlled Instability
- UI / CRT rendering
- GLOBAL RESET visual sequence implementation
- JUST RESET state inside the normal game engine

## Files

- `docs/LOGIC_SPEC.md` — authoritative handoff specification for the v0.1 engine logic
- `docs/CODEX_HANDOFF.md` — integration instructions and boundaries for Codex
- `docs/UNRESOLVED.md` — intentionally deferred or provisional points
- `data/balance.json` — v0.1 balance parameters
- `data/events.json` — v0.1 Random Event definitions
- `js/engine/rng.js` — seeded RNG
- `js/engine/game-state.js` — Game State creation, normalization, invariants
- `js/engine/game-engine.js` — pressure, actions, RESET resolution, settlement, Krog signals
- `js/engine/scoring.js` — Final Score and Mr. Som evaluation
- `tests/engine.test.mjs` — deterministic and behavioral tests
- `tests/reference-vectors.json` — fixed reference values for cross-language verification

## Run tests

Requires Node.js with the built-in `node:test` runner.

```bash
npm test
```

There are no runtime or test dependencies outside Node.js.

## Integration rule

The reference code is intentionally UI-independent. Do not add DOM, CSS, animation, audio, or actual Krog post strings to `js/engine/`.

The normal game engine does not store JUST RESET state.
