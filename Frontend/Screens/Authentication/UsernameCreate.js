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
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import commonStyles from '../../Resources/styles';
import {updateUsername} from '../../Redux/Features/AuthSlice';
import {appPink, colors, errorRed} from '../../Resources/Constants';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const UsernameCreate = ({route}) => {
  const {email} = route.params;
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onNextClick = () => {
    console.log('Username: ', username);
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
        navigation.navigate('Login');
      })
      .catch(err => {
        console.log('Error:', err.data.message);
        setIsError(true);
        setErrorMessage(
          err.data?.message || 'Could not create username. Please try again.',
        );
        setIsLoading(false);
      });
  };

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
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
            style={styles.input}
            placeholderTextColor={'gray'}
          />
        </View>
        {isError && (
          <Text style={{fontSize: calculatedFontSize / 2.9, color: errorRed}}>
            {errorMessage}
          </Text>
        )}
        <View style={{width: '85%', alignItems: 'center', marginTop: 40}}>
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
          )}
        </View>
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

export default UsernameCreate;
