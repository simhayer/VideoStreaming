import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Image,
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

const ViewOrderBuyer = ({route}) => {
  const {order} = route.params;
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const itemImageFilename = order.product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/products/${itemImageFilename}`;

  const formattedDate = new Date(order.orderDate).toISOString().split('T')[0];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={{alignItems: 'center', marginTop: '2%'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={40} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2,
              marginLeft: '25%',
            }}>
            Order details
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            height: '20%',
            backgroundColor: 'rgba(0,0,0,0.1)',
            flexDirection: 'row',
            marginTop: '10%',
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
        <View style={{width: '90%'}}>
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 1.8,
              fontWeight: 'bold',
              marginTop: '10%',
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
              Seller
            </Text>
            <Text
              style={{
                color: 'black',
                fontSize: calculatedFontSize / 2.4,
                marginRight: '10%',
              }}>
              {order.seller.username}
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
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ViewOrderBuyer;
