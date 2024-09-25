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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={{alignItems: 'center', marginTop: '3%'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={40} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2,
              marginLeft: '25%',
            }}>
            Settings
          </Text>
        </View>

        <TouchableOpacity
          style={{
            marginTop: '7%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '100%',
            flexDirection: 'row',
            paddingVertical: '2%',
            paddingHorizontal: '4%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('EditProfile')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="person-circle-outline" size={30} color="black" />
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                marginLeft: '8%',
                fontSize: calculatedFontSize / 2.7,
              }}>
              Profile
            </Text>
          </View>
          <Icon name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: '3%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '100%',
            flexDirection: 'row',
            paddingVertical: '2%',
            paddingHorizontal: '4%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('AddPaymentOrShipping')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="card-outline" size={30} color="black" />
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                marginLeft: '10%',
                fontSize: calculatedFontSize / 2.7,
              }}>
              Payment and shipping
            </Text>
          </View>
          <Icon name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: '3%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '100%',
            flexDirection: 'row',
            paddingVertical: '2%',
            paddingHorizontal: '4%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('Orders')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="cart-outline" size={30} color="black" />
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                marginLeft: '10%',
                fontSize: calculatedFontSize / 2.7,
              }}>
              Orders
            </Text>
          </View>
          <Icon name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: '3%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            width: '100%',
            flexDirection: 'row',
            paddingVertical: '2%',
            paddingHorizontal: '4%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => onLogoutClick()}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="log-out-outline" size={30} color="black" />
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                marginLeft: '10%',
                fontSize: calculatedFontSize / 2.6,
              }}>
              Log out
            </Text>
          </View>
          <Icon name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
