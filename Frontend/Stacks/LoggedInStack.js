import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React, {lazy, useEffect} from 'react';

// Eager-loaded screens
import TabControl from '../Screens/TabControl';
import Orders from './../Screens/Orders/Orders';
import AddPaymentOrShipping from './../Screens/PaymentAndShipping/AddPaymentOrShipping';
import SettingsMenu from './../Screens/SettingsMenu';
import GetStartedSell from '../Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRulesWithContinue from '../Screens/GetStartedSell/GetStartedSellRulesWithContinue';
import GetStartedSellRules from '../Screens/GetStartedSell/GetStartedSellRules';
import ContinueOnboarding from '../Screens/GetStartedSell/ContinueOnboarding';
import GetStreamViewerSDK from '../Screens/StreamViewer/GetStreamViewerSDK';

// Lazily load the group of onboarding-related screens
const SellerOrdersNew = lazy(() => import('../Screens/Orders/SellerOrdersNew'));
const ViewOrderSeller = lazy(() => import('../Screens/Orders/ViewOrderSeller'));
const EnterStreamTitle = lazy(() =>
  import('../Screens/Stream/EnterStreamTitle'),
);
const SelectProducts = lazy(() => import('../Screens/Stream/SelectProducts'));
const SelectThumbnail = lazy(() => import('../Screens/Stream/SelectThumbnail'));
const SetScheduleTime = lazy(() => import('../Screens/Stream/SetScheduleTime'));
const ManageProducts = React.lazy(() =>
  import('./../Screens/Products/ManageProducts'),
);
const AddProduct = React.lazy(() => import('./../Screens/Products/AddProduct'));
const ViewProduct = React.lazy(() =>
  import('./../Screens/Products/ViewProduct'),
);

const ManageListings = React.lazy(() =>
  import('./../Screens/Listing/ManageListings'),
);
const SelectProductForListing = React.lazy(() =>
  import('./../Screens/Listing/SelectProductForListing'),
);
const SubmitListing = React.lazy(() =>
  import('./../Screens/Listing/SubmitListing'),
);
const ViewListingSeller = React.lazy(() =>
  import('./../Screens/Listing/ViewListingSeller'),
);

//Actually lazy load the screens
//const GetStreamSDK = lazy(() => import('../Screens/Stream/GetStreamSDK'));
import GetStreamSDK from '../Screens/Stream/GetStreamSDK';
import ViewProfile from '../Screens/Profile/ViewProfile';
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

const LoggedInStack = () => {
  const {userData} = useSelector(state => state.auth);
  const isSeller = userData?.user?.isSeller;

  useEffect(() => {
    if (isSeller) {
      // Preloaded Seller screens
      import('../Screens/Orders/ViewOrderSeller');
      import('../Screens/Stream/EnterStreamTitle');
      import('../Screens/Stream/SelectProducts');
      import('../Screens/Products/AddProduct');
      import('../Screens/Products/ViewProduct');
      import('../Screens/Stream/SellerOrdersNew');
      import('../Screens/Stream/SelectThumbnail');
      import('../Screens/Stream/SetScheduleTime');
      import('../Screens/Listing/ManageListings');
      import('../Screens/Listing/SelectProductForListing');
      import('../Screens/Listings/SubmitListing');
      import('../Screens/Listings/ViewListingSeller');
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
      <Stack.Screen
        name="GetStartedSellRulesWithContinue"
        component={GetStartedSellRulesWithContinue}
      />
      <Stack.Screen name="ContinueOnboarding" component={ContinueOnboarding} />
      <Stack.Screen name="GetStreamViewerSDK" component={GetStreamViewerSDK} />
      <Stack.Screen name="ViewProfile" component={ViewProfile} />
      <Stack.Screen
        name="ReportSellerOptions"
        component={ReportSellerOptions}
      />
      <Stack.Screen name="ReportSeller" component={ReportSeller} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      {/* Conditionally load the SellerOrders screen */}
      {isSeller && (
        <>
          <Stack.Screen name="SellerOrdersNew" component={SellerOrdersNew} />

          <Stack.Screen name="ViewOrderSeller" component={ViewOrderSeller} />
          <Stack.Screen name="EnterStreamTitle" component={EnterStreamTitle} />
          <Stack.Screen name="SelectProducts" component={SelectProducts} />
          <Stack.Screen name="SelectThumbnail" component={SelectThumbnail} />
          <Stack.Screen name="SetScheduleTime" component={SetScheduleTime} />
          <Stack.Screen name="GetStreamSDK" component={GetStreamSDK} />
          <Stack.Screen
            name="EnterOrderTracking"
            component={EnterOrderTracking}
          />
          <Stack.Screen name="ManageListings" component={ManageListings} />
          <Stack.Screen
            name="SelectProductForListing"
            component={SelectProductForListing}
          />
          <Stack.Screen name="SubmitListing" component={SubmitListing} />
          <Stack.Screen
            name="ViewListingSeller"
            component={ViewListingSeller}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default LoggedInStack;
