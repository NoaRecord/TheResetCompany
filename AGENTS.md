# AGENTS.md

## Purpose

This repository contains TheResetCompany, a small browser parody / management simulation.
Keep implementation lightweight and keep v0.1 scope disciplined.

`AGENTS.md` is a compact work contract and map, not the full project encyclopedia.
Use the deeper documents only when they are relevant to the current task.

## Instruction priority

When instructions conflict, follow this order:

1. the user's latest explicit instruction;
2. `docs/spec/V0_1_IMPLEMENTATION_PLAN.md` for current-release scope;
3. the relevant domain specification under `docs/spec/`;
4. this `AGENTS.md` and `PROJECT_OVERVIEW.md` for repository working rules/map;
5. `docs/INTEGRATION_CONTRACT_V0_1.md` for Engine↔UI details where it does not conflict with higher-ranked specifications;
6. existing implementation and tests;
7. agent judgment for reversible implementation details.

Do not silently expand v0.1 because an idea is interesting.

## Project map

For the first v0.1 integration, read:

- `PROJECT_OVERVIEW.md`
- `docs/CODEX_START.md`
- `docs/INTEGRATION_CONTRACT_V0_1.md`

Then consult only the specifications relevant to the task:

- v0.1 scope: `docs/spec/V0_1_IMPLEMENTATION_PLAN.md`
- RESET visuals: `docs/spec/RESET_SEQUENCE_SPEC.md`
- visual language: `docs/spec/VISUAL_STYLE_GUIDE.md`
- game/balance: `docs/handoff/logic/LOGIC_SPEC.md` and `docs/spec/BALANCE_DESIGN.md`
- audio: `docs/AUDIO_SPEC_V0_1.md`
- future workflow: `docs/DEVELOPMENT_WORKFLOW.md`
- research records: `docs/BALANCE_LAB_PROTOCOL.md`

Do not require every document to be reread for a small unrelated edit.

## Core engineering rules

- Prefer HTML, CSS, Vanilla JavaScript, JSON, and browser APIs.
- Avoid frameworks, bundlers, backend services, databases, authentication, or external APIs unless explicitly approved.
- Keep Game Engine logic independent from DOM, CSS animation, sound, and display copy.
- Keep visual prototypes independently runnable when practical.
- Preserve seed reproducibility in game logic.
- Prefer small, reviewable changes over unnecessary rewrites.
- Do not remove working behavior, tests, comments, compatibility notes, or debugging aids unless the task requires it.
- Do not redesign the supplied Logic engine or GLOBAL RESET prototype merely for stylistic preference.

## v0.1 scope guard

Do not add these to v0.1 without explicit approval:

- Client Mode;
- full pneumatic-tube visuals;
- full punch-card visuals;
- Executive Floor;
- complex research-department incidents;
- real X content/API;
- server DB/login/ranking/multiplayer;
- advanced Balance Lab, DOE, Taguchi S/N, or Controlled Instability.

The large physical red RESET button is not visible in NORMAL gameplay. It appears only as part of the GLOBAL RESET sequence.

## GLOBAL RESET boundary

Treat the Game Engine prepare/commit boundary as non-negotiable unless Project Control changes it.

Do not mutate Employee Game State when GLOBAL RESET is first selected.
Apply the Game Engine RESET effect only at HOLD 100% / CODE-X RESET through the integration callback.
Do not advance Settlement / Day++ until the sequence Promise completes.

Use `docs/INTEGRATION_CONTRACT_V0_1.md` for exact mapping.

## Audio

v0.1 includes a small audio-state system.
Prefer original procedural Web Audio API patterns over externally sourced music.
Audio must never block game progression.
Respect user gesture/autoplay constraints and provide mute control.

## Testing and verification

Before editing an existing working component, identify its baseline tests.
After changes, run the smallest relevant checks that verify the changed behavior.

Baseline Logic check:

```text
npm test
```

For UI changes, inspect the actual page in a browser when the environment allows it, including a normal desktop width and about 320px width.
A passing automated test alone does not prove visual quality.

Before completion:

- inspect the final diff or equivalent file changes;
- verify no unrelated behavior changed;
- report checks run and checks that could not be run;
- report unresolved integration issues.

## Git, publication, and destructive actions

- If this directory is not yet a Git repository, do not initialize Git unless the task explicitly requests it.
- Do not commit, push, create a remote repository, publish GitHub Pages, or change public hosting unless explicitly requested.
- Do not use destructive Git operations, rewrite history, or delete branches without explicit approval.
- Do not make file-ownership, ACL, or permission changes as a speculative fix.

## Secrets and public-readiness

The project is intended for eventual public release.
Never add API keys, credentials, tokens, private URLs containing secrets, personal test data, or unnecessary local-machine details to public project files.
Do not add telemetry, tracking, or third-party scripts without approval.

## Models, subagents, and future Codex changes

Do not hard-code model names, subscription tiers, polling intervals, or a particular subagent implementation in repository policy.
Use subagents only when parallelism or isolation materially improves the task.
The main agent remains responsible for integration and final verification.

After a major Codex/model behavior change (for example a major DevDay release), review this file and remove or update instructions that have become obsolete. Do not accumulate legacy prompting rules indefinitely.

## Local shell / sandbox caution

A different project on this workstation has shown a Codex sandbox / PowerShell startup problem that may involve file ownership or `.gitignore` handling. It is not known to apply to this new project.

If shell startup fails here:

- capture and report the exact error;
- distinguish environment failure from application/test failure;
- do not change ownership, ACLs, permissions, or global sandbox configuration speculatively;
- a different shell such as Git Bash may be used as a temporary command runner when available, but do not claim that this fixes the underlying sandbox issue.

See `docs/dev/KNOWN_CODEX_ENVIRONMENT_NOTE.md`.

## Completion report

Keep the final report concise and include:

- files changed;
- user-visible behavior changed;
- tests/checks performed and results;
- anything not verified;
- unresolved items / next integration step.

## Changes to this policy

Do not silently rewrite `AGENTS.md`.
Propose policy changes separately unless the user explicitly asks to update it.
