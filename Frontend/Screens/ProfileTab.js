import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../Redux/Features/AuthSlice';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Profile = () => {
  const navigation = useNavigation();
  const {userData, isLoading} = useSelector(state => state.auth);
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const email = userData?.user?.email;
  //const email = "hayersimrat23@gmail.com"
  //const {userData, isAuthenticated} = useSelector(state => state.auth);
  const username = userData?.user?.username;
  const fullname = userData?.user?.fullname;

  return (
    <SafeAreaView>
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
      <Text>Welcome - {fullname}</Text>
    </SafeAreaView>
  );
};

export default Profile;
