import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BookModel } from './BookModel';
import { soundEngine } from '../audio/soundEngine';

// Pre-allocated math objects to avoid Garbage Collection inside tick loop
const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

export class SpaceScene {
  private container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public book: BookModel;

  private isSoftwareGl: boolean;
  private isDestroyed: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Starfield and particles
  private starfield: THREE.Points;
  private cosmicDust: THREE.Points;

  // Interaction handlers
  public onOpenStoryline?: (chapterIndex: number) => void;
  public onBookOpened?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect software WebGL guard
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020409);
    this.scene.fog = new THREE.FogExp2(0x020409, 0.022);

    this.camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0.5, 7.8);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting Rig (Warm Key, Cool Hemisphere, Cyan Rim)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x050814, 1.2);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !this.isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-6, -3, -4);
    this.scene.add(rimLight);

    // 6. Camera OrbitControls (smooth damping, respectful boundary)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 14;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.minPolarAngle = 0.3;

    // 7. Celestial Starfield & Cosmic Dust
    const { stars, dust } = this.createCosmicBackdrop();
    this.starfield = stars;
    this.cosmicDust = dust;
    this.scene.add(this.starfield);
    this.scene.add(this.cosmicDust);

    // 8. 3D Book Model
    this.book = new BookModel();
    this.scene.add(this.book.group);

    // Bind interaction events
    this.bindEvents();

    // Start loop
    this.startLoop();
  }

  private createCosmicBackdrop() {
    // 1. Starfield: 2,800 twinkling stars
    const starCount = 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xfef08a),
      new THREE.Color(0xc084fc),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 20 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const stars = new THREE.Points(starGeo, starMat);

    // 2. Cosmic dust clouds
    const dustCount = 600;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 22;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;

      dustColors[i * 3] = 0.2 + Math.random() * 0.2;
      dustColors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      dustColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);

    return { stars, dust };
  }

  private bindEvents() {
    const dom = this.renderer.domElement;

    // Resize handler
    window.addEventListener('resize', this.onResize);

    // Pointer move handler (for cursor hover state and interactive illustration parallax)
    dom.addEventListener('pointermove', this.onPointerMove);

    // Click handler (raycasting front cover and interactive storyline elements)
    dom.addEventListener('click', this.onClick);
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast hover targets
    _raycaster.setFromCamera(_mouse, this.camera);

    if (!this.book.isOpen) {
      // Check front cover
      const hits = _raycaster.intersectObject(this.book.frontCoverCollider);
      this.renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    } else {
      // Pass mouse offset to 3D interactive illustration
      this.book.illustrationManager.onPointerMove(_mouse.x, _mouse.y);

      // Check clickables on open book
      const clickables = [
        this.book.leftStorylineCollider,
        this.book.rightIllustrationCollider,
        this.book.rightStorylineCollider,
      ];
      const hits = _raycaster.intersectObjects(clickables);
      this.renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    }
  };

  private onClick = (event: MouseEvent) => {
    soundEngine.startAmbient(); // Satisfy browser autoplay on first user interaction

    const rect = this.renderer.domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);

    if (!this.book.isOpen) {
      // Click closed book to open it!
      const hits = _raycaster.intersectObject(this.book.frontCoverCollider);
      if (hits.length > 0) {
        this.book.openBook(() => {
          this.onBookOpened?.();
        });
      }
    } else {
      // Check left storyline card
      const leftHits = _raycaster.intersectObject(this.book.leftStorylineCollider);
      if (leftHits.length > 0) {
        soundEngine.playHoloOpen();
        this.onOpenStoryline?.(this.book.currentSpreadIndex);
        return;
      }

      // Check right storyline quick button
      const rightStoryHits = _raycaster.intersectObject(this.book.rightStorylineCollider);
      if (rightStoryHits.length > 0) {
        soundEngine.playHoloOpen();
        this.onOpenStoryline?.(this.book.currentSpreadIndex);
        return;
      }

      // Check right illustration click (triggers pulse & chime)
      const illHits = _raycaster.intersectObject(this.book.rightIllustrationCollider);
      if (illHits.length > 0) {
        soundEngine.playStarClick();
        this.book.illustrationManager.triggerClickEffect();
        return;
      }
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Slowly rotate starfield & cosmic dust
      this.starfield.rotation.y = elapsed * 0.015;
      this.cosmicDust.rotation.y = elapsed * 0.02;

      // Update controls & book kinematics
      this.controls.update();
      this.book.update(delta, elapsed);

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('click', this.onClick);

    this.controls.dispose();
    this.book.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
