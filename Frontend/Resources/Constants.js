//export const baseURL = 'http://10.0.2.2:3000'; //for android studio
//export const baseURL = 'http://localhost:3000';   //for actual device
//export const baseURL = 'http://10.0.0.138:3000'; //for android studio
//export const baseURL = 'http://18.116.26.56:3000'; //for AWS EC2
export const baseURL = 'https://thebars.duckdns.org'; //for AWS EC2

//export const baseURL = 'http://192.162.2.118:3000'; //for android studio
//export const baseURL = 'https://wobble-server.onrender.com'; //for android studio

export const apiEndpoints = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  forgetCode: '/api/auth/passwordMail',
  forgetCodeCheck: '/api/auth/verifyResetCode',
  updatePassword: '/api/auth/updatePassword',
  addBroadcast: '/api/auth/broadcast',
  listbroadcast: '/api/auth/list-broadcast',
  addConsumer: '/api/auth/consumer',
  updateUsername: '/api/auth/updateUsername',
  updateProfilePicture: '/api/auth/updateProfilePicture',
  paymentSheet: '/api/auth/paymentSheet',
  checkStripePaymentPresent: '/api/auth/checkStripePaymentandAddressPresent',
  updateStripeCustomerAddress: '/api/auth/updateStripeCustomerAddress',
  addProductToUser: '/api/auth/addProductToUser',
  removeProductsFromUser: '/api/auth/removeProductsFromUser',
  getUserProducts: '/api/auth/getUserProducts',
  createStripeConnectedAccount: '/api/auth/createStripeConnectedAccount',
  checkStripeConnectedAccountOnboardingComplete:
    '/api/auth/checkStripeConnectedAccountOnboardingComplete',
  createStripeLoginLink: '/api/auth/createStripeLoginLink',
  continueOnboarding: '/api/auth/continueOnboarding',
  getAllOrdersForBuyer: '/api/auth/getAllOrdersForBuyer',
  getAllOrdersForSeller: '/api/auth/getAllOrdersForSeller',
  updateOrderTracking: '/api/auth/updateOrderTracking',
  markOrderComplete: '/api/auth/markOrderComplete',
  createStreamUser: '/api/auth/createStreamUser',
  queryActiveStreamCalls: '/api/auth/queryActiveStreamCalls',
  getGoogleClientId: '/api/auth/getGoogleClientId',
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

export const stripePublishableKey =
  'pk_test_51PqQlpD4UkX571U3JIaxfkmVEVWLFA7OVrDB2zeyn2jiS5HScEiO8sCGeMZ9S06g2tF0r7tRZiL49A4p6DYD6Jg300nCoKfNXY';

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
