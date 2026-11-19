# Leonida Platinum Atlas — GTA 6 Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/wizzy-bounty/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/wizzy-bounty/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

All 55 GTA 6 trophies on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — with a cited guide for each one, a five-phase roadmap to the platinum, and a tracker that saves your progress in your browser.

## What this guide does differently

- **Every guide is cited.** Each trophy carries two named sources (PowerPyx, GTABase, Output Lag, Planet GTA 6, KeenGamer, EGamers) with links, so you can check the method yourself.
- **Honest about the unknown.** Five trophies have no confirmed unlock method at launch. This guide says so on each one instead of inventing a method — check the cited guides again after launch week.
- **One missable, flagged loud.** Positive Mental Attitude is the only trophy reported as possibly missable: Lucia's balcony meditation in Chapter 1, the morning after Down to Earth. The masthead warning and the roadmap both put it first.
- **Save discipline built in.** GTA 6 has no mission replay and no New Game Plus, so the roadmap tells you to keep a manual save at the start of every chapter and one before the final mission.
- **A tracker, not just a list.** Check off trophies (saved in localStorage), filter by category and grade, search, hide story spoilers (hidden trophies stay blurred until earned), hide earned, and export/import your progress as JSON.

## The numbers (PowerPyx, GTABase, Planet GTA 6)

- 55 trophies, all offline and single-player. No online trophies.
- Difficulty 4/10, about 200 hours to the platinum, one playthrough.
- Cheats disable trophies and saving — keep them off for the whole run.
- 100% completion (A Long Road, gold) splits 45% story and tasks, 45% exploration and activities, 10% discovery.

## The five phases

1. **Before you start** — saves, cheats, the one missable.
2. **Story first** — Chapters 1 to 4, side-character finals, stranger strands.
3. **Open-world sweep** — activities and driving: 42 shooting-range golds, 14 drone races, 20 races, 250 stunts, 50 challenges.
4. **The world itself** — collectibles and discovery: 100 WAiNK locations, 3 card sets, 18 meditation spots, 100 vehicles, 52 areas, 8 garages.
5. **Cleanup** — money, robberies, 100%: 5 bank vaults, 9 gangs, $250,000 laundered, $100,000 spent.

## Run it

Static files, no build step, no network at runtime:

```sh
node serve.ts
# open http://localhost:8080
```

Build the dossier the judge reads:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — the official 55 trophies with guides, steps, sources, roadmap and facts.
- `screenshots/` — four renders of the tracker in a real browser.
- `main.ts` — copies `app/` and `screenshots/` to the output and writes `dossier.json`.

An unofficial fan guide. Grand Theft Auto and GTA are trademarks of Rockstar Games. No Rockstar artwork, logos or screenshots are used here.
