import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  SafeAreaView,
  TextInput,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  StyleSheet,
} from 'react-native';
import {apiEndpoints, appPink, baseURL, colors} from '../Resources/Constants';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {setOnboardingChecked} from '../Redux/Features/NonPersistSlice';
import {setIsSellerTrue} from '../Redux/Features/AuthSlice';

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
  const isSeller = userData?.user?.isSeller;

  const dispatch = useDispatch();
  const {isOnboardingChecked} = useSelector(state => state.NonPersistSlice);

  const startStream = async () => {
    navigation.navigate('EnterStreamTitle', {title});
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

    setLoading(false);

    if (success) {
      dispatch(setOnboardingChecked());
      console.log('isSeller:', isSeller);
      if (!isSeller) {
        console.log('Setting isSeller to true');
        dispatch(setIsSellerTrue());
      }
    }

    if (!success) {
      navigation.reset({
        index: 1,
        routes: [{name: 'TabControl'}, {name: 'ContinueOnboarding'}],
      });
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
      Linking.openURL(loginLink.url);
    }

    return {
      accountId,
      loginLink,
    };
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="grey" />
          <Text>Checking Onboarding Status...</Text>
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center', marginTop: '4%'}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.2,
              }}>
              Sellers Dashboard
            </Text>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                width: '90%',
                flex: 1,
              }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('ManageProducts')}>
                <View style={{alignItems: 'center'}}>
                  <Icon name="cube-outline" size={30} color="black" />
                  <Text style={styles.buttonText}>Manage Products</Text>
                </View>
              </TouchableOpacity>
              <View style={{flex: 0.5}} />
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SellerOrders')}>
                <View style={{alignItems: 'center'}}>
                  <Icon name="cart-outline" size={30} color="black" />
                  <Text style={styles.buttonText}>Orders (Selling)</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                width: '90%',
                flex: 1,
              }}>
              <TouchableOpacity style={styles.button} onPress={viewDashboard}>
                <View style={{alignItems: 'center'}}>
                  <Icon name="cash-outline" size={30} color="black" />
                  <Text style={styles.buttonText}>Payments dashboard</Text>
                </View>
              </TouchableOpacity>
              <View style={{flex: 0.5}} />
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('GetStartedSellRules')}>
                <View style={{alignItems: 'center'}}>
                  <Icon name="alert-circle-outline" size={30} color="black" />
                  <Text style={styles.buttonText}>Rules and Guidelines</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flex: 1}} />
          <TouchableOpacity
            onPress={() => startStream()}
            style={{
              paddingVertical: '4%',
              paddingHorizontal: '20%',
              backgroundColor: appPink,
              borderRadius: 40,
              height: 'auto',
              marginBottom: 40,
            }}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.7,
              }}>
              Start Selling
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: calculatedFontSize / 2.7,
  },
});

export default StartStreamTab;
