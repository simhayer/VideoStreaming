const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { getIO, initIO } = require('./socket5');
const connectDB = require('./models/db');

const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/user'));
app.use('/', express.static(path.join(__dirname, 'static')));

const httpServer = createServer(app);
let port = process.env.PORT || 3000;

initIO(httpServer);
httpServer.listen(port);
console.log(`Server started on port ${port}`);
getIO();

// Handling Error
process.on('unhandledRejection', (err) => {
  console.log(`An error occurred: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

connectDB();