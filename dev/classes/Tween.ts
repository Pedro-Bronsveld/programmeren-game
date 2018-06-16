class Tween{

    public radians(from:number, to:number, step:number):number{
        step = Math.abs(step);
        
        // get positive value of radians
        function mod(n:number, m:number):number{
            return ((n % m) + m) % m;
        }
        
        // normalize radians
        from = mod(from, Math.PI*2);
        to = mod(to, Math.PI*2);
        
        // calculate shortest difference between points
        let difference:number = Math.abs(to - from);
        if(difference > Math.PI){
            difference = (2*Math.PI) - difference;
        }
        
        // determine direction of rotation
        let dir:number = 1;
        if(to > from && to - from > Math.PI || from > to && from - to < Math.PI){
            dir = -1;
        }
        
        // set new radian value
        let newRad:number;
        if(difference < step){
            newRad = to;
        }
        else{
            newRad = from + step * dir;
        }
        
        return mod(newRad, Math.PI*2);
    }

    public number(from:number, to:number, step:number):number{
        step = Math.abs(step);
        
        // set direction
        let dir = 1;
        if(to < from){
            dir = -1;
        }
        
        // calculate difference
        let difference:number = Math.abs(to - from);
        
        // return new number
        if(difference < step){
            return to;
        }
        else{
            return from + (step * dir);
        }
    }

}