import React, {useState} from 'react';
import Profile from './ProfileTab';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StreamScreen from './StreamScreen';
import ViewerTab from './ViewerTab';
import StartStreamTab from './StartStreamTab';
import SellTab from './SellTab';
import StreamScreenSDK from './StreamScreenSDK';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../Resources/Constants';
import {useNavigation} from '@react-navigation/native';

const TabControl = () => {
  const Tab = createBottomTabNavigator();
  const navigation = useNavigation();
  const [canSell, setCanSell] = useState(false);

  //const navigation = useNavigation();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Stream') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Sell') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: appPink,
        tabBarInactiveTintColor: 'black',
        tabBarLabelStyle: {fontSize: 12, fontWeight: '500'},
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={ViewerTab} />
      {canSell ? (
        <Tab.Screen name="Sell" component={SellTab} />
      ) : (
        <Tab.Screen
          name="Sell"
          component={SellTab}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              navigation.navigate('GetStartedSell');
            },
          }}
        />
      )}
      <Tab.Screen name="Stream" component={StartStreamTab} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default TabControl;
