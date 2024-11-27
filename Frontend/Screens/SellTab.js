import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  SafeAreaView,
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
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;
  const isSeller = userData?.user?.isSeller;

  const dispatch = useDispatch();
  const {isOnboardingChecked} = useSelector(state => state.NonPersistSlice);

  const startStream = async () => {
    console.log('Starting stream...');
    var onboarding = checkStripeOnboarding();
    if (!onboarding) {
      return;
    }

    navigation.navigate('EnterStreamTitle', {type: 'stream'});
  };

  const scheduleStream = async () => {
    navigation.navigate('EnterStreamTitle', {type: 'schedule'});
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

      return false;
    }
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      checkStripeOnboarding();
    }, [isOnboardingChecked]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
        paddingHorizontal: 7, // Added padding for consistent spacing
      }}>
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={appPink} />
          <Text
            style={{
              marginTop: 10,
              color: 'black',
              fontSize: calculatedFontSize / 2.5,
            }}>
            Checking Onboarding Status...
          </Text>
        </View>
      ) : (
        <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
          {/* Dashboard Title */}
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: calculatedFontSize / 2,
              marginTop: 20,
            }}>
            Sellers Dashboard
          </Text>

          {/* Button Grid Section */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
              width: '90%',
              flex: 1,
            }}>
            <TouchableOpacity
              style={[styles.button, {flex: 1, marginRight: 8}]}
              onPress={() => navigation.navigate('ManageProducts')}
              activeOpacity={0.8}>
              <View style={{alignItems: 'center'}}>
                <Icon name="cube-outline" size={30} color="black" />
                <Text style={styles.buttonText}>Manage Products</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, {flex: 1, marginLeft: 8}]}
              onPress={() => navigation.navigate('ManageListings')}
              activeOpacity={0.8}>
              <View style={{alignItems: 'center'}}>
                <Icon name="albums-outline" size={30} color="black" />
                <Text style={styles.buttonText}>Listings</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 15,
              width: '90%',
              flex: 1,
            }}>
            <TouchableOpacity
              style={[styles.button, {flex: 1, marginRight: 8}]}
              onPress={() => navigation.navigate('SellerOrdersNew')}
              activeOpacity={0.8}>
              <View style={{alignItems: 'center'}}>
                <Icon name="cart-outline" size={30} color="black" />
                <Text style={styles.buttonText}>Orders (Selling)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {flex: 1, marginLeft: 8}]}
              onPress={viewDashboard}
              activeOpacity={0.8}>
              <View style={{alignItems: 'center'}}>
                <Icon name="cash-outline" size={30} color="black" />
                <Text style={styles.buttonText}>Payments Dashboard</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 15,
              width: '90%',
              flex: 1,
            }}>
            <TouchableOpacity
              style={[styles.button, {flex: 1, marginRight: 8}]}
              onPress={() => navigation.navigate('GetStartedSellRules')}
              activeOpacity={0.8}>
              <View style={{alignItems: 'center'}}>
                <Icon name="alert-circle-outline" size={30} color="black" />
                <Text style={styles.buttonText}>Rules & Guidelines</Text>
              </View>
            </TouchableOpacity>

            <View
              style={[
                styles.button,
                {flex: 1, marginLeft: 8, borderWidth: 0},
              ]}></View>
          </View>

          {/* Spacer to push the button down */}
          <View style={{flex: 1}} />

          {/* Start Selling Button */}
          <TouchableOpacity
            onPress={startStream}
            style={{
              paddingVertical: 16,
              width: '60%',
              backgroundColor: appPink,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 5,
              marginBottom: 40,
              alignItems: 'center',
            }}
            activeOpacity={0.8}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.5,
              }}>
              Start Selling
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.8,
              marginBottom: 10,
            }}>
            Want to schedule a session for later?
          </Text>
          <TouchableOpacity
            onPress={scheduleStream}
            style={{
              paddingVertical: 16,
              width: '60%',
              backgroundColor: appPink,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 5,
              marginBottom: 40,
              alignItems: 'center',
            }}
            activeOpacity={0.8}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.5,
              }}>
              Schedule Live Stream
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
    textAlign: 'center',
  },
});

export default StartStreamTab;
