class IntersectsFilter{
    readonly ignoreModels: Array<string>;
    readonly ignoreNames: Array<string>;
    private level: Level;
    constructor(level:Level, ignoreModels:Array<string>=new Array<string>(), ignoreNames:Array<string>=new Array<string>()){
        this.level = level;
        // models that should always be filtered out
        let alwaysIgnoreModels = ["bullet", "gun", "ShadowHelper", "skybox"];

        this.ignoreModels = ignoreModels.concat(alwaysIgnoreModels);
        this.ignoreNames = ignoreNames;

    }

    public check(intersects: Array<THREE.Intersection>):Array<THREE.Intersection>{
        let fileteredIntersects: Array<THREE.Intersection> = new Array<THREE.Intersection>();
        let ignoreNames: Array<string> = this.level.getNoCollisionNames();
        ignoreNames = ignoreNames.concat(this.ignoreNames);
        for(let intersect of intersects){
            if(this.ignoreModels.indexOf(intersect.object.name) == -1 && ignoreNames.indexOf(intersect.object.userData.uniqueName) == -1 ){
                fileteredIntersects.push(intersect);
            }
        }
        return fileteredIntersects;
    }
}