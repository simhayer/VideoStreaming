import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUp from './Screens/Authentication/SignUp';
import SignUpOptions from './Screens/Authentication/SignUpOptions';
import Login from './Screens/Authentication/Login';
import ForgetPassword from './Screens/Authentication/PassowrdHandle/ForgetPassword';
import TabControl from './Screens/TabControl';
import {useSelector} from 'react-redux';
import ForgetCode from './Screens/Authentication/PassowrdHandle/FrogetCode';
import ResetPassword from './Screens/Authentication/PassowrdHandle/ResetPassword';
import EditProfile from './Screens/EditProfile';
import UsernameCreate from './Screens/Authentication/UsernameCreate';
import GetStartedSell from './Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRules from './Screens/GetStartedSell/GetStartedSellRules';
import AddPaymentOrShipping from './Screens/PaymentAndShipping/AddPaymentOrShipping';
import AddPaymentMethod from './Screens/PaymentAndShipping/AddPaymentMethod';
import AddAddress from './Screens/PaymentAndShipping/AddAddress';
import SettingsMenu from './Screens/SettingsMenu';
import ManageProducts from './Screens/Products/ManageProducts';
import AddProduct from './Screens/Products/AddProduct';
import ContinueOnboarding from './Screens/GetStartedSell/ContinueOnboarding';
import StartStreamTab from './Screens/Stream/StartStreamTab';
import Orders from './Screens/Orders/Orders';
import ViewProduct from './Screens/Products/ViewProduct';
import SellerOrders from './Screens/Orders/SellerOrders';
import ViewOrderBuyer from './Screens/Orders/ViewOrderBuyer';
import ViewOrderSeller from './Screens/Orders/ViewOrderSeller';
import EnterOrderTracking from './Screens/Orders/EnterOrderTracking';
import EnterStreamTitle from './Screens/Stream/EnterStreamTitle';
import GetStreamViewerSDK from './Screens/StreamViewer/GetStreamViewerSDK';
import GetStreamSDK from './Screens/Stream/GetStreamSDK';
import ChangeUsername from './Screens/Authentication/ChangeUsername';
import {useEffect, useState} from 'react';
import UsernameCreateForLoggedIn from './Screens/Authentication/UsernameCreateForLoggedIn';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  const [hasUsername, setHasUsername] = useState(true); // Default to true to avoid unnecessary redirects
  const {userData, isAuthenticated} = useSelector(state => state.auth);

  // Set hasUsername based on userData.user
  useEffect(() => {
    if (
      userData?.user &&
      (!userData.user.username || userData.user.username === '')
    ) {
      console.log(
        'Username does not exist, redirecting to UsernameCreate screen',
      );
      setHasUsername(false);
    } else {
      setHasUsername(true);
    }
  }, [userData]);

  console.log('file: login.js:22 -login - userData: ', userData);

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        !hasUsername ? (
          <Stack.Screen
            name="UsernameCreateForLoggedIn"
            component={UsernameCreateForLoggedIn}
            options={{headerShown: false}}
          />
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="TabControl"
              component={TabControl}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GetStartedSell"
              component={GetStartedSell}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GetStartedSellRules"
              component={GetStartedSellRules}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddPaymentOrShipping"
              component={AddPaymentOrShipping}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddPaymentMethod"
              component={AddPaymentMethod}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddAddress"
              component={AddAddress}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SettingsMenu"
              component={SettingsMenu}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ManageProducts"
              component={ManageProducts}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddProduct"
              component={AddProduct}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ContinueOnboarding"
              component={ContinueOnboarding}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="StartStreamTab"
              component={StartStreamTab}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Orders"
              component={Orders}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ViewProduct"
              component={ViewProduct}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SellerOrders"
              component={SellerOrders}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ViewOrderBuyer"
              component={ViewOrderBuyer}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ViewOrderSeller"
              component={ViewOrderSeller}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EnterOrderTracking"
              component={EnterOrderTracking}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EnterStreamTitle"
              component={EnterStreamTitle}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GetStreamViewerSDK"
              component={GetStreamViewerSDK}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GetStreamSDK"
              component={GetStreamSDK}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ChangeUsername"
              component={ChangeUsername}
              options={{headerShown: false}}
            />
          </Stack.Group>
        )
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="SignUpOptions"
            component={SignUpOptions}
            initialParams={{type: 'Signup'}}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UsernameCreate"
            component={UsernameCreate}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgetCode"
            component={ForgetCode}
            options={{title: 'ForgetCode'}}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPassword}
            options={{title: 'ResetPassword'}}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default MyStack;
