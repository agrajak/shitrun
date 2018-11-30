const express = require('express');
const app = express()
const hostname = '0.0.0.0';
const port = 8088;

app.use(express.static('static'))

app.listen(port, hostname, ()=>{
  console.log('server open!')
})