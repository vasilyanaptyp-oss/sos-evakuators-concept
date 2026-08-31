/**
 * AUTOPALĪDZĪBA.LV — Master-Level 3D Hydraulic Tow Platform Simulator
 * Powered by Three.js WebGL Engine with PBR Shaders, Dynamic Kinematics & Orbit Camera.
 */
(function() {
  "use strict";

  const container = document.querySelector(".sim-canvas-wrap");
  const oldCanvas = document.getElementById("tow3dCanvas");
  if (!container || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Renderer Setup
  const renderer = new THREE.WebGLRenderer({
    canvas: oldCanvas || undefined,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  if (!oldCanvas) {
    renderer.domElement.id = "tow3dCanvas";
    renderer.domElement.className = "tow-3d-canvas";
    container.insertBefore(renderer.domElement, container.firstChild);
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let width = container.clientWidth;
  let height = container.clientHeight;
  renderer.setSize(width, height);

  // 2. Scene & Camera Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 400);

  // 3. Studio & Tactical Lighting
  const ambientLight = new THREE.AmbientLight(0x1e293b, 1.6);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffd53e, 2.8);
  mainLight.position.set(20, 30, 18);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  mainLight.shadow.bias = -0.001;
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
  rimLight.position.set(-20, 18, -20);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0xffffff, 1.4, 40);
  fillLight.position.set(0, 12, 12);
  scene.add(fillLight);

  // Emergency Roof Strobe Lights
  const strobeLight1 = new THREE.PointLight(0xffaa00, 3.0, 16);
  const strobeLight2 = new THREE.PointLight(0xff2200, 3.0, 16);
  scene.add(strobeLight1);
  scene.add(strobeLight2);

  // 4. High-Tech Circular Showcase Pedestal
  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  const pedestalGeo = new THREE.CylinderGeometry(15, 15.6, 0.4, 48);
  const matPedestal = new THREE.MeshStandardMaterial({ color: 0x13171d, roughness: 0.7, metalness: 0.4 });
  const pedestal = new THREE.Mesh(pedestalGeo, matPedestal);
  pedestal.position.y = -0.2;
  pedestal.receiveShadow = true;
  stageGroup.add(pedestal);

  // Illuminated Amber Neon Edge Ring
  const ringGeo = new THREE.RingGeometry(14.8, 15.05, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const matRing = new THREE.MeshBasicMaterial({ color: 0xffd53e, side: THREE.DoubleSide });
  const neonRing = new THREE.Mesh(ringGeo, matRing);
  neonRing.position.y = 0.02;
  stageGroup.add(neonRing);

  const gridHelper = new THREE.GridHelper(30, 20, 0xf4c531, 0x1e2632);
  gridHelper.position.y = 0.03;
  stageGroup.add(gridHelper);

  // 5. Materials
  const matCab = new THREE.MeshStandardMaterial({ color: 0xf4c531, roughness: 0.25, metalness: 0.65 });
  const matCabDark = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.35, metalness: 0.8 });
  const matChassis = new THREE.MeshStandardMaterial({ color: 0x1e232b, roughness: 0.65, metalness: 0.9 });
  const matChrome = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.98 });
  const matDeck = new THREE.MeshStandardMaterial({ color: 0x272d36, roughness: 0.35, metalness: 0.85 });
  const matDeckSide = new THREE.MeshStandardMaterial({ color: 0xd64331, roughness: 0.3, metalness: 0.6 });
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x0c1017, roughness: 0.1, metalness: 0.95, transparent: true, opacity: 0.88 });
  const matTire = new THREE.MeshStandardMaterial({ color: 0x0f1114, roughness: 0.92, metalness: 0.08 });
  const matBeacon = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const matWinchCable = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

  // 6. Master Truck Model Assembly (Scale x1.3)
  const truckRoot = new THREE.Group();
  truckRoot.scale.set(1.15, 1.15, 1.15);
  scene.add(truckRoot);

  // --- A. Chassis Frame ---
  const frameGeo = new THREE.BoxGeometry(1.6, 0.45, 14.5);
  const frameMesh = new THREE.Mesh(frameGeo, matChassis);
  frameMesh.position.set(0, 1.4, 0);
  frameMesh.castShadow = true;
  truckRoot.add(frameMesh);

  // Chrome Fuel Tanks
  const tankGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.4, 16);
  tankGeo.rotateZ(Math.PI / 2);
  const tankLeft = new THREE.Mesh(tankGeo, matChrome);
  tankLeft.position.set(-1.15, 1.3, -0.5);
  truckRoot.add(tankLeft);

  const tankRight = new THREE.Mesh(tankGeo, matChrome);
  tankRight.position.set(1.15, 1.3, -0.5);
  truckRoot.add(tankRight);

  // Wheels (6 heavy-duty wheels with 8-spoke star chrome rims)
  const wheelGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.52, 24);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.54, 16);
  rimGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-1.25, 0.85, 4.8], [1.25, 0.85, 4.8],   // Front Axle
    [-1.28, 0.85, -2.6], [1.28, 0.85, -2.6], // Rear Axle 1
    [-1.28, 0.85, -4.6], [1.28, 0.85, -4.6]  // Rear Axle 2
  ];

  wheelPositions.forEach(p => {
    const tire = new THREE.Mesh(wheelGeo, matTire);
    tire.position.set(p[0], p[1], p[2]);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, matChrome);
    tire.add(rim);
    truckRoot.add(tire);
  });

  // --- B. Truck Cabin ---
  const cabGroup = new THREE.Group();
  cabGroup.position.set(0, 1.6, 4.4);
  truckRoot.add(cabGroup);

  // Main Cab Body
  const cabBodyGeo = new THREE.BoxGeometry(2.55, 2.6, 3.2);
  const cabBody = new THREE.Mesh(cabBodyGeo, matCab);
  cabBody.position.y = 1.3;
  cabBody.castShadow = true;
  cabGroup.add(cabBody);

  // Cab Roof Cap & Aerodynamic Visor
  const cabRoofGeo = new THREE.BoxGeometry(2.5, 0.35, 3.0);
  const cabRoof = new THREE.Mesh(cabRoofGeo, matCabDark);
  cabRoof.position.y = 2.75;
  cabGroup.add(cabRoof);

  // Front Heavy Bumper & Winch Fairlead
  const bumperGeo = new THREE.BoxGeometry(2.7, 0.75, 0.6);
  const bumper = new THREE.Mesh(bumperGeo, matCabDark);
  bumper.position.set(0, 0.18, 1.7);
  bumper.castShadow = true;
  cabGroup.add(bumper);

  const grilleGeo = new THREE.BoxGeometry(1.9, 1.15, 0.15);
  const grille = new THREE.Mesh(grilleGeo, matChassis);
  grille.position.set(0, 0.95, 1.62);
  cabGroup.add(grille);

  // Windshield & Side Windows
  const windshieldGeo = new THREE.BoxGeometry(2.35, 1.1, 0.15);
  windshieldGeo.rotateX(-0.15);
  const windshield = new THREE.Mesh(windshieldGeo, matGlass);
  windshield.position.set(0, 1.85, 1.55);
  cabGroup.add(windshield);

  // Side Mirrors with Chrome Face
  const mirrorGeo = new THREE.BoxGeometry(0.12, 0.6, 0.35);
  const mirL = new THREE.Mesh(mirrorGeo, matCabDark);
  mirL.position.set(-1.45, 1.8, 1.0);
  cabGroup.add(mirL);
  const mirR = new THREE.Mesh(mirrorGeo, matCabDark);
  mirR.position.set(1.45, 1.8, 1.0);
  cabGroup.add(mirR);

  // Headlights (Twin Lenses)
  const lightGeo = new THREE.BoxGeometry(0.42, 0.28, 0.1);
  const matHeadlight = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const headL = new THREE.Mesh(lightGeo, matHeadlight);
  headL.position.set(-0.95, 0.28, 1.95);
  cabGroup.add(headL);
  const headR = new THREE.Mesh(lightGeo, matHeadlight);
  headR.position.set(0.95, 0.28, 1.95);
  cabGroup.add(headR);

  // Chrome Air Horns on Roof
  const hornGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.9, 8);
  hornGeo.rotateX(Math.PI / 2);
  const hornL = new THREE.Mesh(hornGeo, matChrome);
  hornL.position.set(-0.6, 3.05, 0.2);
  cabGroup.add(hornL);
  const hornR = new THREE.Mesh(hornGeo, matChrome);
  hornR.position.set(0.6, 3.05, 0.2);
  cabGroup.add(hornR);

  // Rooftop Emergency Amber Beacon Bar
  const beaconBarGeo = new THREE.BoxGeometry(1.8, 0.22, 0.45);
  const beaconBar = new THREE.Mesh(beaconBarGeo, matBeacon);
  beaconBar.position.set(0, 3.05, 0.2);
  cabGroup.add(beaconBar);

  strobeLight1.position.set(0, 4.8, 4.6);
  strobeLight2.position.set(0, 4.8, 4.6);

  // --- C. Hydraulic Rollback Bed Subassembly ---
  const pivotPoint = new THREE.Group();
  pivotPoint.position.set(0, 1.8, 1.6);
  truckRoot.add(pivotPoint);

  const bedSlider = new THREE.Group();
  pivotPoint.add(bedSlider);

  // Main Steel Diamond Deck
  const deckLength = 11.8;
  const deckWidth = 2.8;
  const deckGeo = new THREE.BoxGeometry(deckWidth, 0.28, deckLength);
  const deckMesh = new THREE.Mesh(deckGeo, matDeck);
  deckMesh.position.set(0, 0.14, -deckLength / 2 + 1.2);
  deckMesh.castShadow = true;
  deckMesh.receiveShadow = true;
  bedSlider.add(deckMesh);

  // Deck Side Safety Rails (Signal Red)
  const railGeo = new THREE.BoxGeometry(0.12, 0.4, deckLength);
  const railL = new THREE.Mesh(railGeo, matDeckSide);
  railL.position.set(-deckWidth / 2 + 0.06, 0.35, -deckLength / 2 + 1.2);
  bedSlider.add(railL);
  const railR = new THREE.Mesh(railGeo, matDeckSide);
  railR.position.set(deckWidth / 2 - 0.06, 0.35, -deckLength / 2 + 1.2);
  bedSlider.add(railR);

  // Headache Rack (Behind Cab Barrier)
  const rackGeo = new THREE.BoxGeometry(deckWidth, 1.8, 0.2);
  const rack = new THREE.Mesh(rackGeo, matChassis);
  rack.position.set(0, 1.0, 1.1);
  bedSlider.add(rack);

  // Winch Drum on Headache Rack
  const winchDrumGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16);
  winchDrumGeo.rotateZ(Math.PI / 2);
  const winchDrum = new THREE.Mesh(winchDrumGeo, matChrome);
  winchDrum.position.set(0, 0.5, 0.95);
  bedSlider.add(winchDrum);

  // Winch Cable
  const cableGeo = new THREE.CylinderGeometry(0.025, 0.025, 8.0, 8);
  cableGeo.rotateX(Math.PI / 2);
  const cableMesh = new THREE.Mesh(cableGeo, matWinchCable);
  cableMesh.position.set(0, 0.35, -3.2);
  bedSlider.add(cableMesh);

  // --- D. 3D Loaded Vehicles (Modes) ---
  const cargoGroup = new THREE.Group();
  bedSlider.add(cargoGroup);

  // 1. Sports Car Model (Mode 1: Low Clearance)
  const sportCar = new THREE.Group();
  const sportBodyGeo = new THREE.BoxGeometry(2.1, 0.65, 4.6);
  const matSport = new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.15, metalness: 0.88 });
  const sportBody = new THREE.Mesh(sportBodyGeo, matSport);
  sportBody.position.y = 0.55;
  sportBody.castShadow = true;
  sportCar.add(sportBody);

  const sportCabinGeo = new THREE.BoxGeometry(1.6, 0.55, 2.2);
  const sportCabin = new THREE.Mesh(sportCabinGeo, matGlass);
  sportCabin.position.set(0, 1.05, -0.2);
  sportCar.add(sportCabin);

  const sportWingGeo = new THREE.BoxGeometry(1.9, 0.1, 0.45);
  const sportWing = new THREE.Mesh(sportWingGeo, matCabDark);
  sportWing.position.set(0, 1.05, -2.1);
  sportCar.add(sportWing);

  // Sports car bronze wheels
  const swGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
  swGeo.rotateZ(Math.PI / 2);
  const swMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 });
  [[-1.0, 0.38, 1.4], [1.0, 0.38, 1.4], [-1.0, 0.38, -1.4], [1.0, 0.38, -1.4]].forEach(p => {
    const sw = new THREE.Mesh(swGeo, swMat);
    sw.position.set(p[0], p[1], p[2]);
    sportCar.add(sw);
  });
  sportCar.position.set(0, 0.28, -5.0);
  cargoGroup.add(sportCar);

  // 2. Heavy SUV Model (Mode 2)
  const suvCar = new THREE.Group();
  const suvBodyGeo = new THREE.BoxGeometry(2.25, 1.2, 5.0);
  const matSuv = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
  const suvBody = new THREE.Mesh(suvBodyGeo, matSuv);
  suvBody.position.y = 0.9;
  suvBody.castShadow = true;
  suvCar.add(suvBody);

  const suvCabinGeo = new THREE.BoxGeometry(1.9, 0.95, 3.2);
  const suvCabin = new THREE.Mesh(suvCabinGeo, matGlass);
  suvCabin.position.set(0, 1.8, -0.3);
  suvCar.add(suvCabin);

  const suvRackGeo = new THREE.BoxGeometry(1.7, 0.15, 2.8);
  const suvRack = new THREE.Mesh(suvRackGeo, matCabDark);
  suvRack.position.set(0, 2.35, -0.3);
  suvCar.add(suvRack);

  suvCar.position.set(0, 0.28, -4.8);
  suvCar.visible = false;
  cargoGroup.add(suvCar);

  // 3. Mini-Excavator Machinery (Mode 3)
  const machineGroup = new THREE.Group();
  const baseTrackGeo = new THREE.BoxGeometry(2.2, 0.6, 3.4);
  const machineBase = new THREE.Mesh(baseTrackGeo, matChassis);
  machineBase.position.y = 0.35;
  machineGroup.add(machineBase);

  const cabMachGeo = new THREE.BoxGeometry(1.6, 1.6, 1.8);
  const matMach = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.7 });
  const machineCab = new THREE.Mesh(cabMachGeo, matMach);
  machineCab.position.set(0, 1.4, 0);
  machineGroup.add(machineCab);

  const boomGeo = new THREE.BoxGeometry(0.3, 2.4, 0.3);
  boomGeo.rotateX(0.4);
  const boom = new THREE.Mesh(boomGeo, matMach);
  boom.position.set(0, 1.8, 1.5);
  machineGroup.add(boom);

  machineGroup.position.set(0, 0.28, -4.2);
  machineGroup.visible = false;
  cargoGroup.add(machineGroup);

  // 7. Dynamic Kinematic State Machine
  const MODES = {
    low: {
      angle: -0.14, // ~8 degrees
      slide: -4.4,  // Slide back down to ground
      cableScale: 1.2,
      targetVehicle: sportCar,
      specs: { angle: "8°", cap: "2.8 t", winch: "4.5 t", desc: "Hidrauliskā platforma nolaižas līdz minimālam 8° leņķim, lai nebojātu zemo bamperi vai spoileri." }
    },
    suv: {
      angle: 0.0,   // Level travel position
      slide: -0.4,  // Retracted
      cableScale: 0.8,
      targetVehicle: suvCar,
      specs: { angle: "0°", cap: "4.2 t", winch: "6.0 t", desc: "Pastiprinātas tērauda fiksācijas siksnas un divkāršais hidrauliskais cilindrs drošai smago auto celšanai." }
    },
    heavy: {
      angle: 0.0,
      slide: 0.0,
      cableScale: 0.5,
      targetVehicle: machineGroup,
      specs: { angle: "0°", cap: "9.0 t", winch: "10.0 t", desc: "Lieljaudas platforma līdz 9 tonnām: ekskavatori, iekrāvēji, komerctransports un lauksaimniecības tehnika." }
    },
    ditch: {
      angle: -0.25, // ~14 degrees deep trench tilt
      slide: -5.2,
      cableScale: 2.2,
      targetVehicle: sportCar,
      specs: { angle: "14°", cap: "5.5 t", winch: "12.0 t", desc: "Jaudīgā tērauda vinča ar trīsi un bloķēšanas balstiem transportlīdzekļa saudzīgai izvilkšanai no grāvja." }
    }
  };

  let currentMode = "low";
  let curAngle = -0.14;
  let curSlide = -4.4;
  let curCable = 1.2;

  // 8. Orbit & Drag Interaction
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let orbitAngle = 0.75;
  let orbitPitch = 0.42;
  let orbitRadius = 19; // Close-up cinematic perspective

  container.addEventListener("pointerdown", (e) => {
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
    container.setPointerCapture(e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - prevPointer.x) * 0.007;
    const dy = (e.clientY - prevPointer.y) * 0.007;
    orbitAngle += dx;
    orbitPitch = Math.max(0.12, Math.min(1.15, orbitPitch + dy));
    prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("pointerup", () => isDragging = false);

  function setMode(modeKey) {
    const data = MODES[modeKey];
    if (!data) return;
    currentMode = modeKey;

    sportCar.visible = (modeKey === "low" || modeKey === "ditch");
    suvCar.visible = (modeKey === "suv");
    machineGroup.visible = (modeKey === "heavy");

    if (modeKey === "ditch") {
      sportCar.position.set(0, -0.4, -8.6);
    } else {
      sportCar.position.set(0, 0.28, -5.0);
    }

    const angleEl = document.getElementById("simAngleVal");
    const capEl = document.getElementById("simCapVal");
    const winchEl = document.getElementById("simWinchVal");
    const descEl = document.getElementById("simModeDesc");

    if (angleEl) angleEl.textContent = data.specs.angle;
    if (capEl) capEl.textContent = data.specs.cap;
    if (winchEl) winchEl.textContent = data.specs.winch;
    if (descEl) descEl.textContent = data.specs.desc;

    document.querySelectorAll(".sim-tab-btn").forEach(btn => {
      const active = btn.dataset.simMode === modeKey;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  document.querySelectorAll(".sim-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.simMode));
  });

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", onResize, { passive: true });

  // Render Loop
  let isVisible = true;
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);
  }

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Auto-orbit when idle
    if (!isDragging && !reduceMotion) {
      orbitAngle += delta * 0.14;
    }

    // Kinematic smoothing
    const target = MODES[currentMode];
    const lerpSpeed = reduceMotion ? 1 : 0.065;
    curAngle += (target.angle - curAngle) * lerpSpeed;
    curSlide += (target.slide - curSlide) * lerpSpeed;
    curCable += (target.cableScale - curCable) * lerpSpeed;

    pivotPoint.rotation.x = curAngle;
    bedSlider.position.z = curSlide;
    cableMesh.scale.z = curCable;

    // Flash emergency roof strobes
    const flash = Math.sin(time * 12);
    strobeLight1.intensity = flash > 0 ? 3.5 : 0.2;
    strobeLight2.intensity = flash < 0 ? 3.5 : 0.2;

    // Update Camera position from orbit spherical coords
    const camX = Math.sin(orbitAngle) * Math.cos(orbitPitch) * orbitRadius;
    const camY = Math.sin(orbitPitch) * orbitRadius + 1.8;
    const camZ = Math.cos(orbitAngle) * Math.cos(orbitPitch) * orbitRadius;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, 1.8, 0);

    renderer.render(scene, camera);
  }

  setMode("low");
  animate();
})();
