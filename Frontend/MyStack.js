import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUp from './Components/SignUp';
import SignUpOptions from './Components/SignUpOptions';
import Login from './Components/Login';
import ForgetPassword from './Components/ForgetPassword'
import Home from './Components/Home';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ForgetCode from './Components/FrogetCode';
import ResetPassword from './Components/ResetPassword';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  const {userData, isAuthenticated} = useSelector(state => state.auth);
  console.log("file: login.js:22 -login - userData: ", userData)
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="SignUpOptions"
            component={SignUpOptions} // Corrected: Removed the function invocation
            initialParams= {{type: 'Signup'}}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{title: 'ForgetPassword'}}
          />
          <Stack.Screen
            name="ForgetCode"
            component={ForgetCode}
            options={{title: 'ForgetCode'}}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPassword}
            options={{title: 'ResetPassword'}}
          />
        </Stack.Group>
        
      )}
    </Stack.Navigator>
  );
};

export default MyStack;
