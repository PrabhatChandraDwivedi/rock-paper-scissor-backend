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
  socket.on("create-room", (roomName, callback) => {
    socket.join(roomName);
    roomChoices[roomName] = {};
    roomChoices[roomName][socket.id] = null;
    callback(true);
  });


socket.on("join-room", (roomName, callback) => {
    let numberofUsers = io.sockets.adapter.rooms.get(roomName, callback);
    if (numberofUsers?.size === undefined || numberofUsers?.size < 2) {
      socket.join(roomName);
      roomChoices[roomName][socket.id] = null;
      const firstPlayerSocketId = Object.keys(roomChoices[roomName])[0];
      const secondPlayerSocketId = Object.keys(roomChoices[roomName])[1];
      if (
        firstPlayerSocketId !== undefined &&
        secondPlayerSocketId !== undefined
      ) {
        io.to(roomName).emit(
          "start-game",
          secondPlayerSocketId,
          firstPlayerSocketId
        );
        io.to(socket.id).emit("start-game-immediately");
        callback(true);
      }
    } else if (numberofUsers && numberofUsers.size === 2) {
      callback(false);
    } else {
      callback(false);
    }
  });
  
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});