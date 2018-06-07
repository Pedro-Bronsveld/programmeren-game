class Utils{
    toHEX(rgb : RgbColor){
        let rgbArray : Array<number> = [rgb.r, rgb.g, rgb.b];
        let hex = "";
        for(let val of rgbArray){
            let h2 = val%16;
            let h1 = (val-h2)/16;
            let h = "0123456789ABCDEF".split("");
            hex += h[h1] + h[h2];
        }
        return hex;
    }
}
let utils : Utils = new Utils();