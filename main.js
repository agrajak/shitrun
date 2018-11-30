const express = require('express')
const heartbeats = require('heartbeats')
const app = express()
const hostname = '0.0.0.0'
const port = 8088;
const cron = require('node-cron') // for scheduled task (https://www.npmjs.com/package/node-cron)
const server = require('http').Server(app)
const io = require('socket.io')(server) // for socket programming (https://socket.io/)

var users = []
var status = 2

const PLAYING = 1
const WAITING = 2
const NO_COUNTDOWN = -3
var countdown = NO_COUNTDOWN

var heart = heartbeats.createHeart(40);
heart.createEvent(1, (count, last)=>{

})
var t=0;
// https://github.com/socketio/socket.io/blob/master/examples/chat/index.js를 참조함
function startCountDown(){
  countdown = 5
  countTask.start();
}
var countTask = cron.schedule('* * * * * *', ()=>{
  if(countdown != NO_COUNTDOWN){
    console.log('카운트 다운 '+countdown+'초')
    countdown--
    if(users.filter(x=>x.ready).length < 2){
      console.log('조건 만족 못해서 카운트 다운 취소')
      countdown = NO_COUNTDOWN
    }      
  }
  if(countdown == 0){
    console.log('게임 시작!')
    console.log(`현재 ${users.filter(x=>x.ready).length}명 접속중`)
    io.emit('game_start', users)
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
    var {x, isAlive} = data
    console.log(socket.nick + ", " +  x);
    io.emit('game_user_info', socket.nick, x, isAlive)
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
  })
})
io.of('ready').on('connection', socket=>{
  console.log(`${socket.nick} is now ready`)
})