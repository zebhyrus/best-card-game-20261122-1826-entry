# Ember Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/zebhyrus/best-card-game-20261122-1826-entry/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/zebhyrus/best-card-game-20261122-1826-entry/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original turn-based card duel. You and a rival each have 30 life and 3 energy per turn. Play attack, shield, draw, heal and combo cards from a 24-card deck: Chain Spark deals +3 when played after another card, Tide Leech heals you as it hits, and shields absorb damage. The rival AI chases lethal, guards when hurt, and plays its best card first, so its choices are readable and counterable. First to 0 life loses.

## How to run

Serve the `game/` folder with any static server, then open it in a desktop browser:

```sh
cd game
python3 -m http.server 8080
```

Then visit http://localhost:8080. No build step, no network requests, no external assets. Click a card (or press 1–7) to play it, Space to end your turn, Enter to start, R to rematch.

## Files

- `game/index.html` — page, title / table / win / loss screens
- `game/css/style.css` — table, cards, animations
- `game/js/cards.js` — card catalogue and deck builder
- `game/js/state.js` — pure rules engine (life, energy, shield, combos)
- `game/js/ai.js` — the rival's readable scoring AI
- `game/js/render.js` — DOM rendering of hands, life bars and log
- `game/js/audio.js` — WebAudio synth sounds
- `game/js/main.js` — wiring, keyboard, turn flow, screenshot demo hook
