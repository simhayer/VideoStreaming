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

const UsernameCreate = ({route}) => {
  const {email} = route.params;
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const {isError, errorMessage} = useSelector(state => state.auth);

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onNextClick = () => {
    console.log('Username: ', username);
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
        navigation.navigate('Login');
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
    <SafeAreaView style={commonStyles.signup}>
      <View style={{alignItems: 'center', marginTop: '12%'}}>
        <View style={{width: '85%'}}>
          <Text style={{fontSize: calculatedFontSize / 2, fontWeight: 'bold'}}>
            Create a username
          </Text>
          <Text style={{fontSize: calculatedFontSize / 2.7, marginTop: '2%'}}>
            You can always change it later
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
          <Text style={{fontSize: calculatedFontSize / 2.9}}>
            {errorMessage}
          </Text>
        )}
        <View style={{width: '85%', alignItems: 'center', marginTop: 40}}>
          <TouchableOpacity
            onPress={onNextClick}
            style={{
              backgroundColor: '#f542a4',
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
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UsernameCreate;
