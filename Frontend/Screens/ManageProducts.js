import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import {apiEndpoints, appPink, baseURL} from '../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native-gesture-handler';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

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

  const handleItemPress = item => {
    setSelectedItem(item);
  };

  const handleDeleteItem = item => {
    // Remove the item from the current list
    setItems(prevItems => prevItems.filter(i => i.name !== item.name));
    // Add the item to the deletedItems list
    setDeletedItems(prevDeletedItems => [...prevDeletedItems, item]);
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
              marginLeft: '22%',
            }}>
            Manage products
          </Text>
        </View>
        <FlatList
          style={{height: '70%', width: '90%'}}
          data={items}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const isSelected = item.name === selectedItem?.name;
            return (
              <Pressable
                onPress={() => handleItemPress(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 20,
                  marginTop: 10,
                  paddingVertical: '3%',
                  paddingHorizontal: '5%',
                  backgroundColor: isSelected ? '#d3d3d3' : 'white', // Highlight selected item
                  justifyContent: 'space-between',
                }}>
                <Icon name="shirt-outline" size={40} color="black" />
                <Text
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'left',
                    width: '60%',
                    maxWidth: '60%',
                  }}>
                  {item.name}
                </Text>
                <Text style={{marginRight: '8%'}}>{item.size}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(item)}>
                  <Icon name="close-circle-outline" size={25} color="red" />
                </TouchableOpacity>
              </Pressable>
            );
          }}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: 'column',
            padding: 10,
          }}
        />
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddProduct')}
        style={{
          backgroundColor: appPink,
          borderRadius: 40,
          paddingVertical: '4%',
          marginHorizontal: '10%',
          marginTop: 20,
        }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
          Add item
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDonePress}
        style={{
          backgroundColor: appPink,
          borderRadius: 40,
          paddingVertical: '4%',
          marginHorizontal: '10%',
          marginTop: 20,
        }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
          Done
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default StartStreamTab;
