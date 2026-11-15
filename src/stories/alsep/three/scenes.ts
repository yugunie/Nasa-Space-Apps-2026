import * as THREE from 'three';
import type { StorySceneId } from '../story/storyData';
import {
  createAlsepCable,
  createAlsepCentralStation,
  createAlsepMagnetometer,
  createAlsepRtg,
  createAlsepSeismometer,
  createApolloAstronaut,
  createEarth,
  createHeartMesh,
  createLilyCharacter,
  createLunarGround,
  createLunarModule,
  createMoonPlanet,
  createRadioDish,
  createScientist,
  createSeismicMonitor,
  createStarMesh,
  type AlsepInstrumentRig,
  type CharacterRig,
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
    new THREE.BoxGeometry(0.95, 0.44, 0.05),
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

  if (sceneId === 'meet-alsep') {
    const ground = createLunarGround('plains', maxAnisotropy);
    group.add(ground);

    const lily: CharacterRig = createLilyCharacter('astronaut');
    lily.group.position.set(-1.75, 0.1, 0.85);
    lily.group.rotation.y = 0.45;
    group.add(lily.group);

    // Cute team of ALSEP scientific helpers!
    const central: AlsepInstrumentRig = createAlsepCentralStation(maxAnisotropy);
    central.setMood('happy');
    central.group.position.set(-0.2, 0.1, 0.35);
    central.group.scale.setScalar(0.92);

    const seismo: AlsepInstrumentRig = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('happy');
    seismo.group.position.set(1.05, 0.1, 0.75);
    seismo.group.rotation.y = -0.25;
    seismo.group.scale.setScalar(0.95);

    const mag: AlsepInstrumentRig = createAlsepMagnetometer(maxAnisotropy);
    mag.setMood('happy');
    mag.group.position.set(1.5, 0.1, -0.35);
    mag.group.rotation.y = -0.45;
    mag.group.scale.setScalar(0.95);

    const rtg = createAlsepRtg();
    rtg.position.set(-0.85, 0.1, -0.45);
    rtg.scale.setScalar(0.9);

    disposables.push(central, seismo, mag);
    group.add(central.group, seismo.group, mag.group, rtg);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0x7ce8ff, 0.12)];
    stars[0].position.set(-0.95, 1.65, 0.25);
    stars[1].position.set(1.1, 1.7, 0.15);
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      lily.rightArm.rotation.z = 2.4 + Math.sin(t * 6 + boost * 4) * 0.35;
      central.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.2)) * 0.06 + boost * 0.2;
      seismo.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.5 + 0.6)) * 0.07 + boost * 0.22;
      mag.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.5 + 1.2)) * 0.07 + boost * 0.22;
      stars[0].rotation.y = t * 1.6;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'little-laboratories') {
    const ground = createLunarGround('crater', maxAnisotropy);
    group.add(ground);

    const central = createAlsepCentralStation(maxAnisotropy);
    central.setMood('proud');
    central.group.position.set(0, 0.1, 0.25);
    central.group.scale.setScalar(1.0);

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('normal');
    seismo.group.position.set(-1.3, 0.1, 0.6);
    seismo.group.rotation.y = 0.35;
    seismo.group.scale.setScalar(0.95);

    const mag = createAlsepMagnetometer(maxAnisotropy);
    mag.setMood('normal');
    mag.group.position.set(1.3, 0.1, 0.55);
    mag.group.rotation.y = -0.35;
    mag.group.scale.setScalar(0.95);

    const rtg = createAlsepRtg();
    rtg.position.set(0.85, 0.1, -0.7);
    rtg.scale.setScalar(0.95);

    // Connecting ribbon cables on the Moon floor
    const c1 = createAlsepCable(0, 0.25, -1.3, 0.6, 0xf59e0b);
    const c2 = createAlsepCable(0, 0.25, 1.3, 0.55, 0x38bdf8);
    const c3 = createAlsepCable(0, 0.25, 0.85, -0.7, 0xf43f5e);

    const alsepBadge = createMilestoneSign('ALSEP LABS', '#0B1E42', '#FFE066', maxAnisotropy);
    alsepBadge.mesh.position.set(0, 2.0, -0.35);

    disposables.push(central, seismo, mag, alsepBadge);
    group.add(central.group, seismo.group, mag.group, rtg, c1, c2, c3, alsepBadge.mesh);

    updateFn = (t, _dt, boost) => {
      const pulse = 0.85 + Math.sin(t * 4 + boost * 5) * 0.45;
      central.beaconMesh.scale.setScalar(pulse);
      seismo.beaconMesh.scale.setScalar(pulse);
      mag.beaconMesh.scale.setScalar(pulse);
      alsepBadge.mesh.position.y = 2.0 + Math.sin(t * 2) * 0.06;
    };
  } else if (sceneId === 'astronauts-setup') {
    const ground = createLunarGround('plains', maxAnisotropy);
    group.add(ground);

    const central = createAlsepCentralStation(maxAnisotropy);
    central.setMood('happy');
    central.group.position.set(0.1, 0.1, 0.15);
    central.group.scale.setScalar(0.9);

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('normal');
    seismo.group.position.set(1.5, 0.1, 0.65);
    seismo.group.scale.setScalar(0.88);

    const rtg = createAlsepRtg();
    rtg.position.set(0.85, 0.1, -0.55);

    const astro1 = createApolloAstronaut(true, 'package');
    astro1.group.position.set(-1.35, 0.1, 0.75);
    astro1.group.rotation.y = 0.8;

    const astro2 = createApolloAstronaut(false, 'mast');
    astro2.group.position.set(-0.5, 0.1, 0.95);
    astro2.group.rotation.y = 0.35;

    const c1 = createAlsepCable(0.1, 0.15, 1.5, 0.65, 0xf59e0b);
    const c2 = createAlsepCable(0.1, 0.15, 0.85, -0.55, 0x38bdf8);

    disposables.push(central, seismo);
    group.add(central.group, seismo.group, rtg, astro1.group, astro2.group, c1, c2);

    updateFn = (t, _dt, boost) => {
      astro1.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.8)) * 0.1 + boost * 0.18;
      astro1.rightArm.rotation.x = -0.3 + Math.sin(t * 3 + boost * 3) * 0.25;
      astro2.rightArm.rotation.x = -0.4 + Math.cos(t * 3.5 + boost * 3) * 0.22;
      seismo.group.position.y = 0.1 + boost * 0.15;
    };
  } else if (sceneId === 'moonquakes-and-more') {
    const ground = createLunarGround('crater', maxAnisotropy);
    group.add(ground);

    // Hero Seismometer listening for moonquakes!
    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('listening');
    seismo.group.position.set(-0.35, 0.1, 0.35);
    seismo.group.scale.setScalar(1.18);

    // Magnetometer studying magnetic fields & temperature
    const mag = createAlsepMagnetometer(maxAnisotropy);
    mag.setMood('listening');
    mag.group.position.set(1.35, 0.1, 0.2);
    mag.group.rotation.y = -0.45;
    mag.group.scale.setScalar(0.95);

    const cable = createAlsepCable(-0.35, 0.35, 1.35, 0.2, 0x80ffdb);

    // Concentric moonquake wave rings rippling across the Moon surface!
    const quakeRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.03, 8, 32),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x80ffdb : 0xffe066,
          transparent: true,
          opacity: 0.85,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      quakeRings.push(ring);
    }

    disposables.push(seismo, mag);
    group.add(seismo.group, mag.group, cable);

    updateFn = (t, _dt, boost) => {
      const jiggle = Math.sin(t * (18 + boost * 14)) * (0.015 + boost * 0.035);
      seismo.group.position.x = -0.35 + jiggle;
      seismo.beaconMesh.scale.setScalar(0.9 + Math.sin(t * 8) * 0.35);

      quakeRings.forEach((r, idx) => {
        const p = (t * (0.75 + boost * 0.6) + idx * 0.33) % 1;
        r.position.set(-0.35, 0.16, 0.35);
        r.scale.setScalar(0.55 + p * 1.9);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.9;
      });
    };
  } else if (sceneId === 'never-went-home') {
    const ground = createLunarGround('slope', maxAnisotropy);
    group.add(ground);

    // ALSEP instruments staying behind on the left
    const central = createAlsepCentralStation(maxAnisotropy);
    central.setMood('normal');
    central.group.position.set(-1.35, 0.1, 0.35);
    central.group.rotation.y = 0.35;
    central.group.scale.setScalar(0.88);

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('happy');
    seismo.group.position.set(-0.45, 0.1, 0.75);
    seismo.group.rotation.y = 0.2;
    seismo.group.scale.setScalar(0.85);

    const mag = createAlsepMagnetometer(maxAnisotropy);
    mag.setMood('happy');
    mag.group.position.set(-1.85, 0.1, -0.35);
    mag.group.scale.setScalar(0.8);

    // Lunar Module waiting on the right, astronauts waving goodbye to ALSEP!
    const lm = createLunarModule();
    lm.group.position.set(1.55, 0.1, -0.2);
    lm.group.scale.setScalar(0.95);

    const astro1 = createApolloAstronaut(true, 'none');
    astro1.group.position.set(0.75, 0.1, 0.65);
    astro1.group.rotation.y = -0.95;

    const astro2 = createApolloAstronaut(false, 'none');
    astro2.group.position.set(1.3, 0.1, 0.85);
    astro2.group.rotation.y = -1.05;

    const c1 = createAlsepCable(-1.35, 0.35, -0.45, 0.75, 0xf59e0b);
    const c2 = createAlsepCable(-1.35, 0.35, -1.85, -0.35, 0x38bdf8);

    disposables.push(central, seismo, mag);
    group.add(central.group, seismo.group, mag.group, lm.group, astro1.group, astro2.group, c1, c2);

    updateFn = (t, _dt, boost) => {
      astro1.rightArm.rotation.z = 2.4 + Math.sin(t * 5.5 + boost * 4) * 0.35;
      astro2.rightArm.rotation.z = 2.35 + Math.cos(t * 5.5 + boost * 4) * 0.35;
      central.beaconMesh.scale.setScalar(0.9 + Math.sin(t * 4) * 0.25);
      seismo.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.4)) * 0.04;
    };
  } else if (sceneId === 'sending-data-years') {
    const ground = createLunarGround('plains', maxAnisotropy);
    group.add(ground);

    // ALSEP on Moon (left) beaming telemetry signals across space to Earth scientists (right)!
    const central = createAlsepCentralStation(maxAnisotropy);
    central.setMood('proud');
    central.group.position.set(-1.35, 0.1, 0.35);
    central.group.rotation.y = 0.35;
    central.group.scale.setScalar(0.95);

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('happy');
    seismo.group.position.set(-2.0, 0.1, 0.7);
    seismo.group.scale.setScalar(0.8);

    const earth = createEarth(maxAnisotropy);
    earth.position.set(1.65, 1.45, -0.7);
    earth.scale.setScalar(0.68);

    const dish = createRadioDish();
    dish.position.set(1.0, 0.1, 0.4);
    dish.rotation.y = -0.8;
    dish.scale.setScalar(0.9);

    const sci = createScientist(0x3b2314, 0x38bdf8, 'tablet');
    sci.group.position.set(1.8, 0.1, 0.75);
    sci.group.rotation.y = -0.55;

    const monitor = createSeismicMonitor(maxAnisotropy);
    monitor.mesh.position.set(0.35, 0.1, -0.45);
    monitor.mesh.scale.setScalar(0.85);

    // Traveling cyan signal rings from ALSEP Central Station to Earth dish!
    const signalRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.026, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0x7ce8ff, transparent: true, opacity: 0.85 }),
      );
      ring.rotation.y = Math.PI / 2;
      group.add(ring);
      signalRings.push(ring);
    }

    disposables.push(central, seismo, monitor);
    group.add(central.group, seismo.group, earth, dish, sci.group, monitor.mesh);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.25;
      sci.leftArm.rotation.z = -2.2 + Math.sin(t * 4.5) * 0.2;

      signalRings.forEach((r, idx) => {
        const p = (t * (0.9 + boost * 0.7) + idx * 0.33) % 1;
        r.position.set(
          THREE.MathUtils.lerp(-1.2, 0.9, p),
          1.25 + Math.sin(p * Math.PI) * 0.45,
          0.35,
        );
        r.scale.setScalar(0.7 + Math.sin(p * Math.PI) * 0.6);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.95 - p * 0.5;
      });
    };
  } else if (sceneId === 'september-1977') {
    const ground = createLunarGround('crater', maxAnisotropy);
    group.add(ground);

    // ALSEP instruments resting peacefully on the Moon under glowing Earthlight
    const central = createAlsepCentralStation(maxAnisotropy);
    central.setMood('sleepy');
    central.group.position.set(-0.35, 0.1, 0.35);
    central.group.scale.setScalar(0.95);

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('sleepy');
    seismo.group.position.set(-1.45, 0.1, 0.65);
    seismo.group.rotation.y = 0.3;
    seismo.group.scale.setScalar(0.88);

    const mag = createAlsepMagnetometer(maxAnisotropy);
    mag.setMood('sleepy');
    mag.group.position.set(0.85, 0.1, 0.65);
    mag.group.rotation.y = -0.3;
    mag.group.scale.setScalar(0.88);

    const rtg = createAlsepRtg();
    rtg.position.set(-0.95, 0.1, -0.5);

    const c1 = createAlsepCable(-0.35, 0.35, -1.45, 0.65, 0x64748b);
    const c2 = createAlsepCable(-0.35, 0.35, 0.85, 0.65, 0x64748b);

    const earth = createEarth(maxAnisotropy);
    earth.position.set(1.6, 1.45, -0.95);
    earth.scale.setScalar(0.78);

    const sepBadge = createMilestoneSign('SEP 1977', '#0B1E42', '#93C5FD', maxAnisotropy);
    sepBadge.mesh.position.set(-1.3, 1.9, -0.35);

    // Turn off beacon glow intensity since NASA switched them off
    (central.beaconMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.08;
    (seismo.beaconMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.08;
    (mag.beaconMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.08;

    disposables.push(central, seismo, mag, sepBadge);
    group.add(
      central.group,
      seismo.group,
      mag.group,
      rtg,
      c1,
      c2,
      earth,
      sepBadge.mesh,
    );

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.18;
      earth.position.y = 1.45 + Math.sin(t * 0.9) * 0.06 + boost * 0.12;
      sepBadge.mesh.position.y = 1.9 + Math.cos(t * 1.4) * 0.04;
    };
  } else if (sceneId === 'knowledge-remains') {
    const moon = createMoonPlanet(maxAnisotropy);
    moon.position.set(1.75, 0.25, -0.2);
    moon.scale.setScalar(0.95);
    group.add(moon);

    const monitor = createSeismicMonitor(maxAnisotropy);
    monitor.mesh.position.set(0, 0.1, 0.15);
    monitor.mesh.scale.setScalar(1.1);

    const sci1 = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    sci1.group.position.set(-1.65, 0, 0.85);
    sci1.group.rotation.y = 0.45;
    const sci2 = createScientist(0x9a3412, 0xf59e0b, 'tablet');
    sci2.group.position.set(-0.95, 0, 1.0);
    sci2.group.rotation.y = 0.25;

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('proud');
    seismo.group.position.set(0.95, 0, 0.85);
    seismo.group.scale.setScalar(0.8);

    const stars = [createStarMesh(0xffe066, 0.15), createStarMesh(0x80ffdb, 0.14)];
    group.add(stars[0], stars[1]);

    disposables.push(monitor, seismo);
    group.add(monitor.mesh, sci1.group, sci2.group, seismo.group);

    updateFn = (t, _dt, boost) => {
      moon.rotation.y = t * 0.25;
      sci1.leftArm.rotation.z = -2.1 + Math.sin(t * 4) * 0.2;
      sci2.group.position.y = Math.abs(Math.sin(t * 2.5)) * 0.06 + boost * 0.15;
      stars[0].position.set(-0.7, 1.6 + Math.sin(t * 2.5) * 0.14, 0.35);
      stars[1].position.set(0.8, 1.65 + Math.cos(t * 2.5) * 0.14, 0.35);
      stars[0].rotation.y = t * 2;
      stars[1].rotation.y = -t * 2;
    };
  } else if (sceneId === 'change-the-world') {
    const ground = createLunarGround('slope', maxAnisotropy);
    group.add(ground);

    // Lily breaking the 4th wall on the Moon: facing straight forward at the reader!
    const lilyAstro = createLilyCharacter('astronaut');
    lilyAstro.group.position.set(-0.85, 0.08, 0.85);
    lilyAstro.group.rotation.y = 0.05;
    lilyAstro.group.scale.setScalar(1.2);
    group.add(lilyAstro.group);

    // The whole proud ALSEP laboratory team beside Lily!
    const central = createAlsepCentralStation(maxAnisotropy);
    central.setMood('proud');
    central.group.position.set(0.65, 0.1, 0.2);
    central.group.rotation.y = -0.2;
    central.group.scale.setScalar(0.86);

    const seismo = createAlsepSeismometer(maxAnisotropy);
    seismo.setMood('happy');
    seismo.group.position.set(1.55, 0.1, 0.65);
    seismo.group.rotation.y = -0.35;
    seismo.group.scale.setScalar(0.8);

    const mag = createAlsepMagnetometer(maxAnisotropy);
    mag.setMood('happy');
    mag.group.position.set(-1.75, 0.1, 0.15);
    mag.group.rotation.y = 0.35;
    mag.group.scale.setScalar(0.75);

    const earth = createEarth(maxAnisotropy);
    earth.position.set(-0.1, 1.85, -1.25);
    earth.scale.setScalar(0.55);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.22),
      createHeartMesh(0xffe066, 0.2),
    ];
    const stars = [
      createStarMesh(0xffe066, 0.16),
      createStarMesh(0x7ce8ff, 0.14),
    ];

    disposables.push(central, seismo, mag);
    group.add(
      central.group,
      seismo.group,
      mag.group,
      earth,
      hearts[0],
      hearts[1],
      stars[0],
      stars[1],
    );

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.2;
      lilyAstro.rightArm.rotation.z = 2.45 + Math.sin(t * 5.5 + boost * 4) * 0.38;
      lilyAstro.leftArm.rotation.z = -0.35 - Math.sin(t * 2.5) * 0.1;
      lilyAstro.group.position.y = 0.08 + Math.abs(Math.sin(t * 2.2)) * 0.06;

      central.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.4)) * 0.05 + boost * 0.18;
      seismo.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.6 + 0.7)) * 0.05 + boost * 0.18;
      mag.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.6 + 1.4)) * 0.05 + boost * 0.18;

      hearts[0].position.set(-1.6, 1.5 + Math.sin(t * 2) * 0.18, 0.5);
      hearts[1].position.set(0.25, 1.75 + Math.cos(t * 2) * 0.18, 0.35);
      hearts[0].rotation.y = t * 1.5;
      hearts[1].rotation.y = -t * 1.5;

      stars[0].position.set(1.9, 1.6 + Math.sin(t * 2.4) * 0.15, 0.15);
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
