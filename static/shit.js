const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const socket = io("165.246.240.185:8088")

// SOCKET
socket.on('game_start', (users)=>{
    console.log(users.length+'명이 게임 시작')
    multi_status = MUL_PLAYING
    reset()
    enemys = []
    users.filter(x=>x.nick != nickname).forEach(x=>{
        enemys.push(new People(0, false, x.nick))
    })
    
})
socket.on('game_end', (winner)=>{
    console.log(`승자는 ${winner}!`)
    status = MENU
})
socket.on("game_user_info", (usernick, x, isAlive)=>{
    for(var i=0;i<enemys.length;i++){
        if(enemys[i].nick == usernick){
            enemys[i].x = x
            enemys[i].isAlive = isAlive
        }
    }
})
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


// MULTI_STATUS
var multi_status = 0;
// ENUM for MULTI STATUS

const MUL_UNREADY = 0
const MUL_READY = 1
const MUL_PLAYING = 2

var timer;

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
    if(e.keyCode == 39) // ->로 이동
        rightPressed = true;
    if(e.keyCode == 37) // <-로 이동
        leftPressed = true;

    if(e.keyCode == 80) { // P키
        // 죽은 상태일때는 무시
        if(status == DEAD){
            return
        }
        if(status == PLAYING){ 
            status = PAUSE
        }
        else 
            status = PLAYING
    }
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
    rightTouched = leftTouched = false
    people = new People((canvas.width-peopleWidth)/2, true)
    setSeed(seed)
}
function doesShitHitPeople(shit, people){
    return Math.abs(shit.getY()-canvas.height) < peopleHeight && Math.abs(shit.getX()-people.getX()) < peopleWidth/2
}
function timeToMakeShit(){
    return t*1000/fps % shitInterval == 0
}
function drawShit(){
    let index = -1;
    shits.forEach((shit, i)=>{
        // 똥이 화면을 벗어날때 moveShit은 false를 return한다.
        if(!shit.moveShit(t)){
            index = i;            
        }
        // 똥이 화면을 벗어나지 않을때 똥을 그린다.
        else {
            ctx.drawImage(img_shit, shit.getX(), shit.getY());
        }
        // 똥에 맞았을때
        if (doesShitHitPeople(shit, people)){
            // print for debuglse 
            console.log("똥: " + shit.getX() + ", " + shit.getY());
            console.log("사람: " + people.getX())
            // 멀티방일때
            if(multi_status == PLAYING){
                people.kill()
            }
            else status = MENU
        }        
    })
    if(index!=-1){
        // 지울 똥이 있으면 지우고 점수를 더해준다.
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
function drawEnemy(){
    enemys.forEach(enemy=>{
        drawPeople(enemy)
    })
}
function draw() {
    if(multi_status == MUL_PLAYING){
        status = PLAYING
        drawEnemy()
        if(status == DEAD)
        socket.emit('peopleInfo', {x: people.getX(), alive:people.isAlive()})
    }
    if(status == MENU){
        clearInterval(timer);
        open_menu();
    }

    if(status != PLAYING)
        return

    // draw 는 1000/fps(ms) 마다 실행된다.
    // shitInterval(ms) 마다 될라면...

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(timeToMakeShit())
      makeShit(t);

    movePeople();

    drawShit();
    drawPeople(people);

    drawScore();
    t++;
}

function open_menu(){
    document.getElementById("score").value = score;
    $('#modal_menu').modal({backdrop: 'static', keyboard: false}) ;
    $('#modal_menu').modal('show')
}

function open_menu_in_modal_multi(){
    $('#modal_multi').modal('hide')
    document.getElementById("score").value = score;
    $('#modal_menu').modal({backdrop: 'static', keyboard: false}) ;
    $('#modal_menu').modal('show')
}

function single_init(){
    $('#modal_menu').modal('hide')
    reset()
    timer = setInterval(draw, 1000/fps);
}

function multi_init(){
    $('#modal_menu').modal('hide')
    $('#modal_multi').modal({backdrop: 'static', keyboard: false}) ;
    $('#modal_multi').modal('show')
}

function multi_ready(){
    $('#modal_multi').modal('hide')
    multi_status = MUL_READY;
    // send server to ready
    $('#modal_readied').modal({backdrop: 'static', keyboard: false}) ;
    $('#modal_readied').modal('show')
    // getNickName
    nick = $('#nickname').val()
    socket.emit('login', nick, true)

}

function multi_unready(){
    $('#modal_readied').modal('hide')
    multi_status = MUL_UNREADY;
    // send server to unready
    $('#modal_multi').modal({backdrop: 'static', keyboard: false}) ;
    $('#modal_multi').modal('show')
    nick = $('#nickname').val()
    socket.emit('login', nick, false)
}
