import {NavigationContainer} from '@react-navigation/native';
import LazyStack from './Frontend/Stacks/LoadingScreenEager';

const App = () => {
  return (
    <NavigationContainer>
      <LazyStack></LazyStack>
    </NavigationContainer>
  );
};

export default App;
