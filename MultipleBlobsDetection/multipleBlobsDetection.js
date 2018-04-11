//grab video element (hidden)
var video = document.getElementById('video');

var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

// Get access to the camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // audio: false - since we only want video
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {

        setLeftClickCallback(onLeftClick);

        video.srcObject = stream;

        //promise of getting stream of camera is resolved, start the animation engine
        animationEngine.start();

    });
}

function onLeftClick(){

    trackColor = getPixelRGB(this.coordinates.x, this.coordinates.y);
}

var blobs = [];

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

        drawCircle(this.x(), this.y(), Math.sqrt(this.getSize())/2 , false);
    }
}

//Declare some global vars
var width = 960;
var height = 720;
var blobColorThreshold = 30; //0-255
var blobSizeThreshold = 300; //amount of pixels found per blob
var distanceFromBlobThreshold = 50;

var trackColor = {
    r : 255,
    g : 255,
    b : 255
}

var lerpX = 0;
var lerpY = 0;
var lerpVelocity = 5;
var timesTracked = 0;

var connectedMode = true;
var maxBlobs = 10;

/**
 * The update function is called once everytime the browser renders -> 60 fps cap
 */
function update() {

    context.drawImage(video, 0, 0, width, height);

    //acquire bitmap
    let imageData = context.getImageData(0, 0, width, height);
    let pixels = imageData.data;

    traverseBitmap(pixels);

    context.putImageData(imageData, 0, 0);

    for(let i = 0; i< blobs.length; i++){

        let blob0 = blobs[i];
        let blob1 = blobs[i + 1];
        
        if(blob0.getSize() > blobSizeThreshold){

            blob0.showWithDynamicSize();

            //connect blobs with lines
            if(connectedMode && blob1){
                
                drawLine(blob0.x(), blob0.y(), blob1.x(), blob1.y());
            }
        }
        
    }

    //reset blobs
    blobs = [];
}

/**
 * Traverse pixels in a bitmap coming from canvas
 * @param {*} pixels 
 */
function traverseBitmap(pixels) {

    //increment for loops with x/y += 4, because in bitmapt [0]-R, [1]-G, [2]-B, [3]-Alpha channel
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {

            let pixIndex = (x + y * width) *4; 

            let colorDistance = rgbDistance(pixels[pixIndex], 
                pixels[pixIndex +1], 
                pixels[pixIndex +2],
                trackColor.r,
                trackColor.g,
                trackColor.b);
                
            //check if tracked color is within the Threshold 
            if (colorDistance < Math.pow(blobColorThreshold, 2)) {

                var foundBlob = blobs.find(function(blob){
 
                    return blob.isNear(x, y);
                });

                if(foundBlob){
                    foundBlob.add(x, y);
                }
                else if(blobs.length < maxBlobs){
                    let newBlob = new Blob(x, y);

                    blobs.push(newBlob);
                }
                
                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 255; // red
                pixels[pixIndex + 1] = 255; // green
                pixels[pixIndex + 2] = 255; // blue
            }
        }
    }
}