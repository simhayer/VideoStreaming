import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React, {Suspense, useEffect, useState} from 'react';
import LoadingScreen from './Stacks/LoadingScreen'; // Custom loading screen

// Lazy load the stack groups
const TabControl = React.lazy(() => import('./Screens/TabControl'));
const SignUpOptions = React.lazy(() =>
  import('./Screens/Authentication/SignUpOptions'),
);
const LoggedInStack = React.lazy(() => import('./Stacks/LoggedInStack'));
//const LoggedOutStack = React.lazy(() => import('./Stacks/LoggedOutStack'));
import LoggedOutStack from './Stacks/LoggedOutStack';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  const {isAuthenticated} = useSelector(state => state.auth);
  const [isReady, setIsReady] = useState(false);

  // Simulate initialization/loading logic that happens during the startup
  //   useEffect(() => {
  //     const initializeApp = async () => {
  //       // Simulate preloading of resources or data fetching (if any)
  //       await new Promise(resolve => setTimeout(resolve, 2000)); // Example delay for loading resources
  //       setIsReady(true); // Indicate that the app is ready to display content
  //     };

  //     initializeApp();
  //   }, []);

  //if (!isReady) {
  // Show LoadingScreen while waiting for the app to initialize and lazy-loading to start
  return <LoadingScreen />;
  //}

  //   // Render the Navigator inside Suspense to lazy load the stacks
  //   return (
  //     <Suspense fallback={<LoadingScreen />}>
  //       <Stack.Navigator screenOptions={{headerShown: false}}>
  //         {isAuthenticated ? (
  //           //<Stack.Screen name="LoggedInStack" component={LoggedInStack} />
  //           <Stack.Screen name="TabControl" component={TabControl} />
  //         ) : (
  //           <Stack.Screen name="LoggedOutStack" component={LoggedOutStack} />
  //         )}
  //       </Stack.Navigator>
  //     </Suspense>
  //   );
};

export default MyStack;
