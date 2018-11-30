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
var countTask = cron.schedule('* * * * * *', ()=>{
  if(status == PLAYING)
    return
  if(countdown != NO_COUNTDOWN){
    console.log('카운트 다운 '+countdown+'초')
    countdown--
    io.emit('countdown', countdown)
    if(users.filter(x=>x.ready).length < 2){
      console.log('조건 만족 못해서 카운트 다운 취소')
      countdown = NO_COUNTDOWN
    }      
  }
  if(countdown == 0){
    console.log('게임 시작!')
    status = PLAYING
    playing_users = []
    users.filter(x=>x.ready).forEach(x=>{
      playing_users.push({
        id: x.id, nick: x.nick, alive: true
      })
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
    console.log('현재 접속자수 :'+users.length)

  })
  socket.on('peopleInfo', (data)=>{
    if(status != PLAYING){
      return;
    }
    var {x, isAlive} = data
    console.log(socket.nick + ", " +  x);
    io.emit('game_user_info', socket.nick, x, isAlive)
    if(isAlive == false){
      let lastone = ''
      for(var i=0;i<playing_users.length;i++){
        if(playing_users[i].nick == socket.nick){
          lastone = playing_users[i].nick
          playing_users[i].alive = false
          break;
        }
      }
      // 살아있는 놈이 없을때...
      if(playing_users.filter(x=>x.alive == true).length == 0){
        io.emit('game_end', lastone)
        playing_users = []
        status = WAITING
      }

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