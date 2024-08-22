import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Button,
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {appPink} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const GetStartedSell = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');

  const startStream = async () => {
    navigation.navigate('StreamScreenSDK', {title});
  };

  return (
    <SafeAreaView>
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
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GetStartedSell;
