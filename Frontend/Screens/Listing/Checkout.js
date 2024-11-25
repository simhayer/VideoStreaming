import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import {PaymentSheet, useStripe} from '@stripe/stripe-react-native';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const Checkout = ({route}) => {
  const {listing} = route.params;
  product = listing.product;
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const navigation = useNavigation();
  const price = listing.price;

  const [shipping, setShipping] = useState('');
  const [quantity, setQuantity] = useState('');

  const {userData} = useSelector(state => state.auth);
  const address = userData?.user?.address;
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);

  const itemImageFilename = product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/${itemImageFilename}`;
  const itemImageUrl = `${baseURL}/${product.imageUrl}`;

  const fetchPaymentSheetParams = async () => {
    const payload = {
      email: userEmail,
      amount: price,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.createPaymentIntent, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {setupIntent, ephemeralKey, customer} = response.data;

    return {
      setupIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {setupIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams();

    const {error} = await initPaymentSheet({
      merchantDisplayName: 'Bars',
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: setupIntent,
      googlePay: {
        merchantCountryCode: 'CA',
        currencyCode: 'CAD',
        testEnv: true,
      },
      defaultBillingDetails: {
        address: {
          country: 'CA',
        },
      },
    });
    //console.log('Error:', error);
    // if (!error) {
    //   setLoading(true);
    // }
  };

  const openPaymentSheet = async () => {
    const {error} = await presentPaymentSheet();

    if (error) {
      console.log('Card add failed');
    } else {
      console.log('card added');
      navigation.navigate('AddPaymentOrShipping');
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const onSubmit = () => {
    initializePaymentSheet();
    openPaymentSheet();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text style={{marginTop: 10, fontSize: calculatedFontSize / 2.5}}>
            Updating...
          </Text>
        </View>
      ) : (
        <View style={{flex: 1}}>
          {/* Header Section */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              paddingTop: 8,
              paddingHorizontal: 0,
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{padding: 5}}>
              <Icon name="chevron-back" size={30} color="black" />
            </TouchableOpacity>
          </View>

          {/* Product summary Section */}
          <ScrollView
            style={{marginTop: 10, flex: 1}}
            contentContainerStyle={{paddingBottom: 150}}>
            <View style={{alignItems: 'center'}}>
              <View
                style={{
                  height: 120,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  marginBottom: 20,
                  width: '90%',
                }}>
                <FastImage
                  source={{uri: itemImageUrl}}
                  style={{
                    width: '30%',
                    height: '100%',
                    borderRadius: 10,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <View style={{marginLeft: 16, flex: 1}}>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: calculatedFontSize / 2.3,
                      marginBottom: 4,
                    }}>
                    {product.name}
                  </Text>
                  {product.size && (
                    <Text
                      style={{
                        color: 'black',
                        fontSize: calculatedFontSize / 2.8,
                      }}>
                      Size: {product.size}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View style={{marginHorizontal: '5%'}}>
              <Text style={{color: 'black', fontSize: calculatedFontSize / 2}}>
                ${price}
              </Text>
            </View>

            <View
              style={{
                marginTop: 10,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                width: '100%',
                flexDirection: 'row',
                paddingVertical: '3%',
                paddingHorizontal: '4%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View style={{flexDirection: 'row'}}>
                <Icon name="home-outline" size={25} color="black" />
                <Text
                  style={{
                    color: 'black',
                    marginLeft: '10%',
                  }}>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}, {address.city}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AddAddress', {address});
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'grey',
                    fontSize: calculatedFontSize / 2.8,
                    padding: 2,
                  }}>
                  EDIT
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onSubmit}
              style={{
                backgroundColor: appPink,
                borderRadius: 30,
                paddingVertical: 14,
                alignItems: 'center',
                marginHorizontal: '10%',
                marginTop: 40,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 4, // Subtle shadow for elevation
                marginBottom: 40,
              }}
              activeOpacity={0.8}>
              <Text
                style={{
                  color: 'white',
                  fontSize: calculatedFontSize / 2.2,
                  fontWeight: 'bold',
                }}>
                Checkout
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 10,
  },
  ListItemNameText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.4,
    fontWeight: 'bold',
  },
  ListItemValueText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.4,
  },
});

export default Checkout;
