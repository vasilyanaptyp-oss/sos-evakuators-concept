/**
 * AUTOPALĪDZĪBA.LV — Holographic 3D Tactical Night Radar & Topography Grid
 * Powered by Three.js WebGL Engine.
 */
(function() {
  "use strict";

  const container = document.querySelector(".hero");
  const oldCanvas = document.getElementById("heroRadarCanvas");
  if (!container || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Setup Three.js WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: oldCanvas || undefined,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  if (!oldCanvas) {
    renderer.domElement.id = "heroRadarCanvas";
    renderer.domElement.className = "hero-radar-canvas";
    container.insertBefore(renderer.domElement, container.firstChild);
  }

  const mobile = window.matchMedia("(max-width: 820px)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 36, 68);
  camera.lookAt(0, -2, -5);

  let width = container.clientWidth;
  let height = container.clientHeight;
  renderer.setSize(width, height);

  // 1. Holographic Topography Grid
  const gridWidth = 160;
  const gridDepth = 160;
  const gridSegments = mobile ? 34 : 54;
  const terrainGeo = new THREE.PlaneGeometry(gridWidth, gridDepth, gridSegments, gridSegments);
  terrainGeo.rotateX(-Math.PI / 2);

  const pos = terrainGeo.attributes.position;
  const initialY = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    const wave = Math.sin(x * 0.07) * Math.cos(z * 0.07) * 3.2;
    const valley = Math.sin(x * 0.035 + z * 0.035) * 1.8;
    const y = (wave + valley) * (dist > 18 ? 1 : dist / 18);
    pos.setY(i, y - 5.5);
    initialY[i] = y - 5.5;
  }
  terrainGeo.computeVertexNormals();

  const gridMat = new THREE.MeshBasicMaterial({
    color: 0xf4c531,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, gridMat);
  scene.add(terrainMesh);

  // 2. Concentric Radar Rings
  const radarGroup = new THREE.Group();
  radarGroup.position.set(0, -5.2, -4);
  scene.add(radarGroup);

  for (let r = 1; r <= 4; r++) {
    const ringGeo = new THREE.RingGeometry(r * 11 - 0.18, r * 11 + 0.18, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd53e,
      transparent: true,
      opacity: 0.1 + r * 0.03,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    radarGroup.add(ring);
  }

  // 3. Rotating Sweeper Beam
  const sweepGeo = new THREE.RingGeometry(0.1, 46, 32, 1, 0, Math.PI * 0.32);
  sweepGeo.rotateX(-Math.PI / 2);
  const sweepMat = new THREE.MeshBasicMaterial({
    color: 0xf4c531,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const sweeper = new THREE.Mesh(sweepGeo, sweepMat);
  radarGroup.add(sweeper);

  // 4. Tactical Beacon Pins (Daugavpils Patrol Hotspots)
  const beaconData = [
    { name: "SOS-01 · Centrs (Gatavībā)", x: 6, z: -6, color: 0x00ff88, status: "Gatavībā" },
    { name: "SOS-02 · A13 Šoseja (Izsaukumā)", x: -22, z: -20, color: 0xff4433, status: "Izsaukumā" },
    { name: "SOS-03 · Krāslavas v. (Gatavībā)", x: 26, z: 14, color: 0x00ff88, status: "Gatavībā" },
    { name: "SOS-04 · Jaunbūve (Patruļa)", x: -12, z: 18, color: 0xffd53e, status: "Patruļa" }
  ];

  const beaconObjects = [];

  beaconData.forEach((b) => {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(b.x, -5.2, b.z);

    // Glowing core sphere
    const sphereGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: b.color });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 1.0;
    beaconGroup.add(sphere);

    // Vertical light pillar
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.35, 16, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: b.color,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 8;
    beaconGroup.add(beam);

    // Expanding pulse ring
    const pulseGeo = new THREE.RingGeometry(0.2, 1.0, 32);
    pulseGeo.rotateX(-Math.PI / 2);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: b.color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
    pulseRing.position.y = 0.1;
    beaconGroup.add(pulseRing);

    radarGroup.add(beaconGroup);
    beaconObjects.push({ group: beaconGroup, pulseRing: pulseRing, pulseScale: 1, color: b.color });
  });

  // 5. Circular Particle Sprite Texture
  function createParticleTexture() {
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext("2d");
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 213, 62, 1)");
    grad.addColorStop(0.4, "rgba(244, 197, 49, 0.6)");
    grad.addColorStop(1, "rgba(244, 197, 49, 0)");
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(pCanvas);
  }

  const particleCount = mobile ? 44 : 80;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 110;
    particlePositions[i + 1] = Math.random() * 20 - 4;
    particlePositions[i + 2] = (Math.random() - 0.5) * 110;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    map: createParticleTexture(),
    size: 1.6,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Smooth Camera Physics
  let targetCamX = 0;
  let targetCamY = 36;
  let targetCamZ = 68;

  window.addEventListener("pointermove", (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetCamX = nx * 10;
    targetCamY = 36 - ny * 6;
    targetCamZ = 68 + ny * 5;
  }, { passive: true });

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", onResize, { passive: true });

  // Animation Loop
  let clock = new THREE.Clock();
  let isVisible = true;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (!reduceMotion) {
      sweeper.rotation.y = time * 0.7;

      const p = terrainGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const z = p.getZ(i);
        const y = initialY[i] + Math.sin(time * 1.1 + x * 0.09 + z * 0.09) * 0.7;
        p.setY(i, y);
      }
      terrainGeo.attributes.position.needsUpdate = true;

      beaconObjects.forEach((bo) => {
        bo.pulseScale += delta * 1.6;
        if (bo.pulseScale > 4.0) bo.pulseScale = 0.5;
        bo.pulseRing.scale.set(bo.pulseScale, bo.pulseScale, 1);
        bo.pulseRing.material.opacity = Math.max(0, 0.8 - (bo.pulseScale / 4.0) * 0.8);
      });

      const pArr = particleGeo.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pArr[i] -= delta * 1.2;
        if (pArr[i] < -5) pArr[i] = 20;
      }
      particleGeo.attributes.position.needsUpdate = true;
    }

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;
    camera.lookAt(0, -2, -4);

    renderer.render(scene, camera);
  }

  animate();
})();
