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
  Keyboard,
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
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AuthButton from './AuthButton';
import {useDispatch} from 'react-redux';
import {googleLogin} from '../../Redux/Features/AuthSlice';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import SignUpOptions from './SignUpOptions';
import AuthBottomSheetStack from './AuthBottomSheet';
import Icon from 'react-native-vector-icons/Ionicons';

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

  const signUpSnapPoints = useMemo(() => ['1%', '97%'], []);

  const handleSignUpSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      Keyboard.dismiss();
      setSignUpBottomSheetVisible(false);
    }
  }, []);

  const [initialRoute, setInitialRoute] = useState('SignUpOptions'); // Default to SignUpOptions

  const showSignUpBottomSheet = () => {
    setInitialRoute('SignUpOptions');
    setSignUpBottomSheetVisible(true);
    signupBottomSheetRef.current?.expand();
  };

  const showLoginBottomSheet = () => {
    setInitialRoute('LoginOptions');
    setSignUpBottomSheetVisible(true);
    signupBottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    Keyboard.dismiss();
    signupBottomSheetRef.current?.close();
    setSignUpBottomSheetVisible(false);
  };

  const [canGoBack, setCanGoBack] = useState(false);

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
                style={{
                  opacity: animatedBars[index],
                  fontSize: 40,
                  color: 'black',
                  fontWeight: 'bold',
                }}>
                {letter}
              </Animated.Text>
            ))}
          </View>
          <View style={{marginTop: '3%', alignItems: 'center'}}>
            <Text style={styles.description}>
              Step into the Live Marketplace – Where Every Bid Counts!
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{marginTop: 20, width: '85%', borderRadius: 5}}>
            <AuthButton
              text="Signup"
              onPress={showSignUpBottomSheet}
              loading={googleSignInLoading}
            />
            <AuthButton text="Login" onPress={showLoginBottomSheet} />
          </View>
        </View>
      </View>

      {SignUpBottomSheetVisible && (
        <BottomSheet
          ref={signupBottomSheetRef}
          snapPoints={signUpSnapPoints}
          index={SignUpBottomSheetVisible ? 1 : -1}
          onChange={handleSignUpSheetChanges}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -4},
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
          }}>
          <NavigationHeader onClose={closeBottomSheet} canGoBack={canGoBack} />

          <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
            <AuthBottomSheetStack
              route={{params: {initialRoute: initialRoute}}}
              setCanGoBack={setCanGoBack}
            />
          </BottomSheetView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
};

const NavigationHeader = ({onClose, canGoBack}) => {
  const navigation = useNavigation();

  return (
    <View>
      {canGoBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navButton}>
          <Icon name="chevron-back" size={22} color="black" />
        </TouchableOpacity>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginRight: 10,
          }}>
          <TouchableOpacity onPress={onClose} style={styles.navButton}>
            <Text style={{color: 'black', fontSize: 16}}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  animatedLetter: {
    fontSize: 40,
    color: appPink,
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
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default AuthOptions;
