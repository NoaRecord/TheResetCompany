# GLOBAL RESET Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the standalone P0 `prototypes/reset-sequence/` GLOBAL RESET prototype with the fixed Game Engine integration boundary and v0.1 acceptance behavior.

**Architecture:** A single browser-facing controller in `reset-sequence.js` owns phase transitions and DOM state but never Employee Game State. `runGlobalResetSequence(payload, { onTrigger })` gates one active run, waits for the user safety interactions, calls `onTrigger` once at HOLD 100% / CODE-X RESET, continues through Propagation and Complete, then resolves its Promise. HTML/CSS provide a self-contained CRT mock console; browser acceptance tests drive the real UI in headless Chromium.

**Tech Stack:** HTML5, CSS, Vanilla JavaScript (ES module), Python `unittest`, Playwright with system Chromium; no build step and no product dependencies.

**Spec:** `docs/superpowers/specs/2026-09-28-reset-sequence-design.md`

## Global Constraints

- P0 is standalone and uses mock data; no Game Engine dependency.
- Public payload keys are exactly `activeUsers`, `exhaustedUsers`, `frustration`, `target`.
- Availability checks such as Reset Energy remain the caller's responsibility; the sequence performs no Employee Game State eligibility check.
- `onTrigger` fires once at HOLD 100% / CODE-X RESET; the returned Promise resolves only after Propagation and Complete.
- No CustomEvent architecture, framework, backend, external API, database, login, or build step.
- Preserve the ten RESET phases from `RESET_SEQUENCE_SPEC.md`.
- P2 visuals (full Banked Reset, pneumatic tube, punch cards, Executive Floor) remain absent.
- The prototype must remain usable around 320px viewport width and provide `prefers-reduced-motion` behavior.
- Audio is omitted for P0; therefore no mute UI is required in this implementation.

## Review Focus

- Early release during HOLD must return progress to 0 and must not call `onTrigger`.
- Multiple pointer/keyboard completion paths must still call `onTrigger` exactly once.
- Promise completion must not occur at trigger time; it must wait for the Complete phase.
- Starting a second run while one is active must not create a second concurrent sequence; a new run after completion must work.
- 320px viewport must not require horizontal scrolling and all safety/reset controls must remain reachable.

---

### Task 1: Browser harness and public sequence contract

**Files:**
- Create: `prototypes/reset-sequence/index.html`
- Create: `prototypes/reset-sequence/reset-sequence.js`
- Create: `prototypes/reset-sequence/tests/test_reset_sequence.py`

**Interfaces:**
- Consumes: mock payload `{ activeUsers, exhaustedUsers, frustration, target }`.
- Produces: `runGlobalResetSequence(payload, { onTrigger }) -> Promise<void>` assigned to `window.runGlobalResetSequence` and exported from the module.

- [x] **Step 1: Write failing browser tests for standalone launch, payload rendering, active-run lock, trigger timing, Promise timing, and second completed run.**
  - Assert the page loads without JS errors and exposes `window.runGlobalResetSequence`.
  - Assert mock payload values appear during Target Acquisition.
  - Assert releasing HOLD before completion leaves trigger count at 0 and resets visible hold progress.
  - Assert completing HOLD calls `onTrigger` exactly once.
  - Assert completion count remains 0 immediately after trigger and becomes 1 only after the Complete phase.
  - Assert a concurrent second call rejects with an `already running` error (or equivalent documented error), while a call after completion succeeds.

- [x] **Step 2: Run `python3 -m unittest prototypes/reset-sequence/tests/test_reset_sequence.py -v` and verify RED because the prototype files/API do not yet exist.**

- [x] **Step 3: Implement minimal standalone HTML and JS state machine.**
  - Define the ten public phase names in sequence order.
  - Use a single active-run guard.
  - Render payload without mutating it.
  - Pause at Final Safety / cover / HOLD interactions.
  - Call `onTrigger` once only after HOLD reaches 100%, then continue Propagation and Complete before resolving.
  - Keep timing constants private and short enough for automated tests, with a test timing override query parameter allowed only for duration scaling, not behavior changes.

- [x] **Step 4: Re-run the Task 1 tests and verify GREEN.**

### Task 2: RESET Unit visuals, accessibility, reduced motion, and mobile behavior

**Files:**
- Modify: `prototypes/reset-sequence/index.html`
- Modify: `prototypes/reset-sequence/reset-sequence.js`
- Create: `prototypes/reset-sequence/reset-sequence.css`
- Modify: `prototypes/reset-sequence/tests/test_reset_sequence.py`

**Interfaces:**
- Consumes: Task 1 public API and DOM phase markers.
- Produces: visible CRT shell, hinged safety cover, keyboard/pointer controls, reduced-motion CSS path, responsive layout.

- [x] **Step 1: Add failing browser tests.**
  - Assert `RELEASE FINAL SAFETY`, `OPEN COVER`, and HOLD control are real buttons and keyboard operable.
  - Assert safety cover changes to an open state before HOLD can complete.
  - Assert a 320px viewport has `scrollWidth <= clientWidth` and the RESET/HOLD control bounding box remains within viewport width.
  - Emulate `prefers-reduced-motion: reduce` and assert the root gets a reduced-motion media match plus the sequence still reaches trigger and completion.
  - Assert no DOM/text references to pneumatic tubes, punch cards, Executive Floor, or Banked Reset animation are present.

- [x] **Step 2: Run the focused tests and verify RED for missing visual/accessibility behavior.**

- [x] **Step 3: Implement the minimal CSS/DOM behavior.**
  - Near-black CRT shell, phosphor green, amber, warning red, monospace, scanlines, restrained glow.
  - Console panels open with CSS transforms; RESET Unit rises; transparent cover uses a hinged transform and never shatters.
  - Use semantic `button` controls with focus-visible states; pointer and keyboard share the same hold logic.
  - Add `@media (prefers-reduced-motion: reduce)` to shorten/remove panel movement, shake, flicker, and strong flash while preserving every phase and notification point.
  - Add narrow-layout rules at mobile widths; avoid fixed minimum widths that create horizontal scrolling.

- [x] **Step 4: Re-run the full browser test file and verify GREEN.**

### Task 3: Acceptance verification and Project Control handoff

**Files:**
- Create: `prototypes/reset-sequence/HANDOFF.md`
- Modify if needed after RED/GREEN fix: `prototypes/reset-sequence/index.html`, `reset-sequence.css`, `reset-sequence.js`, tests.

**Interfaces:**
- Consumes: completed prototype.
- Produces: reproducible launch/test instructions and the exact integration contract for Project Control/Codex.

- [x] **Step 1: Run the complete automated browser suite in normal motion and reduced motion and verify all tests pass.**

- [x] **Step 2: Render the exact prototype files in headless Chromium and capture a desktop and 320px screenshot for visual inspection.**
  - Sandbox policy blocked direct localhost/file URL navigation, so the exact HTML/CSS/JS contents were loaded with `page.set_content()` for this verification.
  - Verified no horizontal overflow, unreachable HOLD control, missing cover state, or unreadable critical text.

- [x] **Step 3: Write `HANDOFF.md`.**
  - Final file structure.
  - Launch instructions (`python3 -m http.server` from the project root or opening through a local static server).
  - Public API signature and payload.
  - Caller-owned availability check responsibility.
  - `onTrigger` semantics.
  - Promise/Complete semantics.
  - UI lock semantics.
  - Reduced-motion behavior.
  - Mobile behavior.
  - Audio omitted in P0.
  - Explicit P2 exclusions.
  - Remaining unresolved implementation-level tuning items only.

- [x] **Step 4: Run `python3 -m unittest prototypes/reset-sequence/tests/test_reset_sequence.py -v` one final time and record the passing result in the handoff.**
