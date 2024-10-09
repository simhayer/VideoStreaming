import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
//import {baseURL, apiEndpoints} from '../Resources/Constants';
import {
  baseURL,
  apiEndpoints,
  appPink,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const navigation = useNavigation();

  const [isError, setIsError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignUpClick = async (fullname, email, password) => {
    if (fullname.length === 0) {
      setIsError(true);
      setLoginError('Please provide your name');
      return;
    }

    if (email.length === 0) {
      setIsError(true);
      setLoginError('Please provide your email');
      return;
    }

    if (password.length === 0) {
      setIsError(true);
      setLoginError('Please provide your password');
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setLoginError('Password cannot be smaller than 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const loginParams = {fullname, email, password};
      const res = await axios.post(
        baseURL + apiEndpoints.register,
        loginParams,
      );

      console.log(res.data);
      setIsError(false);
      setLoginError('');
      navigation.navigate('UsernameCreate', {email});
    } catch (err) {
      console.log(err);
      setIsError(true);
      setLoginError(
        err.response?.data?.message || 'Could not create an account',
      );
    } finally {
      setIsLoading(false); // This will ensure loading stops
    }
  };

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  const onNameNextClick = () => {
    emailRef.current?.focus();
  };

  const onEmailNextClick = () => {
    passwordRef.current?.focus();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <View style={{width: '85%', marginTop: 30, alignItems: 'center'}}>
        <TextInput
          ref={nameRef}
          value={fullname}
          onChangeText={setFullname}
          placeholder={'Full Name'}
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: 'black',
            fontSize: calculatedFontSize / 2.5,
            marginTop: 10,
            marginBottom: 5,
            paddingVertical: 10,
            paddingHorizontal: 5,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="next"
          textContentType="name"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onSubmitEditing={onNameNextClick}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
        />

        <TextInput
          ref={emailRef}
          value={email}
          onChangeText={setEmail}
          placeholder={'Email'}
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: 'black',
            fontSize: calculatedFontSize / 2.5,
            marginTop: 10,
            marginBottom: 5,
            paddingVertical: 10,
            paddingHorizontal: 5,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="next"
          textContentType="emailAddress"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onSubmitEditing={onEmailNextClick}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
        />
        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder={'Password'}
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: 'black',
            fontSize: calculatedFontSize / 2.5,
            marginTop: 10,
            marginBottom: 5,
            paddingVertical: 10,
            paddingHorizontal: 5,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="done"
          textContentType="password"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onPress={() => onSignUpClick(fullname, email, password)}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
          secureTextEntry={true}
        />
        {isError && (
          <Text style={{fontSize: calculatedFontSize / 2.7}}>{loginError}</Text>
        )}
      </View>

      <View style={{width: '80%', marginTop: '2%', alignItems: 'center'}}>
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            fontSize: calculatedFontSize / 2.9,
          }}>
          By clicking continue or sign up you agree to our Terms of Service and
          Privacy Policy
        </Text>
      </View>

      <View style={{width: '85%', alignItems: 'center', marginTop: 20}}>
        {isLoading ? (
          <ActivityIndicator size="large" color={appPink} />
        ) : (
          <TouchableOpacity
            onPress={() => onSignUpClick(fullname, email, password)}
            style={{
              backgroundColor: appPink,
              borderRadius: 40,
              paddingVertical: '4%',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'left',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Signup
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
    fontSize: calculatedFontSize / 2.3,
    paddingBottom: '0%',
    marginBottom: '5%',
    height: 40,
  },
});

export default SignUp;
