/// <reference path="../node_modules/@types/three/index.d.ts" />

class Game{

    private propLevel: Level;
    private propRenderer: Renderer;
    private propClock: THREE.Clock;
    private propHud: Hud;
    private propElement: HTMLElement;
    private propMenu: Menu;
    private eventManager: EventManager;

    private levelsData: Array<LevelSrcData>;
    private meshesData: Array<MeshData>;

    constructor(levelsData: Array<LevelSrcData>, meshesData: Array<MeshData>){
        this.levelsData = levelsData;
        this.meshesData = meshesData;
        this.propElement = <HTMLElement>document.getElementsByTagName("game")[0];

        this.eventManager = new EventManager();

        //renderer
        this.propRenderer = new Renderer();
        //hud:
        this.propHud = new Hud(this);
        //menu:
        this.propMenu = new Menu(this);

        //level
        //this.propLevel = new Level(this, "level_1");
        this.propLevel = new MainMenu(this);
        //this.propLevel.assignToRenderer(this.propRenderer);

        //clock:
        this.propClock = new THREE.Clock();

        //start gameloop
        this.gameloop();
    }

    //getters:
    public get level():Level{ return this.propLevel };
    public get renderer():Renderer{ return this.propRenderer };
    public get clock():THREE.Clock{ return this.propClock };
    public get element():HTMLElement{ return this.propElement };
    public get hud():Hud{ return this.propHud };
    public get menu():Menu{ return this.propMenu };
    public get events():EventManager{ return this.eventManager };

    public getRenderer():Renderer{return this.propRenderer;}

    //get level data by level name:
    public levelDataByName(name: string):LevelSrcData{
        for(let levelData of this.levelsData){
            if(levelData.name == name){
                return levelData;
            }
        }
        return this.levelsData[0];
    }

    //get mesh data by name:
    public meshDataByName(name: string):MeshData{
        for(let meshData of this.meshesData){
            if(meshData.name == name){
                return meshData;
            }
        }
        return this.meshesData[0];
    }

    public loadLevel(name: string):void{
        this.propLevel = new Level(this, name);
        //this.propLevel.assignToRenderer(this.propRenderer);
        this.renderer.lockPointer();
    }

    gameloop = () =>{
        
        //time in seconds passed between frames:
        let delta = this.propClock.getDelta();

        this.level.update(delta);
        
        this.renderer.update();

        this.menu.update();

        this.hud.update();

        requestAnimationFrame( () => this.gameloop() );
    }

}