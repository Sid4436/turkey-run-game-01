// The heads-up display over a run: score, distance to freedom with the three stages, feathers
// left, how close the farmer is, the dash meter, and the warnings that come from behind.

import { ESCAPE_METRES, RUN, STAGES, TURKEY_X, VIEW, GROUND_Y } from '../config.js';
import { runMetres, runScore } from '../world.js';

export function panel(ctx, x, y, w, h, alpha = 0.72) {
  ctx.fillStyle = `rgba(43, 22, 8, ${alpha})`;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 182, 50, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawFeather(ctx, x, y, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.5);
  ctx.fillStyle = filled ? '#c9611d' : 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  if (filled) {
    ctx.fillStyle = '#f2b632';
    ctx.beginPath();
    ctx.ellipse(0, -5, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = filled ? '#5a2c12' : 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, 18);
  ctx.stroke();
  ctx.restore();
}

function drawScoreBox(ctx, run, best) {
  panel(ctx, 14, 12, 210, 66);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2b632';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('SCORE', 28, 32);
  ctx.fillStyle = '#fbeed2';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(String(runScore(run)).padStart(5, '0'), 28, 64);
  ctx.fillStyle = 'rgba(251, 238, 210, 0.7)';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(`best ${best}`, 140, 32);
  ctx.fillText(`corn ${run.stats.corn}`, 140, 50);
  ctx.fillText(`shaves ${run.stats.nearMisses}`, 140, 66);
}

function drawDistanceBar(ctx, run) {
  const x = 244;
  const w = 472;
  panel(ctx, x, 12, w, 66);
  const metres = Math.min(ESCAPE_METRES, runMetres(run));
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbeed2';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`${Math.floor(metres)} m  /  ${ESCAPE_METRES} m to freedom`, x + w / 2, 32);
  const bx = x + 18;
  const bw = w - 36;
  const by = 46;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(bx, by, bw, 12);
  let prev = 0;
  const tints = ['#8fa23a', '#c99a3d', '#e8771f'];
  STAGES.forEach((stage, i) => {
    const sx = bx + (prev / ESCAPE_METRES) * bw;
    const ex = bx + (stage.end / ESCAPE_METRES) * bw;
    const fill = Math.max(0, Math.min(1, (metres - prev) / (stage.end - prev)));
    ctx.fillStyle = tints[i];
    ctx.fillRect(sx, by, (ex - sx) * fill, 12);
    ctx.fillStyle = 'rgba(251,238,210,0.75)';
    ctx.font = '10px Georgia, serif';
    ctx.fillText(stage.name.replace('The ', '').toUpperCase(), (sx + ex) / 2, by + 26);
    ctx.fillStyle = '#2b1608';
    ctx.fillRect(ex - 1, by - 2, 2, 16);
    prev = stage.end;
  });
  // Pip's marker, and the farmer's a little way behind.
  const px = bx + (metres / ESCAPE_METRES) * bw;
  ctx.fillStyle = '#fbeed2';
  ctx.beginPath();
  ctx.arc(px, by + 6, 6, 0, Math.PI * 2);
  ctx.fill();
  const fm = Math.max(0, metres - run.farmer.gap / 10);
  ctx.fillStyle = '#b02a2a';
  ctx.beginPath();
  ctx.arc(bx + (fm / ESCAPE_METRES) * bw, by + 6, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawLivesAndDash(ctx, run) {
  const x = VIEW.width - 230;
  panel(ctx, x, 12, 216, 66);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2b632';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('FEATHERS', x + 14, 32);
  for (let i = 0; i < RUN.lives; i++) drawFeather(ctx, x + 26 + i * 26, 56, i < run.lives);
  ctx.fillText('DASH', x + 120, 32);
  const t = run.turkey;
  const ready = t.dashCooldown <= 0;
  const fill = ready ? 1 : 1 - t.dashCooldown / RUN.dashCooldown;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x + 120, 44, 80, 14);
  ctx.fillStyle = ready ? '#8fd14f' : '#c9611d';
  ctx.fillRect(x + 120, 44, 80 * fill, 14);
  ctx.fillStyle = '#fbeed2';
  ctx.font = '11px Georgia, serif';
  ctx.fillText(ready ? 'SHIFT!' : 'charging', x + 128, 72);
}

// The chase meter under the farmer: red and pulsing when he is about to grab Pip.
function drawChaseMeter(ctx, run, t) {
  const gap = run.farmer.gap;
  const danger = 1 - Math.min(1, gap / RUN.maxGap);
  const x = 14;
  const y = 88;
  panel(ctx, x, y, 210, 34, 0.6);
  ctx.fillStyle = '#fbeed2';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('FARMER', x + 12, y + 22);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x + 76, y + 11, 120, 12);
  const pulse = danger > 0.7 ? 0.6 + 0.4 * Math.sin(t * 14) : 1;
  ctx.fillStyle = danger > 0.7 ? `rgba(230, 50, 40, ${pulse})` : danger > 0.45 ? '#e8771f' : '#8fa23a';
  ctx.fillRect(x + 76, y + 11, 120 * danger, 12);
}

// Arrows on the left edge warn of a knife the farmer is winding up to throw from off screen.
function drawThrowWarnings(ctx, run, t) {
  for (const o of run.obstacles) {
    if (o.type !== 'thrownKnife') continue;
    const screenX = o.x - run.worldX + TURKEY_X;
    if (o.phase === 'windup' || screenX < 0) {
      const y = o.high ? GROUND_Y - 51 : GROUND_Y - 15;
      const blink = Math.sin(t * 20) > 0 ? 1 : 0.4;
      ctx.fillStyle = `rgba(255, 80, 50, ${blink})`;
      ctx.beginPath();
      ctx.moveTo(8, y - 14);
      ctx.lineTo(36, y);
      ctx.lineTo(8, y + 14);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(o.high ? 'KNIFE! duck' : 'KNIFE! jump', 42, y + 5);
    }
  }
}

// A speech bubble for the farmer's shouts.
export function drawShout(ctx, text, x, y) {
  ctx.font = 'bold 14px Georgia, serif';
  const w = ctx.measureText(text).width + 22;
  const bx = Math.max(8, Math.min(VIEW.width - w - 8, x - w / 2));
  ctx.fillStyle = '#fff6e2';
  ctx.beginPath();
  ctx.roundRect(bx, y - 30, w, 30, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(Math.max(bx + 12, Math.min(bx + w - 12, x)) - 6, y);
  ctx.lineTo(Math.max(bx + 12, Math.min(bx + w - 12, x)) + 6, y);
  ctx.lineTo(Math.max(bx + 12, Math.min(bx + w - 12, x)) - 2, y + 12);
  ctx.fill();
  ctx.fillStyle = '#2b1608';
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + w / 2, y - 10);
}

export function drawHud(ctx, run, t, best) {
  drawScoreBox(ctx, run, best);
  drawDistanceBar(ctx, run);
  drawLivesAndDash(ctx, run);
  drawChaseMeter(ctx, run, t);
  drawThrowWarnings(ctx, run, t);
}
