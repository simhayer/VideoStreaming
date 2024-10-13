import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React, {Suspense, lazy, useEffect} from 'react';

// Eager-loaded screens
import TabControl from '../Screens/TabControl';
import Orders from '../Screens/Orders/Orders';
import AddPaymentOrShipping from '../Screens/PaymentAndShipping/AddPaymentOrShipping';
import SettingsMenu from '../Screens/SettingsMenu';
import GetStartedSell from '../Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRules from '../Screens/GetStartedSell/GetStartedSellRules';
import ContinueOnboarding from '../Screens/GetStartedSell/ContinueOnboarding';
import GetStreamViewerSDK from '../Screens/StreamViewer/GetStreamViewerSDK';

import StartStreamTab from '../Screens/Stream/StartStreamTab';
import SellerOrders from '../Screens/Orders/SellerOrders';
import ViewOrderSeller from '../Screens/Orders/ViewOrderSeller';
import EnterStreamTitle from '../Screens/Stream/EnterStreamTitle';
import ManageProducts from '../Screens/Products/ManageProducts';
import AddProduct from '../Screens/Products/AddProduct';
import ViewProduct from '../Screens/Products/ViewProduct';
import ViewOrderBuyer from '../Screens/Orders/ViewOrderBuyer';

//Actually lazy load the screens
//const GetStreamSDK = lazy(() => import('../Screens/Stream/GetStreamSDK'));
import GetStreamSDK from '../Screens/Stream/GetStreamSDK';
const EditProfile = React.lazy(() => import('../Screens/Profile/EditProfile'));
const EnterOrderTracking = lazy(() =>
  import('../Screens/Orders/EnterOrderTracking'),
);
const ChangeUsername = React.lazy(() =>
  import('../Screens/Authentication/ChangeUsername'),
);
const AddAddress = React.lazy(() =>
  import('../Screens/PaymentAndShipping/AddAddress'),
);
const AddPaymentMethod = React.lazy(() =>
  import('../Screens/PaymentAndShipping/AddPaymentMethod'),
);
const ViewProfile = React.lazy(() => import('../Screens/Profile/ViewProfile'));

const Stack = createNativeStackNavigator();

const LoggedInStackSeller = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="TabControl" component={TabControl} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="ViewOrderBuyer" component={ViewOrderBuyer} />
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

      <Stack.Screen name="StartStreamTab" component={StartStreamTab} />
      <Stack.Screen name="SellerOrders" component={SellerOrders} />
      <Stack.Screen name="ViewOrderSeller" component={ViewOrderSeller} />
      <Stack.Screen name="EnterStreamTitle" component={EnterStreamTitle} />
      <Stack.Screen name="GetStreamSDK" component={GetStreamSDK} />
      <Stack.Screen name="EnterOrderTracking" component={EnterOrderTracking} />
      <Stack.Screen name="ViewProfile" component={ViewProfile} />
    </Stack.Navigator>
  );
};

export default LoggedInStackSeller;
