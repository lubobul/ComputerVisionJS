
'use strict'

var video = document.getElementById('video');

var imageCapture = null;

var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true, audio: false}).then(function(stream) {

        video.srcObject = stream;

        animationEngine.start();
    });
}

// Elements for taking the snapshot
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var grabFrameDone = true;

function update(){

    context.save();
    context.scale(-1,1); 
    context.drawImage(video, 0, 0, -1280, 960);
    context.restore();
    
    var imageData = context.getImageData(0, 0, 1280, 960);
    var pixels = imageData.data;

    // Loop over each pixel and invert the color.
    for (var i = 0, n = pixels.length; i < n; i += 4) {
        pixels[i  ] = 255 - pixels[i  ]; // red
        pixels[i+1] = 255 - pixels[i+1]; // green
        pixels[i+2] = 255 - pixels[i+2]; // blue
        // i+3 is alpha (the fourth element)
    }

    // Draw the ImageData at the given (x,y) coordinates.
    context.putImageData(imageData, 0, 0);

}

function findBlob(imageData){

}