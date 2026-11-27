// The scenery behind the chase, drawn in layers that scroll at different speeds: the autumn
// farmyard, the old barn, the farmhouse kitchen and, past the back door, the woods. Where two
// places meet, a doorway is drawn and each side of it shows its own place.

import { GROUND_Y, VIEW } from '../config.js';

const W = VIEW.width;
const H = VIEW.height;

// Repeats a drawing every `spacing` pixels across the screen, scrolled by `offset`.
function tiled(offset, spacing, draw) {
  const start = -((offset % spacing) + spacing) % spacing - spacing;
  for (let x = start, i = Math.floor(offset / spacing) - 1; x < W + spacing; x += spacing, i++) draw(x, i);
}

// A deterministic wobble per tile index, so trees and props vary but never flicker.
const hash = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function drawFarmyard(ctx, scroll, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#f7c77d');
  sky.addColorStop(0.55, '#f09a57');
  sky.addColorStop(1, '#d9713f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Low afternoon sun.
  ctx.fillStyle = 'rgba(255, 236, 170, 0.9)';
  ctx.beginPath();
  ctx.arc(760, 150, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 236, 170, 0.25)';
  ctx.beginPath();
  ctx.arc(760, 150, 80, 0, Math.PI * 2);
  ctx.fill();
  // Geese heading south, a little joke about who gets to leave.
  ctx.strokeStyle = 'rgba(90, 40, 20, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const gx = ((t * 30 + i * 26) % (W + 200)) - 100;
    const gy = 80 + Math.abs(i - 2) * 12;
    const flap = Math.sin(t * 6 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(gx - 8, gy - flap);
    ctx.lineTo(gx, gy);
    ctx.lineTo(gx + 8, gy - flap);
    ctx.stroke();
  }
  // Far hills.
  ctx.fillStyle = '#c3683a';
  tiled(scroll * 0.1, 420, (x) => {
    ctx.beginPath();
    ctx.moveTo(x - 40, GROUND_Y - 60);
    ctx.quadraticCurveTo(x + 170, GROUND_Y - 210, x + 460, GROUND_Y - 60);
    ctx.fill();
  });
  // The farm on the horizon: barn, silo and windmill.
  tiled(scroll * 0.2, 1100, (x) => drawDistantFarm(ctx, x + 200, GROUND_Y - 80, t));
  // Autumn trees.
  tiled(scroll * 0.45, 230, (x, i) => {
    const h = 70 + hash(i) * 50;
    const colors = ['#d4552a', '#e8892b', '#f2b632', '#b5481c'];
    ctx.fillStyle = '#5b3418';
    ctx.fillRect(x + 54, GROUND_Y - 60 - h * 0.4, 12, h * 0.4 + 30);
    ctx.fillStyle = colors[Math.floor(hash(i + 9) * 4)];
    ctx.beginPath();
    ctx.ellipse(x + 60, GROUND_Y - 70 - h * 0.45, 46, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(x + 46, GROUND_Y - 84 - h * 0.5, 18, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Split-rail fence along the yard.
  ctx.fillStyle = '#7a4a26';
  tiled(scroll * 0.8, 120, (x) => {
    ctx.fillRect(x, GROUND_Y - 62, 9, 62);
  });
  ctx.fillRect(0, GROUND_Y - 54, W, 6);
  ctx.fillRect(0, GROUND_Y - 32, W, 6);
  drawGround(ctx, scroll, '#8a5a2b', '#6f7a2c', '#a86d35');
}

function drawDistantFarm(ctx, x, base, t) {
  ctx.fillStyle = '#8f2a1e';
  ctx.fillRect(x, base - 50, 80, 50);
  ctx.beginPath();
  ctx.moveTo(x - 6, base - 50);
  ctx.lineTo(x + 40, base - 80);
  ctx.lineTo(x + 86, base - 50);
  ctx.fill();
  ctx.fillStyle = '#f3d6a4';
  ctx.fillRect(x + 30, base - 30, 20, 30);
  ctx.fillStyle = '#9b8b78';
  ctx.fillRect(x + 92, base - 82, 22, 82);
  ctx.beginPath();
  ctx.arc(x + 103, base - 82, 11, Math.PI, 0);
  ctx.fill();
  // Windmill.
  ctx.strokeStyle = '#6d4b34';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 60, base);
  ctx.lineTo(x - 50, base - 70);
  ctx.lineTo(x - 40, base);
  ctx.stroke();
  for (let k = 0; k < 4; k++) {
    const a = t * 1.5 + (k * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x - 50, base - 70);
    ctx.lineTo(x - 50 + Math.cos(a) * 22, base - 70 + Math.sin(a) * 22);
    ctx.stroke();
  }
}

function drawGround(ctx, scroll, dirt, top, speck) {
  ctx.fillStyle = dirt;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = top;
  ctx.fillRect(0, GROUND_Y, W, 8);
  ctx.fillStyle = speck;
  tiled(scroll, 70, (x, i) => {
    ctx.fillRect(x + hash(i) * 50, GROUND_Y + 20 + hash(i + 3) * 50, 10, 4);
    ctx.fillRect(x + hash(i + 7) * 60, GROUND_Y + 56 + hash(i + 5) * 20, 6, 3);
  });
}

function drawBarn(ctx, scroll, t) {
  ctx.fillStyle = '#4a2716';
  ctx.fillRect(0, 0, W, H);
  // Vertical wall planks with knots.
  tiled(scroll * 0.5, 64, (x, i) => {
    ctx.fillStyle = i % 2 ? '#5c3019' : '#54301b';
    ctx.fillRect(x, 0, 62, GROUND_Y);
    ctx.fillStyle = '#3a1d0f';
    ctx.fillRect(x + 62, 0, 2, GROUND_Y);
    if (hash(i) > 0.6) {
      ctx.beginPath();
      ctx.ellipse(x + 20 + hash(i + 2) * 20, 200 + hash(i + 4) * 160, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  // Light falling through gaps in the boards.
  ctx.fillStyle = 'rgba(255, 210, 120, 0.10)';
  tiled(scroll * 0.5, 380, (x) => {
    ctx.beginPath();
    ctx.moveTo(x + 40, 0);
    ctx.lineTo(x + 70, 0);
    ctx.lineTo(x + 190, GROUND_Y);
    ctx.lineTo(x + 120, GROUND_Y);
    ctx.fill();
  });
  // Stacked bales in the back.
  tiled(scroll * 0.7, 520, (x, i) => {
    const rows = 2 + Math.floor(hash(i) * 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < rows - r + 1; c++) {
        drawBale(ctx, x + c * 70 + r * 35, GROUND_Y - 40 - r * 40, 68, 40, '#7d5a26');
      }
    }
  });
  // Rafters and the beam the swinging knives hang from.
  ctx.fillStyle = '#2e170b';
  ctx.fillRect(0, 76, W, 18);
  tiled(scroll * 0.9, 300, (x) => {
    ctx.save();
    ctx.translate(x, 0);
    ctx.fillRect(0, 0, 16, 94);
    ctx.beginPath();
    ctx.moveTo(16, 76);
    ctx.lineTo(90, 0);
    ctx.lineTo(106, 0);
    ctx.lineTo(16, 94);
    ctx.fill();
    ctx.restore();
  });
  // A hanging lantern that sways.
  tiled(scroll * 0.9, 600, (x) => {
    const sway = Math.sin(t * 1.6) * 6;
    ctx.strokeStyle = '#2e170b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 150, 94);
    ctx.lineTo(x + 150 + sway, 140);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 200, 90, 0.18)';
    ctx.beginPath();
    ctx.arc(x + 150 + sway, 152, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd36b';
    ctx.fillRect(x + 143 + sway, 140, 14, 20);
  });
  drawGround(ctx, scroll, '#8d6a2c', '#d8b24e', '#b48c38');
}

export function drawBale(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect(x, y + h - 6, w, 6);
  ctx.strokeStyle = '#7a4a26';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.3, y);
  ctx.lineTo(x + w * 0.3, y + h);
  ctx.moveTo(x + w * 0.7, y);
  ctx.lineTo(x + w * 0.7, y + h);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,180,0.35)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 5; k++) {
    ctx.beginPath();
    ctx.moveTo(x + 4 + k * (w / 5), y + 6);
    ctx.lineTo(x + 10 + k * (w / 5), y + h - 8);
    ctx.stroke();
  }
}

function drawKitchen(ctx, scroll, t) {
  // Striped wallpaper.
  ctx.fillStyle = '#f2ddb0';
  ctx.fillRect(0, 0, W, GROUND_Y);
  ctx.fillStyle = '#e8c88a';
  tiled(scroll * 0.6, 40, (x) => ctx.fillRect(x, 0, 18, GROUND_Y));
  // Upper cabinets and a shelf of jars.
  tiled(scroll * 0.6, 480, (x, i) => {
    ctx.fillStyle = '#9b5a2e';
    ctx.fillRect(x, 40, 200, 110);
    ctx.fillStyle = '#b8743f';
    ctx.fillRect(x + 10, 50, 85, 90);
    ctx.fillRect(x + 105, 50, 85, 90);
    ctx.fillStyle = '#f2b632';
    ctx.fillRect(x + 86, 92, 5, 14);
    ctx.fillRect(x + 109, 92, 5, 14);
    // Window onto the sunset, so you can see the way out.
    ctx.fillStyle = '#5b2e16';
    ctx.fillRect(x + 250, 70, 150, 130);
    const g = ctx.createLinearGradient(0, 78, 0, 192);
    g.addColorStop(0, '#f6b86a');
    g.addColorStop(1, '#c85a35');
    ctx.fillStyle = g;
    ctx.fillRect(x + 258, 78, 134, 114);
    ctx.fillStyle = '#7d3a1c';
    ctx.beginPath();
    ctx.moveTo(x + 258, 192);
    ctx.quadraticCurveTo(x + 320, 140, x + 392, 180);
    ctx.lineTo(x + 392, 192);
    ctx.fill();
    ctx.fillStyle = '#5b2e16';
    ctx.fillRect(x + 322, 78, 6, 114);
    ctx.fillRect(x + 258, 132, 134, 6);
    // Checked curtains.
    ctx.fillStyle = '#9e1f2f';
    ctx.fillRect(x + 244, 62, 30, 90);
    ctx.fillRect(x + 376, 62, 30, 90);
    if (hash(i) > 0.4) drawCalendar(ctx, x + 430, 200);
  });
  // Counter along the back wall.
  ctx.fillStyle = '#7d4521';
  ctx.fillRect(0, GROUND_Y - 120, W, 120);
  ctx.fillStyle = '#d9c7a3';
  ctx.fillRect(0, GROUND_Y - 128, W, 12);
  ctx.fillStyle = '#6a3a1c';
  tiled(scroll * 0.85, 150, (x) => {
    ctx.fillRect(x + 8, GROUND_Y - 108, 130, 100);
    ctx.fillStyle = '#8a5230';
    ctx.fillRect(x + 14, GROUND_Y - 102, 118, 88);
    ctx.fillStyle = '#e0a640';
    ctx.fillRect(x + 64, GROUND_Y - 70, 18, 5);
    ctx.fillStyle = '#6a3a1c';
  });
  // Pies cooling on the counter: the reason for the hurry.
  tiled(scroll * 0.85, 450, (x) => {
    ctx.fillStyle = '#c96f2a';
    ctx.beginPath();
    ctx.ellipse(x + 80, GROUND_Y - 132, 34, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a14a';
    ctx.fillRect(x + 46, GROUND_Y - 134, 68, 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      const wob = Math.sin(t * 2 + k) * 4;
      ctx.beginPath();
      ctx.moveTo(x + 68 + k * 12, GROUND_Y - 142);
      ctx.quadraticCurveTo(x + 64 + k * 12 + wob, GROUND_Y - 156, x + 70 + k * 12, GROUND_Y - 170);
      ctx.stroke();
    }
  });
  // Checkered floor.
  ctx.fillStyle = '#efe2c4';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = '#b5481c';
  const size = 44;
  tiled(scroll, size * 2, (x) => {
    for (let r = 0; r < 3; r++) {
      ctx.fillRect(x + (r % 2) * size, GROUND_Y + r * size * 0.7, size, size * 0.7);
    }
  });
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, GROUND_Y, W, 5);
}

function drawCalendar(ctx, x, y) {
  ctx.fillStyle = '#fff6e2';
  ctx.fillRect(x, y, 70, 80);
  ctx.fillStyle = '#9e1f2f';
  ctx.fillRect(x, y, 70, 18);
  ctx.fillStyle = '#fff6e2';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('NOVEMBER', x + 35, y + 13);
  ctx.fillStyle = '#2b1608';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('27', x + 35, y + 54);
  ctx.strokeStyle = '#9e1f2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x + 35, y + 44, 24, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '10px Georgia, serif';
  ctx.fillText('ROAST DAY', x + 35, y + 74);
}

function drawWoods(ctx, scroll) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#5d3a5a');
  sky.addColorStop(1, '#e98a4c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  tiled(scroll * 0.4, 140, (x, i) => {
    ctx.fillStyle = '#3c2416';
    ctx.fillRect(x + 50, 100, 20 + hash(i) * 10, GROUND_Y - 100);
    ctx.fillStyle = ['#a8401b', '#d77a2a', '#7a2c18'][Math.floor(hash(i + 1) * 3)];
    ctx.beginPath();
    ctx.arc(x + 60, 120, 70, 0, Math.PI * 2);
    ctx.fill();
  });
  drawGround(ctx, scroll, '#5a3a1e', '#a8401b', '#7a4a26');
}

const SCENES = { farmyard: drawFarmyard, barn: drawBarn, kitchen: drawKitchen, woods: drawWoods };
export const SCENE_ORDER = ['farmyard', 'barn', 'kitchen', 'woods'];

export function drawScene(ctx, id, scroll, t) {
  SCENES[id](ctx, scroll, t);
}

// Draws each place between its doorways, so a door on screen has one place on either side.
// `doorXs` are the screen x of each doorway, in order.
export function drawScenery(ctx, doorXs, scroll, t) {
  let left = -Infinity;
  for (let i = 0; i < SCENE_ORDER.length; i++) {
    const right = i < doorXs.length ? doorXs[i] : Infinity;
    const from = Math.max(0, left);
    const to = Math.min(W, right);
    if (to > from) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(from, 0, to - from, H);
      ctx.clip();
      SCENES[SCENE_ORDER[i]](ctx, scroll, t);
      ctx.restore();
    }
    left = right;
  }
}

// The doorway set pieces between places.
export function drawDoorway(ctx, kind, x) {
  const top = 70;
  if (kind === 'barnDoor') {
    ctx.fillStyle = '#8f2a1e';
    ctx.fillRect(x - 40, top, 40, GROUND_Y - top);
    ctx.fillStyle = '#f3e2c0';
    ctx.fillRect(x - 40, top, 40, 8);
    ctx.save();
    ctx.strokeStyle = '#f3e2c0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 36, top + 20);
    ctx.lineTo(x - 4, GROUND_Y - 10);
    ctx.moveTo(x - 4, top + 20);
    ctx.lineTo(x - 36, GROUND_Y - 10);
    ctx.stroke();
    ctx.restore();
    drawSign(ctx, x - 20, top - 30, 'BARN');
  } else if (kind === 'kitchenDoor') {
    ctx.fillStyle = '#6b3b1e';
    ctx.fillRect(x - 30, top, 30, GROUND_Y - top);
    // An autumn wreath on the farmhouse door.
    ctx.strokeStyle = '#c9611d';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(x - 15, top + 110, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#9e1f2f';
    ctx.fillRect(x - 20, top + 128, 10, 10);
    drawSign(ctx, x - 15, top - 30, 'KITCHEN');
  } else if (kind === 'backDoor') {
    ctx.fillStyle = '#6b3b1e';
    ctx.fillRect(x - 24, top, 24, GROUND_Y - top);
    drawSign(ctx, x - 12, top - 30, 'FREEDOM');
  }
}

function drawSign(ctx, x, y, text) {
  ctx.font = 'bold 18px Georgia, serif';
  const w = ctx.measureText(text).width + 24;
  ctx.fillStyle = '#f3e2c0';
  ctx.fillRect(x - w / 2, y, w, 28);
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - w / 2, y, w, 28);
  ctx.fillStyle = '#2b1608';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y + 20);
}
