import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {Linking} from 'react-native';
import {apiEndpoints, baseURL, colors} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const ContinueOnboarding = () => {
  const navigation = useNavigation();
  const [accountID, setAccountID] = useState('');
  const [loading, setLoading] = useState(false);
  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const continueOnboarding = async () => {
    const payload = {
      email: userEmail,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.continueOnboarding, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {accountId, loginLink} = response.data;

    setAccountID(accountId);

    if (loginLink && loginLink.url) {
      Linking.openURL(loginLink.url);

      setTimeout(() => {
        navigation.navigate('Sell'); // Navigate after 2 seconds
      }, 1000);
    }

    return {
      accountId,
      loginLink,
    };
  };

  return (
    <SafeAreaView
      style={{flex: 1, paddingTop: 10, backgroundColor: colors.background}}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Icon name="chevron-back" size={35} color="black" />
      </TouchableOpacity>
      <View style={{alignItems: 'center'}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
          }}>
          Onboarding not complete
        </Text>
        <Text style={{marginTop: 20, textAlign: 'center', width: '90%'}}>
          We need more information before you can start selling. You cannot
          selling untill the onboarding is complete
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          marginBottom: 20,
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={continueOnboarding}
          style={{
            paddingVertical: '4%',
            width: '90%',
            backgroundColor: '#f542a4',
            borderRadius: 40,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.7,
              fontWeight: 'bold',
            }}>
            Complete onboarding
          </Text>
        </TouchableOpacity>
        <Text style={{marginTop: 20, textAlign: 'center'}}>
          If you have documents/information in verification, check the status
          using the dashboard, or come back later
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ContinueOnboarding;
