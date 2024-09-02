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
import commonStyles from '../../Resources/styles';
import {updateUsername} from '../../Redux/Features/AuthSlice';
import {apiEndpoints, appPink, baseURL} from '../../Resources/Constants';
import axios from 'axios';

const EnterOrderTracking = ({route}) => {
  const {order} = route.params;
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onUpdateClick = async () => {
    if (trackingNumber.length === 0) {
      setIsError(true);
      setErrorMessage('Please provide a tracking number');
      return;
    }

    setLoading(true);

    const payload = {
      orderId: order._id,
      trackingNumber,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.updateOrderTracking, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    order.trackingNumber = trackingNumber;

    if (response.status === 200) {
      setLoading(false);
      navigation.navigate('ViewOrderSeller', {
        order,
      });
    } else {
      console.error('Error updating order tracking:', response.data);
      setIsError(true);
      setErrorMessage('Error updating order tracking');
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the screen loads
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center', marginTop: '12%'}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text>Updating...</Text>
        </View>
      ) : (
        <>
          <View style={{width: '85%'}}>
            <Text
              style={{fontSize: calculatedFontSize / 1.3, fontWeight: 'bold'}}>
              Enter tracking number
            </Text>
            <TextInput
              ref={inputRef}
              value={trackingNumber}
              onChangeText={trackingNumber => setTrackingNumber(trackingNumber)}
              placeholder={'Tracking number'}
              style={{
                ...commonStyles.input,
                fontSize: calculatedFontSize / 2.3,
                marginTop: '4%',
              }}
            />
          </View>

          {isError && <Text>{errorMessage}</Text>}
          <TouchableOpacity
            onPress={onUpdateClick}
            style={{
              backgroundColor: appPink,
              borderRadius: 40,
              paddingVertical: '4%',
              alignItems: 'center',
              width: '80%',
              marginTop: '10%',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Update
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default EnterOrderTracking;
