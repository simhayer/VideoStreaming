import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {debounce} from 'lodash';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ManageProducts = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

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

  const fetchProducts = async () => {
    setLoading(true);
    const payload = {
      email: userEmail,
    };
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getUserProducts,
        payload,
      );
      if (response.status === 200) {
        setItems(response.data.products);
      } else {
        console.error('Failed to fetch products:', response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastTriggeredTimeRef = useRef(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const currentTime = Date.now();
      const MIN_TRIGGER_INTERVAL = 10000;

      if (isFirstLoad) {
        fetchProducts();
        setIsFirstLoad(false);
        lastTriggeredTimeRef.current = currentTime;
      } else {
        const timeSinceLastTrigger = currentTime - lastTriggeredTimeRef.current;

        if (timeSinceLastTrigger >= MIN_TRIGGER_INTERVAL) {
          fetchProducts();
          lastTriggeredTimeRef.current = currentTime;
        }
      }
    }, [isFirstLoad]),
  );

  const toggleSelectItem = useCallback(
    item => {
      if (selectedItems.includes(item._id)) {
        setSelectedItems(prevSelectedItems =>
          prevSelectedItems.filter(id => id !== item._id),
        );
      } else {
        setSelectedItems(prevSelectedItems => [...prevSelectedItems, item._id]);
      }
    },
    [selectedItems],
  );

  const handleDonePress = async () => {
    if (selectedItems.length > 0) {
      const payload = {
        email: userEmail,
        products: selectedItems,
      };

      try {
        const response = await axios.post(
          baseURL + apiEndpoints.removeProductsFromUser,
          payload,
        );
        if (response.status === 200) {
          console.log('Products removed successfully:', response.data);
          setItems(prevItems =>
            prevItems.filter(item => !selectedItems.includes(item._id)),
          );
          setSelectedItems([]); // Clear selection after deletion
        } else {
          console.error('Failed to remove products:', response.data);
        }
      } catch (error) {
        console.error('Error removing products:', error);
      }
    } else {
      console.log('No products to delete');
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

  const ProductItem = React.memo(({item}) => {
    const isSelected = selectedItems.includes(item._id);
    const itemImageUrl = `${baseURL}/${item.imageUrl}`;

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)', // Highlight selected item
          marginTop: 8,
          paddingRight: '3%',
          justifyContent: 'space-between',
          backgroundColor: isSelected ? 'rgba(0,0,0,0.1)' : 'transparent', // Highlight selected item
        }}
        onPress={() =>
          navigation.navigate('ViewProduct', {
            item,
          })
        }>
        <FastImage
          source={{uri: itemImageUrl}}
          style={{width: '20%', height: 100}}
          resizeMode={FastImage.resizeMode.contain}
        />
        <View style={{flex: 1, marginHorizontal: 5}}>
          <Text
            style={{
              fontWeight: 'bold',
              textAlign: 'left',
              flexWrap: 'wrap',
            }}>
            {item.name}
          </Text>
          <Text>{item.size}</Text>
        </View>
        <TouchableOpacity
          style={{padding: 10}}
          onPress={() => toggleSelectItem(item)}>
          <Icon
            name={isSelected ? 'checkmark-circle-outline' : 'ellipse-outline'}
            size={27}
            color="black"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });

  const renderItem = useCallback(
    ({item}) => {
      return <ProductItem item={item} />;
    },
    [items],
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
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
          Products
        </Text>
        {selectedItems.length > 0 ? (
          <TouchableOpacity style={{marginRight: 10}} onPress={handleDonePress}>
            <Icon name="trash-outline" size={35} color="black" />
          </TouchableOpacity>
        ) : (
          <View style={{width: 35, marginRight: 10}} />
        )}
      </View>
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
          value={inputValue}
          onChangeText={handleSearchChange}
          placeholder="Search products..."
          style={{
            paddingVertical: 7,
            minHeight: 25,
            color: 'black',
            flex: 1,
            fontSize: calculatedFontSize / 3,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="next"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          clearButtonMode="while-editing"
          keyboardAppearance="light"
        />
      </View>
      <View style={{flex: 1, width: '100%'}}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="grey"
            style={{marginVertical: 20}}
          />
        ) : (
          <View style={{flex: 1}}>
            <View
              style={{
                width: '95%',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <Text style={{fontSize: calculatedFontSize / 2.7}}>
                Select all
              </Text>
              <TouchableOpacity onPress={toggleSelectAll} style={{padding: 3}}>
                <Icon
                  name={
                    selectAll ? 'checkmark-circle-outline' : 'ellipse-outline'
                  }
                  size={27}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <FlatList
              style={{flex: 1}}
              data={filteredItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
              ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 30}}>
                  <Text>No products found</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
      <View style={{height: 'auto', marginBottom: 25}}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProduct')}
          style={{
            backgroundColor: appPink,
            borderRadius: 40,
            paddingVertical: '3%',
            paddingHorizontal: '12%',
            marginTop: 10,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.7,
            }}>
            Add product
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ManageProducts;
