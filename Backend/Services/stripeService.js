const config = require('../config');
const auth = require('../middleware/auth');

const stripe = require('stripe')(config.StripePublishableKey);

const paymentSheet = async (req, res) => {
  const {email} = req.body; // Destructure to get the email from req.body

  let {username, fullname, stripeUserId} = await auth.getUserStripeDetails(
    email,
  );

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

const checkStripePaymentandAddressPresent = async (req, res) => {
  const {email} = req.body; // Destructure to get the email from req.body

  let {username, fullname, stripeUserId} = await auth.getUserStripeDetails(
    email,
  );

  const customer = await stripe.customers.retrieve(stripeUserId);

  if (stripeUserId == null || stripeUserId == '') {
    res.json({paymentPresent: false, address: null});
  }

  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      stripeUserId,
      {
        limit: 3,
      },
    );

    if (paymentMethods.data.length == 0) {
      res.json({paymentPresent: false, address: customer.address});
    } else {
      res.json({paymentPresent: true, address: customer.address});
    }
    //res.json(paymentMethods);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
};

const updateStripeCustomerAddress = async (req, res) => {
  const {email, address} = req.body;
  try {
    let {username, fullname, stripeUserId} = await auth.getUserStripeDetails(
      email,
    );

    // Update customer address on Stripe
    const updatedCustomer = await stripe.customers.update(stripeUserId, {
      address: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      },
    });

    res.json({success: true, customer: updatedCustomer});
  } catch (error) {
    console.error('Error updating customer address:', error);
    res
      .status(500)
      .json({success: false, error: 'Failed to update customer address'});
  }
};

async function fetch(req, res) {
  //   var data = await broadcastService.fetch();
  //   res.json(data);
}

module.exports = {
  paymentSheet,
  checkStripePaymentandAddressPresent,
  updateStripeCustomerAddress,
  fetch,
};
