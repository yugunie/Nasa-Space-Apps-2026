import * as THREE from 'three';
import {
  createAsteroidTexture,
  createBackCoverTexture,
  createCoverTexture,
  createEarthTexture,
  createGlowSpriteTexture,
  createProbeFaceTexture,
  createScanChartTexture,
  createSolarPanelTexture,
  type ProbeMood,
} from './textures';

export interface NearProbeRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  dishPivot: THREE.Group;
  solarWings: THREE.Group;
  cameraFlash: THREE.Mesh | null;
  setMood: (mood: ProbeMood) => void;
  dispose: () => void;
}

/**
 * NEAR Shoemaker Robotic Space Probe:
 * Octagonal gold-foil bus, 4 windmill blue solar wings, top parabolic dish,
 * expressive visor face, waving arms (with optional handheld camera), and bottom
 * instrument deck (no landing legs!). Bottom sits at y = 0.
 */
export function createNearProbe(
  maxAnisotropy = 4,
  options: { withCamera?: boolean } = {},
): NearProbeRig {
  const group = new THREE.Group();

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.86,
    roughness: 0.24,
  });
  const aluminumMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.62,
    roughness: 0.3,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b2e,
    metalness: 0.45,
    roughness: 0.42,
  });
  const solarTex = createSolarPanelTexture(maxAnisotropy);
  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.38,
    roughness: 0.22,
  });

  // 1. Bottom Instrument & Thruster Deck (grounded at y = 0, no landing gear!)
  const thrusterRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.1, 8),
    darkMat,
  );
  thrusterRing.position.y = 0.05;
  thrusterRing.castShadow = true;
  group.add(thrusterRing);

  const sensorLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12),
    aluminumMat,
  );
  sensorLens.position.set(0, 0.06, 0.22);
  sensorLens.rotation.x = Math.PI / 2;
  group.add(sensorLens);

  // 2. Octagonal Gold-Foil Bus Body
  const bus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.42, 8),
    goldFoilMat,
  );
  bus.position.y = 0.31;
  bus.rotation.y = Math.PI / 8;
  bus.castShadow = true;
  bus.receiveShadow = true;
  group.add(bus);

  const topDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.37, 0.04, 8),
    aluminumMat,
  );
  topDeck.position.y = 0.53;
  topDeck.rotation.y = Math.PI / 8;
  topDeck.castShadow = true;
  group.add(topDeck);

  // 3. Cute Expressive Visor Screen on Front of Bus
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.06), darkMat);
  bezel.position.set(0, 0.33, 0.32);
  group.add(bezel);

  const moodTextures: Record<ProbeMood, THREE.CanvasTexture> = {
    normal: createProbeFaceTexture('normal', maxAnisotropy),
    happy: createProbeFaceTexture('happy', maxAnisotropy),
    shocked: createProbeFaceTexture('shocked', maxAnisotropy),
    crying: createProbeFaceTexture('crying', maxAnisotropy),
    smug: createProbeFaceTexture('smug', maxAnisotropy),
    sleepy: createProbeFaceTexture('sleepy', maxAnisotropy),
  };

  const faceMat = new THREE.MeshBasicMaterial({ map: moodTextures.normal });
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.17), faceMat);
  faceMesh.position.set(0, 0.33, 0.354);
  group.add(faceMesh);

  // 4. Four Iconic Cross/Windmill Solar Panel Wings
  const solarWings = new THREE.Group();
  solarWings.position.y = 0.5;
  const wingAngles = [0.45, Math.PI / 2 + 0.45, Math.PI + 0.45, (Math.PI * 3) / 2 + 0.45];
  for (const ang of wingAngles) {
    const wingPivot = new THREE.Group();
    wingPivot.rotation.y = ang;

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.04), aluminumMat);
    arm.position.set(0.4, 0, 0);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.022, 0.28), solarMat);
    panel.position.set(0.74, 0, 0);
    panel.rotation.x = 0.16;
    panel.castShadow = true;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.014, 0.3), aluminumMat);
    frame.position.set(0.74, -0.008, 0);
    frame.rotation.x = 0.16;

    wingPivot.add(arm, frame, panel);
    solarWings.add(wingPivot);
  }
  group.add(solarWings);

  // 5. Top High-Gain Parabolic Dish Antenna
  const dishPivot = new THREE.Group();
  dishPivot.position.set(0, 0.56, -0.04);
  const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.18, 10), aluminumMat);
  dishMast.position.y = 0.09;

  const dishHolder = new THREE.Group();
  dishHolder.position.y = 0.2;
  dishHolder.rotation.x = -0.35;
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.15, 0.03),
    new THREE.Vector2(0.32, 0.12),
  ];
  const dish = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 24),
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.18,
      side: THREE.DoubleSide,
    }),
  );
  const feedPin = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.2, 8), darkMat);
  feedPin.position.y = 0.1;
  const feedTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
    }),
  );
  feedTip.position.y = 0.2;
  dishHolder.add(dish, feedPin, feedTip);
  dishPivot.add(dishMast, dishHolder);
  group.add(dishPivot);

  // 6. Expressive Little Probe Arms (for waving, hugging, or holding camera)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36, 0.34, 0.08);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.18, 4, 8), aluminumMat);
  armL.position.y = -0.09;
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), goldFoilMat);
  handL.position.y = -0.2;
  leftArm.add(armL, handL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.36, 0.34, 0.08);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.18, 4, 8), aluminumMat);
  armR.position.y = -0.09;
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), goldFoilMat);
  handR.position.y = -0.2;
  rightArm.add(armR, handR);

  let cameraFlash: THREE.Mesh | null = null;
  if (options.withCamera) {
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.1), darkMat);
    camBody.position.set(0, -0.22, 0.08);
    const camLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.05, 0.07, 12),
      aluminumMat,
    );
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, -0.22, 0.15);
    cameraFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.9 }),
    );
    cameraFlash.position.set(0.06, -0.15, 0.13);
    rightArm.add(camBody, camLens, cameraFlash);
    rightArm.rotation.x = -0.9;
  }

  group.add(leftArm, rightArm);

  return {
    group,
    leftArm,
    rightArm,
    dishPivot,
    solarWings,
    cameraFlash,
    setMood: (mood: ProbeMood) => {
      faceMat.map = moodTextures[mood];
      faceMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
      solarTex.dispose();
    },
  };
}

export interface ErosRig {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Asteroid 433 Eros: Iconic elongated peanut-shaped rocky body.
 * Optional `grandpa` variant gives Eros round glasses, white eyebrows,
 * fluffy white mustache, and a golden-topped walking cane!
 */
export function createErosAsteroid(
  maxAnisotropy = 4,
  options: { grandpa?: boolean } = {},
): ErosRig {
  const group = new THREE.Group();
  const erosTex = createAsteroidTexture('#9A8B7E', '#62564B', maxAnisotropy);
  const erosMat = new THREE.MeshStandardMaterial({
    map: erosTex,
    roughness: 0.92,
    metalness: 0.04,
    flatShading: true,
  });

  // Deform an icosahedron into Eros's pinched peanut shape
  const geo = new THREE.IcosahedronGeometry(0.75, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const nx = vx * 1.65;
    const pinch = 0.72 + 0.34 * Math.pow(Math.abs(vx) / 0.75, 1.4);
    const bendY = vy * pinch * 0.78 + 0.1 * Math.cos(vx * 3.1);
    const bump = 1 + 0.08 * Math.sin(vx * 5.2 + vy * 4.1) * Math.cos(vz * 4.7);
    pos.setXYZ(i, nx * bump, bendY * bump, vz * pinch * 0.8 * bump);
  }
  geo.computeVertexNormals();

  const body = new THREE.Mesh(geo, erosMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  if (options.grandpa) {
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe8c574,
      metalness: 0.85,
      roughness: 0.25,
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

    // Friendly grandpa eyes behind round glasses
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), darkMat);
    eyeL.position.set(-0.22, 0.16, 0.52);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.22;

    const rimL = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 10, 24), goldMat);
    rimL.position.set(-0.22, 0.16, 0.56);
    const rimR = rimL.clone();
    rimR.position.x = 0.22;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.025), goldMat);
    bridge.position.set(0, 0.17, 0.56);

    // Fluffy white eyebrows
    const browL = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 4, 8), whiteMat);
    browL.rotation.z = Math.PI / 2 + 0.15;
    browL.position.set(-0.24, 0.32, 0.54);
    const browR = browL.clone();
    browR.rotation.z = Math.PI / 2 - 0.15;
    browR.position.x = 0.24;

    // Big handlebar white mustache!
    const stacheL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 4, 8), whiteMat);
    stacheL.rotation.z = Math.PI / 2 - 0.25;
    stacheL.position.set(-0.14, -0.02, 0.56);
    const stacheR = stacheL.clone();
    stacheR.rotation.z = Math.PI / 2 + 0.25;
    stacheR.position.x = 0.14;

    // Little grandpa walking cane propped beside Eros
    const caneShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.026, 0.95, 10),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 }),
    );
    caneShaft.position.set(0.88, -0.2, 0.35);
    caneShaft.rotation.z = -0.18;
    const caneHook = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.032, 8, 16, Math.PI),
      goldMat,
    );
    caneHook.position.set(0.7, 0.26, 0.35);
    caneHook.rotation.z = -0.18;

    group.add(
      eyeL,
      eyeR,
      rimL,
      rimR,
      bridge,
      browL,
      browR,
      stacheL,
      stacheR,
      caneShaft,
      caneHook,
    );
  }

  return {
    group,
    dispose: () => {
      geo.dispose();
      erosTex.dispose();
      erosMat.dispose();
    },
  };
}

export interface MathildeRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  dispose: () => void;
}

/**
 * Asteroid 253 Mathilde: Dark charcoal-cratered asteroid friend with a cute face and waving arms.
 */
export function createMathildeAsteroid(maxAnisotropy = 4): MathildeRig {
  const group = new THREE.Group();
  const matTex = createAsteroidTexture('#585468', '#332F3F', maxAnisotropy);
  const rockMat = new THREE.MeshStandardMaterial({
    map: matTex,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: true,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });

  const geo = new THREE.IcosahedronGeometry(0.68, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const w = 1 + 0.1 * Math.sin(x * 4.1 + y * 3.2) * Math.cos(z * 3.8);
    pos.setXYZ(i, x * 1.15 * w, y * 0.95 * w, z * 0.92 * w);
  }
  geo.computeVertexNormals();

  const body = new THREE.Mesh(geo, rockMat);
  body.position.y = 0.72;
  body.castShadow = true;
  group.add(body);

  // Friendly eyes, rosy cheeks, and big smile
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), darkMat);
  eyeL.position.set(-0.2, 0.82, 0.58);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.2;

  const gleamL = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  gleamL.position.set(-0.22, 0.84, 0.635);
  const gleamR = gleamL.clone();
  gleamR.position.x = 0.18;

  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), cheekMat);
  cheekL.scale.set(1.2, 0.7, 0.5);
  cheekL.position.set(-0.32, 0.7, 0.56);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.32;

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.024, 8, 16, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xffe066 }),
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.68, 0.61);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.72, 0.74, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.24, 4, 8), rockMat);
  armL.position.y = 0.12;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.72, 0.74, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.24, 4, 8), rockMat);
  armR.position.y = 0.12;
  rightArm.add(armR);

  group.add(body, eyeL, eyeR, gleamL, gleamR, cheekL, cheekR, smile, leftArm, rightArm);

  return {
    group,
    leftArm,
    rightArm,
    dispose: () => {
      geo.dispose();
      matTex.dispose();
      rockMat.dispose();
    },
  };
}

export function createErosGround(maxAnisotropy = 4): { group: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const tex = createAsteroidTexture('#9A8B7E', '#62564B', maxAnisotropy);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.92,
    metalness: 0.04,
    flatShading: true,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.35, 0.14, 32), mat);
  base.position.y = 0.07;
  base.receiveShadow = true;
  group.add(base);

  const rocks: [number, number, number, number][] = [
    [-1.45, 0.22, 0.85, 0.22],
    [1.55, 0.24, 0.75, 0.25],
    [1.4, 0.2, -0.75, 0.2],
    [-1.35, 0.2, -0.65, 0.18],
  ];
  for (const [rx, ry, rz, rs] of rocks) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), mat);
    rock.position.set(rx, ry, rz);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  return {
    group,
    dispose: () => {
      tex.dispose();
      mat.dispose();
    },
  };
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

export interface CharacterRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
}

export function createJacob(prop: 'none' | 'tablet' = 'none'): CharacterRig {
  const group = new THREE.Group();
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.5 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf4c49c, roughness: 0.55 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.7 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

  const shoes = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.09, 14), pantsMat);
  shoes.position.y = 0.045;
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.21, 0.46, 16), jacketMat);
  torso.position.y = 0.31;
  torso.castShadow = true;

  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), accentMat);
  badge.position.set(0.07, 0.43, 0.15);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), skinMat);
  head.position.y = 0.71;
  head.castShadow = true;

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat,
  );
  hair.position.set(0, 0.74, -0.02);
  hair.rotation.x = -0.2;

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), pantsMat);
  eyeL.position.set(-0.06, 0.72, 0.165);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.048, 0.012, 8, 12, Math.PI),
    pantsMat,
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.65, 0.17);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.2, 0.51, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.2, 4, 8), jacketMat);
  armL.position.y = -0.11;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 0.51, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.2, 4, 8), jacketMat);
  armR.position.y = -0.11;
  rightArm.add(armR);

  if (prop === 'tablet') {
    const tab = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 }),
    );
    tab.position.set(0, -0.2, 0.12);
    tab.rotation.x = -0.4;
    rightArm.add(tab);
  }

  group.add(shoes, torso, badge, head, hair, eyeL, eyeR, smile, leftArm, rightArm);
  return { group, leftArm, rightArm };
}

export function createLily(): CharacterRig {
  const group = new THREE.Group();
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.5 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf8d0b0, roughness: 0.55 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x6b3a24, roughness: 0.65 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

  const shoes = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.09, 14), darkMat);
  shoes.position.y = 0.045;
  const dress = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.23, 0.46, 16), jacketMat);
  dress.position.y = 0.31;
  dress.castShadow = true;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 20, 20), skinMat);
  head.position.y = 0.7;
  head.castShadow = true;

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.186, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat,
  );
  hair.position.set(0, 0.72, -0.02);
  hair.rotation.x = -0.25;

  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), hairMat);
  bun.position.set(0, 0.86, -0.13);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), darkMat);
  eyeL.position.set(-0.058, 0.71, 0.16);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.058;

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.011, 8, 12, Math.PI),
    darkMat,
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.64, 0.165);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.19, 0.5, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.19, 4, 8), jacketMat);
  armL.position.y = -0.1;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.19, 0.5, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.19, 4, 8), jacketMat);
  armR.position.y = -0.1;
  rightArm.add(armR);

  group.add(shoes, dress, head, hair, bun, eyeL, eyeR, smile, leftArm, rightArm);
  return { group, leftArm, rightArm };
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

/**
 * Jacob in an Astronaut Suit with royal-purple trim and clear-tinted visor showing his happy face!
 */
export function createAstronautJacob(): CharacterRig {
  const group = new THREE.Group();
  const suitMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.35 });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.72,
    roughness: 0.18,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });

  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.18), darkMat);
  bootL.position.set(-0.08, 0.06, 0.02);
  const bootR = bootL.clone();
  bootR.position.x = 0.08;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.26, 6, 12), suitMat);
  torso.position.y = 0.35;
  torso.castShadow = true;

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.15), suitMat);
  pack.position.set(0, 0.4, -0.18);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 14), trimMat);
  belt.position.y = 0.27;

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), suitMat);
  helmet.position.y = 0.7;
  helmet.castShadow = true;

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.175, 20, 16, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.2, Math.PI * 0.52),
    visorMat,
  );
  visor.position.set(0, 0.7, 0.045);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 0.48, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.22, 4, 8), suitMat);
  armL.position.y = -0.1;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, 0.48, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.22, 4, 8), suitMat);
  armR.position.y = -0.1;
  rightArm.add(armR);

  group.add(bootL, bootR, torso, pack, belt, helmet, visor, leftArm, rightArm);
  return { group, leftArm, rightArm };
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

export function createScanMonitor(maxAnisotropy = 4): { mesh: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 }),
  );
  stand.position.y = 0.14;
  const chartTex = createScanChartTexture(maxAnisotropy);
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.48, 0.05),
    new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.3 }),
  );
  screen.position.y = 0.52;
  group.add(stand, screen);
  return { mesh: group, dispose: () => chartTex.dispose() };
}

export function createLightbulbIdea(): THREE.Group {
  const group = new THREE.Group();
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xfacc15,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    }),
  );
  bulb.position.y = 0.18;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.06, 0.1, 10),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 }),
  );
  base.position.y = 0.02;
  group.add(bulb, base);
  return group;
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
  // Rich dark purple leather binding material
  const darkPurpleLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x260b42,
    roughness: 0.72,
    metalness: 0.08,
    envMapIntensity: 0.3,
  });
  const paperEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x2b1442,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.03,
  });

  // 1. Center Spine Cradle
  const spineGroup = new THREE.Group();
  const spineBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, coverD),
    darkPurpleLeatherMat,
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
      darkPurpleLeatherMat,
      darkPurpleLeatherMat,
      darkPurpleLeatherMat,
      new THREE.MeshStandardMaterial({ map: backCoverTex, roughness: 0.6 }),
      darkPurpleLeatherMat,
      darkPurpleLeatherMat,
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

  // 3. Front Dark Purple Cover + Left Paper Block
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
      darkPurpleLeatherMat,
      darkPurpleLeatherMat,
      coverFrontMat,
      darkPurpleLeatherMat,
      darkPurpleLeatherMat,
      darkPurpleLeatherMat,
    ],
  );
  frontCoverBoard.position.set(coverW / 2 + 0.04, 0.27, 0);
  frontCoverBoard.castShadow = true;
  frontCoverBoard.receiveShadow = true;
  frontCoverPivot.add(frontCoverBoard);

  // Miniature 3D Cover Medallion: Gold Ring + Mini Peanut Asteroid Eros + Mini 4-Wing NEAR Probe Emblem!
  const medallionGroup = new THREE.Group();
  medallionGroup.position.set(coverW / 2 + 0.04, 0.36, 0.38);
  const medRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.04, 12, 32),
    goldMat,
  );
  medRing.rotation.x = Math.PI / 2;
  const medEros = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x9a8b7e, roughness: 0.78, metalness: 0.08 }),
  );
  medEros.scale.set(1.45, 0.35, 0.75);
  medEros.rotation.y = 0.3;

  const medProbeBus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8),
    goldMat,
  );
  medProbeBus.position.y = 0.2;
  const medWingA = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.12), goldMat);
  medWingA.position.y = 0.22;
  const medWingB = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.56), goldMat);
  medWingB.position.y = 0.22;
  medallionGroup.add(medRing, medEros, medProbeBus, medWingA, medWingB);
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
    color: 0x33184a,
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

  // Royal violet glow halo beneath the book
  const glowTex = createGlowSpriteTexture();
  const spaceAura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x7e22ce,
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
