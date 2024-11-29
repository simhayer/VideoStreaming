import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
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
import {appPink, baseURL, colors} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewOrderBuyer = ({route}) => {
  const {order} = route.params;
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);

  const itemImageFilename = order.product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/${itemImageFilename}`;

  const formattedDate = new Date(order.orderDate).toISOString().split('T')[0];
  const [showDetails, setShowDetails] = useState(false);

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
                Shipping and Tax
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
              {renderOrderDetail('Tracking number', order.trackingNumber)}
              {renderOrderDetail('Status', order.status)}
              {renderOrderDetail('Order Date', formattedDate)}
              {renderOrderDetail('Payment', order.paymentMethod)}
              {orderAmountDetails()}
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

export default ViewOrderBuyer;
