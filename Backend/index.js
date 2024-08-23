const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const {createServer} = require('http');
const connectDB = require('./models/db');

const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/user'));
app.use('/', express.static(path.join(__dirname, 'static')));

const httpServer = createServer(app);
let port = process.env.PORT || 3000;

const io = socketIO(httpServer);

httpServer.listen(port);
console.log(`Server started on port ${port}`);

// This is your test secret API key.
const stripe = require('stripe')(
  'sk_test_51PqQlpD4UkX571U3Ov9ibcLrU3fqL4oamSp42vx8wl4PjNS0f1USJEkSz54uAbhhHALQ9pBqXghaVAKdiyFVvHwP00kDi3orE0',
);

// app.post('/payment-sheet', async (req, res) => {
//   // Use an existing Customer ID if this is a returning customer.
//   const customer = await stripe.customers.create();
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     {customer: customer.id},
//     {apiVersion: '2024-06-20'},
//   );
//   const setupIntent = await stripe.setupIntents.create({
//     customer: customer.id,
//     // In the latest version of the API, specifying the `automatic_payment_methods` parameter
//     // is optional because Stripe enables its functionality by default.
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });
//   res.json({
//     setupIntent: setupIntent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customer.id,
//     publishableKey:
//       'pk_test_51PqQlpD4UkX571U3JIaxfkmVEVWLFA7OVrDB2zeyn2jiS5HScEiO8sCGeMZ9S06g2tF0r7tRZiL49A4p6DYD6Jg300nCoKfNXY',
//   });
// });

app.post('/create-payment-intent', async (req, res) => {
  const {items} = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    //amount: calculateOrderAmount(items),
    amount: 2000,
    currency: 'cad',
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// Handling Error
process.on('unhandledRejection', err => {
  console.log(`An error occurred: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

// Endpoint to get profile pictures
app.get('/profilePicture/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  res.sendFile(filePath);
});

require('./Socket/socketEvent')(io);
require('./Socket/socketFunction').init(io);
connectDB();
