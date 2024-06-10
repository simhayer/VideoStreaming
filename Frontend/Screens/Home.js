import React from 'react';
import Profile from './Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeTab from './HomeTab'
import ViewerTab from './ViewerTab'
import Icon from 'react-native-vector-icons/Ionicons';

const Home = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'HomeTab') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'ViewerTab') {
          iconName = focused ? 'eye' : 'eye-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#f542a4',
      tabBarInactiveTintColor: 'gray',
      headerShown:false,
    })}
  >
      <Tab.Screen name="HomeTab" component={HomeTab} />
      <Tab.Screen name="ViewerTab" component={ViewerTab} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Home;
