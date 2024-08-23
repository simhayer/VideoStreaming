const config = require('../config');
const auth = require('../middleware/auth');

const stripe = require('stripe')(config.StripePublishableKey);

const paymentSheet = async (req, res) => {
  const {email} = req.body; // Destructure to get the email from req.body

  let {username, fullname, stripeUserId} = await auth.getUserDetails(email);

  if (stripeUserId == null || stripeUserId == '') {
    console.log('Stripe ID not found, creating a new customer');
    const customer = await stripe.customers.create({
      name: fullname,
      email: email,
    });
    stripeUserId = customer.id;
    await auth.setUserStripeId(email, stripeUserId); // Save the customer ID with the email
  }

  // Create ephemeral key and setup intent
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: stripeUserId},
    {apiVersion: '2024-06-20'},
  );
  const setupIntent = await stripe.setupIntents.create({
    customer: stripeUserId,
    automatic_payment_methods: {enabled: true},
  });

  res.json({
    setupIntent: setupIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: stripeUserId,
    publishableKey: config.StripePublishableKey,
  });
};

async function fetch(req, res) {
  //   var data = await broadcastService.fetch();
  //   res.json(data);
}

module.exports = {
  paymentSheet,
  fetch,
};
