import * as THREE from 'three';
import gsap from 'gsap';
import { CHAPTERS } from '../data/chapters';
import {
  createCoverTexture,
  createSpineTexture,
  createGildedEdgeTexture,
  createLeftPageTexture,
  createRightPageTexture,
} from './proceduralTextures';
import { InteractiveIllustrationManager } from './InteractiveIllustration';
import { soundEngine } from '../audio/soundEngine';

/**
 * 3D Story Book Model & Controller
 * Manages procedural 3D book construction, GSAP page turns, interactive illustrations,
 * and raycasting click detection for cover and storyline triggers.
 */

export class BookModel {
  public group: THREE.Group;
  public illustrationManager: InteractiveIllustrationManager;

  // State
  public isOpen: boolean = false;
  public currentSpreadIndex: number = 0; // 0 to CHAPTERS.length - 1
  public isAnimating: boolean = false;

  // Sub-components
  private frontCoverPivot: THREE.Group;
  private backCoverGroup: THREE.Group;
  private spineMesh: THREE.Mesh;
  private leftPageBlock: THREE.Mesh;
  private rightPageBlock: THREE.Mesh;
  private turningPagePivot: THREE.Group;
  private turningPageMesh: THREE.Mesh;
  private contactShadowPlane: THREE.Mesh;

  // Dynamic Page Surfaces
  private leftPageSurface: THREE.Mesh;
  private rightPageSurface: THREE.Mesh;
  private leftPageMaterial: THREE.MeshStandardMaterial;
  private rightPageMaterial: THREE.MeshStandardMaterial;

  // Turning page materials
  private turningFrontMaterial: THREE.MeshStandardMaterial;
  private turningBackMaterial: THREE.MeshStandardMaterial;

  // Subtle page shadow overlay
  private spineShadowMesh: THREE.Mesh;

  // Clickable collision meshes
  public frontCoverCollider: THREE.Mesh;
  public leftStorylineCollider: THREE.Mesh;
  public rightIllustrationCollider: THREE.Mesh;
  public rightStorylineCollider: THREE.Mesh;

  // Book dimensions
  private readonly PAGE_W = 3.2;
  private readonly PAGE_H = 4.4;
  private readonly BOOK_THICKNESS = 0.42;

  // Callbacks
  public onStorylineClick?: (chapterIndex: number) => void;
  public onSpreadChange?: (chapterIndex: number) => void;
  public onBookStateChange?: (isOpen: boolean) => void;

  constructor() {
    this.group = new THREE.Group();
    this.illustrationManager = new InteractiveIllustrationManager();

    // 1. Spine (rounded half cylinder at origin x = 0)
    const spineGeo = new THREE.CylinderGeometry(
      this.BOOK_THICKNESS / 2,
      this.BOOK_THICKNESS / 2,
      this.PAGE_H + 0.15,
      24,
      1,
      false,
      Math.PI / 2,
      Math.PI
    );
    const spineMat = new THREE.MeshStandardMaterial({
      map: createSpineTexture(),
      roughness: 0.35,
      metalness: 0.25,
    });
    this.spineMesh = new THREE.Mesh(spineGeo, spineMat);
    this.spineMesh.rotation.y = Math.PI / 2;
    this.spineMesh.position.set(0, 0, 0);
    this.group.add(this.spineMesh);

    // 2. Back Cover (stays on right / bottom when closed)
    this.backCoverGroup = new THREE.Group();
    const backCoverGeo = new THREE.BoxGeometry(this.PAGE_W + 0.1, this.PAGE_H + 0.15, 0.05);
    const backCoverMat = new THREE.MeshStandardMaterial({
      map: createCoverTexture(false),
      roughness: 0.4,
      metalness: 0.2,
    });
    const backCoverMesh = new THREE.Mesh(backCoverGeo, backCoverMat);
    backCoverMesh.position.set((this.PAGE_W + 0.1) / 2, 0, -this.BOOK_THICKNESS / 2);
    this.backCoverGroup.add(backCoverMesh);
    this.group.add(this.backCoverGroup);

    // 3. Front Cover Pivot (pivots around spine at x = 0, y = 0)
    this.frontCoverPivot = new THREE.Group();
    this.frontCoverPivot.position.set(0, 0, this.BOOK_THICKNESS / 2);

    const frontCoverGeo = new THREE.BoxGeometry(this.PAGE_W + 0.1, this.PAGE_H + 0.15, 0.05);
    const frontCoverMat = new THREE.MeshStandardMaterial({
      map: createCoverTexture(true),
      roughness: 0.3,
      metalness: 0.35,
    });
    const frontCoverMesh = new THREE.Mesh(frontCoverGeo, frontCoverMat);
    frontCoverMesh.position.set((this.PAGE_W + 0.1) / 2, 0, 0);
    this.frontCoverPivot.add(frontCoverMesh);

    // Ornate gold metal corners on front cover (4 corners)
    this.createGoldCorners(this.frontCoverPivot, this.PAGE_W + 0.1, this.PAGE_H + 0.15);

    // Front Cover invisible collider for raycasting
    const frontColliderGeo = new THREE.BoxGeometry(this.PAGE_W + 0.2, this.PAGE_H + 0.2, 0.2);
    const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
    this.frontCoverCollider = new THREE.Mesh(frontColliderGeo, colliderMat);
    this.frontCoverCollider.position.copy(frontCoverMesh.position);
    this.frontCoverCollider.name = 'frontCoverCollider';
    this.frontCoverPivot.add(this.frontCoverCollider);

    this.group.add(this.frontCoverPivot);

    // 4. Page Blocks (Left & Right) with gilded edges
    const pageBlockGeo = new THREE.BoxGeometry(this.PAGE_W, this.PAGE_H, this.BOOK_THICKNESS * 0.85);
    const gildedEdgeMat = new THREE.MeshStandardMaterial({
      map: createGildedEdgeTexture(),
      metalness: 0.85,
      roughness: 0.2,
    });
    const paperCoreMat = new THREE.MeshStandardMaterial({
      color: 0x090d18,
      roughness: 0.8,
    });
    // Multi-material for page block sides
    const pageBlockMaterials = [
      gildedEdgeMat, // right (+x)
      paperCoreMat,  // left (-x spine)
      gildedEdgeMat, // top (+y)
      gildedEdgeMat, // bottom (-y)
      paperCoreMat,  // front (+z)
      paperCoreMat,  // back (-z)
    ];

    // Right Page Block
    this.rightPageBlock = new THREE.Mesh(pageBlockGeo, pageBlockMaterials);
    this.rightPageBlock.position.set(this.PAGE_W / 2, 0, 0);
    this.group.add(this.rightPageBlock);

    // Left Page Block (visible once opened)
    this.leftPageBlock = new THREE.Mesh(pageBlockGeo, pageBlockMaterials);
    this.leftPageBlock.position.set(-this.PAGE_W / 2, 0, 0);
    this.leftPageBlock.visible = false;
    this.group.add(this.leftPageBlock);

    // 5. Active Left & Right Page Display Surfaces
    const pageSurfaceGeo = new THREE.PlaneGeometry(this.PAGE_W, this.PAGE_H);

    this.leftPageMaterial = new THREE.MeshStandardMaterial({
      map: createLeftPageTexture(CHAPTERS[0]),
      roughness: 0.6,
      metalness: 0.1,
    });
    this.leftPageSurface = new THREE.Mesh(pageSurfaceGeo, this.leftPageMaterial);
    this.leftPageSurface.position.set(-this.PAGE_W / 2, 0, this.BOOK_THICKNESS * 0.43);
    this.leftPageSurface.visible = false;
    this.group.add(this.leftPageSurface);

    this.rightPageMaterial = new THREE.MeshStandardMaterial({
      map: createRightPageTexture(CHAPTERS[0]),
      roughness: 0.6,
      metalness: 0.1,
    });
    this.rightPageSurface = new THREE.Mesh(pageSurfaceGeo, this.rightPageMaterial);
    this.rightPageSurface.position.set(this.PAGE_W / 2, 0, this.BOOK_THICKNESS * 0.43);
    this.rightPageSurface.visible = false;
    this.group.add(this.rightPageSurface);

    // 6. Interactive 3D Illustration positioned above right page viewport
    this.illustrationManager.group.position.set(
      this.PAGE_W / 2,
      0.35, // aligns with circular frame
      this.BOOK_THICKNESS * 0.43 + 0.15
    );
    this.illustrationManager.group.scale.set(0.72, 0.72, 0.72);
    this.illustrationManager.setIllustration(CHAPTERS[0].rightPageIllustration);
    this.illustrationManager.group.visible = false;
    this.group.add(this.illustrationManager.group);

    // 7. Turning Page Leaf (used during GSAP page turn)
    this.turningPagePivot = new THREE.Group();
    this.turningPagePivot.position.set(0, 0, this.BOOK_THICKNESS * 0.44);

    // Plane geometry with horizontal segments for curvature flex
    const turningGeo = new THREE.PlaneGeometry(this.PAGE_W, this.PAGE_H, 20, 1);
    this.turningFrontMaterial = new THREE.MeshStandardMaterial({
      map: this.rightPageMaterial.map,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.FrontSide,
    });
    this.turningBackMaterial = new THREE.MeshStandardMaterial({
      map: this.leftPageMaterial.map,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.BackSide,
    });

    // We make a double-sided thin page group
    const turningPageFront = new THREE.Mesh(turningGeo, this.turningFrontMaterial);
    turningPageFront.position.set(this.PAGE_W / 2, 0, 0.002);
    const turningPageBack = new THREE.Mesh(turningGeo, this.turningBackMaterial);
    turningPageBack.position.set(this.PAGE_W / 2, 0, -0.002);
    turningPageBack.rotation.y = Math.PI;

    this.turningPageMesh = turningPageFront;
    this.turningPagePivot.add(turningPageFront);
    this.turningPagePivot.add(turningPageBack);
    this.turningPagePivot.visible = false;
    this.group.add(this.turningPagePivot);

    // 8. Spine Crease Shadow Overlay
    const shadowGeo = new THREE.PlaneGeometry(0.8, this.PAGE_H);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 16;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createLinearGradient(0, 0, 256, 0);
    sGrad.addColorStop(0, 'rgba(0,0,0,0)');
    sGrad.addColorStop(0.5, 'rgba(0,0,0,0.75)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 16);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this.spineShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.spineShadowMesh.position.set(0, 0, this.BOOK_THICKNESS * 0.44);
    this.spineShadowMesh.visible = false;
    this.group.add(this.spineShadowMesh);

    // 9. Contact Grounding Shadow Plane underneath the book
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 512;
    contactCanvas.height = 512;
    const cCtx = contactCanvas.getContext('2d')!;
    const cGrad = cCtx.createRadialGradient(256, 256, 40, 256, 256, 250);
    cGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    cGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
    cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cCtx.fillStyle = cGrad;
    cCtx.fillRect(0, 0, 512, 512);

    const contactTex = new THREE.CanvasTexture(contactCanvas);
    contactTex.colorSpace = THREE.SRGBColorSpace;
    const contactGeo = new THREE.PlaneGeometry(9.0, 7.5);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    this.contactShadowPlane = new THREE.Mesh(contactGeo, contactMat);
    this.contactShadowPlane.position.set(0, -this.PAGE_H * 0.5 - 0.25, 0);
    this.contactShadowPlane.rotation.x = -Math.PI / 2;
    this.group.add(this.contactShadowPlane);

    // 10. Clickable Raycast Colliders for Page Features
    // Left Storyline button collider
    const leftColliderGeo = new THREE.BoxGeometry(2.4, 1.2, 0.1);
    this.leftStorylineCollider = new THREE.Mesh(leftColliderGeo, colliderMat);
    this.leftStorylineCollider.position.set(-this.PAGE_W / 2, -1.0, this.BOOK_THICKNESS * 0.45);
    this.leftStorylineCollider.name = 'leftStorylineCollider';
    this.group.add(this.leftStorylineCollider);

    // Right Illustration collider (circle radius ~ 1.1)
    const rightIllColliderGeo = new THREE.BoxGeometry(2.2, 2.2, 0.2);
    this.rightIllustrationCollider = new THREE.Mesh(rightIllColliderGeo, colliderMat);
    this.rightIllustrationCollider.position.set(this.PAGE_W / 2, 0.35, this.BOOK_THICKNESS * 0.45);
    this.rightIllustrationCollider.name = 'rightIllustrationCollider';
    this.group.add(this.rightIllustrationCollider);

    // Right Storyline quick button collider
    const rightStoryColliderGeo = new THREE.BoxGeometry(2.4, 0.6, 0.1);
    this.rightStorylineCollider = new THREE.Mesh(rightStoryColliderGeo, colliderMat);
    this.rightStorylineCollider.position.set(this.PAGE_W / 2, -1.5, this.BOOK_THICKNESS * 0.45);
    this.rightStorylineCollider.name = 'rightStorylineCollider';
    this.group.add(this.rightStorylineCollider);

    // Initial position of closed book
    this.group.rotation.x = 0.25;
    this.group.rotation.y = -0.3;
    this.group.position.set(-0.6, 0, 0);
  }

  private createGoldCorners(parent: THREE.Group, width: number, height: number) {
    const cornerMat = new THREE.MeshStandardMaterial({
      color: 0xdfb76c,
      metalness: 0.9,
      roughness: 0.15,
    });
    const cornerSize = 0.28;
    const cornerGeo = new THREE.BoxGeometry(cornerSize, cornerSize, 0.06);

    const positions = [
      [width - cornerSize / 2, height / 2 - cornerSize / 2],
      [width - cornerSize / 2, -height / 2 + cornerSize / 2],
      [cornerSize / 2, height / 2 - cornerSize / 2],
      [cornerSize / 2, -height / 2 + cornerSize / 2],
    ];

    positions.forEach(([x, y]) => {
      const corner = new THREE.Mesh(cornerGeo, cornerMat);
      corner.position.set(x, y, 0.01);
      parent.add(corner);
    });
  }

  /**
   * GSAP animation to open the 3D book smoothly
   */
  public openBook(onComplete?: () => void) {
    if (this.isOpen || this.isAnimating) return;
    this.isAnimating = true;

    soundEngine.playBookOpen();

    // Reveal left and right pages halfway through rotation
    const tl = gsap.timeline({
      onComplete: () => {
        this.isOpen = true;
        this.isAnimating = false;
        this.onBookStateChange?.(true);
        onComplete?.();
      },
    });

    // 1. Move book center and orientation into comfortable open reading angle
    tl.to(this.group.position, {
      x: 0,
      y: 0,
      z: 0.3,
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0);

    tl.to(this.group.rotation, {
      x: 0.42, // slightly tilted forward for reading
      y: 0,
      z: 0,
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0);

    // 2. Front cover swings open 180 degrees (-PI) around the spine
    tl.to(this.frontCoverPivot.rotation, {
      y: -Math.PI,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => {
        // When cover is open > 90 degrees, reveal inner pages and illustration
        if (this.frontCoverPivot.rotation.y < -Math.PI * 0.45) {
          this.leftPageBlock.visible = true;
          this.leftPageSurface.visible = true;
          this.rightPageSurface.visible = true;
          this.spineShadowMesh.visible = true;
          this.illustrationManager.group.visible = true;
        }
      },
    }, 0.1);

    // Dynamic contact shadow expands as book opens to dual spread
    tl.to(this.contactShadowPlane.scale, {
      x: 1.45,
      y: 1.1,
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0);
  }

  /**
   * GSAP animation to close the 3D book back to the cover
   */
  public closeBook(onComplete?: () => void) {
    if (!this.isOpen || this.isAnimating) return;
    this.isAnimating = true;

    soundEngine.playPageTurn();

    const tl = gsap.timeline({
      onComplete: () => {
        this.isOpen = false;
        this.isAnimating = false;
        this.leftPageBlock.visible = false;
        this.leftPageSurface.visible = false;
        this.rightPageSurface.visible = false;
        this.spineShadowMesh.visible = false;
        this.illustrationManager.group.visible = false;
        this.onBookStateChange?.(false);
        onComplete?.();
      },
    });

    // Hide active illustration early during close
    tl.to(this.illustrationManager.group.scale, {
      x: 0.01,
      y: 0.01,
      z: 0.01,
      duration: 0.3,
      onComplete: () => {
        this.illustrationManager.group.visible = false;
        this.illustrationManager.group.scale.set(0.72, 0.72, 0.72);
      },
    }, 0);

    // Swing front cover closed
    tl.to(this.frontCoverPivot.rotation, {
      y: 0,
      duration: 1.2,
      ease: 'power2.inOut',
    }, 0.1);

    // Restore closed book tilt
    tl.to(this.group.position, {
      x: -0.6,
      y: 0,
      z: 0,
      duration: 1.3,
      ease: 'power2.inOut',
    }, 0);

    tl.to(this.group.rotation, {
      x: 0.25,
      y: -0.3,
      z: 0,
      duration: 1.3,
      ease: 'power2.inOut',
    }, 0);

    tl.to(this.contactShadowPlane.scale, {
      x: 1.0,
      y: 1.0,
      duration: 1.3,
      ease: 'power2.inOut',
    }, 0);
  }

  /**
   * GSAP fluid page-turning transition
   */
  public turnPage(direction: 'next' | 'prev', onComplete?: () => void) {
    if (!this.isOpen || this.isAnimating) return;

    const targetIndex = direction === 'next' ? this.currentSpreadIndex + 1 : this.currentSpreadIndex - 1;
    if (targetIndex < 0 || targetIndex >= CHAPTERS.length) return;

    this.isAnimating = true;
    soundEngine.playPageTurn();

    const currentChapter = CHAPTERS[this.currentSpreadIndex];
    const targetChapter = CHAPTERS[targetIndex];

    // Set up turning page textures
    if (direction === 'next') {
      // Flipping from right to left (0 -> -PI)
      this.turningFrontMaterial.map = createRightPageTexture(currentChapter);
      this.turningBackMaterial.map = createLeftPageTexture(targetChapter);
      this.turningFrontMaterial.map.needsUpdate = true;
      this.turningBackMaterial.map.needsUpdate = true;

      // Prepare target right page underneath turning leaf
      this.rightPageMaterial.map = createRightPageTexture(targetChapter);
      this.rightPageMaterial.map.needsUpdate = true;

      // Start turning page at right side (rotation.y = 0)
      this.turningPagePivot.rotation.y = 0;
      this.turningPagePivot.visible = true;

      // Hide active illustration temporarily during flip
      this.illustrationManager.group.visible = false;

      const tl = gsap.timeline({
        onComplete: () => {
          this.currentSpreadIndex = targetIndex;
          this.leftPageMaterial.map = createLeftPageTexture(targetChapter);
          this.leftPageMaterial.map.needsUpdate = true;
          this.turningPagePivot.visible = false;
          this.turningPagePivot.rotation.y = 0;

          // Switch illustration to new chapter
          this.illustrationManager.setIllustration(targetChapter.rightPageIllustration);
          this.illustrationManager.group.visible = true;

          this.isAnimating = false;
          this.onSpreadChange?.(this.currentSpreadIndex);
          onComplete?.();
        },
      });

      // Page curvature and shadow pulse
      const spineShadowMat = this.spineShadowMesh.material as THREE.MeshBasicMaterial;

      tl.to(this.turningPagePivot.rotation, {
        y: -Math.PI,
        duration: 0.9,
        ease: 'power2.inOut',
      }, 0);

      // Shadow pulse as leaf passes zenith
      tl.to(spineShadowMat, {
        opacity: 0.95,
        duration: 0.45,
        ease: 'power1.out',
      }, 0);
      tl.to(spineShadowMat, {
        opacity: 0.8,
        duration: 0.45,
        ease: 'power1.in',
      }, 0.45);

    } else {
      // Flipping from left to right (-PI -> 0)
      this.turningFrontMaterial.map = createRightPageTexture(targetChapter);
      this.turningBackMaterial.map = createLeftPageTexture(currentChapter);
      this.turningFrontMaterial.map.needsUpdate = true;
      this.turningBackMaterial.map.needsUpdate = true;

      // Prepare target left page underneath
      this.leftPageMaterial.map = createLeftPageTexture(targetChapter);
      this.leftPageMaterial.map.needsUpdate = true;

      this.turningPagePivot.rotation.y = -Math.PI;
      this.turningPagePivot.visible = true;

      this.illustrationManager.group.visible = false;

      const tl = gsap.timeline({
        onComplete: () => {
          this.currentSpreadIndex = targetIndex;
          this.rightPageMaterial.map = createRightPageTexture(targetChapter);
          this.rightPageMaterial.map.needsUpdate = true;
          this.turningPagePivot.visible = false;
          this.turningPagePivot.rotation.y = 0;

          this.illustrationManager.setIllustration(targetChapter.rightPageIllustration);
          this.illustrationManager.group.visible = true;

          this.isAnimating = false;
          this.onSpreadChange?.(this.currentSpreadIndex);
          onComplete?.();
        },
      });

      tl.to(this.turningPagePivot.rotation, {
        y: 0,
        duration: 0.9,
        ease: 'power2.inOut',
      }, 0);
    }
  }

  /**
   * Jump directly to a specific chapter spread
   */
  public goToSpread(chapterIndex: number) {
    if (!this.isOpen || this.isAnimating) return;
    if (chapterIndex === this.currentSpreadIndex) return;

    if (chapterIndex > this.currentSpreadIndex) {
      this.turnPage('next');
    } else {
      this.turnPage('prev');
    }
  }

  public update(delta: number, elapsed: number) {
    // If book is closed, add gentle space float bobbing
    if (!this.isOpen && !this.isAnimating) {
      this.group.position.y = Math.sin(elapsed * 1.2) * 0.08;
      this.group.rotation.z = Math.sin(elapsed * 0.8) * 0.03;
    }

    // Update 3D interactive illustration
    if (this.isOpen && this.illustrationManager.group.visible) {
      this.illustrationManager.update(delta);
    }
  }

  public dispose() {
    this.illustrationManager.dispose();
  }
}
