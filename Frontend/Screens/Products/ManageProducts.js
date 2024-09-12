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
  Touchable,
  TextInput,
} from 'react-native';
import {apiEndpoints, appPink, baseURL} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native-gesture-handler';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ManageProducts = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Function to fetch products from the backend
  const fetchProducts = async () => {
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
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, []),
  );

  const handleDeleteItem = item => {
    setItems(prevItems => prevItems.filter(i => i.name !== item.name));
    setDeletedItems(prevDeletedItems => [...prevDeletedItems, item._id]);
  };

  const handleDonePress = async () => {
    if (deletedItems.length > 0) {
      const payload = {
        email: userEmail,
        products: deletedItems,
      };

      try {
        const response = await axios.post(
          baseURL + apiEndpoints.removeProductsFromUser,
          payload,
        );
        if (response.status === 200) {
          console.log('Products removed successfully:', response.data);
          // Optionally, navigate back or show a success message
        } else {
          console.error('Failed to remove products:', response.data);
        }
      } catch (error) {
        console.error('Error removing products:', error);
      }
    } else {
      console.log('No products to delete');
    }

    // Navigate back or perform another action
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
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
          Manage products
        </Text>
        <View style={{width: 35}} />
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
      <View style={{flex: 1, width: '100%'}}>
        <FlatList
          style={{flex: 1}}
          data={filteredItems}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            if (!item.imageUrl) return null;
            const itemImageFilename = item.imageUrl.split('\\').pop();
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
                  navigation.navigate('ViewProduct', {
                    name: item.name,
                    size: item.size,
                    imageUrl: itemImageUrl,
                    type: item.type,
                  })
                }>
                <Image
                  source={{uri: itemImageUrl}}
                  resizeMode="contain"
                  style={{width: '20%', height: 100}}
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
                  <Text style={{}}>{item.size}</Text>
                </View>

                <TouchableOpacity onPress={() => handleDeleteItem(item)}>
                  <Icon name="close-circle-outline" size={25} color="red" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{
            paddingBottom: 10, // Add padding to avoid the last item being cut off
          }}
        />
      </View>
      <View style={{height: 'auto', marginBottom: 25}}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProduct')}
          style={{
            backgroundColor: appPink,
            borderRadius: 40,
            paddingVertical: '3%',
            paddingHorizontal: '10%',
            marginTop: 20,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.7,
            }}>
            Add item
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDonePress}
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
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ManageProducts;
