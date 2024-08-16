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
  // Add more API endpoints as needed
};
