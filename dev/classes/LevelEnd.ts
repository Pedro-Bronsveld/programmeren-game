class LevelEnd{
    readonly use:boolean;
    private position:THREE.Vector3;
    private radius:number;
    private level:Level;
    constructor(level:Level, levelSrcData:LevelSrcData){
        this.level = level;
        this.use = levelSrcData.level_end.use;
        this.position = new THREE.Vector3(levelSrcData.level_end.x, levelSrcData.level_end.y, levelSrcData.level_end.z);
        this.radius = levelSrcData.level_end.radius;
    }

    public update():void{
        // check distance to player
        if(this.use && this.position.distanceTo(this.level.player.posVector) < this.radius){
            this.level.complete = true;
            this.level.game.menu.visible = true;
            this.level.game.renderer.unlockPointer();
        }
    }
}