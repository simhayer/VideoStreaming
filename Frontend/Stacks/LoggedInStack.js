import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {lazy} from 'react';

// Eager-loaded screens
import TabControl from '../Screens/TabControl';
import Orders from './../Screens/Orders/Orders';
import AddPaymentOrShipping from './../Screens/PaymentAndShipping/AddPaymentOrShipping';
import SettingsMenu from './../Screens/SettingsMenu';
import GetStartedSell from '../Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRules from '../Screens/GetStartedSell/GetStartedSellRules';
import ContinueOnboarding from '../Screens/GetStartedSell/ContinueOnboarding';
import GetStreamViewerSDK from '../Screens/StreamViewer/GetStreamViewerSDK';

//Actually lazy load the screens
const EditProfile = lazy(() => import('./../Screens/EditProfile'));
const ChangeUsername = lazy(() =>
  import('./../Screens/Authentication/ChangeUsername'),
);
const AddAddress = lazy(() =>
  import('./../Screens/PaymentAndShipping/AddAddress'),
);
const AddPaymentMethod = lazy(() =>
  import('./../Screens/PaymentAndShipping/AddPaymentMethod'),
);

const Stack = createNativeStackNavigator();

const LoggedInStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Eager-loaded screens */}
      <Stack.Screen name="TabControl" component={TabControl} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="ManageProducts" component={ManageProducts} />
      <Stack.Screen name="AddProduct" component={AddProduct} />
      <Stack.Screen name="ViewProduct" component={ViewProduct} />
      <Stack.Screen
        name="AddPaymentOrShipping"
        component={AddPaymentOrShipping}
      />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethod} />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="SettingsMenu" component={SettingsMenu} />
      <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
      <Stack.Screen name="GetStartedSell" component={GetStartedSell} />
      <Stack.Screen
        name="GetStartedSellRules"
        component={GetStartedSellRules}
      />
      <Stack.Screen name="ContinueOnboarding" component={ContinueOnboarding} />
      <Stack.Screen name="GetStreamViewerSDK" component={GetStreamViewerSDK} />
    </Stack.Navigator>
  );
};

export default LoggedInStack;
