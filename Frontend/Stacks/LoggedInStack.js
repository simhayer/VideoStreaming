import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React, {Suspense, lazy, useEffect} from 'react';

// Eager-loaded screens
import TabControl from '../Screens/TabControl';
import Orders from './../Screens/Orders/Orders';
import AddPaymentOrShipping from './../Screens/PaymentAndShipping/AddPaymentOrShipping';
import SettingsMenu from './../Screens/SettingsMenu';
import GetStartedSell from '../Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRules from '../Screens/GetStartedSell/GetStartedSellRules';
import ContinueOnboarding from '../Screens/GetStartedSell/ContinueOnboarding';
import GetStreamViewerSDK from '../Screens/StreamViewer/GetStreamViewerSDK';

// Lazily load the group of onboarding-related screens
const StartStreamTab = lazy(() => import('../Screens/Stream/StartStreamTab'));
const SellerOrders = lazy(() => import('../Screens/Orders/SellerOrders'));
const ViewOrderSeller = lazy(() => import('../Screens/Orders/ViewOrderSeller'));
const EnterStreamTitle = lazy(() =>
  import('../Screens/Stream/EnterStreamTitle'),
);
const ManageProducts = React.lazy(() =>
  import('./../Screens/Products/ManageProducts'),
);
const AddProduct = React.lazy(() => import('./../Screens/Products/AddProduct'));
const ViewProduct = React.lazy(() =>
  import('./../Screens/Products/ViewProduct'),
);

//Actually lazy load the screens
//const GetStreamSDK = lazy(() => import('../Screens/Stream/GetStreamSDK'));
import GetStreamSDK from '../Screens/Stream/GetStreamSDK';
//const EditProfile = React.lazy(() => import('../../Screens/EditProfile'));
const EditProfile = React.lazy(() => import('../Screens/Profile/EditProfile'));
const EnterOrderTracking = lazy(() =>
  import('../Screens/Orders/EnterOrderTracking'),
);
const ChangeUsername = React.lazy(() =>
  import('./../Screens/Authentication/ChangeUsername'),
);
const AddAddress = React.lazy(() =>
  import('./../Screens/PaymentAndShipping/AddAddress'),
);
const AddPaymentMethod = React.lazy(() =>
  import('./../Screens/PaymentAndShipping/AddPaymentMethod'),
);

const Stack = createNativeStackNavigator();

const LoggedInStack = () => {
  const {userData} = useSelector(state => state.auth);
  const isSeller = userData?.user?.isSeller;

  useEffect(() => {
    if (isSeller) {
      // Preloaded Seller screens
      import('../Screens/Stream/StartStreamTab');
      import('../Screens/Orders/SellerOrders');
      import('../Screens/Orders/ViewOrderSeller');
      import('../Screens/Stream/EnterStreamTitle');
      import('../Screens/Products/AddProduct');
      import('../Screens/Products/ViewProduct');
    }
  }, [isSeller]);

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

      {/* Conditionally load the SellerOrders screen */}
      {isSeller && (
        <>
          <Stack.Screen name="StartStreamTab" component={StartStreamTab} />
          <Stack.Screen name="SellerOrders" component={SellerOrders} />
          <Stack.Screen name="ViewOrderSeller" component={ViewOrderSeller} />
          <Stack.Screen name="EnterStreamTitle" component={EnterStreamTitle} />
          <Stack.Screen name="GetStreamSDK" component={GetStreamSDK} />
          <Stack.Screen
            name="EnterOrderTracking"
            component={EnterOrderTracking}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default LoggedInStack;
