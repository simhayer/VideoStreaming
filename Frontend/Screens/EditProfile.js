import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

const EditProfile = () => {
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;

  return (
    <View>
      <Text>{email}</Text>
      <Text>{fullname}</Text>
    </View>
  );
};

export default EditProfile;
