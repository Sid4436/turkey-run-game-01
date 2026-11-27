// The dangers of the escape, one entry per kind: how big it is, how it moves, and where it
// can hurt the turkey this frame. Positions are in world pixels (x grows with the run), the
// screen position is x - worldX + TURKEY_X.

import { GROUND_Y } from './config.js';

const groundBox = (o) => ({ x: o.x, y: GROUND_Y - o.h, w: o.w, h: o.h });

export const OBSTACLE_KINDS = {
  hay: {
    w: 62, h: 46, minGap: 230,
    hitbox: groundBox,
  },
  fence: {
    w: 28, h: 76, minGap: 260,
    hitbox: (o) => ({ x: o.x + 4, y: GROUND_Y - o.h, w: o.w - 8, h: o.h }),
  },
  pumpkins: {
    w: 96, h: 34, minGap: 250,
    hitbox: (o) => ({ x: o.x + 6, y: GROUND_Y - o.h + 4, w: o.w - 12, h: o.h - 4 }),
  },
  pot: {
    w: 72, h: 52, minGap: 250,
    hitbox: (o) => ({ x: o.x + 4, y: GROUND_Y - o.h, w: o.w - 8, h: o.h }),
  },
  // Mud never hurts, it only slows the turkey (and makes it a sitting duck).
  mud: {
    w: 150, h: 10, minGap: 210, harmless: true,
    hitbox: () => null,
  },
  // A haystack is a hiding place, never a danger.
  haystack: {
    w: 150, h: 108, minGap: 280, harmless: true,
    hitbox: () => null,
  },
  // Hangs from a rafter and swings; its tip passes over a ducking turkey.
  swingKnife: {
    w: 60, h: 0, minGap: 330, pivotY: 92, length: 300,
    init: (o, rng) => { o.phase = rng.range(0, Math.PI * 2); o.speed = rng.range(2.0, 2.6); },
    update: (o, dt) => { o.t += dt; },
    angle: (o) => Math.sin(o.t * o.speed + o.phase) * 1.05,
    tip(o) {
      const a = this.angle(o);
      return { x: o.x + o.w / 2 + Math.sin(a) * this.length, y: this.pivotY + Math.cos(a) * this.length };
    },
    hitbox(o) {
      const tip = this.tip(o);
      return { x: tip.x - 22, y: tip.y - 16, w: 44, h: 24 };
    },
  },
  // A roaring oven: jump over it, but not while flames lick out of its burners.
  oven: {
    w: 108, h: 92, minGap: 330, cycle: 2.3, flameOn: 0.85, warn: 0.55,
    init: (o, rng) => { o.t = rng.range(0, 2.3); },
    update: (o, dt) => { o.t += dt; },
    flameState(o) {
      const c = o.t % this.cycle;
      if (c < this.flameOn) return 'roar';
      if (c > this.cycle - this.warn) return 'warn';
      return 'calm';
    },
    hitboxes(o) {
      const body = { x: o.x + 4, y: GROUND_Y - o.h, w: o.w - 8, h: o.h };
      if (this.flameState(o) !== 'roar') return [body];
      return [body, { x: o.x + 14, y: GROUND_Y - o.h - 150, w: o.w - 28, h: 150 }];
    },
  },
  // A giant carving knife that chops down from the ceiling on a rhythm; its shadow warns.
  chopKnife: {
    w: 34, h: 0, minGap: 300, cycle: 1.7, warn: 0.45, down: 0.4,
    init: (o, rng) => { o.t = rng.range(0, 1.7); },
    update: (o, dt) => { o.t += dt; },
    // 0 is fully raised, 1 is buried in the chopping board.
    drop(o) {
      const c = o.t % this.cycle;
      const fall = this.cycle - this.down;
      if (c >= fall) return 1;
      if (c >= fall - 0.1) return (c - (fall - 0.1)) / 0.1;
      if (c < 0.35) return 1 - c / 0.35;
      return 0;
    },
    warning(o) {
      const c = o.t % this.cycle;
      const fall = this.cycle - this.down - 0.1;
      return c > fall - this.warn && c < fall;
    },
    hitbox(o) {
      if (this.drop(o) < 0.7) return null;
      return { x: o.x, y: 0, w: o.w, h: GROUND_Y };
    },
  },
  // Thrown by the farmer from behind: winds up, then flies at head or ankle height.
  thrownKnife: {
    w: 56, h: 14, minGap: 0, windup: 0.95, airSpeed: 820, fromFarmer: true,
    init: (o, rng) => { o.high = rng.chance(0.5); o.phase = 'windup'; o.t = 0; },
    hitbox(o) {
      if (o.phase !== 'fly') return null;
      const y = o.high ? GROUND_Y - 58 : GROUND_Y - 22;
      return { x: o.x, y, w: o.w, h: o.h };
    },
  },
};

export function createObstacle(type, x, rng) {
  const kind = OBSTACLE_KINDS[type];
  const o = { type, x, w: kind.w, h: kind.h, t: 0, hit: false, passed: false, closest: Infinity };
  if (kind.init) kind.init(o, rng);
  return o;
}

export function obstacleHitboxes(o) {
  const kind = OBSTACLE_KINDS[o.type];
  if (kind.hitboxes) return kind.hitboxes(o);
  const box = kind.hitbox(o);
  return box ? [box] : [];
}

export function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// The vertical clearance between two boxes that overlap in x, used to reward close shaves.
export function verticalClearance(a, b) {
  if (a.y + a.h <= b.y) return b.y - (a.y + a.h);
  if (b.y + b.h <= a.y) return a.y - (b.y + b.h);
  return 0;
}
