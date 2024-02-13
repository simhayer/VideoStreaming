import React, { useState } from 'react';
import { Alert,View, Text, StyleSheet, TextInput, Button , TouchableOpacity} from 'react-native';
import { baseURL, apiEndpoints } from "../Resources/Constants";
import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Resources/styles';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Redux/Features/AuthSlice';


const Login = () => {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [token, setToken] =  useState("")
    const navigation = useNavigation()

    //hooks
    const dispatch = useDispatch()
    const {userData, isLoading} = useSelector(state => state.auth);

    

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
        const loginParams  = {
          email: email,
          password: password,
        }

        dispatch(login(loginParams))
    
      //   try {
    
      //   const response = await axios.post(baseURL + apiEndpoints.login, loginParams);

      // if (response.data.msg === 'Success Login') {
      //   setIsAuthenticated(true);
      //   setToken(response.data.user.token);
      //   // await AsyncStorage.setItem('token', response.data.user.token); // Store token securely
      //   setToken(response.data.user.token)
      //   console.log(response.data.user.token);
      //   if(response.data.user.token != ""){
      //       navigation.navigate('Home');
      //   }
      //   // Navigate to another screen or perform actions upon successful login
      // } else {
      //   Alert.alert('Login', 'Invalid credentials');
      // }
      //   // Handle the response or navigate to another screen upon successful login
      //   } catch (error) {
      //   console.error('Login error:', error);
      //   // Handle the error, such as displaying an error message to the user
      //   }
    
    };

return (
        <View style={commonStyles.signup}>
        <View style={{paddingTop: '20%',alignItems: 'center'}}>
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
            <TouchableOpacity isloading= {isLoading} onPress={() => onLoginClick(email, password)}  style = {{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    Login
                </Text>
            </TouchableOpacity>
            <Text>Dont have an Account?</Text>
                <TouchableOpacity  onPress={() => navigation.navigate('SignUp')} style={{ padding: 10, backgroundColor: 'blue', borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Signup</Text>
        </TouchableOpacity>
        </View>
        </View>
);
};



export default Login;
