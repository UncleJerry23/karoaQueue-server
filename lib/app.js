const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.end('awake');
});

let playlists = {};

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('ADD_LINK', (data) => {
    playlists[data.roomId].push(data);
    io.to(data.roomId).emit('CURRENT_PLAYLIST', playlists[data.roomId]);
  });
  
  socket.on('FINISHED_SONG', (roomId) => {
    playlists[roomId].shift();
    io.to(roomId).emit('CURRENT_PLAYLIST', playlists[roomId]);
  });
  
  socket.on('CREATE_ROOM', (roomId) => {
    playlists[roomId] = [];
    socket.join(roomId);
  });
  
  socket.on('JOIN_ROOM', (roomId) => {
    socket.emit('CURRENT_PLAYLIST', playlists[roomId]);
    socket.join(roomId);
  });
  
  socket.on('REMOVE_SONG', (data) => {
    const { roomId, song } = data;
    const position = playlists[roomId].findIndex(i => i.song.videoId === song.videoId);
    playlists[roomId].splice(position, 1);
    io.to(roomId).emit('CURRENT_PLAYLIST', playlists[roomId]);
  });
});

module.exports = server;
