import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Button,
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
  const profilePicture = userData?.user?.profilePicture;

  const [selectedImage, setSelectedImage] = useState(profilePicture);

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

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
        //uploadProfilePicture(uri);
        const updateParams = {email, uri};
        //const result = dispatch(uploadProfilePicture(updateParams));
        //console.log(result);
        dispatch(uploadProfilePicture(updateParams))
          .unwrap()
          .then(() => {
            //navigation.navigate('Login');
            console.log('Success');
            //4;
          })
          .catch(err => {
            //console.log('Success');
            console.error('Error:', err);
            // Handle the error (errorMessage is already set by the Redux state)
          });
      }
    });
  };

  const uploadProfilePicture1 = async uri => {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    formData.append('email', email);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.updateProfilePicture,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        console.log('Profile picture updated successfully');
      } else {
        console.log('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture: ', error);
    }
  };

  return (
    <View style={{flex: 1}}>
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
            // source={
            //   selectedImage
            //     ? {uri: selectedImage}
            //     : require('../Resources/AppleLogo.png')
            // }
            source={profilePicture}
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
    </View>
  );
};

export default EditProfile;
