import * as THREE from 'three';
import type { PopupLine, StoryPage } from '../story/storyData';

export type IngenuityMood = 'normal' | 'brave' | 'happy' | 'determined' | 'proud';

function configureColorTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createPopupTextTexture(
  lines: PopupLine[],
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const wrappedEntries: { text: string; color: string; fontSize: number }[] = [];
  const maxWidth = canvas.width - 180;

  for (const line of lines) {
    const baseSize = Math.round(92 * (line.scale ?? 1));
    ctx.font = `700 ${baseSize}px "Fredoka", "Plus Jakarta Sans", sans-serif`;
    const words = line.text.split(' ');
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        wrappedEntries.push({
          text: current,
          color: line.color ?? '#FFFFFF',
          fontSize: baseSize,
        });
        current = word;
      } else {
        current = test;
      }
    }
    if (current) {
      wrappedEntries.push({
        text: current,
        color: line.color ?? '#FFFFFF',
        fontSize: baseSize,
      });
    }
  }

  const lineGap = 24;
  const totalHeight = wrappedEntries.reduce(
    (sum, item, idx) => sum + item.fontSize * 1.12 + (idx > 0 ? lineGap : 0),
    0,
  );
  let y = Math.max(110, (canvas.height - totalHeight) * 0.56);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  for (const entry of wrappedEntries) {
    ctx.font = `700 ${entry.fontSize}px "Fredoka", "Plus Jakarta Sans", sans-serif`;

    ctx.save();
    ctx.shadowColor = 'rgba(10, 4, 8, 0.96)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.strokeStyle = '#18050A';
    ctx.lineWidth = Math.max(18, Math.round(entry.fontSize * 0.22));
    ctx.strokeText(entry.text, canvas.width / 2, y);
    ctx.restore();

    ctx.strokeStyle = '#260912';
    ctx.lineWidth = Math.max(10, Math.round(entry.fontSize * 0.12));
    ctx.strokeText(entry.text, canvas.width / 2, y);

    ctx.fillStyle = entry.color;
    ctx.fillText(entry.text, canvas.width / 2, y);

    y += entry.fontSize * 1.12 + lineGap;
  }

  const tex = configureColorTexture(canvas, maxAnisotropy);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function createCoverTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  // Rich dark red / burgundy leather book cover gradient
  const grad = ctx.createRadialGradient(512, 560, 80, 512, 640, 840);
  grad.addColorStop(0, '#6A1420');
  grad.addColorStop(0.55, '#4A0B14');
  grad.addColorStop(1, '#2B050B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1280);

  // Fine dark bookcloth grain
  ctx.fillStyle = 'rgba(255, 232, 200, 0.018)';
  for (let i = 0; i < 1280; i += 6) {
    ctx.fillRect(0, i, 1024, 1);
  }
  for (let i = 0; i < 1024; i += 6) {
    ctx.fillRect(i, 0, 1, 1280);
  }

  // Warm amber-gold glow behind central Mars medallion
  const glow = ctx.createRadialGradient(512, 700, 30, 512, 700, 340);
  glow.addColorStop(0, 'rgba(232, 197, 116, 0.16)');
  glow.addColorStop(0.55, 'rgba(220, 96, 62, 0.08)');
  glow.addColorStop(1, 'rgba(20, 4, 8, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 1280);

  // Burnished antique-gold foil double border frame
  ctx.strokeStyle = '#D5AC55';
  ctx.lineWidth = 8;
  ctx.strokeRect(54, 54, 916, 1172);
  ctx.strokeStyle = 'rgba(213, 172, 85, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(78, 78, 868, 1124);

  // Ornamental gold corner diamonds
  const cornerCoords = [
    [98, 98],
    [926, 98],
    [98, 1182],
    [926, 1182],
  ];
  ctx.fillStyle = '#D5AC55';
  for (const [cx, cy] of cornerCoords) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 12, cy);
    ctx.closePath();
    ctx.fill();
  }

  // Decorative Mars flight path rings around medallion
  ctx.save();
  ctx.translate(512, 700);
  ctx.strokeStyle = 'rgba(213, 172, 85, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 265, 160, -0.22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = 'rgba(255, 224, 180, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 310, 195, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Delicate champagne-gold stars on cover
  const stars = [
    [180, 170, 8],
    [840, 190, 9],
    [200, 960, 7],
    [820, 940, 9],
    [512, 145, 7],
    [160, 530, 6],
    [860, 520, 6],
  ];
  ctx.fillStyle = '#E8C574';
  for (const [sx, sy, sr] of stars) {
    ctx.beginPath();
    ctx.moveTo(sx, sy - sr * 1.6);
    ctx.lineTo(sx + sr * 0.4, sy - sr * 0.4);
    ctx.lineTo(sx + sr * 1.6, sy);
    ctx.lineTo(sx + sr * 0.4, sy + sr * 0.4);
    ctx.lineTo(sx, sy + sr * 1.6);
    ctx.lineTo(sx - sr * 0.4, sy + sr * 0.4);
    ctx.lineTo(sx - sr * 1.6, sy);
    ctx.lineTo(sx - sr * 0.4, sy - sr * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  // Cover Title Typography
  ctx.textAlign = 'center';
  ctx.fillStyle = '#E8C574';
  ctx.font = '700 98px "Fredoka", sans-serif';
  ctx.fillText('INGENUITY', 512, 286);
  ctx.font = '700 76px "Fredoka", sans-serif';
  ctx.fillStyle = '#F7EFE6';
  ctx.fillText('HELICOPTER', 512, 384);

  ctx.fillStyle = '#E9BEB5';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('A 3D Mars Pop-Up Adventure', 512, 456);

  ctx.fillStyle = '#E8C574';
  ctx.font = '600 32px "Fredoka", sans-serif';
  ctx.fillText('Narrated by Lily', 512, 1110);

  ctx.fillStyle = 'rgba(247, 239, 230, 0.76)';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CLICK TO OPEN BOOK', 512, 1168);

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createBackCoverTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#380810';
  ctx.fillRect(0, 0, 512, 640);
  ctx.strokeStyle = '#D5AC55';
  ctx.lineWidth = 5;
  ctx.strokeRect(28, 28, 456, 584);

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createSpreadPageTexture(
  side: 'left' | 'right',
  page: StoryPage,
  maxAnisotropy = 4,
  includeBackground = true,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  if (includeBackground) {
    // Deep indigo space with restrained nebula color behind the story content
    const bg = ctx.createLinearGradient(0, 0, 1024, 1280);
    bg.addColorStop(0, '#121B37');
    bg.addColorStop(0.55, '#0B1228');
    bg.addColorStop(1, '#080D1D');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 1280);

    const nebulae = [
      { x: 220, y: 270, radius: 360, color: 'rgba(75, 120, 225, 0.2)' },
      { x: 810, y: 720, radius: 430, color: 'rgba(133, 76, 195, 0.17)' },
      { x: 420, y: 1120, radius: 330, color: 'rgba(50, 142, 175, 0.13)' },
    ];
    for (const nebula of nebulae) {
      const glow = ctx.createRadialGradient(
        nebula.x,
        nebula.y,
        0,
        nebula.x,
        nebula.y,
        nebula.radius,
      );
      glow.addColorStop(0, nebula.color);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = 'rgba(155, 45, 50, 0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Seed the star positions by spread so revisiting a page keeps its artwork stable.
  let seed = ((page.index + 1) * 1103515245 + (side === 'left' ? 12345 : 67890)) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let i = 0; i < 150; i++) {
    const x = 56 + random() * 912;
    const y = 56 + random() * 1168;
    const radius = 0.5 + random() * 1.3;
    const opacity = 0.2 + random() * 0.55;

    ctx.fillStyle = `rgba(220, 232, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (random() > 0.93) {
      const flare = radius * 3.2;
      ctx.fillStyle = `rgba(235, 243, 255, ${opacity * 0.75})`;
      ctx.beginPath();
      ctx.moveTo(x, y - flare);
      ctx.lineTo(x + flare * 0.28, y - flare * 0.28);
      ctx.lineTo(x + flare, y);
      ctx.lineTo(x + flare * 0.28, y + flare * 0.28);
      ctx.lineTo(x, y + flare);
      ctx.lineTo(x - flare * 0.28, y + flare * 0.28);
      ctx.lineTo(x - flare, y);
      ctx.lineTo(x - flare * 0.28, y - flare * 0.28);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (includeBackground) {
    // Inner crease shading toward the spine
    const creaseGrad =
      side === 'left'
        ? ctx.createLinearGradient(860, 0, 1024, 0)
        : ctx.createLinearGradient(0, 0, 164, 0);
    if (side === 'left') {
      creaseGrad.addColorStop(0, 'rgba(10, 12, 20, 0)');
      creaseGrad.addColorStop(1, 'rgba(10, 12, 20, 0.42)');
      ctx.fillStyle = creaseGrad;
      ctx.fillRect(860, 0, 164, 1280);
    } else {
      creaseGrad.addColorStop(0, 'rgba(10, 12, 20, 0.42)');
      creaseGrad.addColorStop(1, 'rgba(10, 12, 20, 0)');
      ctx.fillStyle = creaseGrad;
      ctx.fillRect(0, 0, 164, 1280);
    }
  }

  // Subtle neutral-silver border & celestial compass lines
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.16)';
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, 912, 1168);

  ctx.save();
  ctx.translate(512, 640);
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.14)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.arc(0, 0, 290, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(213, 172, 85, 0.22)';
  ctx.beginPath();
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(226, 232, 240, 0.25)';
  const pts = [
    [130, 140],
    [890, 140],
    [130, 1120],
    [890, 1120],
  ];
  for (const [x, y] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#CBD2DF';
  ctx.font = '600 26px "Fredoka", sans-serif';
  if (side === 'left') {
    ctx.textAlign = 'left';
    ctx.fillText(page.chapterTitle, 84, 1185);
  } else {
    ctx.textAlign = 'right';
    ctx.fillText(`Page ${page.index}`, 940, 1185);
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createHelicopterFaceTexture(
  mood: IngenuityMood,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18121E';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(255, 210, 130, 0.06)';
  for (let y = 0; y < 256; y += 8) {
    ctx.fillRect(0, y, 512, 2);
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const leftX = 166;
  const rightX = 346;
  const eyeY = 118;

  if (mood === 'normal') {
    ctx.fillStyle = '#7CE8FF';
    ctx.beginPath();
    ctx.arc(leftX, eyeY, 34, 0, Math.PI * 2);
    ctx.arc(rightX, eyeY, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftX - 10, eyeY - 10, 11, 0, Math.PI * 2);
    ctx.arc(rightX - 10, eyeY - 10, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7CE8FF';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 152, 34, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (mood === 'brave') {
    // Fierce, adorable determined eyes + confident grin
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(leftX, eyeY + 8, 32, 0, Math.PI * 2);
    ctx.arc(rightX, eyeY + 8, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#18121E';
    // Angled determined brows
    ctx.beginPath();
    ctx.moveTo(leftX - 42, eyeY - 24);
    ctx.lineTo(leftX + 42, eyeY - 2);
    ctx.lineTo(leftX + 42, eyeY - 36);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rightX + 42, eyeY - 24);
    ctx.lineTo(rightX - 42, eyeY - 2);
    ctx.lineTo(rightX - 42, eyeY - 36);
    ctx.closePath();
    ctx.fill();
    // Bold brows
    ctx.strokeStyle = '#FF9E80';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(leftX - 36, eyeY - 26);
    ctx.lineTo(leftX + 34, eyeY - 6);
    ctx.moveTo(rightX + 36, eyeY - 26);
    ctx.lineTo(rightX - 34, eyeY - 6);
    ctx.stroke();
    // Brave grin
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(256, 156, 40, 0.15, Math.PI - 0.15);
    ctx.stroke();
  } else if (mood === 'happy') {
    ctx.strokeStyle = '#80FFDB';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(leftX, eyeY + 14, 34, Math.PI + 0.3, -0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightX, eyeY + 14, 34, Math.PI + 0.3, -0.3);
    ctx.stroke();
    ctx.fillStyle = '#80FFDB';
    ctx.beginPath();
    ctx.arc(256, 152, 42, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 138, 170, 0.7)';
    ctx.beginPath();
    ctx.arc(105, 165, 18, 0, Math.PI * 2);
    ctx.arc(407, 165, 18, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'determined') {
    ctx.fillStyle = '#7CE8FF';
    ctx.beginPath();
    ctx.arc(leftX, eyeY, 30, 0, Math.PI * 2);
    ctx.arc(rightX, eyeY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(leftX - 30, eyeY - 36);
    ctx.lineTo(leftX + 26, eyeY - 24);
    ctx.moveTo(rightX + 30, eyeY - 36);
    ctx.lineTo(rightX - 26, eyeY - 24);
    ctx.stroke();
    ctx.strokeStyle = '#7CE8FF';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(212, 174);
    ctx.quadraticCurveTo(256, 196, 300, 170);
    ctx.stroke();
  } else if (mood === 'proud') {
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(leftX, eyeY + 10, 32, Math.PI + 0.25, -0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightX, eyeY + 10, 32, Math.PI + 0.25, -0.25);
    ctx.stroke();
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(256, 148, 44, 0.1, Math.PI - 0.1);
    ctx.fill();
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createSolarPanelTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#122E6E';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#4B8BFA';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(210, 232, 255, 0.35)';
  ctx.lineWidth = 2;
  for (let x = 32; x < 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createEarthTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const ocean = ctx.createLinearGradient(0, 0, 0, 256);
  ocean.addColorStop(0, '#1D74D1');
  ocean.addColorStop(0.5, '#1B8BE8');
  ocean.addColorStop(1, '#155AA8');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#4CCB6C';
  const blobs = [
    [90, 95, 55, 38],
    [130, 145, 38, 45],
    [255, 88, 65, 34],
    [290, 138, 45, 42],
    [395, 105, 58, 40],
    [415, 175, 36, 26],
  ];
  for (const [bx, by, rx, ry] of blobs) {
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#EEF8FF';
  ctx.fillRect(0, 0, 512, 22);
  ctx.fillRect(0, 234, 512, 22);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 14; i++) {
    const cx = (i * 41 + 20) % 512;
    const cy = 40 + ((i * 53) % 176);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 34, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createMarsTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const marsGrad = ctx.createLinearGradient(0, 0, 0, 256);
  marsGrad.addColorStop(0, '#C85A32');
  marsGrad.addColorStop(0.5, '#D86D40');
  marsGrad.addColorStop(1, '#B44B27');
  ctx.fillStyle = marsGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Dark volcanic plains
  ctx.fillStyle = 'rgba(92, 32, 16, 0.45)';
  const plains = [
    [110, 120, 72, 32],
    [260, 150, 88, 28],
    [400, 96, 65, 34],
  ];
  for (const [x, y, rx, ry] of plains) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dusty bright craters
  for (let i = 0; i < 20; i++) {
    const x = (i * 73 + 25) % 490;
    const y = 36 + ((i * 47) % 184);
    const r = 8 + (i % 14);
    ctx.fillStyle = 'rgba(130, 48, 22, 0.55)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 195, 145, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, -0.5, 2.1);
    ctx.stroke();
  }

  // Polar ice caps
  ctx.fillStyle = '#FCEEE6';
  ctx.fillRect(0, 0, 512, 16);
  ctx.fillRect(0, 240, 512, 16);

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createMarsRockTexture(
  baseHex = '#B85635',
  craterHex = '#7C321B',
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 140; i++) {
    const x = (i * 173) % 512;
    const y = (i * 257) % 512;
    const r = 8 + (i % 24);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,215,180,0.07)' : 'rgba(40,10,4,0.1)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 24; i++) {
    const x = 32 + ((i * 97) % 448);
    const y = 32 + ((i * 139) % 448);
    const r = 12 + ((i * 7) % 26);
    ctx.fillStyle = craterHex;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createBadgeTexture(
  label: string,
  bgHex: string,
  textHex: string,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = textHex;
  ctx.lineWidth = 12;
  ctx.strokeRect(14, 14, 484, 228);

  ctx.fillStyle = textHex;
  ctx.font = '700 84px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 128);

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createGlowSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return configureColorTexture(canvas, 1);
}
