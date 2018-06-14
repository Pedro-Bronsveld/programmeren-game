/// <reference path="../gameObjects/Model.ts" />


class Skybox extends Model{
    constructor(level: Level, color: number = 0x0077ff){
        super(level, "skybox");

        this.mesh.material = new THREE.MeshBasicMaterial( { color: color } );

        this.sX = 10;
        this.sY = 10;
        this.sZ = 10;
    }

    update():void{
        // set position of the skybox to that of the player
        this.posVector = this.level.player.posVector;
    }
}