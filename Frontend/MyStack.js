import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUp from './Screens/SignUp';
import SignUpOptions from './Screens/SignUpOptions';
import Login from './Screens/Login';
import ForgetPassword from './Screens/ForgetPassword'
import Home from './Screens/Home';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ForgetCode from './Screens/FrogetCode';
import ResetPassword from './Screens/ResetPassword';
import Icon from 'react-native-vector-icons/FontAwesome';
import VideoScreen from './Screens/VideoScreen'; // Import the new video screen component

const Stack = createNativeStackNavigator();

const MyStack = () => {
  const {userData, isAuthenticated} = useSelector(state => state.auth);
  //const navigation = useNavigation();
  console.log("file: login.js:22 -login - userData: ", userData)
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
          <Stack.Screen name="Video" component={VideoScreen} options={{ title: 'Video' }} />
        </Stack.Group>
        
        
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
            options={{headerShown: false}}
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
