import React, {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';
import {appPink} from '../Resources/Constants';

const LazyStack = () => {
  const [loading, setLoading] = useState(true);
  const [LazyComponent, setLazyComponent] = useState(null);
  const {isAuthenticated} = useSelector(state => state.auth);

  useEffect(() => {
    const loadComponent = async () => {
      setLoading(true);

      try {
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
        setLoading(false);
      }
    };

    loadComponent();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <ActivityIndicator size="large" color={appPink} />
        <Text>Loading component...</Text>
      </View>
    );
  }

  return LazyComponent ? (
    <LazyComponent />
  ) : (
    <Text>Error loading component</Text>
  );
};

export default LazyStack;
