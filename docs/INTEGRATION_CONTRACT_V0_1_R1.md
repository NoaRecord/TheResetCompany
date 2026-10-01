# TheResetCompany — v0.1 Revision 1 Integration Addendum

## Purpose and precedence

This addendum records the locally adopted Revision 1 balance, state, reporting, and presentation contract. It supplements the original [v0.1 Integration Contract](INTEGRATION_CONTRACT_V0_1.md). The original GLOBAL RESET prepare/commit boundary remains unchanged. These values are implemented in `data/balance.json` and `data/events.json`; this document does not replace those runtime sources.

## Adopted resources and recovery

- Employee state uses `schemaVersion: 2`; incompatible older local saves are discarded.
- RESET Energy starts at 60, has a cap of 100, and gains 30 per Settlement. GLOBAL RESET costs 90 Energy.
- Banked Reset stock starts at 0 and has a cap of 3. `USER_MILESTONE` grants one stock; `SERVER_TROUBLE` grants one with probability 0.25. Banked Reset consumes stock, never Energy.
- Banked recovery: exhausted recovery 35%, frustration −11, satisfaction +4, expectation +4, operational cost 15.
- GLOBAL RESET recovery: exhausted recovery 100%, frustration −40, satisfaction +12, expectation +18, operational cost 65.
- Each Settlement naturally recovers 20% of remaining exhausted users.

## Klaude accounting and daily report

State stores cumulative `grossLostToKlaude` and `returnedFromKlaude`; net loss is derived from their difference. A Settlement determines returning users from the pre-settlement Klaude pool before adding that day's newly lost users. The Daily Report distinguishes new users, returning users, gross churn, and net active-user change. Direct Pressure/Event Klaude losses and Settlement churn are attributed to that Day. The UI renders engine-supplied report values and does not recalculate them.

## Scoring and action availability

Revision 1 scoring and Mr. Som thresholds are defined by `data/balance.json` and `js/engine/scoring.js`. Operational costs accumulate under `totalOperationalCost`. `availableActions` from the app/controller is authoritative for action availability; the UI does not infer eligibility from Energy alone. WAIT remains available, Banked Reset requires stock, and Global Reset requires 90 Energy.

## Presentation integration

Employee Mode uses a compact desktop dashboard, a responsive single-column mobile layout, semantic metric states, a Klaude population indicator, Daily Report, a short static fictional Krog feed, Help, and an ending report overlay. The visible monitor title is `KROG SOCIAL MONITOR`; the RESET target label is `SOCIAL FRUSTRATION`. Krog selection is deterministic and UI-only; it does not consume or mutate the Game Engine RNG/state. The action set remains WAIT, BANKED RESET, and PREPARE GLOBAL RESET. Tybo WAIT-day posts remain outside this Revision 1 integration.

Final v0.1 polish adds recurring Krog phrases and ending USER VOICES, a controller-owned `[ PLAY AGAIN ]` request, a compact dedicated 1366×768 RESET viewport, and shared NORMAL / ATTENTION / GLOBAL_RESET ambience. See [the final integration release checklist](../release/RELEASE_CHECKLIST.md) for local validation and publication gates.

The large physical RESET Unit remains hidden during normal Employee gameplay and is shown only by the existing GLOBAL RESET sequence. JUST RESET remains separate from Employee state. Publication, remote repository setup, and GitHub Pages remain outside this local integration.
