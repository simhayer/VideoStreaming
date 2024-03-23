const { Server } = require("socket.io");

let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.on("connection", (socket) => {
    console.log(socket.id, "Connected");

    socket.on("joinRoom", (data) => {
      let roomId = data.roomId;
      socket.join(roomId);
      console.log(socket.id, "joined room:", roomId);

      // Broadcast to everyone in the room that a new user has joined
      socket.to(roomId).emit("userJoined", { userId: socket.id });

      // Notify the new user about all existing users in the room
      const usersInRoom = Object.keys(IO.sockets.adapter.rooms[roomId].sockets);
      socket.emit("allUsers", { users: usersInRoom });
    });

    socket.on("startLivestream", (data) => {
      let roomId = data.roomId;
      // Broadcast to everyone in the room to start the livestream
      IO.to(roomId).emit("livestreamStarted", { hostId: socket.id });
    });

    socket.on("stopLivestream", (data) => {
      let roomId = data.roomId;
      // Broadcast to everyone in the room to stop the livestream
      IO.to(roomId).emit("livestreamStopped", { hostId: socket.id });
    });

    socket.on("ICEcandidate", (data) => {
      let roomId = data.roomId;
      let rtcMessage = data.rtcMessage;
      // Broadcast ICEcandidate to everyone in the room
      socket.to(roomId).emit("ICEcandidate", {
        sender: socket.id,
        rtcMessage: rtcMessage,
      });
    });
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initialized.");
  } else {
    return IO;
  }
};
