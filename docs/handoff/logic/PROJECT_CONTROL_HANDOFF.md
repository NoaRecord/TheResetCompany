# TheResetCompany — Logic / Balance v0.1 Project Control Handoff

## Status

Logic / Balance v0.1 concrete specification and standalone reference engine package are prepared for Codex repository integration.

No additional Project Control decision is currently blocking integration.

## Frozen integration decisions

- Employee Mode only for v0.1.
- 30 days; no early Game Over.
- One player action per Day.
- Actions: `WAIT`, `BANKED_RESET`, `GLOBAL_RESET`.
- Day order: Pressure → Player Decision → Settlement.
- `exhaustedUsers` is persistent Game State.
- Canonical invariant: `0 <= exhaustedUsers <= paidUsers <= activeUsers`.
- Game Engine State property names are canonical for UI integration.
- Global Reset has a prepare/commit boundary; State changes only at CODE-X RESET after HOLD reaches 100%.
- Cancelled Global Reset has no cost and no effect.
- Day does not advance while Global Reset sequence is unresolved.
- Krog receives categories/tags, not display text.
- JUST RESET state is not part of normal Game State.

## Concrete Logic / Balance values

Concrete v0.1 provisional initial values, formulas, RESET costs/effects, Random Events, RNG, score formula, and Mr. Som thresholds are defined in:

- `docs/LOGIC_SPEC.md`
- `data/balance.json`
- `data/events.json`

These values are suitable as initial integration values. They are not presented as a final optimized balance.

## Implementation material

Standalone UI-independent reference modules are supplied under `js/engine/`.

The implementation uses no external runtime dependencies.

## Verification gate

The package includes deterministic tests for RNG, Game State, Day flow, RESET semantics, Global Reset prepare/cancel/commit, duplicate commit prevention, Random Events, cooldown/one-shot behavior, Day 30 ending, score, Mr. Som priority, Krog tags, 30-day completion, and same-seed reproducibility.

Codex should preserve these tests or equivalent behavior when integrating into the repository.

## Deferred beyond v0.1

- Client Mode
- advanced Balance Lab
- Monte Carlo implementation
- DOE / S/N
- Controlled Instability
- mid-sequence Global Reset reload restoration

See `docs/UNRESOLVED.md` for provisional items that should be revisited after browser integration rather than before it.
