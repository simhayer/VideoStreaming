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
import {apiEndpoints, appPink, baseURL} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native-gesture-handler';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewProduct = ({route}) => {
  const {name, size, imageUrl, type} = route.params;
  console.log('Route params:', route.params);
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const handleDeleteItem = async () => {
    const payload = {
      email: userEmail,
      products: [{name, size, type, imageUrl}],
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
        </View>
        <Image
          source={{uri: imageUrl}}
          resizeMode="contain"
          style={{width: '100%', height: '50%'}}
        />
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginTop: '5%',
          }}>
          {name}
        </Text>
        {size && (
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2,
              marginTop: '2%',
            }}>
            Size: {size}
          </Text>
        )}

        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2,
            marginTop: '2%',
          }}>
          Type: {type}
        </Text>
        <TouchableOpacity
          onPress={handleDeleteItem}
          style={{
            backgroundColor: appPink,
            borderRadius: 40,
            paddingVertical: '4%',
            paddingHorizontal: '12%',
            marginTop: 20,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ViewProduct;
