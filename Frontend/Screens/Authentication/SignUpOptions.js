import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import {baseURL, apiEndpoints, appPink} from '../../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import commonStyles from '../../Resources/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const SignUp = ({route}) => {
  const {type} = route?.params;
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const navigation = useNavigation();
  const [clientIds, setClientIds] = useState({});

  const onContiueWithEmailClick = () => {
    navigation.navigate(type === 'Login' ? 'Login' : 'SignUp');
  };

  const fetchGoogleClientIds = async () => {
    try {
      const response = await axios.get(
        baseURL + apiEndpoints.getGoogleClientId,
      );
      setClientIds({
        android: response.data.googleAndroidClientId,
        ios: response.data.googleIosClientId,
      });
    } catch (error) {
      console.error('Error fetching Google Client IDs:', error);
    }
  };

  useEffect(() => {
    fetchGoogleClientIds();
  }, []);

  useEffect(() => {
    if (clientIds.android || clientIds.ios) {
      GoogleSignin.configure({
        androidClientId: clientIds.android,
        iosClientId: clientIds.ios,
        scopes: ['profile', 'email'],
      });
    }
  }, [clientIds]);

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

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
      <View style={{flex: 0.4}} />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '70%',
            justifyContent: 'center',
          }}>
          {type && type === 'Signup' && (
            <Text
              style={{
                fontSize: calculatedFontSize / 1.3,
                color: '#f542a4',
                marginTop: '10',
                fontWeight: 'bold',
              }}>
              Sign up for
            </Text>
          )}
          {type && type === 'Login' && (
            <Text
              style={{
                fontSize: calculatedFontSize / 1.3,
                color: '#f542a4',
                marginTop: '10',
                fontWeight: 'bold',
              }}>
              Log in for
            </Text>
          )}
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: calculatedFontSize / 1.3,
              marginLeft: '5%',
              fontWeight: 'bold',
            }}>
            BARS
          </Text>
        </View>
        <View style={{width: '80%', marginTop: '3%', alignItems: 'center'}}>
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.7,
            }}>
            Create a profile, select your interest, discover live, search the
            marketplace, and more...
          </Text>
        </View>
      </View>
      <View style={{marginTop: 20, width: '85%', borderRadius: 5}}>
        <TouchableOpacity
          onPress={GoogleLogin}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: appPink,
            borderRadius: 40,
            marginVertical: '2%',
            paddingVertical: '3%',
            paddingHorizontal: '5%',
          }}>
          <Icon name="logo-google" size={30} color="black" />
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.4,
              textAlign: 'center',
              flex: 1,
            }}>
            Continue with Google
          </Text>
          <View style={{width: 35}} />
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={GoogleLogin}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: appPink,
              borderRadius: 40,
              marginVertical: '2%',
              paddingVertical: '3%',
              paddingHorizontal: '5%',
            }}>
            <TouchableOpacity>
              <Icon name="logo-apple" size={30} color="black" />
            </TouchableOpacity>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.4,
                textAlign: 'center',
                flex: 1,
              }}>
              Continue with Apple
            </Text>
            <View style={{width: 35}} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onContiueWithEmailClick}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: appPink,
            borderRadius: 40,
            marginVertical: '2%',
            paddingVertical: '3%',
            paddingHorizontal: '5%',
          }}>
          <Icon name="mail" size={30} color="black" />
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.4,
              textAlign: 'center',
              flex: 1,
            }}>
            Continue with Email
          </Text>
          <View style={{width: 35}} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 2,
          justifyContent: 'flex-end',
          marginBottom: 20,
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {type && type === 'Signup' && (
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

        <View style={{width: '70%', alignItems: 'center'}}>
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.9,
            }}>
            By clicking continue or sign up you agree to our Terms of Service
            and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
