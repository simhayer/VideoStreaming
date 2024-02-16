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

const ForgetPassword = () => {
  const [email, setEmail] = useState('');


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  //hooks
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const onSendClick = async (email) => {
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
      navigation.navigate('ForgetCode');
  };

  return (
    <View style={commonStyles.signup}>
      <View style={{paddingTop: '20%', alignItems: 'center'}}>
      <Text style={{padding: '3%'}}>Enter your email to recieve reset instructions</Text>

        <TextInput
          value={email}
          onChangeText={email => setEmail(email.trim())}
          placeholder={'Email'}
          style={commonStyles.input}
        />
        <TouchableOpacity
          isloading={isLoading}
          onPress={() => onSendClick(email)}
          style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
          <Text style={{color: 'white', textAlign: 'center'}}>Send Email</Text>
        </TouchableOpacity>
        <Text>Dont have an Account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
          <Text style={{color: 'white', textAlign: 'center'}}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgetPassword;
