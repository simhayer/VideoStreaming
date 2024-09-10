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

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = ({route}) => {
  const {title} = route.params;
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState('');

  const startStream = async () => {
    navigation.navigate('GetStreamSDK', {title, thumbnail: selectedImage});
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
      const uri = response.assets[0].uri;
      setSelectedImage(uri);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          marginTop: '3%',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity
          style={{
            marginTop: '4%',
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
              Add template
            </Text>
          </View>
          <Icon name="chevron-forward" size={40} color="black" />
        </TouchableOpacity>
        <View
          style={{
            height: '70%',
            width: '80%',
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
              <Text style={{textAlign: 'center'}}>No template selected</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={startStream}
          style={{
            paddingVertical: '4%',
            width: '60%',
            backgroundColor: '#f542a4',
            borderRadius: 40,
            marginTop: '10%',
            alignItems: 'center',
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
