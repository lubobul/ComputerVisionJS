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

//Declare some global vars
var width = 1280;
var height = 960;
var blobColorThreshold = 100; //0-255
var oldImageData = null;
var numberOfFramesBetweenCompare = 0;

/**
 * The update function is called once everytime the browser renders -> 60 fps cap
 */
function update() {

    context.drawImage(video, 0, 0, width, height);

    //acquire bitmap
    var imageData = context.getImageData(0, 0, width, height);

    if(!oldImageData){
        
        oldImageData = imageData;
    }

    traverseBitmap(imageData.data, oldImageData.data);

    oldImageData = context.getImageData(0, 0, width, height);

     // Draw the ImageData at the given (x,y) coordinates.
     context.putImageData(imageData, 0, 0);
}

/**
 * Traverse pixels in a bitmap coming from canvas
 * @param {*} pixels 
 */
function traverseBitmap(pixels, oldPixels) {

    //increment for loops with x/y += 4, because in bitmapt [0]-R, [1]-G, [2]-B, [3]-Alpha channel
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {

            let pixIndex = (x + y * width) *4; 
                
            let colorDistance = rgbDistance(
                pixels[pixIndex], 
                pixels[pixIndex +1], 
                pixels[pixIndex +2],
                oldPixels[pixIndex],
                oldPixels[pixIndex + 1],
                oldPixels[pixIndex + 2]);
                
            //check if tracked color is within the Threshold 
            if (colorDistance < Math.pow(blobColorThreshold, 2)) {
                    
                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 255; // red
                pixels[pixIndex + 1] = 255; // green
                pixels[pixIndex + 2] = 255; // blue
            }else{

                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 0; // red
                pixels[pixIndex + 1] = 0; // green
                pixels[pixIndex + 2] = 0; // blue
            }
        }
    }
}