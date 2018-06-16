class Utils{
    public toHEX(rgb : RgbColor):string{
        let rgbArray : Array<number> = [rgb.r, rgb.g, rgb.b];
        let hex:string = "";
        for(let val of rgbArray){
            let h2:number = val%16;
            let h1:number = (val-h2)/16;
            let h:Array<string> = "0123456789ABCDEF".split("");
            hex += h[h1] + h[h2];
        }
        return hex;
    }

}
let utils : Utils = new Utils();