const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const roomChoices ={};
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});
//adding comment
io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);
  console.log(socket.rooms);

  socket.on("create-room", (roomName) => {
      socket.join(roomName);
      console.log("user joined "+roomName)
  });
  socket.on("join-room", (roomName) => {
    let numberofUsers = io.sockets.adapter.rooms.get(roomName);
    if (numberofUsers?.size===undefined || numberofUsers?.size < 2) {
      socket.join(roomName);
      console.log("user joined " + roomName);
    } else {
      console.log(numberofUsers?.size);  
      console.log("Room is full");
    }
  });
  
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});

