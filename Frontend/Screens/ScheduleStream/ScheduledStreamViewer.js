import React, {useState, useEffect, useCallback, memo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {baseURL, colors} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

const {height: screenHeight, width: screenWidth} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const CountdownTimer = ({streamDate}) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateCountdown = () => {
    const now = new Date();
    const diff = streamDate - now; // Time difference in milliseconds

    if (diff <= 0) {
      return null; // Stream has started
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    return {days, hours, minutes, seconds};
  };

  useEffect(() => {
    // Perform the initial calculation immediately
    const timeLeft = calculateCountdown();
    if (timeLeft) {
      setCountdown(timeLeft);
    }

    // Set up the interval for subsequent updates
    const interval = setInterval(() => {
      const timeLeft = calculateCountdown();
      if (timeLeft) {
        setCountdown(timeLeft);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  if (!countdown) {
    return <Text style={styles.streamStartedText}>Stream has started</Text>;
  }

  return (
    <View style={styles.countdownRow}>
      {Object.entries(countdown).map(([label, value]) => (
        <View key={label} style={styles.countdownBox}>
          <Text style={styles.countdownValue}>{value}</Text>
          <Text style={styles.countdownLabel}>{label.toUpperCase()}</Text>
        </View>
      ))}
    </View>
  );
};

const MemoizedFlatList = memo(({products, renderItem}) => {
  return (
    <FlatList
      style={{flex: 1}}
      data={products}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingBottom: 10, // Add padding to avoid the last item being cut off
      }}
    />
  );
});

const ScheduledStreamViewer = ({route}) => {
  const {scheduledStreamItem, profilePictureURL} = route.params;
  const username = scheduledStreamItem.username;
  const streamDate = new Date(scheduledStreamItem.date);
  const thumbnailUri = `${baseURL}/thumbnail/${scheduledStreamItem.thumbnail}`;
  const navigation = useNavigation();

  const closeStream = () => {
    navigation.goBack();
  };

  const renderItem = useCallback(({item}) => {
    if (!item.imageUrl) return null;
    return (
      <View style={styles.listItem}>
        <FastImage
          source={{uri: item.localImagePath}}
          style={styles.itemImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.size}</Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={styles.video}>
        <Image
          source={{uri: thumbnailUri}}
          style={styles.backgroundImage}
          blurRadius={10}
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() =>
            navigation.navigate('ViewProfile', {username: username})
          }>
          <Image
            source={{uri: profilePictureURL}}
            style={styles.profilePicture}
          />
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity style={styles.closeButton} onPress={closeStream}>
          <Icon name="close" size={22} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.countdownContainer}>
        <CountdownTimer streamDate={streamDate} />
      </View>
      <View style={styles.maskedContainer}>
        <Text style={styles.username}>Expected items in the stream</Text>
        <MaskedView
          style={styles.gradientMask}
          maskElement={
            <LinearGradient
              style={{flex: 1}}
              colors={['white', 'white', 'white', 'transparent']}
              locations={[0.7, 0.85, 0.95, 1]}
            />
          }>
          <MemoizedFlatList
            products={scheduledStreamItem.products}
            renderItem={renderItem}
          />
        </MaskedView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '2%',
    zIndex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 25,
  },
  username: {
    color: 'white',
    fontSize: calculatedFontSize / 2.5,
    fontWeight: 'bold',
    marginLeft: 10,
    textShadowColor: '#000',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: 'red',
    borderRadius: 30,
    padding: '1.5%',
    alignItems: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  countdownBox: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 10,
    width: screenWidth * 0.2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  countdownValue: {
    fontSize: calculatedFontSize / 2.5,
    fontWeight: 'bold',
    color: 'grey',
  },
  countdownLabel: {
    fontSize: calculatedFontSize / 4.5,
    color: 'grey',
    marginTop: 5,
  },
  streamStartedText: {
    fontSize: calculatedFontSize / 2.5,
    fontWeight: 'bold',
    color: 'red',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  itemContent: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    fontSize: calculatedFontSize / 2.5,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: calculatedFontSize / 3,
    color: 'grey',
  },
  // Gradient styles
  maskedContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 70,
  },
  gradientMask: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 70,
    paddingHorizontal: 5,
  },
});

export default ScheduledStreamViewer;
