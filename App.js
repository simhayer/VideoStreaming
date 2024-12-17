import {NavigationContainer} from '@react-navigation/native';
import LazyStack from './Frontend/Stacks/LoadingScreen';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { StatusBar } from 'react-native';

changeNavigationBarColor('#ffffff', true);

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#ffffff" barStyle='dark-content' />
      <LazyStack></LazyStack>
    </NavigationContainer>
  );
};

export default App;
