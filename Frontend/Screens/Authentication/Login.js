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
import {baseURL, apiEndpoints, appPink} from '../../Resources/Constants';
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

  //hooks
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
        result.payload?.status === 401
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

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
      <View style={{width: '85%', marginTop: 30}}>
        <TextInput
          ref={inputRef}
          value={email}
          onChangeText={email => setEmail(email.trim())}
          placeholder={'Email'}
          style={styles.input}
          placeholderTextColor={'gray'}
        />

        <TextInput
          value={password}
          onChangeText={password => setPassword(password.trim())}
          placeholder={'Password'}
          style={styles.input}
          secureTextEntry={true}
          placeholderTextColor={'gray'}
        />
      </View>

      {isError && (
        <Text style={{fontSize: calculatedFontSize / 2.9}}>{loginError}</Text>
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

export default Login;
