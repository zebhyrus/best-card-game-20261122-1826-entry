// main.js — wires the rules engine to the page: title screen, turns,
// keyboard + mouse play, the rival's animated turn, and the demo hook
// (?shot=title|table|win|loss) used only for screenshots.
import { newGame, playCard, endPlayerTurn, startEnemyTurn, startPlayerTurn, playEnemyCard, isOver } from './state.js';
import { chooseCard } from './ai.js';
import { render, flashLife } from './render.js';
import { sfx, ensureAudio } from './audio.js';

let state = null;
let busy = false;

const $ = (id) => document.getElementById(id);

function refresh() { render(state, { onCardClick }); }

function onCardClick(i) {
  if (busy || !state || state.phase !== 'player') return;
  const before = state.enemy.life;
  const ev = playCard(state, i);
  if (!ev) { sfx.click(); return; }
  ensureAudio();
  if (ev.attack > 0) { sfx.hit(); if (state.enemy.life < before) flashLife('enemy'); }
  else if (ev.cardId === 'guard' || ev.cardId === 'bulwark') sfx.shield();
  else if (ev.cardId === 'insight' || ev.cardId === 'surge') sfx.draw();
  else sfx.play();
  refresh();
  if (isOver(state)) { sfx.win(); }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function endTurn() {
  if (busy || !state || state.phase !== 'player') return;
  busy = true;
  sfx.turn();
  endPlayerTurn(state);
  startEnemyTurn(state);
  refresh();
  await sleep(500);
  // Play the rival's picks one by one so its choices are readable:
  // choose, play, render, pause — never all at once.
  for (let guard = 0; guard < 12; guard++) {
    const i = chooseCard(state);
    if (i < 0) break;
    const ev = playEnemyCard(state, i);
    if (!ev) break;
    if (ev.attack > 0) { sfx.hit(); flashLife('player'); }
    else sfx.play();
    refresh();
    await sleep(650);
    if (isOver(state)) break;
  }
  if (!isOver(state)) {
    startPlayerTurn(state);
    sfx.turn();
  } else if (state.phase === 'lost') {
    sfx.lose();
  }
  refresh();
  busy = false;
}

function startGame() {
  ensureAudio();
  sfx.deal();
  state = newGame();
  $('title-screen').classList.remove('show');
  $('table').classList.remove('hidden');
  refresh();
}

function restart() {
  $('win-screen').classList.remove('show');
  $('lose-screen').classList.remove('show');
  startGame();
}

// Deterministic demo states for screenshots; the default load is the
// normal title screen. ?shot=table|win|loss only.
function demoState(kind) {
  state = newGame(() => 0.5);
  $('title-screen').classList.remove('show');
  $('table').classList.remove('hidden');
  if (kind === 'table') {
    // A lively mid-game: both sides hurt, shields up, hands full.
    state.player.life = 18; state.enemy.life = 14;
    state.player.shield = 4; state.enemy.shield = 3;
    state.player.energy = 2; state.turn = 5;
    state.player.hand = ['strike', 'spark', 'guard', 'heavy', 'insight'];
    state.enemy.hand = ['strike', 'guard', 'heavy', 'spark'];
    state.log.push('Turn 5: you hold Chain Spark — play it after another card for +3.');
  } else if (kind === 'win') {
    state.enemy.life = 0; state.player.life = 11; state.turn = 8;
    state.phase = 'won';
    state.log.push('You played Stone Crash. Rival defeated!');
  } else if (kind === 'loss') {
    state.player.life = 0; state.enemy.life = 9; state.turn = 7;
    state.phase = 'lost';
    state.log.push('Rival played Stone Crash. You were defeated.');
  }
  refresh();
}

function init() {
  $('start-btn').addEventListener('click', startGame);
  $('how-btn').addEventListener('click', () => $('howto').classList.toggle('show'));
  $('end-turn').addEventListener('click', endTurn);
  $('again-win').addEventListener('click', restart);
  $('again-lose').addEventListener('click', restart);
  document.addEventListener('keydown', (e) => {
    if ($('title-screen').classList.contains('show')) {
      if (e.key === 'Enter') startGame();
      return;
    }
    if (state && (state.phase === 'won' || state.phase === 'lost')) {
      if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') restart();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); endTurn(); }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 7) onCardClick(n - 1);
  });
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot === 'table' || shot === 'win' || shot === 'loss') demoState(shot);
}

init();
