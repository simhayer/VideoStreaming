import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {appPink, baseURL, colors, errorRed} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {ScrollView} from 'react-native-gesture-handler';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewListingBuyer = ({route}) => {
  const {listing} = route.params;
  product = listing.product;

  const {name, size, type, shippingFee} = product;
  const itemImageUrl = `${baseURL}/${product.imageUrl}`;

  const sellerUsername = listing.user.username;
  const profilePictureFilename = listing.user.profilePicture.split('/').pop();
  var profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;

  const showQuantity = listing.quantity <= 30;
  const outOfStock = listing.quantity <= 0;

  //console.log('Route params:', route.params);
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const handleBuyNow = async () => {
    //checkPaymentandAddressExist(userEmail);

    navigation.navigate('Checkout', {listing});
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10, // Consistent padding
      }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 20, // Add padding for proper scroll behavior
        }}>
        {/* Back Button */}
        <View style={{marginBottom: 10}}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 5,
              alignSelf: 'flex-start',
            }}>
            <Icon name="chevron-back" size={35} color="black" />
          </TouchableOpacity>
        </View>

        {/* Image Section */}
        <View style={{marginHorizontal: 10}}>
          <View
            style={{
              borderWidth: 1,
              width: '100%',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
              overflow: 'hidden',
              padding: 20,
              aspectRatio: 1.5, // Maintain proportional image height
            }}>
            <FastImage
              source={{uri: itemImageUrl}}
              style={{width: '100%', height: '100%'}}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </View>

        {/* Details Section */}
        <View style={{marginHorizontal: 10}}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2,
              marginBottom: 10,
            }}>
            {name}
          </Text>

          {showQuantity && (
            <View
              style={{
                marginBottom: 10,
              }}>
              {outOfStock ? (
                <Text
                  style={{color: errorRed, fontSize: calculatedFontSize / 2.6}}>
                  Out of stock
                </Text>
              ) : (
                <Text
                  style={{color: errorRed, fontSize: calculatedFontSize / 2.6}}>
                  Only {listing.quantity} left in stock !
                </Text>
              )}
            </View>
          )}

          {size && (
            <View
              style={{
                marginBottom: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 10,
                borderRadius: 8, // Rounded corners for consistency
              }}>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
                Size
              </Text>
              <Text
                style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
                {size}
              </Text>
            </View>
          )}

          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              padding: 10,
              borderRadius: 8,
              marginBottom: 20,
            }}>
            <Text style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
              Buy Now
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 2,
                  fontWeight: 'bold',
                }}>
                $
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 1.6,
                  fontWeight: 'bold',
                  marginLeft: 5,
                }}>
                {listing.price}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleBuyNow}
              disabled={outOfStock}
              style={{
                backgroundColor: outOfStock ? 'grey' : appPink,
                borderRadius: 30,
                paddingVertical: 12,
                paddingHorizontal: 20,
                alignSelf: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 3,
                marginTop: 15,
              }}>
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: calculatedFontSize / 2.5,
                }}>
                Buy Now
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              padding: 10,
              borderRadius: 8,
              marginBottom: 20,
              justifyContent: 'center',
            }}>
            <Text style={{color: 'black', fontSize: calculatedFontSize / 2.8}}>
              Seller
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <FastImage
                source={{uri: profilePictureURL}}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 25,
                  marginLeft: 5,
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ViewProfile', {
                    username: sellerUsername,
                  })
                }>
                <Text
                  style={{
                    color: 'black',
                    fontSize: calculatedFontSize / 1.8,
                    fontWeight: 'bold',
                    marginLeft: 20,
                  }}>
                  {sellerUsername}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewListingBuyer;
