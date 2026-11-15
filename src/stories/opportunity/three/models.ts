import * as THREE from 'three';
import {
  createBackCoverTexture,
  createClimateChartTexture,
  createCoverTexture,
  createEarthTexture,
  createGlowSpriteTexture,
  createMarsRockTexture,
  createMarsTexture,
  createRoverFaceTexture,
  createSolarPanelTexture,
  type RoverMood,
} from './textures';

export interface OpportunityRig {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  armGroup: THREE.Group;
  mastHead: THREE.Group;
  dishPivot: THREE.Group;
  setMood: (mood: RoverMood) => void;
  dispose: () => void;
}

/**
 * NASA Opportunity Rover (MER-B): 6-wheel rocker-bogie chassis (bottom at y = 0),
 * gold-foil WEB body, splayed batwing solar panels (clean or dust-covered),
 * tall Pancam mast with cute visor face, high-gain dish antenna, and IDD robotic arm.
 */
export function createOpportunityRover(
  maxAnisotropy = 4,
  dusty = false,
): OpportunityRig {
  const group = new THREE.Group();

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: dusty ? 0xb4784d : 0xf4b942,
    metalness: dusty ? 0.25 : 0.85,
    roughness: dusty ? 0.82 : 0.24,
  });
  const chassisMat = new THREE.MeshStandardMaterial({
    color: dusty ? 0x9b6446 : 0xe2e8f0,
    metalness: dusty ? 0.2 : 0.55,
    roughness: dusty ? 0.85 : 0.32,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: dusty ? 0x5c3626 : 0x1e293b,
    metalness: 0.45,
    roughness: dusty ? 0.8 : 0.42,
  });
  const solarTex = createSolarPanelTexture(dusty, maxAnisotropy);
  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: dusty ? 0.1 : 0.4,
    roughness: dusty ? 0.85 : 0.22,
  });

  // 1. Six Wheels on Rocker-Bogie Suspension (wheel radius = 0.11, center y = 0.11 -> grounded at y = 0)
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions: [number, number, number][] = [
    [-0.36, 0.11, 0.34],
    [0.36, 0.11, 0.34],
    [-0.38, 0.11, 0.0],
    [0.38, 0.11, 0.0],
    [-0.36, 0.11, -0.34],
    [0.36, 0.11, -0.34],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const w = new THREE.Mesh(wheelGeo, darkMat);
    w.position.set(wx, wy, wz);
    w.castShadow = true;
    wheels.push(w);
    group.add(w);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.09, 10),
      goldFoilMat,
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(wx, wy, wz);
    group.add(hub);

    // Suspension strut up to body
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.03), chassisMat);
    strut.position.set(wx * 0.82, 0.22, wz);
    strut.rotation.z = wx < 0 ? -0.45 : 0.45;
    group.add(strut);
  }

  // 2. Warm Electronics Box (WEB) Rover Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.56), goldFoilMat);
  body.position.y = 0.36;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Top Batwing Solar Panel Wings
  const centerDeck = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.035, 0.62), solarMat);
  centerDeck.position.y = 0.49;
  centerDeck.castShadow = true;
  group.add(centerDeck);

  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.028, 0.52), solarMat);
  leftWing.position.set(-0.42, 0.47, -0.02);
  leftWing.rotation.z = 0.14;
  leftWing.castShadow = true;

  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.028, 0.52), solarMat);
  rightWing.position.set(0.42, 0.47, -0.02);
  rightWing.rotation.z = -0.14;
  rightWing.castShadow = true;
  group.add(leftWing, rightWing);

  // 4. Pancam Mast Assembly (PMA) + Cute Visor Face Head
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.44, 10), chassisMat);
  mast.position.set(0, 0.7, 0.18);
  mast.castShadow = true;
  group.add(mast);

  const mastHead = new THREE.Group();
  mastHead.position.set(0, 0.94, 0.18);

  const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.18), chassisMat);
  headBox.castShadow = true;
  mastHead.add(headBox);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.04), darkMat);
  bezel.position.z = 0.085;
  mastHead.add(bezel);

  const moodTextures: Record<RoverMood, THREE.CanvasTexture> = {
    normal: createRoverFaceTexture('normal', maxAnisotropy),
    happy: createRoverFaceTexture('happy', maxAnisotropy),
    curious: createRoverFaceTexture('curious', maxAnisotropy),
    sleepy: createRoverFaceTexture('sleepy', maxAnisotropy),
    proud: createRoverFaceTexture('proud', maxAnisotropy),
  };

  const faceMat = new THREE.MeshBasicMaterial({ map: moodTextures.normal });
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.14), faceMat);
  faceMesh.position.z = 0.108;
  mastHead.add(faceMesh);

  // Little Pancam ears/lenses
  const camEarL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 10), darkMat);
  camEarL.rotation.x = Math.PI / 2;
  camEarL.position.set(-0.22, 0.04, 0.02);
  const camEarR = camEarL.clone();
  camEarR.position.x = 0.22;
  mastHead.add(camEarL, camEarR);
  group.add(mastHead);

  // 5. Rear High-Gain Dish Antenna
  const dishPivot = new THREE.Group();
  dishPivot.position.set(-0.14, 0.54, -0.2);
  dishPivot.rotation.x = -0.5;
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.09, 0.02),
    new THREE.Vector2(0.18, 0.08),
  ];
  const dish = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 18),
    new THREE.MeshStandardMaterial({
      color: dusty ? 0xc28a6b : 0xf8fafc,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
  );
  dish.rotation.x = Math.PI / 2;
  const dishTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 }),
  );
  dishTip.position.z = 0.14;
  dishPivot.add(dish, dishTip);
  group.add(dishPivot);

  // 6. Articulated Robotic Arm (IDD) on Front
  const armGroup = new THREE.Group();
  armGroup.position.set(0.18, 0.34, 0.28);

  const armLink = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.28), chassisMat);
  armLink.position.set(0, -0.03, 0.14);
  armLink.rotation.x = 0.25;

  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 12), goldFoilMat);
  turret.position.set(0, -0.09, 0.28);
  armGroup.add(armLink, turret);
  group.add(armGroup);

  return {
    group,
    wheels,
    armGroup,
    mastHead,
    dishPivot,
    setMood: (mood: RoverMood) => {
      faceMat.map = moodTextures[mood];
      faceMat.needsUpdate = true;
    },
    dispose: () => {
      Object.values(moodTextures).forEach((t) => t.dispose());
      solarTex.dispose();
    },
  };
}

export function createHematiteBlueberries(): THREE.Group {
  const group = new THREE.Group();
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x7a8699,
    metalness: 0.82,
    roughness: 0.24,
  });
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0xb85232,
    roughness: 0.9,
    flatShading: true,
  });

  const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.14, 14), rockMat);
  slab.position.y = 0.07;
  slab.receiveShadow = true;
  group.add(slab);

  const offsets: [number, number, number, number][] = [
    [-0.25, 0.18, 0.12, 0.065],
    [0.05, 0.19, 0.24, 0.072],
    [0.24, 0.18, -0.05, 0.06],
    [-0.08, 0.18, -0.22, 0.068],
    [0.14, 0.18, 0.06, 0.058],
    [-0.18, 0.17, 0.28, 0.054],
  ];
  for (const [x, y, z, r] of offsets) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), sphereMat);
    b.position.set(x, y, z);
    b.castShadow = true;
    group.add(b);
  }
  return group;
}

export function createLayeredBedrockAndSalt(): THREE.Group {
  const group = new THREE.Group();
  const strataColors = [0xa84324, 0xc8643a, 0xd98452];
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: strataColors[i],
      roughness: 0.88,
      flatShading: true,
    });
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(1.5 - i * 0.28, 0.16, 1.0 - i * 0.16),
      mat,
    );
    slab.position.set(-0.2 + i * 0.1, 0.08 + i * 0.15, -0.1);
    slab.rotation.y = 0.15 * i;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
  }

  // Ancient liquid water pool & sulfate salt crystals
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.7, 0.05, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
      roughness: 0.12,
      metalness: 0.05,
    }),
  );
  pool.position.set(0.45, 0.12, 0.35);
  group.add(pool);

  const saltMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xbae6fd,
    emissiveIntensity: 0.25,
    roughness: 0.18,
    metalness: 0.1,
  });
  const saltOffsets: [number, number, number, number][] = [
    [0.25, 0.2, 0.3, 0.14],
    [0.55, 0.22, 0.22, 0.16],
    [0.42, 0.18, 0.55, 0.12],
    [0.7, 0.19, 0.45, 0.11],
  ];
  for (const [sx, sy, sz, ss] of saltOffsets) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(ss, ss, ss), saltMat);
    cube.position.set(sx, sy, sz);
    cube.rotation.set(0.4, 0.6, 0.2);
    cube.castShadow = true;
    group.add(cube);
  }

  return group;
}

export function createDustStormVortex(count = 4): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const r = 0.28 + i * 0.14;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.045 + i * 0.008, 8, 24),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xd97742 : 0xb44b27,
        transparent: true,
        opacity: 0.68 - i * 0.08,
        roughness: 0.9,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.15 + i * 0.24;
    group.add(ring);
  }
  return group;
}

export interface AlienRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
}

export function createMartianAlien(skinHex = 0x4ade80, accentHex = 0xffe066): AlienRig {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.45 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

  const feet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.08, 14), skinMat);
  feet.position.y = 0.04;

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.22, 6, 12), skinMat);
  body.position.y = 0.28;
  body.castShadow = true;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), skinMat);
  head.scale.set(1.1, 0.92, 0.95);
  head.position.y = 0.62;
  head.castShadow = true;

  // Cute antennae
  for (const xOff of [-0.09, 0.09]) {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.18, 8), skinMat);
    stalk.position.set(xOff, 0.84, 0);
    stalk.rotation.z = xOff < 0 ? 0.25 : -0.25;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), accentMat);
    bulb.position.set(xOff * 1.45, 0.94, 0);
    group.add(stalk, bulb);
  }

  // Friendly big eyes & smile
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), darkMat);
  eyeL.position.set(-0.075, 0.64, 0.175);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.075;

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.05, 0.012, 8, 12, Math.PI),
    darkMat,
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.56, 0.18);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.18, 0.42, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.18, 4, 8), skinMat);
  armL.position.y = -0.09;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.18, 0.42, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.18, 4, 8), skinMat);
  armR.position.y = -0.09;
  rightArm.add(armR);

  group.add(feet, body, head, eyeL, eyeR, smile, leftArm, rightArm);
  return { group, leftArm, rightArm };
}

export function createMarsRocket(): THREE.Group {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.2 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.9, 18), hullMat);
  body.position.y = 0.58;
  body.castShadow = true;

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 18), redMat);
  nose.position.y = 1.24;
  nose.castShadow = true;

  const windowGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x7ce8ff, emissive: 0x0284c7, emissiveIntensity: 0.5 }),
  );
  windowGlass.position.set(0, 0.72, 0.22);

  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.22), redMat);
    fin.position.set(Math.sin(a) * 0.28, 0.18, Math.cos(a) * 0.28);
    fin.rotation.y = a;
    group.add(fin);
  }

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.14, 12), darkMat);
  nozzle.position.y = 0.07;
  group.add(body, nose, windowGlass, nozzle);
  return group;
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

export function createMarsGround(
  variant: 'crater' | 'plains' | 'ridge',
  maxAnisotropy = 4,
): THREE.Group {
  const group = new THREE.Group();
  const rockTex = createMarsRockTexture('#C95F38', '#85351D', maxAnisotropy);
  const marsMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    roughness: 0.9,
    metalness: 0.04,
    flatShading: true,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.4, 0.12, 32), marsMat);
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
    const rim = new THREE.Mesh(rimGeo, marsMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.15;
    rim.castShadow = true;
    rim.receiveShadow = true;
    group.add(rim);
  } else {
    const moundOffsets: [number, number, number, number][] =
      variant === 'ridge'
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
      const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(mr, 1), marsMat);
      mound.scale.set(1.3, 0.52, 1.0);
      mound.position.set(mx, my, mz);
      mound.castShadow = true;
      mound.receiveShadow = true;
      group.add(mound);
    }
  }

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x9b3e22,
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

export interface CharacterRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
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

export function createMarsAstronaut(): CharacterRig {
  const group = new THREE.Group();
  const suitMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.35 });
  const goldVisorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.15,
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

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.195, 20, 20), suitMat);
  helmet.position.y = 0.7;
  helmet.castShadow = true;

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 20, 16, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.2, Math.PI * 0.52),
    goldVisorMat,
  );
  visor.position.set(0, 0.7, 0.045);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 0.48, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.2, 4, 8), suitMat);
  armL.position.y = -0.1;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, 0.48, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.2, 4, 8), suitMat);
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

export function createClimateMonitor(maxAnisotropy = 4): { mesh: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 }),
  );
  stand.position.y = 0.14;
  const chartTex = createClimateChartTexture(maxAnisotropy);
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.48, 0.05),
    new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.3 }),
  );
  screen.position.y = 0.52;
  group.add(stand, screen);
  return { mesh: group, dispose: () => chartTex.dispose() };
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
  getPageTexture: (side: 'left' | 'right') => THREE.Texture | null;
  setFlippingPageTexture: (texture: THREE.Texture | null, ownsTexture?: boolean) => void;
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

  // Miniature 3D Cover Medallion: Red Mars Sphere + Gold Ring + Mini Solar-Wing Rover Emblem!
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
  const medRoverWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.04, 0.28),
    goldMat,
  );
  medRoverWing.position.y = 0.18;
  const medRoverMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.2, 8),
    goldMat,
  );
  medRoverMast.position.set(0, 0.28, 0.06);
  medallionGroup.add(medRing, medMars, medRoverWing, medRoverMast);
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
  flippingPageMesh.castShadow = false;
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
  let prevFlipTexOwned = true;

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
    getPageTexture: (side) => (side === 'left' ? prevLeftTex : prevRightTex),
    setFlippingPageTexture: (tex, ownsTexture = true) => {
      if (prevFlipTex === tex) {
        prevFlipTexOwned = ownsTexture;
        return;
      }
      if (prevFlipTex && prevFlipTexOwned) prevFlipTex.dispose();
      prevFlipTex = tex;
      prevFlipTexOwned = ownsTexture;
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
