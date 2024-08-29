import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { interfaceWidth, neighborhoodCamera} from './main.js'

export var neighborhoodScene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(5);
neighborhoodScene.add(axesHelper);

const neighborColor = 0x036ffc;
const defaultColor = 0xe8e8e8;

const neighborhoodCanvas = document.getElementById('neighborhoodCanvas');


// origin point
const sphereGeometry = new THREE.SphereGeometry();
const originSphereMaterial = new THREE.LineBasicMaterial({ color: neighborColor});
const originPoint = new THREE.Mesh(sphereGeometry, originSphereMaterial);
originPoint.scale.set(0.2,0.2,0.2)
neighborhoodScene.add(originPoint);

var pointsMap = new Map();
var pointsList = [];

// ----- Initialise neighborhood ----- 
export const originCoordinate = [2,2,2];
export var neighborOffsets = [];

/* The index of each value in the matrix below represents the respective 
    neighbor's offset in 3D space compared to this voxel's position.
    Each value stores the state of its corresponding neighbor as follows:
0 - neither is there nor should there be a neighbor at that position.
1 - once this fires, a new neighbor should be created at that position.
2 - there already exists a voxel at that position. Once this fires,
    the neighbor at that position needs to be updated.
*/
export var neighborhood = new math.matrix([[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
                                           [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
                                           [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
                                           [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
                                           [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]], "dense");

export var neighborCount = neighborOffsets.length;
positionNeighbors = function(){

    neighborOffsets.forEach(neighborOffset => {
        var selfX = originCoordinate[0];
        var selfY = originCoordinate[1];
        var selfZ = originCoordinate[2];

        var nX = neighborOffset[0];
        var nY = neighborOffset[1];
        var nZ = neighborOffset[2];
        
        try{
            this.neighborhood.set([selfX + nX, selfY + nY, selfZ + nZ], 1)
        }
        catch{
            console.log([selfX + nX, selfY + nY, selfZ + nZ]);
            console.error("Neighbor coordinate out of bounds");
        }
    });
}
// -----  ----- 

export var isInNeighborhood = false;
const mouse = new THREE.Vector2;
const raycaster = new THREE.Raycaster();
var intersects = [];
neighborhoodCanvas.addEventListener('pointermove', (e) => {
    if(!isInNeighborhood)
        return;
    mouse.set(((e.clientX - neighborhoodCanvas.offsetLeft) / neighborhoodCanvas.clientWidth) * 2 - 1, 
             -((e.clientY - neighborhoodCanvas.offsetTop) / neighborhoodCanvas.clientHeight) * 2 + 1)
    raycaster.setFromCamera(mouse, neighborhoodCamera)
    intersects = raycaster.intersectObjects(pointsList, true)
})
neighborhoodCanvas.addEventListener('mouseenter', (e) => {
    isInNeighborhood = true;
})
neighborhoodCanvas.addEventListener('mouseleave', (e) => {
    isInNeighborhood = false;
})
/* converts the coordinates of a point to a unique integer value 
    which serves as the coordinates' key in the pointsMap variable */
var getCoordKey = function (coordinates = []) {
    var x = coordinates[0];
    var y = coordinates[1];
    var z = coordinates[2];

    return ((x * 97 + y) * 223 + z).toString();
}

var linesMap = new Map();

const lineMaterial = new THREE.LineBasicMaterial({ color: "white", transparent: true, opacity: 0.1});

for(var x = -2; x <= 2; x++)
{
    for (var y = -2; y <= 2; y++){
        var points = [new THREE.Vector3(x,y,-2), new THREE.Vector3(x,y,2)];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        neighborhoodScene.add(line);
        for (var z = -2; z <= 2; z++) {
            var points = [new THREE.Vector3(-2, y, z), new THREE.Vector3(2, y, z)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            var points = [new THREE.Vector3(x, -2, z), new THREE.Vector3(x, 2, z)];
            const geometry2 = new THREE.BufferGeometry().setFromPoints(points);
            const line2 = new THREE.Line(geometry2, lineMaterial);
            neighborhoodScene.add(line2);
            neighborhoodScene.add(line);
            if ([x, y, z] == [0, 0, 0]) // skip origin
                continue;
            var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 })
            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, y, z);
            sphere.scale.set(0.1, 0.1, 0.1);
            neighborhoodScene.add(sphere);

            pointsList.push(sphere);
            var key = getCoordKey([x, y, z]);
            pointsMap.set(key, false)

            // set default neighborhood
            if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) == 1)
                selectPoint(sphere, key)

        }
    }
}


neighborhoodCanvas.addEventListener('click', (e) =>{
    try{
        let x = intersects[0].object.position.x;
        let y = intersects[0].object.position.y;
        let z = intersects[0].object.position.z;
        var key = getCoordKey([x, y, z]);
        if (math.abs(x) + math.abs(y) + math.abs(z) == 0)
            return;
        if (pointsMap.get(key) == false)
            selectPoint(intersects[0].object, key);
        else
            deselectPoint(intersects[0].object, key);
        console.log("Sphere clicked!");
    }
    catch{
        console.log("no object under mouse");
    }

})
function selectPoint(point, key){
    pointsMap.set(key, true);
    point.scale.set(0.15,0.15,0.15);
    point.material.color.setHex(neighborColor);

    const lineMaterial = new THREE.LineBasicMaterial({ color: neighborColor });
    var points = [originPoint.position, point.position];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    neighborhoodScene.add(line);
    linesMap.set(key, line);
    line.material.linewidth = 10;

    setNeighborhood([point.position.x, point.position.y, point.position.z], 1);
    console.log(point.position);
    console.log("length: " + neighborOffsets.length)
}
function deselectPoint(point, key){
    pointsMap.set(key, false);
    var line = linesMap.get(key);
    neighborhoodScene.remove(line);
    linesMap.delete(key);

    point.scale.set(0.1, 0.1, 0.1);
    point.material.color.setHex(defaultColor);
    setNeighborhood([point.position.x, point.position.y, point.position.z], 0);
}

function setNeighborhood(offsetPosition = [], state){
    let x = offsetPosition[0];
    let y = offsetPosition[1];
    let z = offsetPosition[2];

    switch(state){
        case 0:
            for (var i = 0; i < neighborOffsets.length; i++) {

                var matchingValues = 0;
                for (var dimension = 0; dimension < 3; dimension++) {
                    if (neighborOffsets[i][dimension] == offsetPosition[dimension])
                        matchingValues++;
                }
                if (matchingValues == 3) {
                    neighborOffsets.splice(i, 1);
                    break;
                }
            }
            break;
        case 1:
            neighborOffsets.push([x, y, z]);
            break;
        default: 
            console.error("invalid pointState: " + state);
    }
    neighborCount = neighborOffsets.length;
    neighborhood[x, y, z] = state;
    document.getElementById("backgroundInput").setAttribute("max", neighborCount - 1);

}