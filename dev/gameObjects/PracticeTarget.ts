class PracticeTarget extends Model{
    private down:boolean;

    constructor(level: Level, modelSource: ModelSource = new ModelSource()){
        super(level, "practice_target", modelSource);
        this.down = false;

        //set random rotation:
        this.rY = Math.random() * (Math.PI * 2);
    }

    public hit():void{
        if(!this.down){
            this.mesh.rotateX(Math.PI/2 - 0.2);
            this.down = true;

            //seconds until respawn:
            let max:number = 25 * 1000;
            let min:number = 15 * 1000;

            setTimeout( () => {
                this.down = false;
                this.mesh.rotateX( -(Math.PI/2 - 0.2) );
            } , Math.random() * (max - min) + min )
        }
    }
}