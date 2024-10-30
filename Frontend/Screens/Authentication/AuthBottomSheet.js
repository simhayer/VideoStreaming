import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUpOptions from './SignUpOptions';
import LoginOptions from './LoginOptions';
import SignUp from './SignUp';
import Login from './Login';
import React from 'react';

const AuthBottomSheetStack = ({route}) => {
  const {initialRoute} = route.params; // Get initialRoute from passed params
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName={initialRoute} // Set the initial route dynamically
      screenOptions={{
        headerShown: false,
        presentation: 'modal', // ensures modal-like navigation
      }}>
      <Stack.Screen name="SignUpOptions" component={SignUpOptions} />
      <Stack.Screen name="LoginOptions" component={LoginOptions} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
};

export default AuthBottomSheetStack;
