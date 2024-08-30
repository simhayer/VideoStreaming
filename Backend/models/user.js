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
  imageUrl: {
    type: String,
    required: false,
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
  stripeConnectedAccountId: {
    type: String,
    default: '',
  },
  products: {
    type: [ProductSchema],
    default: [],
  },
});

const OrderSchema = new Mongoose.Schema({
  buyer: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  seller: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  products: {
    type: [ProductSchema],
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  transactionId: {
    type: String,
    required: false,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
});

const User = Mongoose.model('user', UserSchema);
const Order = Mongoose.model('order', OrderSchema);

module.exports = {User, Order};
