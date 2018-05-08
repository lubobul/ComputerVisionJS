//grab video element (hidden)
var video = document.getElementById('video');

var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

// Get access to the camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // audio: false - since we only want video
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {
        
        video.srcObject = stream;

        //promise of getting stream of camera is resolved, start the animation engine
        animationEngine.start();
    });
}

var trackColor = {
    r : 100,
    g : 255,
    b : 0
}

var connectedMode = true;
var maxBlobs = 10;

var blobSizeThreshold = 300; //amount of pixels found per blob
var distanceFromBlobThreshold = 50;

var blobs = [];

//Declare some global vars
var width = 960;
var height = 720;
var motionColorThreshold = Math.pow(100, 2); //0-255
var oldImageData = null;

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

     for(let i = 0; i< blobs.length; i++){

        let blob0 = blobs[i];
        let blob1 = blobs[i + 1];
        
        if(blob0.getSize() > blobSizeThreshold){

            blob0.showWithDynamicSizeRectangle();

            //connect blobs with lines
            if(connectedMode && blob1 && blob1.getSize() > blobSizeThreshold){
                
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
            if (colorDistance < motionColorThreshold) {
                    
                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 0; // red
                pixels[pixIndex + 1] = 0; // green
                pixels[pixIndex + 2] = 0; // blue
            }else{

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
                pixels[pixIndex    ] = trackColor.r; // red
                pixels[pixIndex + 1] = trackColor.g; // green
                pixels[pixIndex + 2] = trackColor.b; // blue
            }
        }
    }
}