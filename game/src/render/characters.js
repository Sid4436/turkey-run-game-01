// The two characters, drawn from canvas shapes: Pip the turkey and Farmer Hollis Crumb.
// Both are drawn at their feet, so x and y are where they touch the ground.

import { GROUND_Y } from '../config.js';

const TAIL_COLORS = ['#7a3b16', '#c9611d', '#f2b632', '#f6e3c0', '#b5481c'];

export function drawTurkey(ctx, turkey, x, t, { scale = 1, mood = 'run' } = {}) {
  const y = turkey.y;
  if (turkey.hidden) return;
  if (turkey.invulnTime > 0 && Math.floor(turkey.invulnTime * 14) % 2 === 0) return;
  const ducking = turkey.ducking && turkey.onGround;
  const squash = ducking ? 0.62 : turkey.landedTime > 0 ? 0.85 : 1;
  const stride = Math.sin(turkey.runCycle);
  const air = !turkey.onGround;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale * squash);
  // Shadow on the ground, which shrinks as Pip rises.
  ctx.save();
  ctx.scale(1, 1 / squash);
  const lift = Math.max(0, GROUND_Y - y);
  ctx.fillStyle = `rgba(40, 20, 8, ${0.28 - Math.min(0.2, lift / 800)})`;
  ctx.beginPath();
  ctx.ellipse(0, lift, 30 - Math.min(16, lift / 10), 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Legs.
  ctx.strokeStyle = '#e8771f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const legs = air ? [[-6, 0.5], [6, 0.5]] : [[-5, stride], [5, -stride]];
  for (const [lx, phase] of legs) {
    ctx.beginPath();
    ctx.moveTo(lx, -18);
    ctx.lineTo(lx + phase * 9, -2);
    ctx.lineTo(lx + phase * 9 + 7, 0);
    ctx.stroke();
  }

  // Tail fan, the pride of every turkey.
  const fanTilt = air ? -0.25 : ducking ? 0.5 : Math.sin(t * 8) * 0.04;
  ctx.save();
  ctx.translate(-16, -38);
  ctx.rotate(-0.35 + fanTilt);
  for (let ring = 0; ring < 3; ring++) {
    const r = 46 - ring * 11;
    const feathers = 9;
    for (let f = 0; f < feathers; f++) {
      const a = Math.PI + (f / (feathers - 1)) * Math.PI;
      ctx.fillStyle = TAIL_COLORS[(f + ring) % TAIL_COLORS.length];
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 9 - ring, r * 0.5, a + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Body.
  const body = ctx.createRadialGradient(-4, -44, 4, 0, -34, 30);
  body.addColorStop(0, '#8a4a22');
  body.addColorStop(1, '#5a2c12');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -34, 27, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // Breast feathers.
  ctx.fillStyle = '#3e1d0b';
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.arc(10 + k * 3, -40 + k * 6, 4, 0, Math.PI);
    ctx.fill();
  }
  // Wing: tucked while running, flapping in the air.
  ctx.save();
  ctx.translate(-4, -38);
  ctx.rotate(air ? -0.8 + Math.sin(t * 30) * 0.6 : stride * 0.15);
  ctx.fillStyle = '#6b3414';
  ctx.beginPath();
  ctx.ellipse(-6, 4, 18, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9611d';
  ctx.fillRect(-20, 6, 22, 3);
  ctx.restore();

  // Neck and head, stretched forward when running flat out.
  const reach = turkey.dashTime > 0 ? 8 : 0;
  ctx.strokeStyle = '#a8c0d0';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(16, -46);
  ctx.quadraticCurveTo(24 + reach, -56, 24 + reach, -64);
  ctx.stroke();
  const hx = 26 + reach;
  const hy = -68;
  ctx.fillStyle = '#b9cfdc';
  ctx.beginPath();
  ctx.arc(hx, hy, 11, 0, Math.PI * 2);
  ctx.fill();
  // Snood and wattle.
  ctx.fillStyle = '#d0263a';
  ctx.beginPath();
  ctx.ellipse(hx + 9, hy + 2, 3, 9, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 4, hy + 12, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.fillStyle = '#f2b632';
  ctx.beginPath();
  ctx.moveTo(hx + 8, hy - 3);
  ctx.lineTo(hx + 19, hy + 1);
  ctx.lineTo(hx + 8, hy + 4);
  ctx.fill();
  // Eye, wide with worry, and a determined brow.
  const scared = mood === 'scared' || turkey.stumbleTime > 0;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(hx + 2, hy - 3, scared ? 5.5 : 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(hx + 3.5, hy - 3, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hx - 4, hy - (scared ? 12 : 9));
  ctx.lineTo(hx + 7, hy - (scared ? 9 : 11));
  ctx.stroke();
  ctx.restore();

  // Dizzy stars after a hit.
  if (turkey.stumbleTime > 0) {
    for (let k = 0; k < 3; k++) {
      const a = t * 8 + (k * Math.PI * 2) / 3;
      drawStar(ctx, x + 22 + Math.cos(a) * 18, y - 92 + Math.sin(a) * 6, 5, '#ffd36b');
    }
  }
  // Speed lines while dashing.
  if (turkey.dashTime > 0) {
    ctx.strokeStyle = 'rgba(255, 245, 210, 0.8)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 4; k++) {
      const ly = y - 20 - k * 14;
      ctx.beginPath();
      ctx.moveTo(x - 60 - k * 8, ly);
      ctx.lineTo(x - 100 - k * 12, ly);
      ctx.stroke();
    }
  }
}

export function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
}

// Farmer Hollis Crumb: straw hat, ginger beard, plaid shirt, overalls, a carving knife in one
// hand and a lantern in the other.
export function drawFarmer(ctx, farmer, x, t, { windup = 0, lanternUp = false, scale = 1 } = {}) {
  const stride = Math.sin(farmer.stride);
  const bob = Math.abs(stride) * 4;
  ctx.save();
  ctx.translate(x, GROUND_Y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(40, 20, 8, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(0, -bob);

  // Legs in overalls with big boots.
  for (const [side, phase] of [[-1, stride], [1, -stride]]) {
    ctx.save();
    ctx.translate(side * 10, -70);
    ctx.rotate(phase * 0.5);
    ctx.fillStyle = '#3f5875';
    ctx.fillRect(-9, 0, 18, 58);
    ctx.fillStyle = '#3a2210';
    ctx.fillRect(-11, 56, 28, 14);
    ctx.restore();
  }
  // Torso: plaid shirt under overall bib.
  ctx.fillStyle = '#b02a2a';
  ctx.fillRect(-28, -138, 56, 72);
  ctx.strokeStyle = 'rgba(40, 10, 10, 0.5)';
  ctx.lineWidth = 3;
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.moveTo(-28, -128 + k * 18);
    ctx.lineTo(28, -128 + k * 18);
    ctx.moveTo(-20 + k * 14, -138);
    ctx.lineTo(-20 + k * 14, -66);
    ctx.stroke();
  }
  ctx.fillStyle = '#3f5875';
  ctx.fillRect(-22, -112, 44, 50);
  ctx.fillRect(-26, -76, 52, 12);
  ctx.fillStyle = '#f2b632';
  ctx.fillRect(-16, -110, 6, 6);
  ctx.fillRect(10, -110, 6, 6);
  // Back arm: the lantern.
  ctx.save();
  ctx.translate(-22, -128);
  ctx.rotate(lanternUp ? -2.3 : 0.4 + stride * 0.4);
  ctx.fillStyle = '#b02a2a';
  ctx.fillRect(-7, 0, 14, 44);
  ctx.fillStyle = '#e8b48a';
  ctx.beginPath();
  ctx.arc(0, 48, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 52);
  ctx.lineTo(0, 60);
  ctx.stroke();
  ctx.fillStyle = '#2b1608';
  ctx.fillRect(-9, 60, 18, 4);
  ctx.fillStyle = lanternUp ? '#fff2a8' : '#ffc44d';
  ctx.fillRect(-7, 64, 14, 18);
  ctx.fillStyle = '#2b1608';
  ctx.fillRect(-9, 82, 18, 4);
  ctx.restore();
  // Head: round face, red nose, bushy ginger beard and a straw hat.
  ctx.fillStyle = '#e8b48a';
  ctx.beginPath();
  ctx.arc(4, -158, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0582a';
  ctx.beginPath();
  ctx.moveTo(-18, -158);
  ctx.quadraticCurveTo(4, -110, 28, -158);
  ctx.quadraticCurveTo(4, -146, -18, -158);
  ctx.fill();
  const angry = farmer.mood === 'surge' || farmer.mood === 'grab';
  ctx.fillStyle = angry ? '#e0453a' : '#d8695a';
  ctx.beginPath();
  ctx.arc(20, -160, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  if (farmer.mood === 'search') {
    ctx.fillRect(6, -168, 10, 3);
  } else {
    ctx.beginPath();
    ctx.arc(12, -167, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#6b2c12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, angry ? -176 : -174);
  ctx.lineTo(18, angry ? -170 : -175);
  ctx.stroke();
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.ellipse(2, -176, 36, 7, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-16, -198, 34, 22);
  ctx.fillStyle = '#9e1f2f';
  ctx.fillRect(-16, -184, 34, 6);
  // Front arm: the carving knife, swung back when he is about to throw.
  ctx.save();
  ctx.translate(20, -128);
  const swing = farmer.mood === 'grab' ? -1.4 : -0.6 - windup * 1.8 + (windup === 0 ? stride * 0.3 : 0);
  ctx.rotate(swing);
  ctx.fillStyle = '#b02a2a';
  ctx.fillRect(-7, 0, 14, 44);
  ctx.fillStyle = '#e8b48a';
  ctx.beginPath();
  ctx.arc(0, 48, 8, 0, Math.PI * 2);
  ctx.fill();
  if (windup < 1 && farmer.mood !== 'grab') drawCarvingKnife(ctx, 0, 52, Math.PI / 2, 0.9);
  ctx.restore();

  // Mood marks above his hat.
  if (farmer.mood === 'surge') {
    ctx.fillStyle = '#ff6a4a';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 4, -208);
  } else if (farmer.mood === 'search') {
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', 4 + Math.sin(t * 5) * 4, -208);
  }
  ctx.restore();
}

// A carving knife: wooden handle, brass bolster and a long curved steel blade.
export function drawCarvingKnife(ctx, x, y, angle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#5b3418';
  ctx.fillRect(-26, -5, 26, 10);
  ctx.fillStyle = '#d9a440';
  ctx.fillRect(0, -7, 5, 14);
  const steel = ctx.createLinearGradient(0, -8, 0, 8);
  steel.addColorStop(0, '#f4f7fa');
  steel.addColorStop(1, '#8e9aa6');
  ctx.fillStyle = steel;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(52, -4);
  ctx.quadraticCurveTo(64, 0, 66, 4);
  ctx.lineTo(5, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, -3);
  ctx.lineTo(50, -2);
  ctx.stroke();
  ctx.restore();
}
