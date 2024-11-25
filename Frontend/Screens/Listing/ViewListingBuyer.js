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
          flex: 1,
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
      <View style={{flex: 1, marginBottom: 20, marginHorizontal: '4%'}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginTop: 10,
          }}>
          {name}
        </Text>

        {size && (
          <View
            style={{
              marginTop: 20,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              width: '100%',
              flexDirection: 'row',
              paddingVertical: '3%',
              paddingHorizontal: '4%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: calculatedFontSize / 2.8,
              }}>
              Size
            </Text>
            <Text
              style={{
                color: 'black',
                fontSize: calculatedFontSize / 2.8,
              }}>
              {size}
            </Text>
          </View>
        )}

        <View
          style={{
            marginTop: 20,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            paddingVertical: '3%',
            paddingHorizontal: '4%',
          }}>
          <View>
            <Text style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
              Buy Now
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2,
                  fontWeight: 'bold',
                }}>
                $
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 1.6,
                  fontWeight: 'bold',
                }}>
                {listing.price}
              </Text>
            </View>
          </View>

          {/* Buy Button */}
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
              marginBottom: 10,
              width: '60%',
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
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ViewListingBuyer;
