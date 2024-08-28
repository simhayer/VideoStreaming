import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../Redux/Features/AuthSlice';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink, baseURL} from '../Resources/Constants';

const Profile = () => {
  const navigation = useNavigation();
  const {userData, isLoading} = useSelector(state => state.auth);
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const email = userData?.user?.email;
  const username = userData?.user?.username;
  const fullname = userData?.user?.fullname;

  const profilePictureURI = userData?.user?.profilePictureURI;
  const [selectedImage] = useState(profilePictureURI);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: '1%',
        }}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            marginLeft: '2%',
            fontSize: calculatedFontSize / 2,
          }}>
          {username}
        </Text>
        <TouchableOpacity
          style={{marginRight: '2%'}}
          onPress={() => navigation.navigate('SettingsMenu')}>
          <Icon name="menu" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center', height: '23%'}}>
        <Image
          source={
            selectedImage
              ? {uri: selectedImage}
              : require('../Resources/user.png')
          }
          style={{
            height: '40%',
            width: '17%',
            borderRadius: 50,
            resizeMode: 'cover',
            marginTop: '8%',
          }}
        />

        <TouchableOpacity
          style={{
            marginTop: '7%',
            borderWidth: 1,
            borderRadius: 40,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '40%',
            flexDirection: 'row',
            paddingVertical: '1%',
            paddingHorizontal: '4%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="person-circle-outline" size={25} color="black" />
          <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '5%'}}>
        {fullname}
      </Text>
    </SafeAreaView>
  );
};

export default Profile;
