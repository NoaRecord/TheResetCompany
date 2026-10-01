# TheResetCompany — Development Workflow

## 1. Purpose

This document defines the responsibility boundary for v0.1 and later updates so that Codex usage is concentrated on repository-wide integration work rather than specification discovery.

## 2. Responsibility split

### ChatGPT Project

Owns:

- product/release specification;
- roadmap classification;
- Logic / Balance design;
- UI / Visual Effects design;
- independent prototypes;
- event/Krog/Mr. Som text;
- integration contracts;
- test-case design;
- experiment design;
- Codex handoff material.

It should not unnecessarily reimplement repo-wide integration work.

### Local Python / CPU

Owns large numerical experiments:

- Monte Carlo;
- virtual-player strategy runs;
- parameter surveys;
- sensitivity analysis;
- DOE / quality-engineering experiments when scheduled;
- statistics and figure generation.

Do not spend LLM/Codex execution budget on bulk simulation that can be run deterministically on local CPU.

### Codex

Use Codex when work benefits from repo-wide visibility or real execution:

- integrating supplied components;
- connecting Game Engine and UI;
- multi-file refactors required by an approved change;
- real browser checks;
- responsive fixes;
- regression debugging;
- repository structure changes;
- release preparation;
- GitHub/Pages work when explicitly authorized.

Codex should not invent release scope or redesign approved specialist components while integrating them.

### Project Control

Owns:

- release scope;
- accept/reject/defer classification;
- specialist handoff review;
- cross-thread consistency checks;
- Integration Contract;
- Codex work orders;
- release acceptance.

Specialist work should normally pass through Project Control before Codex integration.

## 3. Update lifecycle

```text
Idea
↓
Project Control classification
  ├─ next release
  ├─ future roadmap
  └─ idea only
↓
Specialist specification / prototype
↓
Local numerical experiment if required
↓
Project Control review
↓
Codex handoff
↓
Codex integration
↓
Browser / regression verification
↓
Release decision
```

## 4. RESET visual updates

RESET visuals are expected to evolve mainly in the UI / Visual Effects workflow.

Preferred process:

```text
visual idea
→ independent prototype update
→ Project Control approval
→ integration contract update if needed
→ Codex replaces/connects the approved component
```

Do not make Codex discover the comedy direction while simultaneously integrating unrelated game logic.

## 5. Balance updates

Preferred process:

```text
balance hypothesis
→ Logic / Balance defines parameter experiment
→ local CPU runs reproducible experiment
→ Project reviews results
→ approved balance.json change
→ Codex integrates/verifies regression only when repo integration is needed
```

A one-off manual browser observation may suggest a hypothesis, but do not treat anecdotal play as a substitute for the later reproducible Balance Lab when quantitative claims are made.

## 6. Scope changes

When proposing a release change, record:

- what changes;
- why;
- whether it is required for the current release;
- effects on other specifications/components;
- expected Codex integration cost;
- whether balance experiments are required.

Preserve unrelated approved behavior unless explicitly changed.
