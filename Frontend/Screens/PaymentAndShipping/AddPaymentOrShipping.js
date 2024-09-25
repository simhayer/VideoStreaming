import {
  AddressSheet,
  AddressSheetError,
  StripeProvider,
  useStripe,
} from '@stripe/stripe-react-native';
import {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Screen} from 'react-native-screens';
import {
  baseURL,
  apiEndpoints,
  stripePublishableKey,
  appPink,
} from '../../Resources/Constants';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

export default function AddPaymentOrShipping() {
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);

  const [paymentMethodExist, setPaymentMethodExist] = useState(false);
  const [addressExist, setAddressExist] = useState(false);
  const [address, setAddress] = useState(null);

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const checkPaymentandAddressExist = async email => {
    const payload = {
      email: email,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.checkStripePaymentPresent, payload)
      .catch(error => {
        console.error('Error checking payment present:', error);
      });

    const {paymentPresent, address} = response.data;

    if (paymentPresent) {
      setPaymentMethodExist(true);
    }

    if (address != null) {
      setAddressExist(true);
      setAddress(address);
    }

    return {
      paymentPresent,
      address,
    };
  };

  useFocusEffect(
    useCallback(() => {
      checkPaymentandAddressExist(userEmail);
    }, []),
  );

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
        <View
          style={{
            alignItems: 'center',
            marginTop: '10%',
            marginHorizontal: '5%',
          }}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.7,
            }}>
            We need the following information to process for you to start
            bidding
          </Text>
          <Text
            style={{fontSize: calculatedFontSize / 2.9, textAlign: 'center'}}>
            You won't be charged untill you purchase an item
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AddPaymentMethod');
            }}
            style={{
              marginTop: '10%',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              width: '100%',
              flexDirection: 'row',
              paddingVertical: '4%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="card-outline" size={30} color="black" />
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  marginLeft: '10%',
                  fontSize: calculatedFontSize / 2.7,
                }}>
                Payment
              </Text>
            </View>
            <Icon
              name="checkmark-circle"
              size={30}
              color={paymentMethodExist ? 'green' : 'grey'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AddAddress', {address});
            }}
            style={{
              borderBottomWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              width: '100%',
              flexDirection: 'row',
              paddingVertical: '4%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="home-outline" size={30} color="black" />
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  marginLeft: '10%',
                  fontSize: calculatedFontSize / 2.7,
                }}>
                Shipping
              </Text>
            </View>
            <Icon
              name="checkmark-circle"
              size={30}
              color={addressExist ? 'green' : 'grey'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{
              marginTop: '10%',
              paddingVertical: '4%',
              backgroundColor: appPink,
              borderRadius: 40,
              paddingHorizontal: '10%',
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.7,
              }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
}
