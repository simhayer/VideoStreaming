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
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
  errorRed,
  stripePublishableKey,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import {StripeProvider, useStripe} from '@stripe/stripe-react-native';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const Checkout = ({route}) => {
  const {listing} = route.params;
  product = listing.product;
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const navigation = useNavigation();

  const price = parseFloat(listing.price.toFixed(2));
  const shipping = parseFloat(product.shippingFee.toFixed(2));
  const tax = parseFloat((price * 0.13).toFixed(2));
  const subTotal = parseFloat((price + shipping + tax).toFixed(2));

  const {userData} = useSelector(state => state.auth);
  const address = userData?.user?.address;
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const itemImageUrl = `${baseURL}/${product.imageUrls[0]}`;
  const [showAddressError, setShowAddressError] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const payload = {
      email: userEmail,
      amount: subTotal,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.createPaymentIntent, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {setupIntent, ephemeralKey, customer, paymentId} = response.data;
    setPaymentId(paymentId);
    return {
      setupIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {setupIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams();

    console.log('openPaymentSheet:', setupIntent, ephemeralKey, customer);

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
    if (error) {
      console.error('Error initializing payment sheet:', error.message);
    }
  };

  const openPaymentSheet = async () => {
    console.log('Opening payment sheet');
    if (!paymentId) {
      console.log('Payment ID not found');
      return;
    }
    const {error} = await presentPaymentSheet();

    console.log('Error:', error);

    if (error) {
      console.log('Card add failed');
    } else {
      console.log('card added');

      setLoading(true);

      const payload = {
        buyerUsername: userData.user.username,
        sellerUsername: listing.user.username,
        amount: subTotal,
        productId: product._id,
        addressId: address._id,
        productPrice: price,
        shippingFee: shipping,
        tax: tax,
        paymentId: paymentId,
        listingId: listing._id,
      };

      try {
        const response = await axios
          .post(baseURL + apiEndpoints.createOrder, payload)
          .catch(error => {
            console.error('Error creating order:', error);
          });

        const order = response.data.order;
        //navigation.navigate('ViewOrderBuyer', order);

        navigation.reset({
          index: 1, // The second route (GetStreamSDK) will be the active screen
          routes: [
            {
              name: 'TabControl', // First route is TabControl
              params: {initialTab: 'Shop'}, // Setting Sell tab as the background
            },
            {
              name: 'ViewOrderBuyer', // Second route is GetStreamSDK, making it the active screen
              params: order, // Pass the params for GetStreamSDK
            },
          ],
        });
      } catch (error) {
        console.error('Error adding broadcast:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const onSubmit = () => {
    //initializePaymentSheet();
    if (!address) {
      setShowAddressError(true);
      return;
    }

    openPaymentSheet();
  };

  const onAddressAdd = () => {
    setShowAddressError(false);
    navigation.navigate('AddAddress', {address});
  };

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
              <View style={{paddingHorizontal: '4%', marginTop: 20}}>
                <Text
                  style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
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
                    {price}
                  </Text>
                </View>
              </View>
              {showAddressError && (
                <Text
                  style={{
                    marginTop: 20,
                    paddingHorizontal: '4%',
                    color: errorRed,
                    fontSize: calculatedFontSize / 3,
                  }}>
                  Add your address to proceed
                </Text>
              )}
              {address ? (
                <View
                  style={{
                    marginTop: 20,
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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="home-outline" size={25} color="black" />
                    <Text
                      style={{
                        color: 'black',
                        marginLeft: '12%',
                      }}>
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''},{' '}
                      {address.city}
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
              ) : (
                <View
                  style={{
                    marginTop: 20,
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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="home-outline" size={25} color="black" />
                    <Text
                      style={{
                        color: 'black',
                        marginLeft: '12%',
                      }}>
                      Address
                    </Text>
                  </View>
                  <TouchableOpacity onPress={onAddressAdd}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: 'grey',
                        fontSize: calculatedFontSize / 2.8,
                        padding: 2,
                      }}>
                      ADD
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            <View
              style={{
                borderTopWidth: 2,
                borderColor: 'rgba(0,0,0,0.1)',
                paddingHorizontal: '4%',
                paddingTop: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{color: 'black', fontSize: calculatedFontSize / 2.6}}>
                  Subtotal
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: calculatedFontSize / 2.2,
                      marginRight: 10,
                      fontWeight: 'bold',
                    }}>
                    ${subTotal}
                  </Text>
                  {showPriceDetails ? (
                    <TouchableOpacity
                      style={{padding: 2}}
                      onPress={() => setShowPriceDetails(false)}>
                      <Icon name="chevron-down" size={25} color="black" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{padding: 2}}
                      onPress={() => setShowPriceDetails(true)}>
                      <Icon name="chevron-up" size={25} color="black" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={{color: 'grey', fontSize: calculatedFontSize / 3}}>
                Includes taxes, and shipping fees.{' '}
              </Text>
              {showPriceDetails && (
                <View>
                  <View style={styles.ListItem}>
                    <Text style={styles.ListItemNameText}>Item Price</Text>
                    <Text style={styles.ListItemValueText}>${price}</Text>
                  </View>
                  <View style={styles.ListItem}>
                    <Text style={styles.ListItemNameText}>Shipping</Text>
                    <Text style={styles.ListItemValueText}>+${shipping}</Text>
                  </View>
                  <View style={styles.ListItem}>
                    <Text style={styles.ListItemNameText}>Tax</Text>
                    <Text style={styles.ListItemValueText}>+${tax}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                onPress={onSubmit}
                style={{
                  backgroundColor: appPink,
                  borderRadius: 30,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginHorizontal: '10%',
                  marginTop: 20,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 4, // Subtle shadow for elevation
                  marginBottom: 20,
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
            </View>
          </View>
        )}
      </SafeAreaView>
    </StripeProvider>
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
  },
  ListItemNameText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.9,
  },
  ListItemValueText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.9,
  },
});

export default Checkout;
