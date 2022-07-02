import "core-js/stable";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

const images = [
  require(`./images/img0.jpg`),
  require(`./images/img1.jpg`),
  require(`./images/img2.jpg`),
  require(`./images/img3.jpg`),
];

//Texture Loader
const textureLoader = new THREE.TextureLoader();

// Debug
const gui = new dat.GUI();

// Scene
const scene = new THREE.Scene();

// 4 Images
const geo = new THREE.PlaneBufferGeometry(1, 1.3);

for (let i = 0; i < 4; i++) {
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(`${images[i]}`),
  });

  const img = new THREE.Mesh(geo, material);
  img.position.set(Math.random() + 0.3, -i * 1.8);

  scene.add(img);
}

//get all objects
let objs = [];
scene.traverse((object) => {
  if (object.isMesh) objs.push(object);
});

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

//GUI
gui.add(camera.position, "y").min(-5).max(10);
// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

//Mouse
window.addEventListener("wheel", onMouseWheel);

let y = 0;
let position = 0;

function onMouseWheel(event) {
  y = event.deltaY * 0.0007;
}

const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  //mouse.x = value between -1 & +1
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
  //negative because y value needs to be flipped//
});

/**
 * Animate
 */

//RAYCASTER
const raycaster = new THREE.Raycaster();

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects

  //Scrolling
  position += y;
  y *= 0.7;
  camera.position.y = -position;

  //Raycaster
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objs);
  //intersects = when objs are intersected by target
  for (const intersect of intersects) {
    gsap.to(intersect.object.scale, { x: 1.7, y: 1.7 });
    gsap.to(intersect.object.rotation, { y: -0.5 });
    gsap.to(intersect.object.position, { z: -0.9 });
  }

  for (const object of objs) {
    if (!intersects.find((intersect) => intersect.object === object)) {
      gsap.to(object.scale, { x: 1, y: 1 });
      gsap.to(object.rotation, { y: 0 });
      gsap.to(object.position, { z: 0 });
    }
  }

  //#first whatever intersects objs, then always camera#//

  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
