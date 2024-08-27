import React, {useCallback, useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  ActivityIndicator,
  View,
  AppState,
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

const CreateConnectedAccount = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [accountID, setAccountID] = useState('');
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

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

    setAccountID(accountId);

    if (accountLink && accountLink.url) {
      Linking.openURL(accountLink.url);
    }

    return {
      accountId,
      accountLink,
    };
  };

  const checkStripeOnboarding = async () => {
    setLoading(true); // Start loading
    const payload = {
      email: userEmail,
    };

    const response = await axios
      .post(
        baseURL + apiEndpoints.checkStripeConnectedAccountOnboardingComplete,
        payload,
      )
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {success, accountId} = response.data;

    console.log('Result:', success);
    console.log('Account ID:', accountId);

    setLoading(false); // Stop loading

    return {
      success,
      accountId,
    };
  };

  const viewStripeDashboard = async () => {
    const payload = {
      email: userEmail,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.createStripeLoginLink, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {success, loginLink} = response.data;

    if (loginLink && loginLink.url) {
      Linking.openURL(loginLink.url);
    }

    return {
      success,
      loginLink,
    };
  };

  useFocusEffect(
    useCallback(() => {
      if (accountID != null || accountID != '') {
        checkStripeOnboarding();
      }
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        if (accountID) {
          checkStripeOnboarding();
        }
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, accountID]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <View>
          <Button title="Start onboarding" onPress={startOnboarding} />
          <Button title="View Dashboard" onPress={viewStripeDashboard} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default CreateConnectedAccount;
