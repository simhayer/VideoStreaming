import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {lazy} from 'react';

// Eager-loaded screens
import TabControl from '../Screens/TabControl';
import Orders from '../Screens/Orders/Orders';
import AddPaymentOrShipping from '../Screens/PaymentAndShipping/AddPaymentOrShipping';
import SettingsMenu from '../Screens/SettingsMenu';
import GetStartedSell from '../Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRulesWithContinue from '../Screens/GetStartedSell/GetStartedSellRulesWithContinue';
import GetStartedSellRules from '../Screens/GetStartedSell/GetStartedSellRules';
import ContinueOnboarding from '../Screens/GetStartedSell/ContinueOnboarding';
import GetStreamViewerSDK from '../Screens/StreamViewer/GetStreamViewerSDK';

import SellerOrdersNew from '../Screens/Orders/SellerOrdersNew';
import ViewOrderSeller from '../Screens/Orders/ViewOrderSeller';
import EnterStreamTitle from '../Screens/Stream/EnterStreamTitle';
import SelectProducts from '../Screens/Stream/SelectProducts';
import SelectThumbnail from '../Screens/Stream/SelectThumbnail';
import SetScheduleTime from '../Screens/Stream/SetScheduleTime';
import ManageProducts from '../Screens/Products/ManageProducts';
import AddProduct from '../Screens/Products/AddProduct';
import ViewProduct from '../Screens/Products/ViewProduct';
import ViewOrderBuyer from '../Screens/Orders/ViewOrderBuyer';

//Actually lazy load the screens
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
const ReportSellerOptions = React.lazy(() =>
  import('../Screens/Controls/Report/ReportSellerOptions'),
);
const ReportSeller = React.lazy(() =>
  import('../Screens/Controls/Report/ReportSeller'),
);
const ContactUs = React.lazy(() =>
  import('../Screens/Controls/Other/ContactUs'),
);

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
        name="GetStartedSellRulesWithContinue"
        component={GetStartedSellRulesWithContinue}
      />
      <Stack.Screen
        name="GetStartedSellRules"
        component={GetStartedSellRules}
      />
      <Stack.Screen name="ContinueOnboarding" component={ContinueOnboarding} />
      <Stack.Screen name="GetStreamViewerSDK" component={GetStreamViewerSDK} />

      <Stack.Screen name="SellerOrdersNew" component={SellerOrdersNew} />
      <Stack.Screen name="ViewOrderSeller" component={ViewOrderSeller} />
      <Stack.Screen name="EnterStreamTitle" component={EnterStreamTitle} />
      <Stack.Screen name="SelectProducts" component={SelectProducts} />
      <Stack.Screen name="SelectThumbnail" component={SelectThumbnail} />
      <Stack.Screen name="SetScheduleTime" component={SetScheduleTime} />
      <Stack.Screen name="GetStreamSDK" component={GetStreamSDK} />
      <Stack.Screen name="EnterOrderTracking" component={EnterOrderTracking} />
      <Stack.Screen name="ViewProfile" component={ViewProfile} />
      <Stack.Screen name="ReportSeller" component={ReportSellerOptions} />
      <Stack.Screen name="ReportSellerOptions" component={ReportSeller} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
    </Stack.Navigator>
  );
};

export default LoggedInStackSeller;
