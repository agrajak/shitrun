var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var shitSpeed = 1; // 똥 속도 배율
var fps = 25; // 화면 주사율
var t = 0; // 시간(clock)
var score = 0;
var paddleHeight = 50;
var paddleWidth = 30;
var paddleX;

var rightPressed = false;
var leftPressed = false;
var rightTouched = false;
var leftTouched = false;
var shits = []

const PLAYING = 0
const PAUSE = 1
const MENU = 2
const DEAD = 3

var status = 0

var image = new Image();		/* 이미지 객체 생성 */
image.src = "ddong.png";		/* 이미지 파일 이름 설정 */

var img_shit = new Image();
img_shit.src = "ddong.png";
var img_man = new Image();
img_man.src = "man.png";

const shitInterval = 100

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
    if(e.keyCode == 80) { // P키
        if(status == PLAYING){ 
            status = PAUSE
            console.log(shits.length);
        }
        else 
            status = PLAYING
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
function touchStartHandler(e) {
    if(e.touches[0].clientX < canvas.width / 2){
        leftTouched = true;
        rightTouched = false;
    } else{
        leftTouched = false;
        rightTouched = true;
    }
}
function touchEndHandler(e) {
    rightTouched = false;
    leftTouched = false;
}

function drawPerson() {
    ctx.drawImage(img_man, paddleX, canvas.height-paddleHeight);
}
function drawScore() {
    ctx.font = "20px Comic Sans MS"
    ctx.fillStyle="black"
    ctx.textAlign="left"
    ctx.fillText("Score:" + score, 10,30);
}
function drawText(){
}
function makeShit(){
  shits.push({x: Math.floor(Math.random() * canvas.width), y: 0, t:t})
}
function reset(){
    t = score = 0
    shits = []
    paddleX = (canvas.width-paddleWidth)/2
    status = PLAYING
    rightPressed = leftPressed = false
}
function drawShit(){
    var index = -1;
    for(var i = 0; i < shits.length; i++){
        shits[i].y += (t-shits[i].t)*shitSpeed;
        shits[i].y = Math.floor(shits[i].y);

        // 똥에 맞았을때
        if (Math.abs(shits[i].y-canvas.height) < paddleHeight && Math.abs(shits[i].x-paddleX) < paddleWidth/2){
            console.log("똥: " + shits[i].x + ", " + shits[i].y);
            console.log("사람: " + paddleX)
            alert('최종 점수 : '+score+', 다시 시작하려면 N키를 누르시오')
            status = DEAD
        }

        // 똥이 화면을 벗어난다면
        if(shits[i].y > canvas.height)
            index = i;
        else
            ctx.drawImage(img_shit, shits[i].x, shits[i].y);
    }
    if(index!=-1)
        shits.shift();
}
function movePeople(){
    if(rightPressed || rightTouched) {
        paddleX += 7;
        if(paddleX >= canvas.width)
            paddleX = 0
    }
    else if(leftPressed || leftTouched) {
        paddleX -= 7;
        if(paddleX < 0)
            paddleX = canvas.width - paddleWidth
    }
}
function draw() {
    if(status != PLAYING){
        return
    }
    // draw 는 1000/fps(ms) 마다 실행된다.
    // shitInterval(ms) 마다 될라면...

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPerson();
    if(t*1000/fps % shitInterval == 0){
      makeShit(t);
    }
    drawShit();
    drawScore();
    movePeople();
  
    t++;
}

reset()
setInterval(draw, 1000/fps);
// 현재 시간 = 1000/fps*t