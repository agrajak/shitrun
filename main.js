const express = require('express')

const app = express()
const hostname = '0.0.0.0'
const port = 8088;
const cron = require('node-cron') // for scheduled task (https://www.npmjs.com/package/node-cron)
const server = require('http').Server(app)
const io = require('socket.io')(server) // for socket programming (https://socket.io/)

var users = []

// https://github.com/socketio/socket.io/blob/master/examples/chat/index.js를 참조함

app.use(express.static('static'))

server.listen(port, hostname, ()=>{
  console.log('server open!')
})

io.on('connection', socket=>{
  let addedUser = false
  let address = socket.handshake.address
  console.log('a user connected!')
  socket.on('disconnect', ()=>{
    console.log('a user disconnected')
  })
  socket.on('login', (nick, ready)=>{
    socket.nick = nick
    socket.address = address
    socket.ready = ready
    addedUser = true
    console.log(`${nick}(${address}) logined and ${ready?'ready':'no ready'}`)
    if(ready){
      socket.join('ready')
    }
    else {
      socket.join('no-ready')
    }
  })
})
io.of('ready').on('connection', socket=>{
  console.log(`${socket.nick} is now ready`)
})