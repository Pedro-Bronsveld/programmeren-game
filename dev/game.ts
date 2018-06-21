/// <reference path="../node_modules/@types/three/index.d.ts" />

class Game{

    private propLevel: Level;
    private propRenderer: Renderer;
    private propClock: THREE.Clock;
    private propHud: Hud;
    private propElement: HTMLElement;
    private propMenu: Menu;
    private eventHandler: EventHandler;
    private globalSound: GlobalSound;
    private levelOrder: Array<string>;

    private levelsData: Array<LevelSrcData>;
    private meshesData: Array<MeshData>;
    private soundsData: Array<SoundData>;

    constructor(levelsData: Array<LevelSrcData>, meshesData: Array<MeshData>, soundsData:Array<SoundData>){
        this.levelsData = levelsData;
        this.meshesData = meshesData;
        this.soundsData = soundsData;
        this.propElement = <HTMLElement>document.getElementsByTagName("game")[0];

        this.eventHandler = new EventHandler();

        // renderer
        this.propRenderer = new Renderer();
        // menu
        this.propMenu = new Menu(this);
        
        // set order of levels
        this.levelOrder = ["main_menu", "level_0", "level_1", "level_2", "level_3"];

        // hud
        this.propHud = new Hud(this);

        // global sound
        this.globalSound = new GlobalSound(this);

        // level
        // this.propLevel = new Level(this, "level_1");
        this.propLevel = new MainMenu(this);
        // this.propLevel.assignToRenderer(this.propRenderer);

        // clock
        this.propClock = new THREE.Clock();

        // start gameloop
        this.gameloop();
    }

    // getters
    public get level():Level{ return this.propLevel };
    public get renderer():Renderer{ return this.propRenderer };
    public get clock():THREE.Clock{ return this.propClock };
    public get element():HTMLElement{ return this.propElement };
    public get hud():Hud{ return this.propHud };
    public get menu():Menu{ return this.propMenu };
    public get events():EventHandler{ return this.eventHandler };
    public get sound():GlobalSound{ return this.globalSound };

    // get level data by level name
    public levelDataByName(name: string):LevelSrcData{
        let errorNum:number = 0;
        let i:number = 0;
        for(let levelData of this.levelsData){
            if(levelData.name == name){
                return levelData;
            }
            else if(levelData.name == "error_level"){
                errorNum = i;
            }
            i++;
        }
        return this.levelsData[errorNum];
    }

    // get mesh data by name
    public meshDataByName(name: string):MeshData{
        let errorNum:number = 0;
        let i:number = 0;
        for(let meshData of this.meshesData){
            if(meshData.name == name){
                return meshData;
            }
            else if(meshData.name == "error"){
                errorNum = i;
            }
            i++;
        }
        return this.meshesData[errorNum];
    }

    // get sound data by name
    public soundDataByName(name:string):SoundData{
        let errorNum:number = 0;
        let i:number = 0;
        for(let soundData of this.soundsData){
            if(soundData.name == name){
                return soundData;
            }
            else if(soundData.name == "error"){
                errorNum = i;
            }
            i++;
        }
        return this.soundsData[errorNum];
    }

    // check what level comes after a level
    public checkNextLevel(level:string):string{
        let levelIndex:number = this.levelOrder.indexOf(level);
        levelIndex = (levelIndex+1) % this.levelOrder.length;
        return this.levelOrder[levelIndex];
    }

    public loadLevel(name: string):void{
        if(name == "main_menu"){
            this.propLevel = new MainMenu(this);
        }
        else{
            this.propLevel = new Level(this, name);
            // this.propLevel.assignToRenderer(this.propRenderer);
            this.renderer.lockPointer();
        }
    }

    gameloop = () =>{
        
        // time in seconds passed between frames
        let delta = this.propClock.getDelta();

        this.level.update(delta);
        
        this.renderer.update();

        this.hud.update();

        this.menu.update();

        requestAnimationFrame( () => this.gameloop() );
    }

}