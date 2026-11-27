// One run of Gobble Getaway: the stages, what spawns, what hits the turkey, the score and how
// the run ends. It owns the turkey, the farmer, the obstacles and the corn, and it turns their
// events into feedback (popups, particles, banners) and sounds for main.js to play.

import { ESCAPE_METRES, GROUND_Y, PX_PER_METRE, RUN, SCORE, STAGES, TURKEY_X, VIEW } from './config.js';
import { createRandom } from './random.js';
import { createTurkey, hideTurkey, stumbleTurkey, turkeyBox, updateTurkey } from './turkey.js';
import { createFarmer, farmerShout, updateFarmer } from './farmer.js';
import { OBSTACLE_KINDS, boxesOverlap, createObstacle, obstacleHitboxes, verticalClearance } from './obstacles.js';

const LANDMARKS = ['barnDoor', 'kitchenDoor', 'backDoor'];

export function createRun(seed = Date.now() % 100000) {
  const rng = createRandom(seed);
  const run = {
    seed,
    rng,
    time: 0,
    worldX: 0,
    speed: STAGES[0].speed,
    stageIndex: 0,
    turkey: createTurkey(),
    farmer: createFarmer(rng, STAGES[0]),
    lives: RUN.lives,
    obstacles: [],
    corn: [],
    nextSpawnX: VIEW.width + 200,
    landmarks: STAGES.map((s, i) => ({ x: s.end * PX_PER_METRE, kind: LANDMARKS[i] })),
    stats: { corn: 0, nearMisses: 0, hides: 0, hits: 0, spotted: 0 },
    bonus: 0,
    particles: [],
    popups: [],
    banner: { title: STAGES[0].name, sub: 'Run, Pip, run!', time: 2.4 },
    flash: null,
    shake: 0,
    sounds: [],
    catching: false,
    over: null,
    paused: false,
  };
  farmerShout(run.farmer, 'start', rng);
  return run;
}

export const runMetres = (run) => run.worldX / PX_PER_METRE;
export const currentStage = (run) => STAGES[run.stageIndex];
export const runScore = (run) => Math.floor(runMetres(run) * SCORE.perMetre) + run.bonus;
export const toScreenX = (run, worldX) => worldX - run.worldX + TURKEY_X;

function popup(run, text, x, y, color = '#fff3c4') {
  run.popups.push({ text, x, y, life: 1.1, color });
}

function burst(run, kind, x, y, count, spread = 200) {
  for (let i = 0; i < count; i++) {
    run.particles.push({
      kind,
      x, y,
      vx: run.rng.range(-spread, spread),
      vy: run.rng.range(-spread * 1.4, -spread * 0.2),
      rot: run.rng.range(0, Math.PI * 2),
      spin: run.rng.range(-8, 8),
      life: run.rng.range(0.6, 1.2),
    });
  }
}

// --- spawning -----------------------------------------------------------------------------

function spawnCornLine(run, x, overObstacle, kind) {
  const count = run.rng.int(3, 5);
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const lift = overObstacle ? Math.sin(t * Math.PI) * (kind.h + 70) + 26 : 26;
    run.corn.push({ x: x + i * 40, y: GROUND_Y - lift, taken: false, bob: run.rng.range(0, 6) });
  }
}

function spawnNext(run) {
  const stage = currentStage(run);
  const weights = { ...stage.obstacles };
  delete weights.thrownKnife;
  const type = run.rng.pickWeighted(weights);
  const kind = OBSTACLE_KINDS[type];
  const x = run.nextSpawnX;
  run.obstacles.push(createObstacle(type, x, run.rng));
  if (type !== 'haystack' && run.rng.chance(0.55)) {
    const over = type !== 'chopKnife' && type !== 'swingKnife' && run.rng.chance(0.6);
    spawnCornLine(run, over ? x + kind.w / 2 - 80 : x + kind.w + 60, over, kind);
  }
  const gap = Math.max(kind.minGap, run.speed * run.rng.range(...stage.spawnEvery));
  run.nextSpawnX = x + kind.w + gap;
}

// When the lantern is about to sweep, make sure a haystack is in reach so hiding is a choice.
function offerHaystack(run) {
  const from = run.worldX + 380;
  const to = run.worldX + 760;
  const already = run.obstacles.some((o) => o.type === 'haystack' && o.x > run.worldX - 40 && o.x < to);
  if (already) return;
  const x = from + run.rng.range(0, 120);
  run.obstacles = run.obstacles.filter((o) => o.x + o.w < x - 120 || o.x > x + 270 || o.type === 'thrownKnife');
  run.corn = run.corn.filter((c) => c.x < x - 60 || c.x > x + 210);
  run.obstacles.push(createObstacle('haystack', x, run.rng));
  run.nextSpawnX = Math.max(run.nextSpawnX, x + 420);
}

function throwKnife(run) {
  const knife = createObstacle('thrownKnife', run.worldX - run.farmer.gap + 20, run.rng);
  run.obstacles.push(knife);
}

// --- one frame ------------------------------------------------------------------------------

export function updateRun(run, intent, dt) {
  run.sounds = [];
  if (run.paused || run.over) {
    tickEffects(run, dt);
    return;
  }
  run.time += dt;
  const stage = currentStage(run);
  const turkey = run.turkey;

  const stageStart = run.stageIndex === 0 ? 0 : STAGES[run.stageIndex - 1].end;
  const stageProgress = (runMetres(run) - stageStart) / (stage.end - stageStart);
  run.speed = stage.speed * (1 + 0.1 * Math.max(0, stageProgress));

  // Player intent: the catch sequence takes the controls away.
  const control = run.catching ? {} : intent;
  if ((control.hide || control.duckPressed) && !turkey.hidden) {
    const tx = run.worldX;
    const stack = run.obstacles.find((o) => o.type === 'haystack' && tx > o.x + 10 && tx < o.x + o.w - 10);
    if (stack && hideTurkey(turkey)) {
      run.stats.hides++;
      run.sounds.push('hide');
      burst(run, 'straw', TURKEY_X, GROUND_Y - 60, 10, 140);
    }
  }
  for (const e of updateTurkey(turkey, control, dt)) {
    run.sounds.push(e);
    if (e === 'land') burst(run, 'dust', TURKEY_X, GROUND_Y, 5, 60);
    if (e === 'flap') burst(run, 'feather', TURKEY_X - 10, turkey.y - 40, 3, 90);
    if (e === 'dash') popup(run, 'DASH!', TURKEY_X, turkey.y - 90, '#ffd36b');
  }

  // How fast the turkey really runs this frame.
  const inMud = turkey.onGround && run.obstacles.some((o) => o.type === 'mud' && run.worldX > o.x && run.worldX < o.x + o.w);
  let speed = run.speed;
  if (turkey.hidden || run.catching) speed = 0;
  if (turkey.stumbleTime > 0) speed *= RUN.stumbleFactor;
  if (inMud) speed *= RUN.mudFactor;
  if (turkey.dashTime > 0) speed *= RUN.dashFactor;
  if (inMud && run.rng.chance(dt * 12)) burst(run, 'mud', TURKEY_X - 10, GROUND_Y - 4, 2, 80);
  run.worldX += speed * dt;

  // The farmer.
  if (run.catching) {
    run.farmer.gap -= 620 * dt;
    run.farmer.mood = 'grab';
  } else {
    for (const e of updateFarmer(run.farmer, { stage, turkey, turkeySpeed: speed, dt, rng: run.rng })) {
      if (e === 'throw') { throwKnife(run); run.sounds.push('knifeWhoosh'); }
      if (e === 'lanternWarn') { offerHaystack(run); popup(run, 'Lantern! Hide in the hay!', TURKEY_X + 120, 150, '#ffe9a0'); }
      if (e === 'spotted') {
        run.stats.spotted++;
        run.sounds.push('spotted');
        run.flash = { color: 'rgba(255,60,30,', time: 0.5 };
        farmerShout(run.farmer, 'surge', run.rng);
        popup(run, 'SPOTTED!', TURKEY_X, turkey.y - 100, '#ff6a4a');
      }
      if (e === 'lostTrack') {
        run.bonus += SCORE.hideFromLantern;
        run.sounds.push('lostTrack');
        farmerShout(run.farmer, 'search', run.rng);
        popup(run, `Unseen! +${SCORE.hideFromLantern}`, TURKEY_X, GROUND_Y - 140, '#bfffa8');
      }
    }
  }
  if (run.farmer.gap <= 0) {
    endRun(run, 'caught');
    return;
  }

  // Spawning ahead, unless the back door is near.
  const lastSpawnX = (ESCAPE_METRES - 45) * PX_PER_METRE;
  while (run.nextSpawnX < run.worldX + VIEW.width + 100 && run.nextSpawnX < lastSpawnX) spawnNext(run);

  updateObstacles(run, dt);
  collectCorn(run);
  advanceStage(run);
  tickEffects(run, dt);
}

function updateObstacles(run, dt) {
  const turkey = run.turkey;
  const tb = turkeyBox(turkey);
  const box = { ...tb, x: tb.x - TURKEY_X + run.worldX };
  for (const o of run.obstacles) {
    const kind = OBSTACLE_KINDS[o.type];
    if (kind.update) kind.update(o, dt);
    if (o.type === 'thrownKnife') {
      o.t += dt;
      if (o.phase === 'windup') {
        o.x = run.worldX - run.farmer.gap + 20;
        if (o.t >= kind.windup) { o.phase = 'fly'; run.sounds.push('knifeWhoosh'); }
      } else {
        o.x += kind.airSpeed * dt;
      }
    }
    if (o.type === 'oven' && kind.flameState(o) === 'roar' && Math.abs(toScreenX(run, o.x) - TURKEY_X) < 500 && run.rng.chance(dt * 20)) {
      burst(run, 'spark', toScreenX(run, o.x + o.w / 2), GROUND_Y - o.h - 10, 1, 60);
    }
    if (o.type === 'chopKnife' && kind.drop(o) === 1 && !o.chopped) {
      o.chopped = true;
      if (Math.abs(toScreenX(run, o.x) - TURKEY_X) < 420) run.sounds.push('chop');
    } else if (kind.drop && kind.drop(o) < 1) o.chopped = false;

    if (kind.harmless || turkey.hidden) continue;
    for (const hb of obstacleHitboxes(o)) {
      const xOverlap = box.x < hb.x + hb.w && box.x + box.w > hb.x;
      if (!xOverlap) continue;
      if (boxesOverlap(box, hb)) {
        if (turkey.invulnTime <= 0 && !run.catching) hitTurkey(run, o);
      } else {
        o.closest = Math.min(o.closest, verticalClearance(box, hb));
      }
    }
    if (!o.passed && o.x + o.w < box.x && o.type !== 'thrownKnife') {
      o.passed = true;
      if (!o.hit && o.closest < RUN.nearMissPixels) {
        run.stats.nearMisses++;
        run.bonus += SCORE.nearMiss;
        run.sounds.push('nearMiss');
        popup(run, `Close shave! +${SCORE.nearMiss}`, TURKEY_X + 30, turkey.y - 80, '#a8f0ff');
      }
    }
    if (o.type === 'thrownKnife' && !o.passed && o.phase === 'fly' && o.x > box.x + box.w) {
      o.passed = true;
      if (!o.hit) {
        run.stats.nearMisses++;
        run.bonus += SCORE.nearMiss;
        popup(run, `Dodged! +${SCORE.nearMiss}`, TURKEY_X + 30, turkey.y - 80, '#a8f0ff');
      }
    }
  }
  run.obstacles = run.obstacles.filter((o) => o.x + o.w > run.worldX - TURKEY_X - 200 || (o.type === 'thrownKnife' && o.phase === 'windup'));
  run.obstacles = run.obstacles.filter((o) => o.type !== 'thrownKnife' || o.x < run.worldX + VIEW.width);
}

function hitTurkey(run, o) {
  o.hit = true;
  run.lives--;
  run.stats.hits++;
  stumbleTurkey(run.turkey);
  run.sounds.push('hit');
  run.shake = 0.35;
  run.flash = { color: 'rgba(255,255,255,', time: 0.25 };
  burst(run, 'feather', TURKEY_X, run.turkey.y - 36, 14, 220);
  const what = { oven: 'Singed!', chopKnife: 'Nicked!', swingKnife: 'Nicked!', thrownKnife: 'Ouch!', mud: '', pot: 'Hot pot!' }[o.type] || 'Bonk!';
  popup(run, `${what} -1 feather`, TURKEY_X, run.turkey.y - 100, '#ffb0a0');
  farmerShout(run.farmer, 'hit', run.rng);
  if (run.lives <= 0) {
    run.catching = true;
    run.turkey.hidden = false;
  }
}

function collectCorn(run) {
  const turkey = run.turkey;
  if (turkey.hidden) return;
  const tb = turkeyBox(turkey);
  for (const c of run.corn) {
    if (c.taken) continue;
    const sx = toScreenX(run, c.x);
    if (sx > tb.x - 14 && sx < tb.x + tb.w + 14 && c.y > tb.y - 18 && c.y < tb.y + tb.h + 14) {
      c.taken = true;
      run.stats.corn++;
      run.bonus += SCORE.corn;
      turkey.dashCooldown = Math.max(0, turkey.dashCooldown - 0.6);
      run.sounds.push('corn');
      burst(run, 'sparkle', sx, c.y, 5, 90);
    }
  }
  run.corn = run.corn.filter((c) => !c.taken && c.x > run.worldX - TURKEY_X - 40);
}

function advanceStage(run) {
  const metres = runMetres(run);
  const stage = currentStage(run);
  if (metres < stage.end) return;
  if (run.stageIndex === STAGES.length - 1) {
    endRun(run, 'escaped');
    return;
  }
  run.stageIndex++;
  const next = currentStage(run);
  run.banner = { title: next.name, sub: run.stageIndex === 1 ? 'Hide in the hay when the lantern swings!' : 'Mind the ovens and the carving knife!', time: 2.6 };
  run.sounds.push('stageClear');
  run.farmer.lantern.next = run.rng.range(...next.lanternEvery);
  farmerShout(run.farmer, 'stage', run.rng);
}

function endRun(run, result) {
  if (result === 'escaped') {
    run.bonus += SCORE.escapeBonus + run.lives * SCORE.perLifeLeft;
    run.sounds.push('escaped');
  } else {
    run.sounds.push('caught');
  }
  run.over = { result, score: runScore(run), metres: Math.floor(runMetres(run)), time: 0 };
}

function tickEffects(run, dt) {
  if (run.over) run.over.time += dt;
  run.shake = Math.max(0, run.shake - dt);
  if (run.banner) {
    run.banner.time -= dt;
    if (run.banner.time <= 0) run.banner = null;
  }
  if (run.flash) {
    run.flash.time -= dt;
    if (run.flash.time <= 0) run.flash = null;
  }
  for (const p of run.particles) {
    p.life -= dt;
    p.vy += (p.kind === 'feather' ? 260 : 700) * dt;
    if (p.kind === 'feather') p.vx *= 0.96;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
  }
  run.particles = run.particles.filter((p) => p.life > 0);
  for (const t of run.popups) {
    t.life -= dt;
    t.y -= 40 * dt;
  }
  run.popups = run.popups.filter((t) => t.life > 0);
}
