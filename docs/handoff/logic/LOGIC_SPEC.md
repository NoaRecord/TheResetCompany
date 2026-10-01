# TheResetCompany — v0.1 Logic / Balance Specification

## 1. Scope

This document defines the v0.1 Employee Mode game logic prepared for repository integration.

The design follows the project decisions that v0.1 is a small 30-day browser management game and that advanced balance analysis is deferred.

v0.1 actions are exactly:

- `WAIT`
- `BANKED_RESET`
- `GLOBAL_RESET`

One in-game day contains one player action.

There is no early Game Over in v0.1. The game ends after Day 30 Settlement.

## 2. Persistent Game State

Canonical property names:

```js
{
  day,
  activeUsers,
  paidUsers,
  exhaustedUsers,
  satisfaction,
  frustration,
  expectation,
  resetEnergy,
  usersLostToKlaude,
  bankedResetCount,
  globalResetCount,
  totalResetCost,
  seed,
  rngState,
  eventMemory,
  status
}
```

Required invariant:

```text
0 <= exhaustedUsers <= paidUsers <= activeUsers
```

Additional ranges:

```text
0 <= satisfaction <= 100
0 <= frustration <= 100
0 <= expectation <= 100
0 <= resetEnergy <= 100
status ∈ { RUNNING, ENDED }
```

`score` is derived and is not stored as persistent State.

JUST RESET state is not part of this Game State.

## 3. Initial State

```text
day                1
activeUsers        100000
paidUsers          60000
exhaustedUsers     6000
satisfaction       65
frustration        25
expectation        20
resetEnergy        40
usersLostToKlaude  0
bankedResetCount   0
globalResetCount   0
totalResetCost     0
status              RUNNING
```

The supplied seed is normalized to an unsigned 32-bit integer and copied to both `seed` and `rngState`.

## 4. Day Flow

Canonical flow:

```text
Pressure
→ Player Decision
→ Settlement
```

### Pressure

1. Always consume exactly three RNG float draws:
   - `usageRoll`
   - `eventRoll`
   - `eventPickRoll`
2. Generate newly exhausted paid users.
3. Increase Frustration using exhausted rate and Expectation.
4. Resolve at most one eligible Random Event.
5. Normalize and validate State.

### Player Decision

UI chooses exactly one action.

- `WAIT`: resolves immediately.
- `BANKED_RESET`: resolves immediately if enough Energy; otherwise rejects and the player remains in the decision phase.
- `GLOBAL_RESET`: validates and prepares the visual sequence, but does not change Game State yet.

### Settlement

After the action has been fully resolved:

1. update Satisfaction
2. calculate Active User growth
3. calculate Klaude churn
4. apply churn, then growth
5. add daily Reset Energy
6. normalize and validate State
7. if Day 30, end the game; otherwise increment Day

## 5. Usage / Exhaustion

```text
availablePaidUsers = paidUsers - exhaustedUsers
```

```text
usageNoise = 0.85 + 0.30 * usageRoll
```

```text
newExhausted = roundInt(
  availablePaidUsers
  * 0.06
  * usageNoise
)
```

`roundInt(x)` is defined for non-negative user counts as:

```text
floor(x + 0.5)
```

## 6. Frustration

```text
exhaustedRate = exhaustedUsers / max(paidUsers, 1)
```

```text
frustrationIncrease =
  0.3
  + 6.0
    * exhaustedRate
    * (1 + 1.2 * expectation / 100)
```

Expectation therefore amplifies frustration caused by exhausted users; it is not a large independent daily damage source.

## 7. Satisfaction Settlement

```text
satisfactionDelta =
  0.6
  - 1.8 * frustration / 100
  - 1.0 * exhaustedRate
```

Then clamp to `[0, 100]`.

## 8. Growth

```text
growthRate =
  0.002
  + 0.006 * max(0, satisfaction - 50) / 50
```

```text
newActiveUsers = roundInt(activeUsers * growthRate)
newPaidUsers   = roundInt(newActiveUsers * 0.60)
```

## 9. Klaude Churn

```text
churnRate =
  0.0015
  + 0.012 * max(0, 50 - satisfaction) / 50
  + 0.016 * max(0, frustration - 50) / 50
```

```text
lostUsers = roundInt(paidUsers * churnRate)
```

Apply churn before growth:

```text
paidUsers   -= lostUsers
activeUsers -= lostUsers
exhaustedUsers = max(0, exhaustedUsers - lostUsers)
usersLostToKlaude += lostUsers
```

Then add `newActiveUsers` and `newPaidUsers`.

## 10. Reset Energy

```text
range       0..100
initial     40
dailyGain   8
```

Daily Energy is added during Settlement, after the day's player action. Newly gained Energy is therefore usable starting the next Day.

## 11. Banked Reset

Cost:

```text
30 Energy
```

Effect:

```text
recoveredUsers = roundInt(exhaustedUsers * 0.45)
exhaustedUsers -= recoveredUsers
frustration    -= 18
satisfaction   += 6
expectation    += 7
resetEnergy    -= 30
totalResetCost += 30
bankedResetCount += 1
```

If Energy is below 30, no State change occurs.

## 12. Global Reset

Cost:

```text
80 Energy
```

### Prepare

Selecting `GLOBAL_RESET` with sufficient Energy returns `GLOBAL_RESET_PREPARED` and a temporary prepared transaction.

No persistent Game State changes at this point.

### Visual sequence boundary

Canonical order:

```text
GLOBAL_RESET selected
→ RESET Sequence starts
→ HOLD
→ HOLD 100%
→ CODE-X RESET
→ Engine commitGlobalReset()
→ Propagation
→ Complete
→ Settlement
→ Day++ / Game End
```

If HOLD is cancelled before commit:

```text
State change = none
Cost = 0
```

### Commit

At CODE-X RESET:

```text
recoveredUsers = exhaustedUsers
exhaustedUsers = 0
frustration    -= 45
satisfaction   += 15
expectation    += 20
resetEnergy    -= 80
totalResetCost += 80
globalResetCount += 1
```

The Day does not advance during the RESET Sequence.

The prepared transaction contains enough State identity to reject an accidental second commit after the first commit changes State.

## 13. Random Events

Global rules:

```text
dailyEventChance = 0.22
maxEventsPerDay  = 1
```

Definitions live in `data/events.json`.

v0.1 includes:

- `bug_fixed`
- `server_trouble`
- `klaude_reset_everyone`
- `tybo_posted`
- `user_milestone`
- `new_model_released`

Engine data contains IDs, weights, conditions, effects, message keys, tags, repeatability, and cooldowns. Display copy is not stored in the engine.

## 14. RNG

Algorithm: xorshift32.

Transition:

```text
x ^= x << 13
x ^= x >> 17
x ^= x << 5
```

All operations use unsigned 32-bit arithmetic.

Float output:

```text
value = rngState / 4294967296
```

If requested seed is zero, replace it with:

```text
0x6D2B79F5
```

The engine always consumes three RNG values per Pressure phase, even if no Random Event occurs.

## 15. Final Score

Components:

```text
paidRetention =
  300 * clamp(paidUsers / initialPaidUsers, 0, 1)
```

```text
activeGrowthBonus =
  300 * clamp(
    (activeUsers - initialActiveUsers) / initialActiveUsers,
    0,
    0.5
  )
```

This component therefore contributes at most 150 points.

```text
satisfactionScore = 3 * satisfaction
```

```text
klaudePenalty =
  600 * clamp(usersLostToKlaude / initialPaidUsers, 0, 1)
```

```text
resetPenalty = totalResetCost
```

Final:

```text
Final Score = roundInt(max(
  0,
  500
  + paidRetention
  + activeGrowthBonus
  + satisfactionScore
  - klaudePenalty
  - resetPenalty
))
```

RESET counts are not separately deducted from Score, avoiding a direct double penalty in addition to Reset Cost.

## 16. Mr. Som Evaluation

Return only an evaluation key. UI / Static Data owns the text.

Priority order:

1. `KLAUDE_EXODUS`
   - `usersLostToKlaude / initialPaidUsers >= 0.20`
2. `RESET_SPAM`
   - `totalResetCost >= 240`, or
   - total RESET count `>= 8`, or
   - Global Reset count `>= 3`
3. `HIGH_SAT_HIGH_EXPECTATION`
   - Satisfaction `>= 85` and Expectation `>= 70`
4. `RESET_MISER`
   - `totalResetCost <= 30`
5. `HIGH_SCORE`
   - Final Score `>= 900`
6. `NORMAL`

## 17. Krog Boundary

The Game Engine never returns X-post text.

Severity:

```text
frustration < 40      calm
40 <= frustration <65 frustration_medium
frustration >=65      frustration_high
```

Transient tags may include:

- `after_global_reset`
- `klaude_event`
- `bug_incident`
- `tybo_posted`

## 18. Engine → UI State

Minimum normal UI snapshot:

```js
{
  day,
  activeUsers,
  paidUsers,
  exhaustedUsers,
  satisfaction,
  frustration,
  expectation,
  resetEnergy,
  usersLostToKlaude
}
```

Ending data additionally exposes:

```js
{
  bankedResetCount,
  globalResetCount,
  totalResetCost,
  finalScore,
  somEvaluation,
  seed
}
```

## 19. UI → Engine Actions

```js
{ type: "WAIT" }
{ type: "BANKED_RESET" }
{ type: "GLOBAL_RESET" }
```

## 20. Engine Event Types

Reference implementation emits:

- `DAY_PRESSURE_RESOLVED`
- `WAIT_APPLIED`
- `RANDOM_EVENT_TRIGGERED` represented by the `randomEvent` payload from Pressure
- `BANKED_RESET_APPLIED`
- `BANKED_RESET_REJECTED`
- `GLOBAL_RESET_PREPARED`
- `GLOBAL_RESET_CANCELLED`
- `GLOBAL_RESET_APPLIED`
- `GLOBAL_RESET_REJECTED`
- `SETTLEMENT_COMPLETE`
- `GAME_ENDED`

## 21. Deterministic Reference

Seed `12345`, Day 1, Action `WAIT`, default balance:

RNG draws:

```text
usageRoll     0.776938705239445
 eventRoll     0.3951726963277906
 eventPickRoll 0.6557702794671059
```

No Random Event fires.

After Pressure:

```text
newExhausted    3509
exhaustedUsers  9509
frustration     26.479116
```

After Settlement:

```text
day                 2
activeUsers          100290
paidUsers            60138
exhaustedUsers       9419
satisfaction         64.96489257866666
frustration          26.479116
expectation          20
resetEnergy          48
usersLostToKlaude    90
```

See `tests/reference-vectors.json` and `tests/engine.test.mjs`.
