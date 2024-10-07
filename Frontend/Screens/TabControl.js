import React, {useCallback, useEffect, useState} from 'react';
import Profile from './ProfileTab';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ViewerTab from './ViewerTab';
import SellTab from './SellTab';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../Resources/Constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const TabControl = ({route}) => {
  const initialTab = route.params?.initialTab || 'Home';
  const Tab = createBottomTabNavigator();
  const navigation = useNavigation();

  const [isOnboardingStarted, setIsOnboardingStarted] = useState(false);
  const {userData} = useSelector(state => state.auth);

  useState(() => {
    if (userData?.user?.stripeConnectedAccountId !== null) {
      setIsOnboardingStarted(true);
    }
  }, []);

  //const isOnboardingStarted = userData?.user.isOnboardingStarted;

  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
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
      <Tab.Screen
        name="Sell"
        component={SellTab}
        listeners={{
          tabPress: e => {
            if (!isOnboardingStarted) {
              e.preventDefault();
              navigation.navigate('GetStartedSell'); // Ensure this screen is in your stack navigator
            }
          },
        }}
      />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default TabControl;
