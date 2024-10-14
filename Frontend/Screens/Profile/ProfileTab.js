import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink, baseURL, colors} from '../../Resources/Constants';
import FastImage from 'react-native-fast-image';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const Profile = () => {
  const navigation = useNavigation();
  const {userData, isLoading} = useSelector(state => state.auth);

  const username = userData?.user?.username;
  const fullname = userData?.user?.fullname;
  const isOnboardingStarted = userData?.user?.isOnboardingStarted;
  const localProfilePictureURI = userData?.user?.localProfilePictureURI;

  const [selectedImage] = useState(localProfilePictureURI);

  const navigateToSellScreen = () => {
    if (isOnboardingStarted) {
      navigation.navigate('Sell');
    } else {
      navigation.navigate('GetStartedSell');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
          }}>
          {username}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsMenu')}>
          <Icon name="menu" size={35} color="black" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={{alignItems: 'center', marginTop: '8%'}}>
        <FastImage
          source={
            selectedImage
              ? {uri: selectedImage}
              : require('../../Resources/user.png')
          }
          style={{
            height: 80,
            width: 80,
            borderRadius: 40,
            resizeMode: 'cover',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
          }}
        />

        <TouchableOpacity
          style={{
            marginTop: 20,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            borderRadius: 30,
            width: '50%',
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="person-circle-outline" size={25} color="black" />
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.7,
              marginLeft: 8,
            }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <Text
        style={{
          color: 'black',
          fontWeight: 'bold',
          marginTop: 20,
          marginLeft: '5%',
          fontSize: calculatedFontSize / 2.4,
        }}>
        Hello! {fullname}
      </Text>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
          marginHorizontal: '2.5%',
          justifyContent: 'space-between',
          flex: 1,
        }}>
        <TouchableOpacity
          style={styles.button}
          onPress={navigateToSellScreen}
          activeOpacity={0.8}>
          <View style={{alignItems: 'center'}}>
            <Icon name="cash-outline" size={30} color="black" />
            <Text style={styles.buttonText}>Start Selling</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}>
          <View style={{alignItems: 'center'}}>
            <Icon name="cart-outline" size={30} color="black" />
            <Text style={styles.buttonText}>Shop</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{flex: 3}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginHorizontal: 8,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: calculatedFontSize / 2.7,
  },
});

export default Profile;
