/// <reference path="../gameObjects/GameObject.ts" />

class Camera extends GameObject{
    public camera: THREE.PerspectiveCamera;
    //protected orbit: THREE.OrbitControls;
    constructor(level: Level, name:string="Camera", position:THREE.Vector3=new THREE.Vector3(), rotation:THREE.Vector3=new THREE.Vector3()){
        super(level, name, "Camera");
        //create camera:
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.09, 1000);
        //this.orbit = new THREE.OrbitControls(this.camera);
        
        this.camera.rotation.x = rotation.x;
        this.camera.rotation.y = rotation.y;
        this.camera.rotation.z = rotation.z;

        //set position and rotation:
        this.camera.position.set(position.x, position.y, position.z);

        window.addEventListener("resize", this.setSize);

    }

    public getRotation():THREE.Euler{
        return this.camera.rotation;
    }

    protected setSize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    public assignToRenderer(renderer: Renderer): void{
        renderer.camera = this.camera;
    }

    public update(){
        //this.orbit.update();
        //console.log(this.camera.position);
    }

    //position:
    public get pX():number{ return this.camera.position.x };
    public get pY():number{ return this.camera.position.y };
    public get pZ():number{ return this.camera.position.z };

    public set pX(x: number){ this.camera.position.x = x };
    public set pY(y: number){ this.camera.position.y = y };
    public set pZ(z: number){ this.camera.position.z = z };

    public get posVector():THREE.Vector3{ return new THREE.Vector3(this.pX, this.pY, this.pZ); }
    public set posVector(vector3:THREE.Vector3){
        this.pX = vector3.x;
        this.pY = vector3.y;
        this.pZ = vector3.z;
    }

    //rotation:
    public get rX():number{ return this.camera.rotation.x };
    public get rY():number{ return this.camera.rotation.y };
    public get rZ():number{ return this.camera.rotation.z };

    public set rX(x: number){ this.camera.rotation.x = x };
    public set rY(y: number){ this.camera.rotation.y = y };
    public set rZ(z: number){ this.camera.rotation.z = z };

    public get rotVector():THREE.Vector3{ return new THREE.Vector3(this.rX, this.rY, this.rZ); }
    public set rotVector(vector3:THREE.Vector3){
        this.rX = vector3.x;
        this.rY = vector3.y;
        this.rZ = vector3.z;
    }

}