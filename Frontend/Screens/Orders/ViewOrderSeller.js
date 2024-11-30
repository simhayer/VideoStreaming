import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
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
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios'; // Import axios
import {useDispatch, useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {markOrderCompleteAction} from '../../Redux/Features/OrdersSlice';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewOrderSeller = ({route}) => {
  const {order} = route.params;
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);

  const itemImageFilename = order.product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/${itemImageFilename}`;
  const hasShippingDetails = order.shippingCompany && order.trackingNumber;
  const [orderStatus, setOrderStatus] = useState(order.status);
  const dispatch = useDispatch();

  const formattedDate = new Date(order.orderDate).toISOString().split('T')[0];

  const markOrderComplete = async () => {
    setLoading(true);

    const payload = {
      orderId: order._id,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.markOrderComplete, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    order.status = 'complete';
    setOrderStatus('complete');

    if (response?.status === 200) {
      dispatch(markOrderCompleteAction({orderId: order._id}));
      setLoading(false);
    } else {
      console.error('Error marking as complete:', response?.data);
    }
  };

  const EnterOrderShipping = () => {
    navigation.navigate('EnterOrderTracking', {order});
  };

  useFocusEffect(
    useCallback(() => {
      // Update the status if a new status is passed when navigating back
      if (route.params?.order?.status) {
        setOrderStatus(route.params.order.status);
      }
    }, [route.params?.order?.status]),
  );

  const openTrackingLink = () => {
    Linking.openURL(order.trackingLink);
  };

  const ActionButton = ({text, onPress, backgroundColor}) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 12,
        width: '60%',
        backgroundColor,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      activeOpacity={0.8}>
      <Text
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: calculatedFontSize / 2.5,
        }}>
        {text}
      </Text>
    </TouchableOpacity>
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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
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
          contentContainerStyle={{alignItems: 'center', paddingBottom: 150}}>
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

          {/* Action Button (Status-Based) */}
          {orderStatus === 'Shipped' &&
            (loading ? (
              <ActivityIndicator
                size="large"
                color={appPink}
                style={{marginTop: 20}}
              />
            ) : (
              <View style={{width: '100%', alignItems: 'center'}}>
                <ActionButton
                  text="Mark as complete"
                  onPress={markOrderComplete}
                  backgroundColor={appPink}
                />
                <Text
                  style={{
                    marginTop: 10,
                    color: 'black',
                    fontSize: 12,
                    textAlign: 'center',
                    marginHorizontal: 20,
                  }}>
                  Mark the order as complete once the buyer receives the item
                </Text>
              </View>
            ))}

          <ActionButton
            text="Edit shipping details"
            onPress={EnterOrderShipping}
            backgroundColor={appPink}
          />

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
            {renderOrderDetail('Buyer', order.buyer.username, () =>
              navigation.navigate('ViewProfile', {
                username: order.buyer.username,
              }),
            )}
            <View style={styles.ListItem}>
              <View>
                <Text style={styles.ListItemNameText}>Shipping details</Text>
                <Text style={styles.AddressText}>
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ''},{' '}
                  {order.address.city}, {order.address.state}{' '}
                </Text>
                <Text style={styles.AddressText}>
                  {order.address.country}, {order.address.postal_code}
                </Text>
              </View>
            </View>
            <View style={styles.ListItem}>
              <View>
                <Text style={styles.ListItemNameText}>Tracking details</Text>
                {!hasShippingDetails ? (
                  <Text style={styles.AddressText}>Add tracking details</Text>
                ) : (
                  <View>
                    <Text style={styles.AddressText}>
                      {order.shippingCompany ? order.shippingCompany : 'N/A'}
                    </Text>
                    <Text style={styles.AddressText}>
                      {order.trackingNumber ? order.trackingNumber : 'N/A'}
                    </Text>
                    {order.trackingLink && (
                      <TouchableOpacity
                        onPress={openTrackingLink}
                        style={{flexDirection: 'row', alignItems: 'center'}}>
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
                          <Icon name="open-outline" size={20} color={appPink} />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
            {renderOrderDetail('Status', orderStatus)}
            {renderOrderDetail('Order Date', formattedDate)}
            {renderOrderDetail('Payment', order.paymentMethod)}
            {renderOrderDetail('Amount', `C$ ${order.amount}`)}
            {renderOrderDetail('Payout', 'Pending')}
          </View>
        </ScrollView>
      </View>
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
  AddressText: {
    marginTop: 3,
    color: 'black',
    fontSize: calculatedFontSize / 2.7,
  },
});

export default ViewOrderSeller;
