import * as THREE from 'three';
import {
  createBackCoverTexture,
  createCoverTexture,
  createEarthTexture,
  createGlowSpriteTexture,
  createInstrumentFaceTexture,
  createMoonTexture,
  createSeismicChartTexture,
  type LabMood,
} from './textures';

export interface AlsepInstrumentRig {
  group: THREE.Group;
  beaconMesh: THREE.Mesh;
  setMood: (mood: LabMood) => void;
  dispose: () => void;
}

/**
 * 1. ALSEP Central Station: White/silver electronics box, cute visor screen,
 *    thermal sunshade top plate, tall mast with helical S-band antenna & glowing beacon.
 */
export function createAlsepCentralStation(maxAnisotropy = 4): AlsepInstrumentRig {
  const group = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.25,
    roughness: 0.4,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.85,
    roughness: 0.24,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.55,
    roughness: 0.4,
  });

  // Grounding base feet (y = 0)
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.06, 0.56), darkMat);
  basePlate.position.y = 0.03;
  basePlate.receiveShadow = true;
  group.add(basePlate);

  // Main Central Station Chassis
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.48), whiteMat);
  box.position.y = 0.28;
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);

  // Gold thermal top curtain & sunshield
  const sunShield = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.54), goldMat);
  sunShield.position.y = 0.52;
  group.add(sunShield);

  // Cute Face Screen on front (+Z)
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.05), darkMat);
  bezel.position.set(0, 0.29, 0.235);
  group.add(bezel);

  const moodTextures: Record<LabMood, THREE.CanvasTexture> = {
    normal: createInstrumentFaceTexture('normal', maxAnisotropy),
    happy: createInstrumentFaceTexture('happy', maxAnisotropy),
    listening: createInstrumentFaceTexture('listening', maxAnisotropy),
    sleepy: createInstrumentFaceTexture('sleepy', maxAnisotropy),
    proud: createInstrumentFaceTexture('proud', maxAnisotropy),
  };

  const faceMat = new THREE.MeshBasicMaterial({ map: moodTextures.normal });
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.2), faceMat);
  faceMesh.position.set(0, 0.29, 0.262);
  group.add(faceMesh);

  // Tall Helical S-Band Antenna Mast pointing back toward Earth
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.72, 10), whiteMat);
  mast.position.set(0, 0.88, -0.05);
  mast.castShadow = true;
  group.add(mast);

  const helixCoil = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 18), goldMat);
  helixCoil.rotation.x = Math.PI / 2;
  helixCoil.position.set(0, 1.15, -0.05);
  const helixCoil2 = helixCoil.clone();
  helixCoil2.position.y = 1.05;
  group.add(helixCoil, helixCoil2);

  const beaconMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 14, 14),
    new THREE.MeshStandardMaterial({
      color: 0x7ce8ff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
    }),
  );
  beaconMesh.position.set(0, 1.28, -0.05);
  group.add(beaconMesh);

  return {
    group,
    beaconMesh,
    setMood: (mood: LabMood) => {
      faceMat.map = moodTextures[mood];
      faceMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
    },
  };
}

/**
 * 2. ALSEP Passive Seismic Experiment (Moonquake Seismometer):
 *    Circular gold Mylar thermal skirt on lunar soil, silver cylindrical sensor core,
 *    dome cap, and expressive screen.
 */
export function createAlsepSeismometer(maxAnisotropy = 4): AlsepInstrumentRig {
  const group = new THREE.Group();

  const goldSkirtMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.78,
    roughness: 0.32,
  });
  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.65,
    roughness: 0.28,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.5,
    roughness: 0.4,
  });

  // Circular gold thermal blanket skirt resting flush at y = 0
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.56, 0.18, 24), goldSkirtMat);
  skirt.position.y = 0.09;
  skirt.castShadow = true;
  skirt.receiveShadow = true;
  group.add(skirt);

  // Inner sensor cylinder
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.34, 20), silverMat);
  drum.position.y = 0.28;
  drum.castShadow = true;
  group.add(drum);

  // Dome top cap
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    goldSkirtMat,
  );
  dome.position.y = 0.45;
  group.add(dome);

  // Cute sensor visor on front (+Z)
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 0.05), darkMat);
  bezel.position.set(0, 0.3, 0.24);
  group.add(bezel);

  const moodTextures: Record<LabMood, THREE.CanvasTexture> = {
    normal: createInstrumentFaceTexture('normal', maxAnisotropy),
    happy: createInstrumentFaceTexture('happy', maxAnisotropy),
    listening: createInstrumentFaceTexture('listening', maxAnisotropy),
    sleepy: createInstrumentFaceTexture('sleepy', maxAnisotropy),
    proud: createInstrumentFaceTexture('proud', maxAnisotropy),
  };
  const faceMat = new THREE.MeshBasicMaterial({ map: moodTextures.listening });
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.14), faceMat);
  faceMesh.position.set(0, 0.3, 0.268);
  group.add(faceMesh);

  // Little seismic needle/antenna on top
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.22, 8), silverMat);
  needle.position.y = 0.72;
  const beaconMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x80ffdb,
      emissive: 0x10b981,
      emissiveIntensity: 0.85,
    }),
  );
  beaconMesh.position.y = 0.84;
  group.add(needle, beaconMesh);

  return {
    group,
    beaconMesh,
    setMood: (mood: LabMood) => {
      faceMat.map = moodTextures[mood];
      faceMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
    },
  };
}

/**
 * 3. ALSEP Lunar Surface Magnetometer:
 *    Central gold-insulated body on 3 legs with 3 iconic splayed orthogonal sensor booms.
 */
export function createAlsepMagnetometer(maxAnisotropy = 4): AlsepInstrumentRig {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.82,
    roughness: 0.26,
  });
  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4f0,
    metalness: 0.65,
    roughness: 0.3,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.5,
    roughness: 0.4,
  });

  // 3 short legs (y = 0)
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.2, 8), silverMat);
    leg.position.set(Math.cos(a) * 0.16, 0.1, Math.sin(a) * 0.16);
    group.add(leg);
  }

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.32), goldMat);
  body.position.y = 0.28;
  body.castShadow = true;
  group.add(body);

  // Cute face screen
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.04), darkMat);
  bezel.position.set(0, 0.28, 0.16);
  group.add(bezel);

  const moodTextures: Record<LabMood, THREE.CanvasTexture> = {
    normal: createInstrumentFaceTexture('normal', maxAnisotropy),
    happy: createInstrumentFaceTexture('happy', maxAnisotropy),
    listening: createInstrumentFaceTexture('listening', maxAnisotropy),
    sleepy: createInstrumentFaceTexture('sleepy', maxAnisotropy),
    proud: createInstrumentFaceTexture('proud', maxAnisotropy),
  };
  const faceMat = new THREE.MeshBasicMaterial({ map: moodTextures.normal });
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.12), faceMat);
  faceMesh.position.set(0, 0.28, 0.182);
  group.add(faceMesh);

  // Three orthogonal sensor arms/booms with cylindrical fluxgate tips
  const boomAngles = [0.4, Math.PI - 0.4, -Math.PI / 2];
  for (const angle of boomAngles) {
    const boomGroup = new THREE.Group();
    boomGroup.position.y = 0.36;
    boomGroup.rotation.y = angle;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.46, 8), silverMat);
    arm.rotation.z = -0.95;
    arm.position.set(0.24, 0.14, 0);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 12), darkMat);
    tip.position.set(0.42, 0.26, 0);
    boomGroup.add(arm, tip);
    group.add(boomGroup);
  }

  const beaconMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
    }),
  );
  beaconMesh.position.set(0, 0.48, 0);
  group.add(beaconMesh);

  return {
    group,
    beaconMesh,
    setMood: (mood: LabMood) => {
      faceMat.map = moodTextures[mood];
      faceMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
    },
  };
}

/**
 * 4. SNAP-27 RTG Power Generator Unit (with cooling fins & dome)
 */
export function createAlsepRtg(): THREE.Group {
  const group = new THREE.Group();
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.65,
    roughness: 0.35,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.72,
    roughness: 0.3,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.85,
    roughness: 0.25,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.08, 16), darkMat);
  base.position.y = 0.04;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.44, 16), darkMat);
  core.position.y = 0.3;
  core.castShadow = true;
  group.add(base, core);

  // 8 Radial cooling fins
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.02), finMat);
    fin.position.y = 0.3;
    fin.rotation.y = (i * Math.PI) / 4;
    group.add(fin);
  }

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 14), goldMat);
  cap.position.y = 0.54;
  group.add(cap);

  return group;
}

/**
 * 5. Ribbon Cable connecting ALSEP instruments across the lunar surface
 */
export function createAlsepCable(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  color = 0xf59e0b,
): THREE.Mesh {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const len = Math.sqrt(dx * dx + dz * dz);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.015, 0.05),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
  );
  mesh.position.set((fromX + toX) / 2, 0.13, (fromZ + toZ) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  return mesh;
}

export interface LunarModuleRig {
  group: THREE.Group;
  thrusterGlow: THREE.Mesh;
}

export function createLunarModule(): LunarModuleRig {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf5b83d,
    metalness: 0.85,
    roughness: 0.25,
  });
  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.55,
    roughness: 0.34,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.5,
    roughness: 0.42,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.45,
    roughness: 0.15,
  });

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const legPivot = new THREE.Group();
    legPivot.position.set(0, 0.34, 0);
    legPivot.rotation.y = a;

    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.02, 0.62, 8), goldMat);
    strut.position.set(0.28, -0.17, 0);
    strut.rotation.z = 0.68;
    strut.castShadow = true;

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.04, 14), goldMat);
    pad.position.set(0.5, -0.32, 0);
    legPivot.add(strut, pad);
    group.add(legPivot);
  }

  const descentStage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 0.36, 8),
    goldMat,
  );
  descentStage.position.y = 0.52;
  descentStage.castShadow = true;
  descentStage.receiveShadow = true;
  group.add(descentStage);

  const engineBell = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.22, 16), darkMat);
  engineBell.position.y = 0.28;
  group.add(engineBell);

  const thrusterGlow = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.38, 12),
    new THREE.MeshBasicMaterial({
      color: 0x7ce8ff,
      transparent: true,
      opacity: 0.0,
    }),
  );
  thrusterGlow.rotation.x = Math.PI;
  thrusterGlow.position.y = 0.06;
  group.add(thrusterGlow);

  const ascentBody = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.52), silverMat);
  ascentBody.position.y = 0.91;
  ascentBody.castShadow = true;
  group.add(ascentBody);

  const winL = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.12), windowMat);
  winL.position.set(-0.12, 0.96, 0.265);
  winL.rotation.z = 0.18;
  const winR = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.12), windowMat);
  winR.position.set(0.12, 0.96, 0.265);
  winR.rotation.z = -0.18;

  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.04), darkMat);
  hatch.position.set(0, 0.79, 0.265);
  group.add(winL, winR, hatch);

  const dockPort = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 14), darkMat);
  dockPort.position.y = 1.16;
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.04, 0.06, 14), silverMat);
  dish.position.set(0.22, 1.24, 0.1);
  dish.rotation.z = -0.45;
  group.add(dockPort, dish);

  return { group, thrusterGlow };
}

export interface CharacterRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
}

export function createApolloAstronaut(
  isCommander: boolean,
  prop: 'none' | 'package' | 'mast' = 'none',
): CharacterRig {
  const group = new THREE.Group();
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
    metalness: 0.08,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: isCommander ? 0xe11d48 : 0x94a3b8,
    roughness: 0.4,
  });
  const goldVisorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.92,
    roughness: 0.14,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });

  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.18), darkMat);
  bootL.position.set(-0.08, 0.06, 0.02);
  const bootR = bootL.clone();
  bootR.position.x = 0.08;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.28, 6, 12), suitMat);
  torso.position.y = 0.36;
  torso.castShadow = true;

  const plss = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.16), suitMat);
  plss.position.set(0, 0.42, -0.18);
  plss.castShadow = true;

  const packStripe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.17), stripeMat);
  packStripe.position.set(0, 0.54, -0.18);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), suitMat);
  helmet.position.y = 0.72;
  helmet.castShadow = true;

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.175, 20, 16, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.2, Math.PI * 0.52),
    goldVisorMat,
  );
  visor.position.set(0, 0.72, 0.045);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 14), stripeMat);
  belt.position.y = 0.28;

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 0.5, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), suitMat);
  armL.position.y = -0.11;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, 0.5, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), suitMat);
  armR.position.y = -0.11;
  rightArm.add(armR);

  if (isCommander) {
    const bandL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), stripeMat);
    bandL.position.y = -0.1;
    leftArm.add(bandL);
    const bandR = bandL.clone();
    rightArm.add(bandR);
  }

  if (prop === 'package') {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), suitMat);
    rod.position.set(0, -0.26, 0.16);
    rod.rotation.x = 0.8;
    const pkg = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.18, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf4b942, metalness: 0.75, roughness: 0.28 }),
    );
    pkg.position.set(0, -0.36, 0.32);
    rightArm.add(rod, pkg);
  } else if (prop === 'mast') {
    const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 8), suitMat);
    tool.position.set(0, -0.14, 0.16);
    tool.rotation.x = -0.25;
    rightArm.add(tool);
  }

  group.add(bootL, bootR, torso, plss, packStripe, helmet, visor, belt, leftArm, rightArm);
  return { group, leftArm, rightArm };
}

export function createEarth(maxAnisotropy = 4): THREE.Group {
  const group = new THREE.Group();
  const earthTex = createEarthTexture(maxAnisotropy);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 32, 32),
    new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.6,
      metalness: 0.05,
    }),
  );
  globe.position.y = 0.72;
  globe.castShadow = true;
  globe.receiveShadow = true;
  group.add(globe);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.74, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  );
  halo.position.y = 0.72;
  group.add(halo);

  return group;
}

export function createMoonPlanet(maxAnisotropy = 4): THREE.Group {
  const group = new THREE.Group();
  const moonTex = createMoonTexture('#D0D7E3', '#909BB0', maxAnisotropy);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.85,
      metalness: 0.04,
    }),
  );
  globe.position.y = 0.76;
  globe.castShadow = true;
  globe.receiveShadow = true;
  group.add(globe);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    }),
  );
  halo.position.y = 0.76;
  group.add(halo);

  return group;
}

export function createLunarGround(
  variant: 'crater' | 'plains' | 'slope',
  maxAnisotropy = 4,
): THREE.Group {
  const group = new THREE.Group();
  const moonTex = createMoonTexture('#AEB6C4', '#798396', maxAnisotropy);
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.92,
    metalness: 0.03,
    flatShading: true,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.4, 0.12, 32), moonMat);
  base.position.y = 0.06;
  base.receiveShadow = true;
  group.add(base);

  if (variant === 'crater') {
    const rimGeo = new THREE.TorusGeometry(1.9, 0.24, 12, 32);
    const pos = rimGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const wave = 1 + 0.14 * Math.sin(x * 3.1 + y * 2.3);
      pos.setXYZ(i, x * wave, y * wave, z * (0.7 + 0.3 * Math.cos(x * 2)));
    }
    rimGeo.computeVertexNormals();
    const rim = new THREE.Mesh(rimGeo, moonMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.15;
    rim.castShadow = true;
    rim.receiveShadow = true;
    group.add(rim);
  } else {
    const moundOffsets: [number, number, number, number][] =
      variant === 'slope'
        ? [
            [-1.4, 0.24, -0.45, 0.65],
            [1.45, 0.2, -0.5, 0.55],
            [0.2, 0.14, 1.0, 0.35],
          ]
        : [
            [-1.5, 0.14, 0.65, 0.36],
            [1.5, 0.16, -0.55, 0.42],
          ];
    for (const [mx, my, mz, mr] of moundOffsets) {
      const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(mr, 1), moonMat);
      mound.scale.set(1.3, 0.52, 1.0);
      mound.position.set(mx, my, mz);
      mound.castShadow = true;
      mound.receiveShadow = true;
      group.add(mound);
    }
  }

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x7e8798,
    roughness: 0.92,
    flatShading: true,
  });
  const rocks: [number, number, number, number][] = [
    [-1.55, 0.2, 0.95, 0.14],
    [1.5, 0.2, 0.9, 0.16],
    [1.6, 0.18, -0.75, 0.13],
  ];
  for (const [rx, ry, rz, rs] of rocks) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), rockMat);
    rock.position.set(rx, ry, rz);
    rock.castShadow = true;
    group.add(rock);
  }

  return group;
}

export function createRadioDish(): THREE.Group {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.25,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });

  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.26, 12), baseMat);
  ped.position.y = 0.13;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.34, 10), baseMat);
  mast.position.y = 0.38;

  const dishPivot = new THREE.Group();
  dishPivot.position.y = 0.56;
  dishPivot.rotation.x = -0.65;
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.14, 0.03),
    new THREE.Vector2(0.32, 0.12),
  ];
  const dish = new THREE.Mesh(new THREE.LatheGeometry(pts, 22), dishMat);
  dish.rotation.x = Math.PI / 2;
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 }),
  );
  tip.position.z = 0.24;
  dishPivot.add(dish, tip);

  group.add(ped, mast, dishPivot);
  return group;
}

export function createSeismicMonitor(maxAnisotropy = 4): { mesh: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 }),
  );
  stand.position.y = 0.14;
  const chartTex = createSeismicChartTexture(maxAnisotropy);
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.48, 0.05),
    new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.3 }),
  );
  screen.position.y = 0.52;
  group.add(stand, screen);
  return { mesh: group, dispose: () => chartTex.dispose() };
}

export function createScientist(
  hairColor = 0x4a3525,
  shirtColor = 0x38bdf8,
  prop: 'none' | 'clipboard' | 'tablet' = 'none',
): CharacterRig {
  const group = new THREE.Group();
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6c9a5, roughness: 0.55 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  const shoes = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.09, 14), darkMat);
  shoes.position.y = 0.045;
  const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 0.48, 16), coatMat);
  coat.position.y = 0.32;
  coat.castShadow = true;

  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.04), shirtMat);
  tie.position.set(0, 0.43, 0.16);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), skinMat);
  head.position.y = 0.72;
  head.castShadow = true;

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat,
  );
  hair.position.set(0, 0.74, -0.02);
  hair.rotation.x = -0.25;

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), darkMat);
  eyeL.position.set(-0.06, 0.73, 0.165);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;

  const specL = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.008, 8, 16), darkMat);
  specL.position.set(-0.06, 0.73, 0.175);
  const specR = specL.clone();
  specR.position.x = 0.06;

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.2, 0.52, 0);
  const armMeshL = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.2, 4, 8), coatMat);
  armMeshL.position.y = -0.11;
  leftArm.add(armMeshL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 0.52, 0);
  const armMeshR = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.2, 4, 8), coatMat);
  armMeshR.position.y = -0.11;
  rightArm.add(armMeshR);

  if (prop === 'clipboard') {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.24, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }),
    );
    board.position.set(0, -0.22, 0.1);
    board.rotation.x = -0.5;
    rightArm.add(board);
  } else if (prop === 'tablet') {
    const tab = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 }),
    );
    tab.position.set(0, -0.2, 0.12);
    tab.rotation.x = -0.4;
    rightArm.add(tab);
  }

  group.add(shoes, coat, tie, head, hair, eyeL, eyeR, specL, specR, leftArm, rightArm);
  return { group, leftArm, rightArm };
}

export function createLilyCharacter(variant: 'casual' | 'astronaut'): CharacterRig {
  const group = new THREE.Group();
  const isAstro = variant === 'astronaut';

  const suitMat = new THREE.MeshStandardMaterial({
    color: isAstro ? 0xf8fafc : 0xec4899,
    roughness: 0.42,
    metalness: isAstro ? 0.14 : 0.05,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: isAstro ? 0x2563eb : 0xfacc15,
    roughness: 0.35,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf4c29c, roughness: 0.55 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  const boots = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.12, 14),
    isAstro ? trimMat : darkMat,
  );
  boots.position.y = 0.06;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.24, 6, 12), suitMat);
  torso.position.y = 0.33;
  torso.castShadow = true;

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 14), trimMat);
  belt.position.y = 0.25;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), skinMat);
  head.position.y = 0.68;
  head.castShadow = true;

  const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.75 });
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat,
  );
  hair.position.set(0, 0.71, -0.02);
  hair.rotation.x = -0.25;

  const puffL = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), hairMat);
  puffL.position.set(-0.2, 0.72, -0.04);
  const puffR = puffL.clone();
  puffR.position.x = 0.2;

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), darkMat);
  eyeL.position.set(-0.06, 0.69, 0.16);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.048, 0.011, 8, 12, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.4 }),
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.63, 0.162);

  if (isAstro) {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.16), suitMat);
    pack.position.set(0, 0.38, -0.18);
    const helmetRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 10, 24), trimMat);
    helmetRing.rotation.x = Math.PI / 2;
    helmetRing.position.y = 0.53;
    const helmetGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.28,
        roughness: 0.08,
        metalness: 0.1,
        depthWrite: false,
      }),
    );
    helmetGlass.position.y = 0.69;
    helmetGlass.renderOrder = 5;
    group.add(pack, helmetRing, helmetGlass);
  }

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.2, 0.48, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), suitMat);
  armL.position.y = -0.1;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 0.48, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), suitMat);
  armR.position.y = -0.1;
  rightArm.add(armR);

  group.add(boots, torso, belt, head, hair, puffL, puffR, eyeL, eyeR, smile, leftArm, rightArm);
  return { group, leftArm, rightArm };
}

export function createHeartMesh(color = 0xf43f5e, scale = 0.3): THREE.Mesh {
  const s = new THREE.Shape();
  s.moveTo(0, 0.25);
  s.bezierCurveTo(0, 0.5, -0.45, 0.5, -0.45, 0.15);
  s.bezierCurveTo(-0.45, -0.15, 0, -0.45, 0, -0.6);
  s.bezierCurveTo(0, -0.45, 0.45, -0.15, 0.45, 0.15);
  s.bezierCurveTo(0.45, 0.5, 0, 0.5, 0, 0.25);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  });
  geo.center();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.25,
    roughness: 0.3,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(scale);
  return mesh;
}

export function createStarMesh(color = 0xffe066, size = 0.18): THREE.Mesh {
  const s = new THREE.Shape();
  const spikes = 5;
  const outer = size;
  const inner = size * 0.45;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: size * 0.35,
    bevelEnabled: true,
    bevelSize: size * 0.06,
    bevelThickness: size * 0.06,
    bevelSegments: 2,
  });
  geo.center();
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.4,
    }),
  );
}

export interface BookShellRig {
  root: THREE.Group;
  frontCoverPivot: THREE.Group;
  frontCoverClickable: THREE.Mesh;
  leftPageMesh: THREE.Mesh;
  rightPageMesh: THREE.Mesh;
  flippingPageGroup: THREE.Group;
  flippingPageMesh: THREE.Mesh;
  popupTextPivot: THREE.Group;
  popupTextMesh: THREE.Mesh;
  updateFlipCurl: (progress: number, direction: 1 | -1) => void;
  setFlippingPageTexture: (texture: THREE.Texture | null) => void;
  setPageTextures: (leftTex: THREE.Texture, rightTex: THREE.Texture) => void;
  setPopupTextTexture: (tex: THREE.Texture) => void;
}

export function createBookShell(maxAnisotropy = 4): BookShellRig {
  const root = new THREE.Group();

  const coverW = 4.65;
  const coverH = 0.14;
  const coverD = 5.75;
  const pageW = 4.35;
  const pageH = 0.24;
  const pageD = 5.35;

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd5ac55,
    metalness: 0.86,
    roughness: 0.26,
  });
  // Dark blue leather binding material
  const darkBlueLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x0a1c3d,
    roughness: 0.72,
    metalness: 0.08,
    envMapIntensity: 0.3,
  });
  const paperEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x1b2d4a,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.03,
  });

  // 1. Center Spine Cradle
  const spineGroup = new THREE.Group();
  const spineBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, coverD),
    darkBlueLeatherMat,
  );
  spineBase.position.y = -0.06;
  spineBase.receiveShadow = true;
  spineGroup.add(spineBase);

  for (let z = -2.1; z <= 2.1; z += 1.05) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.04, 0.14),
      goldMat,
    );
    rib.position.set(0, -0.14, z);
    spineGroup.add(rib);
  }
  root.add(spineGroup);

  // 2. Right Hardcover Base
  const backCoverTex = createBackCoverTexture(maxAnisotropy);
  const backCoverBoard = new THREE.Mesh(
    new THREE.BoxGeometry(coverW, coverH, coverD),
    [
      darkBlueLeatherMat,
      darkBlueLeatherMat,
      darkBlueLeatherMat,
      new THREE.MeshStandardMaterial({ map: backCoverTex, roughness: 0.6 }),
      darkBlueLeatherMat,
      darkBlueLeatherMat,
    ],
  );
  backCoverBoard.position.set(coverW / 2 + 0.12, -0.05, 0);
  backCoverBoard.receiveShadow = true;
  backCoverBoard.castShadow = true;
  root.add(backCoverBoard);

  const cornerGeo = new THREE.BoxGeometry(0.32, coverH + 0.03, 0.32);
  const brCorner = new THREE.Mesh(cornerGeo, goldMat);
  brCorner.position.set(coverW + 0.02, -0.05, coverD / 2 - 0.12);
  const trCorner = brCorner.clone();
  trCorner.position.z = -coverD / 2 + 0.12;
  root.add(brCorner, trCorner);

  // Right Paper Block & Surface
  const rightPageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(pageW, pageH, pageD),
    paperEdgeMat,
  );
  rightPageBlock.position.set(pageW / 2 + 0.08, 0.11, 0);
  rightPageBlock.receiveShadow = true;
  root.add(rightPageBlock);

  const rightPageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.04,
  });
  const rightPageMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(pageW, pageD),
    rightPageMat,
  );
  rightPageMesh.rotation.x = -Math.PI / 2;
  rightPageMesh.position.set(pageW / 2 + 0.08, 0.235, 0);
  rightPageMesh.receiveShadow = true;
  root.add(rightPageMesh);

  // 3. Front Dark Blue Cover + Left Paper Block
  const frontCoverPivot = new THREE.Group();
  frontCoverPivot.position.set(0.08, 0.04, 0);

  const coverFrontTex = createCoverTexture(maxAnisotropy);
  const coverFrontMat = new THREE.MeshStandardMaterial({
    map: coverFrontTex,
    roughness: 0.78,
    metalness: 0.05,
    envMapIntensity: 0.25,
  });

  const frontCoverBoard = new THREE.Mesh(
    new THREE.BoxGeometry(coverW, coverH, coverD),
    [
      darkBlueLeatherMat,
      darkBlueLeatherMat,
      coverFrontMat,
      darkBlueLeatherMat,
      darkBlueLeatherMat,
      darkBlueLeatherMat,
    ],
  );
  frontCoverBoard.position.set(coverW / 2 + 0.04, 0.27, 0);
  frontCoverBoard.castShadow = true;
  frontCoverBoard.receiveShadow = true;
  frontCoverPivot.add(frontCoverBoard);

  // Miniature 3D Cover Medallion: Silver Moon + Gold Ring + Mini ALSEP Central Station Mast Emblem!
  const medallionGroup = new THREE.Group();
  medallionGroup.position.set(coverW / 2 + 0.04, 0.36, 0.44);
  const medRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.04, 12, 32),
    goldMat,
  );
  medRing.rotation.x = Math.PI / 2;
  const medMoon = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.75, metalness: 0.08 }),
  );
  medMoon.scale.set(1, 0.42, 1);
  const medLabBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.14, 0.24),
    goldMat,
  );
  medLabBox.position.y = 0.18;
  const medMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.26, 8),
    goldMat,
  );
  medMast.position.y = 0.32;
  medallionGroup.add(medRing, medMoon, medLabBox, medMast);
  frontCoverPivot.add(medallionGroup);

  const leftPageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(pageW, pageH, pageD),
    paperEdgeMat,
  );
  leftPageBlock.position.set(pageW / 2 + 0.02, 0.09, 0);
  leftPageBlock.receiveShadow = true;
  frontCoverPivot.add(leftPageBlock);

  const leftPageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.04,
  });
  const leftPageMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(pageW, pageD),
    leftPageMat,
  );
  leftPageMesh.rotation.x = Math.PI / 2;
  leftPageMesh.rotation.z = Math.PI;
  leftPageMesh.position.set(pageW / 2 + 0.02, -0.035, 0);
  leftPageMesh.receiveShadow = true;
  frontCoverPivot.add(leftPageMesh);

  root.add(frontCoverPivot);

  // 4. Flexible Flipping Page Sheet
  const flippingPageGroup = new THREE.Group();
  flippingPageGroup.position.set(0, 0.25, 0);
  flippingPageGroup.visible = false;

  const flipGeo = new THREE.PlaneGeometry(pageW, pageD, 24, 2);
  flipGeo.rotateX(-Math.PI / 2);
  flipGeo.translate(pageW / 2, 0, 0);
  const baseFlipPos = Float32Array.from(flipGeo.attributes.position.array);

  const flipMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.03,
    side: THREE.DoubleSide,
  });
  const flippingPageMesh = new THREE.Mesh(flipGeo, flipMat);
  flippingPageMesh.castShadow = true;
  flippingPageGroup.add(flippingPageMesh);
  root.add(flippingPageGroup);

  // 5. 90-Degree Upright Pop-Up Story Text Pivot
  const popupTextPivot = new THREE.Group();
  popupTextPivot.position.set(0, 0.25, -2.05);

  const popupTextMat = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.02,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const popupTextMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.1, 3.0),
    popupTextMat,
  );
  popupTextMesh.position.set(0, 2.55, 0);
  popupTextMesh.renderOrder = 25;
  popupTextPivot.add(popupTextMesh);
  root.add(popupTextPivot);

  // Soft moonlit sapphire glow halo beneath the book
  const glowTex = createGlowSpriteTexture();
  const spaceAura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x2563eb,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  spaceAura.scale.set(14, 9, 1);
  spaceAura.position.set(0, -1.4, -1.5);
  root.add(spaceAura);

  const updateFlipCurl = (progress: number, direction: 1 | -1) => {
    const pos = flipGeo.attributes.position;
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    const angle = direction === 1 ? t * Math.PI : (1 - t) * Math.PI;
    const arch = Math.sin(t * Math.PI);

    for (let i = 0; i < pos.count; i++) {
      const bx = baseFlipPos[i * 3];
      const by = baseFlipPos[i * 3 + 1];
      const bz = baseFlipPos[i * 3 + 2];
      const u = bx / pageW;
      const bend = Math.sin(u * Math.PI) * 0.42 * arch;
      const localAngle = angle - u * 0.18 * arch * direction;
      const rx = bx * Math.cos(localAngle) - (by + bend) * Math.sin(localAngle);
      const ry = bx * Math.sin(localAngle) + (by + bend) * Math.cos(localAngle);
      pos.setXYZ(i, rx, Math.max(0.01, ry), bz);
    }
    pos.needsUpdate = true;
    flipGeo.computeVertexNormals();
  };

  let prevLeftTex: THREE.Texture | null = null;
  let prevRightTex: THREE.Texture | null = null;
  let prevPopupTex: THREE.Texture | null = null;
  let prevFlipTex: THREE.Texture | null = null;

  return {
    root,
    frontCoverPivot,
    frontCoverClickable: frontCoverBoard,
    leftPageMesh,
    rightPageMesh,
    flippingPageGroup,
    flippingPageMesh,
    popupTextPivot,
    popupTextMesh,
    updateFlipCurl,
    setFlippingPageTexture: (tex) => {
      if (prevFlipTex === tex) return;
      if (prevFlipTex) prevFlipTex.dispose();
      prevFlipTex = tex;
      flipMat.map = tex;
      flipMat.needsUpdate = true;
    },
    setPageTextures: (leftTex, rightTex) => {
      if (prevLeftTex) prevLeftTex.dispose();
      if (prevRightTex) prevRightTex.dispose();
      prevLeftTex = leftTex;
      prevRightTex = rightTex;
      leftPageMat.map = leftTex;
      leftPageMat.needsUpdate = true;
      rightPageMat.map = rightTex;
      rightPageMat.needsUpdate = true;
    },
    setPopupTextTexture: (tex) => {
      if (prevPopupTex) prevPopupTex.dispose();
      prevPopupTex = tex;
      popupTextMat.map = tex;
      popupTextMat.needsUpdate = true;
    },
  };
}
