import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import axios from 'axios';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const SubmitListing = ({route}) => {
  const {product} = route.params;
  const navigation = useNavigation();
  const [price, setPrice] = useState('');
  const [shipping, setShipping] = useState('');
  const [quantity, setQuantity] = useState('');

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);

  const itemImageFilename = product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/${itemImageFilename}`;

  const onSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        email: userEmail,
        price: price,
        shipping: shipping,
        quantity: quantity,
        productId: product._id,
      };

      const response = await axios
        .post(baseURL + apiEndpoints.handleListingCreation, payload)
        .catch(error => {
          console.error('Error submitting listing:', error);
        });

      if (response?.status === 200) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    iconName,
    value,
    onChangeText,
    placeholder,
    maxLength = 10,
  }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}>
        <Icon name={iconName} size={30} color="black" />
        <Text
          style={{
            fontSize: 18,
            marginLeft: 20,
            color: 'grey',
          }}>
          $
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={{
            width: '66%',
            borderBottomWidth: 1,
            borderColor: 'black',
            fontSize: 16,
            marginLeft: 10,
            paddingVertical: 10,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="next"
          maxLength={maxLength}
          selectionColor="pink"
          keyboardType="numeric"
          clearButtonMode="while-editing"
          keyboardAppearance="light"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text style={{marginTop: 10, fontSize: calculatedFontSize / 2.5}}>
            Updating...
          </Text>
        </View>
      ) : (
        <View style={{flex: 1}}>
          {/* Header Section */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              paddingTop: 8,
              paddingHorizontal: 0,
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{padding: 5}}>
              <Icon name="chevron-back" size={30} color="black" />
            </TouchableOpacity>
          </View>

          {/* Product summary Section */}
          <ScrollView
            style={{marginTop: 10, flex: 1}}
            contentContainerStyle={{alignItems: 'center', paddingBottom: 150}}>
            <View
              style={{
                width: '90%',
                height: 120,
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                marginBottom: 20,
              }}>
              <FastImage
                source={{uri: product.localImagePath}}
                style={{
                  width: '30%',
                  height: '100%',
                  borderRadius: 10,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
              <View style={{marginLeft: 16, flex: 1}}>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: calculatedFontSize / 2.3,
                    marginBottom: 4,
                  }}>
                  {product.name}
                </Text>
                {product.size && (
                  <Text
                    style={{
                      color: 'black',
                      fontSize: calculatedFontSize / 2.8,
                    }}>
                    Size: {product.size}
                  </Text>
                )}
              </View>
            </View>

            {InputField({
              iconName: 'pricetag-outline',
              value: price,
              onChangeText: setPrice,
              placeholder: 'Price',
            })}
            {InputField({
              iconName: 'car-outline',
              value: shipping,
              onChangeText: setShipping,
              placeholder: 'Shipping',
            })}
            {InputField({
              iconName: 'cube-outline',
              value: quantity,
              onChangeText: setQuantity,
              placeholder: 'Quantity',
            })}

            <TouchableOpacity
              onPress={onSubmit}
              style={{
                backgroundColor: appPink,
                borderRadius: 30,
                paddingVertical: 14,
                alignItems: 'center',
                width: '80%',
                marginTop: 40,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 4, // Subtle shadow for elevation
                marginBottom: 40,
              }}
              activeOpacity={0.8}>
              <Text
                style={{
                  color: 'white',
                  fontSize: calculatedFontSize / 2.2,
                  fontWeight: 'bold',
                }}>
                Submit
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 10,
  },
  ListItemNameText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.4,
    fontWeight: 'bold',
  },
  ListItemValueText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.4,
  },
});

export default SubmitListing;
