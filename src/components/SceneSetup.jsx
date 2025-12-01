import * as THREE from 'three';

export const setupScene = (mountElement) => {
  // Scene with enhanced fog
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);
  scene.fog = new THREE.FogExp2(0x0a0e27, 0.02);

  // Camera with better initial position
  const camera = new THREE.PerspectiveCamera(
    60, // Wider field of view
    mountElement.clientWidth / mountElement.clientHeight,
    0.1,
    200
  );
 camera.position.set(-8, 1.2, 0);
camera.lookAt(0, 1.2, 0);

// slight roll to create realism
camera.rotation.z = 0.03;
  // Enhanced renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mountElement.appendChild(renderer.domElement);

  // Advanced lighting setup
  setupLighting(scene);
  
  // Background environment
  createBackgroundEnvironment(scene);

  // Handle resize with debouncing
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!mountElement) return;
      camera.aspect = mountElement.clientWidth / mountElement.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    }, 250);
  };
  window.addEventListener('resize', handleResize);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
    if (mountElement && renderer.domElement) {
      mountElement.removeChild(renderer.domElement);
    }
    renderer.dispose();
  };

  return { scene, camera, renderer, cleanup };
};

const setupLighting = (scene) => {
  // Main directional light (sun)
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(10, 15, 10);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 50;
  mainLight.shadow.camera.left = -20;
  mainLight.shadow.camera.right = 20;
  mainLight.shadow.camera.top = 20;
  mainLight.shadow.camera.bottom = -20;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0x4fd1c7, 0.4);
  fillLight.position.set(-5, 5, 5);
  scene.add(fillLight);

  // Ambient light with color
  const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
  scene.add(ambientLight);

  // Accent lights
  const accentLight1 = new THREE.PointLight(0x00ffff, 0.8, 30);
  accentLight1.position.set(8, 6, 6);
  accentLight1.decay = 2;
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(0xff00ff, 0.6, 25);
  accentLight2.position.set(-6, 4, 6);
  accentLight2.decay = 2;
  scene.add(accentLight2);

  // Rim light for spine
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(0, 0, -10);
  scene.add(rimLight);
};

const createBackgroundEnvironment = (scene) => {
  // Create a subtle grid floor
  const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x003333);
  gridHelper.position.y = -2;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.1;
  scene.add(gridHelper);

  // Add distant particles
  const distantParticles = createDistantParticles();
  scene.add(distantParticles);

  return { gridHelper, distantParticles };
};

const createDistantParticles = () => {
  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Distribute in a larger sphere
    const radius = 25 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Color variation (cool colors)
    const hue = 0.6 + Math.random() * 0.3;
    const color = new THREE.Color().setHSL(hue, 0.7, 0.4 + Math.random() * 0.3);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Size variation
    sizes[i] = Math.random() * 0.3 + 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
};

export const cleanupScene = (renderer, scene) => {
  // Traverse scene and dispose of all geometries and materials
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  if (renderer) {
    renderer.dispose();
  }
};