import * as THREE from 'three';
import {
  createAsteroidTexture,
  createBackCoverTexture,
  createCoverTexture,
  createEarthTexture,
  createGlowSpriteTexture,
  createSolarPanelTexture,
  createVisorTexture,
  type NearMood,
} from './textures';

export interface NearProbeRig {
  group: THREE.Group;
  dishGroup: THREE.Group;
  wings: THREE.Group[];
  visorMesh: THREE.Mesh;
  sunglasses: THREE.Group;
  cameraProp: THREE.Group;
  cameraFlashMesh: THREE.Mesh;
  thrusterFlames: THREE.Group;
  setMood: (mood: NearMood) => void;
  dispose: () => void;
}

export function createNearProbe(maxAnisotropy = 4): NearProbeRig {
  const group = new THREE.Group();

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.86,
    roughness: 0.24,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x26314a,
    metalness: 0.65,
    roughness: 0.45,
  });
  const whiteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf2f6ff,
    metalness: 0.12,
    roughness: 0.38,
  });
  const solarTex = createSolarPanelTexture(maxAnisotropy);
  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.45,
    roughness: 0.22,
  });

  // 1. Primary octagonal spacecraft bus
  const busGeo = new THREE.CylinderGeometry(0.4, 0.42, 0.56, 8);
  const busMesh = new THREE.Mesh(busGeo, goldFoilMat);
  busMesh.position.y = 0.42;
  busMesh.castShadow = true;
  busMesh.receiveShadow = true;
  group.add(busMesh);

  // Top & bottom structural collars
  const collarGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.07, 8);
  const topCollar = new THREE.Mesh(collarGeo, darkMetalMat);
  topCollar.position.y = 0.71;
  topCollar.castShadow = true;
  group.add(topCollar);

  const botCollar = new THREE.Mesh(collarGeo, darkMetalMat);
  botCollar.position.y = 0.14;
  botCollar.castShadow = true;
  group.add(botCollar);

  // 2. Parabolic High-Gain Dish on top (LatheGeometry)
  const dishGroup = new THREE.Group();
  dishGroup.position.set(0, 0.75, 0);
  const dishPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.16, 0.03),
    new THREE.Vector2(0.32, 0.1),
    new THREE.Vector2(0.42, 0.2),
  ];
  const dishGeo = new THREE.LatheGeometry(dishPoints, 28);
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    metalness: 0.15,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });
  const dishMesh = new THREE.Mesh(dishGeo, dishMat);
  dishMesh.castShadow = true;
  dishGroup.add(dishMesh);

  // Dish feed horn & glowing beacon
  const hornMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.03, 0.34, 10),
    darkMetalMat,
  );
  hornMast.position.y = 0.18;
  dishGroup.add(hornMast);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x7ce8ff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  beacon.position.y = 0.36;
  dishGroup.add(beacon);
  group.add(dishGroup);

  // 3. Cute Front Visor Display
  const visorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.24, 0.08),
    darkMetalMat,
  );
  visorFrame.position.set(0, 0.44, 0.39);
  visorFrame.castShadow = true;
  group.add(visorFrame);

  const moodTextures: Record<NearMood, THREE.CanvasTexture> = {
    normal: createVisorTexture('normal', maxAnisotropy),
    happy: createVisorTexture('happy', maxAnisotropy),
    shocked: createVisorTexture('shocked', maxAnisotropy),
    crying: createVisorTexture('crying', maxAnisotropy),
    smug: createVisorTexture('smug', maxAnisotropy),
    sleeping: createVisorTexture('sleeping', maxAnisotropy),
  };

  const visorMat = new THREE.MeshBasicMaterial({
    map: moodTextures.normal,
  });
  const visorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.19), visorMat);
  visorMesh.position.set(0, 0.44, 0.435);
  group.add(visorMesh);

  // 4. Four Solar Array Wings arranged crosswise
  const wings: THREE.Group[] = [];
  const wingAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
  for (const angle of wingAngles) {
    const wingPivot = new THREE.Group();
    wingPivot.position.set(0, 0.44, 0);
    wingPivot.rotation.y = angle;

    // Mounting arm strut
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.32, 8),
      whiteTrimMat,
    );
    strut.rotation.z = Math.PI / 2;
    strut.position.x = 0.48;
    wingPivot.add(strut);

    // Solar panel blade
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.032, 0.34),
      solarMat,
    );
    blade.position.x = 0.96;
    blade.castShadow = true;
    blade.receiveShadow = true;
    wingPivot.add(blade);

    // Metallic edge frame
    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.045, 0.36),
      goldFoilMat,
    );
    tip.position.x = 1.38;
    wingPivot.add(tip);

    group.add(wingPivot);
    wings.push(wingPivot);
  }

  // 5. Thruster nozzle + animated flame cones
  const thrusterBell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.18, 0.16, 16),
    darkMetalMat,
  );
  thrusterBell.position.y = 0.04;
  group.add(thrusterBell);

  const thrusterFlames = new THREE.Group();
  thrusterFlames.position.set(0, -0.05, 0);
  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.56, 14),
    new THREE.MeshBasicMaterial({
      color: 0xff8c2b,
      transparent: true,
      opacity: 0.88,
    }),
  );
  outerFlame.rotation.x = Math.PI;
  outerFlame.position.y = -0.25;
  thrusterFlames.add(outerFlame);

  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.36, 12),
    new THREE.MeshBasicMaterial({
      color: 0xfff3a1,
      transparent: true,
      opacity: 0.95,
    }),
  );
  innerFlame.rotation.x = Math.PI;
  innerFlame.position.y = -0.17;
  thrusterFlames.add(innerFlame);
  thrusterFlames.visible = false;
  group.add(thrusterFlames);

  // 6. Cool Sunglasses Prop (hidden by default, shown on "Nothing is impossible!")
  const sunglasses = new THREE.Group();
  sunglasses.position.set(0, 0.46, 0.455);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0x0b0f1c,
    metalness: 0.9,
    roughness: 0.1,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    metalness: 0.85,
    roughness: 0.2,
  });
  const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.095, 0.03), shadeMat);
  leftLens.position.x = -0.105;
  const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.095, 0.03), shadeMat);
  rightLens.position.x = 0.105;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.03), frameMat);
  bridge.position.y = 0.02;
  sunglasses.add(leftLens, rightLens, bridge);
  sunglasses.visible = false;
  group.add(sunglasses);

  // 7. Retro Space Camera Prop (shown when orbiting Eros)
  const cameraProp = new THREE.Group();
  cameraProp.position.set(0.36, 0.28, 0.44);
  const camBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.17, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.4 }),
  );
  const camLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16),
    darkMetalMat,
  );
  camLens.rotation.x = Math.PI / 2;
  camLens.position.z = 0.09;
  const camGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.02, 16),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    }),
  );
  camGlass.rotation.x = Math.PI / 2;
  camGlass.position.z = 0.15;
  const cameraFlashMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  cameraFlashMesh.position.set(0.08, 0.09, 0.07);
  cameraProp.add(camBody, camLens, camGlass, cameraFlashMesh);
  cameraProp.visible = false;
  group.add(cameraProp);

  return {
    group,
    dishGroup,
    wings,
    visorMesh,
    sunglasses,
    cameraProp,
    cameraFlashMesh,
    thrusterFlames,
    setMood: (mood: NearMood) => {
      visorMat.map = moodTextures[mood];
      visorMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
      solarTex.dispose();
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

  // Soft atmosphere glow halo
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

  // Little orbital ring stand
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.035, 10, 28),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 }),
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.04;
  group.add(baseRing);

  return group;
}

export interface AsteroidOptions {
  kind: 'eros' | 'mathilde' | 'grandpa-eros';
  scale?: number;
  maxAnisotropy?: number;
}

export function createAsteroid({
  kind,
  scale = 1,
  maxAnisotropy = 4,
}: AsteroidOptions): THREE.Group {
  const group = new THREE.Group();
  const isMathilde = kind === 'mathilde';
  const tex = createAsteroidTexture(
    isMathilde ? '#8D8699' : '#B98C6B',
    isMathilde ? '#635C6E' : '#7D583F',
    maxAnisotropy,
  );

  const geo = new THREE.IcosahedronGeometry(0.65, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Sculpt Eros into its signature elongated potato shape, or Mathilde chunky
    if (!isMathilde) {
      x *= 1.48;
      y *= 0.74;
      z *= 0.85;
    } else {
      x *= 1.1;
      y *= 0.95;
      z *= 1.05;
    }
    const lump =
      1 +
      0.13 * Math.sin(x * 4.2 + y * 2.1) +
      0.09 * Math.cos(z * 5.0 - x * 3.0);
    pos.setXYZ(i, x * lump, y * lump, z * lump);
  }
  geo.computeVertexNormals();

  const body = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.88,
      metalness: 0.06,
      flatShading: true,
    }),
  );
  body.position.y = 0.62;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Cute friendly face for Mathilde
  if (kind === 'mathilde') {
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), whiteMat);
    leftEye.position.set(-0.2, 0.74, 0.62);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.2;
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyeMat);
    leftPupil.position.set(-0.2, 0.74, 0.69);
    const rightPupil = leftPupil.clone();
    rightPupil.position.x = 0.2;

    const smileCurve = new THREE.TorusGeometry(0.13, 0.022, 8, 16, Math.PI);
    const smile = new THREE.Mesh(smileCurve, eyeMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, 0.56, 0.64);
    group.add(leftEye, rightEye, leftPupil, rightPupil, smile);

    // Little rocky waving pebble arm
    const waveArm = new THREE.Group();
    waveArm.name = 'mathildeWaveArm';
    waveArm.position.set(-0.68, 0.68, 0.15);
    const armRock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.14, 0),
      new THREE.MeshStandardMaterial({ color: 0x8d8699, roughness: 0.85 }),
    );
    armRock.position.set(-0.14, 0.14, 0);
    waveArm.add(armRock);
    group.add(waveArm);
  }

  // Grandpa Eros accessories: fluffy white beard, round wire glasses, & cane!
  if (kind === 'grandpa-eros') {
    const beardMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.0,
    });
    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0xf5c451,
      metalness: 0.9,
      roughness: 0.2,
    });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });

    // Wise squinting eyes + round spectacles
    const leftRim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 10, 20), glassesMat);
    leftRim.position.set(-0.22, 0.76, 0.55);
    const rightRim = leftRim.clone();
    rightRim.position.x = 0.22;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.02), glassesMat);
    bridge.position.set(0, 0.76, 0.55);

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), eyeMat);
    leftEye.position.set(-0.22, 0.76, 0.52);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.22;

    // Fluffy mustache & bushy eyebrows & beard puffs
    const browL = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.12, 4, 8), beardMat);
    browL.rotation.z = Math.PI / 2 - 0.15;
    browL.position.set(-0.22, 0.92, 0.52);
    const browR = browL.clone();
    browR.rotation.z = Math.PI / 2 + 0.15;
    browR.position.x = 0.22;

    const beardGroup = new THREE.Group();
    const puffOffsets = [
      [0, 0.44, 0.54, 0.22],
      [-0.16, 0.5, 0.5, 0.16],
      [0.16, 0.5, 0.5, 0.16],
      [0, 0.24, 0.5, 0.18],
      [-0.1, 0.34, 0.52, 0.15],
      [0.1, 0.34, 0.52, 0.15],
    ];
    for (const [px, py, pz, pr] of puffOffsets) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 12, 12), beardMat);
      puff.position.set(px, py, pz);
      beardGroup.add(puff);
    }

    // Little wooden walking cane leaning beside Grandpa Eros
    const caneGroup = new THREE.Group();
    caneGroup.position.set(0.88, 0.05, 0.2);
    const caneMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 10), caneMat);
    shaft.position.y = 0.38;
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 10, 16, Math.PI), caneMat);
    hook.position.set(-0.09, 0.75, 0);
    caneGroup.add(shaft, hook);

    group.add(leftRim, rightRim, bridge, leftEye, rightEye, browL, browR, beardGroup, caneGroup);
  }

  group.scale.setScalar(scale);
  return group;
}

export interface CharacterRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
}

export function createScientist(
  hairColor = 0x4a3525,
  shirtColor = 0x38bdf8,
  prop: 'none' | 'clipboard' | 'megaphone' | 'heart' = 'none',
): CharacterRig {
  const group = new THREE.Group();
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6c9a5, roughness: 0.55 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  // Shoes & lab coat body (bottom-center pivot at y=0)
  const shoes = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.09, 14), darkMat);
  shoes.position.y = 0.045;
  const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 0.48, 16), coatMat);
  coat.position.y = 0.32;
  coat.castShadow = true;

  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.04), shirtMat);
  tie.position.set(0, 0.43, 0.16);

  // Head + hair + glasses
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

  // Articulated arms
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
  } else if (prop === 'megaphone') {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.2, 14, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, side: THREE.DoubleSide }),
    );
    cone.rotation.x = -Math.PI / 2;
    cone.position.set(0, -0.2, 0.14);
    rightArm.add(cone);
  } else if (prop === 'heart') {
    const heart = createHeartMesh(0xf43f5e, 0.18);
    heart.position.set(0, 0.02, 0.26);
    group.add(heart);
  }

  group.add(shoes, coat, tie, head, hair, eyeL, eyeR, specL, specR, leftArm, rightArm);
  return { group, leftArm, rightArm };
}

export function createKidCharacter(
  variant: 'jacob-casual' | 'jacob-astronaut' | 'lily',
): CharacterRig {
  const group = new THREE.Group();
  const isAstro = variant === 'jacob-astronaut';
  const isLily = variant === 'lily';

  const suitMat = new THREE.MeshStandardMaterial({
    color: isAstro ? 0xf8fafc : isLily ? 0xec4899 : 0x3b82f6,
    roughness: 0.42,
    metalness: isAstro ? 0.15 : 0.05,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: isAstro ? 0x2563eb : 0xfacc15,
    roughness: 0.35,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf4c29c, roughness: 0.55 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  // Boots + Torso
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

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), skinMat);
  head.position.y = 0.68;
  head.castShadow = true;

  const hairColor = isLily ? 0x3b2314 : 0x271911;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.75 }),
  );
  hair.position.set(0, 0.71, -0.02);
  hair.rotation.x = -0.25;

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), darkMat);
  eyeL.position.set(-0.06, 0.69, 0.16);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;

  // Astronaut backpack & glass bubble helmet
  if (isAstro) {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.16), suitMat);
    pack.position.set(0, 0.38, -0.18);
    const helmetRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 10, 24), trimMat);
    helmetRing.rotation.x = Math.PI / 2;
    helmetRing.position.y = 0.53;
    const helmetGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xcbeafe,
        transparent: true,
        opacity: 0.32,
        roughness: 0.08,
        metalness: 0.1,
        depthWrite: false,
      }),
    );
    helmetGlass.position.y = 0.69;
    helmetGlass.renderOrder = 5;
    group.add(pack, helmetRing, helmetGlass);
  }

  // Arms
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

  group.add(boots, torso, belt, head, hair, eyeL, eyeR, leftArm, rightArm);
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
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x0a132e,
    roughness: 0.72,
    metalness: 0.08,
    envMapIntensity: 0.3,
  });
  const paperEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x454a57,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.03,
  });

  // 1. Center Spine Cradle
  const spineGroup = new THREE.Group();
  const spineBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, coverD),
    leatherMat,
  );
  spineBase.position.y = -0.06;
  spineBase.receiveShadow = true;
  spineGroup.add(spineBase);

  // Raised gold spine ribs
  for (let z = -2.1; z <= 2.1; z += 1.05) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.04, 0.14),
      goldMat,
    );
    rib.position.set(0, -0.14, z);
    spineGroup.add(rib);
  }
  root.add(spineGroup);

  // 2. Right Hardcover Base (fixed right side when open)
  const backCoverTex = createBackCoverTexture(maxAnisotropy);
  const backCoverBoard = new THREE.Mesh(
    new THREE.BoxGeometry(coverW, coverH, coverD),
    [
      leatherMat,
      leatherMat,
      leatherMat,
      new THREE.MeshStandardMaterial({ map: backCoverTex, roughness: 0.6 }),
      leatherMat,
      leatherMat,
    ],
  );
  backCoverBoard.position.set(coverW / 2 + 0.12, -0.05, 0);
  backCoverBoard.receiveShadow = true;
  backCoverBoard.castShadow = true;
  root.add(backCoverBoard);

  // Gold corner clasps on right board
  const cornerGeo = new THREE.BoxGeometry(0.32, coverH + 0.03, 0.32);
  const brCorner = new THREE.Mesh(cornerGeo, goldMat);
  brCorner.position.set(coverW + 0.02, -0.05, coverD / 2 - 0.12);
  const trCorner = brCorner.clone();
  trCorner.position.z = -coverD / 2 + 0.12;
  root.add(brCorner, trCorner);

  // Right Paper Block + Right Page Surface
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

  // 3. Front Cover + Left Paper Block (pivots around spine x=0 from closed to open!)
  const frontCoverPivot = new THREE.Group();
  frontCoverPivot.position.set(0.08, 0.04, 0);

  const coverFrontTex = createCoverTexture(maxAnisotropy);
  const coverFrontMat = new THREE.MeshStandardMaterial({
    map: coverFrontTex,
    roughness: 0.78,
    metalness: 0.05,
    envMapIntensity: 0.25,
  });

  // Top face of frontCoverBoard is visible when closed (rotation.z = 0)
  const frontCoverBoard = new THREE.Mesh(
    new THREE.BoxGeometry(coverW, coverH, coverD),
    [
      leatherMat,
      leatherMat,
      coverFrontMat,
      leatherMat,
      leatherMat,
      leatherMat,
    ],
  );
  frontCoverBoard.position.set(coverW / 2 + 0.04, 0.27, 0);
  frontCoverBoard.castShadow = true;
  frontCoverBoard.receiveShadow = true;
  frontCoverPivot.add(frontCoverBoard);

  // Miniature 3D Cover Medallion (Eros + tiny gold ring on front cover!)
  const medallionGroup = new THREE.Group();
  medallionGroup.position.set(coverW / 2 + 0.04, 0.36, 0.35);
  const medRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.04, 12, 32),
    goldMat,
  );
  medRing.rotation.x = Math.PI / 2;
  const medRock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.32, 1),
    new THREE.MeshStandardMaterial({ color: 0xd99b66, roughness: 0.65, metalness: 0.2 }),
  );
  medRock.scale.set(1.4, 0.55, 0.9);
  medallionGroup.add(medRing, medRock);
  frontCoverPivot.add(medallionGroup);

  // Left Page Block attached on the inside face of the Front Cover (visible when cover opens to PI)
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
  // Facing -Y locally so when cover rotates Math.PI around Z, it faces +Y!
  leftPageMesh.rotation.x = Math.PI / 2;
  leftPageMesh.rotation.z = Math.PI;
  leftPageMesh.position.set(pageW / 2 + 0.02, -0.035, 0);
  leftPageMesh.receiveShadow = true;
  frontCoverPivot.add(leftPageMesh);

  root.add(frontCoverPivot);

  // 4. Flexible Deforming Flipping Page Sheet
  const flippingPageGroup = new THREE.Group();
  flippingPageGroup.position.set(0, 0.25, 0);
  flippingPageGroup.visible = false;

  const flipGeo = new THREE.PlaneGeometry(pageW, pageD, 24, 2);
  flipGeo.rotateX(-Math.PI / 2);
  flipGeo.translate(pageW / 2, 0, 0); // Pivot at spine x=0
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

  // 5. 90-Degree Upright Pop-Up Story Text Pivot (zero background box behind text!)
  // Anchored along the back crease of the open book, standing vertically at 90 degrees!
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
  // Positioned high enough above the book spread so 3D models never block the words!
  popupTextMesh.position.set(0, 2.55, 0);
  popupTextMesh.renderOrder = 25;
  popupTextPivot.add(popupTextMesh);
  root.add(popupTextPivot);

  // Subtle glow halo sprite under the book in space
  const glowTex = createGlowSpriteTexture();
  const spaceAura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x3b82f6,
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
      const u = bx / pageW; // 0 at spine, 1 at outer edge
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
