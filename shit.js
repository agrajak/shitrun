var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width/2;
var y = canvas.height-30;
var shitSpeed = 1;
var fps = 30;
var t = 0;
var score = 0;
var paddleHeight = 10;
var paddleWidth = 30;
var paddleX = (canvas.width-paddleWidth)/2;
var rightPressed = false;
var leftPressed = false;
var shits = []
var image = new Image();		/* 이미지 객체 생성 */
image.src = "ddong.png";		/* 이미지 파일 이름 설정 */

const shitInterval = 200

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

function drawPerson() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
function makeShit(){
  shits.push({x: Math.floor(Math.random() * canvas.width), y: 0, t:t})
}
function reset(){
    t = 0
    shits = []
    score = 0
}
function drawShit(){
  shits.forEach((shit, index, o)=>{
    // 똥이 화면을 벗어난다면
    shit.y += (t-shit.t)*shitSpeed;
    if(Math.abs(shit.y-canvas.height) < paddleHeight/2 && Math.abs(shit.x-paddleX) < paddleWidth/2){
        alert('최종 점수 : '+score)
        reset()
    }

    if(shit.y > canvas.height){
      o.splice(index, 1)
      score += 20
      console.log(score)
    }
    else {
      ctx.drawImage(image, shit.x, shit.y);
    }
  })
}
function draw() {
    // draw 는 1000/fps(ms) 마다 실행된다.
    // shitInterval(ms) 마다 될라면...
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPerson();
    if(t*1000/fps%shitInterval == 0){
      makeShit(t);
    }
    drawShit();

    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
  
    t++;
}

reset()
setInterval(draw, 1000/fps);
// 현재 시간 = 1000/fps*t