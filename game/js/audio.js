// audio.js — tiny WebAudio synth. No audio files, no network:
// every sound is an oscillator envelope built in code.
let ctx = null;

export function ensureAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  const ac = ensureAudio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click() { tone(660, 0.07, 'triangle', 0.12); },
  deal() { tone(440, 0.09, 'sine', 0.12, 0, 520); },
  play() { tone(523, 0.12, 'triangle', 0.16); tone(784, 0.14, 'triangle', 0.12, 0.06); },
  hit() { tone(180, 0.18, 'sawtooth', 0.16, 0, 90); },
  shield() { tone(392, 0.16, 'sine', 0.14, 0, 520); },
  draw() { tone(880, 0.08, 'sine', 0.1); },
  turn() { tone(330, 0.1, 'triangle', 0.12); tone(440, 0.12, 'triangle', 0.1, 0.09); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.16, i * 0.12));
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.32, 'sawtooth', 0.1, i * 0.14));
  },
};
