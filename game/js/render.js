// render.js — draws the table into the DOM. Cards are real DOM elements
// so they stay legible at thumbnail size; CSS transitions do the slide,
// flip and snap. Suits differ by colour AND glyph, never text alone.
import { SUITS, cardById } from './cards.js';
import { MAX_LIFE } from './state.js';

const $ = (id) => document.getElementById(id);

export function cardElement(id, opts = {}) {
  const card = cardById(id);
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = 'card' + (opts.mini ? ' mini' : '') + (opts.playable === false ? ' dim' : '');
  el.dataset.cardId = id;
  el.style.setProperty('--suit', suit.color);
  el.style.setProperty('--suit-dark', suit.dark);
  el.innerHTML =
    `<div class="cost">${card.cost}</div>` +
    `<div class="suit-glyph" style="color:${suit.color}">${suit.glyph}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-suit">${suit.name}</div>` +
    `<div class="card-stats">` +
    (card.attack ? `<span class="atk">⚔ ${card.attack}${card.combo ? `+${card.combo}` : ''}</span>` : '') +
    (card.shield ? `<span class="shd">🛡 ${card.shield}</span>` : '') +
    (card.heal ? `<span class="heal">✚ ${card.heal}</span>` : '') +
    (card.draw ? `<span class="drw">⇪ ${card.draw}</span>` : '') +
    `</div>` +
    `<div class="card-text">${card.text}</div>`;
  return el;
}

export function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card back';
  el.innerHTML = '<div class="back-mark">◆</div><div class="back-name">EMBER<br>DUEL</div>';
  return el;
}

function lifeBar(el, life) {
  const pct = Math.max(0, (life / MAX_LIFE) * 100);
  el.style.width = `${pct}%`;
  el.classList.toggle('low', life <= 10);
}

export function render(state, ui) {
  // Life totals and shields.
  $('player-life').textContent = `${state.player.life}`;
  $('enemy-life').textContent = `${state.enemy.life}`;
  $('player-shield').textContent = state.player.shield > 0 ? `🛡 ${state.player.shield}` : '';
  $('enemy-shield').textContent = state.enemy.shield > 0 ? `🛡 ${state.enemy.shield}` : '';
  lifeBar($('player-life-bar'), state.player.life);
  lifeBar($('enemy-life-bar'), state.enemy.life);
  $('player-energy').textContent = `Energy ${state.player.energy} / 3`;
  $('enemy-energy').textContent = `Energy ${state.enemy.energy} / 3`;
  $('turn-label').textContent = `Turn ${state.turn}`;
  $('deck-count').textContent = `Deck ${state.player.deck.length}`;
  $('enemy-deck-count').textContent = `Deck ${state.enemy.deck.length}`;

  // Opponent hand: card backs, count honest.
  const foe = $('enemy-hand');
  foe.innerHTML = '';
  state.enemy.hand.forEach(() => foe.appendChild(cardBackElement()));

  // Player hand: clickable cards, dim when unaffordable.
  const hand = $('player-hand');
  hand.innerHTML = '';
  state.player.hand.forEach((id, i) => {
    const card = cardById(id);
    const playable = state.phase === 'player' && card.cost <= state.player.energy;
    const el = cardElement(id, { playable });
    el.style.setProperty('--i', i);
    el.addEventListener('click', () => ui.onCardClick(i));
    hand.appendChild(el);
  });

  // Last played card, shown centre-table.
  const last = $('last-played');
  last.innerHTML = '';
  if (state.lastPlayed) {
    const who = state.lastPlayed.by === 'player' ? 'You played' : 'Rival played';
    const tag = document.createElement('div');
    tag.className = 'last-tag';
    tag.textContent = `${who}: ${state.lastPlayed.cardName} — ${state.lastPlayed.text}`;
    last.appendChild(tag);
  }

  // Battle log, newest last.
  const log = $('log');
  log.innerHTML = '';
  state.log.slice(-6).forEach((line) => {
    const li = document.createElement('div');
    li.textContent = line;
    log.appendChild(li);
  });

  // Turn banner + end-turn button state.
  const banner = $('banner');
  if (state.phase === 'player') banner.textContent = 'Your turn — play a card or end your turn';
  else if (state.phase === 'enemy') banner.textContent = 'Rival is thinking…';
  else banner.textContent = '';
  $('end-turn').disabled = state.phase !== 'player';
  $('end-turn').textContent = state.phase === 'player' ? 'End Turn (Space)' : 'Rival’s turn…';

  // Win / loss overlays.
  $('win-screen').classList.toggle('show', state.phase === 'won');
  $('lose-screen').classList.toggle('show', state.phase === 'lost');
  if (state.phase === 'won') $('win-stats').textContent = `You won in ${state.turn} turns with ${state.player.life} life left.`;
  if (state.phase === 'lost') $('lose-stats').textContent = `The rival won on turn ${state.turn}. Your life hit 0.`;
}

export function flashLife(who) {
  const el = $(who === 'player' ? 'player-panel' : 'enemy-panel');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}
