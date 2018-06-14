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
    view_rotate:number;
}