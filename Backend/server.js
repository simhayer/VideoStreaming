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


