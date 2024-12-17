import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import {
  baseURL,
  apiEndpoints,
  appPink,
  colors,
  TermsAndConditionsLink,
  PrivacyPolicyLink,
} from '../../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AuthButton from './AuthButton';
import {useDispatch} from 'react-redux';
import {appleLogin, googleLogin} from '../../Redux/Features/AuthSlice';
import appleAuth from '@invertase/react-native-apple-authentication';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const SignUpOptions = ({route}) => {
  clientIds = route.params;
  const navigation = useNavigation();
  //const [clientIds, setClientIds] = useState({});
  const dispatch = useDispatch();
  const [googleSignInLoading, setGoogleSignInLoading] = useState(false);
  const [appleSignInLoading, setAppleSignInLoading] = useState(false);

  const redirectToTermsAndConditions = () => {
    Linking.openURL(TermsAndConditionsLink);
  };

  const redirectToPrivacyPolicy = () => {
    Linking.openURL(PrivacyPolicyLink);
  };

  const onContiueWithEmailClick = () => {
    navigation.navigate('SignUp');
  };

  const GoogleLogin = async () => {
    setGoogleSignInLoading(true);
    if (!clientIds) {
      return;
    }
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

  async function onAppleButtonPress() {
    try {
      setAppleSignInLoading(true);
      // performs login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: it appears putting FULL_NAME first is important, see issue #293
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        // Extract necessary fields from appleAuthRequestResponse
        const {fullName, email, identityToken} = appleAuthRequestResponse;

        const response = await axios.post(
          baseURL + apiEndpoints.handleAppleSignin,
          {
            email,
            fullName: fullName
              ? `${fullName.givenName || ''} ${
                  fullName.familyName || ''
                }`.trim()
              : null,
            profilePicture: '',
            userId: identityToken,
          },
        );

        const params = {
          user: response.data.user,
        };
        dispatch(googleLogin(params));

        return response.data;
      }

      return response.data;
    } catch (error) {
      console.error('Google Login Failed:', error);
      throw error;
    } finally {
      setAppleSignInLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <View style={{flex: 0.4}} />
      <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
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
            Sign up for
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
            Create Account to Start Bidding Live — Explore Real-Time Auctions,
            Exclusive Deals, and more...
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
        {Platform.OS === 'ios' && (
          <AuthButton
            iconName="logo-apple"
            text="Continue with Apple"
            onPress={onAppleButtonPress}
            loading={appleSignInLoading}
          />
        )}
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
              }}>
              Already have an Account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('LoginOptions')}
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
        </View>

        <View style={{width: '70%', justifyContent: 'center'}}>
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.9,
              flexWrap: 'wrap',
            }}>
            By clicking continue or sign up you agree to our{' '}
            <Text
              style={{
                color: appPink,
                textAlign: 'center',
                fontSize: calculatedFontSize / 2.9,
              }}
              onPress={redirectToTermsAndConditions}>
              Terms and Conditions
            </Text>{' '}
            and{' '}
            <Text
              style={{
                color: appPink,
                textAlign: 'center',
                fontSize: calculatedFontSize / 2.9,
              }}
              onPress={redirectToPrivacyPolicy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpOptions;
