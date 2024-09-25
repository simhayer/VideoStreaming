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
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink, baseURL, colors} from '../Resources/Constants';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const Profile = () => {
  const navigation = useNavigation();
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;
  const username = userData?.user?.username;
  const fullname = userData?.user?.fullname;
  const isOnboardingStarted = userData?.user.isOnboardingStarted;

  const profilePictureURI = userData?.user?.profilePictureURI;
  const [selectedImage] = useState(profilePictureURI);

  const navigateToSellScreen = () => {
    if (isOnboardingStarted) {
      navigation.navigate('Sell');
    } else {
      navigation.navigate('GetStartedSell');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 1,
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
      <View style={{alignItems: 'center'}}>
        <Image
          source={
            selectedImage
              ? {uri: selectedImage}
              : require('../Resources/user.png')
          }
          style={{
            height: 50,
            width: 50,
            borderRadius: 50,
            resizeMode: 'cover',
            marginTop: '8%',
          }}
        />

        <TouchableOpacity
          style={{
            marginTop: 20,
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
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              marginLeft: '10%',
              fontSize: calculatedFontSize / 2.7,
            }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          color: 'black',
          fontWeight: 'bold',
          marginLeft: '5%',
          marginTop: 10,
          fontSize: calculatedFontSize / 2.4,
        }}>
        Hello! {fullname}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
          flex: 1,
          marginHorizontal: '5%',
        }}>
        <TouchableOpacity style={styles.button} onPress={navigateToSellScreen}>
          <View style={{alignItems: 'center'}}>
            <Icon name="cash-outline" size={30} color="black" />
            <Text style={styles.buttonText}>Start Selling</Text>
          </View>
        </TouchableOpacity>
        <View style={{flex: 0.5}} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}>
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
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: calculatedFontSize / 2.7,
  },
});

export default Profile;
