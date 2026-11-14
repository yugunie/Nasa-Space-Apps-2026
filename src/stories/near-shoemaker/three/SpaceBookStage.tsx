import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from '../audio/soundEngine';
import { STORY_PAGES } from '../story/storyData';
import { createBookShell, createEarth, type BookShellRig } from './models';
import { buildStoryDiorama, type ActiveDiorama } from './scenes';
import {
  createAsteroidTexture,
  createGlowSpriteTexture,
  createPopupTextTexture,
  createSpreadPageTexture,
} from './textures';

// Pre-allocated math helpers outside render loop (zero GC)
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _targetCamPos = new THREE.Vector3(0, 4.3, 8.6);
const _targetLookAt = new THREE.Vector3(0, 0.55, -0.2);

export interface SpaceBookStageProps {
  pageIndex: number;
  actionPulseId: number;
  resetViewId: number;
  onOpenBook: () => void;
  onCloseBook: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onInteractScene: () => void;
}

export function SpaceBookStage({
  pageIndex,
  actionPulseId,
  resetViewId,
  onOpenBook,
  onCloseBook,
  onPrevPage,
  onNextPage,
  onInteractScene,
}: SpaceBookStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Refs so React prop changes never recreate the WebGL canvas
  const desiredPageRef = useRef(pageIndex);
  const onOpenBookRef = useRef(onOpenBook);
  const onCloseBookRef = useRef(onCloseBook);
  const onPrevPageRef = useRef(onPrevPage);
  const onNextPageRef = useRef(onNextPage);
  const onInteractSceneRef = useRef(onInteractScene);
  const actionBoostRef = useRef(0);
  const camResetActiveRef = useRef(false);

  useEffect(() => {
    desiredPageRef.current = pageIndex;
  }, [pageIndex]);

  useEffect(() => {
    onOpenBookRef.current = onOpenBook;
  }, [onOpenBook]);

  useEffect(() => {
    onCloseBookRef.current = onCloseBook;
  }, [onCloseBook]);

  useEffect(() => {
    onPrevPageRef.current = onPrevPage;
  }, [onPrevPage]);

  useEffect(() => {
    onNextPageRef.current = onNextPage;
  }, [onNextPage]);

  useEffect(() => {
    onInteractSceneRef.current = onInteractScene;
  }, [onInteractScene]);

  useEffect(() => {
    if (actionPulseId > 0) {
      actionBoostRef.current = 1.0;
    }
  }, [actionPulseId]);

  useEffect(() => {
    if (resetViewId > 0) {
      camResetActiveRef.current = true;
    }
  }, [resetViewId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL probe (cost scaling only — identical scene & UI)
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 2. Scene, Fog & Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#040611');
    scene.fog = new THREE.FogExp2('#040611', 0.012);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(0, 4.1, 9.8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.75, -0.2);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 6.5;
    controls.maxDistance = 18.0;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = 1.52;
    controls.minAzimuthAngle = -Math.PI * 0.75;
    controls.maxAzimuthAngle = Math.PI * 0.75;

    controls.addEventListener('start', () => {
      camResetActiveRef.current = false;
    });

    // 4. Three-Point Cosmic Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x94b8e8, 0x0e142e, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.55);
    keyLight.position.set(5.5, 9.5, 6.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 26;
    const d = 6.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
    rimLight.position.set(-6, 4.5, -7);
    scene.add(rimLight);

    // 5. Instanced Starfield & Distant Nebula Sprites
    const starCount = 520;
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starsMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const starPalette = [0xffffff, 0xffe066, 0x93c5fd, 0xfbcfe8, 0xa7f3d0];

    for (let i = 0; i < starCount; i++) {
      // Distribute in outer sphere shell, keeping center clear
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 20 + Math.random() * 36;
      _dummy.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
      const s = 0.45 + Math.random() * 1.45;
      _dummy.scale.setScalar(s);
      _dummy.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      _dummy.updateMatrix();
      starsMesh.setMatrixAt(i, _dummy.matrix);
      _color.setHex(starPalette[i % starPalette.length]);
      starsMesh.setColorAt(i, _color);
    }
    starsMesh.instanceMatrix.needsUpdate = true;
    if (starsMesh.instanceColor) starsMesh.instanceColor.needsUpdate = true;
    starsMesh.computeBoundingSphere();
    scene.add(starsMesh);

    // Subtle far side nebula accents (deep luxury indigo/plum, kept clear of center text)
    const glowTex = createGlowSpriteTexture();
    const nebulaLeft = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0x162c6e,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    nebulaLeft.position.set(-14, 3, -22);
    nebulaLeft.scale.set(22, 16, 1);
    scene.add(nebulaLeft);

    const nebulaRight = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0x3f1f6e,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
    );
    nebulaRight.position.set(16, -1, -18);
    nebulaRight.scale.set(20, 15, 1);
    scene.add(nebulaRight);

    // Side & front-flank nebulae so side-angle views feel rich and cosmic too
    const nebulaSideLeft = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0x0e4366,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    );
    nebulaSideLeft.position.set(-22, 1, 5);
    nebulaSideLeft.scale.set(20, 16, 1);
    scene.add(nebulaSideLeft);

    const nebulaSideRight = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0x5c1d45,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
    );
    nebulaSideRight.position.set(22, 2, 6);
    nebulaSideRight.scale.set(19, 15, 1);
    scene.add(nebulaSideRight);

    // 5b. Surrounding Cosmic Environment (Earth + Moon, Ringed Planet, & 2 Asteroids)
    const backstageGroup = new THREE.Group();
    scene.add(backstageGroup);

    // Floating Earth with orbiting Moon on the left cosmic flank (visible front & side)
    const bgEarth = createEarth(maxAnisotropy);
    bgEarth.position.set(-11.2, 2.8, -6.2);
    bgEarth.scale.setScalar(2.15);
    const bgEarthStand = bgEarth.children[bgEarth.children.length - 1];
    if (bgEarthStand) bgEarth.remove(bgEarthStand);
    backstageGroup.add(bgEarth);

    const bgMoon = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.92, metalness: 0.02 }),
    );
    backstageGroup.add(bgMoon);

    // Floating Ringed Planet on the right cosmic flank (visible front & side)
    const ringedPlanet = new THREE.Group();
    ringedPlanet.position.set(11.6, 2.9, -4.5);
    ringedPlanet.rotation.set(0.28, 0, -0.32);
    const gasBody = new THREE.Mesh(
      new THREE.SphereGeometry(1.38, 28, 28),
      new THREE.MeshStandardMaterial({
        color: 0x4b568c,
        roughness: 0.78,
        metalness: 0.06,
        envMapIntensity: 0.25,
      }),
    );
    const planetRing = new THREE.Mesh(
      new THREE.RingGeometry(1.85, 2.7, 48),
      new THREE.MeshStandardMaterial({
        color: 0xcab082,
        transparent: true,
        opacity: 0.58,
        roughness: 0.85,
        side: THREE.DoubleSide,
      }),
    );
    planetRing.rotation.x = Math.PI / 2;
    ringedPlanet.add(gasBody, planetRing);
    backstageGroup.add(ringedPlanet);

    // Just 2 sculpted floating asteroids positioned on left & right flanks for side views
    const bgAsteroidTex = createAsteroidTexture('#7A7385', '#504A59', maxAnisotropy);
    const bgAsteroidGeo = new THREE.IcosahedronGeometry(0.75, 1);
    const bgPos = bgAsteroidGeo.attributes.position;
    for (let i = 0; i < bgPos.count; i++) {
      const vx = bgPos.getX(i);
      const vy = bgPos.getY(i);
      const vz = bgPos.getZ(i);
      const lump = 1 + 0.16 * Math.sin(vx * 5 + vy * 3) + 0.1 * Math.cos(vz * 4);
      bgPos.setXYZ(i, vx * 1.2 * lump, vy * 0.85 * lump, vz * lump);
    }
    bgAsteroidGeo.computeVertexNormals();

    const bgAsteroidMat = new THREE.MeshStandardMaterial({
      map: bgAsteroidTex,
      roughness: 0.94,
      metalness: 0.04,
      envMapIntensity: 0.2,
      flatShading: true,
    });

    interface BgAsteroidMeta {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedX: number;
      speedY: number;
      floatPhase: number;
    }
    const bgAsteroids: BgAsteroidMeta[] = [];
    const asteroidPlacements: [number, number, number, number][] = [
      [-9.0, -1.2, 4.6, 0.95],
      [9.4, 0.8, 4.8, 1.05],
    ];

    asteroidPlacements.forEach(([ax, ay, az, ascale], idx) => {
      const rock = new THREE.Mesh(bgAsteroidGeo, bgAsteroidMat);
      rock.position.set(ax, ay, az);
      rock.scale.setScalar(ascale);
      rock.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4);
      backstageGroup.add(rock);
      bgAsteroids.push({
        mesh: rock,
        baseX: ax,
        baseY: ay,
        baseZ: az,
        speedX: 0.16 + idx * 0.06,
        speedY: 0.22 + idx * 0.05,
        floatPhase: idx * 1.8,
      });
    });

    // 6. Floating 3D Book Assembly
    const floatGroup = new THREE.Group();
    scene.add(floatGroup);

    const bookRig: BookShellRig = createBookShell(maxAnisotropy);
    floatGroup.add(bookRig.root);

    // Diorama mount point on top of the open book surface
    const dioramaAnchor = new THREE.Group();
    dioramaAnchor.position.set(0, 0.24, 0.35);
    bookRig.root.add(dioramaAnchor);

    // State for animated page transitions & 90° pop-up fold
    let activePageIdx = desiredPageRef.current;
    let activeDiorama: ActiveDiorama | null = null;
    let flipProgress = 1; // 1 = settled
    let flipDirection: 1 | -1 = 1;
    let pendingPageIdx: number | null = null;
    let popupFoldAmount = activePageIdx === 0 ? 0 : 1; // 0 = folded flat, 1 = upright 90°!

    const applyPageContent = (idx: number) => {
      const page = STORY_PAGES[idx] ?? STORY_PAGES[0];
      if (activeDiorama) {
        dioramaAnchor.remove(activeDiorama.group);
        activeDiorama.dispose();
        activeDiorama = null;
      }

      if (idx > 0) {
        const leftTex = createSpreadPageTexture('left', page, maxAnisotropy);
        const rightTex = createSpreadPageTexture('right', page, maxAnisotropy);
        bookRig.setPageTextures(leftTex, rightTex);

        const popupTex = createPopupTextTexture(page.popupLines, maxAnisotropy);
        bookRig.setPopupTextTexture(popupTex);
        bookRig.popupTextPivot.visible = true;

        activeDiorama = buildStoryDiorama(page.sceneId, maxAnisotropy);
        dioramaAnchor.add(activeDiorama.group);
      } else {
        bookRig.popupTextPivot.visible = false;
      }
    };

    applyPageContent(activePageIdx);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. Interactive Click / Tap Raycasting (Open/Close, Flip Pages, Scene Actions)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (dx * dx + dy * dy > 36) return; // Ignore orbit drags
      if (pendingPageIdx !== null || desiredPageRef.current !== activePageIdx) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      if (activePageIdx === 0) {
        const hits = raycaster.intersectObject(bookRig.frontCoverPivot, true);
        if (hits.length > 0) {
          onOpenBookRef.current();
        }
        return;
      }

      const sceneHits = activeDiorama
        ? raycaster.intersectObject(dioramaAnchor, true)
        : [];
      if (sceneHits.length > 0) {
        actionBoostRef.current = 1.0;
        soundEngine.playInteractionPop();
        onInteractSceneRef.current();
        return;
      }

      const pageHit = raycaster.intersectObjects(
        [bookRig.leftPageMesh, bookRig.rightPageMesh],
        false,
      )[0];
      if (pageHit?.object === bookRig.leftPageMesh) {
        if (activePageIdx === 1) {
          onCloseBookRef.current();
        } else {
          onPrevPageRef.current();
        }
      } else if (pageHit?.object === bookRig.rightPageMesh) {
        if (activePageIdx === STORY_PAGES.length - 1) {
          onCloseBookRef.current();
        } else {
          onNextPageRef.current();
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Hover cursor feedback (throttled)
    let lastHoverCheck = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 60) return;
      lastHoverCheck = now;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const targets =
        activePageIdx === 0
          ? [bookRig.frontCoverPivot]
          : [dioramaAnchor, bookRig.leftPageMesh, bookRig.rightPageMesh];
      const hits = raycaster.intersectObjects(targets, true);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // 8. Resize handling
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Animation & Software-WebGL Pacing Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Check for requested page transition
      const desired = desiredPageRef.current;
      if (desired !== activePageIdx && pendingPageIdx === null) {
        if (activePageIdx === 0 || desired === 0) {
          // Opening from cover or closing back to cover
          activePageIdx = desired;
          applyPageContent(activePageIdx);
          popupFoldAmount = 0;
          camResetActiveRef.current = true;
        } else {
          // Flipping between open pages!
          flipDirection = desired > activePageIdx ? 1 : -1;
          const currentPage = STORY_PAGES[activePageIdx] ?? STORY_PAGES[0];
          bookRig.setFlippingPageTexture(
            createSpreadPageTexture(
              flipDirection === 1 ? 'right' : 'left',
              currentPage,
              maxAnisotropy,
            ),
          );
          pendingPageIdx = desired;
          flipProgress = 0;
          bookRig.flippingPageGroup.visible = true;
        }
      }

      // Advance page-flip curl animation
      if (pendingPageIdx !== null) {
        flipProgress = Math.min(1, flipProgress + delta * 1.9);
        bookRig.updateFlipCurl(flipProgress, flipDirection);

        // Swap scene & 90° pop-up text cleanly at midpoint of page turn
        if (flipProgress >= 0.48 && activePageIdx !== pendingPageIdx) {
          activePageIdx = pendingPageIdx;
          applyPageContent(activePageIdx);
          popupFoldAmount = 0;
        }
        if (flipProgress >= 1) {
          pendingPageIdx = null;
          bookRig.flippingPageGroup.visible = false;
          bookRig.setFlippingPageTexture(null);
        }
      }

      // Smoothly damp book pose: upright/tilted when closed cover, lying open when reading!
      const isClosed = activePageIdx === 0;
      const targetCoverAngle = isClosed ? 0 : Math.PI;
      const targetBookX = isClosed ? -2.35 : 0;
      const targetBookRotX = isClosed ? 1.08 : 0.42;

      bookRig.frontCoverPivot.rotation.z = THREE.MathUtils.damp(
        bookRig.frontCoverPivot.rotation.z,
        targetCoverAngle,
        7.5,
        delta,
      );
      bookRig.root.position.x = THREE.MathUtils.damp(
        bookRig.root.position.x,
        targetBookX,
        6.5,
        delta,
      );
      bookRig.root.rotation.x = THREE.MathUtils.damp(
        bookRig.root.rotation.x,
        targetBookRotX,
        6.5,
        delta,
      );

      // Gentle space-float bobbing
      floatGroup.position.y = Math.sin(elapsed * 0.9) * 0.1;
      floatGroup.rotation.z = Math.sin(elapsed * 0.55) * 0.018;

      // 90-Degree Pop-Up Spring Fold (folds flat -PI/2 during flip, stands crisp 90° = 0 when open!)
      const targetFold = isClosed || pendingPageIdx !== null ? 0 : 1;
      popupFoldAmount = THREE.MathUtils.damp(popupFoldAmount, targetFold, 8.5, delta);

      // Pop-up text stands perpendicular (90 deg to horizontal book page!)
      bookRig.popupTextPivot.rotation.x = THREE.MathUtils.lerp(-Math.PI / 2, 0, popupFoldAmount);
      bookRig.popupTextPivot.scale.setScalar(Math.max(0.001, popupFoldAmount));

      // Pop-up 3D diorama springs up from the page surface too
      dioramaAnchor.scale.y = Math.max(0.001, popupFoldAmount);
      dioramaAnchor.scale.x = 0.85 + 0.15 * popupFoldAmount;
      dioramaAnchor.scale.z = 0.85 + 0.15 * popupFoldAmount;

      // Decay interactive action boost
      actionBoostRef.current = THREE.MathUtils.damp(actionBoostRef.current, 0, 4.2, delta);

      if (activeDiorama) {
        activeDiorama.update(elapsed, delta, actionBoostRef.current);
      }

      // Slowly drift cosmos starfield & backstage planets/asteroids
      starsMesh.rotation.y = elapsed * 0.018;
      starsMesh.rotation.x = Math.sin(elapsed * 0.01) * 0.04;

      bgEarth.rotation.y = elapsed * 0.12;
      bgEarth.position.y = 2.8 + Math.sin(elapsed * 0.45) * 0.18;
      bgMoon.position.set(
        bgEarth.position.x + Math.cos(elapsed * 0.35) * 2.8,
        bgEarth.position.y + 1.3 + Math.sin(elapsed * 0.35) * 0.5,
        bgEarth.position.z + Math.sin(elapsed * 0.35) * 2.2,
      );

      ringedPlanet.rotation.y = elapsed * 0.16;
      ringedPlanet.position.y = 2.9 + Math.cos(elapsed * 0.4) * 0.16;

      for (let i = 0; i < bgAsteroids.length; i++) {
        const a = bgAsteroids[i];
        a.mesh.rotation.x += delta * a.speedX;
        a.mesh.rotation.y += delta * a.speedY;
        a.mesh.position.y = a.baseY + Math.sin(elapsed * 0.55 + a.floatPhase) * 0.24;
      }

      // Smooth scripted camera reset if requested
      if (camResetActiveRef.current) {
        _targetCamPos.set(0, isClosed ? 3.1 : 4.7, isClosed ? 9.6 : 10.6);
        _targetLookAt.set(0, isClosed ? 0.15 : 0.95, -0.25);
        camera.position.lerp(_targetCamPos, 1 - Math.exp(-5.5 * delta));
        controls.target.lerp(_targetLookAt, 1 - Math.exp(-5.5 * delta));
        if (camera.position.distanceTo(_targetCamPos) < 0.04) {
          camResetActiveRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      if (activeDiorama) activeDiorama.dispose();
      bookRig.setFlippingPageTexture(null);
      envTex.dispose();
      glowTex.dispose();
      bgAsteroidTex.dispose();
      bgAsteroidGeo.dispose();
      bgAsteroidMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06091a]/95 text-center p-6 z-30">
          <div className="max-w-md space-y-2">
            <h2 className="font-story text-2xl font-bold text-[#FFE066]">
              Restoring Space View...
            </h2>
            <p className="text-sm text-slate-200">
              Your 3D cosmic storybook is reconnecting to graphics memory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
