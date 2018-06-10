class Level{

    private scene: THREE.Scene;
    private models: Array<Model>;
    private lights: Array<Light>;
    private ambientLight: THREE.AmbientLight;
    private propSkyColor: RgbColor;
    private propGame: Game;
    private camera: PlayerCamera;
    private propPlayer: Player;
    readonly noCollisionModels: Array<string>;

    constructor(game: Game, levelName: string){
        this.propGame = game;

        //model names always ignored by collision boxes:
        this.noCollisionModels = ["bullet", "gun", "ShadowHelper", "skybox"];

        //create three js scene
        this.scene = new THREE.Scene();
        this.propSkyColor = {r: 255, g: 255, b:255};
        this.models = new Array<Model>();
        this.lights = new Array<Light>();
        
        this.propPlayer = new Player(this);
        this.camera = new PlayerCamera(this, this.player);
        this.camera.assignToRenderer(this.propGame.renderer);
        this.scene.add(this.camera.camera);
        
        //create an ambient light:
        this.ambientLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(this.ambientLight);

        //get level data by name from game object
        let levelSrcData: LevelSrcData = this.game.levelDataByName(levelName);

        //level setup using level source data:
        this.propSkyColor = levelSrcData.horizon_color;
        this.ambientLight.intensity = levelSrcData.environment_light;
        //load the objects into the level:
        for(let key in levelSrcData.objects){
            let obj : ObjectSource = levelSrcData.objects[key];
            
            //check if the model has its own class:
            if(obj.model == "turret_base"){
                //turret
                new TurretBase(this, obj);
            }
            else if(obj.model == "practice_target"){
                //practice target
                new PracticeTarget(this, obj);
            }
            else if(obj.type == 'MESH'){
                new Model(this, obj.model, obj);
            }
            else if(obj.type == "LAMP"){
                new Light(this, obj.model, obj);
            }
        }

        new Skybox(this);

    }

    //getters:
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

    public assignToRenderer(renderer: Renderer): void{
        renderer.scene = this.scene;
    }

    public get cam():PlayerCamera{
        return this.camera;
    }

    public addModelName(name: string, model:Model){
        this.models.push(model);
    }
    public addModel(model: Model): void{
        //add model to gameobjects array:
        this.addModelName(model.name, model);
        this.scene.add( model.getMesh() );
    }

    public addLight(light: Light): void{
        this.lights.push(light);
        this.scene.add(light.light);
    }

    //get model by name:
    public getModelByName(name: string):Model|null{
        for(let model of this.models){
            if(model.name == name){
                return model;
            }
        }
        return null;
    }

    //remove model:
    public removeModel(model: Model):void{
        let modelsCount:number = this.models.length;
        for(let i = 0; i < modelsCount; i++){
            if(this.models[i] == model){
                this.models.splice(i, 1);
                this.scene.remove(model.getMesh());
            }
        }
    }
    //remove model by name:
    public removeModelByName(name: string){
        let model: Model|null = this.getModelByName(name);
        if(model){
            this.removeModel(model);
        }
    }

    public namesInUse(): Array<string>{
        //returns the names of all gameobjects in the level:
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
        
        

        //update models:
        for(let model of this.models){
            model.update(delta);
        }

        //update lights:
        for(let light of this.lights ){
            light.update(delta);
        }

        this.camera.update();
        
    }
}