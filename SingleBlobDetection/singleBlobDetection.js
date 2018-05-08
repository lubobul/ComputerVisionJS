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
var blobColorThreshold = Math.pow(30, 2); //0-255
var timesTrackedThreshold = 1; //amount of pixels found

var trackColor = {
    r : 255,
    g : 255,
    b : 255
}

var avarageBlobPosition_x = 0;
var avarageBlobPosition_y = 0;
var lerpX = 0;
var lerpY = 0;
var lerpVelocity = 5;
var timesTracked = 0;

/**
 * The update function is called once everytime the browser renders -> 60 fps cap
 */
function update() {

    context.drawImage(video, 0, 0, width, height);

    //acquire bitmap
    var imageData = context.getImageData(0, 0, width, height);
    var pixels = imageData.data;

    traverseBitmap(pixels);

    // Draw the ImageData at the given (x,y) coordinates.
    context.putImageData(imageData, 0, 0);

    if(timesTracked > timesTrackedThreshold){

        //Linear interpolation step = deltaTime(coming from animationEngine) * lerpVelocity
        lerpX = lerp(lerpX, avarageBlobPosition_x, this.deltaTime * lerpVelocity);
        lerpY = lerp(lerpY, avarageBlobPosition_y, this.deltaTime * lerpVelocity);

        drawCircle(lerpX, lerpY, 40, true);
    }

    timesTracked = 0;
    avarageBlobPosition_x = 0;
    avarageBlobPosition_y = 0;
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
            if (colorDistance < blobColorThreshold) {
                
                avarageBlobPosition_x += x;
                avarageBlobPosition_y += y;
                timesTracked++;
                
                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 255; // red
                pixels[pixIndex + 1] = 255; // green
                pixels[pixIndex + 2] = 255; // blue
            }
        }
    }

    //find avarage for blob x and y, devide by 4 because of bitmap size
    avarageBlobPosition_x = (avarageBlobPosition_x) /timesTracked;
    avarageBlobPosition_y = (avarageBlobPosition_y) /timesTracked;
}