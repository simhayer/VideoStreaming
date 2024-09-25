import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {setOnboardingStarted} from '../../Redux/Features/AuthSlice';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const GetStartedSell = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const startOnboarding = async () => {
    setLoading(true);
    const payload = {
      email: userEmail,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.createStripeConnectedAccount, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {accountId, accountLink} = response.data;

    if (accountLink && accountLink.url) {
      dispatch(setOnboardingStarted());
      Linking.openURL(accountLink.url);
      navigation.navigate('Sell');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={35} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2.2,
            textAlign: 'center',
            flex: 1,
          }}>
          Rules and Guidelines...
        </Text>
        <View style={{width: 35}} />
      </View>
      <View
        style={{
          marginHorizontal: '5%',
          flex: 1,
        }}>
        <View
          style={{
            justifyContent: 'flex-start',
            flex: 1,
            paddingVertical: '5%',
          }}>
          <View style={{marginBottom: 10}}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.7,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Must ship products within 48 hours of sale
            </Text>
            <Text style={{fontSize: calculatedFontSize / 3}}>
              Items must be shipped within 48 hours or 2 business days of the
              sale. Fail to do so, migt lead to account actions
            </Text>
          </View>
          <View style={{marginBottom: 10}}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.7,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Selling counterfeit items is prohibited
            </Text>
            <Text style={{fontSize: calculatedFontSize / 3}}>
              Selling counterfeit items is against the terms and conditions of
              selling on the platform.
            </Text>
          </View>
          <View style={{marginBottom: 10}}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.7,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Package professionally and safely
            </Text>
            <Text style={{fontSize: calculatedFontSize / 3}}>
              It is sellers responsibility to package the items safely and
              ensure the buyer receieve the item in good condition.
            </Text>
          </View>
          <View style={{marginBottom: 10}}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.7,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Accepting Terms and Conditions
            </Text>
            <Text style={{fontSize: calculatedFontSize / 3}}>
              By selling on the platform, you agree to the terms and conditions
            </Text>
          </View>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={appPink} />
        ) : (
          <TouchableOpacity
            onPress={() => startOnboarding()}
            style={{
              flexDirection: 'row',
              paddingVertical: '4%',
              backgroundColor: appPink,
              borderRadius: 40,
              height: 'auto',
              marginBottom: 40,
            }}>
            <Text
              style={{
                color: 'white',
                flex: 1,
                textAlign: 'center',
                fontSize: calculatedFontSize / 2.5,
                fontWeight: 'bold',
              }}>
              Start Onboarding
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default GetStartedSell;
