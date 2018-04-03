'use strict'

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

//grabing canvas
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

//Get Canvas Coordinates on click
canvas.addEventListener("mousedown", mouseDown, false);

function mouseDown(e)
{
    if (e.button === 2)
    { //right click 
     
    }
    else
    {
        let coordinates = getMouseCoordinates(e);

        trackColor = getPixelRGB(coordinates.x, coordinates.y);
    }
}

function getMouseCoordinates(e)
{
    var x;
    var y;

    if (e.pageX || e.pageY)
    {
        x = e.pageX;
        y = e.pageY;
    }
    else
    {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return {x, y}
}

var width = 1280;
var height = 960;
var blobColorThreshold = 20; //0-255
var timesTrackedThreshold = 20; //amount of pixels found

var trackColor = {
    r : 0,
    g : 0,
    b : 0
}

//The update function is called once everytime the browser renders -> 60 fps cap
function update() {

    //invert on X axis, we want to have a mirror
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, -width, height);
    context.restore();

    //acquire bitmap
    var imageData = context.getImageData(0, 0, width, height);
    var pixels = imageData.data;

    traverseBitmap(pixels);

    // Draw the ImageData at the given (x,y) coordinates.
    context.putImageData(imageData, 0, 0);

    if(timesTracked>20){
        drawOval(avarageBlogPosition_x, avarageBlogPosition_y, 50);
    }

    timesTracked = 0;
    avarageBlogPosition_x = 0;
    avarageBlogPosition_y = 0;
}

var avarageBlogPosition_x = 0;
var avarageBlogPosition_y = 0;
var timesTracked = 0;

function traverseBitmap(pixels) {

    for (let x = 0, n = width * 4; x < n; x += 4) {
        for (let y = 0, m = height * 4; y < m; y += 4) {

            let pixIndex = x + y * width;

            let colorDistance = distanceSquared(pixels[pixIndex], 
                pixels[pixIndex +1], 
                pixels[pixIndex +2],
                trackColor.r,
                trackColor.g,
                trackColor.b);
                
            //check if tracked color is within the Threshold 
            if (colorDistance < Math.pow(blobColorThreshold,2)) {
                
                avarageBlogPosition_x += x;
                avarageBlogPosition_y += y;
                timesTracked++;
                
                pixels[pixIndex    ] = 255; // red
                pixels[pixIndex + 1] = 255; // green
                pixels[pixIndex + 2] = 255; // blue
            }
        }
    }

   
    avarageBlogPosition_x = (avarageBlogPosition_x/4) /timesTracked;
    avarageBlogPosition_y = (avarageBlogPosition_y/4) /timesTracked;
}

function distanceSquared(r1, g1, b1, r2, g2, b2) {

    return (r2-r1)*(r2-r1) + (g2-g1)*(g2-g1) +(b2-b1)*(b2-b1);
}

function getPixelRGB(x, y){

    var imageData = context.getImageData(0, 0, width, height);
    var pixels = imageData.data;

    let pixIndex = x*4 + y*4 * width;

    return {
        r: pixels[pixIndex],
        g: pixels[pixIndex + 1],
        b: pixels[pixIndex + 2]
    }
}

function drawOval(x, y, radius){

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
}
