import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native-gesture-handler';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewOrderSeller = ({route}) => {
  const {order} = route.params;
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);

  const itemImageFilename = order.product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/products/${itemImageFilename}`;

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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text>Updating...</Text>
        </View>
      ) : (
        <ScrollView
          style={{
            marginTop: '2%',
            flex: 1,
            maxHeight: '100%',
          }}
          contentContainerStyle={{alignItems: 'center', paddingBottom: 150}}>
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
              Order details
            </Text>
            <View style={{width: 35}} />
          </View>
          <View
            style={{
              width: '100%',
              height: '15%',
              backgroundColor: 'rgba(0,0,0,0.1)',
              flexDirection: 'row',
              marginTop: 10,
            }}>
            <Image
              source={{uri: imageUrl}}
              resizeMode="contain"
              style={{width: '30%', height: '100%'}}
            />
            <View style={{justifyContent: 'center', marginLeft: '10%'}}>
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: calculatedFontSize / 2.3,
                }}>
                {order.product.name}
              </Text>
              {order.product.size && (
                <Text
                  style={{
                    color: 'black',
                    fontSize: calculatedFontSize / 2.8,
                    marginTop: '5%',
                  }}>
                  Size: {order.product.size}
                </Text>
              )}
            </View>
          </View>
          {order.status === 'Shipped' && (
            <TouchableOpacity
              onPress={markOrderComplete}
              style={{
                paddingVertical: '3%',
                width: '60%',
                backgroundColor: appPink,
                borderRadius: 40,
                marginTop: '6%',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: calculatedFontSize / 2.5,
                  fontWeight: 'bold',
                }}>
                Mark as complete
              </Text>
            </TouchableOpacity>
          )}
          {order.status === 'Pending' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('EnterOrderTracking', {order})}
              style={{
                paddingVertical: '3%',
                width: '60%',
                backgroundColor: appPink,
                borderRadius: 40,
                marginTop: '6%',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: calculatedFontSize / 2.5,
                  fontWeight: 'bold',
                }}>
                Enter shipping details
              </Text>
            </TouchableOpacity>
          )}
          <View style={{width: '90%'}}>
            <Text
              style={{
                color: 'black',
                fontSize: calculatedFontSize / 1.8,
                fontWeight: 'bold',
                marginTop: '8%',
              }}>
              Details
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Buyer
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                {order.buyer.username}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Tracking number
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                {order.trackingNumber}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Status
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                {order.status}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Order Date
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                {formattedDate}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Payment
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                {order.paymentMethod}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Amount
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                C$ {order.amount}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '7%',
                marginTop: '7%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  fontWeight: 'bold',
                }}>
                Payout
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2.4,
                  marginRight: '10%',
                }}>
                Pending
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ViewOrderSeller;
