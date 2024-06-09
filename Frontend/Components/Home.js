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
import HomeTab10 from './Screens/CallComponents/HomeTab10'
import HomeTab4 from './Screens/CallComponents/HomeTab4'
import HomeTab5 from './Screens/CallComponents/HomeTab5'
import HomeTab6 from './Screens/CallComponents/HomeTab6'
import HomeTab7 from './Screens/CallComponents/HomeTab7'
import HomeTab8 from './Screens/CallComponents/HomeTab8'
import ViewerTab1 from './Screens/CallComponents/ViewerTab1'
//import HomeTab10 from './Screens/CallComponents/HomeTab10'
// import HomeTab11 from './Screens/CallComponents/src/hometab11'

//AppRegistry.registerComponent('TClone', () => App);

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
    // </SafeAreaView>r
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeTab10} />
      <Tab.Screen name="ViewerTab" component={ViewerTab1} />
      
      
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Home;
