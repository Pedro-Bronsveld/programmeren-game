class Level{

    private scene: THREE.Scene;
    private models: Array<Model>;
    private lights: Array<Light>;
    private ambientLight: THREE.AmbientLight;
    private propSkyColor: RgbColor;
    private propGame: Game;
    private playerCamera: PlayerCamera;
    private camera: Camera;
    private propPlayer: Player;
    readonly noCollisionModels: Array<string>;
    private noCollisionNames: Array<string>;
    private isPaused: boolean;
    readonly name: string;
    private skybox: Skybox;

    constructor(game: Game, levelName: string){
        this.propGame = game;
        this.name = levelName;

        // used to pause level update loop
        this.isPaused = false;

        // model names always ignored by collision boxes
        this.noCollisionModels = ["bullet", "gun", "ShadowHelper", "skybox"];
        this.noCollisionNames = [];

        // create three js scene
        this.scene = new THREE.Scene();
        this.propSkyColor = {r: 255, g: 255, b:255};
        this.models = new Array<Model>();
        this.lights = new Array<Light>();

        // get level data by name from game object
        let levelSrcData: LevelSrcData = this.game.levelDataByName(levelName);
        
        // create player and player camera
        this.propPlayer = new Player(this, levelSrcData.view_rotate);
        this.playerCamera = new PlayerCamera(this, this.player, levelSrcData.view_rotate);
        this.playerCamera.assignToRenderer(this.propGame.renderer);
        this.scene.add(this.playerCamera.camera);

        // create regular camera
        this.camera = new Camera(this);
        
        // create an ambient light
        this.ambientLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(this.ambientLight);

        // set player position
        this.player.pX = levelSrcData.player_start.x;
        this.player.pY = levelSrcData.player_start.y;
        this.player.pZ = levelSrcData.player_start.z;

        // level setup using level source data
        this.propSkyColor = levelSrcData.horizon_color;
        this.ambientLight.intensity = levelSrcData.environment_light;
        // load the objects into the level
        for(let key in levelSrcData.objects){
            let obj : ObjectSource = Object.create(levelSrcData.objects[key]);
            
            // check if the model has its own class
            if(obj.model == "turret_base"){
                // turret
                new TurretBase(this, obj);
            }
            else if(obj.model == "practice_target"){
                // practice target
                new PracticeTarget(this, obj);
            }
            else if(obj.type == 'MESH'){
                new Model(this, obj.model, obj);
            }
            else if(obj.type == "LAMP"){
                new Light(this, obj.model, obj);
            }
        }

        this.skybox = new Skybox(this, parseInt( "0x" + utils.toHEX(this.propSkyColor) ));

        this.assignToRenderer(this.game.renderer);

    }

    // getters and setters
    public get player():Player{
        return this.propPlayer;
    }
    public get skyColor():RgbColor{
        return this.propSkyColor;
    }

    public get game():Game{
        return this.propGame;
    }
    public getScene():THREE.Scene{
        return this.scene;
    }

    public get paused():boolean{ return this.isPaused }
    public set paused(paused:boolean){ this.isPaused = paused }

    public assignToRenderer(renderer: Renderer): void{
        renderer.scene = this.scene;
    }

    public get playerCam():PlayerCamera{
        return this.playerCamera;
    }

    public get cam():Camera{
        return this.camera;
    }

    public addModelOnly(model:Model){
        this.models.push(model);
    }
    public addModel(model: Model): void{
        // add model to gameobjects array
        this.addModelOnly(model);
        this.scene.add( model.getMesh() );
    }

    public addLight(light: Light): void{
        this.lights.push(light);
        this.scene.add(light.light);
    }

    // add name for no collision
    public addNoCollisionName(name: string):void{
        this.noCollisionNames.push(name);
    }
    public getNoCollisionNames():Array<string>{
        return this.noCollisionNames;
    }

    // get model by name
    public getModelByName(name: string):Model|null{
        for(let model of this.models){
            if(model.name == name){
                return model;
            }
        }
        return null;
    }

    // remove model
    public removeModel(model: Model):void{
        let modelsCount:number = this.models.length;
        for(let i = 0; i < modelsCount; i++){
            if(this.models[i] == model){
                this.models.splice(i, 1);
                this.scene.remove(model.getMesh());
            }
        }
    }
    // remove model by name
    public removeModelByName(name: string){
        let model: Model|null = this.getModelByName(name);
        if(model){
            this.removeModel(model);
        }
    }

    public namesInUse(): Array<string>{
        // returns the names of all gameobjects in the level
        let names: Array<string> = new Array();
        for(let model of this.models){
            names.push(model.name);
        }
        for(let light of this.lights){
            names.push(light.name);
        }
        return names;
    }

    public update(delta: number): void{

        if(!this.isPaused){
            // update models
            for(let model of this.models){
                model.update(delta);
                model.updateAlways();
            }
    
            // update lights
            for(let light of this.lights ){
                light.update();
            }
    
            this.playerCamera.update();

            this.skybox.update();
        }
        else{
            for(let model of this.models){
                model.updateAlways();
            }
        }
        
    }
}