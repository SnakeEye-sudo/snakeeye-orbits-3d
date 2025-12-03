// SnakeEye Orbits - 3D Interactive Portfolio
// Three.js powered 3D scene with orbiting projects

(function() {
  'use strict';

  let scene, camera, renderer, coreObject, orbitingObjects = [];
  let mouseX = 0, mouseY = 0;
  let animationId;
  const canvas = document.getElementById('canvas');
  const overlay = document.querySelector('.overlay');
  const projectList = document.getElementById('project-list');

  // Project data - links to your GitHub projects
  const projects = [
    { name: 'particle-galaxy-3d', category: '3D Graphics', radius: 1.5 },
    { name: 'audio-spectrum-3d', category: 'Audio Viz', radius: 2.0 },
    { name: 'SnakeEye-sudo', category: 'Profile', radius: 1.3 },
    { name: 'FunASR', category: 'AI/ML', radius: 1.7 },
    { name: 'snakeeye-orbits-3d', category: 'Portfolio', radius: 1.9 }
  ];

  function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 30, 100);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff96, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Core object (SnakeEye center)
    createCoreObject();

    // Orbiting objects
    createOrbitingObjects();

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onObjectClick);

    // Hide loading overlay
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 500);

    // Start animation
    animate();
  }

  function createCoreObject() {
    const geometry = new THREE.IcosahedronGeometry(0.8, 4);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff96,
      emissive: 0x00cc77,
      shininess: 100,
      wireframe: false
    });
    coreObject = new THREE.Mesh(geometry, material);
    coreObject.castShadow = true;
    scene.add(coreObject);

    // Add glow effect
    const glowGeometry = new THREE.IcosahedronGeometry(1.0, 4);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff96,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    coreObject.add(glow);
  }

  function createOrbitingObjects() {
    projects.forEach((project, index) => {
      const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const hue = index / projects.length;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);

      const angle = (index / projects.length) * Math.PI * 2;
      const orbitRadius = project.radius;
      mesh.position.x = Math.cos(angle) * orbitRadius;
      mesh.position.y = Math.sin(angle) * orbitRadius * 0.5;
      mesh.position.z = Math.sin(angle) * orbitRadius;

      mesh.userData = {
        ...project,
        angle: angle,
        orbitRadius: orbitRadius,
        speed: 0.3 + Math.random() * 0.3
      };

      scene.add(mesh);
      orbitingObjects.push(mesh);
    });

    updateProjectList();
  }

  function updateProjectList() {
    projectList.innerHTML = projects.map((p, i) => 
      `<li><span class="dot" style="background: hsl(${i / projects.length * 360}, 100%, 50%);"></span> ${p.name}</li>`
    ).join('');
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Rotate core
    coreObject.rotation.x += 0.002;
    coreObject.rotation.y += 0.003;

    // Animate orbiting objects
    orbitingObjects.forEach(obj => {
      const data = obj.userData;
      data.angle += data.speed * 0.001;
      obj.position.x = Math.cos(data.angle) * data.orbitRadius;
      obj.position.y = Math.sin(data.angle) * data.orbitRadius * 0.5;
      obj.position.z = Math.sin(data.angle) * data.orbitRadius;
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.02;
    });

    // Camera follow mouse
    camera.position.x = mouseX * 0.01;
    camera.position.y = mouseY * 0.01;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 2;
    mouseY = (event.clientY - window.innerHeight / 2) * 2;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onObjectClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(orbitingObjects);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const projectName = obj.userData.name;
      window.open(`https://github.com/SnakeEye-sudo/${projectName}`, '_blank');
    }
  }

  // Initialize when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
