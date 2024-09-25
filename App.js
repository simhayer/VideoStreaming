import {NavigationContainer} from '@react-navigation/native';
import LazyStack from './Frontend/Stacks/LoadingScreen';

const App = () => {
  return (
    <NavigationContainer>
      <LazyStack></LazyStack>
    </NavigationContainer>
  );
};

export default App;
