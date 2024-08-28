import React, {useCallback, useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  ActivityIndicator,
  View,
  AppState,
  BackHandler,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {Linking} from 'react-native';
import {
  apiEndpoints,
  baseURL,
  stripePublishableKey,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const CreateConnectedAccount = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
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
      navigation.navigate('Sell');
      Linking.openURL(loginLink.url);
    }

    return {
      accountId,
      loginLink,
    };
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{alignItems: 'center', marginTop: '3%'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '50%',
            width: '100%',
          }}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="chevron-back" size={40} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2,
              marginLeft: '12%',
            }}>
            Onboarding not complete
          </Text>
        </View>
        <Text style={{marginTop: '5%', textAlign: 'center'}}>
          We need more information before you can start selling. You cannot
          selling untill the onboarding is complete
        </Text>
        <TouchableOpacity
          onPress={() => continueOnboarding()}
          style={{
            paddingVertical: '4%',
            width: '90%',
            backgroundColor: '#f542a4',
            borderRadius: 40,
            marginTop: '100%',
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.5,
              fontWeight: 'bold',
            }}>
            Continue onboarding/ Manage dashboard
          </Text>
        </TouchableOpacity>
        <Text style={{marginTop: '5%', textAlign: 'center'}}>
          If you have documents/information in verification, check the status
          using the dashboard, or come back later
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default CreateConnectedAccount;
