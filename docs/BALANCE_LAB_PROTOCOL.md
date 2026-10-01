# TheResetCompany — Balance Lab Reproducibility Protocol

## 1. Purpose

Balance experiments are not disposable tuning runs.

The project intends to later publish a technically serious, deliberately over-formal paper-style parody about applying Monte Carlo, sensitivity analysis, DOE, and quality-engineering ideas to the design of a ridiculous RESET game.

Therefore experiment conditions and outputs should be retained at a level that can be reproduced and, when appropriate, published as supporting data.

## 2. Core rule

Never save only the conclusion.

Save enough information to reproduce the result.

Keep these layers distinct:

1. experiment definition;
2. raw results;
3. processed/statistical results;
4. figures;
5. human interpretation/design decision.

## 3. Experiment ID

Use stable IDs:

```text
EXP-0001
EXP-0002
...
```

Do not reuse an ID for a materially different experiment.

## 4. Recommended future structure

When Balance Lab implementation begins, prefer a structure similar to:

```text
research/
└─ balance-lab/
   ├─ methodology/
   ├─ scripts/
   ├─ configs/
   └─ experiments/
      └─ EXP-0001/
         ├─ experiment.json
         ├─ README.md
         ├─ raw/
         ├─ processed/
         └─ figures/
```

Do not create a heavy analysis framework merely to satisfy this layout before Balance Lab work begins.

## 5. Minimum experiment metadata

Each `experiment.json` should record at least:

```text
experimentId
date
gameVersion
engineVersion or source commit/hash when available
balanceProfile / balance file hash
purpose
hypothesis
factors varied
factor levels / ranges
factors held fixed
seed generation rule or exact seed set
trial count
virtual-player strategies
response metrics
script name/version
runtime/environment notes when material
```

## 6. Raw data

Raw simulation output should be treated as immutable evidence.

Preferred formats:

- CSV for rectangular tables;
- JSONL for per-run structured records;
- JSON for compact experiment/config metadata.

Do not manually edit raw numerical output to make a figure look cleaner.

If a correction requires rerunning the experiment, record a new run/revision rather than silently replacing unexplained values.

## 7. Processed data

Derived outputs may include:

- means;
- standard deviations;
- quantiles;
- confidence intervals when appropriate;
- game-over rate;
- final-user distributions;
- RESET counts;
- strategy comparisons;
- sensitivity measures;
- parameter response curves.

Processing scripts must be retained so processed results can be regenerated from raw data.

## 8. Figures

Keep figure-generation code or commands with the experiment.

A publication figure should be traceable to:

```text
experiment ID
→ processed/raw source
→ plotting script/version
```

## 9. Interpretation

Separate statements such as:

> Global RESET appears dominant in this tested range.

from raw facts such as mean score values.

Record:

- interpretation;
- decision taken;
- alternative explanations;
- limitations;
- whether further experiments are required.

## 10. Seed and determinism

When possible, use deterministic seed rules.

Store either:

- the full seed list; or
- an unambiguous seed-generation rule and RNG version.

Changing the RNG algorithm is a methodological change and must be recorded.

## 11. Large datasets and later publication

Do not force very large raw outputs into Git history merely for completeness.

If data becomes too large for the source repository, keep a reproducible local archive and publish it later as an appropriate data/release artifact with checksums and experiment metadata.

The publication mechanism can be decided when the repository/publication strategy is finalized.

## 12. Methodological honesty

The article/paper may be parody, but the numerical method and reported experiment conditions should be genuine.

Do not present exploratory tuning as confirmatory evidence, do not hide failed/contradictory runs when they matter to the conclusion, and do not claim generality beyond the tested parameter/seeds/strategies.
