const { Server } = require("socket.io");

let streams = [];
let io;

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
  const { streamerId } = socket.handshake.query;
  console.log(`${streamerId} connected`);

  socket.on('startStream', ({ streamerId }) => {
    streams.push({ streamerId, viewers: [] });
    io.emit('updateStreams', streams);
    console.log(`${streamerId} started streaming`);
  });

  socket.on('joinStream', ({ streamerId, viewerId }) => {
    const stream = streams.find((s) => s.streamerId === streamerId);
    if (stream) {
      stream.viewers.push(viewerId);
      io.to(streamerId).emit('newViewer', { viewerId });
      console.log(`${viewerId} joined ${streamerId}'s stream`);
    }
  });

  socket.on('offer', ({ viewerId, rtcMessage }) => {
    io.to(viewerId).emit('offer', { rtcMessage });
    console.log(`Offer sent to ${viewerId}`);
  });

  socket.on('answer', ({ viewerId, rtcMessage }) => {
    io.to(viewerId).emit('answer', { rtcMessage });
    console.log(`Answer sent to ${viewerId}`);
  });

  socket.on('ICEcandidate', ({ viewerId, rtcMessage }) => {
    io.to(viewerId).emit('ICEcandidate', { rtcMessage });
    console.log(`ICE candidate sent to ${viewerId}`);
  });

  socket.on('endStream', ({ streamerId }) => {
    streams = streams.filter((s) => s.streamerId !== streamerId);
    io.emit('updateStreams', streams);
    console.log(`${streamerId} ended streaming`);
  });

  socket.on('disconnect', () => {
    streams = streams.filter((s) => s.streamerId !== streamerId);
    io.emit('updateStreams', streams);
    console.log(`${streamerId} disconnected`);
  });
});
}

module.exports.getIO = () => {
    if (!io) {
      throw new Error("IO not initialized.");
    } else {
      return io;
    }
  };