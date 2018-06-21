class PreLoad{
    private assetsDir:string;
    private modelsDir:string;
    private levelsDir:string;
    private soundsDir:string;

    private preloadedMeshes: PreloadedStates;
    private loadedMeshes: Array<MeshData>;

    private preloadedLevels: PreloadedStates;
    private loadedLevels: Array<LevelSrcData>;

    private preloadedSounds: PreloadedStates;
    private loadedSounds: Array<SoundData>;

    private loadingScreen:LoadingScreen;

    constructor(){
        // create loading screen
        this.loadingScreen = new LoadingScreen();

        // setup paths for asset directories
        this.assetsDir = "assets";
        this.modelsDir = this.assetsDir + "/models";
        this.levelsDir = this.assetsDir + "/levels";
        this.soundsDir = this.assetsDir + "/sounds";

        this.preloadedMeshes = {};
        this.loadedMeshes = new Array<MeshData>();

        this.preloadedLevels = {};
        this.loadedLevels = new Array<LevelSrcData>();

        this.preloadedSounds = {};
        this.loadedSounds = new Array<SoundData>();

        // get model and level names from preload file
        reqwest(this.assetsDir + "/preload_list.json", (preloadData : PreloadData) => {
            // list of all models to load
            let modelNames:Array<string> = preloadData.models;
            let levelNames:Array<string> = preloadData.levels;
            let soundFiles:Array<string> = preloadData.sounds;

            // load all models
            for(let name of modelNames){
                this.preloadedMeshes[name] = false;
                this.loadMesh(name);
            }

            // load all levels
            for(let name of levelNames){
                this.preloadedLevels[name] = false;
                this.loadLevel(name);
            }

            // load all sounds
            for(let filename of soundFiles){
                this.preloadedSounds[filename] = false;
                this.loadSound(filename);
            }

            this.waitForLoad();

        });
    }

    private loadMesh(name: string):void{
        // create json loader
        let jsonLoader : THREE.JSONLoader = new THREE.JSONLoader();

        let meshSrc:string = this.modelsDir + "/" + name + "/model.json";

        jsonLoader.load(meshSrc, (geometry : THREE.Geometry, materials : any) => {
            // on mesh load

            let mesh: THREE.Mesh | THREE.SkinnedMesh;

            // create mesh from geoemtry and materials
            if(geometry.bones.length > 0){
                materials.forEach(function (material : THREE.MeshLambertMaterial | THREE.MeshPhongMaterial) {
                    material.skinning = true;
                });

                // create skinned mesh;
                mesh = new THREE.SkinnedMesh(geometry, materials);
            }
            else{
                // create a mesh
                mesh = new THREE.Mesh(geometry, materials);
            }
            mesh.name = name;

            // load extra properties for model
            let propsSrc = this.modelsDir + "/" + name + "/modelProps.json";
            reqwest(propsSrc, (modelProps : ModelProps) => {
                // set shadow properties
                mesh.castShadow = modelProps.cast_shadow;
                mesh.receiveShadow = modelProps.receive_shadow;
                
                // add mesh data to model array
                this.loadedMeshes.push( new MeshData(name, mesh, geometry) );

                this.preloadedMeshes[name] = true;

            })            

        });
    }

    private loadLevel(name:string):void{
        let levelSrc:string = this.levelsDir + "/" + name + ".json";

        // download level json data
        reqwest(levelSrc, (levelSrcData: LevelSrcData) => {

            this.loadedLevels.push( levelSrcData );

            this.preloadedLevels[name] = true;
            
        });
    }

    private loadSound(filename:string):void{
        // create audio loader
        let audioLoader: THREE.AudioLoader = new THREE.AudioLoader();

        // get sound name from file name
        let filenameArray:Array<string> = filename.split(".");
        let name:string = filenameArray.slice(0, filenameArray.length-1 ).join(".");

        // load sound file
        let soundSrc:string = this.soundsDir + "/" + filename;

        audioLoader.load( soundSrc, (buffer:THREE.AudioBuffer):void => {
            // on load
            
            // create sound data object and add it to loaded array
            this.loadedSounds.push( new SoundData(name, buffer) );
            this.preloadedSounds[filename] = true;
        }, 
        // on progress
        //function ( xhr:any ) {
        function () {
            //console.log( filename + ": " + (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        // on error
        function () {
            console.log( 'An error occured when loading' + filename );
        }
        );
    }

    private waitForLoad():void{
        // count number of items that have been loaded
        let totalItems:number = 0;
        let loadedItems:number = 0;
        // check if all models have been loaded
        for(let key in this.preloadedMeshes){
            let state = this.preloadedMeshes[key];
            totalItems++;
            if(state){
                loadedItems++;
            }
        }
        for(let key in this.preloadedLevels){
            let state = this.preloadedLevels[key];
            totalItems++;
            if(state){
                loadedItems++;
            }
        }
        for(let key in this.preloadedSounds){
            let state = this.preloadedSounds[key];
            totalItems++;
            if(state){
                loadedItems++;
            }
        }

        this.loadingScreen.update(loadedItems, totalItems);
        
        if(loadedItems < totalItems){
            requestAnimationFrame( () => this.waitForLoad() );
        }
        else{
            game = new Game(this.loadedLevels, this.loadedMeshes, this.loadedSounds);
        }
    }
}

// start game on load
window.addEventListener("load", () => new PreLoad() );