import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {deleteUser} from '../../Redux/Features/AuthSlice';
import {appPink, colors, errorRed} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const DeleteAccount = () => {
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onNextClick = () => {
    setIsError(false);
    console.log('Email from redux, ', userEmail);
    const deleteParams = {
      email: userEmail,
    };

    try {
      setIsLoading(true);
      dispatch(deleteUser(deleteParams));
    } catch (error) {
      console.log('Error deleting account, ', error.response.data);
      setIsError(true);
      setErrorMessage('Error deleting account');
    } finally {
      setIsLoading(false);
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={{padding: 4}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center'}}>
        <View style={{width: '85%'}}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.7,
              marginTop: 10,
              color: 'black',
              textAlign: 'center',
            }}>
            Are you sure you want to delete your account?
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 3.1,
              marginTop: 10,
              color: 'grey',
              textAlign: 'center',
            }}>
            Deleting account will delete all user data including all orders,
            products, and payment information.
          </Text>
        </View>
        {isError && (
          <Text style={{fontSize: calculatedFontSize / 2.9, color: errorRed}}>
            {errorMessage}
          </Text>
        )}
        <View
          style={{
            width: '85%',
            alignItems: 'center',
            marginTop: 40,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
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
                paddingHorizontal: '10%',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: calculatedFontSize / 2.2,
                  fontWeight: '600',
                }}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              borderRadius: 40,
              paddingVertical: '4%',
              alignItems: 'center',
              paddingHorizontal: '10%',
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: '600',
              }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeleteAccount;
