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
import {
  baseURL,
  apiEndpoints,
  appPink,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AuthButton from './AuthButton';
import {useDispatch} from 'react-redux';
import {googleLogin} from '../../Redux/Features/AuthSlice';

const LoginOptions = ({route}) => {
  // clientIds = route.params;
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const navigation = useNavigation();
  const [clientIds, setClientIds] = useState({});
  const dispatch = useDispatch();
  const [googleSignInLoading, setGoogleSignInLoading] = useState(false);

  const onContiueWithEmailClick = () => {
    navigation.navigate('Login');
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
    if (clientIds.android || clientIds.ios) {
      GoogleSignin.configure({
        androidClientId: clientIds.android,
        iosClientId: clientIds.ios,
        scopes: ['profile', 'email'],
      });
    }
  }, [clientIds]);

  const GoogleLogin = async () => {
    setClientIds(clientIds);
    if (!clientIds?.android) {
      fetchGoogleClientIds();
    }
    setGoogleSignInLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      console.log('Google Login Success:', userInfo);

      const {email, name, photo} = userInfo.user;

      const response = await axios.post(
        baseURL + apiEndpoints.handleGoogleSignin,
        {
          email,
          name,
          profilePicture: photo,
        },
      );

      console.log('Login successful:', response.data);

      const params = {
        user: response.data.user,
      };
      dispatch(googleLogin(params));

      return response.data;
    } catch (error) {
      console.error('Google Login Failed:', error);
      throw error;
    } finally {
      setGoogleSignInLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <View style={{flex: 0.4}} />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '70%',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 1.3,
              color: '#f542a4',
              marginTop: '10',
              fontWeight: 'bold',
            }}>
            Log in for
          </Text>
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
        <AuthButton
          iconName="logo-google"
          text="Continue with Google"
          onPress={GoogleLogin}
          loading={googleSignInLoading}
        />
        {/* {Platform.OS === 'ios' && (
          <AuthButton
            iconName="logo-apple"
            text="Continue with Apple"
            onPress={GoogleLogin}
          />
        )} */}
        <AuthButton
          iconName="mail"
          text="Continue with Email"
          onPress={onContiueWithEmailClick}
        />
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
              onPress={() => navigation.navigate('SignUpOptions')}
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

export default LoginOptions;
