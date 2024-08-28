import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Button,
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const startStream = async () => {
    navigation.navigate('StreamScreenSDK', {title});
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.assets[0].uri;
        setSelectedImage(uri);
        // const updateParams = {email, uri};
        // dispatch(uploadProfilePicture(updateParams))
        //   .unwrap()
        //   .then(() => {
        //     console.log('Success');
        //   })
        //   .catch(err => {
        //     console.error('Error:', err);
        //   });
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity
          style={{
            marginTop: '10%',
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
          onPress={() => navigation.navigate('ManageProducts')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
              Manage Products
            </Text>
          </View>
          <Icon name="chevron-forward" size={40} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: '3%',
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
          onPress={handleImagePicker}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <Icon name="cube-outline" size={35} color="black" /> */}
            <Text
              style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
              Add template
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
              <Text style={{textAlign: 'center'}}>No template selected</Text>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: '5%',
          }}>
          <TextInput
            value={title}
            onChangeText={title => setTitle(title.trim())}
            placeholder={'Enter stream title'}
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
