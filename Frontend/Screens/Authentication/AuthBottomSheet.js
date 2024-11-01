import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUpOptions from './SignUpOptions';
import LoginOptions from './LoginOptions';
import SignUp from './SignUp';
import Login from './Login';
import React from 'react';

const Stack = createNativeStackNavigator();

const AuthBottomSheetStack = ({route, setCanGoBack}) => {
  const {initialRoute} = route.params; // Get initialRoute from passed params

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
      screenListeners={{
        state: e => {
          const routeCount = e.data.state.routes.length;
          setCanGoBack(routeCount > 1); // Update "can go back" status
        },
      }}>
      <Stack.Screen name="SignUpOptions" component={SignUpOptions} />
      <Stack.Screen name="LoginOptions" component={LoginOptions} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
};

export default AuthBottomSheetStack;
