import * as THREE from 'three';
import type { PopupLine, StoryPage } from '../story/storyData';

export type ProbeMood = 'normal' | 'happy' | 'shocked' | 'crying' | 'smug' | 'sleepy';

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
    ctx.shadowColor = 'rgba(10, 4, 22, 0.96)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.strokeStyle = '#120524';
    ctx.lineWidth = Math.max(18, Math.round(entry.fontSize * 0.22));
    ctx.strokeText(entry.text, canvas.width / 2, y);
    ctx.restore();

    ctx.strokeStyle = '#1F0B3B';
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

  // Rich dark purple / royal plum leather book cover gradient
  const grad = ctx.createRadialGradient(512, 560, 80, 512, 640, 840);
  grad.addColorStop(0, '#44196E');
  grad.addColorStop(0.55, '#2B0D4A');
  grad.addColorStop(1, '#160529');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1280);

  // Fine dark bookcloth grain
  ctx.fillStyle = 'rgba(240, 220, 255, 0.02)';
  for (let i = 0; i < 1280; i += 6) {
    ctx.fillRect(0, i, 1024, 1);
  }
  for (let i = 0; i < 1024; i += 6) {
    ctx.fillRect(i, 0, 1, 1280);
  }

  // Soft violet-gold glow behind central asteroid medallion
  const glow = ctx.createRadialGradient(512, 700, 30, 512, 700, 340);
  glow.addColorStop(0, 'rgba(232, 197, 116, 0.16)');
  glow.addColorStop(0.55, 'rgba(168, 85, 247, 0.12)');
  glow.addColorStop(1, 'rgba(18, 5, 36, 0)');
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

  // Decorative asteroid orbit rings around medallion
  ctx.save();
  ctx.translate(512, 700);
  ctx.strokeStyle = 'rgba(213, 172, 85, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 265, 160, -0.22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = 'rgba(226, 196, 255, 0.35)';
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
  ctx.font = '700 92px "Fredoka", sans-serif';
  ctx.fillText('NEAR', 512, 274);
  ctx.font = '700 78px "Fredoka", sans-serif';
  ctx.fillStyle = '#F7EFE6';
  ctx.fillText('SHOEMAKER', 512, 366);

  ctx.fillStyle = '#E2CEF8';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("Jacob & Lily's Asteroid Adventure", 512, 446);

  ctx.fillStyle = '#E8C574';
  ctx.font = '600 32px "Fredoka", sans-serif';
  ctx.fillText('The Probe Who Landed on Eros', 512, 1110);

  ctx.fillStyle = 'rgba(247, 239, 230, 0.78)';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CLICK TO OPEN BOOK', 512, 1168);

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createBackCoverTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#200838';
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
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  // Calm matte deep plum-violet spread tone, one step lighter than the dark purple cover
  const bg = ctx.createLinearGradient(0, 0, 1024, 1280);
  bg.addColorStop(0, '#3D1E5E');
  bg.addColorStop(1, '#291244');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1280);

  ctx.fillStyle = 'rgba(240, 225, 255, 0.015)';
  for (let i = 0; i < 1280; i += 8) {
    ctx.fillRect(0, i, 1024, 2);
  }

  const creaseGrad =
    side === 'left'
      ? ctx.createLinearGradient(860, 0, 1024, 0)
      : ctx.createLinearGradient(0, 0, 164, 0);
  if (side === 'left') {
    creaseGrad.addColorStop(0, 'rgba(12, 4, 24, 0)');
    creaseGrad.addColorStop(1, 'rgba(12, 4, 24, 0.48)');
    ctx.fillStyle = creaseGrad;
    ctx.fillRect(860, 0, 164, 1280);
  } else {
    creaseGrad.addColorStop(0, 'rgba(12, 4, 24, 0.48)');
    creaseGrad.addColorStop(1, 'rgba(12, 4, 24, 0)');
    ctx.fillStyle = creaseGrad;
    ctx.fillRect(0, 0, 164, 1280);
  }

  ctx.strokeStyle = 'rgba(232, 212, 255, 0.18)';
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, 912, 1168);

  ctx.save();
  ctx.translate(512, 640);
  ctx.strokeStyle = 'rgba(232, 212, 255, 0.14)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.arc(0, 0, 290, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(213, 172, 85, 0.24)';
  ctx.beginPath();
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(232, 212, 255, 0.25)';
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

  ctx.fillStyle = '#E5D4F7';
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

export function createProbeFaceTexture(
  mood: ProbeMood,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#120C22';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(216, 180, 254, 0.07)';
  for (let y = 0; y < 256; y += 8) {
    ctx.fillRect(0, y, 512, 2);
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const leftX = 166;
  const rightX = 346;
  const eyeY = 112;

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
    ctx.arc(256, 154, 34, 0.2, Math.PI - 0.2);
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
    ctx.fillStyle = 'rgba(255, 138, 190, 0.75)';
    ctx.beginPath();
    ctx.arc(105, 165, 18, 0, Math.PI * 2);
    ctx.arc(407, 165, 18, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'shocked') {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftX, eyeY, 40, 0, Math.PI * 2);
    ctx.arc(rightX, eyeY, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(leftX, eyeY, 13, 0, Math.PI * 2);
    ctx.arc(rightX, eyeY, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF9E80';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.ellipse(256, 184, 24, 30, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mood === 'crying') {
    // Sad closed/squeezed eyes + blue tears
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(leftX, eyeY + 14, 28, Math.PI + 0.35, -0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightX, eyeY + 14, 28, Math.PI + 0.35, -0.35);
    ctx.stroke();

    // Streaming tear waterfalls
    ctx.fillStyle = '#60A5FA';
    ctx.fillRect(leftX - 12, eyeY + 20, 24, 88);
    ctx.fillRect(rightX - 12, eyeY + 20, 24, 88);
    ctx.beginPath();
    ctx.arc(leftX, eyeY + 110, 16, 0, Math.PI * 2);
    ctx.arc(rightX, eyeY + 110, 16, 0, Math.PI * 2);
    ctx.fill();

    // Wavy sad frown
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(256, 198, 30, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else if (mood === 'smug') {
    // Cool dark sunglasses + confident smirk!
    ctx.fillStyle = '#FFE066';
    ctx.fillRect(108, 72, 128, 72);
    ctx.fillRect(276, 72, 128, 72);
    ctx.fillRect(236, 94, 40, 14);
    ctx.fillStyle = '#0F0720';
    ctx.fillRect(116, 80, 112, 56);
    ctx.fillRect(284, 80, 112, 56);
    // Cool lens shine
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(132, 92);
    ctx.lineTo(164, 124);
    ctx.moveTo(300, 92);
    ctx.lineTo(332, 124);
    ctx.stroke();
    // Smug crooked grin
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(212, 182);
    ctx.quadraticCurveTo(266, 204, 314, 160);
    ctx.stroke();
  } else if (mood === 'sleepy') {
    ctx.strokeStyle = '#D8B4FE';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(leftX, eyeY + 8, 30, 0.25, Math.PI - 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightX, eyeY + 8, 30, 0.25, Math.PI - 0.25);
    ctx.stroke();
    ctx.strokeStyle = '#D8B4FE';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(256, 174, 22, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.fillStyle = '#D8B4FE';
    ctx.font = '700 36px "Fredoka", sans-serif';
    ctx.fillText('z', 415, 72);
    ctx.font = '700 24px "Fredoka", sans-serif';
    ctx.fillText('z', 445, 50);
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createSolarPanelTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#132B6B';
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

export function createScanChartTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#190A2E';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = 'rgba(216, 180, 254, 0.22)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Mini Eros silhouette + glowing scan wave
  ctx.fillStyle = 'rgba(232, 197, 116, 0.35)';
  ctx.beginPath();
  ctx.ellipse(150, 128, 72, 34, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#80FFDB';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let x = 230; x <= 485; x += 8) {
    const y = 128 + Math.sin(x * 0.07) * 44 + Math.cos(x * 0.14) * 18;
    if (x === 230) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#D5AC55';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 248);

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

export function createAsteroidTexture(
  baseHex = '#9E9082',
  craterHex = '#665A4F',
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 160; i++) {
    const x = (i * 173) % 512;
    const y = (i * 257) % 512;
    const r = 8 + (i % 24);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,245,230,0.08)' : 'rgba(20,14,26,0.12)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 28; i++) {
    const x = 32 + ((i * 97) % 448);
    const y = 32 + ((i * 139) % 448);
    const r = 12 + ((i * 7) % 28);
    ctx.fillStyle = craterHex;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 240, 220, 0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, -0.4, 2.0);
    ctx.stroke();
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
  ctx.font = '700 72px "Fredoka", sans-serif';
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
