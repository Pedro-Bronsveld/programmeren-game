class TriggerTarget extends Model{
    private down:boolean;
    private rotationSpeed:number;

    private rotationX:number;
    private rotationXUp:number;
    private rotationXDown:number;
    
    private rotationY:number;

    constructor(level: Level, modelSource: ModelSource = new ModelSource()){
        super(level, "trigger_target", modelSource);
        this.down = false;
        this.rotationX = 0;
        this.rotationXUp = 0;
        this.rotationXDown = Math.PI;

        this.rotationSpeed = 2*Math.PI;

        // default rotation
        this.rotationY = this.rY;
    }

    public hit():number{
        if(!this.down){
            this.down = true;

        }
        return 0.1;
    }

    public get isDown():boolean{
        return this.down;
    }

    /*
    private reset():void{
        this.down = false;
    }
    */

    public update(delta: number){

        this.rotVector = new THREE.Vector3();

        let newRotation: number;
        if(this.down){
            newRotation = this.rotationXDown;
        }
        else{   
            newRotation = this.rotationXUp;
        }

        this.rotationX = this.tween.radians(this.rotationX, newRotation, this.rotationSpeed * delta);
        this.mesh.rotateOnWorldAxis( new THREE.Vector3(1,0,0), this.rotationX );

        this.mesh.rotateOnWorldAxis( new THREE.Vector3(0,1,0), this.rotationY );

    }
}