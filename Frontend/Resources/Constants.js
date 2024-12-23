//export const baseURL = 'http://10.0.2.2:3000/api'; //for android studio
//export const baseURLNoApi = 'http://10.0.2.2:3000'; //for AWS EC2
//export const baseURL = 'http://localhost:3000';   //for actual device
//export const baseURL = 'http://10.0.0.134:3000/api'; //for android studio
//export const baseURLNoApi = 'http://10.0.0.134:3000'; //for AWS EC2
//export const baseURL = 'http://18.116.26.56:3000'; //for AWS EC2
//export const baseURL = 'https://thebars.duckdns.org'; //for AWS EC2
export const baseURL = 'https://thebarss.com/api'; //for AWS EC2
export const baseURLNoApi = 'https://thebarss.com'; //for AWS EC2

//export const baseURL = 'http://192.162.2.118:3000'; //for android studio
//export const baseURL = 'https://wobble-server.onrender.com'; //for android studio

export const apiEndpoints = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  forgetCode: '/auth/passwordMail',
  forgetCodeCheck: '/auth/verifyResetCode',
  updatePassword: '/auth/updatePassword',
  addBroadcast: '/auth/broadcast',
  listbroadcast: '/auth/list-broadcast',
  addConsumer: '/auth/consumer',
  updateUsername: '/auth/updateUsername',
  updateProfilePicture: '/auth/updateProfilePicture',
  paymentSheet: '/auth/paymentSheet',
  createPaymentIntent: '/auth/createPaymentIntent',
  checkStripePaymentPresent: '/auth/checkStripePaymentandAddressPresent',
  updateCustomerAddress: '/auth/updateCustomerAddress',
  addProductToUser: '/auth/addProductToUser',
  removeProductsFromUser: '/auth/removeProductsFromUser',
  getUserProducts: '/auth/getUserProducts',
  createStripeConnectedAccount: '/auth/createStripeConnectedAccount',
  checkStripeConnectedAccountOnboardingComplete:
    '/auth/checkStripeConnectedAccountOnboardingComplete',
  createStripeLoginLink: '/auth/createStripeLoginLink',
  continueOnboarding: '/auth/continueOnboarding',
  createOrder: '/auth/createOrder',
  getAllOrdersForBuyer: '/auth/getAllOrdersForBuyer',
  getAllOrdersForSeller: '/auth/getAllOrdersForSeller',
  updateOrderTracking: '/auth/updateOrderTracking',
  markOrderComplete: '/auth/markOrderComplete',
  createStreamUser: '/auth/createStreamUser',
  queryActiveStreamCalls: '/auth/queryActiveStreamCalls',
  getGoogleClientId: '/auth/getGoogleClientId',
  getUserDetailsFromUsername: '/auth/getUserDetailsFromUsername',
  handleGoogleSignin: '/auth/handleGoogleSignin',
  handleAppleSignin: '/auth/handleAppleSignin',
  addUserToBlocked: '/auth/addUserToBlocked',
  createStreamUserForJoining: '/auth/createStreamUserForJoining',
  deleteUser: '/auth/deleteUser',
  createReportUser: '/auth/createReportUser',
  triggerTransferForOrder: '/auth/triggerTransferForOrder',
  getAllOrdersForSellerGroupedByStatus:
    '/auth/getAllOrdersForSellerGroupedByStatus',
  addScheduledStream: '/auth/addScheduledStream',
  listScheduledStream: '/auth/listScheduledStream',
  listScheduledStreamForSeller: '/auth/listScheduledStreamForSeller',
  handleListingCreation: '/auth/handleListingCreation',
  getListingsByUser: '/auth/getListingsByUser',
  deleteListings: '/auth/deleteListings',
  getAllListingsByPage: '/auth/getAllListingsByPage',
  getUserSellerPageDetails: '/auth/getUserSellerPageDetails',
  fetchScheduledStreamsForProfile: '/auth/fetchScheduledStreamsForProfile',
  getListingsForProfile: '/auth/getListingsForProfile',
  markListingAsInactive: '/auth/markListingAsInactive',
  editListingQuantity: '/auth/editListingQuantity',
  updateOrderForRetriedPayment: '/auth/updateOrderForRetriedPayment',
  getStreamApiKey: '/auth/getStreamApiKey',
  // Add more API endpoints as needed
};

export const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkYTIyODY0OS00YmM5LTQxYzctYmI3Yi1jZjA4Y2RlZjNhZmQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyMzY5MTY4MSwiZXhwIjoxNzU1MjI3NjgxfQ.z9HIp4NOtQF0nXAyqPAIvUUcq917rT4WAeglxl5jgxU';

export const appPink = '#f542a4';
export const errorRed = '#ff0000';
export const backgroundColor = 'white';
export const textColor = 'white';
export const lineColor = 'white';

export const colors = {
  primary: '#f542a4',
  secondary: '#42f5a4',
  tertiary: '#a4f542',
  white: '#fff',
  black: '#000',
  grey: '#888',
  lightGrey: '#ccc',
  darkGrey: '#444',
  transparent: 'rgba(0,0,0,0)',
  background: 'white',
  blackContent: 'black',
};

//test key
// export const stripePublishableKey =
//   'pk_test_51PqQlpD4UkX571U3JIaxfkmVEVWLFA7OVrDB2zeyn2jiS5HScEiO8sCGeMZ9S06g2tF0r7tRZiL49A4p6DYD6Jg300nCoKfNXY';

//live key
export const stripePublishableKey =
  'pk_live_51PqQlpD4UkX571U3cMfKXqOoy0R3C2Ko7886zA2NgGu2X9rCDyiwxhfYJds7lV6JTkBGkJOfF5VF8CJ0VBbhgYrv00ujP1Q17h';

export const productTypes = [
  'Clothing',
  'Sneakers & Footwear',
  'Electronics',
  'Accessories',
  'Video Games',
  'Other',
];

export const shoeSizeOptions = [
  'M4 / W5.5',
  'M4.5 / W6',
  'M5 / W6.5',
  'M5.5 /W7',
  'M6 / W7.5',
  'M6.5 / W8',
  'M7 / W8.5',
  'M7.5 / W9',
  'M8 / W9.5',
  'M8.5 / W10',
  'M9 / W10.5',
  'M9.5 / W11',
  'M10 / W11.5',
  'M10.5 / W12',
  'M11 / W12.5',
  'M11.5 / W13',
  'M12 / W13.5',
  'M12.5 / W14',
  'M13 / W14.5',
];

export const clothingSizeOptions = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
];

export const shippingTypeOptions = [
  'UPS',
  'FedEx',
  'DHL',
  'Purolator',
  'CanadaPost',
  'Other',
];

export const TermsAndConditionsLink =
  'https://www.freeprivacypolicy.com/live/1e51c7b4-9c6c-497b-8743-1dfe3abed22b';

export const PrivacyPolicyLink =
  'https://www.freeprivacypolicy.com/live/2ab31078-9cdc-43ca-8cf8-323db1cf9b83';

export const EULA = 'https://portal.termshub.io/bezggj8kie/mobile_eula/';

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
