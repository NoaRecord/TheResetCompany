# TheResetCompany — Logic / Balance v0.1 Deferred / Provisional Items

No blocking Project Control decision is currently required for the supplied v0.1 engine package.

The following items remain deliberately provisional or deferred.

## Balance coefficients

All concrete coefficients in `data/balance.json` are v0.1 initial values. They require browser playtesting after integration, but do not require pre-integration optimization.

Watch specifically for:

- 30 days feeling too long or too short
- Global Reset being too rare or too easy to reach
- Banked-only or Global-only play becoming obviously dominant
- WAIT becoming a meaningless action in almost all states
- Random Events overpowering player decisions
- Final Score feeling inconsistent with the visible outcome

## GLOBAL RESET reload recovery

The normal persistent Game State does not store visual RESET Sequence progress.

v0.1 does not guarantee exact recovery if the browser reloads in the middle of the HOLD / Propagation sequence.

If this later becomes necessary, store resume information in a session/UI controller layer instead of adding visual-sequence state to the normal Game State.

## Display copy

Not defined here:

- Random Event prose
- Krog post text
- Mr. Som comment prose

Logic exposes IDs, message keys, evaluation keys, severity, and tags.

## Advanced balance analysis

Deferred beyond v0.1:

- automated virtual-player strategy suite
- Monte Carlo
- parameter surveys
- sensitivity analysis
- DOE
- Taguchi-style S/N
- Controlled Instability
