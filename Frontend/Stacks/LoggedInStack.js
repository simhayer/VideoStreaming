import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {Suspense, lazy} from 'react';
import {ActivityIndicator} from 'react-native';

// Eager-loaded screens
//import TabControl from '../Screens/TabControl';
import TabControl from '../Screens/TabControl';
import EditProfile from './../Screens/EditProfile';
import Orders from './../Screens/Orders/Orders';
import ManageProducts from './../Screens/Products/ManageProducts';
import AddProduct from './../Screens/Products/AddProduct';
import ViewProduct from './../Screens/Products/ViewProduct';
import AddPaymentOrShipping from './../Screens/PaymentAndShipping/AddPaymentOrShipping';
import AddPaymentMethod from './../Screens/PaymentAndShipping/AddPaymentMethod';
import AddAddress from './../Screens/PaymentAndShipping/AddAddress';
import SettingsMenu from './../Screens/SettingsMenu';
import ChangeUsername from './../Screens/Authentication/ChangeUsername';

// Lazily load the group of onboarding-related screens
const SellerStack = lazy(() => import('../Stacks/SellerStack'));

const Stack = createNativeStackNavigator();

const LoggedInStack = () => {
  const {isOnboardingChecked} = useSelector(state => state.NonPersistSlice);

  console.log(
    'file: LoggedInStack.js:24 - isOnboardingChecked',
    isOnboardingChecked,
  );

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

      {/* Conditionally load the onboarding screens */}
      {/* {isOnboardingChecked && (
        <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
          <Stack.Screen
            name="OnboardingScreens"
            component={OnboardingScreens}
          />
        </Suspense>
      )} */}
    </Stack.Navigator>
  );
};

export default LoggedInStack;
