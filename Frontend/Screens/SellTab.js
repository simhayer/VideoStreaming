import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  Button,
  SafeAreaView,
  TextInput,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import {apiEndpoints, appPink, baseURL} from '../Resources/Constants';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {setOnboardingChecked} from '../Redux/Features/NonPersistSlice';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [canSell, setCanSell] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const dispatch = useDispatch();
  const {isOnboardingChecked} = useSelector(state => state.NonPersistSlice);

  const startStream = async () => {
    navigation.navigate('StartStreamTab', {title});
  };

  const checkStripeOnboarding = async () => {
    if (isOnboardingChecked) {
      return;
    }
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
        console.error('Error checking onboarding:', error);
      });

    const {success, accountId} = response.data;

    console.log('Result:', success);
    console.log('Account ID:', accountId);

    setLoading(false); // Stop loading

    if (success) {
      dispatch(setOnboardingChecked());
    }

    if (!success) {
      navigation.navigate('ContinueOnboarding');
    }
    return {
      success,
      accountId,
    };
  };

  useFocusEffect(
    useCallback(() => {
      checkStripeOnboarding();
    }, [isOnboardingChecked]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        checkStripeOnboarding();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, isOnboardingChecked]);

  const viewDashboard = async () => {
    const payload = {
      email: userEmail,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.createStripeLoginLink, payload)
      .catch(error => {
        console.error('Error adding broadcast:', error);
      });

    const {accountId, loginLink} = response.data;

    if (loginLink && loginLink.url) {
      //navigation.navigate('Sell');
      Linking.openURL(loginLink.url);
    }

    return {
      accountId,
      loginLink,
    };
  };

  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text>Checking Onboarding Status...</Text>
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center', marginTop: '4%'}}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2,
            }}>
            Sellers Dashboard
          </Text>

          <TouchableOpacity
            style={{
              marginTop: '3%',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              width: '90%',
              flexDirection: 'row',
              paddingVertical: '2%',
              paddingHorizontal: '4%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 40,
              marginTop: '10%',
            }}
            onPress={() => navigation.navigate('ManageProducts')}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="cube-outline" size={35} color="black" />
              <Text
                style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
                Orders
              </Text>
            </View>
            <Icon name="chevron-forward" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: '3%',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              width: '90%',
              flexDirection: 'row',
              paddingVertical: '2%',
              paddingHorizontal: '4%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 40,
            }}
            onPress={() => viewDashboard()}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="cube-outline" size={35} color="black" />
              <Text
                style={{color: 'black', fontWeight: 'bold', marginLeft: '10%'}}>
                View Payments Dashboards
              </Text>
            </View>
            <Icon name="chevron-forward" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => startStream()}
            style={{
              padding: '4%',
              width: '90%',
              backgroundColor: appPink,
              borderRadius: 40,
              marginTop: '70%',
            }}>
            <Icon name="videocam-outline" size={40} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.5,
              fontWeight: 'bold',
            }}>
            Start Selling
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StartStreamTab;
