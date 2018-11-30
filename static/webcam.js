
navigator.getUserMedia({video: true, audio: true}, function(localMediaStream) {
  var video = document.querySelector('video');
  video.src = window.URL.createObjectURL(localMediaStream);

  // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
  // See crbug.com/110938.
  video.onloadedmetadata = function(e) {
    // Ready to go. Do some stuff.
  };
}, (e)=>{
  console.log('error'+e)
});

var imageScaleFactor = 0.5;
var outputStride = 16;
var flipHorizontal = false;

var imageElement = document.getElementById('cat');

posenet.load().then(function(net){
  return net.estimateSinglePose(imageElement, imageScaleFactor, flipHorizontal, outputStride)
}).then(function(pose){
  console.log(pose);
})