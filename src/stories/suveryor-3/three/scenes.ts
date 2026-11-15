import * as THREE from 'three';
import type { StorySceneId } from '../story/storyData';
import {
  createAsteroid,
  createEarth,
  createHeartMesh,
  createKidCharacter,
  createNearProbe,
  createRadioDish,
  createScientist,
  createStarMesh,
  type CharacterRig,
  type NearProbeRig,
} from './models';

export interface ActiveDiorama {
  group: THREE.Group;
  update: (elapsed: number, delta: number, actionBoost: number) => void;
  dispose: () => void;
}

function createSymbolExclamation(color = 0xffe066): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.035, 0.34, 10), mat);
  bar.position.y = 0.24;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), mat);
  dot.position.y = 0.0;
  g.add(bar, dot);
  return g;
}

function createSymbolQuestion(color = 0xff8a80): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 16, Math.PI * 1.4), mat);
  arc.position.y = 0.3;
  arc.rotation.z = -0.35;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), mat);
  stem.position.y = 0.14;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), mat);
  dot.position.y = 0.01;
  g.add(arc, stem, dot);
  return g;
}

function createPhotoTile(): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.52, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }),
  );
  const picture = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.34),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
  );
  picture.position.set(0, 0.04, 0.018);
  const miniRock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.09, 0),
    new THREE.MeshStandardMaterial({ color: 0xd99b66, roughness: 0.7 }),
  );
  miniRock.scale.set(1.3, 0.7, 0.4);
  miniRock.position.set(0, 0.04, 0.03);
  g.add(frame, picture, miniRock);
  return g;
}

function addCylinderBetween(
  group: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  const direction = new THREE.Vector3().subVectors(end, start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 8),
    material,
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(mesh);
  return mesh;
}

function createMoonGround(): THREE.Group {
  const ground = new THREE.Group();
  const surfaceMat = new THREE.MeshStandardMaterial({ color: 0xaaa7a1, roughness: 1 });
  const craterMat = new THREE.MeshStandardMaterial({ color: 0x777671, roughness: 1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc3c0b9, roughness: 1 });
  const surface = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.65, 0.3, 48), surfaceMat);
  surface.position.y = -0.15;
  surface.receiveShadow = true;
  ground.add(surface);

  for (const [x, z, radius] of [
    [-2.8, -0.8, 0.42],
    [2.4, -0.7, 0.52],
    [-1.6, 1.15, 0.3],
    [2.9, 1.35, 0.25],
    [-3.3, 1.6, 0.2],
  ]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.055, 8, 24), rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(x, 0.015, z);
    const crater = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24),
      craterMat,
    );
    crater.rotation.x = -Math.PI / 2;
    crater.position.set(x, 0.005, z);
    ground.add(rim, crater);
  }
  return ground;
}

function createSurveyorLander(): { group: THREE.Group; digArm: THREE.Group } {
  const group = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xc99b4b, metalness: 0.62, roughness: 0.38 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xcbd0d4, metalness: 0.72, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x343b42, metalness: 0.45, roughness: 0.55 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x52c9e8, emissive: 0x145276, roughness: 0.2 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.68), gold);
  body.position.y = 0.92;
  body.castShadow = true;
  group.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.38, 0.16, 8), silver);
  top.position.y = 1.25;
  group.add(top);

  const cameraMast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.62, 8), silver);
  cameraMast.position.set(-0.15, 1.62, 0);
  group.add(cameraMast);
  const camera = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.24, 0.24), dark);
  camera.position.set(-0.15, 1.98, 0);
  group.add(camera);
  const cameraLens = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), glass);
  cameraLens.position.set(-0.15, 1.98, 0.14);
  group.add(cameraLens);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const hip = new THREE.Vector3(Math.cos(angle) * 0.27, 0.75, Math.sin(angle) * 0.27);
    const foot = new THREE.Vector3(Math.cos(angle) * 0.72, 0.06, Math.sin(angle) * 0.72);
    addCylinderBetween(group, hip, foot, 0.045, silver);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.08, 12), gold);
    pad.position.copy(foot);
    pad.position.y = 0.04;
    group.add(pad);
  }

  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.035, 0.56),
    new THREE.MeshStandardMaterial({ color: 0x315a86, metalness: 0.52, roughness: 0.26 }),
  );
  panel.position.set(-0.72, 1.0, -0.03);
  panel.rotation.z = -0.18;
  group.add(panel);

  const digArm = new THREE.Group();
  digArm.position.set(0.35, 0.85, 0.12);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.075, 0.075), silver);
  upper.position.x = 0.24;
  digArm.add(upper);
  const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.065, 0.065), silver);
  forearm.position.set(0.62, -0.12, 0);
  forearm.rotation.z = -0.35;
  digArm.add(forearm);
  const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.22), gold);
  scoop.position.set(0.82, -0.27, 0);
  digArm.add(scoop);
  group.add(digArm);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 8), silver);
  antenna.position.set(0.22, 1.48, -0.15);
  antenna.rotation.z = -0.35;
  group.add(antenna);
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), gold);
  antennaTip.position.set(0.32, 1.75, -0.15);
  group.add(antennaTip);
  return { group, digArm };
}

function createApolloLunarModule(): THREE.Group {
  const module = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xc79a4f, metalness: 0.68, roughness: 0.34 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x31343b, metalness: 0.35, roughness: 0.52 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x294e69, metalness: 0.32, roughness: 0.2 });
  const ascent = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.68, 6), gold);
  ascent.position.y = 1.47;
  module.add(ascent);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.08), windowMat);
  cabin.position.set(0, 1.5, 0.31);
  module.add(cabin);
  const descent = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.92, 0.48, 8), gold);
  descent.position.y = 0.86;
  module.add(descent);
  const engine = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.42, 8), dark);
  engine.position.y = 0.42;
  engine.rotation.x = Math.PI;
  module.add(engine);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const hip = new THREE.Vector3(Math.cos(angle) * 0.55, 0.76, Math.sin(angle) * 0.55);
    const foot = new THREE.Vector3(Math.cos(angle) * 1.08, 0.06, Math.sin(angle) * 1.08);
    addCylinderBetween(module, hip, foot, 0.045, dark);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.07, 10), gold);
    pad.position.set(foot.x, 0.035, foot.z);
    module.add(pad);
  }
  return module;
}

function disposeDioramaGroup(group: THREE.Group): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
    meshMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

function buildSurveyorDiorama(
  sceneId: StorySceneId,
  maxAnisotropy: number,
): ActiveDiorama {
  const group = new THREE.Group();
  const moon = createMoonGround();
  group.add(moon);
  let updateFn: ActiveDiorama['update'] = () => {};

  const surveyor = createSurveyorLander();
  if (sceneId === 'meet-surveyor') {
    surveyor.group.position.set(0.65, 0, 0.05);
    surveyor.group.scale.setScalar(0.86);
    group.add(surveyor.group);
    const lily = createKidCharacter('lily');
    lily.group.position.set(-1.55, 0, 0.72);
    lily.group.rotation.y = -0.3;
    group.add(lily.group);
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-2.2, 2.45, -1.5);
    earth.scale.setScalar(0.42);
    group.add(earth);
    updateFn = (t, _delta, boost) => {
      earth.rotation.y = t * 0.2;
      lily.rightArm.rotation.z = 2.2 + Math.sin(t * 5) * 0.28;
      surveyor.group.rotation.y = Math.sin(t * 0.8) * 0.12 + boost * Math.PI * 2;
    };
  } else if (sceneId === 'mission') {
    moon.position.set(2.1, 0, 0);
    moon.scale.setScalar(0.42);
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-2.4, 0.95, 0.25);
    earth.scale.setScalar(0.72);
    group.add(earth);
    surveyor.group.position.set(-0.1, 1.15, 0.35);
    surveyor.group.scale.setScalar(0.55);
    group.add(surveyor.group);
    const scientist1 = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    scientist1.group.position.set(-2.9, 0, 1.25);
    scientist1.group.scale.setScalar(0.65);
    group.add(scientist1.group);
    const route = new THREE.Group();
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), dotMaterial);
      dot.position.set(-1.4 + u * 2.7, 1.0 + Math.sin(u * Math.PI) * 0.45, 0.25);
      route.add(dot);
    }
    group.add(route);
    updateFn = (t, _delta, boost) => {
      earth.rotation.y = t * 0.3;
      const phase = (Math.sin(t * (0.45 + boost * 0.25)) + 1) / 2;
      surveyor.group.position.set(-1.25 + phase * 2.2, 1.0 + Math.sin(phase * Math.PI) * 0.65, 0.35);
      surveyor.group.rotation.z = -0.12 * Math.cos(t);
    };
  } else if (sceneId === 'moon-work') {
    surveyor.group.position.set(-0.35, 0, 0.1);
    group.add(surveyor.group);
    const photo = createPhotoTile();
    photo.position.set(1.55, 1.15, 0.35);
    photo.scale.setScalar(1.15);
    group.add(photo);
    const soilSample = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x8b8880, roughness: 1 }),
    );
    soilSample.scale.y = 0.42;
    soilSample.position.set(0.75, 0.05, 0.25);
    group.add(soilSample);
    updateFn = (t, _delta, boost) => {
      surveyor.digArm.rotation.z = -0.18 + Math.sin(t * 2.4) * 0.22 - boost * 0.45;
      photo.rotation.y = Math.sin(t * 1.4) * 0.2;
      photo.position.y = 1.15 + Math.sin(t * 2) * 0.08;
    };
  } else if (sceneId === 'signal-quiet') {
    surveyor.group.position.set(0.2, 0, 0);
    surveyor.group.rotation.y = 0.55;
    group.add(surveyor.group);
    const earth = createEarth(maxAnisotropy);
    earth.position.set(2.35, 2.1, -1.5);
    earth.scale.setScalar(0.36);
    group.add(earth);
    updateFn = (t) => {
      earth.rotation.y = t * 0.12;
    };
  } else if (sceneId === 'apollo-arrives') {
    surveyor.group.position.set(-0.7, 0, 0.25);
    surveyor.group.scale.setScalar(0.76);
    group.add(surveyor.group);
    const apollo = createApolloLunarModule();
    apollo.position.set(1.6, 0, 0.1);
    apollo.scale.setScalar(0.78);
    group.add(apollo);
    updateFn = (t, _delta, boost) => {
      apollo.position.y = Math.abs(Math.sin(t * 1.2)) * 0.08 + boost * 0.22;
      apollo.rotation.y = Math.sin(t * 0.5) * 0.08;
    };
  } else if (sceneId === 'visitors') {
    surveyor.group.position.set(-0.75, 0, -0.15);
    surveyor.group.scale.setScalar(0.72);
    group.add(surveyor.group);
    const apollo = createApolloLunarModule();
    apollo.position.set(2.4, 0, -0.35);
    apollo.scale.setScalar(0.42);
    group.add(apollo);
    const conrad = createKidCharacter('jacob-astronaut');
    conrad.group.position.set(0.75, 0, 0.8);
    conrad.group.scale.setScalar(0.82);
    const bean = createKidCharacter('jacob-astronaut');
    bean.group.position.set(1.55, 0, 0.95);
    bean.group.scale.setScalar(0.78);
    bean.group.rotation.y = 0.35;
    group.add(conrad.group, bean.group);
    const returnedPart = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.22, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xc99b4b, metalness: 0.5, roughness: 0.4 }),
    );
    returnedPart.position.set(1.12, 1.75, 0.65);
    group.add(returnedPart);
    updateFn = (t, _delta, boost) => {
      conrad.rightArm.rotation.z = 1.4 + Math.sin(t * 2.5) * 0.16 + boost * 0.25;
      bean.leftArm.rotation.z = -1.35 - Math.sin(t * 2.5 + 0.5) * 0.16;
      returnedPart.rotation.y = t * 0.7;
      returnedPart.position.y = 1.72 + Math.sin(t * 2) * 0.08;
    };
  } else {
    surveyor.group.position.set(0.15, 0, 0);
    surveyor.group.scale.setScalar(0.88);
    group.add(surveyor.group);
    const earth = createEarth(maxAnisotropy);
    earth.position.set(2.25, 2.25, -1.4);
    earth.scale.setScalar(0.4);
    group.add(earth);
    const lily = createKidCharacter('lily');
    lily.group.position.set(-2.0, 0, 0.8);
    lily.group.scale.setScalar(0.86);
    const jacob = createKidCharacter('jacob-casual');
    jacob.group.position.set(-1.2, 0, 1.0);
    jacob.group.scale.setScalar(0.82);
    group.add(lily.group, jacob.group);
    const star = createStarMesh(0xffe066, 0.18);
    star.position.set(1.35, 2.0, 0.45);
    group.add(star);
    updateFn = (t, _delta, boost) => {
      earth.rotation.y = t * 0.16;
      surveyor.group.rotation.y = Math.sin(t * 0.7) * 0.1 + boost * Math.PI * 2;
      star.rotation.y = t * 1.8;
      star.scale.setScalar(0.9 + Math.sin(t * 3) * 0.12);
    };
  }

  return {
    group,
    update: updateFn,
    dispose: () => disposeDioramaGroup(group),
  };
}

function isSurveyorScene(sceneId: StorySceneId): boolean {
  return (
    sceneId === 'meet-surveyor' ||
    sceneId === 'mission' ||
    sceneId === 'moon-work' ||
    sceneId === 'signal-quiet' ||
    sceneId === 'apollo-arrives' ||
    sceneId === 'visitors' ||
    sceneId === 'legacy'
  );
}

export function buildStoryDiorama(
  sceneId: StorySceneId,
  maxAnisotropy = 4,
): ActiveDiorama {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  if (sceneId === 'cover') {
    return {
      group,
      update: () => {},
      dispose: () => {},
    };
  }

  if (isSurveyorScene(sceneId)) {
    return buildSurveyorDiorama(sceneId, maxAnisotropy);
  }

  const near: NearProbeRig = createNearProbe(maxAnisotropy);
  disposables.push(near);

  // Per-scene custom animated actors
  let updateFn: (elapsed: number, delta: number, actionBoost: number) => void = () => {};

  if (sceneId === 'meet-near') {
    near.setMood('happy');
    near.group.position.set(0, 0.65, 0.25);
    near.group.scale.setScalar(1.05);
    group.add(near.group);

    const jacob: CharacterRig = createKidCharacter('jacob-casual');
    jacob.group.position.set(-1.95, 0, 0.75);
    jacob.group.rotation.y = 0.42;
    group.add(jacob.group);

    const lily: CharacterRig = createKidCharacter('lily');
    lily.group.position.set(1.95, 0, 0.75);
    lily.group.rotation.y = -0.42;
    group.add(lily.group);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0x7ce8ff, 0.12)];
    stars[0].position.set(-1.1, 1.5, -0.3);
    stars[1].position.set(1.1, 1.55, -0.2);
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      near.group.position.y = 0.65 + Math.sin(t * 2.2) * 0.12 + boost * 0.35;
      near.group.rotation.y = Math.sin(t * 0.8) * 0.25 + boost * Math.PI * 2;
      near.dishGroup.rotation.y = t * 1.1;
      jacob.rightArm.rotation.z = 2.4 + Math.sin(t * 6) * 0.35;
      lily.leftArm.rotation.z = -2.4 - Math.sin(t * 6 + 0.5) * 0.35;
      stars[0].rotation.y = t * 1.6;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'mission') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-2.05, 0.1, 0.45);
    earth.scale.setScalar(0.85);
    group.add(earth);

    const sci = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    sci.group.position.set(-1.15, 0, 1.35);
    sci.group.rotation.y = 0.5;
    group.add(sci.group);

    const eros = createAsteroid({ kind: 'eros', scale: 0.9, maxAnisotropy });
    eros.position.set(2.1, 0.35, 0.2);
    group.add(eros);

    near.setMood('normal');
    near.group.scale.setScalar(0.75);
    group.add(near.group);

    // Dotted glowing mission arc from Earth to Eros
    const arcDots: THREE.Mesh[] = [];
    const dotGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const x = THREE.MathUtils.lerp(-1.4, 1.5, u);
      const y = 0.75 + Math.sin(u * Math.PI) * 1.15;
      const z = THREE.MathUtils.lerp(0.45, 0.2, u);
      const d = new THREE.Mesh(dotGeo, dotMat);
      d.position.set(x, y, z);
      group.add(d);
      arcDots.push(d);
    }

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.35;
      eros.rotation.y = t * 0.4;
      const speed = 0.42 + boost * 0.9;
      const u = (Math.sin(t * speed) + 1) * 0.5;
      near.group.position.set(
        THREE.MathUtils.lerp(-1.25, 1.35, u),
        0.9 + Math.sin(u * Math.PI) * 1.05,
        0.4,
      );
      near.group.rotation.z = -0.25 * Math.cos(t * speed);
      sci.leftArm.rotation.z = -0.5 + Math.sin(t * 3) * 0.25;
      arcDots.forEach((d, idx) => {
        const s = 0.8 + 0.45 * Math.sin(t * 4 - idx * 0.6);
        d.scale.setScalar(s);
      });
    };
  } else if (sceneId === 'blast-off') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-1.95, 0, 0.35);
    earth.scale.setScalar(0.92);
    group.add(earth);

    const sci1 = createScientist(0x3b2314, 0x38bdf8, 'none');
    sci1.group.position.set(-2.55, 0, 1.45);
    sci1.group.rotation.y = 0.35;
    const sci2 = createScientist(0x9a3412, 0xf472b6, 'none');
    sci2.group.position.set(-1.25, 0, 1.45);
    sci2.group.rotation.y = -0.25;
    group.add(sci1.group, sci2.group);

    near.setMood('happy');
    near.thrusterFlames.visible = true;
    near.group.scale.setScalar(0.88);
    near.group.position.set(1.25, 1.25, 0.25);
    near.group.rotation.z = -0.28;
    group.add(near.group);

    // Smoke puff rings rising below NEAR
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.05, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.65 }),
      );
      r.rotation.x = Math.PI / 2;
      group.add(r);
      rings.push(r);
    }

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.3;
      sci1.rightArm.rotation.z = 2.4 + Math.sin(t * 7) * 0.4;
      sci2.leftArm.rotation.z = -2.4 - Math.sin(t * 7 + 0.4) * 0.4;

      near.group.position.y = 1.25 + Math.sin(t * 2.5) * 0.14 + boost * 0.65;
      near.group.position.x = 1.25 + boost * 0.25;
      const flamePulse = 0.9 + Math.sin(t * 26) * 0.2 + boost * 0.7;
      near.thrusterFlames.scale.set(1, flamePulse, 1);

      rings.forEach((r, idx) => {
        const phase = (t * 1.4 + idx * 0.25) % 1;
        r.position.set(1.12 - phase * 0.35, 1.05 - phase * 0.85, 0.25);
        r.scale.setScalar(0.6 + phase * 1.4);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.6;
      });
    };
  } else if (sceneId === 'mathilde') {
    near.setMood('happy');
    near.group.position.set(-1.55, 0.85, 0.35);
    near.group.scale.setScalar(0.85);
    group.add(near.group);

    const mathilde = createAsteroid({ kind: 'mathilde', scale: 1.18, maxAnisotropy });
    mathilde.position.set(1.65, 0.3, 0.3);
    mathilde.rotation.y = -0.35;
    group.add(mathilde);

    const waveArm = mathilde.getObjectByName('mathildeWaveArm');

    updateFn = (t, _dt, boost) => {
      near.group.position.y = 0.85 + Math.sin(t * 2) * 0.14 + boost * 0.25;
      near.group.rotation.z = -0.15 + Math.sin(t * 4.5) * 0.12;
      near.wings[0].rotation.z = Math.sin(t * 5.5) * 0.25;
      mathilde.position.y = 0.3 + Math.cos(t * 1.6) * 0.08;
      if (waveArm) {
        waveArm.rotation.z = Math.sin(t * 5.5) * 0.45 + boost * 0.5;
      }
    };
  } else if (sceneId === 'passed-stop') {
    // Glowing EROS road-sign marker on the far left
    const signGroup = new THREE.Group();
    signGroup.position.set(-2.35, 0, 0.55);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 }),
    );
    pole.position.y = 0.6;
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.4, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 }),
    );
    board.position.y = 1.15;
    const miniEros = createAsteroid({ kind: 'eros', scale: 0.35, maxAnisotropy });
    miniEros.position.set(0, 1.35, 0);
    signGroup.add(pole, board, miniEros);
    group.add(signGroup);

    near.setMood('shocked');
    near.group.position.set(1.8, 0.9, 0.4);
    near.group.scale.setScalar(0.92);
    group.add(near.group);

    const excl1 = createSymbolExclamation(0xffe066);
    excl1.position.set(2.5, 1.75, 0.4);
    const excl2 = createSymbolExclamation(0xff8a80);
    excl2.scale.setScalar(0.75);
    excl2.position.set(1.1, 1.7, 0.4);
    group.add(excl1, excl2);

    updateFn = (t, _dt, boost) => {
      miniEros.rotation.y = t * 1.2;
      near.group.position.y = 0.9 + Math.sin(t * 3.5) * 0.1;
      near.group.rotation.y = Math.sin(t * 2.8) * 0.45 + boost * Math.PI * 2;
      near.group.rotation.z = Math.sin(t * 5) * 0.12;
      excl1.position.y = 1.75 + Math.abs(Math.sin(t * 5)) * 0.2;
      excl2.position.y = 1.7 + Math.abs(Math.cos(t * 5)) * 0.18;
    };
  } else if (sceneId === 'lost-connection') {
    const dish = createRadioDish();
    dish.position.set(-2.15, 0, 0.75);
    dish.rotation.y = 0.65;
    group.add(dish);

    // Broken red signal arcs that fizzle out
    const signalRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.24 + i * 0.14, 0.025, 8, 20, Math.PI * 0.75),
        new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.7 }),
      );
      arc.rotation.z = -Math.PI * 0.35;
      group.add(arc);
      signalRings.push(arc);
    }

    near.setMood('crying');
    near.group.position.set(1.55, 0.75, 0.35);
    near.group.scale.setScalar(0.95);
    near.dishGroup.rotation.x = 0.22; // Drooping dish
    group.add(near.group);

    // Animated falling 3D blue teardrops!
    const tears: THREE.Mesh[] = [];
    const tearMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.15,
    });
    for (let i = 0; i < 4; i++) {
      const tear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), tearMat);
      tear.scale.set(0.85, 1.35, 0.85);
      group.add(tear);
      tears.push(tear);
    }

    updateFn = (t, _dt, boost) => {
      near.group.position.y = 0.75 + Math.sin(t * 1.5) * 0.06;
      near.group.rotation.z = Math.sin(t * 1.8) * 0.06;

      signalRings.forEach((ring, idx) => {
        const p = (t * (0.9 + boost) + idx * 0.33) % 1;
        ring.position.set(-1.8 + p * 1.65, 0.72 + p * 0.3, 0.65);
        ring.scale.setScalar(0.7 + p * 0.9);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p * 1.25);
      });

      tears.forEach((tear, idx) => {
        const p = (t * 1.15 + idx * 0.25) % 1;
        const side = idx % 2 === 0 ? -0.18 : 0.18;
        tear.position.set(1.55 + side, 1.05 - p * 0.8, 0.82);
        tear.visible = p < 0.85;
      });
    };
  } else if (sceneId === 'back-on-track') {
    const dish = createRadioDish();
    dish.position.set(-2.15, 0, 0.7);
    dish.rotation.y = 0.65;
    group.add(dish);

    // Bright green/cyan restored signal pulses traveling all the way to NEAR
    const waveRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.032, 10, 24),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.9 }),
      );
      ring.rotation.y = Math.PI / 2;
      group.add(ring);
      waveRings.push(ring);
    }

    near.setMood('happy');
    near.group.position.set(1.45, 0.85, 0.35);
    near.group.scale.setScalar(0.95);
    group.add(near.group);

    const stars = [
      createStarMesh(0xffe066, 0.15),
      createStarMesh(0x34d399, 0.13),
      createStarMesh(0x7ce8ff, 0.14),
    ];
    stars.forEach((s) => group.add(s));

    updateFn = (t, _dt, boost) => {
      near.group.position.y = 0.85 + Math.abs(Math.sin(t * 3.8)) * 0.28 + boost * 0.3;
      near.group.rotation.y = Math.sin(t * 2) * 0.35 + boost * Math.PI * 2;
      near.dishGroup.rotation.y = t * 2.5;

      waveRings.forEach((r, idx) => {
        const p = (t * 1.2 + idx * 0.25) % 1;
        r.position.set(THREE.MathUtils.lerp(-1.8, 1.2, p), 0.72 + Math.sin(p * Math.PI) * 0.4, 0.55);
        r.scale.setScalar(0.8 + Math.sin(p * Math.PI) * 0.6);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.9 - p * 0.4;
      });

      stars.forEach((s, idx) => {
        const a = t * 1.8 + (idx * Math.PI * 2) / 3;
        s.position.set(1.45 + Math.cos(a) * 1.05, 1.35 + Math.sin(t * 3 + idx) * 0.2, 0.35 + Math.sin(a) * 0.6);
        s.rotation.y = t * 2.2;
      });
    };
  } else if (sceneId === 'orbiting-eros') {
    const eros = createAsteroid({ kind: 'eros', scale: 1.22, maxAnisotropy });
    eros.position.set(0.35, 0.25, 0.25);
    group.add(eros);

    near.setMood('happy');
    near.cameraProp.visible = true;
    near.group.scale.setScalar(0.76);
    group.add(near.group);

    const photos = [createPhotoTile(), createPhotoTile()];
    group.add(photos[0], photos[1]);

    updateFn = (t, _dt, boost) => {
      eros.rotation.y = t * 0.28;
      const orbitA = t * 0.95 + boost * 2.0;
      near.group.position.set(
        0.35 + Math.cos(orbitA) * 1.85,
        0.95 + Math.sin(t * 2.4) * 0.14,
        0.25 + Math.sin(orbitA) * 1.25,
      );
      near.group.lookAt(0.35, 0.85, 0.25);

      // Periodic camera flash pulse
      const flashCycle = (t * 0.8 + boost) % 1;
      const flashing = flashCycle < 0.14 || boost > 0.25;
      near.cameraFlashMesh.scale.setScalar(flashing ? 2.8 : 0.7);

      photos.forEach((p, idx) => {
        const phase = (t * 0.45 + idx * 0.5) % 1;
        p.position.set(
          THREE.MathUtils.lerp(0.2, -2.5, phase),
          1.15 + Math.sin(phase * Math.PI) * 0.55,
          0.35,
        );
        p.rotation.y = Math.sin(t * 2 + idx) * 0.25;
        p.scale.setScalar(0.85 - phase * 0.3);
      });
    };
  } else if (sceneId === 'unexpected-landing') {
    const sci = createScientist(0x4a3525, 0xef4444, 'megaphone');
    sci.group.position.set(-2.1, 0, 0.75);
    sci.group.rotation.y = 0.65;
    group.add(sci.group);

    const eros = createAsteroid({ kind: 'eros', scale: 1.32, maxAnisotropy });
    eros.position.set(1.25, 0.05, 0.25);
    group.add(eros);

    near.setMood('happy');
    near.group.scale.setScalar(0.76);
    near.group.position.set(1.25, 1.32, 0.3);
    group.add(near.group);

    // Cute landing dust puffs on Eros
    const puffs: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xe7d3b8, roughness: 0.9, transparent: true, opacity: 0.7 }),
      );
      group.add(puff);
      puffs.push(puff);
    }

    updateFn = (t, _dt, boost) => {
      sci.rightArm.rotation.x = -1.2 + Math.sin(t * 5) * 0.15;
      const bob = Math.abs(Math.sin(t * 1.4)) * 0.35 + boost * 0.45;
      near.group.position.y = 1.24 + bob;
      near.group.rotation.z = Math.sin(t * 2.1) * 0.08;

      puffs.forEach((p, idx) => {
        const a = (idx * Math.PI) / 2 + t * 0.6;
        const spread = 0.35 + (1 - bob) * 0.3;
        p.position.set(1.25 + Math.cos(a) * spread, 1.25, 0.3 + Math.sin(a) * spread * 0.6);
        p.scale.setScalar(0.6 + (1 - Math.min(bob, 0.5)) * 0.8);
      });
    };
  } else if (sceneId === 'nothing-impossible') {
    const sci1 = createScientist(0x3b2314, 0x38bdf8, 'none');
    sci1.group.position.set(-2.35, 0, 0.8);
    sci1.group.rotation.y = 0.45;
    const sci2 = createScientist(0x9a3412, 0xf59e0b, 'none');
    sci2.group.position.set(-1.35, 0, 0.95);
    sci2.group.rotation.y = 0.35;
    group.add(sci1.group, sci2.group);

    const qMark = createSymbolQuestion(0xff8a80);
    qMark.position.set(-2.1, 1.2, 0.8);
    const eMark = createSymbolExclamation(0xffe066);
    eMark.position.set(-1.2, 1.25, 0.95);
    group.add(qMark, eMark);

    const eros = createAsteroid({ kind: 'eros', scale: 1.32, maxAnisotropy });
    eros.position.set(1.45, 0.05, 0.25);
    group.add(eros);

    near.setMood('smug');
    near.sunglasses.visible = true;
    near.group.scale.setScalar(0.84);
    near.group.position.set(1.45, 1.25, 0.32);
    group.add(near.group);

    const stars = [createStarMesh(0xffe066, 0.16), createStarMesh(0x7ce8ff, 0.14)];
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      // Shocked scientists throw both arms up!
      sci1.leftArm.rotation.z = -2.6 + Math.sin(t * 7) * 0.15;
      sci1.rightArm.rotation.z = 2.6 - Math.sin(t * 7) * 0.15;
      sci2.leftArm.rotation.z = -2.5 - Math.cos(t * 7) * 0.15;
      sci2.rightArm.rotation.z = 2.5 + Math.cos(t * 7) * 0.15;
      qMark.position.y = 1.22 + Math.sin(t * 4) * 0.1;
      eMark.position.y = 1.25 + Math.cos(t * 4) * 0.1;

      near.group.position.y = 1.25 + boost * 0.35;
      near.group.rotation.y = -0.2 + Math.sin(t * 1.5) * 0.18 + boost * Math.PI * 2;
      stars[0].position.set(0.55, 1.9 + Math.sin(t * 2.5) * 0.15, 0.3);
      stars[1].position.set(2.35, 1.85 + Math.cos(t * 2.5) * 0.15, 0.3);
      stars[0].rotation.y = t * 2;
      stars[1].rotation.y = -t * 2;
    };
  } else if (sceneId === 'grandpa-eros') {
    const grandpa = createAsteroid({ kind: 'grandpa-eros', scale: 1.45, maxAnisotropy });
    grandpa.position.set(0.15, 0.08, 0.35);
    group.add(grandpa);

    const photos = [createPhotoTile(), createPhotoTile(), createPhotoTile()];
    photos.forEach((p) => group.add(p));

    const stars = [createStarMesh(0xffe066, 0.13), createStarMesh(0xffe066, 0.11)];
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      grandpa.rotation.y = Math.sin(t * 0.9) * 0.18 + boost * 0.4;
      grandpa.position.y = 0.08 + Math.sin(t * 1.8) * 0.04;

      photos.forEach((p, idx) => {
        const a = t * 0.65 + (idx * Math.PI * 2) / 3;
        p.position.set(0.15 + Math.cos(a) * 2.25, 1.15 + Math.sin(t * 2 + idx) * 0.16, 0.35 + Math.sin(a) * 0.95);
        p.rotation.y = -a + Math.PI / 2;
      });
      stars[0].position.set(-2.1, 1.6 + Math.sin(t * 2) * 0.15, 0.2);
      stars[1].position.set(2.3, 1.5 + Math.cos(t * 2) * 0.15, 0.2);
    };
  } else if (sceneId === 'never-forgotten') {
    const sci1 = createScientist(0x4a3525, 0x38bdf8, 'heart');
    sci1.group.position.set(-2.3, 0, 0.85);
    sci1.group.rotation.y = 0.45;
    const lily = createKidCharacter('lily');
    lily.group.position.set(-1.35, 0, 1.0);
    lily.group.rotation.y = 0.35;
    group.add(sci1.group, lily.group);

    const eros = createAsteroid({ kind: 'eros', scale: 1.32, maxAnisotropy });
    eros.position.set(1.45, 0.05, 0.25);
    group.add(eros);

    near.setMood('sleeping');
    near.group.scale.setScalar(0.8);
    near.group.position.set(1.45, 1.24, 0.3);
    group.add(near.group);

    // Floating warm golden thank-you hearts & stars
    const hearts = [
      createHeartMesh(0xf43f5e, 0.24),
      createHeartMesh(0xfb7185, 0.2),
      createHeartMesh(0xfbbf24, 0.22),
    ];
    hearts.forEach((h) => group.add(h));

    updateFn = (t, _dt, boost) => {
      lily.rightArm.rotation.z = 2.1 + Math.sin(t * 2.5) * 0.2;
      hearts.forEach((h, idx) => {
        const p = (t * (0.35 + boost * 0.4) + idx * 0.33) % 1;
        h.position.set(-0.6 + idx * 0.7, 0.7 + p * 1.4, 0.45);
        h.rotation.y = t * 1.5 + idx;
        h.scale.setScalar(0.24 * Math.sin(p * Math.PI));
      });
    };
  } else if (sceneId === 'cosmic-hug') {
    near.setMood('happy');
    near.group.position.set(-0.22, 0.45, 0.45);
    near.group.scale.setScalar(0.95);
    group.add(near.group);

    // Jacob in full white/cobalt Astronaut Suit hugging NEAR!
    const jacobAstro = createKidCharacter('jacob-astronaut');
    jacobAstro.group.position.set(0.45, 0.02, 0.65);
    jacobAstro.group.rotation.y = -0.95;
    jacobAstro.group.scale.setScalar(1.15);
    // Wrap arms forward around NEAR
    jacobAstro.leftArm.rotation.x = -1.25;
    jacobAstro.leftArm.rotation.z = 0.35;
    jacobAstro.rightArm.rotation.x = -1.25;
    jacobAstro.rightArm.rotation.z = -0.35;
    group.add(jacobAstro.group);

    const lily = createKidCharacter('lily');
    lily.group.position.set(-2.05, 0, 0.85);
    lily.group.rotation.y = 0.45;
    lily.group.scale.setScalar(1.08);
    group.add(lily.group);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.28),
      createHeartMesh(0xfbbf24, 0.24),
      createHeartMesh(0xec4899, 0.22),
      createHeartMesh(0x7ce8ff, 0.22),
    ];
    hearts.forEach((h) => group.add(h));

    updateFn = (t, _dt, boost) => {
      const squeeze = Math.sin(t * 3.5) * 0.06 + boost * 0.14;
      near.group.position.y = 0.45 + Math.abs(Math.sin(t * 2.5)) * 0.08 + boost * 0.2;
      jacobAstro.group.position.x = 0.45 - squeeze;
      lily.leftArm.rotation.z = -2.4 - Math.sin(t * 5) * 0.3;
      lily.rightArm.rotation.z = 2.4 + Math.sin(t * 5) * 0.3;

      hearts.forEach((h, idx) => {
        const a = t * 1.1 + (idx * Math.PI) / 2;
        h.position.set(
          Math.cos(a) * (1.2 + idx * 0.18),
          1.35 + Math.sin(t * 2.5 + idx) * 0.25 + boost * 0.4,
          0.35 + Math.sin(a) * 0.6,
        );
        h.rotation.y = t * 1.8;
      });
    };
  }

  return {
    group,
    update: updateFn,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
