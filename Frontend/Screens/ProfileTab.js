import React from 'react';
import {SafeAreaView, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../Redux/Features/AuthSlice';
import {useNavigation} from '@react-navigation/native';

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;
  //const email = "hayersimrat23@gmail.com"
  //const {userData, isAuthenticated} = useSelector(state => state.auth);
  const fullname = userData?.user?.fullname;

  const onLogoutClick = async () => {
    console.log('Email from redux, ', email);
    const logoutParams = {
      email: email,
    };

    dispatch(logout(logoutParams));
  };

  const onEditProfileClick = async () => {
    navigation.navigate('EditProfile');
  };

  return (
    <SafeAreaView>
      <Text>You are logged in!</Text>
      <Text>Welcome - {fullname}</Text>
      <TouchableOpacity
        isloading={isLoading}
        onPress={() => onLogoutClick()}
        style={{
          padding: 10,
          backgroundColor: 'blue',
          borderRadius: 5,
          margin: 10,
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>LogOut</Text>
      </TouchableOpacity>
      <TouchableOpacity
        isloading={isLoading}
        onPress={() => onEditProfileClick()}
        style={{
          padding: 10,
          backgroundColor: 'blue',
          borderRadius: 5,
          margin: 10,
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>Edit Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Profile;
