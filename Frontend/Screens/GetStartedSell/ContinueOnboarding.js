import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
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
    <SafeAreaView style={styles.container(colors.background)}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={styles.backButton}>
        <Icon name="chevron-back" size={35} color="black" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.heading(calculatedFontSize)}>
          Onboarding Incomplete
        </Text>
        <Text style={styles.description}>
          We need more information before you can start selling. You cannot
          start selling until the onboarding is complete.
        </Text>

        {/* Optional Loading Indicator */}
        {/* <ActivityIndicator
          size="large"
          color="#f542a4"
          style={{marginVertical: 20}}
        /> */}
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={continueOnboarding}
          style={styles.continueButton}
          activeOpacity={0.8}>
          <Text style={styles.continueButtonText(calculatedFontSize)}>
            Complete Onboarding
          </Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          If your documents are under verification, check the status in the
          dashboard or try again later.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: backgroundColor => ({
    flex: 1,
    paddingTop: 10,
    backgroundColor,
  }),
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 2,
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 70,
  },
  heading: fontSize => ({
    color: 'black',
    fontWeight: 'bold',
    fontSize: fontSize / 1.8,
    textAlign: 'center',
    marginBottom: 10,
  }),
  description: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    width: '90%',
    lineHeight: 22,
  },
  footer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 16,
  },
  continueButton: {
    width: '70%',
    backgroundColor: '#f542a4',
    borderRadius: 40,
    paddingVertical: 16,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Adds elevation for Android
  },
  continueButtonText: fontSize => ({
    color: 'white',
    fontWeight: 'bold',
    fontSize: fontSize / 2.7,
    textAlign: 'center',
  }),
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ContinueOnboarding;
