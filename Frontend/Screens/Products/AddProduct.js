import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  PermissionsAndroid,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  appPink,
  productTypes,
  shoeSizeOptions,
  clothingSizeOptions,
  errorRed,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';
import ImageResizer from 'react-native-image-resizer';
import {addProduct} from '../../Redux/Features/ProductsSlice';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const AddProduct = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const [itemName, setItemName] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');

  const showSizeOption = useMemo(() => {
    return type === 'Clothing' || type === 'Sneakers & Footwear';
  }, [type]);

  const sizeOptions = useMemo(() => {
    if (type === 'Clothing') return clothingSizeOptions;
    if (type === 'Sneakers & Footwear') return shoeSizeOptions;
    return [];
  }, [type]);

  const [shippingFee, setShippingFee] = useState('');

  const [selectedImage, setSelectedImage] = useState('');

  const [loading, setLoading] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageSelection = () => {
    Keyboard.dismiss();
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    const optionsArray = [
      {
        text: 'Take Photo',
        onPress: async () => {
          const hasPermission = await requestCameraPermission();
          if (hasPermission) {
            launchCamera(options, handleImageResponse);
          } else {
            Alert.alert('Camera Permission', 'Permission denied');
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: () => launchImageLibrary(options, handleImageResponse),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ];

    Alert.alert('Select Image Source', 'Choose an option', optionsArray);
  };

  const handleImageResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else {
      const uri = response?.assets[0].uri;

      ImageResizer.createResizedImage(uri, 800, 600, 'JPEG', 80)
        .then(resizedImage => {
          setSelectedImage(resizedImage.uri); // Set the resized image URI
        })
        .catch(err => {
          console.log('Image Resizing Error: ', err);
        });
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Define the addProduct function to send the POST request
  const handleAddProduct = () => {
    if (!itemName) {
      setErrorMessage('Please provide a product name.');
      return;
    }

    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('name', itemName);
    formData.append('size', size);
    formData.append('type', type);
    formData.append('shippingFee', shippingFee);

    if (selectedImage) {
      formData.append('productImage', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'productImage.jpg',
      });
    }

    setLoading(true);
    dispatch(addProduct(formData))
      .unwrap()
      .then(() => {
        console.log('Product added successfully');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Failed to add product:', error);
        setErrorMessage('Failed to add product.');
      })
      .finally(() => setLoading(false));
  };

  const [isBidBottomSheetVisible, setIsBidBottomSheetVisible] = useState(false);

  const bidBottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      setIsBidBottomSheetVisible(false);
    }
  }, []);

  const snapPoints = useMemo(() => ['1%', '40%'], []);

  const handleItemPress = item => {
    if (bottomSheetOptions === productTypes) setType(item);
    if (bottomSheetOptions === sizeOptions) setSize(item);
    setIsBidBottomSheetVisible(false);
  };

  const [bottomSheetOptions, setBottomSheetOptions] = useState(productTypes);

  const handleProductTypeSelect = () => {
    Keyboard.dismiss();
    bidBottomSheetRef.current?.expand();
    setIsBidBottomSheetVisible(true);
    setBottomSheetOptions(productTypes);
  };

  const handleClothingSizeSelect = () => {
    Keyboard.dismiss();
    bidBottomSheetRef.current?.expand();
    setIsBidBottomSheetVisible(true);
    setBottomSheetOptions(sizeOptions);
  };

  const screenTap = () => {
    Keyboard.dismiss();
    bidBottomSheetRef.current?.close();
  };

  const closeBottomSheet = () => {
    bidBottomSheetRef.current?.close();
    setIsBidBottomSheetVisible(false);
  };

  const nameRef = useRef(null);

  const onNameNextClick = () => {
    handleProductTypeSelect();
  };

  return (
    <SafeAreaView
      style={{flex: 1, paddingTop: 10, backgroundColor: colors.background}}>
      <TouchableWithoutFeedback onPress={screenTap} style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 4,
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
              Add Product
            </Text>
            <View style={{width: 35}} />
          </View>
          <View style={{alignItems: 'center', marginTop: 10, flex: 1}}>
            {isError && (
              <View>
                <Text
                  style={{fontSize: calculatedFontSize / 2.7, color: errorRed}}>
                  {errorMessage}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Icon name="reader-outline" size={30} color="black" />
              <TextInput
                ref={nameRef}
                value={itemName}
                onChangeText={setItemName}
                placeholder={'Product Name'}
                style={{
                  width: '70%',
                  borderBottomWidth: 1,
                  borderColor: 'black',
                  fontSize: calculatedFontSize / 2.5,
                  marginTop: 10,
                  marginBottom: 15,
                  paddingVertical: 10,
                  paddingHorizontal: 5,
                  marginLeft: 20,
                }}
                placeholderTextColor={'gray'}
                returnKeyType="next"
                textContentType="name"
                maxLength={40}
                selectionColor={appPink}
                inputMode="text"
                onSubmitEditing={onNameNextClick}
                clearButtonMode="while-editing"
                keyboardAppearance="light"
                onFocus={closeBottomSheet}
              />
              <View style={{width: 30}} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Icon name="albums-outline" size={30} color="black" />
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  width: '70%',
                  flexDirection: 'row',
                  paddingVertical: '2%',
                  paddingHorizontal: '4%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 40,
                  marginLeft: 20,
                }}
                onPress={handleProductTypeSelect}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: 'black',
                      marginLeft: 10,
                      fontSize: calculatedFontSize / 2.9,
                    }}>
                    {type ? type : 'Product type'}
                  </Text>
                </View>
                <Icon name="chevron-down" size={30} color="black" />
              </TouchableOpacity>
              <View style={{width: 30}} />
            </View>
            {showSizeOption && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '3%',
                  justifyContent: 'space-between',
                }}>
                <Icon name="filter-outline" size={30} color="black" />
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.2)',
                    width: '70%',
                    flexDirection: 'row',
                    paddingVertical: '2%',
                    paddingHorizontal: '4%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 40,
                    marginLeft: 20,
                  }}
                  onPress={handleClothingSizeSelect}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: 'black',
                        marginLeft: 10,
                        fontSize: calculatedFontSize / 2.9,
                      }}>
                      {size ? size : 'Size'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={30} color="black" />
                </TouchableOpacity>
                <View style={{width: 30}} />
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Icon name="bag-outline" size={30} color="black" />
              <Text
                style={{
                  fontSize: calculatedFontSize / 2.2,
                  marginLeft: 20,
                  color: 'grey',
                }}>
                $
              </Text>
              <TextInput
                value={shippingFee}
                onChangeText={setShippingFee}
                placeholder={'Shipping Fee'}
                style={{
                  width: '66%',
                  borderBottomWidth: 1,
                  borderColor: 'black',
                  fontSize: calculatedFontSize / 2.5,
                  marginTop: 10,
                  marginBottom: 15,
                  paddingVertical: 10,
                  paddingHorizontal: 5,
                  marginLeft: 10,
                }}
                autoComplete="off"
                autoCapitalize="none"
                placeholderTextColor={'gray'}
                autoCorrect={false}
                returnKeyType="next"
                maxLength={5}
                selectionColor={appPink}
                inputMode="numeric"
                clearButtonMode="while-editing"
                keyboardAppearance="light"
                keyboardType="numeric"
                onFocus={closeBottomSheet}
              />
              <View style={{width: 30}} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
                justifyContent: 'space-between',
              }}>
              <Icon name="image-outline" size={30} color="black" />
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  width: '70%',
                  flexDirection: 'row',
                  paddingVertical: '2%',
                  paddingHorizontal: '4%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 40,
                  marginLeft: 20,
                }}
                onPress={handleImageSelection}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: 'black',
                      marginLeft: '10%',
                      fontSize: calculatedFontSize / 2.9,
                    }}>
                    Add image
                  </Text>
                </View>
                <Icon name="chevron-down" size={30} color="black" />
              </TouchableOpacity>
              <View style={{width: 30}} />
            </View>
            <View
              style={{
                flex: 1,
                width: '65%',
                justifyContent: 'center',
                marginTop: '4%',
              }}>
              {selectedImage && (
                <Image
                  source={{uri: selectedImage}}
                  style={{flex: 1, resizeMode: 'contain'}}
                />
              )}
            </View>
            <View style={{height: 'auto', marginBottom: 20}}>
              {loading ? (
                <ActivityIndicator size="large" color={appPink} />
              ) : (
                <TouchableOpacity
                  onPress={handleAddProduct}
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
                      paddingHorizontal: '15%',
                    }}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {isBidBottomSheetVisible && (
        <BottomSheet
          ref={bidBottomSheetRef}
          snapPoints={snapPoints}
          index={isBidBottomSheetVisible ? 1 : -1}
          onChange={handleSheetChanges}>
          <BottomSheetView style={{flex: 1, marginLeft: 30}}>
            <FlatList
              style={{flex: 1}}
              data={bottomSheetOptions}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    style={{
                      padding: 12,
                    }}
                    onPress={() => handleItemPress(item)}>
                    <Text style={{fontSize: calculatedFontSize / 2.5}}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            />
          </BottomSheetView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
};

export default AddProduct;
