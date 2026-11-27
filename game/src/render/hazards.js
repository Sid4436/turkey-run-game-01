// Drawing the dangers, the hiding places and the corn. Each draw function takes the obstacle
// and its screen x; the shapes follow the hit boxes in obstacles.js so what you see is what
// hurts.

import { GROUND_Y } from '../config.js';
import { OBSTACLE_KINDS } from '../obstacles.js';
import { drawBale } from './scenery.js';
import { drawCarvingKnife } from './characters.js';

function drawHay(ctx, o, x) {
  drawBale(ctx, x, GROUND_Y - o.h, o.w, o.h, '#e0b04a');
}

function drawFence(ctx, o, x) {
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(x + 4, GROUND_Y - o.h, o.w - 8, o.h);
  ctx.fillStyle = '#9b6234';
  ctx.beginPath();
  ctx.moveTo(x + 4, GROUND_Y - o.h);
  ctx.lineTo(x + o.w / 2, GROUND_Y - o.h - 12);
  ctx.lineTo(x + o.w - 4, GROUND_Y - o.h);
  ctx.fill();
  ctx.fillStyle = '#5b3418';
  ctx.fillRect(x - 10, GROUND_Y - o.h + 18, o.w + 20, 7);
  ctx.fillRect(x - 10, GROUND_Y - o.h + 46, o.w + 20, 7);
}

function drawPumpkins(ctx, o, x) {
  const sizes = [[22, 18, '#e8771f'], [52, 22, '#d9661a'], [80, 16, '#f2a03a']];
  for (const [cx, r, color] of sizes) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + cx, GROUND_Y - r, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 50, 10, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + cx, GROUND_Y - r, r * 0.45, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#5a6b23';
    ctx.fillRect(x + cx - 2, GROUND_Y - r * 2 - 6, 5, 8);
  }
}

function drawMud(ctx, o, x, t) {
  ctx.fillStyle = '#5a3616';
  ctx.beginPath();
  ctx.ellipse(x + o.w / 2, GROUND_Y + 4, o.w / 2, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(x + o.w / 2 - 20 + Math.sin(t * 2) * 4, GROUND_Y + 1, 18, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHaystack(ctx, o, x, t, hiding) {
  ctx.fillStyle = '#d8a93e';
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  ctx.quadraticCurveTo(x + 4, GROUND_Y - o.h, x + o.w / 2, GROUND_Y - o.h);
  ctx.quadraticCurveTo(x + o.w - 4, GROUND_Y - o.h, x + o.w, GROUND_Y);
  ctx.fill();
  ctx.strokeStyle = '#b88a2c';
  ctx.lineWidth = 2;
  for (let k = 0; k < 9; k++) {
    const sx = x + 12 + k * 15;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y - 8);
    ctx.lineTo(sx + 6, GROUND_Y - o.h * (0.5 + 0.4 * Math.sin(k * 1.3) ** 2));
    ctx.stroke();
  }
  if (hiding) {
    // Pip peeks out of the hay, and the stack shivers.
    const peek = Math.sin(t * 3) > 0.4;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + o.w / 2 - 6, GROUND_Y - 52, 5, 0, Math.PI * 2);
    ctx.arc(x + o.w / 2 + 8, GROUND_Y - 52, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    const look = peek ? -2 : 2;
    ctx.beginPath();
    ctx.arc(x + o.w / 2 - 6 + look, GROUND_Y - 52, 2.2, 0, Math.PI * 2);
    ctx.arc(x + o.w / 2 + 8 + look, GROUND_Y - 52, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9611d';
    ctx.beginPath();
    ctx.ellipse(x + o.w / 2 - 40, GROUND_Y - 60, 6, 14, -0.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(43, 22, 8, 0.75)';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('E: hide', x + o.w / 2, GROUND_Y - o.h - 8);
  }
}

function drawSwingKnife(ctx, o, x) {
  const kind = OBSTACLE_KINDS.swingKnife;
  const a = kind.angle(o);
  const px = x + o.w / 2;
  const tip = { x: px + Math.sin(a) * kind.length, y: kind.pivotY + Math.cos(a) * kind.length };
  ctx.strokeStyle = '#d9c7a3';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(px, kind.pivotY);
  ctx.lineTo(px + Math.sin(a) * (kind.length - 96), kind.pivotY + Math.cos(a) * (kind.length - 96));
  ctx.stroke();
  ctx.fillStyle = '#2e170b';
  ctx.fillRect(px - 8, kind.pivotY - 6, 16, 10);
  // The danger zone of the swing, a faint arc so its reach reads at a glance.
  ctx.strokeStyle = 'rgba(255, 90, 60, 0.25)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(px, kind.pivotY, kind.length, Math.PI / 2 - 1.05, Math.PI / 2 + 1.05);
  ctx.stroke();
  drawCarvingKnife(ctx, px + Math.sin(a) * (kind.length - 90), kind.pivotY + Math.cos(a) * (kind.length - 90), Math.PI / 2 - a, 1.4);
  // A glint at the tip makes the arc easy to read.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawOven(ctx, o, x, t) {
  const kind = OBSTACLE_KINDS.oven;
  const state = kind.flameState(o);
  const top = GROUND_Y - o.h;
  // Body and stovetop.
  ctx.fillStyle = '#3b3f45';
  ctx.fillRect(x, top, o.w, o.h);
  ctx.fillStyle = '#5a6068';
  ctx.fillRect(x - 4, top - 8, o.w + 8, 10);
  ctx.fillStyle = '#c9cdd2';
  ctx.fillRect(x + 10, top + 6, o.w - 20, 8);
  // The oven window, with a roasting pan waiting for a guest of honour.
  const glow = state === 'roar' ? '#ffb347' : state === 'warn' ? '#ff8a3a' : '#a84a1e';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 12, top + 24, o.w - 24, o.h - 38);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x + 18, top + 30, o.w - 36, o.h - 50);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2b1608';
  ctx.fillRect(x + 28, top + o.h - 34, o.w - 56, 8);
  ctx.fillStyle = '#d9d9d9';
  ctx.fillRect(x + 20, top + 18, o.w - 40, 4);
  // Knobs.
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 26 + k * 28, top + 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Burner flames: a flicker when warming up, a roaring column when on.
  if (state !== 'calm') {
    const height = state === 'roar' ? 150 : 22;
    for (let k = 0; k < 3; k++) {
      const fx = x + 24 + k * 30;
      const wob = Math.sin(t * 25 + k * 2) * 6;
      const g = ctx.createLinearGradient(0, top - height, 0, top);
      g.addColorStop(0, 'rgba(255, 220, 90, 0)');
      g.addColorStop(0.4, 'rgba(255, 140, 40, 0.9)');
      g.addColorStop(1, 'rgba(200, 40, 20, 1)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(fx - 14, top - 6);
      ctx.quadraticCurveTo(fx + wob, top - height * 1.1, fx + 14, top - 6);
      ctx.fill();
      // A bright yellow heart inside each flame.
      ctx.fillStyle = 'rgba(255, 236, 140, 0.9)';
      ctx.beginPath();
      ctx.moveTo(fx - 7, top - 6);
      ctx.quadraticCurveTo(fx - wob * 0.5, top - height * 0.6, fx + 7, top - 6);
      ctx.fill();
    }
  }
  if (state === 'warn') {
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x + o.w / 2, top - 30);
  }
}

function drawChopKnife(ctx, o, x) {
  const kind = OBSTACLE_KINDS.chopKnife;
  const drop = kind.drop(o);
  const bladeLen = GROUND_Y - 40;
  const bottom = 30 + drop * (GROUND_Y - 30);
  // The shadow on the floor grows as the blade is about to fall.
  const warn = kind.warning(o);
  ctx.fillStyle = warn ? 'rgba(200, 30, 20, 0.45)' : 'rgba(40, 20, 8, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x + o.w / 2, GROUND_Y + 3, warn ? 34 : 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // A giant carving knife held point down.
  ctx.save();
  ctx.translate(x + o.w / 2, bottom);
  const steel = ctx.createLinearGradient(-o.w / 2, 0, o.w / 2, 0);
  steel.addColorStop(0, '#f4f7fa');
  steel.addColorStop(1, '#8e9aa6');
  ctx.fillStyle = steel;
  ctx.beginPath();
  ctx.moveTo(-o.w / 2, -bladeLen * 0.5);
  ctx.lineTo(o.w / 2, -bladeLen * 0.5);
  ctx.lineTo(o.w / 2, -16);
  ctx.quadraticCurveTo(o.w / 2, 0, -o.w / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9a440';
  ctx.fillRect(-o.w / 2 - 6, -bladeLen * 0.5 - 10, o.w + 12, 10);
  ctx.fillStyle = '#5b3418';
  ctx.fillRect(-o.w / 2 + 4, -bladeLen * 0.5 - 90, o.w - 8, 80);
  ctx.restore();
  if (drop === 1) {
    ctx.fillStyle = '#5b3418';
    ctx.fillRect(x - 20, GROUND_Y - 6, o.w + 40, 6);
  }
}

function drawPot(ctx, o, x, t) {
  ctx.fillStyle = '#4a4f57';
  ctx.fillRect(x + 4, GROUND_Y - o.h + 8, o.w - 8, o.h - 8);
  ctx.fillStyle = '#6b727c';
  ctx.fillRect(x, GROUND_Y - o.h + 4, o.w, 8);
  ctx.fillRect(x - 8, GROUND_Y - o.h + 18, 10, 6);
  ctx.fillRect(x + o.w - 2, GROUND_Y - o.h + 18, 10, 6);
  ctx.fillStyle = '#c9a64a';
  ctx.beginPath();
  ctx.ellipse(x + o.w / 2, GROUND_Y - o.h + 6, o.w / 2 - 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    const sx = x + 18 + k * 18;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y - o.h - 2);
    ctx.quadraticCurveTo(sx + Math.sin(t * 3 + k) * 10, GROUND_Y - o.h - 24, sx, GROUND_Y - o.h - 44);
    ctx.stroke();
  }
}

// The farmer's thrown knife spins as it flies; while he winds up nothing is drawn here (the
// farmer's raised arm and the warning arrow show it).
function drawThrownKnife(ctx, o, x, t) {
  if (o.phase !== 'fly') return;
  const y = o.high ? GROUND_Y - 51 : GROUND_Y - 15;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 60, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  drawCarvingKnife(ctx, x + 28, y, Math.sin(t * 40) * 0.15, 0.85);
}

const DRAWERS = {
  hay: drawHay, fence: drawFence, pumpkins: drawPumpkins, mud: drawMud, haystack: drawHaystack,
  swingKnife: drawSwingKnife, oven: drawOven, chopKnife: drawChopKnife, pot: drawPot, thrownKnife: drawThrownKnife,
};

export function drawObstacle(ctx, o, x, t, hiding = false) {
  DRAWERS[o.type](ctx, o, x, t, hiding);
}

export function drawCorn(ctx, x, y, t) {
  const bob = Math.sin(t * 4 + x * 0.05) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(0.4);
  ctx.fillStyle = '#6f7a2c';
  ctx.beginPath();
  ctx.ellipse(-4, 6, 4, 12, -0.4, 0, Math.PI * 2);
  ctx.ellipse(4, 6, 4, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c232';
  ctx.beginPath();
  ctx.ellipse(0, -2, 6, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d99a1a';
  for (let r = -2; r <= 2; r++) {
    ctx.fillRect(-3, -2 + r * 4, 2, 2);
    ctx.fillRect(1, -2 + r * 4, 2, 2);
  }
  ctx.restore();
}
