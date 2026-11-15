import * as THREE from 'three';
import type { StorySceneId } from '../story/storyData';
import {
  createAstronautJacob,
  createEarth,
  createErosAsteroid,
  createErosGround,
  createHeartMesh,
  createJacob,
  createLightbulbIdea,
  createLily,
  createMathildeAsteroid,
  createNearProbe,
  createRadioDish,
  createScanMonitor,
  createScientist,
  createStarMesh,
} from './models';
import { createBadgeTexture } from './textures';

export interface ActiveDiorama {
  group: THREE.Group;
  update: (elapsed: number, delta: number, actionBoost: number) => void;
  dispose: () => void;
}

function createMilestoneSign(
  label: string,
  bgHex: string,
  textHex: string,
  maxAnisotropy: number,
): { mesh: THREE.Mesh; dispose: () => void } {
  const tex = createBadgeTexture(label, bgHex, textHex, maxAnisotropy);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.46, 0.05),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }),
  );
  return { mesh, dispose: () => tex.dispose() };
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

  let updateFn: (elapsed: number, delta: number, actionBoost: number) => void = () => {};

  if (sceneId === 'meet-near') {
    // Showcase plinth for NEAR Shoemaker with Jacob (narrator) and Lily
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.05, 0.14, 24),
      new THREE.MeshStandardMaterial({ color: 0x3b1564, roughness: 0.45, metalness: 0.25 }),
    );
    stand.position.y = 0.07;
    stand.receiveShadow = true;
    group.add(stand);

    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('happy');
    probe.group.position.set(0, 0.14, 0.2);
    probe.group.scale.setScalar(1.05);
    disposables.push(probe);
    group.add(probe.group);

    const jacob = createJacob('tablet');
    jacob.group.position.set(-1.35, 0, 0.7);
    jacob.group.rotation.y = 0.45;
    const lily = createLily();
    lily.group.position.set(1.35, 0, 0.7);
    lily.group.rotation.y = -0.45;
    group.add(jacob.group, lily.group);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0xd8b4fe, 0.12)];
    stars[0].position.set(-0.85, 1.55, 0.2);
    stars[1].position.set(0.85, 1.55, 0.2);
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      probe.group.rotation.y = Math.sin(t * 0.8) * 0.28 + boost * 1.5;
      probe.rightArm.rotation.z = 2.3 + Math.sin(t * 5 + boost * 4) * 0.35;
      jacob.leftArm.rotation.z = -2.2 - Math.sin(t * 4.5) * 0.25;
      lily.rightArm.rotation.z = 2.2 + Math.cos(t * 4.5) * 0.25;
      stars[0].rotation.y = t * 1.8;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'leaving-earth') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-1.95, 0.15, 0.3);
    earth.scale.setScalar(0.85);
    group.add(earth);

    const eros = createErosAsteroid(maxAnisotropy);
    eros.group.position.set(2.1, 0.85, 0.15);
    eros.group.scale.setScalar(0.58);
    disposables.push(eros);
    group.add(eros.group);

    // Scientist friends, Jacob, and Lily waving goodbye!
    const jacob = createJacob();
    jacob.group.position.set(-1.35, 0, 1.25);
    jacob.group.rotation.y = 0.4;
    const lily = createLily();
    lily.group.position.set(-0.75, 0, 1.35);
    lily.group.rotation.y = 0.25;
    const sci = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    sci.group.position.set(-1.9, 0, 1.35);
    sci.group.rotation.y = 0.55;
    group.add(jacob.group, lily.group, sci.group);

    // Trajectory dots
    const dots: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe066 }),
      );
      const u = (i + 1) / 7;
      dot.position.set(
        THREE.MathUtils.lerp(-1.2, 1.5, u),
        0.75 + Math.sin(u * Math.PI) * 0.85,
        0.25,
      );
      group.add(dot);
      dots.push(dot);
    }

    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('happy');
    probe.group.scale.setScalar(0.68);
    disposables.push(probe);
    group.add(probe.group);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.28;
      eros.group.rotation.y = t * 0.45;
      const u = (t * (0.28 + boost * 0.35)) % 1;
      probe.group.position.set(
        THREE.MathUtils.lerp(-1.15, 1.4, u),
        0.78 + Math.sin(u * Math.PI) * 0.88,
        0.3,
      );
      probe.group.rotation.z = -Math.cos(u * Math.PI) * 0.25;
      jacob.rightArm.rotation.z = 2.4 + Math.sin(t * 5) * 0.3;
      lily.rightArm.rotation.z = 2.3 + Math.cos(t * 5) * 0.3;
      sci.leftArm.rotation.z = -2.3 - Math.sin(t * 5) * 0.28;
      dots.forEach((d, idx) => {
        d.scale.setScalar(0.8 + 0.35 * Math.sin(t * 4 - idx * 0.7));
      });
    };
  } else if (sceneId === 'passing-mathilde') {
    const mathilde = createMathildeAsteroid(maxAnisotropy);
    mathilde.group.position.set(-1.15, 0.15, 0.35);
    mathilde.group.rotation.y = 0.25;
    mathilde.group.scale.setScalar(1.05);
    disposables.push(mathilde);
    group.add(mathilde.group);

    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('happy');
    probe.group.position.set(1.05, 0.45, 0.35);
    probe.group.rotation.y = -0.3;
    probe.group.scale.setScalar(0.95);
    disposables.push(probe);
    group.add(probe.group);

    const sign = createMilestoneSign('MATHILDE', '#200838', '#D8B4FE', maxAnisotropy);
    sign.mesh.position.set(-1.15, 1.78, 0.15);
    sign.mesh.scale.setScalar(0.75);
    disposables.push(sign);
    group.add(sign.mesh);

    const heart = createHeartMesh(0xf472b6, 0.2);
    heart.position.set(0, 1.5, 0.35);
    group.add(heart);

    updateFn = (t, _dt, boost) => {
      mathilde.rightArm.rotation.z = -0.55 + Math.sin(t * 5.5 + boost * 4) * 0.4;
      mathilde.group.position.y = 0.15 + Math.sin(t * 1.8) * 0.08;
      probe.leftArm.rotation.z = -2.3 - Math.sin(t * 5.5 + boost * 4) * 0.38;
      probe.group.position.y = 0.45 + Math.cos(t * 2.0) * 0.1 + boost * 0.18;
      heart.position.y = 1.5 + Math.sin(t * 2.4) * 0.12;
      heart.rotation.y = t * 1.6;
    };
  } else if (sceneId === 'happily-in-space') {
    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('happy');
    probe.group.position.set(0, 0.55, 0.35);
    probe.group.scale.setScalar(1.08);
    disposables.push(probe);
    group.add(probe.group);

    const stars: THREE.Mesh[] = [];
    const colors = [0xffe066, 0x80ffdb, 0xd8b4fe, 0x7ce8ff, 0xf472b6];
    for (let i = 0; i < 5; i++) {
      const s = createStarMesh(colors[i], 0.16);
      const ang = (i / 5) * Math.PI * 2;
      s.position.set(Math.cos(ang) * 1.55, 0.95 + Math.sin(i) * 0.3, Math.sin(ang) * 0.7);
      group.add(s);
      stars.push(s);
    }

    updateFn = (t, _dt, boost) => {
      probe.group.position.y = 0.55 + Math.sin(t * 2.2) * 0.18 + boost * 0.25;
      probe.group.rotation.z = Math.sin(t * 1.5) * 0.14;
      probe.group.rotation.y = Math.sin(t * 0.9) * 0.35 + boost * 1.2;
      probe.rightArm.rotation.z = 2.4 + Math.sin(t * 4.5) * 0.3;
      probe.leftArm.rotation.z = -2.4 - Math.sin(t * 4.5) * 0.3;
      stars.forEach((s, idx) => {
        s.rotation.y = t * (1.5 + idx * 0.25);
        s.position.y += Math.sin(t * 2.5 + idx) * 0.002;
      });
    };
  } else if (sceneId === 'missed-the-stop') {
    // Near shocked & crying in the middle of nowhere, past the Eros stop!
    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('crying');
    probe.group.position.set(0.45, 0.35, 0.45);
    probe.group.rotation.y = -0.25;
    probe.group.scale.setScalar(1.05);
    disposables.push(probe);
    group.add(probe.group);

    // Passed "EROS STOP" signpost far behind to the left
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.15, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 }),
    );
    post.position.set(-1.55, 0.58, -0.15);
    group.add(post);

    const stopSign = createMilestoneSign('EROS STOP', '#4C0519', '#FFE066', maxAnisotropy);
    stopSign.mesh.position.set(-1.55, 1.25, -0.15);
    stopSign.mesh.rotation.y = 0.25;
    stopSign.mesh.scale.setScalar(0.82);
    disposables.push(stopSign);
    group.add(stopSign.mesh);

    const lostSign = createMilestoneSign('NO SIGNAL!', '#7F1D1D', '#FFFFFF', maxAnisotropy);
    lostSign.mesh.position.set(0.45, 1.75, 0.15);
    lostSign.mesh.scale.setScalar(0.85);
    disposables.push(lostSign);
    group.add(lostSign.mesh);

    // Floating teardrops
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.35,
      roughness: 0.1,
    });
    const tearL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), dropMat);
    const tearR = tearL.clone();
    group.add(tearL, tearR);

    updateFn = (t, _dt, boost) => {
      // Alternate shocked & crying on tap or gently float with tears
      probe.setMood(boost > 0.25 || Math.floor(t * 0.6) % 2 === 1 ? 'shocked' : 'crying');
      probe.group.position.y = 0.35 + Math.sin(t * 1.8) * 0.08;
      probe.group.rotation.z = Math.sin(t * 4) * 0.05;
      const fall = (t * 1.5) % 1;
      tearL.position.set(0.28, 0.72 - fall * 0.45, 0.85);
      tearR.position.set(0.58, 0.72 - ((fall + 0.4) % 1) * 0.45, 0.85);
      lostSign.mesh.position.y = 1.75 + Math.sin(t * 3) * 0.07;
    };
  } else if (sceneId === 'back-on-track') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-1.85, 0.15, 0.2);
    earth.scale.setScalar(0.75);
    group.add(earth);

    const dish = createRadioDish();
    dish.position.set(-1.1, 0.05, 0.75);
    dish.rotation.y = 0.85;
    group.add(dish);

    const sci = createScientist(0x3b2314, 0x10b981, 'tablet');
    sci.group.position.set(-1.7, 0, 1.25);
    sci.group.rotation.y = 0.55;
    group.add(sci.group);

    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('happy');
    probe.group.position.set(0.75, 0.45, 0.35);
    probe.group.rotation.y = 0.25;
    probe.group.scale.setScalar(0.95);
    disposables.push(probe);
    group.add(probe.group);

    const eros = createErosAsteroid(maxAnisotropy);
    eros.group.position.set(2.05, 0.85, 0.05);
    eros.group.scale.setScalar(0.55);
    disposables.push(eros);
    group.add(eros.group);

    // Glowing cyan/emerald guide signal rings
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.028, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0x80ffdb, transparent: true, opacity: 0.85 }),
      );
      r.rotation.y = Math.PI / 2;
      group.add(r);
      rings.push(r);
    }

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.25;
      eros.group.rotation.y = t * 0.4;
      probe.group.position.y = 0.45 + Math.abs(Math.sin(t * 2.8)) * 0.12 + boost * 0.2;
      probe.rightArm.rotation.z = 2.4 + Math.sin(t * 5) * 0.35;
      sci.leftArm.rotation.z = -2.2 - Math.sin(t * 5) * 0.25;

      rings.forEach((r, idx) => {
        const p = (t * (0.9 + boost * 0.6) + idx * 0.33) % 1;
        r.position.set(
          THREE.MathUtils.lerp(-0.9, 0.65, p),
          0.65 + Math.sin(p * Math.PI) * 0.3,
          0.45,
        );
        r.scale.setScalar(0.7 + Math.sin(p * Math.PI) * 0.55);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.95 - p * 0.5;
      });
    };
  } else if (sceneId === 'orbiting-eros') {
    const eros = createErosAsteroid(maxAnisotropy);
    eros.group.position.set(0, 0.8, 0.15);
    eros.group.scale.setScalar(0.95);
    disposables.push(eros);
    group.add(eros.group);

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.018, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0xd8b4fe, transparent: true, opacity: 0.4 }),
    );
    orbitRing.rotation.x = Math.PI / 2 - 0.15;
    orbitRing.position.set(0, 0.8, 0.15);
    group.add(orbitRing);

    const probe = createNearProbe(maxAnisotropy, { withCamera: true });
    probe.setMood('happy');
    probe.group.scale.setScalar(0.78);
    disposables.push(probe);
    group.add(probe.group);

    updateFn = (t, _dt, boost) => {
      eros.group.rotation.y = t * 0.25;
      const ang = t * (0.95 + boost * 1.1);
      probe.group.position.set(
        Math.cos(ang) * 1.65,
        0.8 + Math.sin(ang) * 0.28,
        0.15 + Math.sin(ang) * 1.15,
      );
      probe.group.lookAt(0, 0.8, 0.15);
      if (probe.cameraFlash) {
        const pulse = Math.pow(Math.max(0, Math.sin(t * 5 + boost * 6)), 8);
        probe.cameraFlash.scale.setScalar(0.6 + pulse * 1.8);
      }
    };
  } else if (sceneId === 'unexpected-plan') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-1.8, 0.2, 0.3);
    earth.scale.setScalar(0.75);
    group.add(earth);

    const sci = createScientist(0x4a3525, 0x38bdf8, 'none');
    sci.group.position.set(-1.35, 0, 1.15);
    sci.group.rotation.y = 0.45;
    const lily = createLily();
    lily.group.position.set(-2.0, 0, 1.15);
    lily.group.rotation.y = 0.55;
    group.add(sci.group, lily.group);

    const comeBackSign = createMilestoneSign('COME BACK!', '#1E3A8A', '#7CE8FF', maxAnisotropy);
    comeBackSign.mesh.position.set(-1.6, 1.5, 0.35);
    comeBackSign.mesh.scale.setScalar(0.8);
    disposables.push(comeBackSign);
    group.add(comeBackSign.mesh);

    const eros = createErosAsteroid(maxAnisotropy);
    eros.group.position.set(1.35, 0.45, 0.2);
    eros.group.scale.setScalar(0.85);
    disposables.push(eros);
    group.add(eros.group);

    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('normal');
    probe.group.position.set(1.25, 1.15, 0.4);
    probe.group.scale.setScalar(0.82);
    disposables.push(probe);
    group.add(probe.group);

    const ideaBulb = createLightbulbIdea();
    ideaBulb.position.set(1.25, 2.05, 0.4);
    group.add(ideaBulb);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.25;
      eros.group.rotation.y = t * 0.22;
      sci.rightArm.rotation.z = 2.4 + Math.sin(t * 4) * 0.3;
      lily.rightArm.rotation.z = 2.3 + Math.cos(t * 4) * 0.3;
      probe.group.position.y = 1.15 + Math.sin(t * 2.2) * 0.08 - boost * 0.22;
      ideaBulb.position.y = 2.05 + Math.sin(t * 3.5) * 0.1;
      ideaBulb.scale.setScalar(0.95 + Math.sin(t * 6) * 0.12 + boost * 0.35);
    };
  } else if (sceneId === 'landed-on-eros') {
    const ground = createErosGround(maxAnisotropy);
    disposables.push(ground);
    group.add(ground.group);

    // Near landed squarely on Eros's rocky surface without landing gear!
    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('happy');
    probe.group.position.set(0.75, 0.14, 0.35);
    probe.group.rotation.y = -0.3;
    probe.group.scale.setScalar(1.0);
    disposables.push(probe);
    group.add(probe.group);

    // Shocked scientists looking on with "BUT HOW?!" sign
    const sci1 = createScientist(0x3b2314, 0xf59e0b, 'none');
    sci1.group.position.set(-1.35, 0.1, 0.75);
    sci1.group.rotation.y = 0.45;
    const sci2 = createScientist(0x9a3412, 0x38bdf8, 'none');
    sci2.group.position.set(-0.65, 0.1, 0.9);
    sci2.group.rotation.y = 0.35;
    group.add(sci1.group, sci2.group);

    const howSign = createMilestoneSign('BUT HOW?!', '#4C0519', '#FFE066', maxAnisotropy);
    howSign.mesh.position.set(-1.0, 1.55, 0.45);
    howSign.mesh.scale.setScalar(0.88);
    disposables.push(howSign);
    group.add(howSign.mesh);

    updateFn = (t, _dt, boost) => {
      probe.group.position.y = 0.14 + boost * 0.25;
      probe.group.rotation.z = boost * Math.sin(t * 14) * 0.08;
      sci1.leftArm.rotation.z = -2.6 + Math.sin(t * 5) * 0.2;
      sci1.rightArm.rotation.z = 2.6 - Math.sin(t * 5) * 0.2;
      sci2.leftArm.rotation.z = -2.5 + Math.cos(t * 5) * 0.2;
      sci2.rightArm.rotation.z = 2.5 - Math.cos(t * 5) * 0.2;
      howSign.mesh.position.y = 1.55 + Math.sin(t * 3) * 0.08;
    };
  } else if (sceneId === 'nothing-impossible') {
    const ground = createErosGround(maxAnisotropy);
    disposables.push(ground);
    group.add(ground.group);

    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('smug');
    probe.group.position.set(0, 0.14, 0.35);
    probe.group.scale.setScalar(1.16);
    disposables.push(probe);
    group.add(probe.group);

    const sign = createMilestoneSign('IMPOSSIBLE? NOPE!', '#200838', '#FFE066', maxAnisotropy);
    sign.mesh.position.set(0, 1.85, -0.35);
    disposables.push(sign);
    group.add(sign.mesh);

    const stars = [
      createStarMesh(0xffe066, 0.16),
      createStarMesh(0x80ffdb, 0.15),
      createStarMesh(0xd8b4fe, 0.14),
    ];
    stars[0].position.set(-1.3, 1.35, 0.3);
    stars[1].position.set(1.3, 1.35, 0.3);
    stars[2].position.set(0, 2.25, -0.15);
    group.add(stars[0], stars[1], stars[2]);

    updateFn = (t, _dt, boost) => {
      probe.group.rotation.y = Math.sin(t * 1.1) * 0.22;
      probe.group.position.y = 0.14 + boost * 0.22;
      probe.rightArm.rotation.z = 2.1 + Math.sin(t * 3) * 0.15;
      sign.mesh.position.y = 1.85 + Math.cos(t * 2) * 0.06;
      stars.forEach((s, idx) => {
        s.rotation.y = t * (1.8 + idx * 0.4);
      });
    };
  } else if (sceneId === 'grandpa-eros') {
    // Grandpa version of Asteroid Eros + Near taking a respectful photo!
    const grandpaEros = createErosAsteroid(maxAnisotropy, { grandpa: true });
    grandpaEros.group.position.set(0.35, 0.85, 0.2);
    grandpaEros.group.scale.setScalar(1.12);
    disposables.push(grandpaEros);
    group.add(grandpaEros.group);

    const probe = createNearProbe(maxAnisotropy, { withCamera: true });
    probe.setMood('happy');
    probe.group.position.set(-1.45, 0.45, 0.65);
    probe.group.rotation.y = 0.65;
    probe.group.scale.setScalar(0.78);
    disposables.push(probe);
    group.add(probe.group);

    const ageSign = createMilestoneSign('OLD AS UNIVERSE!', '#200838', '#D8B4FE', maxAnisotropy);
    ageSign.mesh.position.set(0.35, 2.0, -0.3);
    disposables.push(ageSign);
    group.add(ageSign.mesh);

    updateFn = (t, _dt, boost) => {
      grandpaEros.group.position.y = 0.85 + Math.sin(t * 1.4) * 0.08 + boost * 0.14;
      grandpaEros.group.rotation.y = Math.sin(t * 0.7) * 0.18;
      probe.group.position.y = 0.45 + Math.cos(t * 1.8) * 0.08;
      if (probe.cameraFlash) {
        const pulse = Math.pow(Math.max(0, Math.sin(t * 4 + boost * 6)), 8);
        probe.cameraFlash.scale.setScalar(0.6 + pulse * 1.7);
      }
      ageSign.mesh.position.y = 2.0 + Math.cos(t * 1.8) * 0.05;
    };
  } else if (sceneId === 'never-forgotten') {
    const ground = createErosGround(maxAnisotropy);
    disposables.push(ground);
    group.add(ground.group);

    // Near resting peacefully on Eros while Astronaut Jacob hugs Near!
    const probe = createNearProbe(maxAnisotropy);
    probe.setMood('sleepy');
    probe.group.position.set(0.72, 0.14, 0.35);
    probe.group.rotation.y = -0.15;
    probe.group.scale.setScalar(0.95);
    disposables.push(probe);
    group.add(probe.group);

    const astroJacob = createAstronautJacob();
    astroJacob.group.position.set(0.05, 0.12, 0.45);
    astroJacob.group.rotation.y = 0.78;
    // Pose arms reaching out warmly to hug Near!
    astroJacob.leftArm.rotation.x = -1.15;
    astroJacob.leftArm.rotation.z = -0.35;
    astroJacob.rightArm.rotation.x = -1.15;
    astroJacob.rightArm.rotation.z = 0.35;
    group.add(astroJacob.group);

    // Lily & Scientist friends appreciating Near with scan monitor & hearts
    const lily = createLily();
    lily.group.position.set(-1.35, 0.1, 0.75);
    lily.group.rotation.y = 0.4;
    const sci = createScientist(0x4a3525, 0xa855f7, 'tablet');
    sci.group.position.set(-1.95, 0.1, 0.35);
    sci.group.rotation.y = 0.55;
    group.add(lily.group, sci.group);

    const scanMonitor = createScanMonitor(maxAnisotropy);
    scanMonitor.mesh.position.set(-1.15, 0.14, -0.45);
    scanMonitor.mesh.rotation.y = 0.25;
    scanMonitor.mesh.scale.setScalar(0.95);
    disposables.push(scanMonitor);
    group.add(scanMonitor.mesh);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.24),
      createHeartMesh(0xffe066, 0.2),
      createHeartMesh(0xd8b4fe, 0.18),
    ];
    const stars = [createStarMesh(0xffe066, 0.15), createStarMesh(0x80ffdb, 0.14)];
    group.add(hearts[0], hearts[1], hearts[2], stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      astroJacob.group.position.y = 0.12 + Math.sin(t * 2.4) * 0.04 + boost * 0.12;
      probe.group.position.y = 0.14 + Math.sin(t * 2.4) * 0.03 + boost * 0.12;
      lily.rightArm.rotation.z = 2.3 + Math.sin(t * 4) * 0.28;
      sci.leftArm.rotation.z = -2.1 - Math.cos(t * 4) * 0.22;

      hearts[0].position.set(0.38, 1.38 + Math.sin(t * 2) * 0.15 + boost * 0.15, 0.42);
      hearts[1].position.set(-1.45, 1.45 + Math.cos(t * 2.2) * 0.14, 0.45);
      hearts[2].position.set(1.35, 1.25 + Math.sin(t * 2.6) * 0.14, 0.35);
      hearts.forEach((h, idx) => {
        h.rotation.y = t * (1.3 + idx * 0.2);
      });

      stars[0].position.set(1.75, 1.65 + Math.sin(t * 2.4) * 0.15, 0.15);
      stars[1].position.set(-1.95, 1.55 + Math.cos(t * 2.4) * 0.15, 0.2);
      stars[0].rotation.y = t * 2.0;
      stars[1].rotation.y = -t * 2.0;
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
