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
      setSelectedImage(uri);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <TouchableOpacity
        style={{
          marginTop: 10,
        }}
        onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <View style={{alignItems: 'center', flex: 1}}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '80%',
            flexDirection: 'row',
            paddingVertical: '2%',
            paddingHorizontal: '4%',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 40,
            marginTop: 10,
            marginBottom: 5,
          }}
          onPress={handleImageSelection}>
          <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '5%'}}>
            Add template
          </Text>
          <Icon name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>
        {isError && (
          <Text style={{fontSize: calculatedFontSize / 2.9, color: errorRed}}>
            {errorMessage}
          </Text>
        )}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            marginTop: 5,
            width: '75%',
            marginBottom: 10,
          }}>
          {selectedImage && (
            <Image
              source={{uri: selectedImage}}
              style={{flex: 1, resizeMode: 'contain'}}
            />
          )}
        </View>
        <TouchableOpacity
          onPress={startStream}
          style={{
            paddingVertical: '4%',
            width: '60%',
            backgroundColor: appPink,
            borderRadius: 40,
            alignItems: 'center',
            marginBottom: 40,
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: calculatedFontSize / 2.2,
              fontWeight: 'bold',
            }}>
            Continue to stream
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StartStreamTab;
