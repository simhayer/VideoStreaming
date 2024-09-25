import React, {useState, useEffect, useRef} from 'react';
import {View, Animated, Easing, Image} from 'react-native';
import MyStack from '../MyStack_backup';

const LazyStack = () => {
  // Animation states
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(scaleValue, {
          toValue: 5, // Keeps growing the logo
          duration: 7000, // 7 seconds for each loop (slower animation)
          easing: Easing.linear, // Linear easing for continuous growth
          useNativeDriver: true, // Use native driver for performance
        }),
      ).start();
    };

    // Start animation immediately when the component mounts
    startAnimation();

    // Ensure the animation finishes and component is ready
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 6, // Pop slightly larger
        duration: 300, // Quick pop effect (300ms)
        easing: Easing.out(Easing.ease), // Easing for pop
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 0, // Fade out completely
          duration: 500, // 0.5-second fade-out
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.5, // Shrink back while fading out
          duration: 500, // Sync the shrinking with fade-out
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Only remove the logo and display the next screen when everything is ready
      setLoading(false);
    });
  }, []); // Empty array ensures this effect runs only once

  if (loading) {
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
            style={{width: 200, height: 200}} // Adjust initial size as needed
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  // When loading is finished, display the main stack
  return <MyStack />;
};

export default LazyStack;
