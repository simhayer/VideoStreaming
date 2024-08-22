import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import {baseURL, apiEndpoints} from '../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import commonStyles from '../../Resources/styles';

import {GoogleSignin} from '@react-native-google-signin/google-signin';

//TODO
const {
  // GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
} = process.env;

//const GOOGLE_ANDROID_CLIENT_ID = "423122273522-adm11brgik1kv9bj2soq8r3ge88rom6g.apps.googleusercontent.com";

GoogleSignin.configure({
  // webClientId: GOOGLE_WEB_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email'],
});

const GoogleLogin = async () => {
  await GoogleSignin.hasPlayServices();
  try {
    const userInfo = await GoogleSignin.signIn();
    console.log(userInfo);
    return userInfo;
  } catch (error) {
    console.log(error);
  }
};

const SignUp = ({route}) => {
  const {type} = route?.params;
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const navigation = useNavigation();

  const onContiueWithEmailClick = () => {
    if (type && type === 'Login') {
      navigation.navigate('Login');
    } else {
      navigation.navigate('SignUp');
    }
  };

  return (
    <SafeAreaView style={commonStyles.signupScreens}>
      <View style={{alignItems: 'center'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: '37%',
            width: '70%',
            justifyContent: 'center',
          }}>
          {type && type === 'Signup' && (
            <Text
              style={{
                fontSize: calculatedFontSize / 1.2,
                color: '#f542a4',
                paddingTop: '10',
                fontWeight: 'bold',
              }}>
              Sign up for
            </Text>
          )}
          {type && type === 'Login' && (
            <Text
              style={{
                fontSize: calculatedFontSize / 1.2,
                color: '#f542a4',
                paddingTop: '10',
                fontWeight: 'bold',
              }}>
              Log in for
            </Text>
          )}
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: calculatedFontSize / 1.2,
              paddingLeft: '5%',
              fontWeight: 'bold',
            }}>
            BARS
          </Text>
        </View>
        <View style={{width: '80%', paddingTop: '3%', alignItems: 'center'}}>
          <Text style={{color: 'black', textAlign: 'center'}}>
            Create a profile, select your interest, discover live, search the
            marketplace, and more...
          </Text>
        </View>
        <View style={{paddingTop: '10%', width: '85%', borderRadius: 5}}>
          <TouchableOpacity
            onPress={() => GoogleLogin()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: '4%',
              width: '100%',
              backgroundColor: '#f542a4',
              borderRadius: 40,
              marginVertical: '2%',
            }}>
            <Image
              source={require('../../Resources/GoogleLogoBlack.png')}
              style={{
                height: '100%',
                width: '26%',
                resizeMode: 'center',
              }}
            />
            <Text
              style={{
                color: 'white',
                flex: 1, // To make the text fill the available space
                textAlign: 'left',
                paddingLeft: '4%',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Continue with Google
            </Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={() => onSignUpClick(fullname, email, password)}
              style={{
                flexDirection: 'row', // To align items horizontally
                alignItems: 'center', // To vertically center the items
                paddingVertical: '4%',
                width: '100%',
                backgroundColor: '#f542a4',
                borderRadius: 40,
                marginVertical: '2%',
              }}>
              <Image
                source={require('../../Resources/AppleLogo.png')}
                style={{
                  height: '100%',
                  width: '1%',
                  paddingLeft: '25%',
                  resizeMode: 'center',
                }}
              />
              <Text
                style={{
                  color: 'white',
                  flex: 1, // To make the text fill the available space
                  textAlign: 'left',
                  paddingLeft: '4%',
                  fontSize: calculatedFontSize / 2.2,
                  fontWeight: 'bold',
                }}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onContiueWithEmailClick()}
            style={{
              flexDirection: 'row', // To align items horizontally
              alignItems: 'center', // To vertically center the items
              paddingVertical: '4%',
              width: '100%',
              backgroundColor: '#f542a4',
              borderRadius: 40,
              marginVertical: '2%',
            }}>
            <Image
              source={require('../../Resources/EmailLogo.png')}
              style={{
                height: '100%',
                width: '26%',
                resizeMode: 'center',
              }}
            />
            <Text
              style={{
                color: 'white',
                flex: 1, // To make the text fill the available space
                textAlign: 'left',
                paddingLeft: '4%',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Continue with Email
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: Platform.OS === 'IOS' ? '40%' : '55%',
            width: '70%',
          }}>
          {type && type === 'Signup' && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: calculatedFontSize / 2.2,
                  color: 'black',
                  fontWeight: 'bold',
                }}>
                Already have an Account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SignUpOptions', {type: 'Login'})
                }
                style={{padding: 10, borderRadius: 5}}>
                <Text
                  style={{
                    color: '#f542a4',
                    textAlign: 'center',
                    fontSize: calculatedFontSize / 2.2,
                    fontWeight: 'bold',
                  }}>
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {type && type === 'Login' && (
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
                onPress={() =>
                  navigation.navigate('SignUpOptions', {type: 'Signup'})
                }
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
          )}
        </View>

        <View style={{width: '70%', paddingTop: '3%', alignItems: 'center'}}>
          <Text style={{color: 'black', textAlign: 'center'}}>
            By clicking continue or sign up you agree to our Terms of Service
            and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
