# TheResetCompany — Initial Codex Work Order (v0.1 Integration)

## 1. Goal

Integrate the already-prepared Logic / Balance engine and GLOBAL RESET P0 prototype into a playable local v0.1 browser game.

The purpose of this work order is integration and verification, not redesign.

Do **not** create a remote repository or publish GitHub Pages in this task unless the user explicitly adds that instruction.

## 2. Read first

For this initial integration only, read:

1. `AGENTS.md`
2. `PROJECT_OVERVIEW.md`
3. `docs/INTEGRATION_CONTRACT_V0_1.md`
4. `docs/spec/V0_1_IMPLEMENTATION_PLAN.md`
5. `docs/AUDIO_SPEC_V0_1.md`

Then consult specialist specifications only as needed.

## 3. Verify imported baselines before integration

Logic baseline:

```text
npm test
```

Do not change the supplied Logic behavior before establishing the baseline.

GLOBAL RESET baseline:

- preserve `prototypes/reset-sequence/` as an independently runnable prototype;
- run its existing automated tests if the local environment supports the required Python/Playwright/Chromium setup;
- if the environment does not support them, do not rewrite the tests simply to make them runnable; report the limitation and perform browser verification through the available environment.

## 4. Main implementation targets

Build the v0.1 application around the imported components.

Required user-facing pieces:

- Employee Mode playable for 30 Days;
- CRT-style normal dashboard;
- metrics/gauges/logs;
- `WAIT`;
- Banked Reset control and feedback;
- `PREPARE GLOBAL RESET` control;
- GLOBAL RESET P0 integrated through the frozen prepare/commit contract;
- Krog X Monitor driven by tags + static fictional messages;
- minimal Chappy text/status area;
- Random Event presentation;
- ending / Final Score / Mr. Som evaluation;
- JUST RESET mode reusing the same GLOBAL RESET sequence;
- v0.1 audio states and mute;
- minimal localStorage persistence;
- responsive operation, including narrow/mobile layout;
- reduced-motion behavior preserved;
- public-facing README draft suitable for later release review.

## 5. Important visual rule

Do not show the large physical red RESET button during NORMAL gameplay.

NORMAL gameplay should remain restrained CRT UI.

The physical RESET Unit / cover / button appears only inside the GLOBAL RESET sequence during Console Deployment.

## 6. Integration order

Recommended order:

1. verify baseline Logic tests;
2. create minimal app/controller shell;
3. load balance/events data;
4. implement Pressure → Decision → Settlement loop;
5. build CRT dashboard around current Game State;
6. integrate WAIT and Banked Reset;
7. integrate GLOBAL RESET using `docs/INTEGRATION_CONTRACT_V0_1.md` exactly;
8. add Krog static-data presentation;
9. add ending/score/Mr. Som display;
10. add JUST RESET using the same sequence component;
11. add Audio controller;
12. add minimal localStorage behavior;
13. responsive/reduced-motion/browser verification;
14. regression checks and final diff review.

You may minimally adjust the file structure where necessary, but do not collapse Game Engine, UI, Visual Effects, and Audio responsibilities into one file merely to save time.

## 7. Suggested application structure

This is a guideline, not a requirement to create empty abstractions:

```text
index.html
css/
js/
  main.js
  engine/        # supplied Logic engine
  controllers/   # app flow / integration boundary
  ui/            # CRT / Krog / ending rendering
  audio/         # Web Audio state controller
  data/          # optional data loading helpers
data/
prototypes/
  reset-sequence/
tests/
docs/
```

Keep relative paths portable; do not depend on a particular future GitHub repository name.

## 8. Krog data

Create static fictional Krog messages driven by Game Engine tags/categories.

Do not call X/Twitter and do not copy real posts.

## 9. localStorage

v0.1 requires localStorage, but avoid a large save-system architecture.

Implement the smallest coherent persistence behavior suitable for resuming/configuration, document what is persisted, and do not persist a half-committed GLOBAL RESET transaction unless there is a clear need.

If a choice is reversible, choose the simpler behavior and report it.

## 10. Audio

Follow `docs/AUDIO_SPEC_V0_1.md`.

Prefer procedural Web Audio API patterns and avoid external music/license work for v0.1.

Audio must not become a release blocker.

## 11. Environment caution

See `docs/dev/KNOWN_CODEX_ENVIRONMENT_NOTE.md` before attempting to repair shell/sandbox problems.

Do not change ownership/ACLs/permissions or initialize/reconfigure Git merely because a shell command failed.

## 12. v0.1 completion gate for this local integration

Before declaring the integration complete, verify as applicable:

- Employee game can be played through Day 30;
- Banked Reset works;
- Global Reset prepare/HOLD/commit/Complete works;
- no RESET effect occurs before HOLD 100%;
- Final Score is calculated;
- Mr. Som evaluation displays;
- Krog changes with state/tags;
- JUST RESET works and reuses the same visual sequence;
- large physical RESET button is absent from NORMAL gameplay;
- audio is muteable and does not block gameplay;
- Logic tests still pass;
- obvious duplicate Day/Settlement/RESET commit bugs are absent;
- desktop browser operation works;
- narrow/mobile operation is usable;
- reduced-motion remains meaningful;
- static serving works with relative paths;
- no v0.2+ systems were accidentally added.

## 13. Completion report

Report:

- files added/changed;
- architecture/integration decisions actually made;
- tests/checks and results;
- browser widths/environments checked;
- localStorage behavior chosen;
- audio behavior chosen;
- unresolved items;
- anything intentionally deferred.
