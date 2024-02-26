import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import { logout } from '../Redux/Features/AuthSlice';
import HomeTab from './Screens/HomeTab';
import Profile from './Screens/Profile';
import HomeTab1 from './Screens/HomeTab1';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeTab2 from './Screens/HomeTab2';
import HomeTab3 from './Screens/CallComponents/HomeTab3'
import HomeTab4 from './Screens/CallComponents/HomeTab4'
import HomeTab5 from './Screens/CallComponents/HomeTab5'

const Home = () => {
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;
    
  const Tab = createBottomTabNavigator();

  const onLogoutClick = async () => {

    console.log("Email from redux, ", email);
    const logoutParams  = {
      email: email,
    }

    dispatch(logout(logoutParams))

};

  return (
    // <SafeAreaView>
    //   <Text>You are logged in!</Text>
    //   <TouchableOpacity
    //     isloading={isLoading}
    //     onPress={() => onLogoutClick()}
    //     style={{padding: 10, backgroundColor: 'blue', borderRadius: 5}}>
    //     <Text style={{color: 'white', textAlign: 'center'}}>LogOut</Text>
    //   </TouchableOpacity>
    // </SafeAreaView>
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeTab5} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Home;
