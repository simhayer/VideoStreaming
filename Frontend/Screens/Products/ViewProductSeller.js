import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {appPink, colors} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {deleteProducts} from '../../Redux/Features/ProductsSlice';
import ProductImageCarousel from '../../Components/ProductImageCarousel';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewProductSeller = ({route}) => {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={{marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={35} color="black" />
        </TouchableOpacity>
      </View>

      {/* Image Section */}
      <View style={styles.imageBackground}>
        <ProductImageCarousel images={item.localImagePaths} />
      </View>

      {/* Details Section */}
      <View style={{flex: 1, marginBottom: 20}}>
        <Text
          style={{
            color: 'black',
            fontWeight: '600',
            fontSize: calculatedFontSize / 2.2,
            marginHorizontal: 20,
          }}>
          {name}
        </Text>
        <View
          style={{
            marginTop: 20,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
          }}>
          {size && <Text style={styles.productFields}>Size: {size}</Text>}

          <Text style={styles.productFields}>Type: {type}</Text>

          <Text style={styles.productFields}>
            Shipping Fee (CAD) : $ {shippingFee}
          </Text>
        </View>

        <View
          style={{
            marginTop: 20,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            flexDirection: 'row',
            paddingVertical: '3%',
            paddingHorizontal: '4%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="storefront-outline" size={25} color="black" />
            <Text
              style={{
                color: 'black',
                marginLeft: '12%',
                fontSize: calculatedFontSize / 2.8,
              }}>
              Listings
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ListListingsForAProduct', {
                product: item,
              })
            }>
            <Text
              style={{
                fontWeight: 'bold',
                color: 'grey',
                fontSize: calculatedFontSize / 2.8,
                padding: 2,
              }}>
              VIEW
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontWeight: '600',
            color: 'black',
            fontSize: calculatedFontSize / 2.8,
            marginTop: 10,
            marginHorizontal: '5%',
          }}>
          Listings are the products that are currently available for sale.
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity onPress={handleDeleteItem} style={styles.button}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 0,
  },
  imageBackground: {
    flex: 1,
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
  },
  productFields: {
    color: 'black',
    fontSize: calculatedFontSize / 2.8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: appPink,
    borderRadius: 30,
    paddingVertical: 12,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Elevated button for better visibility
    marginBottom: 30,
    width: '50%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: calculatedFontSize / 2.5,
  },
});

export default ViewProductSeller;
