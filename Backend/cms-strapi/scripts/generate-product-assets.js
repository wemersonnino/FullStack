'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, '..', 'data', 'uploads');

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function createCanvas(width, height, bg = [248, 250, 252, 255]) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = bg[0];
    pixels[i + 1] = bg[1];
    pixels[i + 2] = bg[2];
    pixels[i + 3] = bg[3];
  }
  return { width, height, pixels };
}

function setPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
  const alpha = color[3] / 255;
  canvas.pixels[index] = Math.round(color[0] * alpha + canvas.pixels[index] * (1 - alpha));
  canvas.pixels[index + 1] = Math.round(color[1] * alpha + canvas.pixels[index + 1] * (1 - alpha));
  canvas.pixels[index + 2] = Math.round(color[2] * alpha + canvas.pixels[index + 2] * (1 - alpha));
  canvas.pixels[index + 3] = 255;
}

function rect(canvas, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setPixel(canvas, xx, yy, color);
  }
}

function roundRect(canvas, x, y, w, h, radius, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const dx = xx < x + radius ? x + radius - xx : xx > x + w - radius ? xx - (x + w - radius) : 0;
      const dy = yy < y + radius ? y + radius - yy : yy > y + h - radius ? yy - (y + h - radius) : 0;
      if (dx * dx + dy * dy <= radius * radius) setPixel(canvas, xx, yy, color);
    }
  }
}

function line(canvas, x1, y1, x2, y2, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    setPixel(canvas, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, color);
  }
}

function gradient(canvas, start, end) {
  for (let y = 0; y < canvas.height; y += 1) {
    const t = y / canvas.height;
    const color = start.map((value, index) => Math.round(value + (end[index] - value) * t));
    rect(canvas, 0, y, canvas.width, 1, [color[0], color[1], color[2], 255]);
  }
}

function drawScheduleGrid(canvas, x, y, cols, rows, cellW, cellH) {
  rect(canvas, x, y, cols * cellW, rows * cellH, [255, 255, 255, 235]);
  for (let c = 0; c <= cols; c += 1) line(canvas, x + c * cellW, y, x + c * cellW, y + rows * cellH, [203, 213, 225, 255]);
  for (let r = 0; r <= rows; r += 1) line(canvas, x, y + r * cellH, x + cols * cellW, y + r * cellH, [203, 213, 225, 255]);

  const colors = [
    [20, 184, 166, 235],
    [37, 99, 235, 230],
    [245, 158, 11, 230],
    [100, 116, 139, 220],
  ];
  for (let r = 1; r < rows; r += 1) {
    for (let c = 1; c < cols; c += 1) {
      if ((r + c) % 5 === 0) continue;
      const color = colors[(r + c) % colors.length];
      roundRect(canvas, x + c * cellW + 9, y + r * cellH + 8, cellW - 18, cellH - 16, 6, color);
    }
  }
}

function drawDashboard(canvas, variant) {
  gradient(canvas, [8, 47, 73], [12, 74, 88]);
  roundRect(canvas, 92, 78, 1416, 744, 18, [255, 255, 255, 238]);
  roundRect(canvas, 132, 118, 300, 664, 12, [15, 23, 42, 245]);
  for (let i = 0; i < 8; i += 1) roundRect(canvas, 168, 166 + i * 64, 190 - (i % 3) * 28, 14, 7, [148, 163, 184, 170]);
  for (let i = 0; i < 5; i += 1) roundRect(canvas, 476 + i * 178, 126, 136, 74, 10, [[20, 184, 166, 230], [37, 99, 235, 220], [245, 158, 11, 220], [15, 118, 110, 220], [71, 85, 105, 220]][i]);
  drawScheduleGrid(canvas, 476, 238, 8, 8, 112, 54);
  roundRect(canvas, 476, 706, 390, 58, 9, [254, 243, 199, 255]);
  roundRect(canvas, 902, 706, 390, 58, 9, [204, 251, 241, 255]);
  if (variant === 'facilities') {
    for (let i = 0; i < 6; i += 1) {
      const cx = 1120 + Math.cos(i) * 120;
      const cy = 430 + Math.sin(i * 1.3) * 90;
      roundRect(canvas, cx, cy, 130, 52, 26, [20, 184, 166, 220]);
      line(canvas, 1188, 456, cx + 65, cy + 26, [14, 116, 144, 170]);
    }
  } else {
    for (let i = 0; i < 7; i += 1) {
      const bar = 68 + i * 24;
      roundRect(canvas, 1260 + i * 26, 610 - bar, 16, bar, 5, [20, 184, 166, 230]);
    }
  }
}

function writePng(canvas, fileName) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canvas.width, 0);
  ihdr.writeUInt32BE(canvas.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const rowStart = y * (canvas.width * 4 + 1);
    raw[rowStart] = 0;
    canvas.pixels.copy(raw, rowStart + 1, y * canvas.width * 4, (y + 1) * canvas.width * 4);
  }
  const png = Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, fileName), png);
  console.log(`generated ${fileName}`);
}

const hero = createCanvas(1600, 900);
drawDashboard(hero, 'monthly');
writePng(hero, 'escala-saas-hero-dashboard.png');

const facilities = createCanvas(1600, 900);
drawDashboard(facilities, 'facilities');
writePng(facilities, 'escala-saas-seguranca-facilities.png');

const reports = createCanvas(1600, 900);
drawDashboard(reports, 'reports');
roundRect(reports, 980, 250, 330, 330, 12, [241, 245, 249, 245]);
for (let i = 0; i < 8; i += 1) roundRect(reports, 1018, 290 + i * 32, 220 - (i % 4) * 24, 12, 6, [51, 65, 85, 170]);
writePng(reports, 'escala-saas-relatorios-contadores.png');
