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
import {apiEndpoints, appPink, baseURL} from '../../Resources/Constants';
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

  // useEffect(() => {
  //   fetchOrders();
  // }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
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
          />
        </View>
        <FlatList
          style={{height: '70%', width: '100%'}}
          data={items}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 20,
                  marginTop: 10,
                  paddingVertical: '3%',
                  paddingHorizontal: '5%',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontWeight: 'bold'}}>{item.amount}</Text>
                <Text
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'left',
                    width: '58%',
                    maxWidth: '58%',
                  }}>
                  {item.status}
                </Text>
                <Text style={{marginRight: '8%'}}>{item.seller.fullname}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(item)}>
                  <Icon name="chevron-forward" size={30} color="black" />
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: 'column',
            padding: 10,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Orders;
