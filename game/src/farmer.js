// Farmer Hollis Crumb, who wants Pip on the table by four o'clock. He runs after the turkey,
// throws carving knives, raises his lantern to search, surges when he spots Pip and gives up
// for a moment when Pip vanishes into a haystack. The gap between them is the chase.

import { RUN } from './config.js';

export function createFarmer(rng, stage) {
  return {
    gap: RUN.startGap,
    mood: 'chase', // chase | surge | search | grab
    moodTime: 0,
    throwTimer: rng.range(3, 5),
    lantern: { state: 'idle', time: 0, next: rng.range(...stage.lanternEvery) },
    stride: 0,
    shout: null,
    shoutTime: 0,
  };
}

const SHOUTS = {
  start: ['Get back here, gobbler!', 'Dinner\'s at four, bird!'],
  surge: ['THERE you are!', 'I see those tail feathers!'],
  search: ['Where\'d that bird go?', 'Here, turkey turkey...'],
  hit: ['Ha! Slowin\' down?', 'Almost got ya!'],
  stage: ['You can\'t hide in my barn!', 'Not my kitchen, you don\'t!'],
};

export function farmerShout(farmer, kind, rng) {
  const lines = SHOUTS[kind];
  farmer.shout = lines[rng.int(0, lines.length - 1)];
  farmer.shoutTime = 2.2;
}

export function farmerSpeedFactor(farmer, stage) {
  const base = stage.farmerFactor;
  if (farmer.mood === 'surge') return base * 1.16;
  if (farmer.mood === 'search') return base * 0.55;
  return base;
}

// Advances the farmer by one frame. `turkeySpeed` is how fast Pip actually moved this frame.
// Returns events: 'throw', 'lanternWarn', 'spotted', 'lostTrack'.
export function updateFarmer(farmer, { stage, turkey, turkeySpeed, dt, rng }) {
  const events = [];
  farmer.moodTime = Math.max(0, farmer.moodTime - dt);
  farmer.shoutTime = Math.max(0, farmer.shoutTime - dt);
  if (farmer.moodTime === 0 && (farmer.mood === 'surge' || farmer.mood === 'search')) farmer.mood = 'chase';

  // While Pip hides, the farmer slows and squints around.
  let factor = farmerSpeedFactor(farmer, stage);
  if (turkey.hidden && farmer.mood !== 'surge') factor *= 0.4;
  const farmerSpeed = stage.speed * factor;
  farmer.gap = Math.min(RUN.maxGap, farmer.gap + (turkeySpeed - farmerSpeed) * dt);
  farmer.stride += farmerSpeed * dt * 0.03;

  // Knife throwing: only while chasing, and less often when far behind.
  farmer.throwTimer -= dt;
  if (farmer.throwTimer <= 0) {
    farmer.throwTimer = rng.range(2.6, 4.2) * (stage.id === 'farmyard' ? 1.4 : 1);
    if (farmer.mood !== 'search' && !turkey.hidden && farmer.gap < 480) events.push('throw');
  }

  // The lantern: a warning glint, then a sweep. Whatever the beam finds decides his mood.
  const lantern = farmer.lantern;
  lantern.time += dt;
  if (lantern.state === 'idle' && lantern.time >= lantern.next) {
    lantern.state = 'warn';
    lantern.time = 0;
    events.push('lanternWarn');
  } else if (lantern.state === 'warn' && lantern.time >= 1.6) {
    lantern.state = 'sweep';
    lantern.time = 0;
  } else if (lantern.state === 'sweep') {
    if (lantern.time >= 0.45 && !lantern.judged) {
      lantern.judged = true;
      if (turkey.hidden) {
        farmer.mood = 'search';
        farmer.moodTime = 2.2;
        events.push('lostTrack');
      } else {
        farmer.mood = 'surge';
        farmer.moodTime = 2.6;
        events.push('spotted');
      }
    }
    if (lantern.time >= 1.1) {
      lantern.state = 'idle';
      lantern.time = 0;
      lantern.judged = false;
      lantern.next = rng.range(...stage.lanternEvery);
    }
  }
  return events;
}

// How far the lantern beam has swept, 0..1, for drawing.
export function lanternSweep(farmer) {
  const l = farmer.lantern;
  if (l.state !== 'sweep') return 0;
  return Math.min(1, l.time / 0.45);
}
