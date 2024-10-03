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
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import commonStyles from '../../Resources/styles';
import {updateUsername} from '../../Redux/Features/AuthSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink, colors, errorRed} from '../../Resources/Constants';

const ChangeUsername = ({route}) => {
  const {email} = route.params;
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onNextClick = () => {
    if (username.length === 0) {
      setIsError(true);
      setErrorMessage('Please provide a username');
      return;
    }

    setIsLoading(true);

    const updateParams = {email, username};
    dispatch(updateUsername(updateParams))
      .unwrap()
      .then(() => {
        console.log('Username updated successfully');
        setIsLoading(false);
        navigation.navigate('EditProfile');
      })
      .catch(err => {
        console.error('Error:', err);
        setIsError(true);
        setErrorMessage(
          err.data?.message || 'Could not create username. Please try again.',
        );
        setIsLoading(false);
      });
  };

  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current.focus();
    }, 300); // Adjust the delay as needed, 300ms is a good start

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      style={{marginTop: 4, flex: 1, backgroundColor: colors.background}}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={35} color="black" />
      </TouchableOpacity>
      <View style={{marginHorizontal: '7%'}}>
        <Text style={{fontSize: calculatedFontSize / 2, fontWeight: 'bold'}}>
          Change username
        </Text>
        <TextInput
          ref={inputRef}
          value={username}
          onChangeText={username => setUsername(username)}
          placeholder={'Username'}
          style={{
            ...commonStyles.input,
            fontSize: calculatedFontSize / 2.5,
            marginTop: 20,
            marginBottom: 5,
          }}
        />
      </View>
      {isError && (
        <Text
          style={{
            fontSize: calculatedFontSize / 2.9,
            color: errorRed,
            alignSelf: 'center',
          }}>
          {errorMessage}
        </Text>
      )}
      <View style={{marginTop: 40, marginHorizontal: '10%'}}>
        {isLoading ? (
          <ActivityIndicator size="large" color={appPink} />
        ) : (
          <TouchableOpacity
            onPress={onNextClick}
            style={{
              backgroundColor: appPink,
              borderRadius: 40,
              paddingVertical: '4%',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Next
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChangeUsername;
