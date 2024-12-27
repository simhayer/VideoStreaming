import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {appPink, colors} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const GetStartedSell = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={{alignItems: 'flex-end'}}>
        <TouchableOpacity
          style={{margin: 12}}
          onPress={() => navigation.navigate('Streams')}>
          <Icon name="close" size={35} color="black" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          marginHorizontal: '5%',
          alignItems: 'center',
          flex: 1,
        }}>
        <Image
          source={require('../../Resources/paid.png')}
          style={{
            height: '30%',
          }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: calculatedFontSize / 2,
            color: 'black',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '4%',
            marginTop: '4%',
          }}>
          Start Selling on BARS and Earn
        </Text>
        <View
          style={{
            justifyContent: 'space-start',
            flex: 1,
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.8,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 10,
            }}>
            Get started with the fast growing live shopping era!
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.8,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 10,
            }}>
            No subscription fees, No hidden charges, just start selling
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.8,
              color: 'black',
              fontWeight: 'bold',
            }}>
            Commision as low as 5% on each sale
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('GetStartedSellRulesWithContinue')}
          style={{
            flexDirection: 'row',
            paddingVertical: '4%',
            backgroundColor: appPink,
            borderRadius: 40,
            width: 'auto',
            marginBottom: 40,
          }}>
          <Text
            style={{
              color: 'white',
              flex: 1,
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.5,
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
