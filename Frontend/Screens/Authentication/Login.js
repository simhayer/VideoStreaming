import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  baseURL,
  apiEndpoints,
  appPink,
  errorRed,
  colors,
} from '../../Resources/Constants';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {login} from '../../Redux/Features/AuthSlice';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isError, setIsError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const onLoginClick = async (email, password) => {
    if (email.length === 0) {
      setIsError(true);
      setLoginError('Please provide your email');
      return;
    }

    if (password.length === 0) {
      setIsError(true);
      setLoginError('Please provide a password');
      return;
    }

    setIsLoading(true);

    const loginParams = {
      email: email,
      password: password,
    };

    try {
      const result = await dispatch(login(loginParams));
      if (
        result.meta.requestStatus === 'rejected' &&
        (result.payload?.status === 400 || result.payload?.status === 401)
      ) {
        setIsError(true);
        setLoginError(
          result.payload?.data?.message || 'Invalid login credentials',
        );
      } else if (result.meta.requestStatus === 'fulfilled') {
        setIsError(false);
        setLoginError('');
      }
      return result;
    } catch (error) {
      console.error('Error during login:', error);
      setIsError(true);
      setLoginError('Error during login');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const onNextClick = () => {
    passwordRef.current.focus();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <View style={{width: '85%', marginTop: 30}}>
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
          onSubmitEditing={onNextClick}
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
          onSubmitEditing={() => onLoginClick(email, password)}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
          secureTextEntry={true}
        />
      </View>
      {isError && (
        <Text style={{fontSize: calculatedFontSize / 2.9, color: errorRed}}>
          {loginError}
        </Text>
      )}
      <View style={{width: '85%', alignItems: 'center', marginTop: '12%'}}>
        {isLoading ? (
          <ActivityIndicator size="large" color={appPink} />
        ) : (
          <TouchableOpacity
            onPress={() => onLoginClick(email, password)}
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
              Login
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgetPassword')}
        style={{padding: 10, borderRadius: 5}}>
        <Text
          style={{
            color: 'blue',
            textAlign: 'center',
            fontSize: calculatedFontSize / 2.7,
          }}>
          Forget Password?
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;
