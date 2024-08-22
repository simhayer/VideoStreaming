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
          alignItems: 'center',
        }}>
        <Image
          source={require('../../Resources/paid.png')}
          style={{
            width: '40%',
            height: '30%',
            resizeMode: 'center',
          }}
        />
        <Text
          style={{
            fontSize: calculatedFontSize / 1.2,
            color: 'black',
            fontWeight: 'bold',
            textAlign: 'center',
            marginHorizontal: '8%',
            marginBottom: '4%',
          }}>
          Start Selling on BARS and Earn
        </Text>
        <View
          style={{
            justifyContent: 'space-around',
            height: '30%',
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.5,
              color: 'black',
              fontWeight: 'bold',
            }}>
            Get started with the fast growing live shopping era!
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.5,
              color: 'black',
              fontWeight: 'bold',
            }}>
            No subscription fees, No hidden charges, just start selling
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.5,
              color: 'black',
              fontWeight: 'bold',
            }}>
            Commision as low as 5% on each sale
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('GetStartedSellRules')}
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
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GetStartedSell;
