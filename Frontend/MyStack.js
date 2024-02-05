import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import Home from './Components/Home'
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const MyStack = () => (
    
    <Stack.Navigator>
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
      <Stack.Screen
        name="Home"
        component={Home}
        options={{title: 'Home'}}
      />
    </Stack.Navigator>

    
);

export default MyStack;