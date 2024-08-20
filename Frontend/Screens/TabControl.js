import React from 'react';
import Profile from './ProfileTab';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StreamScreen from './StreamScreen';
import ViewerTab from './ViewerTab';
import StartStreamTab from './StartStreamTab';
import StreamScreenSDK from './StreamScreenSDK';
import Icon from 'react-native-vector-icons/Ionicons';

const TabControl = () => {
  const Tab = createBottomTabNavigator();
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
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f542a4',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={ViewerTab} />
      <Tab.Screen name="Stream" component={StartStreamTab} />
      <Tab.Screen name="Profile" component={Profile} />
      {/* <Tab.Screen name="MainVideoSDK" component={MainVideoSDK} /> */}
      {/* <Tab.Screen name="VideoSDKViewer" component={VideoSDKViewer} /> */}
      {/* <Tab.Screen name="StreamScreenSDK" component={StreamScreenSDK} /> */}
    </Tab.Navigator>
  );
};

export default TabControl;
