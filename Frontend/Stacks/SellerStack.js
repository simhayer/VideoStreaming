import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabControl from '../Screens/TabControl';
import EditProfile from '../Screens/EditProfile';
import StartStreamTab from '../Screens/Stream/StartStreamTab';
import Orders from '../Screens/Orders/Orders';
import ManageProducts from '../Screens/Products/ManageProducts';
import AddProduct from '../Screens/Products/AddProduct';
import ViewProduct from '../Screens/Products/ViewProduct';
import SellerOrders from '../Screens/Orders/SellerOrders';
import ViewOrderBuyer from '../Screens/Orders/ViewOrderBuyer';
import ViewOrderSeller from '../Screens/Orders/ViewOrderSeller';
import EnterOrderTracking from '../Screens/Orders/EnterOrderTracking';
import EnterStreamTitle from '../Screens/Stream/EnterStreamTitle';
import GetStreamViewerSDK from '../Screens/StreamViewer/GetStreamViewerSDK';
import GetStreamSDK from '../Screens/Stream/GetStreamSDK';
import AddPaymentOrShipping from '../Screens/PaymentAndShipping/AddPaymentOrShipping';
import AddPaymentMethod from '../Screens/PaymentAndShipping/AddPaymentMethod';
import AddAddress from '../Screens/PaymentAndShipping/AddAddress';
import SettingsMenu from '../Screens/SettingsMenu';
import ContinueOnboarding from '../Screens/GetStartedSell/ContinueOnboarding';
import GetStartedSell from '../Screens/GetStartedSell/GetStartedSell';
import GetStartedSellRules from '../Screens/GetStartedSell/GetStartedSellRules';
import ChangeUsername from '../Screens/Authentication/ChangeUsername';

const Stack = createNativeStackNavigator();

const LoggedInStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="StartStreamTab" component={StartStreamTab} />
      <Stack.Screen name="SellerOrders" component={SellerOrders} />
      <Stack.Screen name="ViewOrderSeller" component={ViewOrderSeller} />
      <Stack.Screen name="EnterOrderTracking" component={EnterOrderTracking} />
      <Stack.Screen name="EnterStreamTitle" component={EnterStreamTitle} />
      <Stack.Screen name="GetStreamSDK" component={GetStreamSDK} />
      <Stack.Screen name="ContinueOnboarding" component={ContinueOnboarding} />
      <Stack.Screen
        name="GetStartedSellRules"
        component={GetStartedSellRules}
      />
    </Stack.Navigator>
  );
};

export default LoggedInStack;
