# v0.1.0 Release Candidate Checklist

## Local candidate

- [x] GitHub Pages root serves the introduction page; `game.html` runs the game with existing root-relative asset paths.
- [x] `.nojekyll` is present for a GitHub Pages branch/root publishing source.
- [x] Runtime has no `_handoff/`, secret, external-service, or local-machine dependency.
- [x] itch.io HTML5 ZIP puts the game as `index.html` at its root and contains runtime files only.
- [x] itch.io draft copy, 630×500 cover candidate, and five production screenshots are prepared.
- [ ] Human final playthrough: Normal Operation → Day 30 → Play Again.
- [ ] Human listen check for normal ambience, ATTENTION, RESET silence/impact, mute, and return to NORMAL.
- [ ] Decide final license and fill canonical source/Pages URLs.

## GitHub Pages — after explicit publication approval

- [x] Create the GitHub repository and choose its visibility.
- [x] Review source files and commit the approved v0.1.0 candidate.
- [x] Add the remote and push the approved branch.
- [ ] Select the repository root as the Pages publishing source and enable Pages.
- [ ] Verify the public URL, asset paths, browser console, audio gesture, saves, and replay on the hosted site.
- [ ] Replace `[GITHUB_PAGES_URL]` and `[GITHUB_REPOSITORY_URL]` in README and itch page draft.

## itch.io — after Pages verification

- [ ] Create or open an itch.io Draft page; do not make it Public before review.
- [ ] Upload `itch/TheResetCompany-v0.1.0.zip` as an HTML5 browser game and enable the embedded viewport.
- [ ] Add `cover-630x500.png`, the five screenshots, title, descriptions, controls, disclaimer, and accurate tags.
- [ ] Verify the Draft page and game embed at desktop/mobile widths.
- [ ] Publish only after explicit user approval; verify the public game page.

## Prepared artifacts

- itch runtime: `release/itch/TheResetCompany-v0.1.0.zip`
- page text: `release/itch/ITCH_PAGE.md`
- cover: `release/itch/cover-630x500.png`
- screenshots: `release/itch/screenshots/01-normal-operation.png` through `05-ending-report.png`

GitHub remote/push/Pages enablement and itch.io upload/Public status are intentionally not performed in the integration task.
