import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  baseURL,
  apiEndpoints,
  appPink,
  errorRed,
} from '../../../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import commonStyles from '../../../Resources/styles';

const ResetPassword = ({route}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {email} = route.params;

  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const [isError, setIsError] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [loading, setLoading] = useState(false);

  const onResetClick = async () => {
    if (email.length === 0) {
      setIsError(true);
      setLoginError('Please provide your email');
      return;
    }

    if (password != confirmPassword) {
      setIsError(true);
      setLoginError('Password do no match');
      return;
    }

    setLoading(true);
    const forgetParams = {
      email: email,
      password: password,
    };

    try {
      console.log(forgetParams);
      axios
        .post(baseURL + apiEndpoints.updatePassword, forgetParams)
        .then(res => {
          console.log(res.data);
          navigation.navigate('Login');
        })
        .catch(err => {
          console.log(err);
          setIsError(true);
          setLoginError('Could not update password');
        });
    } catch (error) {
      setIsError(true);
      setLoginError('Could not update password');
    } finally {
      setLoading(false);
    }
  };

  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  }, []);

  const onNextClick = () => {
    newPasswordRef.current.focus();
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: 'white', alignItems: 'center'}}>
      <View style={{width: '85%', marginTop: 10, alignItems: 'center'}}>
        <Text style={{fontSize: calculatedFontSize / 2.7, color: 'black'}}>
          Reset Password
        </Text>

        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder={'Password'}
          style={[commonStyles.authInput, {fontSize: calculatedFontSize / 2.5}]}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="done"
          textContentType="password"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onSubmitEditing={onNextClick}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
          secureTextEntry={true}
        />
        <TextInput
          ref={newPasswordRef}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={'Password'}
          style={[commonStyles.authInput, {fontSize: calculatedFontSize / 2.5}]}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="done"
          textContentType="password"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onSubmitEditing={onResetClick}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
          secureTextEntry={true}
        />
        {isError && (
          <Text style={{fontSize: calculatedFontSize / 2.9, color: errorRed}}>
            {loginError}
          </Text>
        )}

        <View style={{width: '85%', alignItems: 'center', marginTop: '12%'}}>
          {loading ? (
            <ActivityIndicator size="large" color={appPink} />
          ) : (
            <TouchableOpacity
              onPress={onResetClick}
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
                Reset
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.5,
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
                color: appPink,
                textAlign: 'center',
                fontSize: calculatedFontSize / 2.5,
                fontWeight: 'bold',
              }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;
