import {StripeProvider, useStripe} from '@stripe/stripe-react-native';
import {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Screen} from 'react-native-screens';
import {
  baseURL,
  apiEndpoints,
  stripePublishableKey,
} from '../Resources/Constants';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

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
    <View style={{alignItems: 'center', marginTop: '3%'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '50%',
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
            marginLeft: '30%',
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
          <Icon name="person-circle-outline" size={40} color="black" />
          <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
            Profile
          </Text>
        </View>
        <Icon name="chevron-forward" size={40} color="black" />
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
          <Icon name="card-outline" size={40} color="black" />
          <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
            Payment and shipping
          </Text>
        </View>
        <Icon name="chevron-forward" size={40} color="black" />
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
        onPress={() => navigation.navigate('ManageProducts')}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="cube-outline" size={35} color="black" />
          <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
            Manage Products
          </Text>
        </View>
        <Icon name="chevron-forward" size={40} color="black" />
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
          <Icon name="log-out-outline" size={40} color="black" />
          <Text style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
            Log out
          </Text>
        </View>
        <Icon name="chevron-forward" size={40} color="black" />
      </TouchableOpacity>
    </View>
  );
}
