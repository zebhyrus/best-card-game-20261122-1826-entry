// state.js — the pure rules engine for Ember Duel. No DOM, no audio:
// the browser UI and the Node play-test both drive these functions.
// Each side: 30 life, 3 energy a turn, a deck, a hand, a discard pile,
// a shield pool that absorbs damage until it is spent.
import { buildDeck, cardById } from './cards.js';

export const MAX_LIFE = 30;
export const MAX_ENERGY = 3;
export const START_HAND = 4;
export const MAX_HAND = 7;

export function makeSide(rng = Math.random) {
  return {
    life: MAX_LIFE, energy: 0, shield: 0,
    deck: buildDeck(rng), hand: [], discard: [],
    playedThisTurn: 0,
  };
}

export function newGame(rng = Math.random) {
  const state = {
    player: makeSide(rng), enemy: makeSide(rng),
    turn: 1, phase: 'player', // player | enemy | won | lost
    log: ['The duel begins. You go first.'],
    lastPlayed: null,
  };
  drawCards(state.player, START_HAND);
  drawCards(state.enemy, START_HAND);
  startTurn(state.player);
  return state;
}

export function drawCards(side, n) {
  for (let i = 0; i < n; i++) {
    if (side.hand.length >= MAX_HAND) break;
    if (side.deck.length === 0) {
      if (side.discard.length === 0) break;
      side.deck = side.discard;
      side.discard = [];
      // Reshuffle the discard pile back into the deck.
      for (let j = side.deck.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [side.deck[j], side.deck[k]] = [side.deck[k], side.deck[j]];
      }
    }
    side.hand.push(side.deck.pop());
  }
}

export function startTurn(side) {
  side.energy = MAX_ENERGY;
  side.playedThisTurn = 0;
}

// Combo check: Chain Spark grows when another card was already played.
export function effectiveAttack(card, side) {
  return card.attack + (card.combo > 0 && side.playedThisTurn > 0 ? card.combo : 0);
}

export function canPlay(state, handIndex) {
  if (state.phase !== 'player') return false;
  const id = state.player.hand[handIndex];
  if (id === undefined) return false;
  return cardById(id).cost <= state.player.energy;
}

// Play the card at handIndex. Returns an event describing what happened,
// or null when the play is illegal.
export function playCard(state, handIndex) {
  if (!canPlay(state, handIndex)) return null;
  const me = state.player;
  const foe = state.enemy;
  const id = me.hand[handIndex];
  const card = cardById(id);
  me.hand.splice(handIndex, 1);
  me.discard.push(id);
  me.energy -= card.cost;
  me.playedThisTurn += 1;
  const atk = effectiveAttack(card, me);
  const parts = [];
  if (atk > 0) {
    const dealt = dealDamage(foe, atk);
    parts.push(`dealt ${dealt} damage`);
  }
  if (card.shield > 0) {
    me.shield = Math.min(12, me.shield + card.shield);
    parts.push(`gained ${card.shield} shield`);
  }
  if (card.heal > 0) {
    const healed = Math.min(card.heal, MAX_LIFE - me.life);
    me.life += healed;
    parts.push(`healed ${healed}`);
  }
  if (card.draw > 0) {
    drawCards(me, card.draw);
    parts.push(`drew ${card.draw}`);
  }
  const event = {
    cardId: id, cardName: card.name, attack: atk,
    by: 'player', text: parts.join(', ') || 'played',
  };
  state.lastPlayed = event;
  state.log.push(`You played ${card.name} (${event.text}).`);
  if (foe.life <= 0) { state.phase = 'won'; state.log.push('Rival defeated!'); }
  return event;
}

// Damage is absorbed by shield first, then life.
export function dealDamage(side, amount) {
  const absorbed = Math.min(side.shield, amount);
  side.shield -= absorbed;
  const toLife = amount - absorbed;
  side.life = Math.max(0, side.life - toLife);
  return toLife;
}

export function endPlayerTurn(state) {
  if (state.phase !== 'player') return false;
  state.phase = 'enemy';
  return true;
}

// The enemy's turn is driven by ai.js; this applies one enemy card.
export function playEnemyCard(state, handIndex) {
  const me = state.enemy;
  const foe = state.player;
  const id = me.hand[handIndex];
  if (id === undefined) return null;
  const card = cardById(id);
  if (card.cost > me.energy) return null;
  me.hand.splice(handIndex, 1);
  me.discard.push(id);
  me.energy -= card.cost;
  me.playedThisTurn += 1;
  const atk = effectiveAttack(card, me);
  const parts = [];
  if (atk > 0) parts.push(`dealt ${dealDamage(foe, atk)} damage`);
  if (card.shield > 0) { me.shield = Math.min(12, me.shield + card.shield); parts.push(`gained ${card.shield} shield`); }
  if (card.heal > 0) { const h = Math.min(card.heal, MAX_LIFE - me.life); me.life += h; parts.push(`healed ${h}`); }
  if (card.draw > 0) { drawCards(me, card.draw); parts.push(`drew ${card.draw}`); }
  const event = { cardId: id, cardName: card.name, attack: atk, by: 'enemy', text: parts.join(', ') || 'played' };
  state.lastPlayed = event;
  state.log.push(`Rival played ${card.name} (${event.text}).`);
  if (foe.life <= 0) { state.phase = 'lost'; state.log.push('You were defeated.'); }
  return event;
}

export function startEnemyTurn(state) {
  startTurn(state.enemy);
  drawCards(state.enemy, 1);
  state.log.push(`Turn ${state.turn}: the rival draws and acts.`);
}

export function startPlayerTurn(state) {
  state.turn += 1;
  state.phase = 'player';
  startTurn(state.player);
  drawCards(state.player, 1);
  state.log.push(`Turn ${state.turn}: your move. 3 energy, draw 1.`);
}

export function isOver(state) {
  return state.phase === 'won' || state.phase === 'lost';
}
