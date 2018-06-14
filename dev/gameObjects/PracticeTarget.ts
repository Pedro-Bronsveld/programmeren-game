class PracticeTarget extends Model{
    private down:boolean;

    private resetTimeout: number;

    constructor(level: Level, modelSource: ModelSource = new ModelSource()){
        super(level, "practice_target", modelSource);
        this.down = false;

        // set random rotation
        //this.rY = Math.random() * (Math.PI * 2);

        // time in seconds before target resets
        this.resetTimeout = 0;
    }

    public hit():number{
        if(!this.down){
            this.mesh.rotateX(Math.PI/2 - 0.2);
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
        this.mesh.rotateX( -(Math.PI/2 - 0.2) );
    }

    public update(delta: number){
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