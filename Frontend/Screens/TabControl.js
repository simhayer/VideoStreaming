import React, {useEffect, useState} from 'react';
import Profile from './Profile/ProfileTab';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ViewerTab from './ViewerTab';
import SellTab from './SellTab';
import GetStartedSell from './GetStartedSell/GetStartedSell';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../Resources/Constants';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ListListings from './Listing/ListListings';

const TabControl = ({route}) => {
  const initialTab = route.params?.initialTab || 'Shop';
  const Tab = createBottomTabNavigator();

  const [isOnboardingStarted, setIsOnboardingStarted] = useState(false);
  const {userData} = useSelector(state => state.auth);

  useEffect(() => {
    if (userData?.user?.isOnboardingStarted !== null) {
      setIsOnboardingStarted(userData?.user?.isOnboardingStarted);
    }
  }, [userData]);

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
          } else if (route.name === 'Shop') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          }

          return (
            <Icon
              name={iconName}
              size={focused ? 28 : 24} // Slightly larger icon when focused
              color={color}
            />
          );
        },
        tabBarActiveTintColor: appPink,
        tabBarInactiveTintColor: 'black',
        tabBarLabelStyle: {
          fontSize: 13, // Slightly larger for better readability
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: 'white',
          paddingVertical: 5,
          minHeight: 60, // Adjusted height for better touch area
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false, // Hide header for a cleaner tab view
      })}>
      <Tab.Screen name="Home" component={ViewerTab} />
      <Tab.Screen name="Shop" component={ListListings} />
      {isOnboardingStarted ? (
        <Tab.Screen name="Sell" component={SellTab} />
      ) : (
        <Tab.Screen name="Sell" component={GetStartedSell} />
      )}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default TabControl;
