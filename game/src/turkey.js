// Pip the turkey: running, jumping, one mid-air flap, ducking, dashing and hiding in haystacks.
// Pure state and physics, no drawing; the world calls updateTurkey once per frame.

import { GROUND_Y, PHYSICS, RUN, TURKEY_X } from './config.js';

export function createTurkey() {
  return {
    y: GROUND_Y, // feet position (screen y); GROUND_Y when standing on the ground
    vy: 0,
    onGround: true,
    flapsLeft: PHYSICS.maxFlaps,
    ducking: false,
    dashTime: 0,
    dashCooldown: 0,
    stumbleTime: 0,
    invulnTime: 0,
    hidden: false,
    hideTime: 0,
    runCycle: 0,
    landedTime: 0,
  };
}

export function turkeyHeight(turkey) {
  return turkey.ducking && turkey.onGround ? PHYSICS.duckHeight : PHYSICS.standHeight;
}

// The turkey's hit box in screen space, a little smaller than the drawing so that close
// calls feel fair.
export function turkeyBox(turkey) {
  const h = turkeyHeight(turkey);
  const w = PHYSICS.bodyWidth;
  return { x: TURKEY_X - w / 2, y: turkey.y - h, w, h };
}

// Handles one frame of player intent and physics. Returns the list of sound/feedback events
// it caused, such as 'jump' or 'flap', for the world to pass on.
export function updateTurkey(turkey, intent, dt) {
  const events = [];
  turkey.dashTime = Math.max(0, turkey.dashTime - dt);
  turkey.dashCooldown = Math.max(0, turkey.dashCooldown - dt);
  turkey.stumbleTime = Math.max(0, turkey.stumbleTime - dt);
  turkey.invulnTime = Math.max(0, turkey.invulnTime - dt);
  turkey.landedTime = Math.max(0, turkey.landedTime - dt);

  if (turkey.hidden) {
    turkey.hideTime += dt;
    // Leaving the haystack: jump, dash or press hide again, or the hay gets too itchy.
    if (intent.jump || intent.dash || intent.hide || turkey.hideTime > 2.6) {
      turkey.hidden = false;
      events.push('unhide');
    } else {
      return events;
    }
  }

  if (intent.jump) {
    if (turkey.onGround) {
      turkey.vy = PHYSICS.jumpVelocity;
      turkey.onGround = false;
      turkey.flapsLeft = PHYSICS.maxFlaps;
      events.push('jump');
    } else if (turkey.flapsLeft > 0) {
      turkey.vy = PHYSICS.flapVelocity;
      turkey.flapsLeft--;
      events.push('flap');
    }
  }

  if (intent.dash && turkey.dashCooldown <= 0 && turkey.stumbleTime <= 0) {
    turkey.dashTime = RUN.dashSeconds;
    turkey.dashCooldown = RUN.dashCooldown;
    events.push('dash');
  }

  const wasDucking = turkey.ducking;
  turkey.ducking = intent.duck;
  if (turkey.ducking && !wasDucking && turkey.onGround) events.push('duck');
  // Ducking in the air is a fast-fall, useful to land before a swinging blade.
  const gravity = PHYSICS.gravity * (turkey.ducking && !turkey.onGround ? 2.2 : 1);

  if (!turkey.onGround) {
    turkey.vy += gravity * dt;
    turkey.y += turkey.vy * dt;
    if (turkey.y >= GROUND_Y) {
      turkey.y = GROUND_Y;
      turkey.vy = 0;
      turkey.onGround = true;
      turkey.landedTime = 0.15;
      events.push('land');
    }
  }

  turkey.runCycle += dt * (turkey.dashTime > 0 ? 18 : 12);
  return events;
}

export function hideTurkey(turkey) {
  if (turkey.hidden || !turkey.onGround) return false;
  turkey.hidden = true;
  turkey.hideTime = 0;
  turkey.ducking = false;
  return true;
}

export function stumbleTurkey(turkey) {
  turkey.stumbleTime = RUN.stumbleSeconds;
  turkey.invulnTime = RUN.invulnSeconds;
  turkey.dashTime = 0;
}
