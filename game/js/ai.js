// ai.js — the rival's brain. Readable and counterable on purpose:
// it chases lethal, then guards when it is hurt, then plays its biggest
// affordable attack, and it loves Chain Spark after another card.
import { cardById } from './cards.js';
import { effectiveAttack } from './state.js';

// Score one candidate play from the enemy's point of view.
// Higher is better; the rival plays the best card while it can afford one.
export function scorePlay(state, handIndex) {
  const me = state.enemy;
  const foe = state.player;
  const card = cardById(me.hand[handIndex]);
  if (!card || card.cost > me.energy) return -Infinity;
  const atk = effectiveAttack(card, me);
  let score = 0;
  if (atk >= foe.life + foe.shield) score += 1000; // lethal now
  score += atk * 10;
  if (card.shield > 0) {
    // Guard matters most when the rival is low or the player is loaded.
    const hurt = me.life <= 12 ? 3 : 1;
    score += card.shield * hurt;
  }
  if (card.heal > 0) score += card.heal * (me.life <= 15 ? 4 : 1);
  if (card.draw > 0) score += 6;
  if (card.combo > 0 && me.playedThisTurn > 0) score += 12;
  score -= card.cost * 2; // prefer cheap value, keep energy for more plays
  return score;
}

// Pick the enemy's next card, or -1 when it should stop.
export function chooseCard(state) {
  let best = -1;
  let bestScore = 0;
  state.enemy.hand.forEach((_, i) => {
    const s = scorePlay(state, i);
    if (s > bestScore) { bestScore = s; best = i; }
  });
  return best;
}

// Run a whole enemy turn synchronously (the UI replays it with delays).
// Returns the list of events, in order.
export function runEnemyTurn(state, playOne) {
  const events = [];
  let guard = 0;
  while (guard++ < 12) {
    const i = chooseCard(state);
    if (i < 0) break;
    const ev = playOne(state, i);
    if (!ev) break;
    events.push(ev);
    if (state.phase === 'lost') break;
  }
  return events;
}
