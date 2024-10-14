import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Button,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {baseURL, apiEndpoints, colors} from '../../Resources/Constants';
//import {uploadProfilePicture} from '../Redux/Features/AuthSlice';
import {uploadProfilePicture} from '../../Redux/Features/AuthSlice';

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
  const localProfilePictureURI = userData?.user?.localProfilePictureURI;

  const [selectedImage, setSelectedImage] = useState(localProfilePictureURI);

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
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          Edit Profile
        </Text>
        <View style={{width: 35}} />
      </View>
      <View style={{marginTop: 30, alignItems: 'center'}}>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image
            source={
              selectedImage
                ? {uri: selectedImage}
                : require('../../Resources/user.png')
            }
            style={{
              height: 100,
              width: 100,
              borderRadius: 50,
              resizeMode: 'cover',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleImagePicker}>
          <Text
            style={{
              marginTop: 5,
              color: 'blue',
              fontSize: calculatedFontSize / 2.9,
            }}>
            Change picture
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{margin: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: calculatedFontSize / 2.7}}>
          Username
        </Text>
        <TouchableOpacity
          style={styles.fieldContainer}
          onPress={() => navigation.navigate('ChangeUsername', {email})}>
          <Text style={{fontSize: calculatedFontSize / 2.7}}>{username}</Text>
        </TouchableOpacity>
        <Text
          style={{
            fontWeight: 'bold',
            marginTop: 10,
            fontSize: calculatedFontSize / 2.7,
          }}>
          Email
        </Text>
        <View style={styles.fieldContainer}>
          <Text style={{fontSize: calculatedFontSize / 2.7}}>{email}</Text>
        </View>
        <Text
          style={{
            fontWeight: 'bold',
            marginTop: 10,
            fontSize: calculatedFontSize / 2.7,
          }}>
          Full Name
        </Text>
        <View style={styles.fieldContainer}>
          <Text style={{fontSize: calculatedFontSize / 2.7}}>{fullname}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
});

export default EditProfile;
