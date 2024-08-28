import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
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
import {apiEndpoints, appPink, baseURL} from '../../Resources/Constants';
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

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const startOnboarding = async () => {
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
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{alignItems: 'flex-end'}}>
        <TouchableOpacity
          style={{margin: 12}}
          onPress={() => navigation.navigate('Home')}>
          <Icon name="close" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          marginHorizontal: '5%',
        }}>
        <View style={{width: '100%'}}>
          <Text
            style={{
              fontSize: calculatedFontSize / 1.5,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: '4%',
            }}>
            Rules and Guidelines...
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'space-around',
            height: '60%',
          }}>
          <View>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.5,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Must ship products within 48 hours of sale
            </Text>
            <Text>
              Items must be shipped within 48 hours or 2 business days of the
              sale. Fail to do so, migt lead to account actions
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.5,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Selling counterfeit items is prohibited
            </Text>
            <Text>
              Selling counterfeit items is against the terms and conditions of
              selling on the platform.
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.5,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Package professionally and safely
            </Text>
            <Text>
              It is sellers responsibility to package the items safely and
              ensure the buyer receieve the item in good condition.
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: calculatedFontSize / 2.5,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Accepting Terms and Conditions
            </Text>
            <Text>
              By selling on the platform, you agree to the terms and conditions
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => startOnboarding()}
          style={{
            flexDirection: 'row',
            paddingVertical: '4%',
            backgroundColor: appPink,
            borderRadius: 40,
            marginTop: '20%',
          }}>
          <Text
            style={{
              color: 'white',
              flex: 1,
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.2,
              fontWeight: 'bold',
            }}>
            Start Onboarding
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GetStartedSell;
