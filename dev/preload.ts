class PreLoad{
    private assetsDir:string;
    private modelsDir:string;
    private levelsDir:string;

    private preloadedMeshes: PreloadedStates;
    private loadedMeshes: Array<MeshData>;

    private preloadedLevels: PreloadedStates;
    private loadedLevels: Array<LevelSrcData>;

    constructor(){
        //setup paths for asset directories:
        this.assetsDir = "assets";
        this.modelsDir = this.assetsDir + "/models";
        this.levelsDir = this.assetsDir + "/levels";

        this.preloadedMeshes = {};
        this.loadedMeshes = new Array<MeshData>();

        this.preloadedLevels = {};
        this.loadedLevels = new Array<LevelSrcData>();

        //get model and level names from preload file:
        reqwest(this.assetsDir + "/preload_list.json", (preloadData : PreloadData) => {
            //list of all models to load:
            let modelNames:Array<string> = preloadData.models;
            let levelNames:Array<string> = preloadData.levels;

            //load all models:
            for(let name of modelNames){
                this.preloadedMeshes[name] = false;
                this.loadMesh(name);
            }

            for(let name of levelNames){
                this.preloadedLevels[name] = false;
                this.loadLevel(name);
            }

            this.waitForLoad();

        });
    }

    private loadMesh(name: string){
        //create json loader
        let jsonLoader : THREE.JSONLoader = new THREE.JSONLoader();

        let meshSrc = this.modelsDir + "/" + name + "/model.json";

        jsonLoader.load(meshSrc, (geometry : THREE.Geometry, materials : any) => {
            //on mesh load:

            let mesh: THREE.Mesh | THREE.SkinnedMesh;

            //create mesh from geoemtry and materials:
            if(geometry.bones.length > 0){
                materials.forEach(function (material : THREE.MeshLambertMaterial | THREE.MeshPhongMaterial) {
                    material.skinning = true;
                });

                //create skinned mesh;
                mesh = new THREE.SkinnedMesh(geometry, materials);
            }
            else{
                //create a mesh:
                mesh = new THREE.Mesh(geometry, materials);
            }
            mesh.name = name;

            //load extra properties for model:
            let propsSrc = this.modelsDir + "/" + name + "/modelProps.json";
            reqwest(propsSrc, (modelProps : ModelProps) => {
                //set shadow properties:
                mesh.castShadow = modelProps.cast_shadow;
                mesh.receiveShadow = modelProps.receive_shadow;
                
                //add mesh data to model array:
                this.loadedMeshes.push( new MeshData(name, mesh, geometry) );

                this.preloadedMeshes[name] = true;

            })            

        });
    }

    private loadLevel(name:string){
        let levelSrc = this.levelsDir + "/" + name + ".json";

        //download level json data
        reqwest(levelSrc, (levelSrcData: LevelSrcData) => {

            this.loadedLevels.push( levelSrcData );

            this.preloadedLevels[name] = true;
            
        });
    }

    private waitForLoad(){
        let loadingDone = () => {
            //check if all models have been loaded:
            for(let key in this.preloadedMeshes){
                let state = this.preloadedMeshes[key];
                if(!state){
                    return false
                }
            }
            for(let key in this.preloadedLevels){
                let state = this.preloadedLevels[key];
                if(!state){
                    return false
                }
            }
            return true
        }
        
        if(!loadingDone()){
            requestAnimationFrame( () => this.waitForLoad() );
        }
        else{
            game = new Game(this.loadedLevels, this.loadedMeshes);
        }
    }
}

//start game on load:
window.addEventListener("load", () => new PreLoad() );