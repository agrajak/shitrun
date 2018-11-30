var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var shitSpeed = 1; // 똥 속도 배율
var fps = 30; // 화면 주사율
var t = 0; // 시간(clock)
var score = 0;

// 플레이어 상태
var paddleHeight = 10;
var paddleWidth = 30;
var paddleX;

var rightPressed = false;
var leftPressed = false;
var shits = []

const PLAYING = 0
const PAUSE = 1
const MENU = 2
const DEAD = 3

var status = 0

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
    if(e.keyCode == 80) { // P키
        if(status == PLAYING) status = PAUSE
        else status = PLAYING
    }
    if(e.keyCode == 78){ // N키
        reset()
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
    t = score = 0
    shits = []
    status = PLAYING
    paddleX = (canvas.width-paddleWidth)/2
}
function drawShit(){
  shits.forEach((shit, index, o)=>{
    shit.y += (t-shit.t)*shitSpeed;
    // 똥에 맞았을때
    if(Math.abs(shit.y-canvas.height) < paddleHeight/2 && Math.abs(shit.x-paddleX) < paddleWidth/2){
        alert('최종 점수 : '+score+', 다시 시작하려면 N키를 누르시오')
        status = DEAD
        return
    }

    // 똥이 화면을 벗어난다면
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
    if(status != PLAYING){
        return
    }
    // draw 는 1000/fps(ms) 마다 실행된다.
    // shitInterval(ms) 마다 될라면...

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPerson();
    if(t*1000/fps%shitInterval == 0){
      makeShit(t);
    }
    drawShit();

    if(rightPressed) {
        paddleX += 7;
        if(paddleX > canvas.width)
            paddleX = 0
    }
    else if(leftPressed) {
        paddleX -= 7;
        if(paddleX < 0)
            paddleX = canvas.width - paddleWidth
    }
  
    t++;
}

reset()
setInterval(draw, 1000/fps);
// 현재 시간 = 1000/fps*t