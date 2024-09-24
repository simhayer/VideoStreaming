import React, {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';

const LazyStack = () => {
  const [loading, setLoading] = useState(true);
  const [LazyComponent, setLazyComponent] = useState(null);
  const {isAuthenticated} = useSelector(state => state.auth);

  useEffect(() => {
    const loadComponent = async () => {
      setLoading(true); // Set loading to true when starting the import

      try {
        // Lazy load the appropriate stack based on authentication status
        if (isAuthenticated) {
          const {default: ImportedComponent} = await import(
            '../Stacks/LoggedInStack'
          );
          setLazyComponent(() => ImportedComponent);
        } else {
          const {default: ImportedComponent} = await import(
            '../Stacks/LoggedOutStack'
          );
          setLazyComponent(() => ImportedComponent);
        }
      } catch (error) {
        console.error('Error loading component:', error);
      } finally {
        setLoading(false); // Stop the loading spinner when done
      }
    };

    loadComponent();
  }, [isAuthenticated]); // Re-run if `isAuthenticated` changes

  if (loading) {
    // Show a loading spinner while the component is being lazy-loaded
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading component...</Text>
      </View>
    );
  }

  return LazyComponent ? (
    <LazyComponent /> // Render the dynamically loaded stack component
  ) : (
    <Text>Error loading component</Text> // Error handling
  );
};

export default LazyStack;
