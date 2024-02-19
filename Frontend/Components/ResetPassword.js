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

const ResetPassword = ({ route }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { email } = route.params;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  //hooks
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const onResetClick = async () => {
    if (email.length === 0) {
      Alert.alert('Login', 'Something went wrong');
      return;
    }
    

    if (password != confirmPassword){
      Alert.alert('Login', 'Password do no match');
      return;
    }

    //const loginParams = { email, password };
    const forgetParams = {
      email: email,
      password: password,
    };

    try {
        // console.log(loginParams)
        axios
          .put(baseURL + apiEndpoints.updatePassword, forgetParams)
          .then(res => {
            console.log(res.data);
            navigation.navigate('Login');
          })
          .catch(err => {
            console.log(err);
            Alert.alert('Forget', 'Could not update password');
          });
  
        // Handle the response or navigate to another screen upon successful login
      } catch (error) {
        console.error('Update error:', error);
        // Handle the error, such as displaying an error message to the user
      }
      
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
          onPress={() => onResetClick()}
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
