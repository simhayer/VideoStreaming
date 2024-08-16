/**
 * @format
 */
//import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {persistor, store} from './Frontend/Redux/Store';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {register} from '@videosdk.live/react-native-sdk';

register();

const Root = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => Root);
