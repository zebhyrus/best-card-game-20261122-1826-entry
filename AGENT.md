# AGENT.md — Ember Duel

An original turn-based card duel for the make.fun best-card-game bounty.

**Rules:** each side has 30 life and 3 energy per turn, draws 1 card per turn from a 24-card deck, starts with 4 cards. Cards cost energy and combine: Ember Strike (1, 3 dmg), Stone Crash (2, 5 dmg), Tide Guard (1, 4 shield), Stone Bulwark (2, 7 shield), Gale Insight (1, draw 2), Chain Spark (1, 2 dmg, +3 if played after another card this turn), Tide Leech (2, 3 dmg + heal 3), Gale Surge (2, 2 dmg + draw 1). Shield absorbs damage. First to 0 life loses.

**Opponent:** a scoring AI in `game/js/ai.js` that chases lethal, guards when hurt, and values combos — readable and counterable.

**Structure:** `game/js/cards.js` (catalogue/deck), `game/js/state.js` (pure rules engine, no DOM), `game/js/ai.js`, `game/js/render.js` (DOM + CSS transitions), `game/js/audio.js` (WebAudio synth, no files), `game/js/main.js` (wiring, keyboard, demo hook `?shot=table|win|loss` for screenshots; default load is the title screen).

**Run:** serve `game/` statically and open `index.html`. No build, no network.
