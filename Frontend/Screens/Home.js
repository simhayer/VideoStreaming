import React from 'react';
import Profile from './ProfileTab';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StreamScreen from './StreamScreen';
import ViewerTab from './ViewerTab';
import StartStreamTab from './StartStreamTab';
import Icon from 'react-native-vector-icons/Ionicons';

const Home = () => {
  const Tab = createBottomTabNavigator();
  //const navigation = useNavigation();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'StartStreamTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ViewerTab') {
            iconName = focused ? 'eye' : 'eye-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'StreamScreen') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f542a4',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="ViewerTab" component={ViewerTab} />
      <Tab.Screen name="StartStreamTab" component={StartStreamTab} />
      {/* <Tab.Screen name="StreamScreen" component={StreamScreen} /> */}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Home;
