const { Server } = require("socket.io");

let activeStreams = [];
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);
  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let streamerId = socket.handshake.query.streamerId;
      socket.user = streamerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);

    socket.on("startStream", (data) => {
      let streamerId = data.streamerId;
      if (!activeStreams.some(stream => stream.streamerId === streamerId)) {
        activeStreams.push({ streamerId: streamerId });
        IO.emit('updateStreams', activeStreams);
        console.log(activeStreams);
      }
    });

    socket.on("offer", (data) => {
      let viewerId = data.viewerId;
      let rtcMessage = data.rtcMessage;
      socket.to(viewerId).emit("offer", {
        streamerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("newViewer", async (data) => {
        const { viewerId } = data;
        // Emit an event to the viewer to notify them that they have successfully connected
        socket.to(viewerId).emit("connected", { message: "You are now connected" });
      
        // Find the streamerId associated with this viewer
        const streamerId = activeStreams.find((stream) => stream.viewers.includes(viewerId));
      
        if (streamerId) {
          // Get the socket corresponding to the streamer
          const streamerSocket = IO.sockets.sockets.get(streamerId.streamerId);
      
          if (streamerSocket) {
            try {
              // Create an offer for the viewer
              const offer = await streamerSocket.createOffer();
              await streamerSocket.setLocalDescription(offer);
      
              // Send the offer to the viewer
              IO.to(viewerId).emit("offer", {
                streamerId: streamerId,
                rtcMessage: offer,
              });
            } catch (error) {
              console.error("Error creating offer:", error);
            }
          } else {
            console.error("Stream socket not found for streamer:", streamerId);
          }
        } else {
          console.error("Stream not found for viewer:", viewerId);
        }
      });

    socket.on("answer", (data) => {
      let streamerId = data.streamerId;
      let rtcMessage = data.rtcMessage;
      socket.to(streamerId).emit("answer", {
        viewerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("ICEcandidate", (data) => {
      let recipientId = data.recipientId;
      let rtcMessage = data.rtcMessage;
      socket.to(recipientId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on('endStream', (data) => {
      console.log("stream ended");
      let streamerId = data.streamerId;
      activeStreams = activeStreams.filter(stream => stream.streamerId !== streamerId);
      IO.emit('updateStreams', activeStreams);
      socket.to(streamerId).emit('streamEnded', { streamerId: streamerId });
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(socket.user, 'Disconnected');
      activeStreams = activeStreams.filter(stream => stream.streamerId !== socket.user);
      IO.emit('updateStreams', activeStreams);
    });

    // Send the current active streams to the newly connected client
    socket.emit('updateStreams', activeStreams);
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw new Error("IO not initialized.");
  } else {
    return IO;
  }
};
