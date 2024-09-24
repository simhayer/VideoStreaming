import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MyStack from './Frontend/MyStack_AllLazy';

const App = () => {
  return (
    <NavigationContainer>
      <MyStack></MyStack>
    </NavigationContainer>
  );
};

export default App;
