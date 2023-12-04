
// Import the necessary modules
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three/examples/jsm/webxr/VRButton.js';

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

// Create a camera
let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);
scene.add(camera);

// Add some lights
var light = new THREE.DirectionalLight(0xffffff,0.5);
light.position.set(1, 1, 1).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,0.5))

// Make a red cube
let cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshLambertMaterial({color:'red'})
);
cube.position.set(0, 1.5, -10);
scene.add(cube);

// Create a renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// Turn on VR support
renderer.xr.enabled = true;
// Set animation loop
renderer.setAnimationLoop(render);
// Add canvas to the page
// document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));
window.addEventListener('resize', onWindowResize, false);


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(time) {
    // Rotate the cube
    cube.rotation.y = time / 1000;
    // Draw everything
    renderer.render(scene, camera);
}

$(function() {
    // Crea el modelo
    let modelContainer = document.getElementById( "container" );
    let model = new TSP.models.Sequential( modelContainer );

    model.add( new TSP.layers.GreyscaleInput() );
    model.add( new TSP.layers.Padding2d() );
    model.add( new TSP.layers.Conv2d() );
    model.add( new TSP.layers.Pooling2d() );
    model.add( new TSP.layers.Conv2d() );
    model.add( new TSP.layers.Pooling2d() );
    model.add( new TSP.layers.Dense() );
    model.add( new TSP.layers.Dense() );
    model.add( new TSP.layers.Output1d({
        outputs: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    }) );

    model.load({
        type: "tensorflow",
        url: './convertedModel/model.json'
    });
    model.init( function() {

        $.ajax({
            url: "./data/5.json",
            type: 'GET',
            async: true,
            dataType: 'json',
            success: function (data) {

                model.predict( data );

            }
        });


    } );

});
