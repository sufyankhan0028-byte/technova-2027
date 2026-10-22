import * as THREE from 'three';

/**
 * TECHNOVA 2027 — 3D RETRO ARCADE HERO EXPERIENCE
 * Procedurally generates 3D arcade models:
 * - 3D Pixel Ghost with cursor-tracking eyes
 * - 3D Golden Arcade Star (extruded bevel geometry)
 * - 3D Mushroom Power-Up with polka-dots
 * - 3D Floating Gold Coins (spinning arcade currency)
 * - 3D Mystery / Question Block
 * - 3D Neon Polyhedra
 * - 3D Particle Starfield
 */

export class RetroArcadeScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    this.interactiveObjects = [];
    this.clock = new THREE.Clock();

    // Sound callback (can be assigned externally)
    this.onObjectClick = null;

    this.init();
  }

  init() {
    // 1. SCENE SETUP
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070707, 0.04);

    // 2. CAMERA SETUP
    const width = this.canvas.parentElement.clientWidth;
    const height = this.canvas.parentElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 16);

    // 3. RENDERER SETUP
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 4. LIGHTING
    this.setupLighting();

    // 5. SPAWN 3D ARCADE OBJECTS
    this.createArcadeGhost();
    this.createGoldenStar();
    this.createPowerupMushroom();
    this.createGoldCoins();
    this.createMysteryBlock();
    this.createNeonPolyhedra();
    this.createStarfield();

    // 6. EVENT LISTENERS
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));

    // 7. START RENDER LOOP
    this.animate();
  }

  setupLighting() {
    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 1.5);
    this.scene.add(ambientLight);

    // Key directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 12, 10);
    this.scene.add(dirLight);

    // Neon Pink Point Light (Flanks Left)
    this.pinkLight = new THREE.PointLight(0xff007a, 4, 30);
    this.pinkLight.position.set(-8, 3, 4);
    this.scene.add(this.pinkLight);

    // Electric Yellow Point Light (Flanks Right)
    this.yellowLight = new THREE.PointLight(0xffc400, 4, 30);
    this.yellowLight.position.set(8, -2, 4);
    this.scene.add(this.yellowLight);

    // Electric Blue Rim Light (Center Bottom)
    const blueLight = new THREE.PointLight(0x38bdf8, 2.5, 25);
    blueLight.position.set(0, -6, 2);
    this.scene.add(blueLight);
  }

  // 1. 3D PIXEL GHOST (Pac-Man Inspired with animated eyes)
  createArcadeGhost() {
    const ghostGroup = new THREE.Group();

    // Body Material: Vibrant Neon Pink glossy sheen
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff007a,
      roughness: 0.25,
      metalness: 0.15,
      emissive: 0x440020,
      emissiveIntensity: 0.6
    });

    // Ghost Head (Half-Sphere)
    const headGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    headMesh.position.y = 0.5;
    ghostGroup.add(headMesh);

    // Ghost Torso (Cylinder)
    const torsoGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.0, 32, 1, true);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMaterial);
    torsoMesh.position.y = 0;
    ghostGroup.add(torsoMesh);

    // Ghost Bottom Ruffles (3 small inverted cones/spheres)
    for (let i = -1; i <= 1; i++) {
      const ruffleGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const ruffleMesh = new THREE.Mesh(ruffleGeo, bodyMaterial);
      ruffleMesh.position.set(i * 0.75, -0.5, 0);
      ghostGroup.add(ruffleMesh);
    }

    // Eyes Group
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.1, emissive: 0x1e40af });

    this.ghostPupils = [];

    [-0.42, 0.42].forEach(x => {
      // White eye
      const eyeGeo = new THREE.SphereGeometry(0.32, 24, 16);
      eyeGeo.scale(1, 1.25, 0.6);
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      eyeMesh.position.set(x, 0.45, 1.05);
      ghostGroup.add(eyeMesh);

      // Pupil
      const pupilGeo = new THREE.SphereGeometry(0.16, 16, 16);
      pupilGeo.scale(1, 1, 0.5);
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(x, 0.45, 1.25);
      ghostGroup.add(pupilMesh);
      this.ghostPupils.push({ mesh: pupilMesh, basePos: new THREE.Vector3(x, 0.45, 1.25) });
    });

    ghostGroup.position.set(-7.5, 2.5, -1);
    ghostGroup.scale.set(0.9, 0.9, 0.9);
    ghostGroup.rotation.y = 0.35;

    // Attach animation metadata
    ghostGroup.userData = {
      name: 'Arcade Ghost',
      baseY: 2.5,
      bobSpeed: 1.8,
      bobHeight: 0.4,
      oscillateY: true,
      baseRotY: 0.35,
      swaySpeed: 1.5,
      swayAngle: 0.22,
      isPopping: false
    };

    this.scene.add(ghostGroup);
    this.interactiveObjects.push(ghostGroup);
    this.ghost = ghostGroup;
  }

  // 2. 3D GOLDEN ARCADE STAR (Beveled 5-Point Star)
  createGoldenStar() {
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.3;
    const innerRadius = 0.6;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.12,
      bevelSegments: 4
    };

    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    starGeo.center();

    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffc400,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0x553300,
      emissiveIntensity: 0.5
    });

    const starMesh = new THREE.Mesh(starGeo, starMaterial);

    // Cute arcade eye slits on star
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x070707 });
    [-0.24, 0.24].forEach(x => {
      const eyeGeo = new THREE.CapsuleGeometry(0.06, 0.24, 4, 8);
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
      eyeMesh.position.set(x, 0.05, 0.38);
      starMesh.add(eyeMesh);
    });

    const starGroup = new THREE.Group();
    starGroup.add(starMesh);
    starGroup.position.set(7.5, 3.2, -0.5);
    starGroup.scale.set(0.9, 0.9, 0.9);

    starGroup.userData = {
      name: 'Golden Star',
      baseY: 3.2,
      bobSpeed: 2.2,
      bobHeight: 0.35,
      oscillateY: true,
      baseRotY: -0.28,
      swaySpeed: 1.8,
      swayAngle: 0.2,
      isPopping: false
    };

    this.scene.add(starGroup);
    this.interactiveObjects.push(starGroup);
    this.star = starGroup;
  }

  // 3. 3D POWER-UP MUSHROOM
  createPowerupMushroom() {
    const mushroomGroup = new THREE.Group();

    // Mushroom Cap
    const capGeo = new THREE.SphereGeometry(1.2, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0x440808,
      emissiveIntensity: 0.4
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.scale.set(1.2, 0.9, 1.2);
    capMesh.position.y = 0.4;
    mushroomGroup.add(capMesh);

    // 5 White Polka Dots on Cap
    const dotGeo = new THREE.SphereGeometry(0.32, 16, 16);
    dotGeo.scale(1, 0.4, 1);
    const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const dotPositions = [
      [0, 1.35, 0, 0, 0, 0], // Top
      [0.9, 0.7, 0.6, 0.6, 0.8, 0],
      [-0.9, 0.7, 0.6, 0.6, -0.8, 0],
      [0.9, 0.7, -0.6, -0.6, 0.8, 0],
      [-0.9, 0.7, -0.6, -0.6, -0.8, 0]
    ];

    dotPositions.forEach(([x, y, z, rx, ry, rz]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      dot.rotation.set(rx, ry, rz);
      mushroomGroup.add(dot);
    });

    // Mushroom Stem
    const stemGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.9, 24);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.4 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = -0.25;
    mushroomGroup.add(stemMesh);

    // Stem Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    [-0.25, 0.25].forEach(x => {
      const eyeGeo = new THREE.CapsuleGeometry(0.05, 0.22, 4, 8);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, -0.15, 0.78);
      mushroomGroup.add(eye);
    });

    mushroomGroup.position.set(-6.8, -2.8, 0);
    mushroomGroup.scale.set(0.85, 0.85, 0.85);
    mushroomGroup.rotation.y = 0.4;
    mushroomGroup.rotation.z = -0.1;

    mushroomGroup.userData = {
      name: 'Powerup Mushroom',
      baseY: -2.8,
      bobSpeed: 1.5,
      bobHeight: 0.3,
      oscillateY: true,
      baseRotY: 0.35,
      swaySpeed: 1.4,
      swayAngle: 0.18,
      isPopping: false
    };

    this.scene.add(mushroomGroup);
    this.interactiveObjects.push(mushroomGroup);
  }

  // 4. 3D FLOATING COINS
  createGoldCoins() {
    this.coins = [];
    const coinConfigs = [
      { pos: [-4.5, 4.2, -1], scale: 0.6, speed: 0.03 },
      { pos: [5.2, -3.2, 0.5], scale: 0.7, speed: 0.025 },
      { pos: [8.2, -1.2, -1.5], scale: 0.5, speed: 0.035 }
    ];

    const coinGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.16, 32);
    coinGeo.rotateX(Math.PI / 2);

    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffc400,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x664400,
      emissiveIntensity: 0.6
    });

    coinConfigs.forEach((cfg, idx) => {
      const coinGroup = new THREE.Group();
      const coinMesh = new THREE.Mesh(coinGeo, coinMat);
      coinGroup.add(coinMesh);

      // Inner coin rim / ring
      const rimGeo = new THREE.TorusGeometry(0.65, 0.05, 12, 32);
      const rimMesh = new THREE.Mesh(rimGeo, coinMat);
      rimMesh.position.z = 0.09;
      coinGroup.add(rimMesh);

      coinGroup.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      coinGroup.scale.set(cfg.scale, cfg.scale, cfg.scale);

      coinGroup.userData = {
        name: `Arcade Coin #${idx + 1}`,
        baseY: cfg.pos[1],
        bobSpeed: 2.0 + idx * 0.4,
        bobHeight: 0.25,
        rotSpeedY: cfg.speed,
        isPopping: false
      };

      this.scene.add(coinGroup);
      this.interactiveObjects.push(coinGroup);
      this.coins.push(coinGroup);
    });
  }

  // 5. 3D QUESTION BLOCK / MYSTERY BOX
  createMysteryBlock() {
    const blockGroup = new THREE.Group();

    // Box Geometry
    const boxGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x78350f,
      emissiveIntensity: 0.4
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    blockGroup.add(boxMesh);

    // Corner rivet bolts
    const boltGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });

    [-0.55, 0.55].forEach(x => {
      [-0.55, 0.55].forEach(y => {
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(x, y, 0.71);
        blockGroup.add(bolt);
      });
    });

    // Glowing '?' Question Mark on Front Face
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 64, 68);

    const qTexture = new THREE.CanvasTexture(canvas);
    const qMat = new THREE.MeshBasicMaterial({ map: qTexture });
    const qPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), qMat);
    qPlane.position.z = 0.71;
    blockGroup.add(qPlane);

    blockGroup.position.set(6.2, 0.2, 0);
    blockGroup.rotation.set(0.2, -0.4, 0.1);
    blockGroup.scale.set(0.85, 0.85, 0.85);

    blockGroup.userData = {
      name: 'Mystery Block',
      baseY: 0.2,
      bobSpeed: 1.6,
      bobHeight: 0.35,
      oscillateY: true,
      baseRotY: -0.38,
      swaySpeed: 1.2,
      swayAngle: 0.15,
      isPopping: false
    };

    this.scene.add(blockGroup);
    this.interactiveObjects.push(blockGroup);
  }

  // 6. 3D NEON POLYHEDRA (Futuristic arcade crystals)
  createNeonPolyhedra() {
    // Left Blue Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(0.7, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
      emissive: 0x0369a1,
      emissiveIntensity: 0.7
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);

    // Inner wireframe glow
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const wireMesh = new THREE.Mesh(icoGeo, wireMat);
    wireMesh.scale.set(1.05, 1.05, 1.05);
    icoMesh.add(wireMesh);

    const icoGroup = new THREE.Group();
    icoGroup.add(icoMesh);
    icoGroup.position.set(-8.2, -0.2, -1.2);

    icoGroup.userData = {
      name: 'Neon Crystal',
      baseY: -0.2,
      bobSpeed: 1.9,
      bobHeight: 0.3,
      rotSpeedY: 0.02,
      isPopping: false
    };

    this.scene.add(icoGroup);
    this.interactiveObjects.push(icoGroup);
  }

  // 7. 3D PARTICLE STARFIELD (Floating ambient cyber dust)
  createStarfield() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0xff007a), // Neon Pink
      new THREE.Color(0xffc400), // Electric Yellow
      new THREE.Color(0x38bdf8), // Electric Blue
      new THREE.Color(0xffffff)  // White
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  // EVENT HANDLERS
  onResize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const width = this.canvas.parentElement.clientWidth;
    const height = this.canvas.parentElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(e) {
    // Normalized device coordinates (-1 to +1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetMouse.set(x, y);

    // Update ghost pupil gaze toward cursor
    if (this.ghostPupils && this.ghost) {
      this.ghostPupils.forEach(item => {
        item.mesh.position.x = item.basePos.x + x * 0.12;
        item.mesh.position.y = item.basePos.y + y * 0.12;
      });
    }
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      // Find top group
      let obj = intersects[0].object;
      while (obj.parent && !obj.userData.name) {
        obj = obj.parent;
      }

      if (obj.userData && !obj.userData.isPopping) {
        this.triggerObjectPop(obj);
        if (this.onObjectClick) {
          this.onObjectClick(obj.userData.name);
        }
      }
    }
  }

  triggerObjectPop(object) {
    object.userData.isPopping = true;
    const originalScale = object.scale.clone();

    let popProgress = 0;
    const popInterval = setInterval(() => {
      popProgress += 0.08;
      const scaleMultiplier = 1 + Math.sin(popProgress * Math.PI) * 0.35;
      object.scale.copy(originalScale).multiplyScalar(scaleMultiplier);
      object.rotation.y += 0.25;

      if (popProgress >= 1) {
        clearInterval(popInterval);
        object.scale.copy(originalScale);
        object.userData.isPopping = false;
      }
    }, 16);
  }

  // RENDER & ANIMATION LOOP
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth lerp mouse parallax
    this.mouse.lerp(this.targetMouse, 0.05);

    // Camera gentle tilt and parallax
    this.camera.position.x = this.mouse.x * 1.4;
    this.camera.position.y = this.mouse.y * 1.0;
    this.camera.lookAt(0, 0, 0);

    // Dynamic light movement
    if (this.pinkLight) {
      this.pinkLight.position.x = -8 + Math.sin(elapsedTime * 1.2) * 1.5;
      this.pinkLight.position.y = 3 + Math.cos(elapsedTime * 0.8) * 1.5;
    }
    if (this.yellowLight) {
      this.yellowLight.position.x = 8 + Math.cos(elapsedTime * 1.1) * 1.5;
      this.yellowLight.position.y = -2 + Math.sin(elapsedTime * 0.9) * 1.5;
    }

    // Animate interactive arcade models
    this.interactiveObjects.forEach((obj, idx) => {
      const u = obj.userData;
      if (!u.isPopping) {
        // Floating sinusoidal bob
        obj.position.y = u.baseY + Math.sin(elapsedTime * u.bobSpeed + idx) * u.bobHeight;

        // Object Rotation & Sway
        if (u.oscillateY) {
          // Keep front face forward with gentle cute sway
          obj.rotation.y = u.baseRotY + Math.sin(elapsedTime * u.swaySpeed) * u.swayAngle + this.mouse.x * 0.25;
        } else if (u.rotSpeedY) {
          // Continuous 360 spin for coins and neon polyhedra
          obj.rotation.y += u.rotSpeedY;
        }

        // Gentle tilt reaction to mouse
        obj.rotation.x = Math.sin(elapsedTime * 1.0 + idx) * 0.08 + this.mouse.y * 0.15;
        obj.rotation.z = Math.cos(elapsedTime * 0.8 + idx) * 0.08 - this.mouse.x * 0.15;
      }
    });

    // Starfield slow orbit
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.02;
      this.starfield.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
