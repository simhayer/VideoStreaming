import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
  shippingTypeOptions,
} from '../../Resources/Constants';
import axios from 'axios';
import {markOrderShippedAction} from '../../Redux/Features/OrdersSlice';
import {useDispatch} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';

const EnterOrderTracking = ({route}) => {
  const {order} = route.params;
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [trackingType, setTrackingType] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [type, setType] = useState('');

  const calculatedFontSize = useMemo(
    () => Dimensions.get('window').height * 0.05,
    [],
  );

  const onUpdateClick = async () => {
    if (!trackingType) {
      setIsError(true);
      setErrorMessage('Please provide a shipping carrier');
      return;
    }
    if (trackingNumber.length === 0) {
      setIsError(true);
      setErrorMessage('Please provide a tracking number');
      return;
    }

    setLoading(true);

    const payload = {
      orderId: order._id,
      shippingCompany: trackingType,
      trackingNumber,
      trackingLink,
    };

    try {
      const response = await axios.post(
        `${baseURL}${apiEndpoints.updateOrderTracking}`,
        payload,
      );

      if (response.status === 200) {
        order.trackingNumber = trackingNumber;
        order.status = 'Shipped';
        dispatch(markOrderShippedAction({orderId: order._id}));
        setLoading(false);
        navigation.navigate('ViewOrderSeller', {
          order: {...order, status: 'Shipped', trackingNumber},
        });
      } else {
        throw new Error(
          response.data.message || 'Error updating order tracking',
        );
      }
    } catch (error) {
      console.error('Error updating order tracking:', error.message);
      setIsError(true);
      setErrorMessage('Error updating order tracking');
      setLoading(false);
    }
  };

  const trackingNumberinputRef = useRef(null);
  const trackingLinkinputRef = useRef(null);
  const trackingTypeinputRef = useRef(null);

  const [isBidBottomSheetVisible, setIsBidBottomSheetVisible] = useState(false);

  const bidBottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      setIsBidBottomSheetVisible(false);
    }
  }, []);

  const snapPoints = useMemo(() => ['10%', '40%'], []);

  const handleShippingTypePress = () => {
    Keyboard.dismiss();
    setIsBidBottomSheetVisible(true);
    bidBottomSheetRef.current?.expand();
  };

  const handleItemPress = item => {
    //setType(item);
    bidBottomSheetRef.current?.close();
    setIsBidBottomSheetVisible(false);

    if (item === 'Other') {
      trackingTypeinputRef.current?.focus();
    } else {
      setType(item);
      setTrackingType(item);
      trackingNumberinputRef.current?.focus();
    }
  };

  const onTrackingTypeSubmit = () => {
    trackingNumberinputRef.current?.focus();
  };

  const screenTap = () => {
    Keyboard.dismiss();
    bidBottomSheetRef.current?.close();
    setIsBidBottomSheetVisible(false);
  };

  const onTrackingNumberSubmit = () => {
    trackingLinkinputRef.current?.focus();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: 10,
        backgroundColor: colors.background,
      }}>
      <TouchableWithoutFeedback onPress={screenTap} style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: 4,
            }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={35} color="black" />
            </TouchableOpacity>
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2,
                textAlign: 'center',
                flex: 1,
              }}>
              Order tracking
            </Text>
            <View style={{width: 35}} />
          </View>
          {loading ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={appPink} />
              <Text>Updating...</Text>
            </View>
          ) : (
            <View style={{flex: 1, alignItems: 'center'}}>
              <View style={{width: '85%', alignItems: 'center'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 20,
                  }}>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.2)',
                      width: '80%',
                      flexDirection: 'row',
                      paddingVertical: '2%',
                      paddingHorizontal: '4%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: 40,
                      marginTop: 20,
                      marginLeft: 20,
                    }}
                    onPress={handleShippingTypePress}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text
                        style={{
                          color: 'black',
                          marginLeft: 10,
                          fontSize: calculatedFontSize / 2.9,
                        }}>
                        {type ? type : 'Shipping carrier'}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={30} color="black" />
                  </TouchableOpacity>
                  <View style={{width: 30}} />
                </View>

                {type === 'Other' && (
                  <TextInput
                    ref={trackingTypeinputRef}
                    value={trackingType}
                    onChangeText={trackingType => setTrackingType(trackingType)}
                    placeholder={'Shipping carrier'}
                    style={{
                      width: '80%',
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
                    clearButtonMode="while-editing"
                    keyboardAppearance="light"
                    onSubmitEditing={onTrackingTypeSubmit}
                  />
                )}

                <TextInput
                  ref={trackingNumberinputRef}
                  value={trackingNumber}
                  onChangeText={trackingNumber =>
                    setTrackingNumber(trackingNumber)
                  }
                  placeholder={'Tracking number'}
                  style={{
                    width: '80%',
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
                  clearButtonMode="while-editing"
                  keyboardAppearance="light"
                  onSubmitEditing={onTrackingNumberSubmit}
                />

                <TextInput
                  ref={trackingLinkinputRef}
                  value={trackingLink}
                  onChangeText={trackingLink => setTrackingLink(trackingLink)}
                  placeholder={'Tracking link'}
                  style={{
                    width: '80%',
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
                  returnKeyType="send"
                  maxLength={30}
                  selectionColor={appPink}
                  inputMode="url"
                  clearButtonMode="while-editing"
                  keyboardAppearance="light"
                  onSubmitEditing={onUpdateClick}
                />
                <Text
                  style={{
                    marginTop: 5,
                    textAlign: 'center',
                    color: 'grey',
                    fontSize: calculatedFontSize / 2.9,
                  }}>
                  Paste the tracking link here. Make sure the link is working.
                  Leave blank if not available.
                </Text>
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
                    fontSize: calculatedFontSize / 2.5,
                    fontWeight: 'bold',
                  }}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      {isBidBottomSheetVisible && (
        <BottomSheet
          ref={bidBottomSheetRef}
          snapPoints={snapPoints}
          index={isBidBottomSheetVisible ? 1 : -1}
          onChange={handleSheetChanges}>
          <BottomSheetView style={{flex: 1, marginLeft: 30}}>
            <FlatList
              style={{flex: 1}}
              data={shippingTypeOptions}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    style={{
                      padding: 12,
                    }}
                    onPress={() => handleItemPress(item)}>
                    <Text style={{fontSize: calculatedFontSize / 2.5}}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            />
          </BottomSheetView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
};

export default EnterOrderTracking;
