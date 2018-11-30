const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const shitInterval = 100
const shitSpeed = 1 // 똥 속도 배율
const fps = 25; // 화면 주사율
const peopleHeight = 50
const peopleWidth = 30
const scorePerShit = 20

var seed = "seed"
var t = 0; // 시간(clock)
var score = 0;
var nickname = 0;

var people
var shits = []
var enemys = []
// INPUT STATUS
var rightPressed, leftPressed, rightTouched, leftTouched

// STATUS 
var status = 0 // 현재 상태
// ENUM for status
const PLAYING = 0
const PAUSE = 1
const MENU = 2
const DEAD = 3
const NOT_LOGGED = 4
const READY = 5
const NOT_READY = 6

var serverStatus = 0 // 서버 상태
// ENUM for Server Status
// PLAYING = 0
// READY = 5
// DEAD = 3

// IMAGE RESOURCES
const img_shit = new Image();
img_shit.src = "ddong.png";
const img_man = new Image();
img_man.src = "man.png";
const img_enemy = new Image();
img_enemy.src = "man.png"


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);


// EVENT HANDLER FUNCTION
function keyDownHandler(e) {
    if(e.keyCode == 39)
        rightPressed = true;
    else if(e.keyCode == 37)
        leftPressed = true;

    if(e.keyCode == 80) { // P키
        if(status == PLAYING){ 
            status = PAUSE
            console.log(shits.length);
        }
        else 
            status = PLAYING
    }
    if(e.keyCode == 78) // N키
        reset()
}

function keyUpHandler(e) {
    if(e.keyCode == 39)
        rightPressed = false;
    else if(e.keyCode == 37)
        leftPressed = false;
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


function drawPeople(people) {
    // TODO: if(people.isEnemy())
    if(people.isMe)
        ctx.drawImage(img_man, people.getX(), canvas.height-peopleHeight);
    else 
        ctx.drawImage(img_enemy, people.getX(), canvas.height-peopleHeight);
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
    shits.push(new Shit(t, seed))
}
function setSeed(seed){
    this.seed = seed||"seed"
    Math.seedrandom(this.seed)
}
function reset(seed){
    t = score = 0
    shits = []
    status = PLAYING
    rightPressed = leftPressed = false
    people = new People((canvas.width-peopleWidth)/2, true)
    setSeed(seed)
}

function drawShit(){
    let index = -1;
    
    for(let i = 0; i < shits.length; i++){
        let cS = shits[i] // currentShit
        
        // 똥이 화면을 벗어날때 moveShit은 false를 return한다.
        if(!cS.moveShit(t)){
            index = i;            
        }
        else {
            ctx.drawImage(img_shit, cS.getX(), cS.getY());
        }
        // 똥에 맞았을때
        if (Math.abs(cS.getY()-canvas.height) < peopleHeight && Math.abs(cS.getX()-people.getX()) < peopleWidth/2){
            console.log("똥: " + cS.getX() + ", " + cS.getY());
            console.log("사람: " + people.getX())
            alert('최종 점수 : '+score+', 다시 시작하려면 N키를 누르시오')
            status = DEAD
        }
    }
    if(index!=-1){
        shits.shift();
        score += scorePerShit;
    }
}

function movePeople(){
    if(rightPressed || rightTouched) {
        people.movePeople(7)
    }
    else if(leftPressed || leftTouched) {
        people.movePeople(-7)
    }
}

function draw() {
    if(status != PLAYING)
        return

    // draw 는 1000/fps(ms) 마다 실행된다.
    // shitInterval(ms) 마다 될라면...

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(t*1000/fps % shitInterval == 0)
      makeShit(t);

    movePeople();

    drawShit();
    drawPeople(people);

    drawScore();
  
    t++;
}

reset()
setInterval(draw, 1000/fps);
// 현재 시간 = 1000/fps*t