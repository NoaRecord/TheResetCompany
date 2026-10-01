# TheResetCompany — GLOBAL RESET Prototype Design

Date: 2026-09-28
Scope: P0 `prototypes/reset-sequence/`
Status: Design fixed by Project Control; implementation not started.

## 1. Purpose

Create a standalone GLOBAL RESET prototype for TheResetCompany v0.1 that:

- runs without the Game Engine,
- uses mock data,
- preserves the later integration boundary,
- follows `RESET_SEQUENCE_SPEC.md`, `VISUAL_STYLE_GUIDE.md`, and `V0_1_IMPLEMENTATION_PLAN.md`,
- reuses the same sequence later from Employee Mode and JUST RESET,
- does not introduce P2 features such as full Banked Reset visuals, pneumatic tubes, punch cards, or Executive Floor.

## 2. Technology and files

Use only HTML, CSS, and Vanilla JavaScript.

Planned files:

```text
prototypes/
└─ reset-sequence/
   ├─ index.html
   ├─ reset-sequence.css
   └─ reset-sequence.js
```

No framework, backend, external API, database, or build step is required.

## 3. GLOBAL RESET phases

The prototype preserves the sequence defined by `RESET_SEQUENCE_SPEC.md`:

1. Authorization
2. Core Charging
3. Target Acquisition
4. Safety System
5. Console Deployment
6. Final Safety
7. HOLD TO RESET
8. CODE-X RESET
9. Propagation
10. Complete

Internal animation steps may subdivide a phase, but the public phase model must remain unchanged.

## 4. Input payload

The public sequence entry point accepts the existing v0.1 data boundary:

```js
{
  activeUsers,
  exhaustedUsers,
  frustration,
  target
}
```

`exhaustedUsers` is owned by the Game State in the future integrated game. The prototype supplies mock values locally.

The visual layer does not calculate or mutate Employee Game State.

### 4.1 Availability responsibility

In the future Employee Mode integration, GLOBAL RESET availability is decided before the sequence is called.

- Reset Energy and any other GLOBAL RESET availability conditions are validated by the Game Engine / calling controller before `runGlobalResetSequence()` is invoked.
- The RESET Sequence does not inspect Employee Game State to decide whether GLOBAL RESET is available.
- The sequence starts only after the caller has already determined that GLOBAL RESET is allowed.
- In the standalone P0 prototype, mock data is treated as always eligible so the sequence can always be started.

## 5. Public API

Baseline API:

```js
runGlobalResetSequence(payload, {
  onTrigger
})
```

Requirements:

- Starts the full GLOBAL RESET visual sequence.
- Returns a Promise.
- `onTrigger` is called once at HOLD 100% / CODE-X RESET.
- In Employee Mode, the caller will apply the GLOBAL_RESET Game Engine effect inside `onTrigger`.
- Promise resolution occurs only after Propagation and Complete have finished.
- Promise resolution means normal UI may be restored.
- No CustomEvent architecture is introduced for v0.1.

The prototype must be callable repeatedly after a completed run.

## 6. Trigger and completion are separate

Required order:

```text
GLOBAL_RESET selected
→ sequence starts
→ Final Safety
→ HOLD TO RESET
→ HOLD reaches 100%
→ CODE-X RESET
→ onTrigger()
→ Propagation
→ Complete
→ returned Promise resolves
→ normal UI may resume
```

`onTrigger` and Promise completion are distinct notification points.

## 7. UI state during sequence

Conceptual UI states:

```text
NORMAL
RESET_SEQUENCE
```

While in `RESET_SEQUENCE`:

- normal Player Actions are unavailable,
- another GLOBAL RESET cannot start,
- only the RESET sequence interactions are active.

In the future Employee Mode integration, the Game Engine also waits for GLOBAL_RESET action resolution; Settlement / Day++ does not advance during the sequence.

The standalone prototype models only the UI-side lock.

## 8. Required interactions

The prototype must visibly support:

- sequence authorization/start,
- core charge through 120%,
- target information display,
- safety-system readiness,
- console deployment,
- RESET Unit rise,
- large red RESET button,
- transparent hinged safety cover,
- release of final safety,
- opening the cover,
- HOLD TO RESET interaction with progress,
- CODE-X RESET trigger,
- flash/impact effect,
- global propagation display,
- completion screen.

The safety cover must open on a hinge; it must not shatter.

## 9. HOLD TO RESET

The hold duration is an implementation-level tuning value, not a Game Engine rule.

The interaction must:

- work with pointer input,
- work with keyboard input,
- visibly show progress,
- cancel/reset progress if released before completion,
- invoke `onTrigger` exactly once at 100%.

No Game State mutation occurs before 100%.

## 10. Visual style

Normal prototype shell should use the established CRT language:

- near-black background,
- phosphor green normal text,
- amber attention state,
- red warnings/reset state,
- monospace typography,
- scanlines,
- restrained glow,
- restrained flicker/blink.

GLOBAL RESET may become substantially more dramatic than the normal shell.

Implementation should prefer CSS transforms, opacity, gradients, pseudo-elements, box/text shadow, and keyframes over image assets.

## 11. Propagation

No 3D globe is required.

Use a lightweight textual/CRT representation such as a region list or dot/ASCII-style map. The prototype must make global propagation visually obvious and end at 100%.

## 12. Reduced motion

Support `prefers-reduced-motion: reduce`.

Reduced-motion behavior keeps the same phases, controls, trigger point, and final result while reducing motion intensity:

- panel movements become short/simple transitions or direct state changes,
- RESET Unit movement is shortened or replaced with a small fade,
- screen shake is disabled,
- flicker/blink is reduced,
- propagation motion is simplified,
- strong flash is reduced.

The reduced-motion version must not skip `onTrigger` or Complete notification semantics.

## 13. Mobile

The prototype must remain operable around 320px CSS viewport width.

Requirements:

- no required horizontal scrolling,
- readable text,
- large enough interactive controls,
- safety controls remain reachable,
- RESET button remains on-screen/reachable,
- HOLD TO RESET works with touch/pointer input.

Desktop remains the primary visual target.

## 14. Audio

Audio is optional for the P0 prototype.

If audio is implemented:

- it must not rely on autoplay,
- a visible mute control is required,
- mute can be changed during the sequence,
- no audio dependency may block sequence completion.

Because sound is not required, omission is acceptable for the first P0 implementation.

## 15. JUST RESET reuse boundary

The P0 prototype does not implement the full JUST RESET controller.

Later, JUST RESET will own:

- `resetCount`,
- `jokeMessage`,

and call the same `runGlobalResetSequence(...)` API.

These values do not enter Employee Game State.

The sequence implementation must therefore not contain Employee-specific Game State mutation.

## 16. Krog / CRT UI / Chappy

These are P1 and are not part of the P0 implementation except where a minimal surrounding mock console is useful for entering the sequence.

Do not expand the P0 prototype into the full game dashboard.

## 17. Explicitly out of scope for v0.1 P0

Do not implement:

- full Banked Reset visual sequence,
- pneumatic tube system,
- punch-card processing animation,
- Executive Floor,
- Mr. Som signature animation,
- research-department incident animation,
- real X content/API,
- external APIs,
- backend/database/login.

## 18. Acceptance checks

The prototype is ready for Project Control handoff when:

1. `index.html` runs standalone with no build step.
2. The full sequence can run from Authorization through Complete.
3. The safety cover visibly opens.
4. HOLD TO RESET is required for trigger.
5. Releasing early cancels the hold.
6. `onTrigger` occurs once at HOLD 100% / CODE-X RESET.
7. Game-like mock state is not mutated before `onTrigger`.
8. Propagation visibly reaches completion.
9. The returned Promise resolves after Complete, not at trigger time.
10. A second run can be started after the first has completed.
11. The prototype remains usable around 320px width.
12. Keyboard operation works for interactive controls.
13. `prefers-reduced-motion` has a meaningful reduced animation path.
14. No P2 visual systems are introduced.

## 19. Handoff deliverables after implementation

Project Control handoff must include:

- final file structure,
- launch instructions,
- public API,
- input payload,
- `onTrigger` semantics,
- Complete/Promise semantics,
- reduced-motion behavior,
- mobile behavior,
- unresolved items.
