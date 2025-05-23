import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {deleteProducts} from '../../Redux/Features/ProductsSlice';
import ProductImageCarousel from '../../Components/ProductImageCarousel';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewProduct = ({route}) => {
  const {item} = route.params;

  const {name, size, type, shippingFee} = item;

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const handleDeleteItem = async () => {
    dispatch(deleteProducts({email: userEmail, products: [item._id]}))
      .unwrap()
      .then(() => {
        console.log('Products deleted successfully');
      })
      .catch(error => {
        console.error('Failed to delete products:', error);
      });

    navigation.goBack();
  };

  const handleListProduct = async () => {
    navigation.navigate('SubmitListing', {product: item});
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: 10,
        backgroundColor: colors.background,
        paddingHorizontal: 0, // Added consistent padding
      }}>
      {/* Back Button */}
      <View style={{marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={35} color="black" />
        </TouchableOpacity>
      </View>

      {/* Image Section */}
      <View
        style={{
          flex: 1.2,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          overflow: 'hidden',
          padding: 20,
          marginHorizontal: 10,
        }}>
        <ProductImageCarousel images={item.localImagePaths} />
      </View>

      {/* Details Section */}
      <View style={{flex: 1, marginBottom: 20, marginHorizontal: 10}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginBottom: 8,
          }}>
          {name}
        </Text>

        {size && (
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.8,
              marginBottom: 8,
            }}>
            Size: {size}
          </Text>
        )}

        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.8,
            marginBottom: 12,
          }}>
          Type: {type}
        </Text>

        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.8,
            marginBottom: 12,
          }}>
          Shipping Fee (CAD) : $ {shippingFee}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ViewProduct;
