import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3, 2, 5).normalize();
scene.add(light);

camera.position.set(5, 2, 5);
camera.lookAt(0, 0, 0);

var inactiveMaterial = new THREE.MeshStandardMaterial({color: 0x333333});
var activeMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});

var meshCache = [];

// GLTF Loader
const loader = new GLTFLoader();
loader.load('cube.glb', function(gltf) {

    gltf.scene.traverse(function(child) {
        // Each material slot in blender becomes a "separate" mesh in three.js
        if (child.isMesh) {
            meshCache.push(child);
        }
    });

    meshCache.forEach(function(child) {
        child.material = inactiveMaterial;
    });

    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0); // Position the model

    // Now everyone is ready, animate
    animate();
}, undefined, function(error) {
    console.error(error);
});

// Camera position
camera.position.z = 5;

// Animation loop

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();




function updateMaterials(event) {
    meshCache.forEach(function(child) {
        child.material = inactiveMaterial;
    });


    // Convert mouse position to normalized device coordinates (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    // If there's an intersection, handle it
    if (intersects.length > 0) {
        intersects[0].object.material = activeMaterial;
        // On demand draw
        animate();
    }
}
window.addEventListener('mousemove', updateMaterials, false);


function animate() {
    // requestAnimationFrame(animate);
    renderer.render(scene, camera);

    console.log(renderer.info);

    console.log('drawcalls: ' + renderer.info.render.calls + ' triangles: ' + renderer.info.render.triangles);

}

// Initial draw
animate();



// Handle window resizing
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
