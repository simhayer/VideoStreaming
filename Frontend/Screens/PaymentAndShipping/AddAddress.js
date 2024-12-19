import {
  AddressSheet,
  AddressSheetError,
  StripeProvider,
} from '@stripe/stripe-react-native';
import {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {stripePublishableKey, appPink, colors} from '../../Resources/Constants';
import {useDispatch, useSelector} from 'react-redux';
import {updateUserAddress} from '../../Redux/Features/AuthSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

export default function AddAddress({route}) {
  const navigation = useNavigation();
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const dispatch = useDispatch();

  const [addressExist, setAddressExist] = useState(false);

  const {userData} = useSelector(state => state.auth);
  const address = userData?.user?.address;

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

    dispatch(updateUserAddress(payload));

    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  useEffect(() => {
    if (address) {
      setAddressExist(true);
    }
  }, [address]);

  const handleAddressSheetOpen = () => {
    // Ensure the AddressSheet is closed before reopening
    setAddressSheetVisible(false);

    // Delay opening to ensure state reset completes
    setTimeout(() => {
      setAddressSheetVisible(true);
    }, 50); // Adjust delay if necessary
  };

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <SafeAreaView
        style={{flex: 1, backgroundColor: colors.background, paddingTop: 20}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={35} color="black" />
        </TouchableOpacity>
        <View style={{alignItems: 'center', marginTop: '10%'}}>
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
              <Text
                style={{
                  fontSize: calculatedFontSize / 2.9,
                  color: 'black',
                  marginLeft: 10,
                  fontWeight:'600'
                }}>
                Current shipping address
              </Text>
              <TouchableOpacity
                onPress={handleAddressSheetOpen}
                style={{
                  marginTop: 15,
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
                  <View>
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: 'bold',
                        marginLeft: '10%',
                        maxWidth: '100%',
                      }}>
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''},{' '}
                      {address.city}
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: 'bold',
                        marginLeft: '10%',
                        maxWidth: '100%',
                      }}>
                      {address.state}, {address.postal_code}, {address.country}
                    </Text>
                  </View>
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
                marginTop: 15,
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
                secondaryText: '#000000',
                primaryText: '#000000',
                placeholderText: '#808080',
                componentBackground: '#ffffff',
                componentDivider: '#808080',
                componentBorder: '#808080',
                componentText: '#000000',
                background: '#ffffff',
                icon: '#000000',
              },
            }}
            defaultValues={{
              address: {
                line1: address?.line1,
                line2: address?.line2,
                city: address?.city,
                state: address?.state,
                postalCode: address?.postal_code,
                country: address?.country,
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
