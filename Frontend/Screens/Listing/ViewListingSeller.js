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

const ViewListingSeller = ({route}) => {
  const {listing} = route.params;
  product = listing.product;
  const navigation = useNavigation();
  const [price, setPrice] = useState('');
  const [shipping, setShipping] = useState('');
  const [quantity, setQuantity] = useState('');

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const [loading, setLoading] = useState(false);

  const itemImageFilename = product.imageUrl.split('\\').pop();
  const imageUrl = `${baseURL}/${itemImageFilename}`;
  const itemImageUrl = `${baseURL}/${product.imageUrl}`;

  const [markActiveLoading, setMarkActiveLoading] = useState(false);
  const [deleteListingLoading, setDeleteListingLoading] = useState(false);

  const onMarkAsInactive = async () => {
    //setLoading(true);
    setMarkActiveLoading(true);

    try {
      const payload = {
        listingId: listing._id,
      };

      const response = await axios
        .post(baseURL + apiEndpoints.markListingAsInactive, payload)
        .catch(error => {
          console.error('Error submitting listing:', error);
        });

      if (response?.status === 200) {
        listing.status = listing.status === 'Active' ? 'Inactive' : 'Active';
        //navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
    } finally {
      //setLoading(false);
      setMarkActiveLoading(false);
    }
  };

  const onDeleteListing = async () => {
    //setLoading(true);
    setDeleteListingLoading(true);

    try {
      const payload = {
        email: userEmail,
        listingIds: [listing._id],
      };

      const response = await axios
        .post(baseURL + apiEndpoints.deleteListings, payload)
        .catch(error => {
          console.error('Error submitting listing:', error);
        });

      if (response?.status === 200) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
    } finally {
      //setLoading(false);
      setDeleteListingLoading(false);
    }
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
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{padding: 5}}>
              <Icon name="chevron-back" size={30} color="black" />
            </TouchableOpacity>
            {listing.status === 'Active' ? (
              <View
                style={{
                  borderWidth: 1,
                  padding: 3,
                  borderRadius: 5,
                  borderColor: '#4CAF50',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  marginRight: 10,
                }}>
                <Text>{listing.status}</Text>
              </View>
            ) : (
              <View
                style={{
                  borderWidth: 1,
                  padding: 3,
                  borderRadius: 5,
                  borderColor: '#FF5722',
                  backgroundColor: 'rgba(255, 87, 34, 0.1)',
                  marginRight: 10,
                }}>
                <Text>{listing.status}</Text>
              </View>
            )}
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
                source={{uri: itemImageUrl}}
                style={{
                  width: '30%',
                  height: '100%',
                  borderRadius: 7,
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

            <View
              style={{
                marginBottom: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 10,
                width: '90%',
                borderRadius: 8, // Rounded corners for consistency
              }}>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
                Quantity left
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: calculatedFontSize / 2.8,
                    marginRight: 15,
                  }}>
                  {listing.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('EditListingQuantity', {listing});
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'grey',
                      fontSize: calculatedFontSize / 2.8,
                      padding: 2,
                    }}>
                    EDIT
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                marginBottom: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 10,
                width: '90%',
                borderRadius: 8, // Rounded corners for consistency
              }}>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
                Items sold
              </Text>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
                {listing.sold}
              </Text>
            </View>

            {markActiveLoading ? (
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 40,
                }}>
                <ActivityIndicator size="medium" color={appPink} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={onMarkAsInactive}
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
                  marginBottom: 10,
                }}
                activeOpacity={0.8}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: calculatedFontSize / 2.2,
                    fontWeight: 'bold',
                  }}>
                  Mark as {listing.status === 'Active' ? 'Inactive' : 'Active'}
                </Text>
              </TouchableOpacity>
            )}
            {deleteListingLoading ? (
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 40,
                }}>
                <ActivityIndicator size="medium" color={appPink} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={onDeleteListing}
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
                  Delete Listing
                </Text>
              </TouchableOpacity>
            )}
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

export default ViewListingSeller;
