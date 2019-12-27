const cors = require('cors');
const winston = require('winston');
const express = require('express');
const app = express();
const http = require('http')
const socketIO = require('socket.io')

// app.use(express.static(__dirname + 'public'))

app.use(express.static('public'))

app.use(cors())

require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();


const port = process.env.PORT || 5000;

// our server instance
const server = http.createServer(app)

// This creates our socket using the instance of the server
const io = socketIO(server)

// This is what the socket.io syntax is like, we will work this later
io.on('connection', socket => {
    

    // just like on the client side, we have a socket.on method that takes a callback function
  socket.on('changeColor', (kids) => {
    // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
    // we make use of the socket.emit method again with the argument given to use from the callback function above
    
    io.sockets.emit('changeColor', kids)
  })
  
  socket.on('disconnect', () => {
    
  })
})

server.listen(port, () => winston.info(`Listening on port ${port}`))