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

  socket.on('CREATE_ROOM', ({ id, newRoomName }) => {
    playlists[id] = {
      roomName: newRoomName,
      playlist: []
    };
    socket.join(id);
  });
  
  socket.on('JOIN_ROOM', (roomId) => {
    socket.emit('CURRENT_PLAYLIST', playlists[roomId]);
    socket.join(roomId);
  });

  socket.on('ADD_LINK', (data) => {
    playlists[data.roomId].playlist.push(data);
    io.to(data.roomId).emit('CURRENT_PLAYLIST', playlists[data.roomId]);
  });
  
  socket.on('FINISHED_SONG', (roomId) => {
    playlists[roomId].playlist.shift();
    io.to(roomId).emit('CURRENT_PLAYLIST', playlists[roomId]);
  });
  
  socket.on('REMOVE_SONG', (data) => {
    const { roomId, song } = data;
    const position = playlists[roomId].playlist.findIndex(i => i.song.videoId === song.videoId);
    playlists[roomId].playlist.splice(position, 1);
    io.to(roomId).emit('CURRENT_PLAYLIST', playlists[roomId]);
  });
});

module.exports = server;
