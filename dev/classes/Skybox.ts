/// <reference path="../gameObjects/Model.ts" />


class Skybox extends Model{
    constructor(level: Level){
        super(level, "skybox");

        this.mesh.material = new THREE.MeshBasicMaterial( { color: 0x0077ff } );

        this.sX = 3;
        this.sY = 3;
        this.sZ = 3;
    }
}