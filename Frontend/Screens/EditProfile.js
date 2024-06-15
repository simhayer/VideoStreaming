import React from 'react';
import {View, Text, Image, Dimensions, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const EditProfile = () => {
  const {userData, isLoading} = useSelector(state => state.auth);
  const navigation = useNavigation();

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

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
      <View style={{paddingTop: '5%'}}>
        <Image
          source={require('../Resources/AppleLogo.png')}
          style={{
            height: 100,
            width: 100,
            borderRadius: 50,
            resizeMode: 'cover',
          }}
        />
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
