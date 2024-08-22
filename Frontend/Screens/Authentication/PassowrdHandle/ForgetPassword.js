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
  SafeAreaView,
} from 'react-native';
import {baseURL, apiEndpoints} from '../Resources/Constants';
import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../../../Resources/styles';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {login} from '../Redux/Features/AuthSlice';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  //hooks
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const onSendClick = async email => {
    if (email.length === 0) {
      Alert.alert('Login', 'Please provide your email');
      return;
    }

    //const loginParams = { email, password };
    const forgetParams = {
      email: email,
    };

    try {
      // console.log(loginParams)
      axios
        .post(baseURL + apiEndpoints.forgetCode, forgetParams)
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.log(err);
          Alert.alert('Forget', 'Could not send the reset email');
        });

      // Handle the response or navigate to another screen upon successful login
    } catch (error) {
      console.error('Forget error:', error);
      // Handle the error, such as displaying an error message to the user
    }
    navigation.navigate('ForgetCode', {email});
  };

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView style={commonStyles.signup}>
      <View style={{alignItems: 'center', paddingTop: '12%'}}>
        <View style={{width: '85%'}}>
          <Text style={{padding: '3%', fontSize: calculatedFontSize / 2.7}}>
            Enter your email to recieve reset instructions
          </Text>
          <TextInput
            ref={inputRef}
            value={email}
            onChangeText={email => setEmail(email.trim())}
            placeholder={'Email'}
            style={{
              ...commonStyles.input,
              fontSize: calculatedFontSize / 2.3,
              paddingBottom: '0%',
              marginBottom: '5%',
            }}
          />

          <TouchableOpacity
            onPress={() => onSendClick(email)}
            style={{
              backgroundColor: '#f542a4',
              borderRadius: 40,
              paddingVertical: '4%',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'left',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Send Email
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.2,
                color: 'black',
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Don't have an Account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp', {type: 'Signup'})}
              style={{padding: 10, borderRadius: 5}}>
              <Text
                style={{
                  color: '#f542a4',
                  textAlign: 'center',
                  fontSize: calculatedFontSize / 2.2,
                  fontWeight: 'bold',
                }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgetPassword;
