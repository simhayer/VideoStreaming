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

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  //hooks
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const onResetClick = async (email) => {
    if (email.length === 0) {
      Alert.alert('Login', 'Please provide your email');
      return;
    }

    //const loginParams = { email, password };
    const forgetParams = {
      email: email,
    };

    // try {
    //     // console.log(loginParams)
    //     axios
    //       .post(baseURL + apiEndpoints.register, forgetParams)
    //       .then(res => {
    //         console.log(res.data);
    //       })
    //       .catch(err => {
    //         console.log(err);
    //         Alert.alert('Forget', 'Could not send the reset email');
    //       });
  
    //     // Handle the response or navigate to another screen upon successful login
    //   } catch (error) {
    //     console.error('Forget error:', error);
    //     // Handle the error, such as displaying an error message to the user
    //   }
      navigation.navigate('Login');
  };

  return (
    <View style={commonStyles.signup}>
      <View style={{paddingTop: '20%', alignItems: 'center'}}>
      <Text style={{padding: '3%'}}>Reset Password</Text>

      <TextInput
          value={password}
          onChangeText={password => setPassword(password.trim())}
          placeholder={'Password'}
          style={commonStyles.input}
          secureTextEntry={true}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={confirmPassword => setConfirmPassword(confirmPassword.trim())}
          placeholder={'Re-enter Password'}
          style={commonStyles.input}
          secureTextEntry={true}
        />
        <TouchableOpacity
          isloading={isLoading}
          onPress={() => onResetClick(password)}
          style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
          <Text style={{color: 'white', textAlign: 'center'}}>Reset</Text>
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

export default ResetPassword;
