# Leonida Platinum Atlas — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/wizzy-bounty/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/wizzy-bounty/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An unofficial, offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** with their official PlayStation names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden) in `app/data/trophies.json`.
- **A guide in our own words for every trophy** — what to do, where, how, and when it can be missed — with the sources for each fact named beside it. No guide text is copied from anywhere; a claim with no source earns no credit.
- **Roadmap to the platinum** in five phases, in order: story → strangers → collectibles → activities → crime-spree cleanup, ending with 100% completion and *Vice Got a Price!*
- **Missable flags** — 14 trophies flagged, including the one confirmed missable (*Positive Mental Attitude*: Lucia's balcony meditation spot in Chapter 1, gone after the chapter, no mission replay).
- **Tracker**: tick trophies off, progress saves in localStorage, export to a file and import it back. Filters by story / missable / collectibles / activities / online (there are no online trophies — all 55 are single-player), plus a spoiler setting that hides story-trophy names and descriptions until earned.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Static files only, no build step, no network at run time. Serve `app/` from any static server with `app/` at its root.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

## Sources

Names, descriptions and grades are PlayStation's official list as published 18 November 2026 (Exophase / PSNProfiles, via Push Square). Guides draw on Planet GTA 6, Output Lag, EGamers, KeenGamer and GTA Vice City Hub — each trophy names its sources in the app. Unofficial fan guide; not affiliated with Rockstar Games, Sony or PlayStation. No Rockstar logo, artwork, box art or game screenshot is used anywhere.
