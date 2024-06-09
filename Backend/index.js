const express = require('express');
const path = require('path');
const socketIO = require('socket.io')
const { createServer } = require('http');
const connectDB = require('./models/db');

const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/user'));
app.use('/', express.static(path.join(__dirname, 'static')));

const httpServer = createServer(app);
let port = process.env.PORT || 3000;

const io = socketIO(httpServer)

httpServer.listen(port);
console.log(`Server started on port ${port}`);

// Handling Error
process.on('unhandledRejection', (err) => {
  console.log(`An error occurred: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

require("./Socket/socketEvent")(io)
require("./Socket/socketFunction").init(io)
connectDB();