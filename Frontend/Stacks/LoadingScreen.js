import React, {useState, useEffect, useRef} from 'react';
import {View, Animated, Easing, Image} from 'react-native';
import {useSelector} from 'react-redux';

const LazyStack = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const [isDelayed, setIsDelayed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [LazyComponent, setLazyComponent] = useState(null);

  const {isAuthenticated} = useSelector(state => state.auth);
  const {userData} = useSelector(state => state.auth);
  const isSeller = userData?.user?.isSeller;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDelayed) {
      const startAnimation = () => {
        Animated.loop(
          Animated.timing(scaleValue, {
            toValue: 5,
            duration: 7000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ).start();
      };
      startAnimation();

      const loadComponent = async () => {
        setLoading(true);

        try {
          if (isAuthenticated) {
            const {default: ImportedComponent} = await import(
              '../Stacks/LoggedInStackSeller'
            );
            setLazyComponent(() => ImportedComponent);
          } else {
            const {default: ImportedComponent} = await import(
              '../Screens/Authentication/AuthOptions'
            );
            setLazyComponent(() => ImportedComponent);
          }
        } catch (error) {
          console.error('Error loading component:', error);
        } finally {
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 6,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(opacityValue, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 0.5,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            setLoading(false);
          });
        }
      };

      loadComponent();
    }
  }, [isDelayed, isAuthenticated]);

  if (loading || isDelayed) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        {/* Animated logo that grows, pops, fades, and shrinks */}
        <Animated.View
          style={{
            transform: [{scale: scaleValue}],
            opacity: opacityValue, // Fade-out effect
          }}>
          <Image
            source={require('../Resources/BARS_logo_nobackground.png')}
            style={{width: 200, height: 200}}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  // When loading is finished, apply the fade-in effect to LazyComponent
  return LazyComponent ? (
    <Animated.View style={{flex: 1, opacity: opacityValue}}>
      <LazyComponent />
    </Animated.View>
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <Image
        source={require('../Resources/BARS_logo_nobackground.png')}
        style={{width: 200, height: 200}}
      />
    </View>
  );
};

export default LazyStack;
