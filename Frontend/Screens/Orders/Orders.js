import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
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
import FastImage from 'react-native-fast-image';
import {debounce} from 'lodash';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const Orders = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const userUsername = userData?.user?.username;
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useCallback(
    debounce(value => {
      setSearch(value);
    }, 300),
    [],
  );

  const handleSearchChange = value => {
    setInputValue(value);
    debouncedSearch(value);
  };

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredItems = items.filter(item =>
    item.product?.name.toLowerCase().includes(search.toLowerCase()),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 10,
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
            fontSize: calculatedFontSize / 2,
            textAlign: 'center',
            flex: 1,
          }}>
          Orders
        </Text>
        <View style={{width: 30, margin: 5}} />
      </View>

      {/* Search Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: '2.5%',
          marginTop: 12,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 12,
          paddingHorizontal: 10,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
        <Icon name="search" size={24} color="grey" />
        <TextInput
          value={inputValue}
          onChangeText={handleSearchChange}
          placeholder="Search orders..."
          style={{
            flex: 1,
            fontSize: calculatedFontSize / 3,
            paddingVertical: 10,
            paddingHorizontal: 8,
            color: 'black',
          }}
          placeholderTextColor="gray"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={appPink}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity activeOpacity={0.8}>
          <Icon name="arrow-up-circle" size={30} color="grey" />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={{flex: 1, alignItems: 'center', marginTop: 10}}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={appPink}
            style={{marginVertical: 20}}
          />
        ) : (
          <FlatList
            style={{width: '100%'}}
            data={filteredItems}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              paddingBottom: 20,
              paddingHorizontal: '2.5%',
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
            renderItem={({item}) => {
              if (!item.product.imageUrl) return null;
              const itemImageFilename = item.product.imageUrl.split('\\').pop();
              const itemImageUrl = `${baseURL}/${itemImageFilename}`;

              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 12,
                    marginBottom: 12,
                    padding: 10,
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ViewOrderBuyer', {order: item})
                  }>
                  <FastImage
                    source={{uri: itemImageUrl}}
                    style={{width: 80, height: 80, borderRadius: 10}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: calculatedFontSize / 2.5,
                        marginBottom: 4,
                      }}>
                      {item.product.name}
                    </Text>
                    <Text style={{fontSize: calculatedFontSize / 2.8}}>
                      {item.status}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={25} color="black" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Orders;
