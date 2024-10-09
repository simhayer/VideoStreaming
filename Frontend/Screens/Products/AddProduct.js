import {useFocusEffect, useNavigation} from '@react-navigation/native';
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
  baseURL,
  apiEndpoints,
  errorRed,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = () => {
  const navigation = useNavigation();

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
      console.log('response', response);
      const uri = response?.assets[0].uri;
      setSelectedImage(uri);
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
  const addProduct = async () => {
    if (itemName.length === 0) {
      setIsError(true);
      setErrorMessage('Please provide an item name');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('name', itemName);
    formData.append('size', size);
    formData.append('type', type);

    if (selectedImage) {
      // Convert the file URI to a file object
      const imageFile = {
        uri: selectedImage,
        type: 'image/jpeg', // Change type based on the image format
        name: 'productImage.jpg', // Use the correct extension based on the image format
      };
      formData.append('productImage', imageFile);
    }

    try {
      const response = await axios
        .post(baseURL + apiEndpoints.addProductToUser, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .catch(error => {
          console.error('Failed to add product:', error);
        });

      console.log('Product added successfully:', response.data);
      navigation.goBack();
    } catch (error) {
    } finally {
      setLoading(false);
    }
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
      style={{flex: 1, marginTop: 10, backgroundColor: colors.background}}>
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
                autoComplete="off"
                autoCapitalize="none"
                placeholderTextColor={'gray'}
                autoCorrect={false}
                returnKeyType="next"
                textContentType="name"
                maxLength={30}
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
                  onPress={addProduct}
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

export default StartStreamTab;
