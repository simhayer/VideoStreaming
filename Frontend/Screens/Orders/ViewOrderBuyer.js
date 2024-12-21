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
  Linking,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
  stripePublishableKey,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
} from '@stripe/stripe-react-native';
import axios from 'axios';
import {set} from 'lodash';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewOrderBuyer = ({route}) => {
  const {order} = route.params;
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);
  const hasShippingDetails = order.shippingCompany && order.trackingNumber;

  const itemImageFilename = order.product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/${itemImageFilename}`;

  const formattedDate = new Date(order.orderDate).toISOString().split('T')[0];
  const [showDetails, setShowDetails] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [retryLoading, setRetryLoading] = useState(false);
  console.log('paymentStatus:', order.paymentStatus);

  const openTrackingLink = () => {
    Linking.openURL(order.trackingLink);
  };

  const fetchPaymentSheetParams = async () => {
    const payload = {
      email: userEmail,
      amount: order.amount,
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

  useEffect(() => {
    if (order.paymentStatus === 'Failed') {
      initializePaymentSheet();
    }
  }, []);

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

      setRetryLoading(true);

      try {
        const payload = {
          paymentId: paymentId,
          orderId: order._id,
        };

        console.log('Updating payment status:', payload);

        var response = await axios.post(
          baseURL + apiEndpoints.updateOrderForRetriedPayment,
          payload,
        );

        console.log('Payment status updated', response.data);

        if (response.data.success) {
          console.log('Payment successful');
          order.paymentStatus = 'Pending';
        }

        console.log('Payment successful');
      } catch (error) {
        console.error('Error updating payment status:', error);
      } finally {
        setRetryLoading(false);
      }
    }
  };

  const renderPaymentDetail = () => (
    <View>
      <View style={styles.ListItem}>
        <Text style={styles.ListItemNameText}>Payment</Text>
        {order.paymentStatus === 'Pending' ? (
          <Text style={styles.ListItemValueText}>Pending</Text>
        ) : order.paymentStatus === 'Success' ? (
          <View
            style={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              paddingVertical: 2,
              paddingHorizontal: 5,
              borderRadius: 5,
            }}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.9,
                fontWeight: 'bold',
                color: 'green',
              }}>
              SUCCESS
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              paddingVertical: 2,
              paddingHorizontal: 5,
              borderRadius: 5,
            }}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.9,
                fontWeight: 'bold',
                color: 'red',
              }}>
              FAILED
            </Text>
          </View>
        )}
      </View>
      {order.paymentStatus === 'Failed' && (
        <View style={{paddingLeft: 10}}>
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.9,
              paddingLeft: 5,
            }}>
            Payment failed. Please try again.
          </Text>
          {retryLoading ? (
            <View
              style={{padding: 5, alignItems: 'flex-start', paddingLeft: 40}}>
              <ActivityIndicator size="small" color={appPink} />
            </View>
          ) : (
            <TouchableOpacity style={{padding: 5}} onPress={openPaymentSheet}>
              <Text
                style={{color: appPink, fontSize: calculatedFontSize / 2.9}}>
                Retry Payment
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderOrderDetail = (label, value, onPress) => (
    <View style={styles.ListItem}>
      <Text style={styles.ListItemNameText}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.ListItemValueText, {color: appPink}]}>
            {value}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.ListItemValueText}>{value}</Text>
      )}
    </View>
  );

  const orderAmountDetails = () => {
    return (
      <View>
        <View style={styles.ListItem}>
          <Text style={styles.ListItemNameText}>Total</Text>

          <View style={{flexDirection: 'row'}}>
            <Text style={styles.ListItemValueText}>C$ {order.amount}</Text>
            {showDetails ? (
              <TouchableOpacity
                style={{padding: 2}}
                onPress={() => setShowDetails(false)}>
                <Icon name="chevron-down" size={20} color="black" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{padding: 2}}
                onPress={() => setShowDetails(true)}>
                <Icon name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {showDetails && (
          <View style={{}}>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.9}}>
                Item Price
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.9,
                  minWidth: 60,
                }}>
                {' '}
                $ {order.productPrice}
              </Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.9}}>
                Shipping
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.9,
                  minWidth: 60,
                }}>
                {' '}
                $ {order.shippingFee}
              </Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.9}}>
                Tax
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.9,
                  minWidth: 60,
                }}>
                {' '}
                $ {order.tax}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
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
                justifyContent: 'space-between',
                width: '100%',
                paddingTop: 8,
                paddingHorizontal: 0,
              }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{padding: 5}}>
                <Icon name="chevron-back" size={30} color="black" />
              </TouchableOpacity>
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: calculatedFontSize / 1.8,
                  textAlign: 'center',
                  flex: 1,
                }}>
                Order Details
              </Text>
              <View style={{width: 30}} />
            </View>

            {/* Order Summary Section */}
            <ScrollView
              style={{marginTop: 10, flex: 1}}
              contentContainerStyle={{
                alignItems: 'center',
                paddingBottom: 150,
              }}>
              <View
                style={{
                  width: '90%',
                  height: 120,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  marginBottom: 20,
                }}>
                <FastImage
                  source={{uri: imageUrl}}
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
                    {order.product.name}
                  </Text>
                  {order.product.size && (
                    <Text
                      style={{
                        color: 'black',
                        fontSize: calculatedFontSize / 2.8,
                      }}>
                      Size: {order.product.size}
                    </Text>
                  )}
                </View>
              </View>

              {/* Order Details Section */}
              <View style={{width: '90%', marginTop: 20}}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: calculatedFontSize / 1.8,
                    fontWeight: 'bold',
                    marginBottom: 10,
                  }}>
                  Details
                </Text>
                {renderOrderDetail('Seller', order.seller.username, () =>
                  navigation.navigate('ViewProfile', {
                    username: order.seller.username,
                  }),
                )}
                <View style={styles.ListItem}>
                  <View>
                    <Text style={styles.ListItemNameText}>
                      Tracking details
                    </Text>
                    {!hasShippingDetails ? (
                      <Text style={styles.AddressText}>Not available yet</Text>
                    ) : (
                      <View>
                        <Text style={styles.AddressText}>
                          {order.shippingCompany
                            ? order.shippingCompany
                            : 'N/A'}
                        </Text>
                        <Text style={styles.AddressText}>
                          Tracking Number -{' '}
                          {order.trackingNumber ? order.trackingNumber : 'N/A'}
                        </Text>
                        {order.trackingLink && (
                          <TouchableOpacity
                            onPress={openTrackingLink}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={[
                                styles.AddressText,
                                {
                                  color: appPink,
                                  textDecorationLine: 'underline',
                                  marginRight: 5,
                                },
                              ]}>
                              Track order
                            </Text>
                            <View style={{marginTop: 2}}>
                              <Icon
                                name="open-outline"
                                size={20}
                                color={appPink}
                              />
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                {renderOrderDetail('Status', order.status)}
                {renderOrderDetail('Order Date', formattedDate)}
                {renderPaymentDetail()}
                {orderAmountDetails()}
              </View>
            </ScrollView>
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
  AddressText: {
    marginTop: 3,
    color: 'black',
    fontSize: calculatedFontSize / 2.7,
  },
});

export default ViewOrderBuyer;
