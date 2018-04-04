/**
 * This is an example with ImageCapture and grabFrame promise
 * This works well, except that the promise wrapping the bitmap 
 * results in a memorry leak, because it is not meat to be called on every render event (fps)
 */

var imageCapture = null;

var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true, audio: false}).then(function(stream) {
        
        let track = stream.getVideoTracks()[0];

        track.applyConstraints({
            width: 1920,
            height: 1080,
            aspectRatio: 1.777777778
          });

        imageCapture = new ImageCapture(track);

        animationEngine.start();
    
    });
}

// Elements for taking the snapshot
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var grabFrameDone = true;

function update(){

    if(grabFrameDone){
        grabFrameDone = false;


        var framePromise = imageCapture.grabFrame(); 
        
        framePromise.then((imageBitmap) => {

            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            context.drawImage(imageBitmap, 0, 0);
            
            imageBitmap = null;
            grabFrameDone = true;
        });

        framePromise = null;
        
    }
    
}