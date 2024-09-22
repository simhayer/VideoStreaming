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
  TextInput,
} from 'react-native';
import {apiEndpoints, appPink, baseURL} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native-gesture-handler';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const SellerOrders = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const userUsername = userData?.user?.username;
  const [search, setSearch] = useState('');

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    const payload = {
      sellerUsername: userUsername,
    };
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getAllOrdersForSeller,
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

  const filteredItems = items.filter(item =>
    item.product.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 6,
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
          Orders
        </Text>
        <View style={{width: 35}} />
      </View>
      <View style={{alignItems: 'center', flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            marginHorizontal: '2.5%',
            borderRadius: 20,
            marginTop: 10,
            height: 'auto',
            paddingHorizontal: '3%',
            alignItems: 'center',
          }}>
          <Icon name="search" size={30} color="grey" />
          <TextInput
            style={{
              paddingVertical: 7,
              minHeight: 25,
              color: 'black',
              flex: 1,
              fontSize: calculatedFontSize / 3,
            }}
            placeholder="Search orders..."
            placeholderTextColor="grey"
            value={search}
            onChangeText={setSearch}
            returnKeyType="send"
            enterKeyHint="send"
          />
          <TouchableOpacity>
            <Icon name="arrow-up-circle" size={35} color="grey" />
          </TouchableOpacity>
        </View>
        <FlatList
          style={{width: '100%', flex: 1}}
          data={filteredItems}
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
                  navigation.navigate('ViewOrderSeller', {
                    order: item,
                  })
                }>
                <Image
                  source={{uri: itemImageUrl}}
                  resizeMode="contain"
                  style={{width: '20%', height: 100}}
                />
                <View style={{width: '70%'}}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'left',
                      flexWrap: 'wrap',
                    }}>
                    {item.product.name}
                  </Text>
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
    </SafeAreaView>
  );
};

export default SellerOrders;
