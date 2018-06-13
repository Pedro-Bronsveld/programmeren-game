class GameObject{
    readonly name: string;
    protected propLevel: Level;
    protected objectType: string;
    readonly modelName: string;
    constructor(level: Level, name: string,  objectType: string){
        this.modelName = name;
        this.propLevel = level;
        this.name = this.uniqueName(name, this.level);
        this.objectType = objectType;
    }

    // get a name for the model that's not in use yet in a level
    protected uniqueName = (name: string, level: Level): string => {
        let uniqueName: string = name;
        let num = 0;
        
        // get all game object names already in use in the level
        let names = level.namesInUse();

        while( names.indexOf(uniqueName) != -1 ){
        // while( uniqueName in names ){
            num++;
            uniqueName = name + "." + num;
        }

        return uniqueName;
    }

    public get level():Level{
        return this.propLevel;
    }

    public get type(): string{
        return this.objectType;
    }
    

}