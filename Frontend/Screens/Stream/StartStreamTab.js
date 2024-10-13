import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Alert,
  Button,
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink, colors, errorRed} from '../../Resources/Constants';
import ImageResizer from 'react-native-image-resizer';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = ({route}) => {
  const {title} = route?.params || {};
  //const {title} = route.params;
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState('');

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startStream = async () => {
    if (selectedImage === '') {
      setIsError(true);
      setErrorMessage('Please provide a thumbnail for your stream');
      return;
    }
    console.log('Going to GetStreamSDK');

    navigation.reset({
      index: 1, // The second route (GetStreamSDK) will be the active screen
      routes: [
        {
          name: 'TabControl', // First route is TabControl
          params: {initialTab: 'Sell'}, // Setting Sell tab as the background
        },
        {
          name: 'GetStreamSDK', // Second route is GetStreamSDK, making it the active screen
          params: {title, thumbnail: selectedImage}, // Pass the params for GetStreamSDK
        },
      ],
    });

    //navigation.navigate('GetStreamSDK', {title, thumbnail: selectedImage});
  };

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
      setIsError(false);
      setErrorMessage('');
      const uri = response.assets[0].uri;

      // Resize the image
      ImageResizer.createResizedImage(uri, 800, 600, 'JPEG', 80)
        .then(resizedImage => {
          setSelectedImage(resizedImage.uri); // Set the resized image URI
        })
        .catch(err => {
          console.log('Image Resizing Error: ', err);
        });
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          marginTop: 10,
          marginLeft: 0,
          padding: 5, // Ensures better touch target
        }}>
        <Icon name="chevron-back" size={35} color="black" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={{flex: 1, alignItems: 'center'}}>
        {/* Add Template Button */}
        <TouchableOpacity
          onPress={handleImageSelection}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            width: '80%',
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 30, // Softer corner radius
            marginTop: 20,
            marginBottom: 8,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          activeOpacity={0.8}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 16,
              marginLeft: 10,
            }}>
            Add Template
          </Text>
          <Icon name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>

        {/* Error Message */}
        {isError && (
          <Text
            style={{
              fontSize: calculatedFontSize / 2.9,
              color: errorRed,
              marginTop: 5,
            }}>
            {errorMessage}
          </Text>
        )}

        {/* Image Container */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
            width: '75%',
            marginBottom: 20,
          }}>
          {selectedImage && (
            <Image
              source={{uri: selectedImage}}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
                borderRadius: 12,
              }}
            />
          )}
        </View>

        {/* Continue to Stream Button */}
        <TouchableOpacity
          onPress={startStream}
          style={{
            width: '60%',
            backgroundColor: appPink,
            borderRadius: 30,
            paddingVertical: 14,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
            marginBottom: 40,
          }}
          activeOpacity={0.8}>
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.2,
            }}>
            Continue to Stream
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StartStreamTab;
