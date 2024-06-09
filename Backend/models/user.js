// user.js
const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
    // Increase the length to accommodate hashed passwords (e.g., 60 characters for bcrypt)
    maxlength: 100, // Adjust this value as needed based on your hashing algorithm
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  resetCode: {
    type: String,
    default: "Basic",
    required: false,
  },
})

const User = Mongoose.model("user", UserSchema)
module.exports = User