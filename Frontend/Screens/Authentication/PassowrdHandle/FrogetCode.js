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

const ForgetCode = ({route}) => {
  const [code, setCode] = useState('');
  const {email} = route.params;

  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const [isError, setIsError] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [loading, setLoading] = useState(false);

  const onConfirmClick = async () => {
    if (code.length === 0) {
      setIsError(true);
      setLoginError('Please provide your email');
      return;
    }
    setLoading(true);
    const forgetParams = {
      email: email,
      resetCode: code,
    };

    try {
      console.log(forgetParams);
      axios
        .post(baseURL + apiEndpoints.forgetCodeCheck, forgetParams)
        .then(res => {
          //console.log(res.data);
          navigation.navigate('ResetPassword', {email});
        })
        .catch(err => {
          console.log(err);
          setIsError(true);
          setLoginError('Could not confirm the code, please try again');
        });

      // Handle the response or navigate to another screen upon successful login
    } catch (error) {
      setIsError(true);
      setLoginError('Could not confirm the code, please try again');
    } finally {
      setLoading(false);
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: 'white', alignItems: 'center'}}>
      <View style={{width: '85%', marginTop: 10, alignItems: 'center'}}>
        <Text style={{fontSize: calculatedFontSize / 2.7, color: 'black'}}>
          Enter your code you recieved in your email
        </Text>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={setCode}
          placeholder={'Code'}
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: 'black',
            fontSize: calculatedFontSize / 2.5,
            marginTop: 20,
            marginBottom: 5,
            paddingVertical: 10,
            paddingHorizontal: 5,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="next"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onSubmitEditing={onConfirmClick}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
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
              onPress={onConfirmClick}
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
                Send Email
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

export default ForgetCode;
