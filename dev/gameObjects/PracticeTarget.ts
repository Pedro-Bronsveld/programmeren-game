class PracticeTarget extends Model{
    private down:boolean;
    private rotationSpeed:number;

    private rotationX:number;
    private rotationXUp:number;
    private rotationXDown:number;
    
    private rotationY:number;

    private resetTimeout: number;

    constructor(level: Level, modelSource: ModelSource = new ModelSource()){
        super(level, "practice_target", modelSource);
        this.down = false;
        this.rotationX = 0;
        this.rotationXUp = 0;
        this.rotationXDown = Math.PI/2-0.2;

        this.rotationSpeed = 2*Math.PI;

        // default rotation
        this.rotationY = this.rY;

        // time in seconds before target resets
        this.resetTimeout = 0;
    }

    public hit():number{
        if(!this.down){
            this.down = true;

            // seconds until respawn
            let max:number = 25;
            let min:number = 15;

            this.resetTimeout = (Math.random() * (max - min) + min);
        }
        return 0.1;
    }

    private reset():void{
        this.down = false;
    }

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

        this.mesh.rotateOnWorldAxis( new THREE.Vector3(0,1,0), this.rotationY )

        if(this.resetTimeout > 0){
            this.resetTimeout -= delta;
        }
        if(this.resetTimeout < 0){
            this.resetTimeout = 0;
        }

        // check if target needs to be reset
        if(this.resetTimeout == 0 && this.down){
            this.reset();
        }

    }
}