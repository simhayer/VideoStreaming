import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import Home from './Components/Home';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  const {userData} = useSelector(state => state.auth);
  console.log("file: login.js:22 -login - userData: ", userData)
  return (
    <Stack.Navigator>
      {userData ? (
        <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: 'SignUp'}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{title: 'Login'}}
          />
        </Stack.Group>
        
      )}
    </Stack.Navigator>
  );
};

export default MyStack;
