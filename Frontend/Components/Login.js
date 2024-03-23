import React, {useState} from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import {baseURL, apiEndpoints} from '../Resources/Constants';
import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Resources/styles';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {login} from '../Redux/Features/AuthSlice';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

//TODO
const {
  // GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  // GOOGLE_IOS_CLIENT_ID,
} = process.env;

//const GOOGLE_ANDROID_CLIENT_ID = "423122273522-adm11brgik1kv9bj2soq8r3ge88rom6g.apps.googleusercontent.com";

GoogleSignin.configure({
	// webClientId: GOOGLE_WEB_CLIENT_ID,
	androidClientId: GOOGLE_ANDROID_CLIENT_ID,
	// iosClientId: GOOGLE_IOS_CLIENT_ID,
	scopes: ['profile', 'email'],
});

const GoogleLogin = async () => {
	await GoogleSignin.hasPlayServices();
  try{
    const userInfo = await GoogleSignin.signIn();
    console.log(userInfo);
    return userInfo;
  }
  catch(error){
    console.log(error);
  }

};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isError, setIsError] = useState(false);
  const [loginError, setLoginError] = useState('')

  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  //hooks
  const dispatch = useDispatch();
  const {userData, isLoading, isAuthenticated} = useSelector(state => state.auth);

  const onLoginClick = async (email, password) => {
    if (email.length === 0) {
      Alert.alert('Login', 'Please provide your email');
      return;
    }

    if (password.length === 0) {
      Alert.alert('Login', 'Please provide your password');
      return;
    }
    //const loginParams = { email, password };
    const loginParams = {
      email: email,
      password: password,
    };

    try {
      const result = dispatch(login(loginParams));
      // You can use the result here or return it if needed
      setIsError(false);
      setLoginError('');
      return result;
    } catch (error) {
      console.error('Error during login:', error);
      setIsError(true);
      setLoginError("Error during login");
      return null;
    }
    // dispatch(login(loginParams));

  };

  const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const response = await GoogleLogin();
			const { idToken, user } = response;
      console.log(user.email)
      console.log("here");

			if (idToken) {
				const resp = await authAPI.validateToken({
					token: idToken,
					email: user.email,
				});
				await handlePostLoginData(resp.data);
			}
		} catch (apiError) {
      console.log(apiError);
			setError(
				apiError?.response?.data?.error?.message || 'Something went wrong'
			);
		} finally {
			setLoading(false);
		}
	};

  return (
    <View style={commonStyles.signup}>
      <View style={{paddingTop: '20%', alignItems: 'center'}}>
        <TextInput
          value={email}
          onChangeText={email => setEmail(email.trim())}
          placeholder={'Email'}
          style={commonStyles.input}
        />

        <TextInput
          value={password}
          onChangeText={password => setPassword(password.trim())}
          placeholder={'Password'}
          style={commonStyles.input}
          secureTextEntry={true}
        />

          {isError && (
          <Text>
            Error Here
          </Text>
        )}
        <TouchableOpacity
          isloading={isLoading}
          onPress={() => onLoginClick(email, password)}
          style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
          <Text style={{color: 'white', textAlign: 'center'}}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgetPassword')}
          style={{padding: 10,borderRadius: 5}}>
          <Text style={{color: 'blue', textAlign: 'center'}}>Forget Password?</Text>
        </TouchableOpacity>
        <Text>Dont have an Account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
          <Text style={{color: 'white', textAlign: 'center'}}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          isloading={isLoading}
          onPress={() => handleGoogleLogin()}
          style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
          <Text style={{color: 'white', textAlign: 'center'}}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
