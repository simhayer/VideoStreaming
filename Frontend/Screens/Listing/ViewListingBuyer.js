import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
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
import ImageViewing from 'react-native-image-viewing';
import ProductImageCarousel from '../../Components/ProductImageCarousel';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewListingBuyer = ({route}) => {
  const {listing} = route.params;
  product = listing.product;

  const {name, size, type, shippingFee} = product;
  const itemImageUrls = product.imageUrls.map(
    imageUrl => `${baseURL}/${imageUrl}`,
  );

  const sellerUsername = listing.user.username;
  const profilePictureFilename = listing.user.profilePicture.split('/').pop();
  var profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;

  const showQuantity = listing.quantity <= 30;
  const outOfStock = listing.quantity <= 0;

  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const handleBuyNow = async () => {
    navigation.navigate('Checkout', {listing});
  };

  const onImagePress = index => {
    setImageIndex(index);
    setImageViewerVisible(true);
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
        <View
          style={{
            marginBottom: 10,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 5,
              alignSelf: 'flex-start',
            }}>
            <Icon name="chevron-back" size={35} color="black" />
          </TouchableOpacity>
          <View
            style={{
              borderWidth: 1,
              padding: 3,
              borderRadius: 5,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              marginRight: 10,
            }}>
            <Text
              style={{
                color: 'green',
                fontWeight: '600',
                fontSize: calculatedFontSize / 3.1,
              }}>
              Verified Seller
            </Text>
          </View>
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
              aspectRatio: 1.5,
            }}>
            <ProductImageCarousel
              images={itemImageUrls}
              onImagePress={onImagePress}
            />
          </View>
        </View>

        {/* Details Section */}
        <View style={{marginHorizontal: 10}}>
          <Text
            style={{
              color: 'black',
              fontWeight: '700',
              fontSize: calculatedFontSize / 2.1,
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
                  style={{color: errorRed, fontSize: calculatedFontSize / 2.7}}>
                  Out of stock
                </Text>
              ) : (
                <Text
                  style={{color: errorRed, fontSize: calculatedFontSize / 2.7}}>
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
                  fontSize: calculatedFontSize / 1.8,
                  fontWeight: '600',
                }}>
                $
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: calculatedFontSize / 1.6,
                  fontWeight: '600',
                  marginLeft: 1,
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
                alignSelf: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 3,
                marginTop: 15,
                marginBottom: 10,
                width: '80%',
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
                    fontSize: calculatedFontSize / 2,
                    fontWeight: '600',
                    marginLeft: 20,
                  }}>
                  {sellerUsername}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Image Viewer Modal */}
        <ImageViewing
          images={itemImageUrls.map(imageUrl => ({uri: imageUrl}))}
          imageIndex={imageIndex}
          backgroundColor="transparent"
          visible={isImageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewListingBuyer;
