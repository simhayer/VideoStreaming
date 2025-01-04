import React, {useState} from 'react';
import {View, Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import FastImage from 'react-native-fast-image';

const ProductImageCarousel = ({images, onImagePress}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const width = Dimensions.get('window').width;

  const renderDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Carousel */}
      <Carousel
        loop
        width={width}
        data={images} // Array of image URLs
        onSnapToItem={index => setActiveIndex(index)} // Track active slide
        renderItem={({item}) =>
          !onImagePress ? (
            <FastImage
              source={{uri: item}}
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <TouchableOpacity onPress={() => onImagePress(activeIndex)}>
              <FastImage
                source={{uri: item}}
                style={styles.image}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          )
        }
      />

      {/* Pagination Dots */}
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10, // Adjust to position dots over or below carousel
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'black', // Highlight active dot
  },
  inactiveDot: {
    backgroundColor: 'gray', // Inactive dots
  },
});

export default ProductImageCarousel;
