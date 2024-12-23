import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {apiEndpoints, baseURL} from '../../../Resources/Constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useCallback} from 'react';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ControlsBottomSheet = ({
  controlsBottomSheetRef,
  controlsSnapPoints,
  controlsBottomSheetVisible,
  profilePictureURL,
  username,
  setControlsBottomSheetVisible,
}) => {
  const {userData} = useSelector(state => state.auth);

  const userUsername = userData?.user?.username;

  const navigation = useNavigation();

  const onBlockUser = async () => {
    console.log('Blocking user:', username);
    const payload = {
      blockedUsername: username,
      username: userUsername,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.addUserToBlocked, payload)
      .catch(error => {
        console.error('Error blocking user:', error);
        return;
      });

    console.log('Response:', response.data);
    navigation.navigate('Home');
  };

  const closeControls = () => {
    controlsBottomSheetRef.current?.close();
  };

  const handleContolsSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      //todo:get this function to work
      setControlsBottomSheetVisible(false);
    }
  }, []);

  return (
    <BottomSheet
      ref={controlsBottomSheetRef}
      snapPoints={controlsSnapPoints}
      index={controlsBottomSheetVisible ? 1 : -1}
      onChange={handleContolsSheetChanges}
      profilePictureURL={profilePictureURL}>
      <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: '3%',
            marginTop: 10,
          }}>
          <View style={{width: 30}} />
          <TouchableOpacity
            style={{
              padding: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 20,
              justifyContent: 'center',
            }}
            onPress={() =>
              navigation.navigate('ViewProfile', {username: username})
            }>
            <Image
              source={{uri: profilePictureURL}}
              style={styles.profilePicture}
            />

            <Text
              style={{
                color: 'black',
                fontSize: calculatedFontSize / 2.5,
                fontWeight: 'bold',
                marginLeft: 10,
              }}>
              {username}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 30,
              padding: 5,
              alignItems: 'center',
            }}
            onPress={closeControls}>
            <Icon name="chevron-down" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(0,0,0,0.1)',
            marginVertical: 8,
            marginHorizontal: 10,
          }}
        />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
          }}
          onPress={() =>
            navigation.navigate('ViewProfile', {username: username})
          }>
          <View style={styles.controlsIconStyle}>
            <Icon name="person-circle-outline" size={25} color="white" />
          </View>
          <Text style={styles.controlsTextStyle}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
          }}
          onPress={onBlockUser}>
          <View style={styles.controlsIconStyle}>
            <Icon name="ban" size={25} color="white" />
          </View>
          <Text style={styles.controlsTextStyle}>Block</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
          }}
          onPress={() =>
            navigation.navigate('ReportSellerOptions', {
              sellerUsername: username,
            })
          }>
          <View
            style={{
              backgroundColor: 'grey',
              borderRadius: 30,
              padding: 7,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '5%',
              paddingBottom: 9,
              paddingHorizontal: 9,
            }}>
            <Icon name="warning" size={25} color="white" />
          </View>
          <Text style={styles.controlsTextStyle}>Report seller</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  controlsTextStyle: {
    marginLeft: '5%',
    fontSize: calculatedFontSize / 2.1,
    color: 'black',
    fontWeight: '700',
  },
  controlsIconStyle: {
    backgroundColor: 'grey',
    borderRadius: 30,
    padding: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '5%',
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: '1%',
  },
});

export default ControlsBottomSheet;
