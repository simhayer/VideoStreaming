import React, {Component} from 'react';
import {Alert, StyleSheet, View, SafeAreaView, Text} from 'react-native';
import Auth from './Frontend/Screens/Auth';
import axios from 'axios';
import ServiceRequests from './Frontend/Components/ServiceRequests';
import SignUp from './Frontend/Components/SignUp';
// import { NavigationContainer } from './Frontend/Navigation';
import {NavigationContainer} from '@react-navigation/native';
import MyStack from './Frontend/MyStack';
//import { CableProvider } from './Frontend/Components/Screens/CallComponents/CableProvidor';


const App = () => {
  return (
    // <SafeAreaView style={{flex: 1}}>
    //   <View style={{flex: 1}}>
    //     {!this.state.isAuthenticated || this.state.currentUser === null ? (
    //       <View style={styles.container}>
    //         <Auth cb={onLoginCallBack} />
    //       </View>
    //     ) : (
    //       <View style={[{flex: 1}]}>
    //         <Text>Logged In!</Text>
    //         {/* <Chat userID={this.state.id} chatClient={this.chatClient} /> */}
    //       </View>
    //     )}
    //   </View>
    // </SafeAreaView>
    // <SafeAreaView style={{flex: 1}}>
    //   <View style={{flex: 1}}>
    //     {/* <NavigationContainer/> */}
    //   <SignUp/>
    //   </View>
    // </SafeAreaView>
    <NavigationContainer>
      <MyStack></MyStack>
      
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
