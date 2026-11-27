// Gobble Getaway: the game loop and the screens it moves between (title, play, end).
// It reads input, steps the run at a steady rate, plays the sounds the run asks for and
// draws the current screen. ?shot=... freezes a staged scene for screenshots (shots.js).

import { VIEW } from './config.js';
import { createInput } from './input.js';
import { createRun, updateRun } from './world.js';
import { sfx, music, toggleMute, isMuted } from './audio.js';
import { drawRunFrame } from './render/frame.js';
import { drawTitle, drawPause, drawEnd, hitButton } from './render/screens.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const params = new URLSearchParams(location.search);

const BEST_KEY = 'gobble-getaway-best';
const loadBest = () => {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
};
const saveBest = (score) => {
  try { localStorage.setItem(BEST_KEY, String(score)); } catch { /* private mode: keep it in memory */ }
};

const game = {
  screen: 'title',
  run: null,
  best: loadBest(),
  newBest: false,
  buttons: [],
  clock: 0,
};

function startRun() {
  sfx.unlock();
  sfx.click();
  const seed = params.has('seed') ? Number(params.get('seed')) : Math.floor(Math.random() * 1e6);
  game.run = createRun(seed);
  game.screen = 'play';
  game.newBest = false;
  music.start(1);
}

function finishRun() {
  const { over } = game.run;
  music.stop();
  if (over.score > game.best) {
    game.best = over.score;
    game.newBest = true;
    saveBest(over.score);
  }
  game.screen = 'end';
}

function playSounds(sounds) {
  for (const name of sounds) if (sfx[name]) sfx[name]();
}

function readIntent() {
  return {
    jump: input.took('jump'),
    duck: input.isHeld('duck'),
    duckPressed: input.took('duck'),
    dash: input.took('dash'),
    hide: input.took('hide'),
  };
}

function update(dt) {
  game.clock += dt;
  if (input.took('mute')) toggleMute();
  const click = input.consumeClick();

  if (game.screen === 'title') {
    const button = hitButton(click, game.buttons);
    if (button && button.label.startsWith('Sound')) {
      sfx.unlock();
      toggleMute();
      input.took('start');
    } else if (input.took('start')) {
      startRun();
    }
  } else if (game.screen === 'play') {
    const run = game.run;
    if (input.took('pause')) {
      run.paused = !run.paused;
      if (run.paused) music.stop(); else music.start(1 + run.stageIndex * 0.12);
    }
    const stageBefore = run.stageIndex;
    updateRun(run, readIntent(), dt);
    playSounds(run.sounds);
    if (run.stageIndex !== stageBefore) music.start(1 + run.stageIndex * 0.12);
    // Let the last moment breathe before the end screen.
    if (run.over && run.over.time > 1.1) finishRun();
  } else if (game.screen === 'end') {
    const over = game.run.over;
    over.time += dt;
    const button = hitButton(click, game.buttons);
    if (button && button.label === 'Title') {
      sfx.click();
      game.screen = 'title';
    } else if (over.time > 0.8 && (input.took('start') || (button && button.label === 'RUN AGAIN'))) {
      startRun();
    }
  }
  input.endFrame();
}

function draw() {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  const pointer = input.pointer();
  if (game.screen === 'title') {
    game.buttons = drawTitle(ctx, game.clock, game.best, pointer, isMuted());
  } else if (game.screen === 'play') {
    drawRunFrame(ctx, game.run, game.clock, game.best);
    if (game.run.paused) drawPause(ctx);
  } else {
    const run = game.run;
    game.buttons = drawEnd(ctx, run.over, run.stats, game.best, game.clock, pointer, game.newBest);
  }
}

// A fixed 120 Hz simulation step keeps jumps identical on any monitor.
const STEP = 1 / 120;
let last = performance.now();
let acc = 0;
function frame(now) {
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  while (acc >= STEP) {
    update(STEP);
    acc -= STEP;
  }
  draw();
  requestAnimationFrame(frame);
}

if (params.has('shot')) {
  document.body.classList.add('shot');
  stageShot(ctx, params.get('shot'), Number(params.get('seed') || 1));
  document.body.dataset.ready = '1';
} else {
  requestAnimationFrame(frame);
}
