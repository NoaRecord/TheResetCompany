# TheResetCompany — Logic / Balance Codex Handoff

## Goal

Integrate the supplied v0.1 Employee Mode logic into the new TheResetCompany repository without redesigning the game rules.

## Source of truth order

1. latest explicit Project Control decisions
2. `V0_1_IMPLEMENTATION_PLAN.md`
3. this Logic / Balance package for concrete v0.1 engine rules
4. `BALANCE_DESIGN.md`
5. `PRODUCT_SPEC.md`

If a repository integration detail requires adjustment, preserve externally visible State names and behavior unless Project Control explicitly changes them.

## Files to integrate

Preferred target mapping:

```text
data/balance.json
  ← data/balance.json

data/events.json
  ← data/events.json

js/engine/rng.js
  ← js/engine/rng.js

js/engine/game-state.js
  ← js/engine/game-state.js

js/engine/game-engine.js
  ← js/engine/game-engine.js

js/engine/scoring.js
  ← js/engine/scoring.js
```

Tests may be adapted to the repository's chosen test directory, but fixed vectors and behavior must be preserved.

## Non-negotiable integration boundaries

Do not put the following into the Game Engine:

- DOM manipulation
- CSS classes or animation timing
- sound playback
- actual Krog post strings
- CRT rendering
- GLOBAL RESET flash / propagation visuals
- JUST RESET persistent state

## GLOBAL RESET integration contract

`GLOBAL_RESET` is deliberately two-stage.

Do not call `commitGlobalReset()` when the player first chooses Global Reset.

Use:

```text
resolvePlayerAction(GLOBAL_RESET)
→ GLOBAL_RESET_PREPARED
→ run visual RESET Sequence
→ HOLD reaches 100%
→ CODE-X RESET moment
→ commitGlobalReset()
→ continue Propagation / Complete visuals
→ settleDay()
```

If HOLD is cancelled, call `cancelGlobalReset()` or simply return to decision state without committing. No cost is charged.

Do not call `settleDay()` while the visual sequence is still unresolved.

## UI State property names

Treat these Game Engine names as canonical:

```text
day
activeUsers
paidUsers
exhaustedUsers
satisfaction
frustration
expectation
resetEnergy
usersLostToKlaude
```

Do not rename them only for UI convenience. Map UI labels separately.

## Krog contract

Use `getKrogSignal()` or equivalent output to select Static Data / UI text.

Logic returns severity and tags only.

## Testing gate

Before UI integration, the logic tests must pass independently.

Required baseline:

```bash
npm test
```

At minimum preserve tests for:

- RNG vectors
- initial State
- seed 12345 Day 1 WAIT reference
- Banked insufficient/exact Energy
- Global insufficient / prepare / cancel / commit
- no Day advance during Global commit
- double Global commit protection
- Day 30 end without Day 31
- Score
- Mr. Som priority
- Krog tags
- Random Event deterministic selection
- cooldown
- one-shot event
- 30-day completion
- same-seed reproducibility

## Balance tuning

The numeric values in `balance.json` are v0.1 provisional values, not a claim of final balance optimization.

During initial browser integration, change them only to fix an obvious problem such as immediate collapse, unreachable RESETs, or a trivial dominant strategy. Record any changes for Logic / Balance review.

Do not introduce Monte Carlo, DOE, S/N analysis, or Controlled Instability into v0.1 integration.
