# TheResetCompany

TheResetCompany is a small browser parody and management simulation about service limits, user expectations, and the corporate instinct to solve every problem with a RESET.

> Serious technology. A completely unserious company.

## Play

- **GitHub Pages:** Link will be added after publication.
- **itch.io:** [Play on itch.io](https://noarecord.itch.io/the-reset-company)

## Play locally

The game is static HTML, CSS, JavaScript, and JSON. It has no build step, backend, account, or external service dependency.

From this folder, start a local static server:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000/> in a browser. Serving over HTTP is recommended because the game loads its JSON data with `fetch()`.

## Employee Mode

Employee Mode runs for 30 Days. Each Day follows the same order: service pressure, one player decision, then settlement.

- **WAIT** keeps the current service policy.
- **BANKED RESET** spends one Banked Reset stock for a routine recovery. It does not spend RESET Energy.
- **PREPARE GLOBAL RESET** starts the full RESET sequence when at least 90 RESET Energy is available. The game applies its RESET effect only when HOLD reaches 100% and CODE-X RESET begins.

RESET Energy starts at 60, increases by 30 after each Settlement, and is capped at 100. Banked Reset stock is a separate limited resource granted by selected events. Settlement also recovers 20% of remaining exhausted users. The Daily Report separates new users, returning users, churn, and net change; Krog's fictional feed uses deterministic, local message selection.

At Day 30, the game reports a Final Score and a Mr. Som evaluation. Krog's monitor uses static fictional messages selected from game-state signals and event tags.

JUST RESET is a separate mode that reuses the same visual sequence without changing Employee Mode state or spending Energy.

## Controls and audio

- Use the mouse or touch to begin each Day and choose WAIT, BANKED RESET, or PREPARE GLOBAL RESET.
- Release Final Safety, open the Safety Cover, then hold the RESET control to 100% when prompted.
- Press `Space` or `Enter` while the RESET control is focused for keyboard input.
- Use the `AUDIO` control to mute or unmute the original generated electronic ambience. Audio begins after a player gesture and can be unavailable in browsers that block Web Audio.
- At Day 30, review USER VOICES and select `[ PLAY AGAIN ]` to begin a fresh run.

## Audio and saved state

Procedural, original Web Audio tones begin after the first player gesture, subject to browser autoplay rules. Use the visible audio control to mute or unmute, including during a RESET sequence. Audio never controls game progression.

The browser's localStorage keeps the latest fully settled Employee Mode state (schema version 2) and the audio mute preference. Saves from older incompatible schemas are discarded. An in-progress GLOBAL RESET transaction is not saved. No telemetry or external requests are used.

## Project structure

- `js/engine/` — supplied deterministic game and scoring logic
- `js/controllers/` — Day flow and Engine/UI transaction boundary
- `js/ui/` — reserved for integrated UI components
- `js/audio/` — optional procedural audio controller
- `data/` — v0.1 balance and random event definitions
- `prototypes/reset-sequence/` — independently runnable GLOBAL RESET P0 prototype, reused by the game
- `tests/` — Logic baseline and integration-boundary tests

## Development checks

```sh
npm test
python -m unittest discover -s prototypes/reset-sequence/tests -v
```

The RESET prototype's browser tests require Playwright and a Chromium executable. The handoff's `/usr/bin/chromium` path is Linux-specific; on Windows, configure the test to use the executable installed by Playwright or another available Chromium build.

## v0.1 scope

This release focuses on Employee Mode, Banked and Global Reset, a small set of random events, the fictional Krog monitor, JUST RESET, a responsive CRT-style interface, local persistence, and reduced-motion support. Client Mode, real social media content, external APIs, backends, accounts, rankings, multiplayer, and advanced Balance Lab systems are outside this release.

## Parody and publication status

The Reset Company is an unofficial parody. The company, services, characters, events, and social posts shown in the game are fictional. The game does not retrieve real social-media content.

Version v0.1.0 is available on itch.io. GitHub Pages setup and hosted verification remain pending. Source is available at <https://github.com/NoaRecord/TheResetCompany>.
