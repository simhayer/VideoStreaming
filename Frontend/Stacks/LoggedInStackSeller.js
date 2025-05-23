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
import ScheduledStreamViewer from '../Screens/ScheduleStream/ScheduledStreamViewer';

import SellerOrdersNew from '../Screens/Orders/SellerOrdersNew';
import ViewOrderSeller from '../Screens/Orders/ViewOrderSeller';
import EnterStreamTitle from '../Screens/Stream/EnterStreamTitle';
import SelectProducts from '../Screens/Stream/SelectProducts';
import SelectThumbnail from '../Screens/Stream/SelectThumbnail';
import SetScheduleTime from '../Screens/Stream/SetScheduleTime';
import ManageProducts from '../Screens/Products/ManageProducts';
import AddProduct from '../Screens/Products/AddProduct';
import ViewProductSeller from '../Screens/Products/ViewProductSeller';
import ViewProductBuyer from '../Screens/Products/ViewProductBuyer';
import ViewOrderBuyer from '../Screens/Orders/ViewOrderBuyer';
import ManageListings from '../Screens/Listing/ManageListings';
import ListListingsForAProduct from '../Screens/Listing/ListListingsForAProduct';
import SelectProductForListing from '../Screens/Listing/SelectProductForListing';
import SubmitListing from '../Screens/Listing/SubmitListing';
import ViewListingSeller from '../Screens/Listing/ViewListingSeller';
import ListListings from '../Screens/Listing/ListListings';
import ViewListingBuyer from '../Screens/Listing/ViewListingBuyer';
import EditListingQuantity from '../Screens/Listing/EditListingQuantity';
import Checkout from '../Screens/Listing/Checkout';

import SelectCategories from '../Screens/Products/SelectCategories';
import UsernameCreate from '../Screens/Authentication/UsernameCreate';

import EditImage from '../Components/EditImage';

//Actually lazy load the screens
import GetStreamSDK from '../Screens/Stream/GetStreamSDK';
import {useSelector} from 'react-redux';
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
const DeleteAccount = React.lazy(() =>
  import('../Screens/Authentication/DeleteAccount'),
);

//admin screens
const AdminDashboard = React.lazy(() =>
  import('../Screens/Admin/AdminDashboard'),
);

const Stack = createNativeStackNavigator();

const LoggedInStackSeller = () => {
  const {userData} = useSelector(state => state.auth);

  if (!userData || !userData?.user) {
    return null;
  }
  const isAdmin = userData?.user?.isAdmin;
  const email = userData.user.email;

  //check if username is set
  const username = userData.user.username;
  const usernameNotPresent = !username || username.includes('user21');

  //check if interested categories is chooses
  const interestedCategories = userData.user.interestedCategories;
  const interestedCategoriesNotPresent =
    !interestedCategories || interestedCategories?.length === 0;

  const isSetupIncomplete =
    usernameNotPresent || interestedCategoriesNotPresent;
  //const navigatorKey = isSetupIncomplete ? 'setupFlow' : 'mainFlow';

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isSetupIncomplete ? (
        // Setup Flow Screens
        <>
          {usernameNotPresent && (
            <Stack.Screen
              name="CreateUsername"
              component={UsernameCreate}
              initialParams={{email}}
            />
          )}
          {interestedCategoriesNotPresent && (
            <Stack.Screen
              name="SelectCategories"
              component={SelectCategories}
            />
          )}
        </>
      ) : (
        <>
          <Stack.Screen name="TabControl" component={TabControl} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Orders" component={Orders} />
          <Stack.Screen name="ViewOrderBuyer" component={ViewOrderBuyer} />
          <Stack.Screen name="ManageProducts" component={ManageProducts} />
          <Stack.Screen name="AddProduct" component={AddProduct} />
          <Stack.Screen
            name="ViewProductSeller"
            component={ViewProductSeller}
          />
          <Stack.Screen name="ViewProductBuyer" component={ViewProductBuyer} />
          <Stack.Screen name="ManageListings" component={ManageListings} />
          <Stack.Screen
            name="ListListingsForAProduct"
            component={ListListingsForAProduct}
          />
          <Stack.Screen
            name="SelectProductForListing"
            component={SelectProductForListing}
          />
          <Stack.Screen name="SubmitListing" component={SubmitListing} />
          <Stack.Screen
            name="ViewListingSeller"
            component={ViewListingSeller}
          />
          <Stack.Screen name="ListListings" component={ListListings} />
          <Stack.Screen name="ViewListingBuyer" component={ViewListingBuyer} />
          <Stack.Screen
            name="EditListingQuantity"
            component={EditListingQuantity}
          />
          <Stack.Screen name="Checkout" component={Checkout} />
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
          <Stack.Screen
            name="ContinueOnboarding"
            component={ContinueOnboarding}
          />
          <Stack.Screen
            name="GetStreamViewerSDK"
            component={GetStreamViewerSDK}
          />
          <Stack.Screen
            name="ScheduledStreamViewer"
            component={ScheduledStreamViewer}
          />

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
          <Stack.Screen name="ViewProfile" component={ViewProfile} />
          <Stack.Screen name="ReportSeller" component={ReportSellerOptions} />
          <Stack.Screen name="ReportSellerOptions" component={ReportSeller} />
          <Stack.Screen name="ContactUs" component={ContactUs} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
          <Stack.Screen name="EditImage" component={EditImage} />

          {isAdmin && (
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default LoggedInStackSeller;
