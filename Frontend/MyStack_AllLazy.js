import React, {useState, useEffect, Suspense} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

// Lazy-load all the components
const SignUp = React.lazy(() => import('./Screens/Authentication/SignUp'));
const SignUpOptions = React.lazy(() =>
  import('./Screens/Authentication/SignUpOptions'),
);
const Login = React.lazy(() => import('./Screens/Authentication/Login'));
const ForgetPassword = React.lazy(() =>
  import('./Screens/Authentication/PassowrdHandle/ForgetPassword'),
);
const TabControl = React.lazy(() => import('./Screens/TabControl'));
const ForgetCode = React.lazy(() =>
  import('./Screens/Authentication/PassowrdHandle/FrogetCode'),
);
const ResetPassword = React.lazy(() =>
  import('./Screens/Authentication/PassowrdHandle/ResetPassword'),
);
const EditProfile = React.lazy(() => import('./Screens/EditProfile'));
const UsernameCreate = React.lazy(() =>
  import('./Screens/Authentication/UsernameCreate'),
);
const GetStartedSell = React.lazy(() =>
  import('./Screens/GetStartedSell/GetStartedSell'),
);
const GetStartedSellRules = React.lazy(() =>
  import('./Screens/GetStartedSell/GetStartedSellRules'),
);
const AddPaymentOrShipping = React.lazy(() =>
  import('./Screens/PaymentAndShipping/AddPaymentOrShipping'),
);
const AddPaymentMethod = React.lazy(() =>
  import('./Screens/PaymentAndShipping/AddPaymentMethod'),
);
const AddAddress = React.lazy(() =>
  import('./Screens/PaymentAndShipping/AddAddress'),
);
const SettingsMenu = React.lazy(() => import('./Screens/SettingsMenu'));
const ManageProducts = React.lazy(() =>
  import('./Screens/Products/ManageProducts'),
);
const AddProduct = React.lazy(() => import('./Screens/Products/AddProduct'));
const ContinueOnboarding = React.lazy(() =>
  import('./Screens/GetStartedSell/ContinueOnboarding'),
);
const StartStreamTab = React.lazy(() =>
  import('./Screens/Stream/StartStreamTab'),
);
const Orders = React.lazy(() => import('./Screens/Orders/Orders'));
const ViewProduct = React.lazy(() => import('./Screens/Products/ViewProduct'));
const SellerOrders = React.lazy(() => import('./Screens/Orders/SellerOrders'));
const ViewOrderBuyer = React.lazy(() =>
  import('./Screens/Orders/ViewOrderBuyer'),
);
const ViewOrderSeller = React.lazy(() =>
  import('./Screens/Orders/ViewOrderSeller'),
);
const EnterOrderTracking = React.lazy(() =>
  import('./Screens/Orders/EnterOrderTracking'),
);
const EnterStreamTitle = React.lazy(() =>
  import('./Screens/Stream/EnterStreamTitle'),
);
const GetStreamViewerSDK = React.lazy(() =>
  import('./Screens/StreamViewer/GetStreamViewerSDK'),
);
const GetStreamSDK = React.lazy(() => import('./Screens/Stream/GetStreamSDK'));
const ChangeUsername = React.lazy(() =>
  import('./Screens/Authentication/ChangeUsername'),
);
const UsernameCreateForLoggedIn = React.lazy(() =>
  import('./Screens/Authentication/UsernameCreateForLoggedIn'),
);

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
    <Suspense
      fallback={
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      }>
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
    </Suspense>
  );
};

export default MyStack;
