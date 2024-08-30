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

    //   const response = await axios.post(
    //     baseURL + apiEndpoints.addProductToUser,
    //     payload,
    //   );

    //   if (response.status === 200) {
    //     console.log('Product added successfully:', response.data);
    //     navigation.goBack();
    //     // Handle success (e.g., navigate back, show a success message, etc.)
    //   } else {
    //     console.error('Failed to add product:', response.data);
    //     // Handle failure (e.g., show an error message)
    //   }
    // } catch (error) {
    //   console.error('Error adding product:', error);
    //   // Handle error (e.g., show an error message)
    // }
  };

  return (
    <SafeAreaView style={{flex: 1, paddingTop: '2%'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginLeft: '25%',
          }}>
          Add product
        </Text>
      </View>
      <View style={{alignItems: 'center', marginTop: '8%'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="reader-outline" size={40} color="black" />
          <TextInput
            value={itemName}
            onChangeText={itemName => setItemName(itemName.trim())}
            placeholder={'Enter item name'}
            style={{
              width: '70%',
              borderBottomWidth: 1,
              borderColor: 'grey',
              fontSize: calculatedFontSize / 2.3,
              marginBottom: '2%',
              marginLeft: '4%',
            }}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="albums-outline" size={40} color="black" />
          <DropDownPicker
            open={typeOpen}
            value={type}
            items={productTypes}
            setOpen={setTypeOpen}
            setValue={setType}
            containerStyle={{
              height: '25%',
              justifyContent: 'center',
              width: '70%',
              marginLeft: '4%',
            }}
            labelStyle={{
              fontWeight: 'bold',
            }}
            dropDownContainerStyle={{
              borderColor: 'black',
            }}
            listItemLabelStyle={{
              fontWeight: 'bold',
            }}
            zIndex={1000}
          />
        </View>
        {showSizeOption && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="filter-outline" size={40} color="black" />
            <DropDownPicker
              open={sizeOpen}
              value={size}
              items={sizeOptions}
              setOpen={setSizeOpen}
              setValue={setSize}
              flatListProps={{nestedScrollEnabled: true}}
              scrollViewProps={{nestedScrollEnabled: true}}
              containerStyle={{
                height: '25%',
                maxHeight: '25%',
                justifyContent: 'center',
                width: '70%',
                marginLeft: '4%',
              }}
              labelStyle={{
                fontWeight: 'bold',
              }}
              dropDownContainerStyle={{
                borderColor: 'black',
              }}
              listItemLabelStyle={{
                fontWeight: 'bold',
              }}
              zIndex={900}
            />
          </View>
        )}
        <TouchableOpacity
          style={{
            marginTop: '6%',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '80%',
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
              style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
              Add image
            </Text>
          </View>
          <Icon name="chevron-forward" size={40} color="black" />
        </TouchableOpacity>
        <View
          style={{
            height: '40%',
            width: '50%',
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
        <TouchableOpacity
          onPress={addProduct} // Call addProduct on button press
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
              paddingHorizontal: '10%',
            }}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StartStreamTab;
