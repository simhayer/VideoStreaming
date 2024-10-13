import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
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
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';

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

    if (response.status === 200) {
      setLoading(false);
    } else {
      console.error('Error marking as complete:', response.data);
    }
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
            {order.status === 'Shipped' ? (
              <ActionButton
                text="Mark as complete"
                onPress={markOrderComplete}
                backgroundColor={appPink}
              />
            ) : order.status === 'Pending' ? (
              <ActionButton
                text="Enter shipping details"
                onPress={() =>
                  navigation.navigate('EnterOrderTracking', {order})
                }
                backgroundColor={appPink}
              />
            ) : null}

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
              {renderOrderDetail('Tracking number', order.trackingNumber)}
              {renderOrderDetail('Status', order.status)}
              {renderOrderDetail('Order Date', formattedDate)}
              {renderOrderDetail('Payment', order.paymentMethod)}
              {renderOrderDetail('Amount', `C$ ${order.amount}`)}
              {renderOrderDetail('Payout', 'Pending')}
            </View>
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

export default ViewOrderSeller;
