// Staged scenes for the screenshots: ?shot=title|kitchen|barn|caught|escaped&seed=N builds a
// real run state with the game's own objects, then draws one frame with the game's own
// renderer, so a screenshot shows exactly what the game draws.

import { GROUND_Y, PX_PER_METRE, STAGES } from './config.js';
import { createRun } from './world.js';
import { createObstacle } from './obstacles.js';
import { drawRunFrame } from './render/frame.js';
import { drawTitle, drawEnd } from './render/screens.js';

function runAt(seed, metres, stageIndex) {
  const run = createRun(seed);
  run.worldX = metres * PX_PER_METRE;
  run.stageIndex = stageIndex;
  run.speed = STAGES[stageIndex].speed;
  run.banner = null;
  run.obstacles = [];
  run.corn = [];
  return run;
}

function place(run, type, offset, setup = {}) {
  const o = createObstacle(type, run.worldX + offset, run.rng);
  Object.assign(o, setup);
  run.obstacles.push(o);
  return o;
}

function kitchenChase(seed) {
  const run = runAt(seed, 1712, 2);
  run.lives = 2;
  run.bonus = 865;
  run.stats = { corn: 21, nearMisses: 9, hides: 2, hits: 1, spotted: 1 };
  run.turkey.y = GROUND_Y - 120;
  run.turkey.onGround = false;
  run.turkey.vy = -120;
  run.turkey.runCycle = 2;
  run.turkey.dashCooldown = 1.2;
  run.farmer.gap = 205;
  run.farmer.mood = 'surge';
  run.farmer.stride = 1.2;
  run.farmer.shout = 'I see those tail feathers!';
  run.farmer.shoutTime = 2;
  place(run, 'oven', 150, { t: 0.3 });
  place(run, 'chopKnife', 430, { t: 1.45 });
  place(run, 'pot', 560);
  place(run, 'thrownKnife', -150, { phase: 'fly', high: true, t: 1.2 });
  for (let i = 0; i < 4; i++) run.corn.push({ x: run.worldX + 40 + i * 40, y: GROUND_Y - 170 - Math.sin((i / 3) * Math.PI) * 30, taken: false });
  run.popups.push({ text: 'Close shave! +15', x: 360, y: GROUND_Y - 220, life: 1, color: '#a8f0ff' });
  run.particles.push(...Array.from({ length: 8 }, (_, i) => ({ kind: 'spark', x: 330 + i * 9, y: GROUND_Y - 120 - i * 14, vx: 0, vy: 0, rot: i, spin: 0, life: 1 })));
  return run;
}

function barnHide(seed) {
  const run = runAt(seed, 1046, 1);
  run.lives = 3;
  run.bonus = 410;
  run.stats = { corn: 14, nearMisses: 6, hides: 1, hits: 0, spotted: 0 };
  place(run, 'haystack', -75);
  run.turkey.hidden = true;
  run.turkey.hideTime = 0.5;
  run.farmer.gap = 270;
  run.farmer.mood = 'chase';
  run.farmer.stride = 0.4;
  run.farmer.lantern = { state: 'sweep', time: 0.34, next: 9, judged: false };
  run.farmer.shout = 'Here, turkey turkey...';
  run.farmer.shoutTime = 2;
  place(run, 'swingKnife', 260, { t: 0, phase: 0.2, speed: 2.2 });
  place(run, 'hay', 480);
  place(run, 'swingKnife', 560, { t: 0, phase: 1.9, speed: 2.2 });
  for (let i = 0; i < 4; i++) run.corn.push({ x: run.worldX + 380 + i * 40, y: GROUND_Y - 26, taken: false });
  run.popups.push({ text: 'Lantern! Hide in the hay!', x: 520, y: 150, life: 1, color: '#ffe9a0' });
  return run;
}

export function stageShot(ctx, name, seed) {
  const t = 0.62;
  if (name === 'title' || name === 'start') {
    drawTitle(ctx, t, 3870, null, false);
  } else if (name === 'kitchen' || name === 'play') {
    drawRunFrame(ctx, kitchenChase(seed), t, 3870);
  } else if (name === 'barn') {
    drawRunFrame(ctx, barnHide(seed), t, 3870);
  } else if (name === 'caught' || name === 'end') {
    const stats = { corn: 27, nearMisses: 11, hides: 3, hits: 3, spotted: 2 };
    drawEnd(ctx, { result: 'caught', score: 2264, metres: 1694, time: 2 }, stats, 3870, t, null, false);
  } else if (name === 'escaped') {
    const stats = { corn: 41, nearMisses: 17, hides: 4, hits: 1, spotted: 1 };
    drawEnd(ctx, { result: 'escaped', score: 4612, metres: 2200, time: 2 }, stats, 4612, t, null, true);
  }
}
