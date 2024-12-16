import * as THREE from './node_modules/three/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es/dist/cannon-es.js';

// Scene setup
const scene = new THREE.Scene();

// Add lights for better visuals
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Create a square base
const baseGeometry = new THREE.PlaneGeometry(10, 10);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
baseMesh.rotation.x = -Math.PI / 2; // Rotate the plane to lay flat
scene.add(baseMesh);

// Create a ball
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.6, roughness: 0.4 });
const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ballMesh);

// Initialize camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Physics world setup
const world = new CANNON.World();
world.gravity.set(0, -9.81, 0); // Realistic gravity

// Add physics for the base
const baseBody = new CANNON.Body({
  type: CANNON.Body.STATIC, // Static body
  shape: new CANNON.Plane(),
});
baseBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Align with the visual base
world.addBody(baseBody);

// Add physics for the ball
const ballBody = new CANNON.Body({
  mass: 1, // Affects gravity and collision response
  shape: new CANNON.Sphere(0.5), // Match the visual ball size
  position: new CANNON.Vec3(0, 5, 0), // Start above the base
});
world.addBody(ballBody);

// Movement controls
const movement = { forward: false, backward: false, left: false, right: false };
const force = 5; // Force applied for movement

// Keyboard event listeners
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w': // Move forward
      movement.forward = true;
      break;
    case 's': // Move backward
      movement.backward = true;
      break;
    case 'a': // Move left
      movement.left = true;
      break;
    case 'd': // Move right
      movement.right = true;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
      movement.forward = false;
      break;
    case 's':
      movement.backward = false;
      break;
    case 'a':
      movement.left = false;
      break;
    case 'd':
      movement.right = false;
      break;
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Apply forces for movement
  if (movement.forward) ballBody.applyForce(new CANNON.Vec3(0, 0, -force), ballBody.position);
  if (movement.backward) ballBody.applyForce(new CANNON.Vec3(0, 0, force), ballBody.position);
  if (movement.left) ballBody.applyForce(new CANNON.Vec3(-force, 0, 0), ballBody.position);
  if (movement.right) ballBody.applyForce(new CANNON.Vec3(force, 0, 0), ballBody.position);

  // Update physics world
  world.step(1 / 60); // 60 FPS

  // Sync ball position and rotation with physics
  ballMesh.position.copy(ballBody.position);
  ballMesh.quaternion.copy(ballBody.quaternion);

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation
animate();
