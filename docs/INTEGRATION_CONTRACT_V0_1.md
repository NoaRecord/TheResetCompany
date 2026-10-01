# TheResetCompany — Integration Contract v0.1

> **Revision 1 note:** The original contract below records the initial integration boundary. For the locally adopted v0.1 Revision 1 values and state/UI changes, follow [the Revision 1 addendum](INTEGRATION_CONTRACT_V0_1_R1.md). The GLOBAL RESET prepare/visual/commit/completion boundary in this document remains in force.

## 1. Purpose

This document freezes the boundary between the supplied Logic / Balance engine and the supplied GLOBAL RESET P0 prototype for the first Codex integration.

Do not redesign either component merely to make the integration look more conventional.

## 2. Canonical Employee Game State names

Use the Game Engine names as canonical:

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

Ending data may additionally include:

```text
bankedResetCount
globalResetCount
totalResetCost
finalScore
somEvaluation
```

UI labels may differ, but do not rename Game Engine properties for UI convenience.

Required invariant:

```text
0 <= exhaustedUsers <= paidUsers <= activeUsers
```

## 3. Day flow ownership

The application/controller owns the phase order.

For each Day, call exactly:

```text
pressurePhase()
→ one fully resolved Player Action
→ settleDay()
```

Player Actions:

```text
WAIT
BANKED_RESET
GLOBAL_RESET
```

Do not call `pressurePhase()` twice for one Day and do not call `settleDay()` until the selected action has fully resolved.

v0.1 ends after Day 30 Settlement. There is no early Game Over.

## 4. BANKED RESET

`BANKED_RESET` is resolved synchronously by the Game Engine.

If Energy is insufficient, the action is rejected and the player remains in the decision phase.

v0.1 requires functional feedback in the normal CRT UI but not a large dedicated punch-card sequence.

## 5. GLOBAL RESET — prepare / visual / commit / complete

GLOBAL RESET is a transaction with separate prepare and commit points.

Required flow:

```text
resolvePlayerAction(state, { type: 'GLOBAL_RESET' }, balance)
→ GLOBAL_RESET_PREPARED
→ keep returned `prepared` transaction
→ build visual payload
→ runGlobalResetSequence(payload, { onTrigger })
→ HOLD reaches 100%
→ CODE-X RESET
→ onTrigger()
→ commitGlobalReset(state, prepared, balance)
→ Propagation / Complete continue
→ returned Promise resolves
→ settleDay()
```

Do not call `commitGlobalReset()` when the player first selects GLOBAL RESET.

Do not call `settleDay()` before the visual Promise resolves.

## 6. GLOBAL RESET visual payload mapping

The current Game Engine emits `GLOBAL_RESET_PREPARED` with `frustrationBefore`; the prototype expects `frustration`.

The controller must map explicitly:

```js
const resetPayload = {
  activeUsers: preparedResult.event.activeUsers,
  exhaustedUsers: preparedResult.event.exhaustedUsers,
  frustration: preparedResult.event.frustrationBefore,
  target: "PAID_USERS"
};
```

Do not rename the Game Engine field only to match the prototype.

## 7. Trigger callback

Use the prototype boundary:

```js
await runGlobalResetSequence(resetPayload, {
  onTrigger: () => {
    // commit GLOBAL RESET here
  }
});
```

`onTrigger` occurs once at HOLD 100% / CODE-X RESET.

If `onTrigger` throws/rejects, do not settle the Day. Surface the failure as an integration error; audio/visual completion must not hide a failed Game Engine commit.

## 8. HOLD release versus transaction cancellation

Releasing HOLD before 100% only resets the HOLD progress to 0%. It does **not** cancel the prepared GLOBAL RESET transaction; the player may try the HOLD again inside the same sequence.

`cancelGlobalReset()` is only needed if a future UI provides a way to abandon the entire prepared sequence before trigger.

The current P0 sequence has no required abort/exit control.

## 9. Sequence completion

Two notification points must remain distinct:

- `onTrigger`: Game Engine RESET effect point.
- returned Promise resolution: Propagation and Complete have finished and NORMAL UI may resume.

During the unresolved sequence:

- no normal Player Action;
- no second GLOBAL RESET;
- no Settlement;
- no Day++.

## 10. Physical RESET Unit visibility

The large physical red RESET button, transparent Safety Cover, and deployed RESET Unit are **not visible in NORMAL gameplay**.

NORMAL UI may show a restrained CRT-style control such as:

```text
[ BANKED RESET ]
[ PREPARE GLOBAL RESET ]
```

The physical RESET Unit appears only after GLOBAL RESET Sequence reaches Console Deployment.

This contrast is an intentional comedy/visual rule, not an incidental CSS choice.

## 11. GLOBAL RESET recovery display contract

The current P0 Complete display treats the prepared `exhaustedUsers` count as the population saved by GLOBAL RESET.

The current `data/balance.json` uses:

```json
"globalReset": {
  "exhaustedRecoveryRatio": 1.0
}
```

Therefore the display and Game Engine currently agree.

Do not casually tune `globalReset.exhaustedRecoveryRatio` away from `1.0` without also updating the Complete display contract to use the actual committed `recoveredUsers` result.

## 12. Krog contract

Game Engine/Event logic returns severity/tags, not user-facing post text.

Typical tags:

```text
calm
frustration_medium
frustration_high
after_global_reset
klaude_event
bug_incident
tybo_posted
```

Static Data / UI owns the fictional Krog post strings.

Do not embed X-like post copy in Game Engine formulas.

## 13. JUST RESET

JUST RESET uses the same GLOBAL RESET visual component but does not use Employee Game State costs.

Keep JUST RESET-specific values such as:

```text
resetCount
jokeMessage
```

in a dedicated JUST RESET controller/UI state, not Employee Game State.

## 14. Audio integration boundary

Audio is a separate controller/service from Game Engine calculations.

Game/controller may signal audio state such as:

```text
NORMAL
ATTENTION
GLOBAL_RESET
```

Audio must not alter Game State and must never block the Day flow or RESET commit.

See `AUDIO_SPEC_V0_1.md`.

## 15. Current source components

Logic reference implementation:

```text
js/engine/
data/balance.json
data/events.json
tests/engine.test.mjs
tests/reference-vectors.json
```

GLOBAL RESET P0:

```text
prototypes/reset-sequence/
```

Preserve their existing independent tests before and after integration.
