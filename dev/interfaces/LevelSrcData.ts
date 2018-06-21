interface LevelSrcData{
    name: string;
    environment_light: number;
    objects: Array<any>;
    horizon_color: RgbColor;
    player_start:{
        x:number;
        y:number;
        z:number;
    },
    level_end:{
        x:number;
        y:number;
        z:number;
        radius:number;
        use:boolean;
    },
    view_rotate:number;
}