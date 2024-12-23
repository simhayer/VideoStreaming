import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  StyleSheet,
} from 'react-native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const {userData} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

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
      <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
        {/* Dashboard Title */}
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginTop: 20,
          }}>
          Admin Controls
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
        <View style={{flex: 2}} />
      </View>
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

export default AdminDashboard;
