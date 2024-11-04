import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUpOptions from './SignUpOptions';
import LoginOptions from './LoginOptions';
import SignUp from './SignUp';
import Login from './Login';
import UsernameCreate from './UsernameCreate';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Lazy loaded screens
const ForgetPassword = React.lazy(() =>
  import('./PassowrdHandle/ForgetPassword'),
);
const ForgetCode = React.lazy(() => import('./PassowrdHandle/FrogetCode'));
const ResetPassword = React.lazy(() =>
  import('./PassowrdHandle/ResetPassword'),
);

const AuthBottomSheetStack = ({initialRouteName, onClose}) => {
  const Stack = createNativeStackNavigator();

  const closeHeaderOptions = {
    headerTitle: '',
    headerShadowVisible: false,
    headerRight: () => (
      <TouchableOpacity
        onPress={onClose}
        style={{paddingHorizontal: 10, paddingVertical: 5}}>
        <Text style={{color: 'black', fontSize: 16}}>Close</Text>
      </TouchableOpacity>
    ),
  };

  const backHeaderOptions = ({navigation}) => ({
    headerTitle: '',
    headerShadowVisible: false,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          paddingHorizontal: 5,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon name="arrow-back" size={25} color="black" />
        <Text style={{color: 'black', fontSize: 16, marginLeft: 10}}>Back</Text>
      </TouchableOpacity>
    ),
  });

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          presentation: 'card',
          headerShadowVisible: false,
        }}>
        <Stack.Screen
          name="SignUpOptions"
          component={SignUpOptions}
          options={closeHeaderOptions}
        />
        <Stack.Screen
          name="LoginOptions"
          component={LoginOptions}
          options={closeHeaderOptions}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={backHeaderOptions}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={backHeaderOptions}
        />
        <Stack.Screen
          name="UsernameCreate"
          component={UsernameCreate}
          options={backHeaderOptions}
        />
        <Stack.Screen
          name="ForgetPassword"
          component={ForgetPassword}
          options={backHeaderOptions}
        />
        <Stack.Screen
          name="ForgetCode"
          component={ForgetCode}
          options={backHeaderOptions}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={backHeaderOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthBottomSheetStack;
