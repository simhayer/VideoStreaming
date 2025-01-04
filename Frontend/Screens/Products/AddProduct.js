import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  StyleSheet,
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
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import ImageResizer from 'react-native-image-resizer';
import {addProduct} from '../../Redux/Features/ProductsSlice';
import {
  clearAddProductImages,
  setAddProductImage,
} from '../../Redux/Features/AddProductImagesSlice';
import FastImage from 'react-native-fast-image';
import {divide} from 'lodash';
import BottomButton from '../../Components/BottomButton';

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
    return (
      type === "Men's Clothing" ||
      type === "Women's Clothing" ||
      type === 'Sneakers & Footwear'
    );
  }, [type]);

  const sizeOptions = useMemo(() => {
    if (type === "Men's Clothing") return clothingSizeOptions;
    if (type === "Women's Clothing") return clothingSizeOptions;
    if (type === 'Sneakers & Footwear') return shoeSizeOptions;
    return [];
  }, [type]);

  const [shippingFee, setShippingFee] = useState('');

  const [selectedImage, setSelectedImage] = useState('');

  const [loading, setLoading] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const images = useSelector(state => state.addProductImages.images);

  useEffect(() => {
    dispatch(clearAddProductImages());
  }, []);

  // Request Camera Permission
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

  const updateImage = (index, newImage) => {
    //add product to the first available slot
    for (let i = 0; i < images.length; i++) {
      if (images[i] === null) {
        dispatch(setAddProductImage({index: i, image: newImage}));
        return;
      }
    }
    //dispatch(setAddProductImage({index, image: newImage}));
  };

  // Handle Image Selection for each slot
  const handleImageSelection = index => {
    Keyboard.dismiss();
    console.log(images[index]);
    if (images[index] !== null) {
      navigation.navigate('EditImage', {
        index: index,
      });
      return;
    }
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
            launchCamera(options, response =>
              handleImageResponse(response, index),
            );
          } else {
            Alert.alert('Camera Permission', 'Permission denied');
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: () =>
          launchImageLibrary(options, response =>
            handleImageResponse(response, index),
          ),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ];

    Alert.alert('Select Image Source', 'Choose an option', optionsArray);
  };

  // Handle Image Response for each slot
  const handleImageResponse = (response, index) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else {
      const uri = response?.assets[0]?.uri;

      ImageResizer.createResizedImage(uri, 800, 600, 'JPEG', 80)
        .then(resizedImage => {
          updateImage(index, resizedImage.uri);
        })
        .catch(err => {
          console.log('Image Resizing Error: ', err);
        });
    }
  };

  // Define the addProduct function to send the POST request
  const handleAddProduct = () => {
    if (!itemName) {
      setIsError(true);
      setErrorMessage('Please provide a product name.');
      return;
    }
    if (!type) {
      setIsError(true);
      setErrorMessage('Please provide a product type.');
      return;
    }
    if (showSizeOption && !size) {
      setIsError(true);
      setErrorMessage('Please provide a size.');
      return;
    }
    if (!shippingFee) {
      setIsError(true);
      setErrorMessage('Please provide a shipping fee.');
      return;
    }
    if (images.every(image => image === null)) {
      setIsError(true);
      setErrorMessage('Please provide at least one image.');
      return;
    }

    setIsError(false);

    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('name', itemName);
    formData.append('size', size);
    formData.append('type', type);
    formData.append('shippingFee', shippingFee);

    images.forEach((image, index) => {
      if (image) {
        formData.append('productImages', {
          uri: image,
          type: 'image/jpeg',
          name: `productImage${index}.jpg`,
        });
      }
    });

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
        <ScrollView style={{marginTop: 30, flex: 1, marginBottom: 20}}>
          <TouchableWithoutFeedback onPress={screenTap} style={{flex: 1}}>
            <View style={{flex: 1}}>
              {isError && (
                <View style={{alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: calculatedFontSize / 2.7,
                      color: errorRed,
                    }}>
                    {errorMessage}
                  </Text>
                </View>
              )}
              <Text style={styles.headerText}>Name</Text>

              <View style={{alignItems: 'center'}}>
                <TextInput
                  ref={nameRef}
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder={'Product Name'}
                  style={styles.input}
                  placeholderTextColor={'gray'}
                  returnKeyType="next"
                  maxLength={50}
                  selectionColor={appPink}
                  onSubmitEditing={onNameNextClick}
                  keyboardAppearance="light"
                  onFocus={closeBottomSheet}
                  multiline={true}
                />
              </View>
              <View style={styles.divider} />
              <Text style={styles.headerText}>Type</Text>

              <View style={{alignItems: 'center'}}>
                <TouchableOpacity
                  style={styles.typeButtonContainer}
                  onPress={handleProductTypeSelect}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: calculatedFontSize / 2.9,
                      }}>
                      {type ? type : 'Product type'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={30} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
              {showSizeOption && (
                <View style={{alignItems: 'center'}}>
                  <View style={{width: '100%'}}>
                    <Text style={styles.headerText}>Size</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.typeButtonContainer}
                    onPress={handleClothingSizeSelect}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text
                        style={{
                          color: 'black',
                          fontSize: calculatedFontSize / 2.9,
                        }}>
                        {size ? size : 'Size'}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={30} color="black" />
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </View>
              )}
              <Text style={styles.headerText}>Shipping Fee</Text>

              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontSize: calculatedFontSize / 2.2,
                      color: 'grey',
                    }}>
                    $
                  </Text>
                  <TextInput
                    value={shippingFee}
                    onChangeText={setShippingFee}
                    placeholder={'Shipping Fee'}
                    style={styles.shippingInput}
                    placeholderTextColor={'gray'}
                    returnKeyType="next"
                    maxLength={5}
                    selectionColor={appPink}
                    inputMode="numeric"
                    clearButtonMode="while-editing"
                    keyboardAppearance="light"
                    keyboardType="numeric"
                    onFocus={closeBottomSheet}
                  />
                </View>
              </View>
              <View style={styles.divider} />

              <Text style={styles.headerText}>Photos</Text>

              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '80%',
                    justifyContent: 'space-between',
                    marginTop: 20,
                  }}>
                  {images.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.imageContainer}
                      onPress={() => handleImageSelection(index)}>
                      {image ? (
                        <FastImage
                          source={{uri: image}}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon
                          name="add-circle-outline"
                          size={25}
                          color="rgba(0,0,0,0.4)"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <BottomButton loading={loading} text="Add" onPress={handleAddProduct} />
      </View>

      {isBidBottomSheetVisible && (
        <BottomSheet
          ref={bidBottomSheetRef}
          snapPoints={snapPoints}
          index={isBidBottomSheetVisible ? 1 : -1}
          backgroundStyle={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            elevation: 10,
          }}
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
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2.5,
                        color: 'black',
                      }}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  headerText: {
    fontSize: calculatedFontSize / 2.7,
    color: 'black',
    marginLeft: '10%',
    fontWeight: '600',
  },
  divider: {
    width: '90%',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginVertical: 20,
    alignSelf: 'center',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'rgba(0,0,0,0.2)',
    fontSize: calculatedFontSize / 2.7,
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: 'black',
    textAlignVertical: 'top',
    minHeight: (calculatedFontSize / 2.7) * 3,
    maxHeight: (calculatedFontSize / 2.7) * 5,
  },
  shippingInput: {
    width: '70%',
    borderBottomWidth: 1,
    borderColor: 'black',
    fontSize: calculatedFontSize / 2.5,
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginLeft: 10,
    color: 'black',
  },
  typeButtonContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    width: '80%',
    flexDirection: 'row',
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 40,
    marginVertical: 10,
  },
  imageContainer: {
    aspectRatio: 1,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  addText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gray',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
});

export default AddProduct;
