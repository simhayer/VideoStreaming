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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import commonStyles from '../../Resources/styles';
import {updateUsername} from '../../Redux/Features/AuthSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../../Resources/Constants';

const ChangeUsername = ({route}) => {
  const {email} = route.params;
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  const dispatch = useDispatch();
  //const {isError, errorMessage} = useSelector(state => state.auth);
  const isError = false;
  const errorMessage = '';

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onNextClick = () => {
    if (username.length === 0) {
      //setIsError(true);
      //setUsernameError('Please provide a username');
      return;
    }

    const updateParams = {email, username};
    dispatch(updateUsername(updateParams))
      .unwrap()
      .then(() => {
        console.log('Username updated successfully');
        navigation.navigate('EditProfile');
      })
      .catch(err => {
        console.error('Error:', err);
        // Handle the error (errorMessage is already set by the Redux state)
      });
  };

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView style={{marginTop: 4, flex: 1}}>
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
          }}
        />
      </View>
      {isError && (
        <Text style={{fontSize: calculatedFontSize / 2.9, alignSelf: 'center'}}>
          {errorMessage}
        </Text>
      )}
      <View style={{marginTop: 40, marginHorizontal: '10%'}}>
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
      </View>
    </SafeAreaView>
  );
};

export default ChangeUsername;
