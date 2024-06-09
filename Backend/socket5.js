const { Server } = require("socket.io");

let streams = [];
let io;
let broadcaster;

module.exports.initIO = (httpServer) => {
  io = new Server(httpServer);
  io.use((socket, next) => {
    if (socket.handshake.query) {
      let streamerId = socket.handshake.query.streamerId;
      socket.user = streamerId;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', (data) => {
        socket.broadcast.emit('candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
};

module.exports.getIO = () => {
  if (!io) {
    throw new Error("IO not initialized.");
  } else {
    return io;
  }
};