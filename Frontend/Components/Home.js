import React from 'react';
import Profile from './Screens/Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeTab from './Screens/CallComponents/HomeTab'
import ViewerTab from './Screens/CallComponents/ViewerTab'

const Home = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeTab} />
      <Tab.Screen name="ViewerTab" component={ViewerTab} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Home;
