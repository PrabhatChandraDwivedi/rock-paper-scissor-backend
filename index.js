const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const roomChoices ={};
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);
  console.log(socket.rooms);

  socket.on("create-room", (roomName, callback) => {
    socket.join(roomName);
    roomChoices[roomName] = {};
    roomChoices[roomName][socket.id] = null;
    console.log("user joined " + roomName);
    callback(true);
  });

  
  socket.on("join-room", (roomName) => {
    let numberofUsers = io.sockets.adapter.rooms.get(roomName);
    if (numberofUsers?.size===undefined || numberofUsers?.size < 2) {
      console.log(socket.id)
      socket.join(roomName);
      roomChoices[roomName][socket.id] = null;
      console.log("user joined " + roomName);
    }
    if (numberofUsers && numberofUsers.size === 2) {
      for (const roomName in roomChoices) {
        console.log('====================================');
        console.log(1);
        console.log('====================================');
        if (roomChoices.hasOwnProperty(roomName)) {
          const firstPlayerSocketId = Object.keys(roomChoices[roomName])[0];
          const secondPlayerSocketId = Object.keys(roomChoices[roomName])[1];
          if (firstPlayerSocketId !==undefined && secondPlayerSocketId !== undefined) {
            io.to(roomName).emit("start-game", secondPlayerSocketId, firstPlayerSocketId);
          }
         }
      }
    }
    else {
      console.log(roomChoices);
      console.log(numberofUsers?.size);
      console.log("Room is full");
    }
  });
  
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});