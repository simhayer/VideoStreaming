    import React, { useState } from 'react';
    import { Alert,View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
    import { baseURL, apiEndpoints } from "../Resources/Constants";
    import axios from 'axios';
    import { useNavigation } from '@react-navigation/native';
    import commonStyles from '../Resources/styles';

    const SignUp = () => {
        const [email,setEmail] = useState("")
        const [password,setPassword] = useState("")
        const [fullname,setFullname] = useState("")
        const navigation = useNavigation();

        const onSignUpClick = async (fullname, email, password) => {
            if (email.length === 0) {
            Alert.alert('Login', 'Please provide your email');
            return;
            }
        
            if (password.length === 0) {
            Alert.alert('Login', 'Please provide your password');
            return;
            }
        
            try {
            const loginParams = {fullname, email, password };
            // console.log(loginParams)
            axios
            .post(baseURL + apiEndpoints.register , loginParams)
            .then(res => {
            console.log(res.data);
    
            })
            .catch(err => {
            console.log(err);
            Alert.alert('Login', 'Could not log you in');
            });
        
            // Handle the response or navigate to another screen upon successful login
            } catch (error) {
            console.error('Login error:', error);
            // Handle the error, such as displaying an error message to the user
            }
            navigation.navigate('Login');
        };

    return (
        <View style={commonStyles.signup}>
        <View style={{paddingTop: '20%',alignItems: 'center'}}>
        <TextInput
            value={fullname}
            onChangeText={fullname => setFullname(fullname)}
            placeholder={'Full Name'}
            style={commonStyles.input}
            />
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
                <TouchableOpacity onPress={() => onSignUpClick(fullname, email, password)} style={{ padding: 10, backgroundColor: 'blue', borderRadius: 5 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Signup</Text>
        </TouchableOpacity>
            <Text>Already have an Account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style = {{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    Login
                </Text>
            </TouchableOpacity>
        </View>
        </View>
    );
    };

    export default SignUp;
