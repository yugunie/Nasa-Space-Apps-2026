import * as THREE from 'three';
import { Chapter } from '../types/story';

/**
 * Creates high-resolution procedural canvas textures for the 3D book cover, pages, and gilded edges.
 * Adheres to Three.js r160+ SRGBColorSpace and high anisotropy rules.
 */

// Helper to draw gold foil filigree corner
function drawGoldCorner(ctx: CanvasRenderingContext2D, x: number, y: number, scaleX: number, scaleY: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.strokeStyle = '#dfb76c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(120, 10);
  ctx.arcTo(10, 10, 10, 120, 30);
  ctx.stroke();

  ctx.strokeStyle = '#f8e4a0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(25, 25);
  ctx.lineTo(80, 25);
  ctx.arcTo(25, 25, 25, 80, 20);
  ctx.stroke();

  // Little star accent
  ctx.fillStyle = '#ffdf79';
  ctx.beginPath();
  ctx.arc(35, 35, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Procedural Front Cover Texture:
 * Ornate astral obsidian leather, gold foil concentric astronomical rings, constellation starmap,
 * embossed golden title "ASTROCHRONICON"
 */
export function createCoverTexture(isFront: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // 1. Base deep space leather background
  const grad = ctx.createRadialGradient(1024, 1024, 100, 1024, 1024, 1400);
  grad.addColorStop(0, '#0c1022');
  grad.addColorStop(0.5, '#070a16');
  grad.addColorStop(1, '#030408');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Subtle leather noise grain
  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Ornate outer gold foil frame
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 8;
  ctx.strokeRect(80, 80, 1888, 1888);

  ctx.strokeStyle = '#aa820a';
  ctx.lineWidth = 3;
  ctx.strokeRect(100, 100, 1848, 1848);

  ctx.strokeStyle = '#f5d77f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(120, 120, 1808, 1808);

  // Four filigree corners
  drawGoldCorner(ctx, 80, 80, 1, 1);
  drawGoldCorner(ctx, 1968, 80, -1, 1);
  drawGoldCorner(ctx, 80, 1968, 1, -1);
  drawGoldCorner(ctx, 1968, 1968, -1, -1);

  if (isFront) {
    // 3. Central Astrolabe / Celestial Armillary Rings
    const cx = 1024;
    const cy = 1024;

    // Glowing nebula backdrop behind armillary sphere
    const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 500);
    glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    glowGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 500, 0, Math.PI * 2);
    ctx.fill();

    // Concentric gold astronomical rings
    const ringRadii = [480, 440, 390, 320, 240, 160, 80];
    ringRadii.forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx % 2 === 0 ? '#d4af37' : '#aa820a';
      ctx.lineWidth = idx === 0 || idx === 2 ? 4 : 2;
      ctx.stroke();
    });

    // Ring tick marks & celestial coordinates
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const r1 = 440;
      const r2 = deg % 30 === 0 ? 465 : deg % 15 === 0 ? 455 : 448;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
      ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
      ctx.strokeStyle = '#fbe396';
      ctx.lineWidth = deg % 30 === 0 ? 3 : 1.5;
      ctx.stroke();
    }

    // Constellation lines & stars inside central sphere
    const stars = [
      { x: cx - 180, y: cy - 120, r: 4 },
      { x: cx - 100, y: cy - 200, r: 6 },
      { x: cx + 50, y: cy - 240, r: 5 },
      { x: cx + 190, y: cy - 110, r: 4.5 },
      { x: cx + 150, y: cy + 120, r: 5 },
      { x: cx - 30, y: cy + 180, r: 6 },
      { x: cx - 160, y: cy + 90, r: 4 },
      { x: cx, y: cy, r: 8 }, // Center Star
    ];

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(stars[0].x, stars[0].y);
    for (let i = 1; i < stars.length; i++) {
      ctx.lineTo(stars[i].x, stars[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    stars.forEach(s => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Halo
      ctx.fillStyle = 'rgba(251, 227, 150, 0.4)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Gold embossed typography
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Subtitle top
    ctx.font = '600 36px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#aa820a';
    ctx.fillText('LIBER STELLARIS · CODEX PRIMA', cx, 280);

    // Main Title
    ctx.font = '900 110px "Cinzel", Georgia, serif';
    // Shadow/emboss effect
    ctx.fillStyle = '#3a2700';
    ctx.fillText('ASTROCHRONICON', cx + 3, 410 + 3);

    const titleGrad = ctx.createLinearGradient(cx - 500, 380, cx + 500, 420);
    titleGrad.addColorStop(0, '#f9e7a2');
    titleGrad.addColorStop(0.3, '#d4af37');
    titleGrad.addColorStop(0.7, '#ffdf79');
    titleGrad.addColorStop(1, '#aa820a');
    ctx.fillStyle = titleGrad;
    ctx.fillText('ASTROCHRONICON', cx, 410);

    // Subtitle bottom
    ctx.font = '500 42px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('CHRONICLES OF THE CELESTIAL VOID', cx, 490);

    // Bottom prompt / insignia
    ctx.font = '600 34px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(223, 183, 108, 0.85)';
    ctx.fillText('✦ CLICK TO OPEN THE GRIMOIRE ✦', cx, 1680);

    ctx.font = '400 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.fillText('AN INTERACTIVE THREE.JS & GSAP CELESTIAL EXPEDITION', cx, 1740);
  } else {
    // Back cover emblem
    const cx = 1024;
    const cy = 1024;
    ctx.textAlign = 'center';
    ctx.font = '700 50px "Cinzel", serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('ARCHIVES OF THE COSMOS', cx, cy - 40);

    ctx.font = '400 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('SECTOR SOL · EXPEDITION VOYAGER III', cx, cy + 30);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates texture for the book spine with ribs and gold lettering
 */
export function createSpineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Dark leather
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#04060c');
  grad.addColorStop(0.5, '#0b1020');
  grad.addColorStop(1, '#04060c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 2048);

  // Gold spine ribs
  const ribY = [250, 650, 1050, 1450, 1850];
  ribY.forEach(y => {
    ctx.fillStyle = '#aa820a';
    ctx.fillRect(40, y - 6, 432, 12);
    ctx.fillStyle = '#f8e4a0';
    ctx.fillRect(40, y - 2, 432, 4);
  });

  // Vertical text
  ctx.save();
  ctx.translate(256, 1024);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 64px "Cinzel", serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('ASTROCHRONICON · VOL. I', 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates gilded gold page edge texture
 */
export function createGildedEdgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Gold base
  ctx.fillStyle = '#c59d28';
  ctx.fillRect(0, 0, 512, 512);

  // Fine striations representing individual gilded sheets
  for (let y = 0; y < 512; y += 2) {
    const brightness = Math.sin(y * 0.4) * 20 + (Math.random() - 0.5) * 35;
    const r = Math.min(255, Math.max(0, 215 + brightness));
    const g = Math.min(255, Math.max(0, 175 + brightness * 0.8));
    const b = Math.min(255, Math.max(0, 55 + brightness * 0.4));
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates left page texture with deep cosmic parchment, chapter narrative, and storyline trigger
 */
export function createLeftPageTexture(chapter: Chapter): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark astral parchment background
  const bgGrad = ctx.createLinearGradient(0, 0, 1536, 2048);
  bgGrad.addColorStop(0, '#0a0d18');
  bgGrad.addColorStop(0.5, '#070912');
  bgGrad.addColorStop(1, '#04050a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1536, 2048);

  // Inner spine shadow (darkening on right edge of left page)
  const spineShadow = ctx.createLinearGradient(1300, 0, 1536, 0);
  spineShadow.addColorStop(0, 'rgba(0,0,0,0)');
  spineShadow.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = spineShadow;
  ctx.fillRect(1300, 0, 236, 2048);

  // Subtle starmap watermark grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 100; x < 1400; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, 1948);
    ctx.stroke();
  }
  for (let y = 100; y < 1950; y += 120) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(1400, y);
    ctx.stroke();
  }

  // Thin outer gold border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(90, 90, 1356, 1868);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.strokeRect(105, 105, 1326, 1838);

  // Chapter header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d4af37';
  ctx.font = '700 28px "Space Grotesk", sans-serif';
  ctx.fillText(`CHAPTER ${chapter.romanNumeral} · CHRONICLES`, 140, 180);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 22px "Space Grotesk", sans-serif';
  ctx.fillText(chapter.leftPageSubtitle, 140, 220);

  // Main Page Title
  ctx.font = '800 68px "Cinzel", serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(chapter.leftPageTitle, 140, 310);

  // Accent divider line
  const dividerGrad = ctx.createLinearGradient(140, 0, 1300, 0);
  dividerGrad.addColorStop(0, '#d4af37');
  dividerGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
  dividerGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.strokeStyle = dividerGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(140, 360);
  ctx.lineTo(1300, 360);
  ctx.stroke();

  // Story body paragraphs
  let currentY = 460;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 36px "Outfit", serif';

  chapter.leftPageText.forEach((paragraph, idx) => {
    // Drop cap for first paragraph
    if (idx === 0) {
      ctx.font = '800 110px "Cinzel", serif';
      ctx.fillStyle = '#d4af37';
      const firstChar = paragraph.charAt(0);
      ctx.fillText(firstChar, 140, currentY + 40);

      // Remaining paragraph text wrapped
      ctx.font = '400 34px "Outfit", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      const words = paragraph.slice(1).split(' ');
      let line = '';
      let lineY = currentY - 30;
      let isFirstLine = true;
      for (const word of words) {
        const testLine = line + word + ' ';
        const maxW = isFirstLine ? 1040 : 1180;
        const startX = isFirstLine ? 260 : 140;
        if (ctx.measureText(testLine).width > maxW) {
          ctx.fillText(line, startX, lineY);
          line = word + ' ';
          lineY += 52;
          isFirstLine = false;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, isFirstLine ? 260 : 140, lineY);
      currentY = lineY + 90;
    } else {
      ctx.font = '400 34px "Outfit", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const words = paragraph.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > 1180) {
          ctx.fillText(line, 140, currentY);
          line = word + ' ';
          currentY += 52;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 140, currentY);
      currentY += 75;
    }
  });

  // Storyline interactive trigger card drawn onto the canvas
  const cardY = 1260;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = chapter.storyline.accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(140, cardY, 1180, 420, 16);
  ctx.fill();
  ctx.stroke();

  // Storyline badge
  ctx.fillStyle = chapter.storyline.accentColor;
  ctx.font = '700 22px "Space Grotesk", sans-serif';
  ctx.fillText('✦ INTERACTIVE STORYLINE ARCHIVE', 180, cardY + 60);

  // Storyline Title inside card
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px "Space Grotesk", sans-serif';
  ctx.fillText(chapter.storyline.title, 180, cardY + 130);

  // Summary preview
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px "Outfit", sans-serif';
  ctx.fillText(chapter.storyline.summary.slice(0, 75) + '...', 180, cardY + 190);

  // Holographic trigger button banner inside card
  ctx.fillStyle = chapter.storyline.accentColor;
  ctx.beginPath();
  ctx.roundRect(180, cardY + 250, 1100, 110, 12);
  ctx.fill();

  ctx.fillStyle = '#05070e';
  ctx.font = '800 32px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⤢  CLICK TO OPEN VIRTUAL HOLOGRAPHIC SCREEN', 180 + 550, cardY + 318);
  ctx.textAlign = 'left';

  // Bottom archival reference
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 24px "Space Grotesk", sans-serif';
  ctx.fillText(chapter.leftPageNote, 140, 1840);

  // Page number
  ctx.fillStyle = '#d4af37';
  ctx.font = '700 30px "Cinzel", serif';
  ctx.fillText(`—  ${chapter.id * 2 - 1}  —`, 700, 1890);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates right page canvas texture (viewfinder frame, telemetry HUD, illustration mount)
 */
export function createRightPageTexture(chapter: Chapter): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark astral parchment background
  const bgGrad = ctx.createLinearGradient(0, 0, 1536, 2048);
  bgGrad.addColorStop(0, '#0a0d18');
  bgGrad.addColorStop(0.5, '#070912');
  bgGrad.addColorStop(1, '#04050a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1536, 2048);

  // Inner spine shadow (darkening on left edge of right page)
  const spineShadow = ctx.createLinearGradient(0, 0, 236, 0);
  spineShadow.addColorStop(0, 'rgba(0,0,0,0.65)');
  spineShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineShadow;
  ctx.fillRect(0, 0, 236, 2048);

  // Outer gold borders
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(90, 90, 1356, 1868);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.strokeRect(105, 105, 1326, 1838);

  // Right page header
  ctx.textAlign = 'right';
  ctx.fillStyle = '#d4af37';
  ctx.font = '700 24px "Space Grotesk", sans-serif';
  ctx.fillText('CELESTIAL CARTOGRAPHY & KINEMATICS', 1396, 180);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 20px "Space Grotesk", sans-serif';
  ctx.fillText('REAL-TIME 3D PHENOMENON VIEWPORT', 1396, 215);

  ctx.font = '800 56px "Cinzel", serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(chapter.rightPageTitle, 1396, 290);
  ctx.textAlign = 'left';

  // Celestial Circular Viewport Frame (for the interactive illustration)
  const cx = 768;
  const cy = 880;
  const radius = 480;

  // Viewport glow
  const viewGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, radius);
  viewGlow.addColorStop(0, 'rgba(15, 23, 42, 0.6)');
  viewGlow.addColorStop(0.8, 'rgba(2, 6, 23, 0.95)');
  viewGlow.addColorStop(1, '#020617');
  ctx.fillStyle = viewGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Astro ring calipers
  ctx.strokeStyle = chapter.storyline.accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 25, 0, Math.PI * 2);
  ctx.stroke();

  // Angle ticks around circle
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const r1 = radius + 25;
    const r2 = deg % 30 === 0 ? radius + 45 : radius + 35;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
    ctx.strokeStyle = deg % 30 === 0 ? chapter.storyline.accentColor : 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = deg % 30 === 0 ? 2 : 1;
    ctx.stroke();
  }

  // Crosshairs
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - radius + 40, cy);
  ctx.lineTo(cx + radius - 40, cy);
  ctx.moveTo(cx, cy - radius + 40);
  ctx.lineTo(cx, cy + radius - 40);
  ctx.stroke();

  // Interactive Prompt Banner beneath viewport
  ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(140, 1460, 1256, 130, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = chapter.storyline.accentColor;
  ctx.font = '700 24px "Space Grotesk", sans-serif';
  ctx.fillText('✦ INTERACTIVE PHENOMENON CONTROL', 180, 1510);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '400 28px "Outfit", sans-serif';
  ctx.fillText(chapter.storyline.interactivePrompt, 180, 1555);

  // Telemetry quick specs row
  const specs = [
    { label: 'COORDINATES', val: chapter.storyline.telemetry.coordinates.split('|')[0].trim() },
    { label: 'DISTANCE', val: chapter.storyline.telemetry.distanceLightYears },
    { label: 'CLASS', val: chapter.storyline.telemetry.stellarClass.split(' ')[0] },
  ];

  specs.forEach((s, i) => {
    const x = 160 + i * 420;
    const y = 1640;
    ctx.fillStyle = '#64748b';
    ctx.font = '600 20px "Space Grotesk", sans-serif';
    ctx.fillText(s.label, x, y);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 26px "Space Grotesk", sans-serif';
    ctx.fillText(s.val, x, y + 36);
  });

  // Storyline quick launch button on the right page as well
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = chapter.storyline.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(140, 1720, 1256, 100, 10);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = chapter.storyline.accentColor;
  ctx.font = '800 28px "Space Grotesk", sans-serif';
  ctx.fillText('⤢  CLICK TO EXPAND FULL STORYLINE & TELEMETRY SCREEN', cx, 1780);
  ctx.textAlign = 'left';

  // Page number
  ctx.fillStyle = '#d4af37';
  ctx.font = '700 30px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText(`—  ${chapter.id * 2}  —`, cx, 1890);
  ctx.textAlign = 'left';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
