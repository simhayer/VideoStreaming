const express = require("express");
const app = express();

app.use(express.json());
app.use("/api/auth", require("./routes/user")) 

const PORT = 3000
const server = app.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
)
// Handling Error
process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
  })

const connectDB = require("./models/db");
connectDB();


const host = "localhost";
const port = "3000"
// const host = "192.168.1.7"

const express = require('express')
//const app = express()

const bodyParser = require('body-parser')

const http = require('http')
//const server = http.Server(app);

const socketIO = require('socket.io')
const io = socketIO(server)

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


app.get("/stream",(req,res)=>{
    res.sendFile('public/index.html', {root: __dirname })
})

server.listen(port,
    host,
    () => console.log('server started: ' + host + ":" + port));
    
require("./src/Route/route")(app)
require("./src/Socket/socketEvent")(io)
require("./src/Socket/socketFunction").init(io)




