// Composes one frame of a run, back to front: scenery and doorways, hazards and corn, the
// farmer's lantern beam, the farmer, Pip, particles and popups, then the HUD and banners.

import { GROUND_Y, TURKEY_X, VIEW } from '../config.js';
import { OBSTACLE_KINDS } from '../obstacles.js';
import { lanternSweep } from '../farmer.js';
import { toScreenX } from '../world.js';
import { drawDoorway, drawScenery } from './scenery.js';
import { drawCorn, drawObstacle } from './hazards.js';
import { drawFarmer, drawTurkey, drawStar } from './characters.js';
import { drawHud, drawShout, panel } from './hud.js';

function drawLantern(ctx, run, farmerX, t) {
  const lantern = run.farmer.lantern;
  const ox = farmerX + 32;
  const oy = GROUND_Y - 177;
  if (lantern.state === 'warn') {
    const pulse = 0.5 + 0.5 * Math.sin(t * 16);
    const gx = Math.max(24, ox);
    ctx.fillStyle = `rgba(255, 240, 150, ${0.35 + pulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(gx, Math.max(150, oy), 16 + pulse * 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (lantern.state === 'sweep') {
    const reach = 120 + lanternSweep(run.farmer) * 1300;
    const g = ctx.createLinearGradient(ox, 0, ox + reach, 0);
    g.addColorStop(0, 'rgba(255, 244, 170, 0.55)');
    g.addColorStop(1, 'rgba(255, 244, 170, 0.12)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + reach, GROUND_Y - 190);
    ctx.lineTo(ox + reach, GROUND_Y + 10);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFarmerOrMarker(ctx, run, t) {
  const farmer = run.farmer;
  const x = TURKEY_X - farmer.gap;
  const knife = run.obstacles.find((o) => o.type === 'thrownKnife' && o.phase === 'windup');
  const windup = knife ? Math.min(1, knife.t / OBSTACLE_KINDS.thrownKnife.windup) : 0;
  const lanternUp = farmer.lantern.state !== 'idle';
  if (x > -50) {
    drawFarmer(ctx, farmer, x, t, { windup, lanternUp });
    if (farmer.shoutTime > 0 && farmer.shout) drawShout(ctx, farmer.shout, x + 20, GROUND_Y - 250);
  } else {
    // Off screen: a boot-print marker with how far back he is.
    panel(ctx, 10, GROUND_Y - 120, 118, 44, 0.65);
    ctx.fillStyle = '#fbeed2';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('FARMER', 22, GROUND_Y - 102);
    ctx.fillStyle = '#f2b632';
    ctx.fillText(`${Math.round(farmer.gap / 10)} m behind`, 22, GROUND_Y - 84);
    if (farmer.shoutTime > 0 && farmer.shout) drawShout(ctx, farmer.shout, 90, GROUND_Y - 132);
  }
}

function drawParticles(ctx, run) {
  for (const p of run.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (p.kind === 'feather') {
      ctx.fillStyle = '#c9611d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'straw') {
      ctx.fillStyle = '#e9c46a';
      ctx.fillRect(-6, -1, 12, 2);
    } else if (p.kind === 'sparkle') {
      drawStar(ctx, 0, 0, 5, '#fff3a0');
    } else if (p.kind === 'spark') {
      ctx.fillStyle = '#ffb347';
      ctx.fillRect(-2, -2, 4, 4);
    } else if (p.kind === 'mud') {
      ctx.fillStyle = '#5a3616';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(200, 170, 120, 0.8)';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawPopups(ctx, run) {
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px Georgia, serif';
  for (const p of run.popups) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = '#2b1608';
    ctx.fillText(p.text, p.x + 2, p.y + 2);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function drawBanner(ctx, banner) {
  const fade = Math.min(1, banner.time * 2, (2.6 - banner.time) * 4 + 0.2);
  ctx.globalAlpha = Math.max(0, fade);
  panel(ctx, VIEW.width / 2 - 230, 150, 460, 86, 0.8);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2b632';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText(banner.title, VIEW.width / 2, 194);
  ctx.fillStyle = '#fbeed2';
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText(banner.sub, VIEW.width / 2, 222);
  ctx.globalAlpha = 1;
}

export function drawRunFrame(ctx, run, t, best, { hud = true } = {}) {
  ctx.save();
  if (run.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * run.shake, (Math.random() - 0.5) * 10 * run.shake);
  const doorXs = run.landmarks.map((l) => toScreenX(run, l.x));
  drawScenery(ctx, doorXs, run.worldX, t);
  run.landmarks.forEach((l, i) => {
    if (doorXs[i] > -60 && doorXs[i] < VIEW.width + 60) drawDoorway(ctx, l.kind, doorXs[i]);
  });
  for (const o of run.obstacles) {
    const x = toScreenX(run, o.x);
    if (x > VIEW.width + 60 || x + o.w < -340) continue;
    const hiding = o.type === 'haystack' && run.turkey.hidden && run.worldX > o.x && run.worldX < o.x + o.w;
    drawObstacle(ctx, o, x, t, hiding);
  }
  for (const c of run.corn) drawCorn(ctx, toScreenX(run, c.x), c.y, t);
  drawLantern(ctx, run, TURKEY_X - run.farmer.gap, t);
  drawFarmerOrMarker(ctx, run, t);
  drawTurkey(ctx, run.turkey, TURKEY_X, t, { scale: 1.2, mood: run.farmer.gap < 120 ? 'scared' : 'run' });
  drawParticles(ctx, run);
  drawPopups(ctx, run);
  ctx.restore();
  if (run.flash) {
    ctx.fillStyle = `${run.flash.color}${Math.min(0.45, run.flash.time)})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  if (hud) {
    drawHud(ctx, run, t, best);
    if (run.banner) drawBanner(ctx, run.banner);
  }
}
