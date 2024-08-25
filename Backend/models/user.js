// user.js
const Mongoose = require('mongoose');

// Define a schema for products
const ProductSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
});

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
  username: {
    type: String,
    default: '',
  },
  userID: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
    // Increased the length to accommodate hashed passwords (e.g., 60 characters for bcrypt)
    maxlength: 100,
  },
  role: {
    type: String,
    default: 'Basic',
    required: true,
  },
  resetCode: {
    type: String,
    default: 'Basic',
    required: false,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  stripeUserId: {
    type: String,
    default: '',
  },
  products: {
    type: [ProductSchema], // Using the ProductSchema here
    default: [], // Default to an empty array
  },
});

const User = Mongoose.model('user', UserSchema);
module.exports = User;
