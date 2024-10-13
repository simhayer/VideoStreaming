import {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {logout} from '../Redux/Features/AuthSlice';
import {colors} from '../Resources/Constants';

export default function AddPaymentMethod() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const onLogoutClick = async () => {
    console.log('Email from redux, ', userEmail);
    const logoutParams = {
      email: userEmail,
    };

    dispatch(logout(logoutParams));
  };

  const renderSettingOption = (iconName, label, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 8,
        borderRadius: 12,
      }}
      activeOpacity={0.8}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon name={iconName} size={28} color="black" />
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2.7,
            marginLeft: 12,
          }}>
          {label}
        </Text>
      </View>
      <Icon name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header Section */}
      <View style={{flexDirection: 'row', alignItems: 'center', padding: 4}}>
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
          Settings
        </Text>
        <View style={{width: 40}} />
      </View>

      {/* Settings Options */}
      <View style={{marginTop: 20, width: '100%'}}>
        {renderSettingOption('person-circle-outline', 'Profile', () =>
          navigation.navigate('EditProfile'),
        )}
        {renderSettingOption('card-outline', 'Payment and Shipping', () =>
          navigation.navigate('AddPaymentOrShipping'),
        )}
        {renderSettingOption('cart-outline', 'Orders', () =>
          navigation.navigate('Orders'),
        )}
        {renderSettingOption('log-out-outline', 'Log out', onLogoutClick)}
      </View>
    </SafeAreaView>
  );
}
