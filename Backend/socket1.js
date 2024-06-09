const { Server } = require("socket.io");

let activeCalls = [];
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);
  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);

    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      // Check if the call already exists
      if (!activeCalls.some(call => call.callerId === socket.user && call.calleeId === data.calleeId)) {
        activeCalls.push({ callerId: socket.user, calleeId: data.calleeId });
      }
      IO.emit('updateCalls', activeCalls);
      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
      console.log(activeCalls);
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      let rtcMessage = data.rtcMessage;
      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("ICEcandidate", (data) => {
      console.log("ICEcandidate data.calleeId", data.calleeId);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      socket.to(calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on('endCall', (data) => {
      console.log("call ended")

      activeCalls = activeCalls.filter(call => call.callerId !== socket.user);

      IO.emit('updateCalls', activeCalls);
      socket.to(data.callerId).emit('callEnded', { callerId: data.callerId, calleeId: socket.user });
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(socket.user, 'Disconnected');
      // Remove the call involving the disconnected user
      activeCalls = activeCalls.filter(call => call.callerId !== socket.user);
      
      IO.emit('updateCalls', activeCalls);
    });

    // Send the current active calls to the newly connected client
    socket.emit('updateCalls', activeCalls);
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw new Error("IO not initialized.");
  } else {
    return IO;
  }
};
