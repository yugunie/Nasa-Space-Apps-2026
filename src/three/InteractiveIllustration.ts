import * as THREE from 'three';

/**
 * Procedural 3D interactive celestial illustrations that react to cursor movement and click events.
 * Placed in the celestial viewfinder on the right page of the open 3D storybook.
 */

export class InteractiveIllustrationManager {
  public group: THREE.Group;
  private currentType: string = '';
  private activeIllustrationGroup: THREE.Group;

  // Animation state
  private mouseNormalized: THREE.Vector2 = new THREE.Vector2(0, 0);
  private targetRotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  private flarePulse: number = 0;

  // Sub-objects
  private particlesMesh: THREE.Points | null = null;
  private particlePositions: Float32Array | null = null;
  private particleVelocities: Float32Array | null = null;
  private innerCore: THREE.Mesh | null = null;
  private ringMesh: THREE.Mesh | null = null;
  private ringsGroup: THREE.Group | null = null;
  private jetsGroup: THREE.Group | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  constructor() {
    this.group = new THREE.Group();
    this.activeIllustrationGroup = new THREE.Group();
    this.group.add(this.activeIllustrationGroup);
  }

  public setIllustration(type: 'nebula' | 'blackhole' | 'pulsar' | 'dysonsphere') {
    if (this.currentType === type) return;
    this.currentType = type;

    // Clear current
    while (this.activeIllustrationGroup.children.length > 0) {
      const child = this.activeIllustrationGroup.children[0];
      this.activeIllustrationGroup.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
    this.particlesMesh = null;
    this.innerCore = null;
    this.ringMesh = null;
    this.ringsGroup = null;
    this.jetsGroup = null;

    switch (type) {
      case 'nebula':
        this.createNebula();
        break;
      case 'blackhole':
        this.createBlackHole();
        break;
      case 'pulsar':
        this.createPulsar();
        break;
      case 'dysonsphere':
        this.createDysonSphere();
        break;
    }
  }

  // 1. NEBULA CORE: Glowing proto-star with gas swirling particle cloud
  private createNebula() {
    const group = this.activeIllustrationGroup;

    // Central proto-star core
    const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.5,
      roughness: 0.2,
      metalness: 0.1,
    });
    this.innerCore = new THREE.Mesh(coreGeo, coreMat);
    group.add(this.innerCore);

    // Corona aura
    const coronaGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    group.add(new THREE.Mesh(coronaGeo, coronaMat));

    // Swirling nebula particles
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x38bdf8); // Sky blue
    const c2 = new THREE.Color(0xa855f7); // Purple
    const c3 = new THREE.Color(0xf43f5e); // Rose flare

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.pow(Math.random(), 1.5) * 1.5;
      const spreadY = (Math.random() - 0.5) * 0.6;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = spreadY;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      const mixed = Math.random() < 0.5 ? c1.clone().lerp(c2, Math.random()) : c2.clone().lerp(c3, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particlesMesh = new THREE.Points(geometry, pMaterial);
    this.particlePositions = positions;
    this.particleVelocities = velocities;
    group.add(this.particlesMesh);
  }

  // 2. BLACK HOLE: Kerr Singularity with relativistic accretion disk and jets
  private createBlackHole() {
    const group = this.activeIllustrationGroup;

    // Pure black horizon sphere
    const horizonGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.innerCore = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(this.innerCore);

    // Glowing photon ring
    const photonGeo = new THREE.RingGeometry(0.43, 0.49, 48);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const photonRing = new THREE.Mesh(photonGeo, photonMat);
    photonRing.rotation.x = Math.PI / 2.5;
    group.add(photonRing);

    // Accretion Disk
    const diskGeo = new THREE.RingGeometry(0.55, 1.85, 64);
    // Procedural canvas gradient texture for accretion plasma
    const diskCanvas = document.createElement('canvas');
    diskCanvas.width = 512;
    diskCanvas.height = 64;
    const ctx = diskCanvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.15, '#fbbf24'); // Amber
    grad.addColorStop(0.5, '#f97316');  // Orange
    grad.addColorStop(0.85, '#dc2626'); // Red
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 64);

    const diskTex = new THREE.CanvasTexture(diskCanvas);
    diskTex.colorSpace = THREE.SRGBColorSpace;
    const diskMat = new THREE.MeshBasicMaterial({
      map: diskTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });

    this.ringMesh = new THREE.Mesh(diskGeo, diskMat);
    this.ringMesh.rotation.x = Math.PI / 3;
    group.add(this.ringMesh);

    // Relativistic polar jets
    this.jetsGroup = new THREE.Group();
    const jetGeo = new THREE.CylinderGeometry(0.015, 0.15, 2.2, 16);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const jetTop = new THREE.Mesh(jetGeo, jetMat);
    jetTop.position.y = 1.1;
    const jetBottom = new THREE.Mesh(jetGeo, jetMat);
    jetBottom.position.y = -1.1;
    jetBottom.rotation.z = Math.PI;

    this.jetsGroup.add(jetTop);
    this.jetsGroup.add(jetBottom);
    this.jetsGroup.rotation.x = -Math.PI / 6;
    group.add(this.jetsGroup);
  }

  // 3. PULSAR: Ultra-dense neutron star with dual sweeping synchrotron cones
  private createPulsar() {
    const group = this.activeIllustrationGroup;

    // Small dense white-cyan sphere
    const pulsarGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const pulsarMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 3,
      metalness: 0.8,
      roughness: 0.1,
    });
    this.innerCore = new THREE.Mesh(pulsarGeo, pulsarMat);
    group.add(this.innerCore);

    // Magnetic field toruses
    this.ringsGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const torusGeo = new THREE.TorusGeometry(0.7 + i * 0.22, 0.012, 12, 48);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.45,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = (i * Math.PI) / 4;
      torus.rotation.y = (i * Math.PI) / 6;
      this.ringsGroup.add(torus);
    }
    group.add(this.ringsGroup);

    // Synchrotron emission beam cones
    this.jetsGroup = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.35, 2.5, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const cone1 = new THREE.Mesh(coneGeo, coneMat);
    cone1.position.y = 1.25;
    const cone2 = new THREE.Mesh(coneGeo, coneMat);
    cone2.position.y = -1.25;
    cone2.rotation.z = Math.PI;

    this.jetsGroup.add(cone1);
    this.jetsGroup.add(cone2);
    group.add(this.jetsGroup);
  }

  // 4. DYSON SPHERE: Central Star enclosed by multiple nested orbital rings
  private createDysonSphere() {
    const group = this.activeIllustrationGroup;

    // Central Sun
    const sunGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    this.innerCore = new THREE.Mesh(sunGeo, sunMat);
    group.add(this.innerCore);

    // Concentric Dyson collector rings (nested gimbals)
    this.ringsGroup = new THREE.Group();
    const ringRadii = [0.85, 1.25, 1.65];
    const ringColors = [0x10b981, 0x38bdf8, 0xf59e0b];

    ringRadii.forEach((r, idx) => {
      const ringContainer = new THREE.Group();

      // Main structural ring
      const ringGeo = new THREE.TorusGeometry(r, 0.02, 12, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: ringColors[idx],
        metalness: 0.9,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringContainer.add(ringMesh);

      // Collector mirrors around the ring
      const panelsCount = 12 + idx * 6;
      const panelGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.95,
        roughness: 0.1,
      });

      for (let p = 0; p < panelsCount; p++) {
        const theta = (p / panelsCount) * Math.PI * 2;
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(Math.cos(theta) * r, Math.sin(theta) * r, 0);
        panel.rotation.z = theta;
        panel.rotation.x = Math.PI / 4;
        ringContainer.add(panel);
      }

      ringContainer.rotation.x = (idx * Math.PI) / 3;
      ringContainer.rotation.y = (idx * Math.PI) / 4;
      this.ringsGroup!.add(ringContainer);
    });

    group.add(this.ringsGroup);
  }

  /**
   * Updates cursor coordinates (-1 to 1) for interactive parallax
   */
  public onPointerMove(normalizedX: number, normalizedY: number) {
    this.mouseNormalized.set(normalizedX, normalizedY);
    this.targetRotation.x = normalizedY * 0.7;
    this.targetRotation.y = normalizedX * 0.7;
  }

  /**
   * On click: triggers energetic pulse ripple
   */
  public triggerClickEffect() {
    this.flarePulse = 1.0;
  }

  /**
   * Animation tick
   */
  public update(delta: number) {
    const elapsed = this.clock.getElapsedTime();

    // Smooth exponential damping rotation toward cursor
    this.activeIllustrationGroup.rotation.x = THREE.MathUtils.damp(
      this.activeIllustrationGroup.rotation.x,
      this.targetRotation.x,
      4.0,
      delta
    );
    this.activeIllustrationGroup.rotation.y = THREE.MathUtils.damp(
      this.activeIllustrationGroup.rotation.y,
      this.targetRotation.y,
      4.0,
      delta
    );

    // Decay pulse
    if (this.flarePulse > 0.001) {
      this.flarePulse = THREE.MathUtils.damp(this.flarePulse, 0, 3.0, delta);
    }

    // Specific object dynamics
    if (this.currentType === 'nebula') {
      if (this.particlesMesh && this.particlePositions) {
        this.particlesMesh.rotation.y += delta * 0.35;
        this.particlesMesh.rotation.z = Math.sin(elapsed * 0.5) * 0.15;

        // Pulse scale
        const scale = 1.0 + this.flarePulse * 0.4 + Math.sin(elapsed * 2) * 0.03;
        this.particlesMesh.scale.set(scale, scale, scale);
      }
      if (this.innerCore) {
        const coreScale = 1.0 + this.flarePulse * 0.5 + Math.sin(elapsed * 4) * 0.05;
        this.innerCore.scale.set(coreScale, coreScale, coreScale);
      }
    } else if (this.currentType === 'blackhole') {
      if (this.ringMesh) {
        this.ringMesh.rotation.z += delta * (1.2 + this.flarePulse * 3.0);
        const diskScale = 1.0 + Math.sin(elapsed * 2) * 0.02 + this.flarePulse * 0.25;
        this.ringMesh.scale.set(diskScale, diskScale, 1.0);
      }
      if (this.jetsGroup) {
        this.jetsGroup.rotation.y += delta * 0.8;
      }
    } else if (this.currentType === 'pulsar') {
      if (this.jetsGroup) {
        // Rapid 30Hz simulation (spin beam sweeps)
        this.jetsGroup.rotation.z += delta * (6.0 + this.flarePulse * 12.0);
        this.jetsGroup.rotation.y += delta * 2.0;
      }
      if (this.ringsGroup) {
        this.ringsGroup.rotation.x += delta * 0.3;
        this.ringsGroup.rotation.y += delta * 0.4;
      }
      if (this.innerCore) {
        const pulse = 1.0 + Math.sin(elapsed * 18) * 0.08 + this.flarePulse * 0.4;
        this.innerCore.scale.set(pulse, pulse, pulse);
      }
    } else if (this.currentType === 'dysonsphere') {
      if (this.ringsGroup) {
        this.ringsGroup.children.forEach((ringGroup, idx) => {
          const speed = (idx + 1) * 0.35 + this.flarePulse * 1.5;
          ringGroup.rotation.z += delta * speed;
        });
      }
      if (this.innerCore) {
        const sunScale = 1.0 + Math.sin(elapsed * 3) * 0.04 + this.flarePulse * 0.3;
        this.innerCore.scale.set(sunScale, sunScale, sunScale);
      }
    }
  }

  public dispose() {
    while (this.activeIllustrationGroup.children.length > 0) {
      const child = this.activeIllustrationGroup.children[0];
      this.activeIllustrationGroup.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
  }
}
