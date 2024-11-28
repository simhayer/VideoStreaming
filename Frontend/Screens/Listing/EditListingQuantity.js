import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';
import {markOrderShippedAction} from '../../Redux/Features/OrdersSlice';
import {useDispatch} from 'react-redux';

const EditListingQuantity = ({route}) => {
  const {listing} = route.params;
  const [quantity, setQuantity] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onUpdateClick = async () => {
    if (quantity.length === 0) {
      setIsError(true);
      setErrorMessage('Please provide a tracking number');
      return;
    }

    setLoading(true);

    const payload = {
      listingId: listing._id,
      quantity,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.editListingQuantity, payload)
      .catch(error => {
        console.error('Error updating quantity:', error);
      });

    listing.quantity = quantity;

    if (response.status === 200) {
      setLoading(false);
      navigation.navigate('ViewListingSeller', {
        listing: {
          ...listing,
          quantity,
        },
      });
    } else {
      console.error('Error updating listing quantity:', response.data);
      setIsError(true);
      setErrorMessage('Error updating listing quantity');
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 10,
        backgroundColor: colors.background,
      }}>
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
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={appPink} />
          <Text>Updating...</Text>
        </View>
      ) : (
        <>
          <View style={{width: '85%'}}>
            <TextInput
              ref={inputRef}
              value={quantity}
              onChangeText={quantity => setQuantity(quantity)}
              placeholder={'Quantity'}
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
              returnKeyType="send"
              maxLength={30}
              selectionColor={appPink}
              inputMode="text"
              keyboardType="numeric"
              clearButtonMode="while-editing"
              keyboardAppearance="light"
              onSubmitEditing={onUpdateClick}
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
                fontSize: calculatedFontSize / 2.5,
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

export default EditListingQuantity;
