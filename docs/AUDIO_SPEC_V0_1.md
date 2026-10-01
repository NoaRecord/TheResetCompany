# TheResetCompany — Audio Specification v0.1

## 1. Goal

Avoid a completely silent 5–8 minute session while using audio to reinforce the joke that normal operations are mundane and GLOBAL RESET is absurdly overproduced.

Audio is part of v0.1, but music production must not delay the release.

## 2. Preferred implementation

First choice: simple original procedural audio using the Web Audio API.

Reasons:

- no external music license dependency;
- no downloadable music asset required;
- lightweight static deployment;
- easy transition between game states;
- easy mute/volume control.

Do not imitate a recognizable existing melody or soundtrack.

If an external audio asset is ever introduced, its redistribution license and source must be documented before public release.

## 3. Audio states

### NORMAL

Default operations music.

- quiet;
- repetitive but unobtrusive;
- retro-computer / outdated corporate-training / terminal-room feeling;
- intentionally less dramatic than RESET.
- use the existing four-note NORMAL motif at gain `0.055`;
- set the cadence from current Frustration, then ease toward cadence changes by at most 250 ms per note:
  - `0–34`: 1.8 seconds;
  - `35–54`: 1.4 seconds;
  - `55–74`: 1.1 seconds;
  - `75–100`: 0.8 seconds.

The cadence is a restrained status cue, not a new composition. Keep it independent of Game Engine calculations and do not shorten the fastest interval below 0.8 seconds in v0.1.

### ATTENTION

Used during a meaningful Player Decision / alert state.

Prefer a variation of NORMAL rather than a fully separate composed track.

Possible changes:

- denser pulse;
- altered bass pattern;
- slightly increased tension;
- warning tone layer.

Avoid turning every small state change into a dramatic musical event.

### GLOBAL_RESET

Clearly distinct from NORMAL/ATTENTION.

Desired arc:

```text
Sequence starts
→ tension rises
→ Final Safety / HOLD
→ brief silence immediately before CODE-X RESET
→ RESET impact
→ Propagation
→ Complete at 100% remains visible for 1 second
→ return/fade to normal operations audio
```

The brief silence is important because it is more effective when ordinary gameplay normally contains sound.

## 4. Browser behavior

Do not depend on autoplay.

- Create/resume `AudioContext` only after a user gesture as required by the browser.
- Provide a visible mute control.
- Mute must remain usable during the GLOBAL RESET sequence.
- Audio failure or suspension must never stop gameplay or RESET completion.
- Keep default volume modest.

## 5. Architecture

Keep audio independent from Game Engine formulas.

A small controller API is sufficient, for example conceptually:

```text
audio.startAfterUserGesture()
audio.setState("NORMAL")
audio.setState("ATTENTION")
audio.setState("GLOBAL_RESET")
audio.setMuted(true|false)
```

Exact names are an implementation detail.

Game logic must not import Web Audio APIs directly.

## 6. Scope control

Not required for v0.1:

- multiple full-length songs;
- external music search;
- complex soundtrack sequencing;
- adaptive generative composition;
- audio asset pipeline;
- advanced mixing system.

A simple, reliable procedural loop with clear state contrast is sufficient.
