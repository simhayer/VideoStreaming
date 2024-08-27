const express = require('express');
const router = express.Router();
const {
  register,
  login,
  update,
  deleteUser,
  logout,
  sendResetCode,
  verifyResetCode,
  updatePassword,
  updateUsername,
  updateProfilePicture,
  addProductToUser,
  removeProductsFromUser,
  getUserProducts,
} = require('../middleware/auth');

const broadcastController = require('../Controllers/broadcastController');
const consumerController = require('../Controllers/consumerController');
const stripeService = require('../Services/stripeService');

//auth routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/update').put(update);
router.route('/deleteUser').delete(deleteUser);
router.route('/logout').post(logout);

router.route('/passwordMail').post(sendResetCode);
router.route('/verifyResetCode').post(verifyResetCode);
router.route('/updatePassword').post(updatePassword);
router.route('/updateUsername').post(updateUsername);
router.post('/updateProfilePicture', updateProfilePicture);

router.route('/addProductToUser').post(addProductToUser);
router.route('/removeProductsFromUser').post(removeProductsFromUser);
router.route('/getUserProducts').post(getUserProducts);

// Broadcast Routes
router.route('/broadcast').post(broadcastController.add);
router.route('/list-broadcast').get(broadcastController.fetch);
router.route('/consumer').post(consumerController.add);

// Stripe Routes
router.route('/paymentSheet').post(stripeService.paymentSheet);
router
  .route('/checkStripePaymentandAddressPresent')
  .post(stripeService.checkStripePaymentandAddressPresent);
//router.route('/create-payment-intent').post(consumerController.createPaymentIntent);

router
  .route('/updateStripeCustomerAddress')
  .post(stripeService.updateStripeCustomerAddress);

router
  .route('/createStripeConnectedAccount')
  .post(stripeService.createStripeConnectedAccount);

router
  .route('/createStripeConnectedAccountRefreshURL')
  .get(stripeService.createStripeConnectedAccountRefreshURL);

router
  .route('/createStripeConnectedAccountReturnURL')
  .get(stripeService.createStripeConnectedAccountReturnURL);

router
  .route('/checkStripeConnectedAccountOnboardingComplete')
  .post(stripeService.checkStripeConnectedAccountOnboardingComplete);

router
  .route('/createStripeLoginLink')
  .post(stripeService.createStripeLoginLink);

router.route('/continueOnboarding').post(stripeService.continueOnboarding);

module.exports = router;
