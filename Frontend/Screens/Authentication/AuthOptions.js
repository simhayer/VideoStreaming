import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  Linking,
  ImageBackground,
  Image,
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
import {googleLogin} from '../../Redux/Features/AuthSlice';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import SignUpOptions from './SignUpOptions';
import AuthBottomSheetStack from './AuthBottomSheet';

const AuthOptions = () => {
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const navigation = useNavigation();
  const [clientIds, setClientIds] = useState({});
  const dispatch = useDispatch();
  const [googleSignInLoading, setGoogleSignInLoading] = useState(false);

  // Animated values for each letter
  const signUpFor = 'Welcome to  ';
  const BARS = 'BARS';

  const [animatedLetters, setAnimatedLetters] = useState(
    signUpFor.split('').map(() => new Animated.Value(0)),
  );
  const [animatedBars, setAnimatedBars] = useState(
    BARS.split('').map(() => new Animated.Value(0)),
  );

  // Animated function for each letter
  const animateText = animatedArray => {
    const animations = animatedArray.map((letterAnim, index) =>
      Animated.timing(letterAnim, {
        toValue: 1, // Full opacity
        duration: 200, // Duration for each letter
        delay: index * 100, // Stagger the animations
        useNativeDriver: true,
      }),
    );
    Animated.stagger(100, animations).start();
  };

  useEffect(() => {
    animateText(animatedLetters); // Animate 'Sign up for'
    setTimeout(() => {
      animateText(animatedBars); // Animate 'BARS' after 'Sign up for'
    }, signUpFor.length * 100);
  }, []);

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
    setGoogleSignInLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {email, name, photo} = userInfo.user;
      const response = await axios.post(
        baseURL + apiEndpoints.handleGoogleSignin,
        {email, name, profilePicture: photo},
      );
      dispatch(googleLogin({user: response.data.user}));
    } catch (error) {
      console.error('Google Login Failed:', error);
    } finally {
      setGoogleSignInLoading(false);
    }
  };

  const [SignUpBottomSheetVisible, setSignUpBottomSheetVisible] =
    useState(false);

  const signupBottomSheetRef = useRef(null);

  const signUpSnapPoints = useMemo(() => ['1%', '90%'], []);

  const handleSignUpSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');

      setSignUpBottomSheetVisible(false);
    }
  }, []);

  const showSignUpBottomSheet = () => {
    setSignUpBottomSheetVisible(true);
    signupBottomSheetRef.current?.expand();
  };

  const [LoginBottomSheetVisible, setLoginBottomSheetVisible] = useState(false);

  const loginBottomSheetRef = useRef(null);

  const handleLoginSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');

      setLoginBottomSheetVisible(false);
    }
  }, []);

  const showLoginBottomSheet = () => {
    setLoginBottomSheetVisible(true);
    loginBottomSheetRef.current?.expand;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}>
      <View style={{flex: 1}}>
        <Image
          source={require('../../Resources/mainBackground.jpg')}
          resizeMode="contain"
          style={{height: '55%', width: '100%'}}></Image>

        <View style={{flex: 0.4}} />
        <View style={{}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {/* Animate 'Sign up for' letter by letter */}
            {signUpFor.split('').map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.animatedLetter,
                  {opacity: animatedLetters[index]},
                ]}>
                {letter}
              </Animated.Text>
            ))}
            {/* Animate 'BARS' letter by letter */}
            {BARS.split('').map((letter, index) => (
              <Animated.Text
                key={index}
                style={[styles.animatedLetter, {opacity: animatedBars[index]}]}>
                {letter}
              </Animated.Text>
            ))}
          </View>
          <View style={{marginTop: '3%', alignItems: 'center'}}>
            <Text style={styles.description}>
              Create a profile, select your interest, discover live, search the
              marketplace, and more...
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Animated.View style={{marginTop: 20, width: '85%', borderRadius: 5}}>
            <AuthButton
              iconName="logo-google"
              text="Singup"
              onPress={showSignUpBottomSheet}
              loading={googleSignInLoading}
            />
            <AuthButton
              iconName="mail"
              text="Login"
              onPress={showLoginBottomSheet}
            />
          </Animated.View>
        </View>
      </View>

      {SignUpBottomSheetVisible && (
        <BottomSheet
          ref={signupBottomSheetRef}
          snapPoints={signUpSnapPoints}
          index={SignUpBottomSheetVisible ? 1 : -1}
          onChange={handleSignUpSheetChanges}>
          <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
            {/* Pass the initialRoute to be 'SignUpOptions' */}
            <AuthBottomSheetStack
              route={{params: {initialRoute: 'SignUpOptions'}}}
            />
          </BottomSheetView>
        </BottomSheet>
      )}
      {LoginBottomSheetVisible && (
        <BottomSheet
          ref={loginBottomSheetRef}
          snapPoints={signUpSnapPoints}
          index={LoginBottomSheetVisible ? 1 : -1}
          onChange={handleLoginSheetChanges}>
          <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
            {/* Pass the initialRoute to be 'LoginOptions' */}
            <AuthBottomSheetStack
              route={{params: {initialRoute: 'LoginOptions'}}}
            />
          </BottomSheetView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  animatedLetter: {
    fontSize: 40,
    color: '#f542a4',
    fontWeight: 'bold',
  },
  description: {
    color: 'black',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    flex: 2,
    justifyContent: 'flex-end',
    marginBottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 10,
    borderRadius: 5,
  },
  loginText: {
    color: '#f542a4',
    fontWeight: 'bold',
  },
  terms: {
    color: 'black',
    textAlign: 'center',
    fontSize: 12,
    flexWrap: 'wrap',
    width: '70%',
  },
  link: {
    color: appPink,
  },
});

export default AuthOptions;
