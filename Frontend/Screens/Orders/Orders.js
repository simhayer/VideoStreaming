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

const Orders = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const userUsername = userData?.user?.username;

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    const payload = {
      buyerUsername: userUsername,
    };
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getAllOrdersForBuyer,
        payload,
      );
      if (response.status === 200) {
        setItems(response.data.orders);
      } else {
        console.error('Failed to fetch orders:', response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );

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
              marginLeft: '30%',
            }}>
            Orders
          </Text>
        </View>
        <View style={{height: '75%'}}>
          <FlatList
            style={{flex: 1}}
            data={items}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              if (!item.product.imageUrl) return null;
              const itemImageFilename = item.product.imageUrl.split('\\').pop();
              const itemImageUrl = `${baseURL}/products/${itemImageFilename}`;
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.2)',
                    marginTop: 10,
                    paddingRight: '3%',
                    justifyContent: 'space-between',
                  }}
                  onPress={() =>
                    navigation.navigate('ViewOrderBuyer', {
                      order: item,
                    })
                  }>
                  <Image
                    source={{uri: itemImageUrl}}
                    resizeMode="contain"
                    style={{width: '20%', height: 100}}
                  />
                  <View style={{width: '65%', marginLeft: 20}}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'left',
                        flexWrap: 'wrap',
                      }}>
                      {item.product.name}
                    </Text>
                    <Text style={{}}>{item.product.size}</Text>
                    <Text style={{}}>{item.status}</Text>
                  </View>

                  <TouchableOpacity onPress={() => handleDeleteItem(item)}>
                    <Icon name="chevron-forward" size={25} color="black" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{
              paddingBottom: 10, // Add padding to avoid the last item being cut off
            }}
            ListEmptyComponent={() => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 50,
                }}>
                <Text style={{fontSize: calculatedFontSize / 2.5}}>
                  No orders found
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Orders;
