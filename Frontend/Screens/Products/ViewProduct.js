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
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewProduct = ({route}) => {
  const {name, size, imageUrl, type} = route.params;
  console.log('Route params:', route.params);
  const navigation = useNavigation();

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
      } else {
        console.error('Failed to remove products:', response.data);
      }
    } catch (error) {
      console.error('Error removing products:', error);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={{flex: 1, marginTop: 10, backgroundColor: colors.background}}>
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1.2,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          marginHorizontal: 10,
        }}>
        <Image
          source={{uri: imageUrl}}
          resizeMode="contain"
          style={{flex: 1, margin: 10}}
        />
      </View>

      <View style={{flex: 1, margin: 10}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2.4,
          }}>
          {name}
        </Text>
        {size && (
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.9,
              marginTop: 10,
            }}>
            Size: {size}
          </Text>
        )}

        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.9,
            marginTop: 10,
          }}>
          Type: {type}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleDeleteItem}
        style={{
          backgroundColor: appPink,
          borderRadius: 40,
          paddingVertical: '4%',
          marginBottom: 40,
          marginHorizontal: '30%',
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
    </SafeAreaView>
  );
};

export default ViewProduct;
