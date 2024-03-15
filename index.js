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
const roomChoices = {};

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

  //game logic goes here
  socket.on("player-choice", ({ roomName, choice }) => {
    roomChoices[roomName][socket.id] = choice;
    const firstPlayerSocketId = Object.keys(roomChoices[roomName])[0];
    const secondPlayerSocketId = Object.keys(roomChoices[roomName])[1];
    if (
      roomChoices[roomName][firstPlayerSocketId] !== null &&
      roomChoices[roomName][secondPlayerSocketId] !== null
    ) {
      const firstPlayerChoice = roomChoices[roomName][firstPlayerSocketId];
      const secondPlayerChoice = roomChoices[roomName][secondPlayerSocketId];
      let winner;
      if (firstPlayerChoice === secondPlayerChoice) {
        winner = "It's a tie!";
      } else if (
        (firstPlayerChoice === "rock" && secondPlayerChoice === "scissors") ||
        (firstPlayerChoice === "paper" && secondPlayerChoice === "rock") ||
        (firstPlayerChoice === "scissors" && secondPlayerChoice === "paper")
      ) {
        winner = "Player 1 wins!";
      } else {
        winner = "Player 2 wins!";
      }
      io.to(roomName).emit("game-result", winner);
      roomChoices[roomName][firstPlayerSocketId] = null;
      roomChoices[roomName][secondPlayerSocketId] = null;
    }
  });

  socket.on("room-chat", ({roomName,message}) => {
   //chat logic goes here
  });
});




server.listen(5000, () => {
  console.log("listening on *:5000");
});
