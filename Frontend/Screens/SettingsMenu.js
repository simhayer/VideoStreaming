import {useState} from 'react';
import {
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {deleteUser, logout} from '../Redux/Features/AuthSlice';
import {
  colors,
  errorRed,
  PrivacyPolicyLink,
  TermsAndConditionsLink,
} from '../Resources/Constants';

export default function AddPaymentMethod() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;
  const isAdmin = userData?.user?.isAdmin;

  const onLogoutClick = async () => {
    console.log('Email from redux, ', userEmail);
    const logoutParams = {
      email: userEmail,
    };

    dispatch(logout(logoutParams));
  };

  const redirectToTermsAndConditions = () => {
    Linking.openURL(TermsAndConditionsLink);
  };

  const redirectToPrivacyPolicy = () => {
    Linking.openURL(PrivacyPolicyLink);
  };

  const onDeleteAccountClick = async () => {
    navigation.navigate('DeleteAccount');
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
      <ScrollView style={{marginTop: 20, width: '100%'}}>
        {isAdmin &&
          renderSettingOption('lock-closed-outline', 'Admin Controls', () =>
            navigation.navigate('AdminDashboard'),
          )}
        {renderSettingOption('person-circle-outline', 'Profile', () =>
          navigation.navigate('EditProfile'),
        )}
        {renderSettingOption('card-outline', 'Payment and Shipping', () =>
          navigation.navigate('AddPaymentOrShipping'),
        )}
        {renderSettingOption('cart-outline', 'Orders', () =>
          navigation.navigate('Orders'),
        )}
        {renderSettingOption(
          'lock-closed-outline',
          'Privacy policy',
          redirectToPrivacyPolicy,
        )}
        {renderSettingOption(
          'newspaper-outline',
          'Terms and Conditions',
          redirectToTermsAndConditions,
        )}
        {renderSettingOption('chatbox-outline', 'Contact Us', () =>
          navigation.navigate('ContactUs'),
        )}
        {renderSettingOption('log-out-outline', 'Log out', onLogoutClick)}
        <TouchableOpacity
          onPress={onDeleteAccountClick}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginBottom: 8,
          }}
          activeOpacity={0.8}>
          <Text
            style={{
              color: errorRed,
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.7,
              marginLeft: 12,
            }}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
