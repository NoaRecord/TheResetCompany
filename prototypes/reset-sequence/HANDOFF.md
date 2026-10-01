# TheResetCompany — GLOBAL RESET P0 Prototype Handoff

Date: 2026-09-28
Scope: `prototypes/reset-sequence/`
Status: P0 standalone prototype for Project Control / later Codex integration

## 1. Final file structure

```text
prototypes/
└─ reset-sequence/
   ├─ index.html
   ├─ reset-sequence.css
   ├─ reset-sequence.js
   ├─ HANDOFF.md
   └─ tests/
      └─ test_reset_sequence.py
```

Design / plan documents used during implementation:

```text
docs/superpowers/specs/2026-09-28-reset-sequence-design.md
docs/superpowers/plans/2026-09-28-reset-sequence-implementation.md
```

## 2. Launch

No build step or dependency installation is required for the prototype itself.

Primary use:

1. Open `prototypes/reset-sequence/index.html` in a browser, or serve the project with any static HTTP server.
2. Press `START GLOBAL RESET PROTOTYPE`.
3. The page uses built-in mock data and does not require the Game Engine.

Example static-server command from the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/prototypes/reset-sequence/
```

The implementation uses a classic relative `<script>` and stylesheet, not an ES-module dependency graph, so no bundler is required.

## 3. Public API

```js
runGlobalResetSequence(payload, {
  onTrigger
})
```

The function is exposed as:

```js
window.runGlobalResetSequence
```

It returns:

```text
Promise<void>
```

Only one sequence may run at once. Calling it while a sequence is active rejects with an `already running` error. After the current sequence completes, the API can be called again.

## 4. Input payload

Required integration boundary:

```js
{
  activeUsers,
  exhaustedUsers,
  frustration,
  target
}
```

Prototype example:

```js
{
  activeUsers: 2841291,
  exhaustedUsers: 428193,
  frustration: 87,
  target: "PAID_USERS"
}
```

The sequence only renders these values. It does not mutate Employee Game State.

## 5. GLOBAL RESET availability responsibility

Employee Mode availability is intentionally outside this component.

Before calling `runGlobalResetSequence()`, the future Game Engine / calling controller must determine whether GLOBAL RESET is available, including Reset Energy and any other game-rule conditions.

The RESET Sequence:

- does not inspect Employee Game State for availability,
- does not calculate Reset Energy,
- does not decide whether GLOBAL RESET is affordable,
- starts only because the caller has already authorized the action.

The standalone P0 mock start button always treats GLOBAL RESET as available.

## 6. Trigger boundary

Required order is implemented as:

```text
GLOBAL_RESET selected by caller
→ Sequence starts
→ Authorization
→ Core Charging to 120%
→ Target Acquisition
→ Safety System
→ Console Deployment
→ Final Safety
→ Safety Cover open
→ HOLD TO RESET
→ HOLD reaches 100%
→ CODE-X RESET
→ onTrigger()
→ Propagation
→ Complete
→ Promise resolves
```

`onTrigger` is invoked once after the visual phase has entered `CODE-X RESET`.

Future Employee Mode usage:

```js
await runGlobalResetSequence(payload, {
  onTrigger: () => {
    // Apply the Game Engine GLOBAL_RESET effect here.
  }
});
```

No Employee Game State change is performed by the prototype itself.

If `onTrigger` returns a Promise, the sequence waits for it before continuing to Propagation.

## 7. Complete notification

Trigger and Complete are deliberately separate.

- `onTrigger`: HOLD 100% / CODE-X RESET point.
- returned Promise resolution: after Propagation and `GLOBAL RESET COMPLETE` display.

The calling UI may restore normal game controls after the returned Promise resolves.

No CustomEvent architecture is used.

## 8. UI lock state

The prototype maintains the conceptual UI state on the root element:

```text
data-ui-state="NORMAL"
data-ui-state="RESET_SEQUENCE"
```

During a run:

- another sequence start is rejected,
- the prototype start button is disabled,
- only the active sequence interactions are meaningful.

After Complete, state returns to `NORMAL` and the prototype can run again.

For Employee Mode, external Player Actions (`WAIT`, `BANKED_RESET`, `GLOBAL_RESET`) remain the caller/controller's responsibility. The Game Engine is already specified to wait for GLOBAL_RESET action resolution before Settlement / Day++.

## 9. Safety controls / HOLD behavior

Final interaction order:

```text
RELEASE FINAL SAFETY
→ OPEN COVER
→ HOLD TO RESET
```

The Safety Cover is transparent and opens on a CSS hinge. It does not break or shatter.

HOLD TO RESET:

- pointer/touch compatible through Pointer Events,
- keyboard compatible with Space / Enter,
- shows percentage progress,
- early release cancels and resets progress to 0%,
- reaches 100% before `onTrigger`,
- prevents repeated trigger calls during the same run.

The hold duration is an implementation tuning value and is not a Game Engine rule.

## 10. Reduced motion

`reset-sequence.css` contains:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced-motion mode preserves:

- all ten phases,
- Final Safety interaction,
- cover opening,
- HOLD requirement,
- `onTrigger` timing,
- Propagation,
- Complete / Promise semantics.

It reduces:

- console-door movement duration,
- RESET Unit rise duration,
- cover transition duration,
- propagation entrance motion,
- flash intensity/duration.

No phase or callback is skipped.

## 11. Mobile behavior

The P0 layout was implemented as desktop-first but responsive.

At narrow widths:

- panels stack vertically,
- controls expand to available width,
- propagation changes from two columns to one,
- the RESET Unit and safety cover scale with the viewport,
- the HOLD control remains reachable,
- no required horizontal scrolling is introduced.

Automated acceptance covers a 320px CSS viewport.

## 12. Audio / mute

Audio is intentionally omitted from P0.

Therefore:

- there is no autoplay behavior,
- no sound asset dependency,
- no mute control is needed in this P0 prototype.

If audio is added later, the existing specification still requires a visible mute control and audio must never block sequence completion.

## 13. Visual implementation

No image assets are required.

The visual sequence uses CSS for:

- CRT scanlines,
- phosphor glow,
- warning/attention colors,
- console doors,
- RESET Unit rise,
- large red RESET button,
- transparent hinged Safety Cover,
- CODE-X RESET flash,
- propagation arrival effects,
- responsive scaling.

This keeps the prototype self-contained and suitable for later GitHub Pages integration.

## 14. Explicitly excluded from P0

Not implemented:

- full Banked Reset visual sequence,
- pneumatic tube / incident capsule,
- punch-card processing,
- Executive Floor,
- Mr. Som signature animation,
- research-department incident animation,
- real X posts or X API,
- backend / database / login,
- full CRT Employee dashboard,
- Krog Monitor,
- JUST RESET controller.

The last three remain P1 integration work; Employee Mode and JUST RESET are intended to reuse this same GLOBAL RESET sequence API.

## 15. Test / verification

Automated browser tests are located at:

```text
prototypes/reset-sequence/tests/test_reset_sequence.py
```

They use headless Chromium through Playwright and verify the actual HTML/CSS/JS contents, including:

- public API exposure,
- payload rendering,
- early HOLD cancellation,
- trigger vs Complete timing,
- single active run,
- repeat run after completion,
- semantic/keyboard safety controls,
- visibly opening cover,
- keyboard HOLD,
- 320px horizontal-overflow check,
- reduced-motion sequence semantics,
- absence of P2 visual-system content.

Test command:

```bash
python3 -m unittest prototypes/reset-sequence/tests/test_reset_sequence.py -v
```

Latest verification in this implementation session: **11 tests run, 11 passed, 0 failures/errors**.

Note on this execution environment: Chromium navigation to both local HTTP and `file://` URLs is blocked by an administrator policy. The test harness therefore loads the exact HTML/CSS/JS file contents into Chromium with `page.set_content()`. This environment restriction does not change the prototype's no-build static file structure, but direct URL navigation was not independently exercised inside this sandbox.

## 16. Remaining unresolved items

No architecture-level integration issue remains for P0.

Implementation-level tuning that may be adjusted after browser review without changing the API contract:

- exact duration of each automatic phase,
- exact HOLD duration,
- glow / scanline intensity,
- flash strength,
- propagation pacing,
- final Complete-screen dwell time.

These should be treated as visual tuning only. They must not move the `onTrigger` boundary or Promise completion boundary.
