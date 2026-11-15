import * as THREE from 'three';
import type { StorySceneId } from '../story/storyData';
import {
  createApolloAstronaut,
  createEarth,
  createHeartMesh,
  createLilyCharacter,
  createLunarGround,
  createLunarModule,
  createMoonPlanet,
  createScientist,
  createStarMesh,
  createSurveyor3,
  type CharacterRig,
  type SurveyorRig,
} from './models';
import { createBadgeTexture } from './textures';

export interface ActiveDiorama {
  group: THREE.Group;
  update: (elapsed: number, delta: number, actionBoost: number) => void;
  dispose: () => void;
}

function createSymbolQuestion(color = 0xffe066): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const hook = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.036, 8, 16, Math.PI * 1.45),
    mat,
  );
  hook.position.y = 0.25;
  hook.rotation.z = -0.35;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), mat);
  dot.position.y = 0.03;
  g.add(hook, dot);
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
    new THREE.BoxGeometry(0.92, 0.44, 0.05),
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

  const surveyor: SurveyorRig = createSurveyor3(maxAnisotropy);
  disposables.push(surveyor);

  let updateFn: (elapsed: number, delta: number, actionBoost: number) => void = () => {};

  if (sceneId === 'meet-surveyor') {
    const moon = createMoonPlanet(maxAnisotropy);
    moon.position.set(1.75, 0.15, -0.15);
    moon.scale.setScalar(0.95);
    group.add(moon);

    surveyor.setMood('happy');
    surveyor.group.position.set(-0.2, 0, 0.45);
    surveyor.group.scale.setScalar(1.05);
    group.add(surveyor.group);

    const lily: CharacterRig = createLilyCharacter('casual');
    lily.group.position.set(-1.95, 0, 0.85);
    lily.group.rotation.y = 0.45;
    group.add(lily.group);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0x7ce8ff, 0.12)];
    stars[0].position.set(-1.1, 1.65, 0.1);
    stars[1].position.set(0.85, 1.75, 0.1);
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      surveyor.group.position.y = Math.abs(Math.sin(t * 2.2)) * 0.08 + boost * 0.25;
      surveyor.group.rotation.y = Math.sin(t * 0.9) * 0.22;
      surveyor.armGroup.rotation.x = -0.35 + Math.sin(t * 4.5 + boost * 4) * 0.3;
      moon.rotation.y = t * 0.28;
      lily.rightArm.rotation.z = 2.4 + Math.sin(t * 6 + boost * 4) * 0.35;
      stars[0].rotation.y = t * 1.6;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'why-1967') {
    const moon = createMoonPlanet(maxAnisotropy);
    moon.position.set(1.45, 0.35, -0.1);
    moon.scale.setScalar(0.95);
    group.add(moon);

    const sci1 = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    sci1.group.position.set(-2.0, 0, 0.75);
    sci1.group.rotation.y = 0.55;
    const sci2 = createScientist(0x9a3412, 0xf59e0b, 'tablet');
    sci2.group.position.set(-1.1, 0, 1.0);
    sci2.group.rotation.y = 0.35;
    group.add(sci1.group, sci2.group);

    const badge1967 = createMilestoneSign('1967', '#0B1E42', '#FFE066', maxAnisotropy);
    disposables.push(badge1967);
    badge1967.mesh.position.set(-0.2, 1.95, 0.15);
    group.add(badge1967.mesh);

    const qMark = createSymbolQuestion(0x7ce8ff);
    qMark.position.set(0.35, 1.45, 0.5);
    group.add(qMark);

    surveyor.setMood('curious');
    surveyor.group.position.set(0.05, 0, 0.45);
    surveyor.group.scale.setScalar(0.8);
    group.add(surveyor.group);

    updateFn = (t, _dt, boost) => {
      moon.rotation.y = t * 0.25;
      qMark.position.y = 1.45 + Math.sin(t * 2.5) * 0.12 + boost * 0.2;
      qMark.rotation.y = Math.sin(t * 1.4) * 0.35;
      badge1967.mesh.position.y = 1.95 + Math.cos(t * 2) * 0.06;
      sci1.leftArm.rotation.z = -0.35 + Math.sin(t * 3 + boost * 3) * 0.2;
      sci2.group.rotation.z = Math.sin(t * 2.2) * 0.05;
      surveyor.solarPanelPivot.rotation.y = Math.sin(t * 1.5) * 0.2;
    };
  } else if (sceneId === 'journey-to-moon') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-2.15, 0.15, 0.3);
    earth.scale.setScalar(0.82);
    group.add(earth);

    const moon = createMoonPlanet(maxAnisotropy);
    moon.position.set(2.1, 0.2, 0.25);
    moon.scale.setScalar(0.85);
    group.add(moon);

    // Dotted arc of glowing stars along Surveyor 3's path from Earth to Moon
    const pathDots: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe066 }),
      );
      const u = (i + 1) / 7;
      dot.position.set(
        THREE.MathUtils.lerp(-1.5, 1.5, u),
        0.75 + Math.sin(u * Math.PI) * 0.85,
        0.3,
      );
      group.add(dot);
      pathDots.push(dot);
    }

    surveyor.setMood('normal');
    surveyor.group.scale.setScalar(0.76);
    group.add(surveyor.group);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.28;
      moon.rotation.y = t * 0.25;
      const u = (t * (0.28 + boost * 0.35)) % 1;
      surveyor.group.position.set(
        THREE.MathUtils.lerp(-1.35, 1.35, u),
        0.72 + Math.sin(u * Math.PI) * 0.9,
        0.35,
      );
      surveyor.group.rotation.z = -Math.cos(u * Math.PI) * 0.32;
      surveyor.group.rotation.y = 0.35;
      pathDots.forEach((d, idx) => {
        d.scale.setScalar(0.8 + 0.35 * Math.sin(t * 4 - idx * 0.7));
      });
    };
  } else if (sceneId === 'digging-soil') {
    const ground = createLunarGround('crater', maxAnisotropy);
    group.add(ground);

    surveyor.setMood('happy');
    surveyor.group.position.set(-0.2, 0.1, 0.25);
    surveyor.group.scale.setScalar(1.06);
    group.add(surveyor.group);

    // Little lunar soil dig pit + dust puffs beside scoop
    const pit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.2, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x5d6778, roughness: 0.95 }),
    );
    pit.position.set(0.35, 0.13, 0.95);
    group.add(pit);

    const dustPuffs: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9, transparent: true, opacity: 0.7 }),
      );
      group.add(puff);
      dustPuffs.push(puff);
    }

    // Camera flash ring
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.8 }),
    );
    flash.position.set(-0.2, 0.95, 0.45);
    group.add(flash);

    updateFn = (t, _dt, boost) => {
      // Mechanical arm lowers and scoops lunar soil!
      const digWave = Math.sin(t * (2.6 + boost * 3.0));
      surveyor.armGroup.rotation.x = 0.25 + digWave * 0.32;
      surveyor.scoopHead.rotation.x = 0.3 - digWave * 0.35;

      dustPuffs.forEach((p, idx) => {
        const phase = (t * 1.4 + idx * 0.25) % 1;
        p.position.set(
          0.35 + Math.cos(idx * 1.6) * 0.25 * phase,
          0.18 + Math.sin(phase * Math.PI) * 0.32,
          0.95 + Math.sin(idx * 1.6) * 0.25 * phase,
        );
        p.scale.setScalar(0.5 + (1 - phase) * 0.8);
      });

      const flashPulse = Math.max(0, Math.sin(t * 3.5 + boost * 6) - 0.75) * 4;
      flash.scale.setScalar(0.4 + flashPulse);
      (flash.material as THREE.MeshBasicMaterial).opacity = flashPulse * 0.85;
    };
  } else if (sceneId === 'mission-ends') {
    const ground = createLunarGround('plains', maxAnisotropy);
    group.add(ground);

    surveyor.setMood('sleepy');
    surveyor.group.position.set(-0.65, 0.1, 0.35);
    surveyor.group.rotation.y = 0.38; // Looking up toward Earth in the distance
    surveyor.group.scale.setScalar(0.95);
    group.add(surveyor.group);

    const earth = createEarth(maxAnisotropy);
    earth.position.set(1.65, 1.35, -0.95);
    earth.scale.setScalar(0.75);
    group.add(earth);

    const stars = [createStarMesh(0x93c5fd, 0.12), createStarMesh(0xffe066, 0.1)];
    stars[0].position.set(-1.7, 1.75, -0.3);
    stars[1].position.set(0.45, 2.05, -0.5);
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.18;
      earth.position.y = 1.35 + Math.sin(t * 0.9) * 0.08 + boost * 0.12;
      surveyor.solarPanelPivot.rotation.x = 0.18 + Math.sin(t * 0.8) * 0.04;
      stars[0].rotation.y = t * 1.1;
      stars[1].rotation.y = -t * 1.2;
    };
  } else if (sceneId === 'apollo12-landing') {
    const ground = createLunarGround('slope', maxAnisotropy);
    group.add(ground);

    // Surveyor 3 watching in amazement from the crater slope on the left
    surveyor.setMood('amazed');
    surveyor.group.position.set(-1.55, 0.12, 0.55);
    surveyor.group.rotation.y = 0.72;
    surveyor.group.scale.setScalar(0.8);
    group.add(surveyor.group);

    // Apollo 12 Lunar Module Intrepid landing on the right!
    const lm = createLunarModule();
    lm.group.position.set(1.15, 0.3, 0.15);
    lm.group.scale.setScalar(1.05);
    group.add(lm.group);

    const novSign = createMilestoneSign('NOV 1969', '#0B1E42', '#FFE066', maxAnisotropy);
    disposables.push(novSign);
    novSign.mesh.position.set(-0.2, 2.05, -0.2);
    group.add(novSign.mesh);

    updateFn = (t, _dt, boost) => {
      const hover = Math.abs(Math.sin(t * 1.5)) * 0.32 + boost * 0.45;
      lm.group.position.y = 0.1 + hover;
      lm.group.rotation.y = Math.sin(t * 0.7) * 0.12;
      lm.thrusterGlow.scale.y = 0.65 + Math.sin(t * 18) * 0.25 + boost * 0.5;
      (lm.thrusterGlow.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.min(hover, 0.6) * 0.8;
      novSign.mesh.position.y = 2.05 + Math.cos(t * 2) * 0.05;
    };
  } else if (sceneId === 'visitors-arrive') {
    const ground = createLunarGround('plains', maxAnisotropy);
    group.add(ground);

    surveyor.setMood('happy');
    surveyor.group.position.set(1.2, 0.1, 0.35);
    surveyor.group.rotation.y = -0.5;
    surveyor.group.scale.setScalar(0.95);
    group.add(surveyor.group);

    const conrad = createApolloAstronaut(true, 'none');
    conrad.group.position.set(-1.55, 0.1, 0.55);
    conrad.group.rotation.y = 1.2;
    const bean = createApolloAstronaut(false, 'none');
    bean.group.position.set(-2.2, 0.1, 0.85);
    bean.group.rotation.y = 1.1;
    group.add(conrad.group, bean.group);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.2),
      createHeartMesh(0xffe066, 0.18),
    ];
    group.add(hearts[0], hearts[1]);

    updateFn = (t, _dt, boost) => {
      // Astronauts bouncing across the Moon toward Surveyor 3!
      const stride = Math.sin(t * (3.2 + boost * 2.5));
      conrad.group.position.x = -1.25 + Math.sin(t * 0.9) * 0.38;
      conrad.group.position.y = 0.1 + Math.abs(stride) * 0.16;
      conrad.rightArm.rotation.z = 2.2 + Math.sin(t * 5) * 0.3;

      bean.group.position.x = -1.95 + Math.sin(t * 0.9) * 0.38;
      bean.group.position.y = 0.1 + Math.abs(Math.cos(t * 3.2)) * 0.14;
      bean.rightArm.rotation.z = 2.1 + Math.cos(t * 5) * 0.3;

      surveyor.group.position.y = 0.1 + Math.abs(Math.sin(t * 4)) * 0.07 + boost * 0.2;

      hearts[0].position.set(0.35, 1.45 + Math.sin(t * 2.4) * 0.14, 0.45);
      hearts[1].position.set(1.2, 1.75 + Math.cos(t * 2.4) * 0.14, 0.35);
      hearts[0].rotation.y = t * 1.5;
      hearts[1].rotation.y = -t * 1.5;
    };
  } else if (sceneId === 'examining-surveyor') {
    const ground = createLunarGround('crater', maxAnisotropy);
    group.add(ground);

    surveyor.setMood('proud');
    surveyor.group.position.set(0, 0.1, 0.25);
    surveyor.group.scale.setScalar(0.95);
    group.add(surveyor.group);

    // Charles Conrad (Commander, red stripes) with camera, Alan Bean with sample box
    const conrad = createApolloAstronaut(true, 'camera');
    conrad.group.position.set(-1.35, 0.1, 0.65);
    conrad.group.rotation.y = 0.9;
    const bean = createApolloAstronaut(false, 'sampleBox');
    bean.group.position.set(1.35, 0.1, 0.6);
    bean.group.rotation.y = -0.95;
    group.add(conrad.group, bean.group);

    // Camera flash orb in front of Conrad's camera
    const camFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }),
    );
    camFlash.position.set(-0.95, 0.65, 0.55);
    group.add(camFlash);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0x7ce8ff, 0.13)];
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      conrad.rightArm.rotation.x = -0.55 + Math.sin(t * 2.5) * 0.15;
      bean.rightArm.rotation.x = -0.4 + Math.cos(t * 2.2) * 0.15;

      const flashBurst = Math.max(0, Math.sin(t * 3 + boost * 8) - 0.8) * 5;
      camFlash.scale.setScalar(0.5 + flashBurst * 1.2);
      (camFlash.material as THREE.MeshBasicMaterial).opacity = flashBurst * 0.9;

      stars[0].position.set(-0.65, 1.65 + Math.sin(t * 2.5) * 0.12, 0.3);
      stars[1].position.set(0.75, 1.65 + Math.cos(t * 2.5) * 0.12, 0.3);
      stars[0].rotation.y = t * 1.8;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'helping-humans') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-1.85, 0.25, -0.2);
    earth.scale.setScalar(0.95);
    group.add(earth);

    const moon = createMoonPlanet(maxAnisotropy);
    moon.position.set(1.85, 0.25, -0.2);
    moon.scale.setScalar(0.95);
    group.add(moon);

    const sci1 = createScientist(0x3b2314, 0x38bdf8, 'clipboard');
    sci1.group.position.set(-1.1, 0, 1.05);
    sci1.group.rotation.y = 0.45;
    const sci2 = createScientist(0x9a3412, 0xf59e0b, 'wrench');
    sci2.group.position.set(1.15, 0, 1.05);
    sci2.group.rotation.y = -0.45;
    group.add(sci1.group, sci2.group);

    surveyor.setMood('proud');
    surveyor.group.position.set(0, 0, 0.4);
    surveyor.group.scale.setScalar(0.92);
    group.add(surveyor.group);

    const stars = [createStarMesh(0xffe066, 0.15), createStarMesh(0x80ffdb, 0.14)];
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.25;
      moon.rotation.y = t * 0.25;
      surveyor.group.position.y = Math.abs(Math.sin(t * 2.2)) * 0.1 + boost * 0.25;
      sci1.leftArm.rotation.z = -2.2 + Math.sin(t * 4) * 0.25;
      sci2.rightArm.rotation.z = 2.2 - Math.cos(t * 4) * 0.25;
      stars[0].position.set(-0.75, 1.65 + Math.sin(t * 3) * 0.12, 0.4);
      stars[1].position.set(0.75, 1.7 + Math.cos(t * 3) * 0.12, 0.4);
      stars[0].rotation.y = t * 2;
      stars[1].rotation.y = -t * 2;
    };
  } else if (sceneId === 'make-a-difference') {
    const ground = createLunarGround('slope', maxAnisotropy);
    group.add(ground);

    // Lily breaking the 4th wall on the Moon: facing straight forward at the reader!
    const lilyAstro = createLilyCharacter('astronaut');
    lilyAstro.group.position.set(-0.72, 0.08, 0.85);
    lilyAstro.group.rotation.y = 0.05;
    lilyAstro.group.scale.setScalar(1.22);
    group.add(lilyAstro.group);

    // Surveyor 3 proudly beaming right beside Lily!
    surveyor.setMood('proud');
    surveyor.group.position.set(1.05, 0.1, 0.2);
    surveyor.group.rotation.y = -0.25;
    surveyor.group.scale.setScalar(0.92);
    group.add(surveyor.group);

    const earth = createEarth(maxAnisotropy);
    earth.position.set(0.15, 1.85, -1.25);
    earth.scale.setScalar(0.55);
    group.add(earth);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.22),
      createHeartMesh(0xffe066, 0.2),
    ];
    const stars = [
      createStarMesh(0xffe066, 0.16),
      createStarMesh(0x7ce8ff, 0.14),
    ];
    group.add(hearts[0], hearts[1], stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.2;
      lilyAstro.rightArm.rotation.z = 2.45 + Math.sin(t * 5.5 + boost * 4) * 0.38;
      lilyAstro.leftArm.rotation.z = -0.35 - Math.sin(t * 2.5) * 0.1;
      lilyAstro.group.position.y = 0.08 + Math.abs(Math.sin(t * 2.2)) * 0.06;

      surveyor.armGroup.rotation.x = -0.35 + Math.sin(t * 4 + boost * 4) * 0.25;
      surveyor.group.position.y = 0.1 + Math.abs(Math.sin(t * 2)) * 0.06 + boost * 0.2;

      hearts[0].position.set(-1.6, 1.5 + Math.sin(t * 2) * 0.18, 0.5);
      hearts[1].position.set(0.35, 1.75 + Math.cos(t * 2) * 0.18, 0.35);
      hearts[0].rotation.y = t * 1.5;
      hearts[1].rotation.y = -t * 1.5;

      stars[0].position.set(2.0, 1.65 + Math.sin(t * 2.4) * 0.15, 0.15);
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
