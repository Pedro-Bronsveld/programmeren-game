class TurretBase extends Model{
    private top: TurretTop;
    constructor(level: Level, modelSource: ModelSource = new ModelSource()){
        super(level, "turret_base", modelSource);

        //add top of turret to base:
        this.top = new TurretTop(level, this);
        let topPos: THREE.Vector3 = this.posVector;
        topPos.y += 8.7;
        this.top.posVector = topPos;
    }

    public hit():void{
        this.top.hit();
    }
}