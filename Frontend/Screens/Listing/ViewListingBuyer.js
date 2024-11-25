import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {set} from 'lodash';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewListingBuyer = ({route}) => {
  const {listing} = route.params;
  product = listing.product;

  const {name, size, type, shippingFee} = product;
  const itemImageUrl = `${baseURL}/${product.imageUrl}`;

  //console.log('Route params:', route.params);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [paymentMethodExist, setPaymentMethodExist] = useState(false);
  const [addressExist, setAddressExist] = useState(false);
  const [address, setAddress] = useState(null);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const handleBuyNow = async () => {
    //checkPaymentandAddressExist(userEmail);

    navigation.navigate('Checkout', {listing});
  };

  const checkPaymentandAddressExist = async email => {
    setLoading(true);
    const payload = {
      email: email,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.checkStripePaymentPresent, payload)
      .catch(error => {
        console.error('Error checking payment present:', error);
      });

    const {paymentPresent, address} = response.data;

    if (paymentPresent) {
      setPaymentMethodExist(true);
    }

    if (address != null) {
      setAddressExist(true);
      setAddress(address);
    }

    setLoading(false);

    return {
      paymentPresent,
      address,
    };
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: 10,
        backgroundColor: colors.background,
        paddingHorizontal: 0, // Added consistent padding
      }}>
      {/* Back Button */}
      <View style={{marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={35} color="black" />
        </TouchableOpacity>
      </View>

      {/* Image Section */}
      <View
        style={{
          flex: 1.2,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          overflow: 'hidden',
          padding: 20,
          marginHorizontal: 10,
        }}>
        <FastImage
          source={{uri: itemImageUrl}}
          style={{flex: 1, width: '100%'}}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>

      {/* Details Section */}
      <View style={{flex: 1, marginBottom: 20, marginHorizontal: 10}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginBottom: 8,
          }}>
          {name}
        </Text>

        {size && (
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.8,
              marginBottom: 8,
            }}>
            Size: {size}
          </Text>
        )}

        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.8,
            marginBottom: 12,
          }}>
          Type: {type}
        </Text>

        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 1.8,
            marginBottom: 8,
          }}>
          ${listing.price}
        </Text>
      </View>

      {/* Delete Button */}
      {loading ? (
        <ActivityIndicator size="large" color={appPink} />
      ) : (
        <TouchableOpacity
          onPress={handleBuyNow}
          style={{
            backgroundColor: appPink,
            borderRadius: 30,
            paddingVertical: 12,
            paddingHorizontal: 40,
            alignSelf: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3, // Elevated button for better visibility
            marginBottom: 30,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.5,
            }}>
            Buy Now
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default ViewListingBuyer;
