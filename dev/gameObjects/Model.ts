/// <reference path="GameObject.ts" />


class Model extends GameObject{
    protected mesh: THREE.SkinnedMesh | THREE.Mesh;
    private modelSource: ModelSource;
    protected actions: Actions;
    private mixer: THREE.AnimationMixer;
    private playingAction: string;
    protected tween: Tween;

    constructor(level: Level, meshName: string, modelSource: ModelSource = new ModelSource(), autoAdd:boolean=true){
        super(level, meshName, "Model");
        
        // get mesh data
        let meshData: MeshData = level.game.meshDataByName(meshName);
        this.mesh = meshData.mesh;
        let geometry: THREE.Geometry = meshData.geometry;

        // tween functions
        this.tween = new Tween;

        // set name of mesh
        this.mesh.userData.uniqueName = this.name;

        // setup animation actions
        this.mixer = new THREE.AnimationMixer(this.mesh);
        this.actions = {};
        this.playingAction = "";

        if(typeof geometry.animations !== 'undefined'){
            let animationCount = geometry.animations.length;
            for(let i : number = 0; i < animationCount; i++){
                let animationClip : THREE.AnimationClip = geometry.animations[i];
                let action = this.mixer.clipAction(animationClip);
                action.setEffectiveWeight(1);
                action.enabled = true;
                this.actions[animationClip.name] = action;
            }
            
        }

        // set model name in source data
        modelSource.model = this.name;
        this.modelSource = modelSource;

        // add model to level if autoadd is true
        if(autoAdd){
            this.level.addModel(this);
        }
        else{
            this.level.addModelOnly(this);
        }

        // position mesh
        this.posVector = new THREE.Vector3(this.modelSource.location.x, this.modelSource.location.y, this.modelSource.location.z);
        this.rotVector = new THREE.Vector3(this.modelSource.rotation.x, this.modelSource.rotation.y, this.modelSource.rotation.z);
        this.scaleVector = new THREE.Vector3(this.modelSource.scale.x, this.modelSource.scale.y, this.modelSource.scale.z);
        
    }

    public hit(damage:number):number{
        // ignoring error code by doing this
        damage = damage;
        // return number of seconds before bullet should despawn
        return 1;
    }

    public getMesh():THREE.Mesh | THREE.SkinnedMesh{
        return this.mesh;
    }

    public set material(material: THREE.Material){
        this.mesh.material = material;
    }

    // position
    public get pX():number{ return this.mesh.position.x };
    public get pY():number{ return this.mesh.position.y };
    public get pZ():number{ return this.mesh.position.z };

    public set pX(x: number){ this.mesh.position.x = x };
    public set pY(y: number){ this.mesh.position.y = y };
    public set pZ(z: number){ this.mesh.position.z = z };

    public get posVector():THREE.Vector3{ return new THREE.Vector3(this.pX, this.pY, this.pZ); }
    public set posVector(vector3:THREE.Vector3){
        this.pX = vector3.x;
        this.pY = vector3.y;
        this.pZ = vector3.z;
    }

    // rotation
    public get rX():number{ return this.mesh.rotation.x };
    public get rY():number{ return this.mesh.rotation.y };
    public get rZ():number{ return this.mesh.rotation.z };

    public set rX(x: number){ this.mesh.rotation.x = x };
    public set rY(y: number){ this.mesh.rotation.y = y };
    public set rZ(z: number){ this.mesh.rotation.z = z };

    public get rotVector():THREE.Vector3{ return new THREE.Vector3(this.rX, this.rY, this.rZ); }
    public set rotVector(vector3:THREE.Vector3){
        this.rX = vector3.x;
        this.rY = vector3.y;
        this.rZ = vector3.z;
    }

    // scale
    public get sX():number{ return this.mesh.scale.x };
    public get sY():number{ return this.mesh.scale.y };
    public get sZ():number{ return this.mesh.scale.z };

    public set sX(x: number){ this.mesh.scale.x = x };
    public set sY(y: number){ this.mesh.scale.y = y };
    public set sZ(z: number){ this.mesh.scale.z = z };

    public get scaleVector():THREE.Vector3{ return new THREE.Vector3(this.sX, this.sY, this.sZ); }
    public set scaleVector(vector3:THREE.Vector3){
        this.sX = vector3.x;
        this.sY = vector3.y;
        this.sZ = vector3.z;
    }

    // visible
    public get visible():boolean{ return this.mesh.visible };
    public set visible(visible:boolean){ this.mesh.visible = visible };

    // get world matrix from mesh
    public getWorldMatrix():THREE.Matrix4{
        return this.mesh.matrixWorld;
    }

    // stop any action of the model that is playing
    private stopAction(name: string):void{
        for(let key in this.actions){
            if(key == name){
                this.actions[key].stop();
            }
        }
    }

    // play an action
    protected playAction(name: string, repetitions:number=Infinity, fade:boolean=true):void{
        if(name != this.playingAction){
            for(let key in this.actions){
                if(key == name){
                    if(fade){
                        let from: THREE.AnimationAction;
                        
                        if(typeof this.actions[this.playingAction] !== "undefined"){
                            from = this.actions[this.playingAction].play();
                        }
                        else{
                            from = this.actions[key];
                        }
                        
                        let to: THREE.AnimationAction = this.actions[key].play();
                        to.reset();
    
                        to.repetitions = repetitions;
                        if(to.repetitions != Infinity){
                            to.clampWhenFinished = true;
                        }
    
                        from.crossFadeTo(to, 0.2, true);                        
                    }
                    else{
                        this.stopAction(this.playingAction);
                        this.actions[key].play();
                    }
                    this.playingAction = name;
                }
            }
        }
    }

    // set action time scale
    protected actionTimeScale(name:string, scale:number=1):void{
        for(let key in this.actions){
            if(key == name){
                this.actions[key].timeScale = scale;
            }
        }
    }

    // update in game loop
    public update(delta:number):void{
        // update animation
        this.mixer.update(delta);
    }

    // update even when game is paused
    public updateAlways():void{}
}