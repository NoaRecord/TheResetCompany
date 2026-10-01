# itch.io HTML5 Runtime Contents

`TheResetCompany-v0.1.0.zip` is built from the integrated production runtime. GitHub Pages uses the introduction page at the repository root and starts the game at `game.html`. For itch.io, the package builder copies `game.html` to `index.html` at the ZIP root so the embedded game opens directly. The ZIP contains only files loaded by the game:

- `index.html` (copied from `game.html`) and `css/style.css`
- `data/balance.json`, `data/events.json`, `data/krog-messages.json`
- `js/main.js` and its controller, engine, storage, audio, and UI modules
- `prototypes/reset-sequence/index.html`, `reset-sequence.css`, and `reset-sequence.js`

The ZIP excludes tests, handoff material, release notes, screenshots, and local browser saves. Serve the extracted directory over HTTP for local verification; opening the page as a `file:` URL may block module and JSON fetches.

Rebuild the package from the project root with:

```text
python tools/build_itch_package.py
```
