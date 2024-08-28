import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Button,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {baseURL, apiEndpoints} from '../Resources/Constants';
import {uploadProfilePicture} from '../Redux/Features/AuthSlice';

const EditProfile = () => {
  const {userData} = useSelector(state => state.auth);
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const {isError, errorMessage} = useSelector(state => state.auth);

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const profilePictureURI = userData?.user?.profilePictureURI;
  const [selectedImage, setSelectedImage] = useState(profilePictureURI);

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
        const updateParams = {email: userData.user.email, uri};
        dispatch(uploadProfilePicture(updateParams))
          .unwrap()
          .then(() => {
            console.log('Profile picture updated successfully');
          })
          .catch(err => {
            console.error('Error:', err);
          });
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: '2%',
          paddingVertical: '2%',
          backgroundColor: '#f5f5f5',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingRight: '2%'}}>
          <Icon
            name="chevron-back"
            size={calculatedFontSize / 1.6}
            color="#007BFF"
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: calculatedFontSize / 1.8,
            fontWeight: 'bold',
            paddingHorizontal: '26%',
            textAlign: 'center',
          }}>
          Edit profile
        </Text>
      </View>
      <View style={{height: 1, backgroundColor: '#ccc'}} />
      <View style={{paddingTop: '5%', alignItems: 'center'}}>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image
            source={
              selectedImage
                ? {uri: selectedImage}
                : require('../Resources/user.png')
            }
            style={{
              height: 100,
              width: 100,
              borderRadius: 50,
              resizeMode: 'cover',
            }}
          />
        </TouchableOpacity>
        <Button title="Change Profile Picture" onPress={handleImagePicker} />
        <Text style={{padding: '3%', fontWeight: 'bold'}}>Username</Text>
        <Text style={{padding: '3%'}}>{username}</Text>
        <Text style={{padding: '3%', fontWeight: 'bold'}}>Email</Text>
        <Text style={{padding: '3%'}}>{email}</Text>
        <Text style={{padding: '3%', fontWeight: 'bold'}}>Full Name</Text>
        <Text style={{padding: '3%'}}>{fullname}</Text>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
