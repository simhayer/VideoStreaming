import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Image,
  Keyboard,
} from 'react-native';
import {appPink, colors} from '../../Resources/Constants';
import {useNavigation} from '@react-navigation/native';
import AuthButton from './AuthButton';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import AuthBottomSheetStack from './AuthBottomSheet';

const AuthOptions = () => {
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const navigation = useNavigation();

  // Animated values for each letter
  const signUpFor = 'Welcome to ';
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

  const [SignUpBottomSheetVisible, setSignUpBottomSheetVisible] =
    useState(false);

  const signupBottomSheetRef = useRef(null);

  const signUpSnapPoints = useMemo(() => ['1%', '90%'], []);

  const handleSignUpSheetChanges = useCallback(index => {
    if (index === 0) {
      Keyboard.dismiss();
      try {
        navigation.popToTop();
      } catch {}
      setInitialRoute(null);
      signupBottomSheetRef.current?.close();
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
    console.log('Closing bottom sheet');
    //navigation.popToTop();
    Keyboard.dismiss();
    signupBottomSheetRef.current?.close();
    //setSignUpBottomSheetVisible(false);
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

        <View style={{flex: 0.3}} />
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
          <View
            style={{
              marginTop: '3%',
              alignItems: 'center',
              marginHorizontal: '8%',
            }}>
            <Text style={styles.description}>
              Step into the Live Marketplace
            </Text>
            <Text style={styles.description}>Where Every Bid Counts!</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{marginTop: 20, width: '85%', borderRadius: 5}}>
            <AuthButton text="Signup" onPress={showSignUpBottomSheet} />
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
          <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
            <AuthBottomSheetStack
              key={initialRoute} // Add key to force re-render
              initialRouteName={initialRoute} // Pass initialRoute here directly
              onClose={closeBottomSheet}
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
    marginBottom: 50,
    alignItems: 'center',
  },
});

export default AuthOptions;
