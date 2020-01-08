const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.end('awake');
});

let playlist = [];

io.on('connection', (socket) => {
  console.log('connected');
  socket.emit('CURRENT_PLAYLIST', playlist);

  socket.on('ADD_LINK', data => {
    playlist.push(data);
    io.emit('CURRENT_PLAYLIST', playlist);
  });

  socket.on('FINISHED_SONG', () => {
    playlist.shift();
    io.emit('CURRENT_PLAYLIST', playlist);
  });
});

module.exports = server;
