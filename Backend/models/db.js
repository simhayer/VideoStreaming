// db.js
const Mongoose = require("mongoose")
//const localDB = `mongodb://localhost:27017/role_auth`
const localDB = `mongodb://0.0.0.0:27017/role_auth`
const connectDB = async () => {
  await Mongoose.connect(localDB)
  console.log("MongoDB Connected")
}
module.exports = connectDB