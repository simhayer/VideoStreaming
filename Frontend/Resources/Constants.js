import {updateUsername} from '../../Backend/middleware/auth';

export const baseURL = 'http://10.0.2.2:3000'; //for android studio
//export const baseURL = 'http://localhost:3000';   //for actual device

// export const apiEndpoints = {
//     login: '/api/auth/login',
//     register: '/api/v1/add_user',
//     logout: '/api/auth/logout',
//     forgetCode: '/api/auth/forgetCode',
//     forgetCodeCheck: '/api/auth/forgetCodeCheck',
//     updatePassword: '/api/v1/updateUser',
//     // Add more API endpoints as needed
//   };

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
  // Add more API endpoints as needed
};
