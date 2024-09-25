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

export default function AddAddress({route}) {
  const {address} = route.params;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);

  const [addressExist, setAddressExist] = useState(false);

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const updateCustomerAddress = async addressDetails => {
    const {address} = addressDetails;
    const payload = {
      email: userEmail,
      address: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
      },
    };

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.updateStripeCustomerAddress,
        payload,
      );
      if (response.data.success) {
        console.log('Address updated:');
        navigation.navigate('AddPaymentOrShipping');
      } else {
        console.error('Failed to update address:');
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  useEffect(() => {
    if (address) {
      setAddressExist(true);
    }
  }, [address]);

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
        <View style={{alignItems: 'center', marginTop: '10%'}}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.7,
            }}>
            Shipping Address
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginHorizontal: '4%',
              fontSize: calculatedFontSize / 2.9,
            }}>
            Shipping address added here will be used for shipping products. Only
            one shipping address can be added at a time.
          </Text>
          {addressExist && (
            <View
              style={{
                marginTop: '10%',
              }}>
              <Text>Current shipping address</Text>
              <TouchableOpacity
                onPress={() => {
                  setAddressSheetVisible(true);
                }}
                style={{
                  marginTop: '1%',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  width: '100%',
                  flexDirection: 'row',
                  paddingVertical: '4%',
                  paddingHorizontal: '4%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon name="home-outline" size={40} color="black" />
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      marginLeft: '10%',
                    }}>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
                    {address.state}, {address.postal_code}, {address.country}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={40} color="black" />
              </TouchableOpacity>
            </View>
          )}

          {!addressExist && (
            <TouchableOpacity
              onPress={() => {
                setAddressSheetVisible(true);
              }}
              style={{
                marginTop: '10%',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                width: '100%',
                flexDirection: 'row',
                paddingVertical: '4%',
                paddingHorizontal: '4%',
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
                  Add shipping address
                </Text>
              </View>
              <Icon name="chevron-forward" size={30} color="black" />
            </TouchableOpacity>
          )}

          <AddressSheet
            appearance={{
              colors: {
                primary: appPink,
                background: '#ffffff',
              },
            }}
            visible={addressSheetVisible}
            allowedCountries={['CA']}
            onSubmit={async addressDetails => {
              setAddressSheetVisible(false);

              // Handle result and update your UI
              await updateCustomerAddress(addressDetails);
            }}
            onError={error => {
              if (error.code === AddressSheetError.Failed) {
                Alert.alert(
                  'There was an error.',
                  'Check the logs for details.',
                );
                console.log(error?.localizedMessage);
              }
              // Make sure to set `visible` back to false to dismiss the address element.
              setAddressSheetVisible(false);
            }}
          />
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
}
