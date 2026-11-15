import * as THREE from 'three';
import type { StorySceneId } from '../story/storyData';
import {
  createClimateMonitor,
  createDustStormVortex,
  createEarth,
  createHeartMesh,
  createHematiteBlueberries,
  createLayeredBedrockAndSalt,
  createMarsAstronaut,
  createMarsGround,
  createMarsPlanet,
  createMarsRocket,
  createMartianAlien,
  createOpportunityRover,
  createRadioDish,
  createScientist,
  createStarMesh,
  type OpportunityRig,
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

  if (sceneId === 'mission-to-mars') {
    const earth = createEarth(maxAnisotropy);
    earth.position.set(-2.15, 0.2, 0.3);
    earth.scale.setScalar(0.84);
    group.add(earth);

    const mars = createMarsPlanet(maxAnisotropy);
    mars.position.set(2.1, 0.2, 0.25);
    mars.scale.setScalar(0.88);
    group.add(mars);

    const sci = createScientist(0x4a3525, 0x38bdf8, 'clipboard');
    sci.group.position.set(-1.35, 0, 1.3);
    sci.group.rotation.y = 0.45;
    group.add(sci.group);

    // Trajectory star-dots from Earth to Mars
    const pathDots: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe066 }),
      );
      const u = (i + 1) / 7;
      dot.position.set(
        THREE.MathUtils.lerp(-1.45, 1.45, u),
        0.75 + Math.sin(u * Math.PI) * 0.85,
        0.3,
      );
      group.add(dot);
      pathDots.push(dot);
    }

    const rover: OpportunityRig = createOpportunityRover(maxAnisotropy);
    rover.setMood('happy');
    rover.group.scale.setScalar(0.76);
    disposables.push(rover);
    group.add(rover.group);

    updateFn = (t, _dt, boost) => {
      earth.rotation.y = t * 0.28;
      mars.rotation.y = t * 0.25;
      const u = (t * (0.28 + boost * 0.35)) % 1;
      rover.group.position.set(
        THREE.MathUtils.lerp(-1.3, 1.3, u),
        0.72 + Math.sin(u * Math.PI) * 0.9,
        0.35,
      );
      rover.group.rotation.z = -Math.cos(u * Math.PI) * 0.25;
      rover.group.rotation.y = 0.45;
      pathDots.forEach((d, idx) => {
        d.scale.setScalar(0.8 + 0.35 * Math.sin(t * 4 - idx * 0.7));
      });
    };
  } else if (sceneId === 'landing-2004') {
    const ground = createMarsGround('crater', maxAnisotropy);
    group.add(ground);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('happy');
    rover.group.position.set(0, 0.12, 0.25);
    rover.group.scale.setScalar(1.08);
    disposables.push(rover);
    group.add(rover.group);

    const sign = createMilestoneSign('JAN 24 2004', '#260912', '#FFE066', maxAnisotropy);
    sign.mesh.position.set(0, 1.95, -0.45);
    disposables.push(sign);
    group.add(sign.mesh);

    const stars = [createStarMesh(0xffe066, 0.14), createStarMesh(0x80ffdb, 0.12)];
    stars[0].position.set(-1.25, 1.45, 0.3);
    stars[1].position.set(1.25, 1.45, 0.3);
    group.add(stars[0], stars[1]);

    updateFn = (t, dt, boost) => {
      rover.group.position.x = Math.sin(t * 0.8) * 0.45;
      rover.group.position.y = 0.12 + boost * 0.2;
      rover.wheels.forEach((w) => {
        w.rotation.x += (1.8 + boost * 4) * dt;
      });
      rover.mastHead.rotation.y = Math.sin(t * 1.4) * 0.25;
      sign.mesh.position.y = 1.95 + Math.cos(t * 2) * 0.05;
      stars[0].rotation.y = t * 1.8;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'hematite-blueberries') {
    const ground = createMarsGround('plains', maxAnisotropy);
    group.add(ground);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('curious');
    rover.group.position.set(-0.75, 0.12, 0.35);
    rover.group.rotation.y = 0.45;
    rover.group.scale.setScalar(1.02);
    disposables.push(rover);
    group.add(rover.group);

    const blueberries = createHematiteBlueberries();
    blueberries.position.set(0.85, 0.1, 0.55);
    blueberries.scale.setScalar(1.15);
    group.add(blueberries);

    // Floating water droplet icon indicating hematite forms in water!
    const drop = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.28, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.1,
      }),
    );
    drop.position.set(0.95, 1.15, 0.55);
    group.add(drop);

    updateFn = (t, _dt, boost) => {
      rover.armGroup.rotation.x = 0.18 + Math.sin(t * (2.8 + boost * 3)) * 0.22;
      rover.mastHead.rotation.x = 0.18;
      rover.mastHead.rotation.y = 0.22 + Math.sin(t * 2) * 0.12;
      drop.position.y = 1.15 + Math.sin(t * 2.4) * 0.12 + boost * 0.18;
      drop.rotation.y = t * 1.4;
    };
  } else if (sceneId === 'salt-and-water') {
    const ground = createMarsGround('crater', maxAnisotropy);
    group.add(ground);

    const strataPool = createLayeredBedrockAndSalt();
    strataPool.position.set(0.65, 0.12, 0.35);
    strataPool.scale.setScalar(1.05);
    group.add(strataPool);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('happy');
    rover.group.position.set(-1.1, 0.12, 0.55);
    rover.group.rotation.y = 0.55;
    rover.group.scale.setScalar(0.95);
    disposables.push(rover);
    group.add(rover.group);

    const stars = [createStarMesh(0x7ce8ff, 0.15), createStarMesh(0xffe066, 0.13)];
    stars[0].position.set(0.85, 1.3, 0.4);
    stars[1].position.set(-0.35, 1.5, 0.25);
    group.add(stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      rover.armGroup.rotation.x = 0.15 + Math.sin(t * 3 + boost * 4) * 0.2;
      rover.group.position.y = 0.12 + boost * 0.16;
      stars[0].position.y = 1.3 + Math.sin(t * 2.5) * 0.12;
      stars[1].position.y = 1.5 + Math.cos(t * 2.5) * 0.12;
      stars[0].rotation.y = t * 1.8;
      stars[1].rotation.y = -t * 1.8;
    };
  } else if (sceneId === 'three-month-worry') {
    const sci1 = createScientist(0x3b2314, 0x38bdf8, 'clipboard');
    sci1.group.position.set(-1.35, 0, 0.75);
    sci1.group.rotation.y = 0.35;
    const sci2 = createScientist(0x9a3412, 0xf59e0b, 'none');
    sci2.group.position.set(-0.45, 0, 0.9);
    sci2.group.rotation.y = 0.2;
    group.add(sci1.group, sci2.group);

    // Thought cloud bubble containing dusty miniature MER-B + "3 MONTHS" badge!
    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(0.75, 1.55, 0.1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.75,
      transparent: true,
      opacity: 0.92,
    });
    const puffOffsets: [number, number, number, number][] = [
      [0, 0, -0.35, 0.68],
      [-0.58, -0.05, -0.32, 0.5],
      [0.58, -0.05, -0.32, 0.5],
      [-0.3, 0.35, -0.35, 0.45],
      [0.3, 0.35, -0.35, 0.45],
    ];
    for (const [cx, cy, cz, cr] of puffOffsets) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(cr, 16, 16), cloudMat);
      puff.position.set(cx, cy, cz);
      cloudGroup.add(puff);
    }
    // Small trailing thought puffs
    const trail1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), cloudMat);
    trail1.position.set(-0.85, -0.58, 0.25);
    const trail2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), cloudMat);
    trail2.position.set(-1.12, -0.78, 0.4);
    cloudGroup.add(trail1, trail2);

    const dustyMiniRover = createOpportunityRover(maxAnisotropy, true);
    dustyMiniRover.setMood('sleepy');
    dustyMiniRover.group.position.set(0, -0.22, 0.12);
    dustyMiniRover.group.scale.setScalar(0.72);
    disposables.push(dustyMiniRover);
    cloudGroup.add(dustyMiniRover.group);

    const threeMoSign = createMilestoneSign('3 MONTHS?', '#260912', '#FF9E80', maxAnisotropy);
    threeMoSign.mesh.position.set(0, 0.68, 0.1);
    threeMoSign.mesh.scale.setScalar(0.85);
    disposables.push(threeMoSign);
    cloudGroup.add(threeMoSign.mesh);

    group.add(cloudGroup);

    updateFn = (t, _dt, boost) => {
      cloudGroup.position.y = 1.55 + Math.sin(t * 1.8) * 0.08 + boost * 0.15;
      sci1.leftArm.rotation.z = -0.3 + Math.sin(t * 2.5) * 0.15;
      sci2.leftArm.rotation.z = -1.6 + Math.sin(t * 2) * 0.12;
    };
  } else if (sceneId === 'kept-sending-data') {
    const ground = createMarsGround('ridge', maxAnisotropy);
    group.add(ground);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('proud');
    rover.group.position.set(-0.95, 0.12, 0.4);
    rover.group.rotation.y = 0.45;
    rover.group.scale.setScalar(1.0);
    disposables.push(rover);
    group.add(rover.group);

    const earth = createEarth(maxAnisotropy);
    earth.position.set(1.65, 1.45, -0.6);
    earth.scale.setScalar(0.68);
    group.add(earth);

    const dish = createRadioDish();
    dish.position.set(1.25, 0.1, 0.45);
    dish.rotation.y = -0.8;
    group.add(dish);

    // Glowing cyan data rings beaming from MER-B's dish to Earth!
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.026, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0x80ffdb, transparent: true, opacity: 0.85 }),
      );
      r.rotation.y = Math.PI / 2;
      group.add(r);
      rings.push(r);
    }

    updateFn = (t, dt, boost) => {
      earth.rotation.y = t * 0.25;
      rover.wheels.forEach((w) => {
        w.rotation.x += (1.5 + boost * 3) * dt;
      });
      rover.group.position.y = 0.12 + Math.abs(Math.sin(t * 2.5)) * 0.04 + boost * 0.16;

      rings.forEach((r, idx) => {
        const p = (t * (0.95 + boost * 0.6) + idx * 0.33) % 1;
        r.position.set(
          THREE.MathUtils.lerp(-0.95, 1.2, p),
          0.9 + Math.sin(p * Math.PI) * 0.45,
          0.35,
        );
        r.scale.setScalar(0.7 + Math.sin(p * Math.PI) * 0.6);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.95 - p * 0.5;
      });
    };
  } else if (sceneId === 'dust-storm-14-years') {
    const ground = createMarsGround('crater', maxAnisotropy);
    group.add(ground);

    const dustyRover = createOpportunityRover(maxAnisotropy, true);
    dustyRover.setMood('sleepy');
    dustyRover.group.position.set(-0.2, 0.12, 0.35);
    dustyRover.group.scale.setScalar(1.0);
    disposables.push(dustyRover);
    group.add(dustyRover.group);

    const sign14 = createMilestoneSign('14 YEARS', '#260912', '#FFE066', maxAnisotropy);
    sign14.mesh.position.set(-0.2, 1.95, -0.45);
    disposables.push(sign14);
    group.add(sign14.mesh);

    const vortex1 = createDustStormVortex(4);
    vortex1.position.set(-1.45, 0.12, 0.15);
    const vortex2 = createDustStormVortex(4);
    vortex2.position.set(1.4, 0.12, 0.2);
    group.add(vortex1, vortex2);

    updateFn = (t, dt, boost) => {
      const spin = (1.8 + boost * 3.5) * dt;
      vortex1.rotation.y += spin;
      vortex2.rotation.y -= spin * 1.1;
      vortex1.position.x = -1.35 + Math.sin(t * 0.8) * 0.25;
      vortex2.position.x = 1.35 + Math.cos(t * 0.8) * 0.25;
      sign14.mesh.position.y = 1.95 + Math.cos(t * 1.6) * 0.05;
    };
  } else if (sceneId === 'preparing-humans') {
    const ground = createMarsGround('plains', maxAnisotropy);
    group.add(ground);

    const rocket = createMarsRocket();
    rocket.position.set(1.35, 0.1, -0.15);
    rocket.scale.setScalar(1.1);
    group.add(rocket);

    const astro1 = createMarsAstronaut();
    astro1.group.position.set(-0.25, 0.1, 0.75);
    astro1.group.rotation.y = 0.2;
    const astro2 = createMarsAstronaut();
    astro2.group.position.set(0.45, 0.1, 0.9);
    astro2.group.rotation.y = -0.25;
    group.add(astro1.group, astro2.group);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('proud');
    rover.group.position.set(-1.45, 0.12, 0.35);
    rover.group.rotation.y = 0.45;
    rover.group.scale.setScalar(0.85);
    disposables.push(rover);
    group.add(rover.group);

    updateFn = (t, _dt, boost) => {
      astro1.rightArm.rotation.z = 2.4 + Math.sin(t * 5 + boost * 4) * 0.3;
      astro2.leftArm.rotation.z = -2.3 - Math.cos(t * 5 + boost * 4) * 0.3;
      rocket.position.y = 0.1 + boost * 0.4;
      rover.group.position.y = 0.12 + Math.abs(Math.sin(t * 2)) * 0.04;
    };
  } else if (sceneId === 'mars-climate-data') {
    const ground = createMarsGround('ridge', maxAnisotropy);
    group.add(ground);

    const vortex = createDustStormVortex(5);
    vortex.position.set(1.25, 0.14, 0.25);
    vortex.scale.setScalar(1.25);
    group.add(vortex);

    const monitor = createClimateMonitor(maxAnisotropy);
    monitor.mesh.position.set(-0.2, 0.12, -0.35);
    monitor.mesh.scale.setScalar(0.95);
    disposables.push(monitor);
    group.add(monitor.mesh);

    const sci = createScientist(0x4a3525, 0xf59e0b, 'tablet');
    sci.group.position.set(-1.55, 0.1, 0.75);
    sci.group.rotation.y = 0.55;
    group.add(sci.group);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('curious');
    rover.group.position.set(-0.55, 0.12, 0.65);
    rover.group.rotation.y = 0.4;
    rover.group.scale.setScalar(0.85);
    disposables.push(rover);
    group.add(rover.group);

    updateFn = (t, dt, boost) => {
      vortex.rotation.y += (2.5 + boost * 4) * dt;
      vortex.position.x = 1.25 + Math.sin(t * 1.4) * 0.28;
      rover.mastHead.rotation.y = Math.sin(t * 2.2) * 0.3;
      sci.leftArm.rotation.z = -0.35 + Math.sin(t * 3) * 0.15;
    };
  } else if (sceneId === 'life-and-aliens') {
    const ground = createMarsGround('ridge', maxAnisotropy);
    group.add(ground);

    // Friendly little Martian aliens waving on Mars beside MER-B!
    const alien1 = createMartianAlien(0x4ade80, 0xffe066);
    alien1.group.position.set(-0.95, 0.1, 0.75);
    alien1.group.rotation.y = 0.1;
    alien1.group.scale.setScalar(1.18);

    const alien2 = createMartianAlien(0x38bdf8, 0xff9e80);
    alien2.group.position.set(1.55, 0.1, 0.55);
    alien2.group.rotation.y = -0.25;
    alien2.group.scale.setScalar(1.0);
    group.add(alien1.group, alien2.group);

    const rover = createOpportunityRover(maxAnisotropy);
    rover.setMood('happy');
    rover.group.position.set(0.35, 0.12, 0.2);
    rover.group.rotation.y = -0.1;
    rover.group.scale.setScalar(0.95);
    disposables.push(rover);
    group.add(rover.group);

    const hearts = [
      createHeartMesh(0xf43f5e, 0.22),
      createHeartMesh(0xffe066, 0.2),
    ];
    const stars = [
      createStarMesh(0xffe066, 0.16),
      createStarMesh(0x80ffdb, 0.14),
    ];
    group.add(hearts[0], hearts[1], stars[0], stars[1]);

    updateFn = (t, _dt, boost) => {
      alien1.rightArm.rotation.z = 2.45 + Math.sin(t * 5.5 + boost * 4) * 0.38;
      alien1.group.position.y = 0.1 + Math.abs(Math.sin(t * 2.4)) * 0.08 + boost * 0.2;

      alien2.leftArm.rotation.z = -2.45 - Math.cos(t * 5.5 + boost * 4) * 0.38;
      alien2.group.position.y = 0.1 + Math.abs(Math.cos(t * 2.4)) * 0.08 + boost * 0.2;

      rover.group.position.y = 0.12 + Math.abs(Math.sin(t * 2.2)) * 0.05 + boost * 0.18;

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
