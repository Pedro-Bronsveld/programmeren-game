class IntersectsFilter{
    private ignoreModels: Array<string>;
    private ignoreNames: Array<string>;
    constructor(ignoreModels:Array<string>=new Array<string>(), ignoreNames:Array<string>=new Array<string>()){
        //models that should always be filtered out
        let alwaysIgnoreModels = ["bullet", "gun", "ShadowHelper", "skybox"];

        this.ignoreModels = ignoreModels.concat(alwaysIgnoreModels);
        this.ignoreNames = ignoreNames;

    }

    public check(intersects: Array<THREE.Intersection>):Array<THREE.Intersection>{
        let fileteredIntersects: Array<THREE.Intersection> = new Array<THREE.Intersection>();
        for(let intersect of intersects){
            if(this.ignoreModels.indexOf(intersect.object.name) == -1 && this.ignoreNames.indexOf(intersect.object.userData.uniqueName) == -1 ){
                fileteredIntersects.push(intersect);
            }
        }
        return fileteredIntersects;
    }
}