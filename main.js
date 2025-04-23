import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
camera.position.z = 5;

const canvas = document.getElementById('3d-canvas');
if (!canvas) {
  console.error('Canvas element with ID "3d-canvas" not found.');
}

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

let model = null;
let autoRotate = false;

const loader = new GLTFLoader();
loader.load('./model.glb', function (gltf) {
  model = gltf.scene;
  scene.add(model);

  // Centrer et ajuster la caméra
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
  camera.position.z = cameraZ * 1.5;

  camera.lookAt(0, 0, 0);
}, undefined, function (error) {
  console.error('Error loading the model:', error);
});

// Variables pour stocker les valeurs par défaut
const defaultCameraPosition = { x: 0, y: 0, z: 5 };
const defaultModelRotation = { x: 0, y: 0, z: 0 };

// Boutons
document.getElementById('rotate-left').addEventListener('click', () => {
  if (model) model.rotation.y -= 0.1;
});

document.getElementById('rotate-right').addEventListener('click', () => {
  if (model) model.rotation.y += 0.1;
});

document.getElementById('zoom-in').addEventListener('click', () => {
  camera.position.z -= 0.5;
});

document.getElementById('zoom-out').addEventListener('click', () => {
  camera.position.z += 0.5;
});

document.getElementById('reset-view').addEventListener('click', () => {
  if (model) {
    // Réinitialise la rotation du modèle
    model.rotation.set(
      defaultModelRotation.x,
      defaultModelRotation.y,
      defaultModelRotation.z
    );
  }
  // Réinitialise la position de la caméra
  camera.position.set(
    defaultCameraPosition.x,
    defaultCameraPosition.y,
    defaultCameraPosition.z
  );
  camera.lookAt(0, 0, 0); // Oriente la caméra vers le centre de la scène
  console.log('View reset to default');
});

document.getElementById('toggle-auto-rotate').addEventListener('click', () => {
  autoRotate = !autoRotate;
});

// Rotation autour de l'axe Y (ancien X)
document.getElementById('move-x').addEventListener('click', () => {
  if (model) {
    model.rotation.y += 0.1; // Tourne le modèle autour de l'axe Y
    console.log('Rotated around Y axis: ', model.rotation.y);
  }
});

// Rotation autour de l'axe X (ancien Y)
document.getElementById('move-y').addEventListener('click', () => {
  if (model) {
    model.rotation.x += 0.1; // Tourne le modèle autour de l'axe X
    console.log('Rotated around X axis: ', model.rotation.x);
  }
});

// Rotation autour de l'axe Z
document.getElementById('move-z').addEventListener('click', () => {
  if (model) {
    model.rotation.z += 0.1; // Tourne le modèle autour de l'axe Z
    console.log('Rotated around Z axis: ', model.rotation.z);
  }
});

// Compression et décompression
document.getElementById('compress-x').addEventListener('click', () => {
  if (model) model.scale.x *= 0.9;
});

document.getElementById('decompress-x').addEventListener('click', () => {
  if (model) model.scale.x *= 1.1;
});

document.getElementById('compress-y').addEventListener('click', () => {
  if (model) model.scale.y *= 0.9;
});

document.getElementById('decompress-y').addEventListener('click', () => {
  if (model) model.scale.y *= 1.1;
});

document.getElementById('compress-z').addEventListener('click', () => {
  if (model) model.scale.z *= 0.9;
});

document.getElementById('decompress-z').addEventListener('click', () => {
  if (model) model.scale.z *= 1.1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  if (autoRotate && model) {
    model.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
animate();