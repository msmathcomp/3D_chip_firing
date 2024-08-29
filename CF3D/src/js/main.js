import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import {voxel} from './voxel.js';
import { neighborCount, neighborOffsets, isInNeighborhood, neighborhoodScene} from './neighborhood';
import { normalize } from 'three/src/math/MathUtils.js';
import { DragControls } from 'three/examples/jsm/Addons.js';

// ----- Main Scene Initialisation -----
const controlsWidth = 400;
export var interfaceWidth = window.innerWidth - controlsWidth;
document.documentElement.style.setProperty('--interfaceWidth', interfaceWidth)

const mainCanvas = document.getElementById('mainCanvas');
const renderer = new THREE.WebGLRenderer({canvas: mainCanvas});
renderer.setSize(interfaceWidth, window.innerHeight);
renderer.setClearColor(0x1c1b22, 1);
const mainScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    interfaceWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
var objectWidth = 0;

window.addEventListener("resize",()=>{
    interfaceWidth = window.innerWidth - controlsWidth;
    camera.aspect = interfaceWidth / window.innerHeight;
    renderer.setSize(interfaceWidth, window.innerHeight);
    console.log("resized");
    camera.updateProjectionMatrix();

    renderer.render(mainScene, camera);
});

// ----- Neighborhood Scene Initialisation -----
const neighborhoodCanvas = document.getElementById('neighborhoodCanvas');
export var neighborhoodRenderer = new THREE.WebGLRenderer({ canvas: neighborhoodCanvas })
//document.getElementById("neighborhoodEditor").appendChild(neighborhoodRenderer.domElement);
neighborhoodRenderer.setSize(300, 300);
neighborhoodRenderer.setClearColor(0x1c1b22, 1);
export const neighborhoodCamera = new THREE.PerspectiveCamera(
    75,
    300 / 300,
    1,
    100
)
const neighborhoodOrbit = new OrbitControls(neighborhoodCamera, neighborhoodRenderer.domElement)

neighborhoodCamera.position.set(0, 2, 5);
neighborhoodCamera.lookAt(0, 0, 0);
neighborhoodCamera.translateZ(4);
neighborhoodOrbit.update();
neighborhoodRenderer.render(neighborhoodScene, neighborhoodCamera);

// ----- HTML Elements -----
var chipInput = document.getElementById("chipInput")
var backgroundInput = document.getElementById("backgroundInput")
var boundaryInput = document.getElementById("boundaryInput")
var boundary = 0;



// first voxel
const firstBoxGeometry = new THREE.BoxGeometry();
const firstBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const firstBox = new THREE.Mesh(firstBoxGeometry, firstBoxMaterial);
mainScene.add(firstBox);

const firstVoxel = new voxel(1, [0, 0, 0], 0, firstBox);
firstVoxel.setColor();
firstBox.material.color.setHex(firstVoxel.color);


var voxels = [];
voxels.push(firstVoxel);

// -- zoom camera to match chip count 
var distance = Math.log10(firstVoxel.chipCount) * 1.4 + 5;
camera.position.set(0, 0 / 5 * distance, distance);
orbit.update;
// --

var isFiring = false;

// -- HTML Button Events
var fireBtn = document.getElementById("FIRE");
fireBtn.addEventListener("click", fire, false);
function fire(){
    if (!isFiring){
        isFiring = true;
        fireBtn.disabled = true;
    }
}
var clearBtn = document.getElementById("CLEAR");
clearBtn.addEventListener("click", clear, false);
function clear() {
    for(var i = 1; i<voxels.length; i++){
        mainScene.remove(voxels[i].visualObj);
    }
    firstVoxel.neighbors = [];
    voxels = [firstVoxel];
    console.log(voxels.length);

}
var renderWhileFiringSwitch = document.getElementById("renderWhileFiring");
var renderWhileFiring = function(){return renderWhileFiringSwitch.checked}
var clippingPlaneSwitch = document.getElementById("clippingPlane");

// ----- Clipping Plane -----
var planeHeight = 10;
const handleColor = 0x808080;
const hoverColor = 0xffffff;
const handleGeometry = new THREE.BoxGeometry(planeHeight, 0.5, 0.5);
const handleMaterial = new THREE.MeshBasicMaterial({color: handleColor});
var handle = new THREE.Mesh(handleGeometry, handleMaterial);

const planeGeometry = new THREE.PlaneGeometry(planeHeight, planeHeight);
const planeOpacity = 0.2;
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: planeOpacity
})
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
mainScene.add(plane, handle);
plane.position.set(0,-planeHeight / 2,0);
handle.position.set(0,planeHeight / 2,0);
handle.add(plane);
var handleScaler = 1 + objectWidth / 2;
var handleHeight = planeHeight * handleScaler;

//handle.rotateOnAxis(new THREE.Vector3(0,1,0), 90);

var dControls = new DragControls([handle], camera, renderer.domElement)
dControls.enabled = true
dControls.recursive = false

document.addEventListener("mousedown", (e) =>{
    switch(e.button){
        case 0:
            dControls.activate();
            dControls.mode = "translate";
            break;
        case 2:
            dControls.activate();
            dControls.mode = "rotate";
            break;
        default:
            dControls.deactivate();
    }
})

dControls.addEventListener("hoveron", function(e){
    e.object.material.color.setHex(hoverColor)
    orbit.enableRotate = false;
    orbit.enablePan = false;
})
dControls.addEventListener("hoveroff", function(e){
    e.object.material.color.setHex(handleColor)
    orbit.enableRotate = true;
    orbit.enablePan = true;
})

dControls.addEventListener("drag", function (e) {

    if(dControls.mode == "translate"){
        var handleForward = new THREE.Vector3();
        plane.getWorldDirection(handleForward);
        var dragDir = new THREE.Vector3(math.abs(handleForward.x), math.abs(handleForward.y), math.abs(handleForward.z))
        handle.position.set(handle.position.x * dragDir.x, handle.position.y * dragDir.y, handle.position.z * dragDir.z);


        handleScaler = 1 + objectWidth / 10;
        handleHeight = planeHeight * handleScaler
        handle.position.set(handle.position.x, handleHeight / 2, handle.position.z)

        console.log("fwd: " + handle.position.x);
    }
    else{

    }
    cutObject();

}) 
dControls.activate()


clippingPlaneSwitch.addEventListener("change", function(){
    if(this.checked){
        cutObject();
        return;
    }
    voxels.forEach(voxel => {
        voxel.visualObj.scale.set(1,1,1) 
    })
    
})
function toggleClippingPlane() {
    if (clippingPlaneSwitch.checked) {
        handle.material.transparent = false;
        plane.material.opacity = planeOpacity;
        dControls.activate();
        return;
    }
    handle.material.transparent = true;
    handle.material.opacity = 0;
    plane.material.opacity = 0;
    dControls.deactivate();
}

// orbit.addEventListener("start", function(e){
//     dControls.deactivate()
//     orbit.enableRotate = true

// })
// orbit.addEventListener("stop", function (e) {
//     dControls.activate()
// })

// ----- Chip Firing -----
var hasFiredRecently = false;
const firstVoxPos = firstVoxel.position;
firstBox.position.set(firstVoxPos[0], firstVoxPos[1], firstVoxPos[2]);
function animate(time){
    requestAnimationFrame(animate);

    if(isFiring){
        for(let i = 0; i < voxels.length; i++){
            var currentVoxel = voxels[i];

            var isOutsideBounds = Math.abs(currentVoxel.position[0]) > boundary || 
                                Math.abs(currentVoxel.position[1]) > boundary || 
                                Math.abs(currentVoxel.position[2]) > boundary

            if(isOutsideBounds && boundary != 0){
                isFiring = false;
                onFiringEnded()
                break;
            }

            objectWidth = Math.log10(voxels.length + 11.6222)*6.5203 - 6.15822

            if (currentVoxel.chipCount >= neighborCount) {
                hasFiredRecently = true;
                var currentNeighbors = currentVoxel.fire(getExistingNeighbors);

                if(renderWhileFiring())
                {
                createNewCube(currentNeighbors[0]);
                changeCubeColor(currentNeighbors[1]);
                changeCubeColor([currentVoxel]);
                console.log("number of voxels: " + voxels.length);
                }
                else{
                    currentNeighbors[0].forEach(newVoxel => {
                        voxels.push(newVoxel);
                    });
                    console.log("number of voxels: " + voxels.length);

                }

            }
        }
        adjustToChipcount();
        cutObject();

    }
    else
        applySettings()

    if(isInNeighborhood){
        neighborhoodRenderer.render(neighborhoodScene, neighborhoodCamera);
        return;
    }
    toggleClippingPlane();
    renderer.render(mainScene, camera);

}

function cutObject(){
    if (!clippingPlaneSwitch.checked)
        return;
    voxels.forEach(voxel => {
        if(voxel.visualObj == null)
            return;
        var planeForward = new THREE.Vector3();
        plane.getWorldDirection(planeForward);
        var planePos = new THREE.Vector3();
        plane.getWorldPosition(planePos);
        var dirToVoxel = new THREE.Vector3(
            voxel.visualObj.position.x - planePos.x,
            voxel.visualObj.position.y - planePos.y,
            voxel.visualObj.position.z - planePos.z).normalize();
        var dot = planeForward.dot(dirToVoxel);
        console.log(planePos.z);

        if(dot > 0){
            voxel.visualObj.scale.set(0, 0, 0);
            return;
        }
        voxel.visualObj.scale.set(1, 1, 1);

    });
    
}
function applySettings(){
    firstVoxel.chipCount = Number(chipInput.value)
    firstVoxel.setColor()
    changeCubeColor([firstVoxel])
    firstVoxel.background = Number(backgroundInput.value)
    boundary = Number(boundaryInput.value)
}
// -- check if chips are still firing
const delay = ms => new Promise(res => setTimeout(res, ms));
const slowTick = async () => {
    while(true){
        await delay(100);

        if (!isFiring) {
            continue;
        }
        if (hasFiredRecently) {
            hasFiredRecently = false;
            continue;
        }
        onFiringEnded();
    }
}
function onFiringEnded(){
    console.log("Firing Ended");
    fireBtn.disabled = false;
    isFiring = false;

    if(!renderWhileFiring()){
        voxels.forEach(voxel => {
            if(voxel.visualObj == null){
                createNewCube([voxel])
                return;
            }
            changeCubeColor([voxel])
        });
        cutObject();
    }
}

function createNewCube(passedVoxels = []){
    passedVoxels.forEach(voxel => {
        voxel.setColor();
        const boxGeometry = new THREE.BoxGeometry();
        const boxMaterial = new THREE.LineBasicMaterial({ color: voxel.color })
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(voxel.position[0], voxel.position[1], voxel.position[2],)
        //box.scale.set(0.00001,0.00001,0.00001);
        mainScene.add(box);
        voxel.visualObj = box;
        voxels.push(voxel);
    });
}
var getExistingNeighbors = function(position = []){
    console.log("GET EXISTING NEIGHBORS");

    var existingNeighbors = [];
    neighborOffsets.forEach(offset => {
        voxels.forEach(currentVoxel => {
            var doesMatchPosition = currentVoxel.position[0] == (position[0] + offset[0]) &&
                                currentVoxel.position[1] == (position[1] + offset[1]) &&
                                currentVoxel.position[2] == (position[2] + offset[2]);
            if (doesMatchPosition && !existingNeighbors.includes(currentVoxel)){
                existingNeighbors.push(currentVoxel);
                console.log("found neighbor");
            }
        });
    });
    console.log("Existing Neighbors: " + existingNeighbors.length);
    return existingNeighbors.filter((item, index) => existingNeighbors.indexOf(item) === index);
}
function changeCubeColor(passedVoxels = []){
    passedVoxels.forEach(voxel => {
        voxel.setColor();
        voxel.visualObj.material.color.setHex(voxel.color);
    });

}

function adjustToChipcount(){
    if(objectWidth < 4)
        return;
    handleScaler = 1+ objectWidth / 10;
    handle.scale.set(handleScaler, handleScaler, handleScaler)
    handleHeight = planeHeight * handleScaler
    handle.position.set(0, handleHeight / 2, 0)
    

}
function zoomOut(){
    var distance = Math.log10(firstVoxel.chipCount) * 1.4;
    camera.position.set(0,2/5*distance, distance);
    orbit.update();
}

slowTick();
animate();
