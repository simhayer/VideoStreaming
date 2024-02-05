import { baseURL, apiEndpoints } from "../Resources/Constants";
import axios from 'axios';
import {Alert, StyleSheet, View, SafeAreaView, Text} from 'react-native';
import React, { useState } from 'react';
const ServiceRequests = () => {

    const [register, setRegister] = useState(false);
    tokenName = 'token';
    // constructor(props) {
    //     // super(props);
    //     this.state = {
    //         isAuthenticated: false,
    //     };
    // }
    // Login
    // async httpLogin(url, params = {}) {
    //     const response = await fetch(baseURL + url, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         // 'token': this.getToken()
    //     },
    //     body: JSON.stringify(params),
    //     });

    //     return await response.json();
    // }

    // Register
    const httpRegister = async (params = {}) => {
        console.log("HERE")
        console.log(params)
    axios
      .post(baseURL , params)
      .then(res => {
        console.log(res.data);

        // if (res.data.token === '') {
        //   Alert.alert('Login', 'Error occurred while authenticating you');
        //   return;
        // }
        console.log("this",this)
        // setRegister(true)
        // this.setState({
        //   isAuthenticated: true,
        //   //id: res.data.user._id,
        // });
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Login', 'Could not log you in');
      });

    //     try {
    //       const response = await axios.post(baseURL + apiEndpoints.register, params, {
    //         headers: {
    //           'Content-Type': 'application/json',
    //         //   'token': this.getToken()
    //         },
    //       });
    //       return response.data;
    //     } catch (error) {
    //       // Handle errors, log them, or rethrow as needed
    //       throw error;
    //     }
    //   }
    }

    

}


export default ServiceRequests; 