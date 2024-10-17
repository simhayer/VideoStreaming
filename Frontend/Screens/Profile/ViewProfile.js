import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const ViewProfile = ({route}) => {
  const navigation = useNavigation();

  username = route.params.username;

  const {userData} = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  const email = userData?.user?.email;
  const [fullname, setFullname] = useState('');
  const [profilePictureURI, setProfilePictureURI] = useState('');
  const [selectedImage] = useState(profilePictureURI);

  useEffect(() => {
    getUserDetailsFromUsername();
  }, []);

  const getUserDetailsFromUsername = async () => {
    setLoading(true);

    const payload = {
      username,
    };
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getUserDetailsFromUsername,
        payload,
      );
      if (response.status === 200) {
        setFullname(response.data.fullname);
        setProfilePictureURI(`${baseURL}/${response.data.profilePicture}`);
      } else {
        console.error('Failed to fetch products:', response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 10,
          paddingHorizontal: 0,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            textAlign: 'center',
            flex: 1,
          }}>
          {username}
        </Text>
        <View style={{width: 40}} />
      </View>

      {/* Loading State */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={appPink} />
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center'}}>
          {/* Profile Image */}
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
              marginTop: '10%',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.1)',
              backgroundColor: 'white',
            }}
          />

          {/* Full Name */}
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.2,
              marginTop: 20,
            }}>
            {fullname}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ViewProfile;
