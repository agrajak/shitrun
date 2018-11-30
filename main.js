const express = require('express')
const heartbeats = require('heartbeats')
const app = express()
const hostname = '0.0.0.0'
const port = 8088;
const cron = require('node-cron') // for scheduled task (https://www.npmjs.com/package/node-cron)
const server = require('http').Server(app)
const io = require('socket.io')(server) // for socket programming (https://socket.io/)

var users = []
var playing_users = []
var status = 2

const PLAYING = 1
const WAITING = 2

const NO_COUNTDOWN = -3
var countdown = NO_COUNTDOWN
var t=0;
// https://github.com/socketio/socket.io/blob/master/examples/chat/index.js를 참조함
function startCountDown(){
  countdown = 5
  countTask.start();
}
function finishGame(lastone){
  io.emit('game_end', lastone)
  console.log('게임 끗!')
  playing_users = []
  status = WAITING
}
var countTask = cron.schedule('* * * * * *', ()=>{
  if(status == PLAYING)
    return
  if(countdown != NO_COUNTDOWN){
    console.log('카운트 다운 '+countdown+'초')
    countdown--
    io.emit('countdown', countdown)
    io.emit('chatroom', `<b>${countdown}초 후 게임이 시작됩니다.<b> <br>`)
    if(users.filter(x=>x.ready).length < 2){
      console.log('조건 만족 못해서 카운트 다운 취소')
      io.emit('chatroom', `<b>준비중인 인원이 적어 게임이 취소되었습니다.<b> <br>`)
      countdown = NO_COUNTDOWN
    }      
  }
  if(countdown == 0){
    console.log('게임 시작!')
    status = PLAYING
    playing_users = []
    users.forEach(x=>{
      if(x.ready){
        playing_users.push({
          id: x.id, nick: x.nick, alive: true, max_score: 0
        })  
        x.ready = false
      }
    })
    console.log(`현재 ${playing_users.length}명 접속중`)
    var seed = "seed"+Math.floor(Math.random()*20)
    io.emit('game_start', users, seed)
    console.log('Seed :'+seed);
    countdown = NO_COUNTDOWN
  }
})

app.use(express.static('static'))

server.listen(port, hostname, ()=>{
  console.log('server open!')
})

io.on('connection', socket=>{
  let address = socket.handshake.address
  console.log('a user connected!')
  socket.on('disconnect', ()=>{
    console.log((socket.nick||'nonamed')+' disconnected')
    if(socket.id in users.map(u=>u.id)){
      users.splice(users.map(x=>x.id).indexOf(socket.id), 1)
    }
  })
  socket.on('chat', (chat)=>{
    console.log(socket.nick + ":"+chat)
    io.emit('chatroom', `<b>${socket.nick}</b>(${socket.ready?'레디':'안레디'}): ${chat}<br>`)
  })
  socket.on('peopleInfo', (data)=>{
    if(status != PLAYING){
      return;
    }
    var {x, isAlive, score, max_score} = data
    io.emit('game_user_info', socket.nick, x, isAlive)
      var lastone = ''
      for(var i=0;i<playing_users.length;i++){
        // 조건에 맞는 아이디를 찾으면
        if(playing_users[i].nick == socket.nick){
          if(isAlive == false){
            playing_users[i].alive = false
          }
          lastone = playing_users[i].nick
          playing_users[i].max_score = max_score
          break;
        }
      }
      // 살아있는 놈이 없을때...
      if(playing_users.filter(x=>x.alive == true).length == 0){
        finishGame(lastone)
      }

      // 혹은 maxScore의 최대와 최소값이 100이상 차이날때 => 잠수다. 서버 종료
      var maxScore = -1
      var minScore = 999999
      playing_users.forEach(p=>{
        if(p.max_score > maxScore){
          maxScore = p.max_score
        }
        else if(p.max_score < minScore){
          minScore = p.max_score
        }
      })
      if(maxScore - minScore > 200){
        finishGame(null)
      }
  })
  socket.on('login', (nick, ready)=>{
    let id = socket.id
    socket.nick = nick
    socket.address = address
    socket.ready = ready
    console.log(`${nick}(${address}) logined and ${ready?'ready':'no ready'}`)
    
    if(!(users.find(x=>x.id == id))){
      users.push({
        id, nick, address, ready
      })
    }
    else {
      users[users.map(x=>x.id).indexOf(id)].ready = ready
      io.emit('chatroom', `<b>유저 ${socket.nick}님이 준비상태를 ${ready}로 변경하였습니다.</b>`)
      console.log(users)
    }

    if(users.filter(x=>x.ready==true).length >= 2){
      users.filter(x=>x.ready==true).forEach(x=>{
        console.log(`${x.nick}(${x.address}, ${x.id})가 준비중`)
      })
      console.log('게임 시작이 가능합니다.')
      startCountDown()
    }
    io.emit('users', users, status==PLAYING)
  })
})
io.of('ready').on('connection', socket=>{
  console.log(`${socket.nick} is now ready`)
})