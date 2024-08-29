import * as THREE from 'three';
import { forEach, matrix, Matrix } from "mathjs";
import { neighborCount, neighborOffsets, originCoordinate} from './neighborhood';

export function voxel(chipCount, position = [], background, visualObj){
    this.chipCount = chipCount;
    this.position = position;
    this.background = background;
    this.visualObj = visualObj;
    this.color = 0x0000ff;
    this.setColor = function(){
        switch (this.chipCount) {
            case 0:
                this.color = 0xffffff;
                break;
            case 1:
                this.color = 0x0000ff;
                break;
            case 2:
                this.color = 0x00ffff;
                break;
            case 3:
                this.color = 0x00ff00;
                break;
            case 4:
                this.color = 0xffff00;
                break;
            case 5:
                this.color = 0xff7700;
                break;
            default:
                this.color = 0xff0000;
        }
    }



    this.neighbors = [];
    this.fire = function(getExistingNeighborsCallback = []){
        var existingNeighbors = getExistingNeighborsCallback(this.position);

        existingNeighbors.forEach(element => {
            if(!this.neighbors.includes(element)){
                this.neighbors.push(element);
            }
        });

        console.log("Lengthh " + this.neighbors.length);

        var remainingChips = this.chipCount % neighborCount;
        var chipsPerNeighbor = (this.chipCount - remainingChips) / neighborCount;
        console.log("remaining chips: " + remainingChips);
        console.log("chips per neighbor: " + chipsPerNeighbor);

        var newNeighbors = [];
        var neighborsToChange = [];

        console.log("neighbors count: " + this.neighbors.length);
        this.neighbors.forEach(existingNeighbor => {
            existingNeighbor.chipCount += chipsPerNeighbor;
            neighborsToChange.push(existingNeighbor);
        });
        var newPositions = [];
        console.log("neighborOffsets length: " + neighborOffsets.length)
        neighborOffsets.forEach(currentNOffset => {
            var selfX = originCoordinate[0];
            var selfY = originCoordinate[1];
            var selfZ = originCoordinate[2];
            var nX = currentNOffset[0];
            var nY = currentNOffset[1];
            var nZ = currentNOffset[2];
            var nPos = [this.position[0] + nX, this.position[1] + nY, this.position[2] + nZ]
            var currentNIndex = [selfX + nX, selfY + nY, selfZ + nZ];

            var hasFoundElement = false;
            this.neighbors.forEach(element => {
                var doesMatch = 
                    element.position[0] == nPos[0] &&
                    element.position[1] == nPos[1] &&
                    element.position[2] == nPos[2];
                if(doesMatch)
                    hasFoundElement = true;
            });

            if(hasFoundElement)
                return;

            newPositions.push(nPos);

            var newVoxel = new voxel(chipsPerNeighbor + this.background, nPos, this.background, null);
            newNeighbors.push(newVoxel);
            this.neighbors.push(newVoxel);
        });

        this.chipCount = remainingChips;
        this.neighbors.concat(newNeighbors);
        return ([newNeighbors, neighborsToChange]);
    }


}