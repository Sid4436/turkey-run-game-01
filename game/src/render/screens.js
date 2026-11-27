// The title screen, the pause card and the two endings (caught or escaped), with the buttons
// the mouse can click. Each draw function returns the clickable button rectangles it drew.

import { ESCAPE_METRES, GROUND_Y, VIEW } from '../config.js';
import { createTurkey } from '../turkey.js';
import { drawScene } from './scenery.js';
import { drawFarmer, drawTurkey, drawStar } from './characters.js';
import { drawCorn } from './hazards.js';
import { panel, drawShout } from './hud.js';

const CX = VIEW.width / 2;

function drawButton(ctx, x, y, w, h, label, hot) {
  ctx.fillStyle = hot ? '#f2b632' : '#e8771f';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#2b1608';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 8);
  return { x, y, w, h, label };
}

const inside = (p, b) => p && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
export const hitButton = (point, buttons) => buttons.find((b) => inside(point, b)) || null;

function titleText(ctx, text, y, size, color = '#fbeed2') {
  ctx.textAlign = 'center';
  ctx.font = `bold ${size}px Georgia, serif`;
  ctx.lineJoin = 'round';
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = '#2b1608';
  ctx.strokeText(text, CX, y);
  ctx.fillStyle = color;
  ctx.fillText(text, CX, y);
}

const posing = (y = GROUND_Y) => ({ ...createTurkey(), y });

export function drawTitle(ctx, t, best, pointer, muted) {
  drawScene(ctx, 'farmyard', t * 60, t);
  ctx.fillStyle = 'rgba(43, 22, 8, 0.25)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  titleText(ctx, 'GOBBLE GETAWAY', 104, 74, '#f2b632');
  ctx.fillStyle = '#fbeed2';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Help Pip the turkey run ${ESCAPE_METRES} m from the farmyard, through the barn`, CX, 142);
  ctx.fillText('and out the kitchen\'s back door before dinner is served.', CX, 166);

  // Pip mid-leap, Farmer Crumb close behind with his carving knife and lantern.
  const pip = posing(GROUND_Y - 30 - Math.abs(Math.sin(t * 3)) * 30);
  pip.onGround = false;
  pip.runCycle = t * 12;
  drawTurkey(ctx, pip, 640, t, { scale: 1.5 });
  drawFarmer(ctx, { stride: t * 8, mood: 'surge', lantern: { state: 'idle' } }, 420, t, { scale: 1.1 });
  drawShout(ctx, 'Dinner\'s at four, bird!', 420, GROUND_Y - 236);
  for (let i = 0; i < 4; i++) drawCorn(ctx, 760 + i * 40, GROUND_Y - 40, t);

  // Controls card.
  panel(ctx, 40, 196, 300, 196, 0.8);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2b632';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('HOW TO ESCAPE', 58, 222);
  ctx.fillStyle = '#fbeed2';
  ctx.font = '14px Georgia, serif';
  const lines = [
    'Space / W / click  -  jump, again to flap',
    'S / Down / right-click  -  duck',
    'Shift  -  dash (corn recharges it)',
    'E  -  hide in a haystack',
    'Hide when the lantern glints!',
    'Dodge ovens & carving knives',
    'P pause   M mute',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 58, 248 + i * 20));

  const buttons = [];
  const pulse = Math.sin(t * 4) > 0;
  buttons.push(drawButton(ctx, CX - 110, 410, 220, 54, 'RUN, PIP, RUN!', pulse || inside(pointer, { x: CX - 110, y: 410, w: 220, h: 54 })));
  buttons.push(drawButton(ctx, VIEW.width - 160, 480, 140, 40, muted ? 'Sound: off' : 'Sound: on', inside(pointer, { x: VIEW.width - 160, y: 480, w: 140, h: 40 })));
  ctx.fillStyle = '#fbeed2';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Best score: ${best}   ·   press Space or click to start`, CX, 492);
  return buttons;
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  titleText(ctx, 'PAUSED', 250, 60);
  ctx.fillStyle = '#fbeed2';
  ctx.font = '18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('The farmer is tying his boots. Press P to keep running.', CX, 296);
}

export function rankFor(score, escaped) {
  if (escaped && score > 4500) return 'Legend of the Wishbone';
  if (escaped) return 'Free-Range Fugitive';
  if (score > 2500) return 'Kitchen Crasher';
  if (score > 1200) return 'Barnyard Bolter';
  if (score > 500) return 'Drumstick Dasher';
  return 'Stuffing Material';
}

function drawPlatterScene(ctx, t) {
  drawScene(ctx, 'kitchen', 0, t);
  ctx.fillStyle = 'rgba(30, 10, 4, 0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // A roasting platter, parsley and a very unimpressed Pip sitting in it.
  const px = 680;
  const py = GROUND_Y - 40;
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath();
  ctx.ellipse(px, py + 30, 130, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#efefef';
  ctx.beginPath();
  ctx.ellipse(px, py + 24, 112, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a8a2c';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(px - 96 + i * 32, py + 22 + Math.sin(i) * 4, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  const pip = posing(py + 24);
  pip.ducking = true;
  drawTurkey(ctx, pip, px, t, { scale: 1.4, mood: 'scared' });
  // An apple in the beak, the final insult.
  ctx.fillStyle = '#c0262f';
  ctx.beginPath();
  ctx.arc(px + 66, py - 34, 10, 0, Math.PI * 2);
  ctx.fill();
  drawFarmer(ctx, { stride: 0, mood: 'grab', lantern: { state: 'idle' } }, 500, t, { scale: 1.15 });
  drawShout(ctx, 'Gotcha! Dinner is served!', 500, GROUND_Y - 250);
}

function drawFreedomScene(ctx, t) {
  drawScene(ctx, 'woods', t * 30, t);
  // The setting sun, and Pip running into it with a little bindle of corn.
  ctx.fillStyle = 'rgba(255, 214, 140, 0.85)';
  ctx.beginPath();
  ctx.arc(760, GROUND_Y - 10, 90, Math.PI, 0);
  ctx.fill();
  const pip = posing(GROUND_Y - Math.abs(Math.sin(t * 6)) * 14);
  pip.runCycle = t * 14;
  drawTurkey(ctx, pip, 700, t, { scale: 1.5 });
  ctx.strokeStyle = '#5b3418';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(690, GROUND_Y - 90);
  ctx.lineTo(650, GROUND_Y - 140);
  ctx.stroke();
  ctx.fillStyle = '#9e1f2f';
  ctx.beginPath();
  ctx.arc(646, GROUND_Y - 146, 14, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 6; i++) drawStar(ctx, 560 + i * 60, 80 + Math.sin(t * 2 + i) * 10, 6, '#fff3a0');
}

export function drawEnd(ctx, over, stats, best, t, pointer, newBest) {
  const escaped = over.result === 'escaped';
  if (escaped) drawFreedomScene(ctx, t);
  else drawPlatterScene(ctx, t);
  titleText(ctx, escaped ? 'ESCAPED!' : 'CAUGHT!', 92, 72, escaped ? '#8fd14f' : '#ff6a4a');
  ctx.fillStyle = '#fbeed2';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(escaped ? 'Pip is a free bird. Somebody\'s having pie for dinner instead.' : 'Pip became the guest of honour. Run again before the oven is hot!', CX, 130);

  panel(ctx, 40, 160, 330, 270, 0.82);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2b632';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(rankFor(over.score, escaped), 60, 192);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#fbeed2';
  const rows = [
    ['Distance', `${over.metres} / ${ESCAPE_METRES} m`],
    ['Corn grabbed', stats.corn],
    ['Close shaves', stats.nearMisses],
    ['Hid from lantern', stats.hides],
    ['Feathers lost', stats.hits],
  ];
  rows.forEach(([k, v], i) => {
    ctx.fillText(k, 60, 226 + i * 28);
    ctx.textAlign = 'right';
    ctx.fillText(String(v), 350, 226 + i * 28);
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = '#f2b632';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`Score ${over.score}`, 60, 384);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = newBest ? '#8fd14f' : '#fbeed2';
  ctx.fillText(newBest ? 'New best score!' : `Best ${best}`, 60, 412);

  const buttons = [];
  const ready = over.time > 0.8;
  buttons.push(drawButton(ctx, 40, 452, 200, 52, ready ? 'RUN AGAIN' : '...', ready && (Math.sin(t * 4) > 0 || inside(pointer, { x: 40, y: 452, w: 200, h: 52 }))));
  buttons.push(drawButton(ctx, 256, 452, 114, 52, 'Title', inside(pointer, { x: 256, y: 452, w: 114, h: 52 })));
  return buttons;
}
