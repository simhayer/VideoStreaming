/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Provider } from 'react-redux';
import { persistor, store } from './Frontend/Redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { CableProvider } from './Frontend/Components/Screens/CallComponents/CableProvidor';

const Root = () => (
    <Provider store = {store}>
        <PersistGate loading ={null} persistor={persistor}>
            <CableProvider><App/>
            </CableProvider>
        
        </PersistGate>
    </Provider>

)

AppRegistry.registerComponent(appName, () => Root);
