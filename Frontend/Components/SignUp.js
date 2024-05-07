import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {baseURL, apiEndpoints} from '../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import commonStyles from '../Resources/styles';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const navigation = useNavigation();

  const [isError, setIsError] = useState(false);
  const [loginError, setLoginError] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onSignUpClick = async (fullname, email, password) => {

    if (fullname.length === 0) {
      //Alert.alert('Login', 'Please provide your email');
      setIsError(true);
      setLoginError("Please provide your name");
      return;
    }

    if (email.length === 0) {
      //Alert.alert('Login', 'Please provide your email');
      setIsError(true);
      setLoginError("Please provide your email");
      return;
    }

    if (password.length === 0) {
      //Alert.alert('Login', 'Please provide your password');
      setIsError(true);
      setLoginError("Please provide your password");
      return;
    }

    if (password.length < 6) {
      //Alert.alert('Login', 'Please provide your password');
      setIsError(true);
      setLoginError("Password cannot be smaller than 6 digits");
      return;
    }

    try {
      const loginParams = {fullname, email, password};
      // console.log(loginParams)
      axios
        .post(baseURL + apiEndpoints.register, loginParams)
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.log(err);
          setIsError(true);
          setLoginError('Could not create an account');
          // Alert.alert('Login', 'Could not log you in');
        });

      // Handle the response or navigate to another screen upon successful login
    } catch (error) {
      console.error('Login error:', error);
      setIsError(true);
      setLoginError('Could not create an account');
      // Handle the error, such as displaying an error message to the user
    }
    setIsError(false);
    setLoginError('');
    navigation.navigate('Login');
  };

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <View style={commonStyles.signup}>
      <View style={{alignItems:'center', paddingTop:'12%'}}>
        <View style = {{width:'85%'}}>
        <TextInput
         ref={inputRef}
          value={fullname}
          onChangeText={fullname => setFullname(fullname)}
          placeholder={'Full Name'}
          style={{...commonStyles.input,fontSize: calculatedFontSize / 2.3,paddingBottom:'0%',marginBottom:'5%' }}
        />
        <TextInput
          value={email}
          onChangeText={email => setEmail(email.trim())}
          placeholder={'Email'}
          style={{...commonStyles.input,fontSize: calculatedFontSize / 2.3,paddingBottom:'0%',marginBottom:'5%' }}
        />

        <TextInput
          value={password}
          onChangeText={password => setPassword(password.trim())}
          placeholder={'Password'}
          style={{...commonStyles.input,fontSize: calculatedFontSize / 2.3,paddingBottom:'0%',marginBottom:'5%' }}
          secureTextEntry={true}
        />
  
        </View>
        <View style={{width: '70%', paddingTop: '2%', alignItems: 'center'}}>
          <Text style={{color: 'black', textAlign: 'center'}}>
            By clicking continue or sign up you agree to our Terms of Service
            and Privacy Policy
          </Text>
        </View>
        {isError && (
          <Text>
            {loginError}
          </Text>
        )}
        <View style={{width: '85%',alignItems:'center', paddingTop:'15%'}}>
        <TouchableOpacity
          onPress={() => onSignUpClick(fullname, email, password)}
          style={{backgroundColor: '#f542a4', borderRadius: 40,paddingVertical:'4%', alignItems:'center', width:'100%'}}>
          <Text
              style={{
                color: 'white',
                textAlign: 'left',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Signup
            </Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignUp;
