// Every sound in Gobble Getaway is synthesised with the Web Audio API at run time: no audio
// files, nothing loaded. The context starts on the player's first key or click, as browsers
// require, and M mutes everything.

let ctx = null;
let master = null;
let muted = false;
let musicTimer = null;
let musicStep = 0;

function ensureContext() {
  if (ctx) return ctx;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  ctx = new AudioCtor();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
  return ctx;
}

function tone({ freq, to = freq, time = 0.15, type = 'square', volume = 0.2, delay = 0 }) {
  if (!ctx || muted) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + time);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + time);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + time + 0.02);
}

function noise({ time = 0.2, volume = 0.25, filter = 900, delay = 0 }) {
  if (!ctx || muted) return;
  const start = ctx.currentTime + delay;
  const length = Math.floor(ctx.sampleRate * time);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = filter;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(lowpass).connect(gain).connect(master);
  src.start(start);
}

// A gobble is three quick warbling squawks, falling in pitch.
function gobble(delay = 0) {
  [0, 0.09, 0.18].forEach((offset, i) => {
    tone({ freq: 620 - i * 80, to: 380 - i * 60, time: 0.08, type: 'sawtooth', volume: 0.12, delay: delay + offset });
  });
}

export const sfx = {
  unlock() {
    const c = ensureContext();
    if (c && c.state === 'suspended') c.resume();
  },
  jump: () => tone({ freq: 340, to: 720, time: 0.14, type: 'square', volume: 0.12 }),
  flap: () => { noise({ time: 0.12, volume: 0.18, filter: 1800 }); tone({ freq: 500, to: 900, time: 0.1, volume: 0.08 }); },
  duck: () => tone({ freq: 300, to: 180, time: 0.08, type: 'triangle', volume: 0.1 }),
  dash: () => { noise({ time: 0.3, volume: 0.2, filter: 2600 }); tone({ freq: 220, to: 660, time: 0.25, type: 'sawtooth', volume: 0.08 }); },
  corn: () => { tone({ freq: 880, time: 0.07, type: 'triangle', volume: 0.15 }); tone({ freq: 1320, time: 0.1, type: 'triangle', volume: 0.12, delay: 0.06 }); },
  nearMiss: () => tone({ freq: 1200, to: 1600, time: 0.09, type: 'sine', volume: 0.1 }),
  hit: () => { noise({ time: 0.35, volume: 0.35, filter: 600 }); gobble(0.05); },
  knifeWhoosh: () => noise({ time: 0.25, volume: 0.12, filter: 3200 }),
  ovenRoar: () => noise({ time: 0.5, volume: 0.16, filter: 420 }),
  chop: () => { noise({ time: 0.12, volume: 0.3, filter: 1500 }); tone({ freq: 160, to: 60, time: 0.15, type: 'square', volume: 0.15 }); },
  spotted: () => { [0, 0.16, 0.32].forEach((d) => tone({ freq: 980, to: 760, time: 0.12, type: 'square', volume: 0.12, delay: d })); },
  hide: () => noise({ time: 0.4, volume: 0.15, filter: 700 }),
  lostTrack: () => tone({ freq: 400, to: 260, time: 0.4, type: 'triangle', volume: 0.14 }),
  stageClear: () => [523, 659, 784].forEach((f, i) => tone({ freq: f, time: 0.18, type: 'triangle', volume: 0.14, delay: i * 0.1 })),
  caught: () => [392, 370, 349, 262].forEach((f, i) => tone({ freq: f, to: f * 0.97, time: i === 3 ? 0.8 : 0.32, type: 'sawtooth', volume: 0.14, delay: i * 0.34 })),
  escaped: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone({ freq: f, time: 0.2, type: 'square', volume: 0.1, delay: i * 0.12 })); gobble(0.8); },
  click: () => tone({ freq: 660, time: 0.05, type: 'triangle', volume: 0.12 }),
};

// A loose banjo-and-bass chase tune in A minor, scheduled one step at a time.
const MELODY = [440, 0, 523, 440, 587, 0, 523, 440, 659, 587, 523, 0, 494, 523, 440, 0];
const BASS = [110, 110, 165, 165, 147, 147, 131, 165];

export const music = {
  start(tempo = 1) {
    this.stop();
    if (!ensureContext()) return;
    const stepMs = 150 / tempo;
    musicTimer = setInterval(() => {
      if (muted) return;
      const note = MELODY[musicStep % MELODY.length];
      if (note) tone({ freq: note, time: 0.12, type: 'triangle', volume: 0.05 });
      if (musicStep % 2 === 0) tone({ freq: BASS[(musicStep / 2) % BASS.length], time: 0.22, type: 'sine', volume: 0.09 });
      if (musicStep % 4 === 2) noise({ time: 0.05, volume: 0.05, filter: 5000 });
      musicStep++;
    }, stepMs);
  },
  stop() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  },
};

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export const isMuted = () => muted;
