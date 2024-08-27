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

const createStripeConnectedAccount = async (req, res) => {
  const {email, address} = req.body;
  try {
    let {username, fullname, stripeUserId} = await auth.getUserStripeDetails(
      email,
    );

    const account = await stripe.accounts.create({
      controller: {
        losses: {
          payments: 'application',
        },
        fees: {
          payer: 'application',
        },
        stripe_dashboard: {
          type: 'express',
        },
      },
      business_profile: {
        url: 'https://hayersimrat23.wixsite.com/getpanda',
        mcc: '5734',
        product_description: 'Test product description',
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url:
        config.SERVER_URL + '/api/auth/createStripeConnectedAccountRefreshURL',
      return_url:
        config.SERVER_URL + '/api/auth/createStripeConnectedAccountReturnURL',
      type: 'account_onboarding',
      collection_options: {
        fields: 'eventually_due',
      },
    });

    await auth.setUserStripeConnectedAccountId(email, account.id);

    res.json({
      success: true,
      accountId: account.id,
      accountLink: accountLink,
    });
  } catch (error) {
    console.error('Error updating customer address:', error);
    res
      .status(500)
      .json({success: false, error: 'Failed to update customer address'});
  }
};

const createStripeConnectedAccountReturnURL = async (req, res) => {
  console.log('Return URL called');
  console.log(req.body);
  res.json({message: 'Return URL called'});
};

const createStripeConnectedAccountRefreshURL = async (req, res) => {
  console.log('Refresh URL called');
  console.log(req.body);
  //const {email, address} = req.body;
  try {
    const account = await stripe.accounts.create({
      controller: {
        losses: {
          payments: 'application',
        },
        fees: {
          payer: 'application',
        },
        stripe_dashboard: {
          type: 'express',
        },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url:
        config.SERVER_URL + '/api/auth/createStripeConnectedAccountRefreshURL',
      return_url:
        config.SERVER_URL + '/api/auth/createStripeConnectedAccountReturnURL',
      type: 'account_onboarding',
      collection_options: {
        fields: 'eventually_due',
      },
    });

    await auth.setUserStripeConnectedAccountId(email, account.id);

    res.redirect(accountLink.url);
  } catch (error) {
    console.error('Error updating customer address:', error);
    res
      .status(500)
      .json({success: false, error: 'Failed to update customer address'});
  }
};

const checkStripeConnectedAccountOnboardingComplete = async (req, res) => {
  const {email} = req.body;
  try {
    const {stripeConnectedAccountId} = await auth.getUserStripeDetails(email);
    console.log('Account ID:', stripeConnectedAccountId);
    if (stripeConnectedAccountId == null || stripeConnectedAccountId == '') {
      return res.json({success: false, accountId: stripeConnectedAccountId});
    }
    const account = await stripe.accounts.retrieve(stripeConnectedAccountId);

    if (
      account.requirements.currently_due == null ||
      account.requirements.currently_due.length == 0
    ) {
      res.json({success: true, accountId: stripeConnectedAccountId});
    } else {
      res.json({success: false, accountId: stripeConnectedAccountId});
    }
  } catch (error) {
    console.error('Error checking account onboarding status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check account onboarding status',
    });
  }
};

const createStripeLoginLink = async (req, res) => {
  const {email} = req.body;
  try {
    const {stripeConnectedAccountId} = await auth.getUserStripeDetails(email);
    console.log('Account ID:', stripeConnectedAccountId);
    if (stripeConnectedAccountId == null || stripeConnectedAccountId == '') {
      return res.json({success: false, accountId: stripeConnectedAccountId});
    }
    const loginLink = await stripe.accounts.createLoginLink(
      stripeConnectedAccountId,
    );
    res.json({success: true, loginLink: loginLink});
  } catch (error) {
    console.error('Error creating login link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create login link',
    });
  }
};

const continueOnboarding = async (req, res) => {
  const {email} = req.body;
  try {
    const {stripeConnectedAccountId} = await auth.getUserStripeDetails(email);
    console.log('Account ID:', stripeConnectedAccountId);
    if (stripeConnectedAccountId == null || stripeConnectedAccountId == '') {
      return res.json({success: false, accountId: stripeConnectedAccountId});
    }

    try {
      const loginLink = await stripe.accounts.createLoginLink(
        stripeConnectedAccountId,
      );

      res.json({
        success: true,
        accountId: stripeConnectedAccountId,
        loginLink: loginLink,
      });
    } catch (error) {
      console.error('Error creating login link:, Starting new onboarding');
      const account = await stripe.accounts.create({
        controller: {
          losses: {
            payments: 'application',
          },
          fees: {
            payer: 'application',
          },
          stripe_dashboard: {
            type: 'express',
          },
        },
        business_profile: {
          url: 'https://hayersimrat23.wixsite.com/getpanda',
          mcc: '5734',
          product_description: 'Test product description',
        },
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url:
          config.SERVER_URL +
          '/api/auth/createStripeConnectedAccountRefreshURL',
        return_url:
          config.SERVER_URL + '/api/auth/createStripeConnectedAccountReturnURL',
        type: 'account_onboarding',
        collection_options: {
          fields: 'eventually_due',
        },
      });

      await auth.setUserStripeConnectedAccountId(email, account.id);

      res.json({
        success: true,
        accountId: account.id,
        loginLink: accountLink,
      });
    }
  } catch (error) {
    console.error('Error creating login link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create login link',
    });
  }
};

module.exports = {
  paymentSheet,
  checkStripePaymentandAddressPresent,
  updateStripeCustomerAddress,
  createStripeConnectedAccount,
  createStripeConnectedAccountReturnURL,
  createStripeConnectedAccountRefreshURL,
  checkStripeConnectedAccountOnboardingComplete,
  createStripeLoginLink,
  continueOnboarding,
};
