"""Build the itch.io HTML5 ZIP with the game as its root index.html."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "release" / "itch" / "TheResetCompany-v0.1.0.zip"

# Keep this list aligned with RUNTIME_CONTENTS.md so marketing pages, tests,
# and handoff material never enter the uploaded game archive.
RUNTIME_FILES = (
    ("game.html", "index.html"),
    ("css/style.css", "css/style.css"),
    ("data/balance.json", "data/balance.json"),
    ("data/events.json", "data/events.json"),
    ("data/krog-messages.json", "data/krog-messages.json"),
    ("js/main.js", "js/main.js"),
    ("js/controllers/app-controller.js", "js/controllers/app-controller.js"),
    ("js/engine/game-engine.js", "js/engine/game-engine.js"),
    ("js/engine/game-state.js", "js/engine/game-state.js"),
    ("js/engine/rng.js", "js/engine/rng.js"),
    ("js/engine/scoring.js", "js/engine/scoring.js"),
    ("js/storage/save-state.js", "js/storage/save-state.js"),
    ("js/audio/audio-controller.js", "js/audio/audio-controller.js"),
    ("js/ui/ending-report.js", "js/ui/ending-report.js"),
    ("js/ui/krog-selector.js", "js/ui/krog-selector.js"),
    ("js/ui/metric-status.js", "js/ui/metric-status.js"),
    ("prototypes/reset-sequence/index.html", "prototypes/reset-sequence/index.html"),
    ("prototypes/reset-sequence/reset-sequence.css", "prototypes/reset-sequence/reset-sequence.css"),
    ("prototypes/reset-sequence/reset-sequence.js", "prototypes/reset-sequence/reset-sequence.js"),
)


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED) as archive:
        for source_name, archive_name in RUNTIME_FILES:
            source = ROOT / source_name
            if not source.is_file():
                raise FileNotFoundError(f"Required runtime file is missing: {source_name}")
            archive.write(source, archive_name)
    print(f"Built {OUTPUT.relative_to(ROOT)} ({len(RUNTIME_FILES)} files)")


if __name__ == "__main__":
    main()
