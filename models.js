class Blob {

    constructor(x, y){
        this.minx = x;
        this.miny = y;
        this.maxx = x;
        this.maxy = y;
    }

    add(x, y){

        this.minx = min(this.minx, x);
        this.miny = min(this.miny, y);
        this.maxx = max(this.maxx, x);
        this.maxy = max(this.maxy, y);
    }

    isNear(x, y){
        
        //clamp 
        let clampedx = max(min(x, this.maxx), this.minx)
        let clampedy = max(min(y, this.maxy), this.miny);

        let d = distance(clampedx, clampedy, x, y);
        
        return d < Math.pow(distanceFromBlobThreshold, 2);
    }

    x(){

        return (this.minx + this.maxx) / 2;
    }

    y(){

        return (this.miny + this.maxy) / 2;
    }

    getSize(){

        return (this.maxx - this.minx) * (this.maxy - this.miny);
    }

    showWithStaticSize(){
        
        drawCircle(this.x(), this.y(), 25, false);
    }

    showWithDynamicSize(){
        
        let radius = max(20, min(Math.sqrt(this.getSize())/2, 500));
        
        drawCircle(this.x(), this.y(), radius, false);
    }

    showWithDynamicSizeRectangle(){

        drawRect(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny);
    }
}