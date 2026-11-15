import * as THREE from 'three';
import type { StorySceneId } from '../story/storyData';
import {
  createEarth,
  createHeartMesh,
  createIngenuityHelicopter,
  createJezeroCrater,
  createLilyCharacter,
  createMarsPlanet,
  createNextGenHelicopter,
  createRadioDish,
  createScientist,
  createStarMesh,
  type CharacterRig,
  type IngenuityRig,
} from './models';
import { createBadgeTexture } from './textures';

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
  g.add(bar, dot);
  return g;
}

function createMilestoneSign(
  label: string,
  bgHex: string,
  textHex: string,
  maxAnisotropy: number,
): { mesh: THREE.Mesh; dispose: () => void } {
  const tex = createBadgeTexture(label, bgHex, textHex, maxAnisotropy);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 0.44, 0.05),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }),
  );
  return { mesh, dispose: () => tex.dispose() };
}

function createMarsDunes(variant: 'flat' | 'ridge' | 'canyon'): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: variant === 'canyon' ? 0xb84a28 : 0xc95f38,
    roughness: 0.9,
    flatShading: true,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.4, 0.12, 28), mat);
  base.position.y = 0.06;
  base.receiveShadow = true;
  g.add(base);

  const moundOffsets: [number, number, number, number][] =
    variant === 'ridge'
      ? [
          [-1.3, 0.16, -0.5, 0.55],
          [1.4, 0.22, -0.4, 0.65],
          [0.1, 0.12, 0.9, 0.4],
        ]
      : variant === 'canyon'
        ? [
            [-1.6, 0.35, -0.4, 0.72],
            [1.6, 0.3, -0.5, 0.68],
            [-0.7, 0.14, 0.9, 0.36],
          ]
        : [
            [-1.4, 0.14, 0.6, 0.38],
            [1.5, 0.16, -0.5, 0.42],
          ];

  for (const [mx, my, mz, mr] of moundOffsets) {
    const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(mr, 1), mat);
    mound.scale.set(1.3, 0.55, 1.0);
    mound.position.set(mx, my, mz);
    mound.castShadow = true;
    mound.receiveShadow = true;
    g.add(mound);
  }
  return g;
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

  const heli: IngenuityRig = createIngenuityHelicopter(maxAnisotropy);
  disposables.push(heli);

  let updateFn: (elapsed: number, delta: number, actionBoost: number) => void = () => {};

  if (sceneId === 'meet-ingenuity') {
    const mars = createMarsPlanet(maxAnisotropy);
    mars.position.set(1.75, 0.15, -0.15);
    mars.scale.setScalar(0.95);
    group.add(mars);

    heli.setMood('happy');
    heli.group.position.set(-0.2, 0.55, 0.45);
    heli.group.scale.setScalar(1.05);
    group.add(heli.group);

    const lily: CharacterRig = createLilyCharacter('casual');
    lily.group.position.set(-1.95, 0, 0.85);
    lily.group.rotation.y = 0.45;
    group.add(lily.group);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0xff9e80, 0.12)];
    stars[0].position.set(-1.1, 1.65, 0.1);
    stars[1].position.set(0.85, 1.75, 0.1);
    group.add(stars[0], stars[1]);

    updateFn = (t, dt, boost) => {
      const spin = (12 + boost * 16) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.y = 0.55 + Math.sin(t * 2.4) * 0.14 + boost * 0.35;
      heli.group.rotation.y = Math.sin(t * 0.9) * 0.25 + boost * Math.PI * 2;
      mars.rotation.y = t * 0.35;
      lily.rightArm.rotation.z = 2.4 + Math.sin(t * 6) * 0.35;
      stars[0].rotation.y = t * 1.6;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'brave-helicopter') {
    const ground = createMarsDunes('flat');
    group.add(ground);

    heli.setMood('brave');
    heli.group.position.set(0.35, 0.65, 0.35);
    heli.group.scale.setScalar(1.1);
    group.add(heli.group);

    // Sweeping Martian wind ribbons & flying dust particles
    const windRibbons: THREE.Mesh[] = [];
    const windMat = new THREE.MeshBasicMaterial({
      color: 0xffb48a,
      transparent: true,
      opacity: 0.7,
    });
    for (let i = 0; i < 4; i++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.035, 0.035), windMat);
      group.add(rib);
      windRibbons.push(rib);
    }

    updateFn = (t, dt, boost) => {
      const spin = (18 + boost * 18) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      // Brave tilt leaning into the Martian wind
      heli.group.position.y = 0.65 + Math.sin(t * 3.5) * 0.1 + boost * 0.25;
      heli.group.rotation.z = 0.22 + Math.sin(t * 7) * 0.06;

      windRibbons.forEach((r, idx) => {
        const p = (t * (1.3 + boost * 1.1) + idx * 0.25) % 1;
        r.position.set(THREE.MathUtils.lerp(-2.5, 2.5, p), 0.55 + idx * 0.3, 0.3 + (idx % 2) * 0.3);
        r.scale.x = 0.6 + Math.sin(p * Math.PI) * 0.9;
      });
    };
  } else if (sceneId === 'impossible-mars') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-2.1, 0.15, 0.3);
    earth.scale.setScalar(0.85);
    group.add(earth);

    const mars = createMarsPlanet(maxAnisotropy);
    mars.position.set(2.05, 0.15, 0.3);
    mars.scale.setScalar(0.85);
    group.add(mars);

    const sci = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    sci.group.position.set(-1.15, 0, 1.35);
    sci.group.rotation.y = 0.35;
    group.add(sci.group);

    const oneMonthSign = createMilestoneSign('1 MONTH', '#260912', '#FFE066', maxAnisotropy);
    disposables.push(oneMonthSign);
    oneMonthSign.mesh.position.set(0.05, 1.95, 0.15);
    group.add(oneMonthSign.mesh);

    heli.setMood('determined');
    heli.group.position.set(0.05, 0.62, 0.45);
    heli.group.scale.setScalar(0.82);
    group.add(heli.group);

    updateFn = (t, dt, boost) => {
      earth.rotation.y = t * 0.35;
      mars.rotation.y = t * 0.35;
      const spin = (14 + boost * 15) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.y = 0.62 + Math.sin(t * 2.5) * 0.14 + boost * 0.3;
      oneMonthSign.mesh.position.y = 1.95 + Math.cos(t * 2) * 0.06;
      sci.leftArm.rotation.z = -0.4 + Math.sin(t * 3) * 0.2;
    };
  } else if (sceneId === 'weather-mission') {
    const ground = createMarsDunes('flat');
    group.add(ground);

    const sci = createScientist(0x3b2314, 0xf59e0b, 'tablet');
    sci.group.position.set(-2.05, 0, 0.75);
    sci.group.rotation.y = 0.55;
    group.add(sci.group);

    const dish = createRadioDish();
    dish.position.set(-1.35, 0, 0.45);
    dish.rotation.y = 0.7;
    group.add(dish);

    heli.setMood('happy');
    heli.group.position.set(1.35, 0.55, 0.35);
    heli.group.scale.setScalar(0.95);
    group.add(heli.group);

    // Weather report sun & signal rings flying from Ingenuity to scientists
    const sunBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffe066 }),
    );
    sunBall.position.set(0.1, 1.55, 0.3);
    group.add(sunBall);

    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.028, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0x7ce8ff, transparent: true, opacity: 0.85 }),
      );
      r.rotation.y = Math.PI / 2;
      group.add(r);
      rings.push(r);
    }

    updateFn = (t, dt, boost) => {
      const spin = (14 + boost * 15) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.y = 0.55 + Math.sin(t * 2.2) * 0.12 + boost * 0.25;
      sunBall.scale.setScalar(1 + Math.sin(t * 4) * 0.12);

      rings.forEach((r, idx) => {
        const p = (t * (0.9 + boost * 0.6) + idx * 0.33) % 1;
        r.position.set(THREE.MathUtils.lerp(1.0, -1.2, p), 0.9 + Math.sin(p * Math.PI) * 0.45, 0.4);
        r.scale.setScalar(0.75 + Math.sin(p * Math.PI) * 0.55);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.9 - p * 0.5;
      });
    };
  } else if (sceneId === 'jezero-landing') {
    const crater = createJezeroCrater(maxAnisotropy);
    crater.position.set(0, 0, 0.25);
    group.add(crater);

    heli.setMood('happy');
    heli.group.position.set(0, 0.15, 0.25);
    heli.group.scale.setScalar(0.95);
    group.add(heli.group);

    // Landing dust ring
    const dustPuffs: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xe6956c, roughness: 0.9, transparent: true, opacity: 0.7 }),
      );
      group.add(puff);
      dustPuffs.push(puff);
    }

    updateFn = (t, dt, boost) => {
      const spin = (10 + boost * 18) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      const hop = Math.abs(Math.sin(t * 1.4)) * 0.28 + boost * 0.5;
      heli.group.position.y = 0.14 + hop;
      heli.group.rotation.y = Math.sin(t * 0.7) * 0.2;

      dustPuffs.forEach((p, idx) => {
        const a = (idx * Math.PI) / 3 + t * 0.5;
        const dist = 0.45 + (1 - Math.min(hop, 0.5)) * 0.35;
        p.position.set(Math.cos(a) * dist, 0.2, 0.25 + Math.sin(a) * dist);
        p.scale.setScalar(0.65 + (1 - Math.min(hop, 0.5)) * 0.65);
      });
    };
  } else if (sceneId === 'exploring-mars') {
    const ground = createMarsDunes('ridge');
    group.add(ground);

    heli.setMood('normal');
    heli.group.scale.setScalar(0.88);
    group.add(heli.group);

    // Continuous upward signal rings beaming to space
    const pulses: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.025, 8, 22),
        new THREE.MeshBasicMaterial({ color: 0x80ffdb, transparent: true, opacity: 0.8 }),
      );
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      pulses.push(ring);
    }

    updateFn = (t, dt, boost) => {
      const spin = (17 + boost * 15) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      const orbitA = t * 0.85;
      const hx = Math.cos(orbitA) * 1.25;
      const hz = 0.25 + Math.sin(orbitA) * 0.75;
      const hy = 0.85 + Math.sin(t * 2.5) * 0.12 + boost * 0.3;
      heli.group.position.set(hx, hy, hz);
      heli.group.rotation.z = -Math.cos(orbitA) * 0.14;
      heli.group.rotation.y = -orbitA + Math.PI / 2;

      pulses.forEach((r, idx) => {
        const p = (t * 1.1 + idx * 0.33) % 1;
        r.position.set(hx, hy + 1.0 + p * 0.9, hz);
        r.scale.setScalar(0.6 + p * 1.3);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.85;
      });
    };
  } else if (sceneId === 'one-month') {
    const ground = createMarsDunes('canyon');
    group.add(ground);

    const sci1 = createScientist(0x3b2314, 0x38bdf8, 'clipboard');
    sci1.group.position.set(-2.15, 0.1, 0.85);
    sci1.group.rotation.y = 0.5;
    const sci2 = createScientist(0x9a3412, 0xf472b6, 'none');
    sci2.group.position.set(-1.35, 0.1, 1.0);
    sci2.group.rotation.y = 0.4;
    group.add(sci1.group, sci2.group);

    const badge = createMilestoneSign('1 MO +', '#1E293B', '#FFE066', maxAnisotropy);
    disposables.push(badge);
    badge.mesh.position.set(1.5, 2.05, 0.2);
    group.add(badge.mesh);

    heli.setMood('determined');
    heli.group.scale.setScalar(0.88);
    heli.group.position.set(1.25, 0.75, 0.35);
    group.add(heli.group);

    updateFn = (t, dt, boost) => {
      const spin = (16 + boost * 16) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.x = 1.25 + Math.sin(t * 1.2) * 0.45;
      heli.group.position.y = 0.75 + Math.cos(t * 2.4) * 0.14 + boost * 0.25;
      badge.mesh.rotation.y = Math.sin(t * 1.4) * 0.18;
      // Scientists leaning cautiously watching
      sci1.group.rotation.z = Math.sin(t * 2) * 0.04;
      sci2.leftArm.rotation.z = -0.35 + Math.sin(t * 3) * 0.15;
    };
  } else if (sceneId === 'three-years') {
    const ground = createMarsDunes('flat');
    group.add(ground);

    const sci1 = createScientist(0x3b2314, 0x38bdf8, 'none');
    sci1.group.position.set(-2.2, 0.08, 0.85);
    sci1.group.rotation.y = 0.5;
    const sci2 = createScientist(0x9a3412, 0xf59e0b, 'none');
    sci2.group.position.set(-1.35, 0.08, 0.95);
    sci2.group.rotation.y = 0.4;
    group.add(sci1.group, sci2.group);

    const eMark1 = createSymbolExclamation(0xffe066);
    eMark1.position.set(-2.2, 1.25, 0.85);
    const eMark2 = createSymbolExclamation(0xff8a80);
    eMark2.position.set(-1.35, 1.28, 0.95);
    group.add(eMark1, eMark2);

    // Floating 2 MO -> 1 YR -> 3 YRS timeline milestone signs
    const s2mo = createMilestoneSign('2 MONTHS', '#3B1722', '#7CE8FF', maxAnisotropy);
    const s1yr = createMilestoneSign('1 YEAR', '#3B1722', '#80FFDB', maxAnisotropy);
    const s3yr = createMilestoneSign('3 YEARS!', '#3B1722', '#FFE066', maxAnisotropy);
    disposables.push(s2mo, s1yr, s3yr);
    s2mo.mesh.scale.setScalar(0.68);
    s1yr.mesh.scale.setScalar(0.75);
    s3yr.mesh.scale.setScalar(0.86);
    s2mo.mesh.position.set(0.1, 1.85, -0.2);
    s1yr.mesh.position.set(1.25, 2.05, -0.1);
    s3yr.mesh.position.set(2.35, 1.85, 0.0);
    group.add(s2mo.mesh, s1yr.mesh, s3yr.mesh);

    heli.setMood('proud');
    heli.group.position.set(1.25, 0.68, 0.45);
    heli.group.scale.setScalar(0.96);
    group.add(heli.group);

    const stars = [createStarMesh(0xffe066, 0.15), createStarMesh(0x80ffdb, 0.14)];
    group.add(stars[0], stars[1]);

    updateFn = (t, dt, boost) => {
      const spin = (17 + boost * 18) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.y = 0.68 + Math.abs(Math.sin(t * 2.8)) * 0.22 + boost * 0.35;
      heli.group.rotation.y = Math.sin(t * 1.4) * 0.2 + boost * Math.PI * 2;

      // Shocked scientists throw arms up!
      sci1.leftArm.rotation.z = -2.6 + Math.sin(t * 7) * 0.15;
      sci1.rightArm.rotation.z = 2.6 - Math.sin(t * 7) * 0.15;
      sci2.leftArm.rotation.z = -2.5 - Math.cos(t * 7) * 0.15;
      sci2.rightArm.rotation.z = 2.5 + Math.cos(t * 7) * 0.15;
      eMark1.position.y = 1.25 + Math.abs(Math.sin(t * 5)) * 0.16;
      eMark2.position.y = 1.28 + Math.abs(Math.cos(t * 5)) * 0.16;

      s2mo.mesh.position.y = 1.85 + Math.sin(t * 2) * 0.06;
      s1yr.mesh.position.y = 2.05 + Math.sin(t * 2 + 1) * 0.06;
      s3yr.mesh.position.y = 1.85 + Math.sin(t * 2 + 2) * 0.06;

      stars[0].position.set(0.4, 1.4 + Math.sin(t * 3) * 0.15, 0.45);
      stars[1].position.set(2.15, 1.45 + Math.cos(t * 3) * 0.15, 0.45);
      stars[0].rotation.y = t * 2;
      stars[1].rotation.y = -t * 2;
    };
  } else if (sceneId === 'better-robot') {
    // Workshop platform
    const bench = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.05, 0.22, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 }),
    );
    bench.position.set(1.15, 0.11, 0.35);
    bench.receiveShadow = true;
    group.add(bench);

    const nextGen = createNextGenHelicopter(maxAnisotropy);
    disposables.push(nextGen);
    nextGen.group.position.set(1.15, 0.24, 0.35);
    nextGen.group.scale.setScalar(1.08);
    group.add(nextGen.group);

    const sci1 = createScientist(0x4a3525, 0x38bdf8, 'wrench');
    sci1.group.position.set(0.05, 0, 0.85);
    sci1.group.rotation.y = 0.8;
    const sci2 = createScientist(0x9a3412, 0x34d399, 'clipboard');
    sci2.group.position.set(2.25, 0, 0.75);
    sci2.group.rotation.y = -0.75;
    group.add(sci1.group, sci2.group);

    heli.setMood('happy');
    heli.group.position.set(-1.75, 0.75, 0.35);
    heli.group.scale.setScalar(0.88);
    group.add(heli.group);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0x7ce8ff, 0.13)];
    group.add(stars[0], stars[1]);

    updateFn = (t, dt, boost) => {
      const spin = (15 + boost * 16) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.y = 0.75 + Math.sin(t * 2.2) * 0.12;

      nextGen.rotors.forEach((r, idx) => {
        r.rotation.y += (idx % 2 === 0 ? 1 : -1) * (10 + boost * 18) * dt;
      });
      nextGen.group.position.y = 0.24 + boost * 0.35;

      sci1.rightArm.rotation.x = -0.6 + Math.sin(t * 6) * 0.35;
      sci2.leftArm.rotation.z = -1.8 + Math.sin(t * 4) * 0.25;
      stars[0].position.set(-0.6, 1.5 + Math.sin(t * 2.5) * 0.14, 0.35);
      stars[1].position.set(1.15, 1.7 + Math.cos(t * 2.5) * 0.14, 0.35);
      stars[0].rotation.y = t * 1.8;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'believe-in-yourself') {
    const ground = createMarsDunes('ridge');
    group.add(ground);

    // Lily breaking the 4th wall: facing forward directly at the reader on Mars!
    const lilyAstro = createLilyCharacter('astronaut');
    lilyAstro.group.position.set(-0.65, 0.08, 0.85);
    lilyAstro.group.rotation.y = 0.05; // Looking straight at the reader!
    lilyAstro.group.scale.setScalar(1.22);
    group.add(lilyAstro.group);

    // Ingenuity flying proudly right behind Lily on Mars
    heli.setMood('proud');
    heli.group.position.set(1.15, 0.85, -0.1);
    heli.group.scale.setScalar(0.95);
    group.add(heli.group);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.22),
      createHeartMesh(0xffe066, 0.2),
    ];
    const stars = [
      createStarMesh(0xffe066, 0.16),
      createStarMesh(0x7ce8ff, 0.14),
    ];
    group.add(hearts[0], hearts[1], stars[0], stars[1]);

    updateFn = (t, dt, boost) => {
      const spin = (16 + boost * 18) * dt;
      heli.topRotor.rotation.y += spin;
      heli.bottomRotor.rotation.y -= spin;
      heli.group.position.y = 0.85 + Math.sin(t * 2.4) * 0.14 + boost * 0.35;

      // Lily waving cheerfully straight at the reader!
      lilyAstro.rightArm.rotation.z = 2.45 + Math.sin(t * 5.5 + boost * 4) * 0.38;
      lilyAstro.leftArm.rotation.z = -0.35 - Math.sin(t * 2.5) * 0.1;
      lilyAstro.group.position.y = 0.08 + Math.abs(Math.sin(t * 2.2)) * 0.06;

      hearts[0].position.set(-1.6, 1.5 + Math.sin(t * 2) * 0.18, 0.5);
      hearts[1].position.set(0.35, 1.85 + Math.cos(t * 2) * 0.18, 0.3);
      hearts[0].rotation.y = t * 1.5;
      hearts[1].rotation.y = -t * 1.5;

      stars[0].position.set(2.05, 1.7 + Math.sin(t * 2.4) * 0.15, 0.1);
      stars[1].position.set(-1.95, 1.1 + Math.cos(t * 2.4) * 0.15, 0.4);
      stars[0].rotation.y = t * 2.2;
      stars[1].rotation.y = -t * 2.2;
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
