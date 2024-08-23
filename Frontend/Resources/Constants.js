import {updateUsername} from '../../Backend/middleware/auth';

export const baseURL = 'http://10.0.2.2:3000'; //for android studio
//export const baseURL = 'http://localhost:3000';   //for actual device
//export const baseURL = 'http://10.0.0.139:3000'; //for android studio
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
  // Add more API endpoints as needed
};

export const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkYTIyODY0OS00YmM5LTQxYzctYmI3Yi1jZjA4Y2RlZjNhZmQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyMzY5MTY4MSwiZXhwIjoxNzU1MjI3NjgxfQ.z9HIp4NOtQF0nXAyqPAIvUUcq917rT4WAeglxl5jgxU';

export const appPink = '#f542a4';

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
