import {StripeProvider, useStripe} from '@stripe/stripe-react-native';
import {useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  baseURL,
  apiEndpoints,
  stripePublishableKey,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

export default function AddPaymentMethod() {
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const fetchPaymentSheetParams = async () => {
    const payload = {
      email: userEmail,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.paymentSheet, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    console.log('Response:', response.data);

    const {setupIntent, ephemeralKey, customer} = response.data;

    return {
      setupIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {setupIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams();

    const {error} = await initPaymentSheet({
      merchantDisplayName: 'Bars',
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      setupIntentClientSecret: setupIntent,
      googlePay: {
        merchantCountryCode: 'CA',
        currencyCode: 'CAD',
        testEnv: true,
      },
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    const {error} = await presentPaymentSheet();

    if (error) {
      console.log('Card add failed');
    } else {
      console.log('card added');
      navigation.navigate('AddPaymentOrShipping');
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const onAddCardClick = () => {
    //initializePaymentSheet();
    openPaymentSheet();
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
        <View style={{alignItems: 'center', marginTop: '5%'}}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2.9,
            }}>
            Add payment method
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.7,
              textAlign: 'center',
              color: 'black',
            }}>
            You won't be charged untill you purchase an item
          </Text>
          <TouchableOpacity
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
            }}
            onPress={() => onAddCardClick()}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="card-outline" size={30} color="black" />
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  marginLeft: '10%',
                  fontSize: calculatedFontSize / 2.7,
                }}>
                Credit or Debit Card
              </Text>
            </View>
            <Icon name="chevron-forward" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
}
