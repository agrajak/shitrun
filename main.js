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

cron.schedule('*/5 * * * * *', ()=>{
  // ping every 5seconds
  let date = new Date()
  io.emit('ping', date)
  console.log('ping! at '+date)
})

io.on('connection', socket=>{
  let addedUser = false
  let address = socket.handshake.address
  console.log('a user connected!')
  socket.on('disconnect', ()=>{
    console.log('a user disconnected')
  })
  socket.on('login', (nick)=>{
    if(addedUser) return
      socket.nick = nick
      socket.address = address
      addedUser = true
  })
})
io.on('pong', ()=>{

})
io.on('login', ()=>{

})
io.set('origins', '*:*')

