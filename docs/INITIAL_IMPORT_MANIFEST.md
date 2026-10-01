# TheResetCompany — Initial Import Manifest

Date: 2026-09-28

## Source packages

### Logic / Balance

Source archive:

```text
TheResetCompany_logic_v0_1_handoff.zip
```

SHA-256:

```text
745c3eddb7ef2c0b5a36bb703a9873f17fa78b7020f48060ef77e7434c41166a
```

Imported runtime/reference files:

```text
data/balance.json
data/events.json
js/engine/game-state.js
js/engine/game-engine.js
js/engine/rng.js
js/engine/scoring.js
tests/engine.test.mjs
tests/reference-vectors.json
package.json
```

The source handoff documentation is retained under:

```text
docs/handoff/logic/
```

Reported source-package verification before import:

- Node.js syntax check: PASS
- JSON syntax check: PASS
- automated tests: 22/22 PASS
- 30-Day completion: PASS
- same-seed reproducibility: PASS
- Global Reset prepare/cancel/commit/double-commit protection: PASS

## GLOBAL RESET P0

Source archive:

```text
TheResetCompany-reset-sequence-P0.zip
```

SHA-256:

```text
b260cc1b75452ae4473475100ef1c387d603e193f36261e0ee707c1fc53ea2b4
```

Imported prototype:

```text
prototypes/reset-sequence/
```

Design/implementation source documents are retained under:

```text
docs/handoff/ui/
```

Reported source-package verification before import:

- automated tests: 11/11 PASS
- JS syntax: PASS
- HTML parse: PASS
- desktop and 320px behavior covered by prototype verification

The P0 archive intentionally contains no audio. Audio was subsequently added to the v0.1 integration requirements and is specified separately in `docs/AUDIO_SPEC_V0_1.md`.

## Import principle

Imported Logic engine and RESET prototype files were copied into this initial package without redesigning their implementation.

Project Control integration documents added around them do not replace the original specialist handoff documents.
