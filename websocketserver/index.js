// require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();

app.use(cors());

app.use(express.json({ extended: false }));
app.get("/api", (req, res) => res.send("WEBSOCKET API RUNNING"));

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let connections = 0;

io.on("connection", (socket) => {
  let interval;

  if (interval) {
    return clearInterval(interval);
  }

  if (connections < 0) {
    connections = 0;
  }

  interval = setInterval(() => {
    socket.emit("getactiveusers", connections);
    // console.log("user is connected", connections);
  }, 10000);

  socket.on("adduser", (data) => {
    connections += 1;
    console.log("this is a new user", connections);
  });

  socket.on("disconnect", () => {
    if (connections > 0) connections -= 1;
    console.log("a user has disconnected", connections);
    return clearInterval(interval);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () =>
  console.log("Websocket server running on port:" + PORT)
);
