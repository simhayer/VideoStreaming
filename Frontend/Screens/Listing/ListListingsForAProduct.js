import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import axios from 'axios';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ListListingsForAProduct = ({route}) => {
  const {product} = route.params;
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const [items, setItems] = useState([]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseURL}${apiEndpoints.getListingsByProduct}`,
        {productId: product._id.toString()},
      );
      if (response.status === 200) {
        setItems(response.data.listings);
      } else {
        setItems([]);
      }
    } catch (error) {
      setError(true);
      setItems([]);
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      fetchListings();
    }
  }, []);

  const handleListProduct = async () => {
    navigation.navigate('SubmitListing', {product: product});
  };

  const toggleSelectItem = item => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(item._id)) {
        return prevSelectedItems.filter(id => id !== item._id);
      } else {
        return [...prevSelectedItems, item._id];
      }
    });
  };

  const handleDonePress = async () => {
    if (selectedItems.length === 0) {
      console.log('No products to delete');
      return;
    }

    const payload = {
      email: userEmail,
      listingIds: selectedItems,
    };

    try {
      const response = await axios.post(
        `${baseURL}${apiEndpoints.deleteListings}`,
        payload,
      );

      if (response.status === 200) {
        console.log('Listings deleted successfully:', response.data);
        fetchListings();
      } else {
        console.error('Failed to delete listings:', response.data);
      }
    } catch (error) {
      console.error('Error deleting listings:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
    setSelectAll(!selectAll);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const ProductItem = React.memo(({item}) => {
    const isSelected = selectedItems.includes(item._id);
    const itemImageUrl = `${baseURL}/${item.product.imageUrls[0]}`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#4CAF50' : 'rgba(0, 0, 0, 0.1)',
          backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.1)' : 'white',
          marginVertical: 6,
          padding: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() =>
          navigation.navigate('ViewListingSeller', {listing: item})
        }>
        <FastImage
          source={{uri: itemImageUrl}}
          style={{width: 80, height: 80, borderRadius: 8}}
          resizeMode={FastImage.resizeMode.cover}
          defaultSource={require('../../Resources/StreamListThumbnailBlur.png')}
        />
        <View style={{flex: 1, marginHorizontal: 12}}>
          <Text style={{fontWeight: '600', fontSize: 16}} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={{color: 'gray', marginTop: 4}}>{item.product.size}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleSelectItem(item)}>
          <Icon
            name={isSelected ? 'checkmark-circle-outline' : 'ellipse-outline'}
            size={30}
            color={isSelected ? '#4CAF50' : 'black'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });

  const renderItem = ({item}) => {
    return <ProductItem item={item} />;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 7,
      }}>
      {/* Header Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 8,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        {selectedItems.length > 0 ? (
          <TouchableOpacity
            style={{padding: 5, marginRight: 10}}
            onPress={handleDonePress}>
            <Icon name="trash-outline" size={30} color="black" />
          </TouchableOpacity>
        ) : (
          <View style={{width: 35, marginRight: 10}} />
        )}
      </View>

      {/* Main Content */}
      <View style={{flex: 1, width: '100%', paddingBottom: 20}}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={appPink}
            style={{marginVertical: 20}}
          />
        ) : (
          <View style={{flex: 1}}>
            {/* Select All Section */}
            <View
              style={{
                width: '95%',
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: calculatedFontSize / 2.7}}>
                Select all
              </Text>
              <TouchableOpacity onPress={toggleSelectAll} style={{padding: 5}}>
                <Icon
                  name={
                    selectAll ? 'checkmark-circle-outline' : 'ellipse-outline'
                  }
                  size={27}
                  color="black"
                />
              </TouchableOpacity>
            </View>

            {/* Product List */}
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{flex: 1}}
              data={items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              extraData={selectedItems}
              contentContainerStyle={{paddingBottom: 20}}
              ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 50}}>
                  <Text style={{fontSize: 18, color: 'gray'}}>
                    No listings found
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        )}
      </View>

      {/* Add Product Button */}
      <View style={{width: '100%', alignItems: 'center', marginBottom: 20}}>
        <TouchableOpacity
          onPress={handleListProduct}
          style={{
            backgroundColor: appPink,
            borderRadius: 30,
            paddingVertical: 12,
            paddingHorizontal: 32,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.5,
            }}>
            Add Listing
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ListListingsForAProduct;
