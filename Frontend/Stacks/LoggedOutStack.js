import {createNativeStackNavigator} from '@react-navigation/native-stack';

//Eager loaded screens
import AuthOptions from '../Screens/Authentication/AuthOptions';
import SignUpOptions from '../Screens/Authentication/SignUpOptions';
import LoginOptions from '../Screens/Authentication/LoginOptions';
import Login from '../Screens/Authentication/Login';
import UsernameCreate from '../Screens/Authentication/UsernameCreate';
import SignUp from '../Screens/Authentication/SignUp';
import React from 'react';

//Lazy loaded screens
const ForgetPassword = React.lazy(() =>
  import('../Screens/Authentication/PassowrdHandle/ForgetPassword'),
);
const ForgetCode = React.lazy(() =>
  import('../Screens/Authentication/PassowrdHandle/FrogetCode'),
);
const ResetPassword = React.lazy(() =>
  import('../Screens/Authentication/PassowrdHandle/ResetPassword'),
);

const Stack = createNativeStackNavigator();

const LoggedOutStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="AuthOptions" component={AuthOptions} />
      <Stack.Screen name="SignUpOptions" component={SignUpOptions} />
      <Stack.Screen name="LoginOptions" component={LoginOptions} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="UsernameCreate" component={UsernameCreate} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
      <Stack.Screen name="ForgetCode" component={ForgetCode} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
};

export default LoggedOutStack;
