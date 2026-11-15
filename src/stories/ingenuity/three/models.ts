import * as THREE from 'three';
import {
  createBackCoverTexture,
  createCoverTexture,
  createEarthTexture,
  createGlowSpriteTexture,
  createHelicopterFaceTexture,
  createMarsRockTexture,
  createMarsTexture,
  createSolarPanelTexture,
  type IngenuityMood,
} from './textures';

export interface IngenuityRig {
  group: THREE.Group;
  topRotor: THREE.Group;
  bottomRotor: THREE.Group;
  faceMesh: THREE.Mesh;
  setMood: (mood: IngenuityMood) => void;
  dispose: () => void;
}

export function createIngenuityHelicopter(maxAnisotropy = 4): IngenuityRig {
  const group = new THREE.Group();

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    metalness: 0.85,
    roughness: 0.25,
  });
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1e2433,
    metalness: 0.55,
    roughness: 0.42,
  });
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4f0,
    metalness: 0.72,
    roughness: 0.28,
  });
  const solarTex = createSolarPanelTexture(maxAnisotropy);
  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.45,
    roughness: 0.22,
  });

  // 1. Four splayed carbon-fiber landing legs with footpads (bottom at y = 0)
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  for (const angle of legAngles) {
    const legPivot = new THREE.Group();
    legPivot.position.set(0, 0.32, 0);
    legPivot.rotation.y = angle;

    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.016, 0.52, 8),
      carbonMat,
    );
    strut.position.set(0.18, -0.15, 0);
    strut.rotation.z = 0.62;
    strut.castShadow = true;

    const footPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.065, 0.024, 12),
      titaniumMat,
    );
    footPad.position.set(0.34, -0.31, 0);
    legPivot.add(strut, footPad);
    group.add(legPivot);
  }

  // 2. Insulated gold-foil avionics cube body
  const bodyBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.34, 0.42),
    goldFoilMat,
  );
  bodyBox.position.y = 0.44;
  bodyBox.castShadow = true;
  bodyBox.receiveShadow = true;
  group.add(bodyBox);

  // Corner bumpers & cute sensor face screen
  const faceFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.22, 0.06),
    carbonMat,
  );
  faceFrame.position.set(0, 0.44, 0.2);
  group.add(faceFrame);

  const moodTextures: Record<IngenuityMood, THREE.CanvasTexture> = {
    normal: createHelicopterFaceTexture('normal', maxAnisotropy),
    brave: createHelicopterFaceTexture('brave', maxAnisotropy),
    happy: createHelicopterFaceTexture('happy', maxAnisotropy),
    determined: createHelicopterFaceTexture('determined', maxAnisotropy),
    proud: createHelicopterFaceTexture('proud', maxAnisotropy),
  };

  const faceMat = new THREE.MeshBasicMaterial({
    map: moodTextures.normal,
  });
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.18), faceMat);
  faceMesh.position.set(0, 0.44, 0.232);
  group.add(faceMesh);

  // Small belly navigation camera
  const bellyCam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12),
    carbonMat,
  );
  bellyCam.position.set(0, 0.25, 0.08);
  group.add(bellyCam);

  // 3. Central Titanium Rotor Mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.038, 0.56, 12),
    titaniumMat,
  );
  mast.position.y = 0.86;
  mast.castShadow = true;
  group.add(mast);

  // 4. Coaxial Counter-Rotating Carbon-Fiber Rotor Blades
  const makeRotor = (yPos: number) => {
    const rotorGroup = new THREE.Group();
    rotorGroup.position.y = yPos;

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12),
      titaniumMat,
    );
    rotorGroup.add(hub);

    const blade1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 0.016, 0.12),
      carbonMat,
    );
    blade1.castShadow = true;
    const tip1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.02, 0.125),
      new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.3 }),
    );
    tip1.position.x = 0.74;
    const tip2 = tip1.clone();
    tip2.position.x = -0.74;
    rotorGroup.add(blade1, tip1, tip2);
    return rotorGroup;
  };

  const bottomRotor = makeRotor(0.76);
  const topRotor = makeRotor(0.92);
  topRotor.rotation.y = Math.PI / 2;
  group.add(bottomRotor, topRotor);

  // 5. Top Rectangular Solar Panel Assembly
  const solarMount = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.035, 0.36),
    solarMat,
  );
  solarMount.position.y = 1.12;
  solarMount.castShadow = true;
  const solarTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.025, 0.4),
    goldFoilMat,
  );
  solarTrim.position.y = 1.105;
  group.add(solarTrim, solarMount);

  // Little antenna whip on solar cap
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.012, 0.16, 8),
    titaniumMat,
  );
  antenna.position.set(0.24, 1.2, -0.1);
  group.add(antenna);

  return {
    group,
    topRotor,
    bottomRotor,
    faceMesh,
    setMood: (mood: IngenuityMood) => {
      faceMat.map = moodTextures[mood];
      faceMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
      solarTex.dispose();
    },
  };
}

export interface NextGenChopperRig {
  group: THREE.Group;
  rotors: THREE.Group[];
  dispose: () => void;
}

/** Sleek 6-rotor next-gen Mars helicopter assembled by the happy scientists */
export function createNextGenHelicopter(maxAnisotropy = 4): NextGenChopperRig {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.35,
    roughness: 0.28,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.65,
    roughness: 0.25,
  });
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.5,
    roughness: 0.4,
  });
  const solarTex = createSolarPanelTexture(maxAnisotropy);
  const solarMat = new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.25 });

  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.36, 6, 14), bodyMat);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.position.y = 0.35;
  fuselage.castShadow = true;
  group.add(fuselage);

  const solarTop = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.26), solarMat);
  solarTop.position.y = 0.56;
  group.add(solarTop);

  const rotors: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), accentMat);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = a;
    arm.position.set(Math.cos(a) * 0.28, 0.44, -Math.sin(a) * 0.28);
    group.add(arm);

    const rotor = new THREE.Group();
    rotor.position.set(Math.cos(a) * 0.52, 0.48, -Math.sin(a) * 0.52);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.012, 0.055), carbonMat);
    rotor.add(blade);
    group.add(rotor);
    rotors.push(rotor);
  }

  // Skids
  for (const zOff of [-0.18, 0.18]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 8), accentMat);
    skid.rotation.z = Math.PI / 2;
    skid.position.set(0, 0.04, zOff);
    group.add(skid);
  }

  return {
    group,
    rotors,
    dispose: () => {
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

export function createMarsPlanet(maxAnisotropy = 4): THREE.Group {
  const group = new THREE.Group();
  const marsTex = createMarsTexture(maxAnisotropy);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 32, 32),
    new THREE.MeshStandardMaterial({
      map: marsTex,
      roughness: 0.78,
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
      color: 0xff7b54,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  );
  halo.position.y = 0.76;
  group.add(halo);

  return group;
}

export function createJezeroCrater(maxAnisotropy = 4): THREE.Group {
  const group = new THREE.Group();
  const rockTex = createMarsRockTexture('#C95F38', '#85351D', maxAnisotropy);
  const marsMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    roughness: 0.9,
    metalness: 0.04,
    flatShading: true,
  });

  // Flat crater floor
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.25, 0.14, 32), marsMat);
  floor.position.y = 0.07;
  floor.receiveShadow = true;
  group.add(floor);

  // Sculpted outer crater rim
  const rimGeo = new THREE.TorusGeometry(1.95, 0.28, 12, 32);
  const pos = rimGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const wave = 1 + 0.18 * Math.sin(x * 3.1 + y * 2.3);
    pos.setXYZ(i, x * wave, y * wave, z * (0.7 + 0.35 * Math.cos(x * 2)));
  }
  rimGeo.computeVertexNormals();
  const rim = new THREE.Mesh(rimGeo, marsMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.16;
  rim.castShadow = true;
  rim.receiveShadow = true;
  group.add(rim);

  // Scattered Martian rocks on rim
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x9b3e22, roughness: 0.92, flatShading: true });
  const rockOffsets: [number, number, number, number][] = [
    [-1.4, 0.25, 0.9, 0.18],
    [1.35, 0.24, -0.8, 0.22],
    [1.6, 0.22, 0.7, 0.15],
    [-1.55, 0.22, -0.7, 0.16],
  ];
  for (const [rx, ry, rz, rs] of rockOffsets) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), rockMat);
    rock.position.set(rx, ry, rz);
    rock.castShadow = true;
    group.add(rock);
  }

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
  prop: 'none' | 'clipboard' | 'wrench' | 'tablet' = 'none',
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
  } else if (prop === 'wrench') {
    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.24, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 }),
    );
    shaft.position.set(0, -0.24, 0.08);
    shaft.rotation.x = -0.5;
    rightArm.add(shaft);
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
    color: isAstro ? 0xe11d48 : 0xfacc15,
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

  // Cute pigtails
  const puffL = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), hairMat);
  puffL.position.set(-0.2, 0.72, -0.04);
  const puffR = puffL.clone();
  puffR.position.x = 0.2;

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), darkMat);
  eyeL.position.set(-0.06, 0.69, 0.16);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;

  // Cute warm smile
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
        color: 0xffe4e6,
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
  // Dark red leather binding material
  const darkRedLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x420911,
    roughness: 0.72,
    metalness: 0.08,
    envMapIntensity: 0.3,
  });
  const paperEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x3b171f,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.03,
  });

  // 1. Center Spine Cradle
  const spineGroup = new THREE.Group();
  const spineBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, coverD),
    darkRedLeatherMat,
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
      darkRedLeatherMat,
      darkRedLeatherMat,
      darkRedLeatherMat,
      new THREE.MeshStandardMaterial({ map: backCoverTex, roughness: 0.6 }),
      darkRedLeatherMat,
      darkRedLeatherMat,
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

  // 3. Front Dark Red Cover + Left Paper Block
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
      darkRedLeatherMat,
      darkRedLeatherMat,
      coverFrontMat,
      darkRedLeatherMat,
      darkRedLeatherMat,
      darkRedLeatherMat,
    ],
  );
  frontCoverBoard.position.set(coverW / 2 + 0.04, 0.27, 0);
  frontCoverBoard.castShadow = true;
  frontCoverBoard.receiveShadow = true;
  frontCoverPivot.add(frontCoverBoard);

  // Miniature 3D Cover Medallion: Red Mars Sphere + Gold Ring + Mini Rotor Emblem!
  const medallionGroup = new THREE.Group();
  medallionGroup.position.set(coverW / 2 + 0.04, 0.36, 0.38);
  const medRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.04, 12, 32),
    goldMat,
  );
  medRing.rotation.x = Math.PI / 2;
  const medMars = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xd85c34, roughness: 0.65, metalness: 0.1 }),
  );
  medMars.scale.set(1, 0.42, 1);
  const medRotor = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.03, 0.1),
    goldMat,
  );
  medRotor.position.y = 0.18;
  medRotor.rotation.y = 0.45;
  medallionGroup.add(medRing, medMars, medRotor);
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

  // Warm Mars-crimson glow halo beneath the book
  const glowTex = createGlowSpriteTexture();
  const spaceAura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xc23b2b,
      transparent: true,
      opacity: 0.2,
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
