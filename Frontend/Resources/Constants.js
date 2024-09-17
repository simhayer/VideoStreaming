//export const baseURL = 'http://10.0.2.2:3000'; //for android studio
//export const baseURL = 'http://localhost:3000';   //for actual device
//export const baseURL = 'http://10.0.0.138:3000'; //for android studio
//export const baseURL = 'http://18.116.26.56:3000'; //for AWS EC2
export const baseURL = 'https://thebars.duckdns.org'; //for AWS EC2

//export const baseURL = 'http://192.162.2.118:3000'; //for android studio
//export const baseURL = 'https://wobble-server.onrender.com'; //for android studio

//export const baseURL = 'https://wobble-server-scmcffqdoq-uc.a.run.app/'; //for android studio

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
  // Add more API endpoints as needed
};

export const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkYTIyODY0OS00YmM5LTQxYzctYmI3Yi1jZjA4Y2RlZjNhZmQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyMzY5MTY4MSwiZXhwIjoxNzU1MjI3NjgxfQ.z9HIp4NOtQF0nXAyqPAIvUUcq917rT4WAeglxl5jgxU';

export const appPink = '#f542a4';
export const backgroundColor = 'black';
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
  {label: 'Clothing', value: 'Clothing'},
  {label: 'Sneakers & Footwear', value: 'Footwear'},
  {label: 'Electronics', value: 'Electronics'},
  {label: 'Accessories', value: 'Accessories'},
  {label: 'Video Games', value: 'VideoGames'},
  {label: 'Other', value: 'Other'},
];

export const shoeSizeOptions = [
  {label: 'M4 / W5.5', value: 'M4 / W5.5'},
  {label: 'M4.5 / W6', value: 'M4.5 / W6'},
  {label: 'M5 / W6.5', value: 'M5 / W6.5'},
  {label: 'M5.5 /W7', value: 'M5.5 /W7'},
  {label: 'M6 / W7.5', value: 'M6 / W7.5'},
  {label: 'M6.5 / W8', value: 'M6.5 / W8'},
  {label: 'M7 / W8.5', value: 'M7 / W8.5'},
  {label: 'M7.5 / W9', value: 'M7.5 / W9'},
  {label: 'M8 / W9.5', value: 'M8 / W9.5'},
  {label: 'M8.5 / W10', value: 'M8.5 / W10'},
  {label: 'M9 / W10.5', value: 'M9 / W10.5'},
  {label: 'M9.5 / W11', value: 'M9.5 / W11'},
  {label: 'M10 / W11.5', value: 'M10 / W11.5'},
  {label: 'M10.5 / W12', value: 'M10.5 / W12'},
  {label: 'M11 / W12.5', value: 'M11 / W12.5'},
  {label: 'M11.5 / W13', value: 'M11.5 / W13'},
  {label: 'M12 / W13.5', value: 'M12 / W13.5'},
  {label: 'M12.5 / W14', value: 'M12.5 / W14'},
  {label: 'M13 / W14.5', value: 'M13 / W14.5'},
];

export const clothingSizeOptions = [
  {label: 'XXS', value: 'XXS'},
  {label: 'XS', value: 'XS'},
  {label: 'S', value: 'S'},
  {label: 'M', value: 'M'},
  {label: 'L', value: 'L'},
  {label: 'XL', value: 'XL'},
  {label: 'XXL', value: 'XXL'},
  {label: 'XXXL', value: 'XXXL'},
];

export const GetStreamApiKey = '8ryv3hxy9p2s';

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
