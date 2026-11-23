// cards.js — the card catalogue and deck builder for Ember Duel.
// Every card is plain data: id, name, suit, cost, attack, shield, heal,
// draw and a combo bonus. Suits are told apart by colour AND shape.
export const SUITS = {
  ember: { name: 'Ember', glyph: '▲', color: '#ff6b35', dark: '#c2410c' },
  tide: { name: 'Tide', glyph: '●', color: '#38bdf8', dark: '#0369a1' },
  gale: { name: 'Gale', glyph: '◆', color: '#a3e635', dark: '#4d7c0f' },
  stone: { name: 'Stone', glyph: '■', color: '#fbbf24', dark: '#b45309' },
};

export const CARD_TYPES = {
  strike: {
    id: 'strike', name: 'Ember Strike', suit: 'ember', cost: 1,
    attack: 3, shield: 0, heal: 0, draw: 0, combo: 0,
    text: 'Deal 3 damage.',
  },
  heavy: {
    id: 'heavy', name: 'Stone Crash', suit: 'stone', cost: 2,
    attack: 5, shield: 0, heal: 0, draw: 0, combo: 0,
    text: 'Deal 5 damage.',
  },
  guard: {
    id: 'guard', name: 'Tide Guard', suit: 'tide', cost: 1,
    attack: 0, shield: 4, heal: 0, draw: 0, combo: 0,
    text: 'Gain 4 shield.',
  },
  bulwark: {
    id: 'bulwark', name: 'Stone Bulwark', suit: 'stone', cost: 2,
    attack: 0, shield: 7, heal: 0, draw: 0, combo: 0,
    text: 'Gain 7 shield.',
  },
  insight: {
    id: 'insight', name: 'Gale Insight', suit: 'gale', cost: 1,
    attack: 0, shield: 0, heal: 0, draw: 2, combo: 0,
    text: 'Draw 2 cards.',
  },
  spark: {
    id: 'spark', name: 'Chain Spark', suit: 'ember', cost: 1,
    attack: 2, shield: 0, heal: 0, draw: 0, combo: 3,
    text: 'Deal 2 damage. +3 if you already played a card this turn.',
  },
  leech: {
    id: 'leech', name: 'Tide Leech', suit: 'tide', cost: 2,
    attack: 3, shield: 0, heal: 3, draw: 0, combo: 0,
    text: 'Deal 3 damage. Heal 3 life.',
  },
  surge: {
    id: 'surge', name: 'Gale Surge', suit: 'gale', cost: 2,
    attack: 2, shield: 0, heal: 0, draw: 1, combo: 0,
    text: 'Deal 2 damage. Draw 1 card.',
  },
};

// How many copies of each type go into a 24-card deck.
const DECK_RECIPE = [
  ['strike', 5], ['heavy', 3], ['guard', 4], ['bulwark', 2],
  ['insight', 3], ['spark', 4], ['leech', 2], ['surge', 1],
];

export function cardById(id) {
  return CARD_TYPES[id] ?? null;
}

// Build a fresh shuffled deck. Pass a rng so tests can seed it.
export function buildDeck(rng = Math.random) {
  const deck = [];
  for (const [id, count] of DECK_RECIPE) {
    for (let i = 0; i < count; i++) deck.push(id);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function deckSize() {
  return DECK_RECIPE.reduce((n, [, c]) => n + c, 0);
}
