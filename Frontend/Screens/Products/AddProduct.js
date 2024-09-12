import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  appPink,
  productTypes,
  shoeSizeOptions,
  clothingSizeOptions,
  baseURL,
  apiEndpoints,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');

  const {userData, isLoading} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const [itemName, setItemName] = useState('');

  const [typeOpen, setTypeOpen] = useState(false);
  const [type, setType] = useState('');

  const [sizeOpen, setSizeOpen] = useState(false);
  const [size, setSize] = useState('');

  const showSizeOption = useMemo(() => {
    return type === 'Clothing' || type === 'Footwear';
  }, [type]);

  const sizeOptions = useMemo(() => {
    if (type === 'Clothing') return clothingSizeOptions;
    if (type === 'Footwear') return shoeSizeOptions;
    return [];
  }, [type]);

  const [selectedImage, setSelectedImage] = useState('');

  const handleImageSelection = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    const optionsArray = [
      {
        text: 'Take Photo',
        onPress: () => launchCamera(options, handleImageResponse),
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
      const uri = response.assets[0].uri;
      setSelectedImage(uri);
    }
  };

  // Define the addProduct function to send the POST request
  const addProduct = async () => {
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

    axios
      .post(baseURL + apiEndpoints.addProductToUser, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Product added successfully:', response.data);
        navigation.goBack();
      })
      .catch(error => {
        console.error('Failed to add product:', response.data);
      });
  };

  return (
    <SafeAreaView style={{flex: 1, paddingTop: '2%'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 4,
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
      <View style={{alignItems: 'center', marginTop: '4%', flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Icon name="reader-outline" size={30} color="black" />
          <TextInput
            value={itemName}
            onChangeText={itemName => setItemName(itemName)}
            placeholder={'Enter item name'}
            style={{
              width: '70%',
              borderBottomWidth: 1,
              borderColor: 'grey',
              fontSize: calculatedFontSize / 2.4,
              marginBottom: '4%',
              marginLeft: '4%',
            }}
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
          <DropDownPicker
            open={typeOpen}
            value={type}
            items={productTypes}
            setOpen={setTypeOpen}
            setValue={setType}
            containerStyle={{
              justifyContent: 'center',
              width: '70%',
              marginLeft: '4%',
            }}
            dropDownContainerStyle={{
              borderColor: 'black',
            }}
            listItemLabelStyle={{
              marginTop: 0,
              fontSize: calculatedFontSize / 2.9,
            }}
            textStyle={{
              fontSize: calculatedFontSize / 2.9,
            }}
            zIndex={1000}
          />
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
            <DropDownPicker
              open={sizeOpen}
              value={size}
              items={sizeOptions}
              setOpen={setSizeOpen}
              setValue={setSize}
              flatListProps={{nestedScrollEnabled: true}}
              scrollViewProps={{nestedScrollEnabled: true}}
              containerStyle={{
                justifyContent: 'center',
                width: '70%',
                marginLeft: '4%',
              }}
              dropDownContainerStyle={{
                borderColor: 'black',
              }}
              listItemLabelStyle={{
                marginTop: 0,
                fontSize: calculatedFontSize / 2.9,
              }}
              textStyle={{
                fontSize: calculatedFontSize / 2.9,
              }}
              zIndex={900}
            />
            <View style={{width: 30}} />
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: '3%',
            justifyContent: 'space-between',
          }}>
          <View style={{width: 40}} />
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
            <Icon name="chevron-forward" size={30} color="black" />
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
          {!selectedImage && (
            <View style={{flex: 1, borderWidth: 1, justifyContent: 'center'}}>
              <Text style={{textAlign: 'center'}}>No image selected</Text>
            </View>
          )}
        </View>
        <View style={{height: 'auto', marginBottom: 20}}>
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
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StartStreamTab;
