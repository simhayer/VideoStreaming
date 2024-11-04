import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {debounce} from 'lodash';
import {fetchOrdersSeller} from '../../Redux/Features/OrdersSlice';
import {appPink, baseURL, colors} from '../../Resources/Constants';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const SellerOrders = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const statusTabs = ['Pending', 'Shipped', 'Completed', 'Cancelled'];

  const {userData} = useSelector(state => state.auth);
  const userUsername = userData?.user?.username;

  const {orders, reduxLoading} = useSelector(state => state.orders);

  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchOrdersSeller(userUsername));
    }
  }, [dispatch, orders, userUsername]);

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

  const filteredItems =
    orders
      .find(item => item._id === selectedStatus)
      ?.orders.filter(
        order =>
          order.product &&
          order.product.name.toLowerCase().includes(search.toLowerCase()),
      ) || [];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchOrdersSeller(userUsername)).finally(() =>
      setRefreshing(false),
    );
  }, [dispatch, userUsername]);

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
            color: 'black',
          }}
          placeholderTextColor="gray"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={appPink}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Tabs for Order Status */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}>
        {statusTabs.map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setSelectedStatus(status)}
            style={{
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedStatus === status ? appPink : 'white',
              marginRight: 10,
              minHeight: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: selectedStatus === status ? 'white' : 'black',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.9,
              }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Section */}
      <View style={{flex: 1, alignItems: 'center', marginTop: 10}}>
        {reduxLoading ? (
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
              minHeight: screenHeight,
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
              if (!item.product) return null;
              const itemImageUrl = `${baseURL}/${item.product.imageUrl
                .split('\\')
                .pop()}`;
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
                  }}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ViewOrderSeller', {order: item})
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
                      ${item.amount}
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

export default SellerOrders;
