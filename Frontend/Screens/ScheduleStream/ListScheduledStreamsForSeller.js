import React, {useState, useCallback, useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import FastImage from 'react-native-fast-image';
import ListScheduledStreamItem from './ListScheduledStreamItem';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ListScheduledStreamsForSeller = memo(({username}) => {
  const navigation = useNavigation();
  const [broadcasts, setBroadcasts] = useState([]);
  const [isAxiosError, setIsAxiosError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    showList();
  }, []);

  const showList = async () => {
    const MIN_LOADING_TIME = 1000; // Minimum loading time (1 second)
    const startLoadingTime = Date.now(); // Record the start time of loading

    setBroadcasts([]);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.fetchScheduledStreamsForProfile,
        {username},
        {
          timeout: 7000,
          signal: controller.signal,
        },
      );

      setBroadcasts(response.data);
      setIsAxiosError(false);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      const loadingTime = Date.now() - startLoadingTime; // Calculate how long the request took
      const remainingTime = MIN_LOADING_TIME - loadingTime;

      setTimeout(
        () => {
          setLoading(false); // Ensure loading state is set to false after the minimum time
        },
        remainingTime > 0 ? remainingTime : 0,
      );
      clearTimeout(timeoutId);
    }
  };

  const BroadcastItem = React.memo(({item, profilePictureURL}) => {
    return (
      <ListScheduledStreamItem
        item={item}
        profilePictureURL={profilePictureURL}
      />
    );
  });

  const renderSkeleton = () => {
    return (
      <SkeletonPlaceholder>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: 10,
          }}>
          <View
            style={{width: '48%', height: screenHeight * 0.35, borderRadius: 7}}
          />
          <View
            style={{width: '48%', height: screenHeight * 0.35, borderRadius: 7}}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: 10,
          }}>
          <View
            style={{width: '48%', height: screenHeight * 0.35, borderRadius: 7}}
          />
          <View
            style={{width: '48%', height: screenHeight * 0.35, borderRadius: 7}}
          />
        </View>
      </SkeletonPlaceholder>
    );
  };

  const renderItem = useCallback(
    ({item}) => {
      const profilePictureFilename = item.profilePicture.split('/').pop();
      var profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;

      if (item.profilePicture.includes('googleusercontent')) {
        profilePictureURL = item.profilePicture;
      }

      return (
        <BroadcastItem item={item} profilePictureURL={profilePictureURL} />
      );
    },
    [broadcasts],
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {loading ? (
        renderSkeleton()
      ) : isAxiosError ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50,
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.7,
              width: '80%',
              textAlign: 'center',
            }}>
            Something went wrong. Press the button to try again.
          </Text>
          <TouchableOpacity
            onPress={showList}
            style={{
              backgroundColor: appPink,
              borderRadius: 30,
              paddingVertical: 12,
              paddingHorizontal: 24,
            }}
            activeOpacity={0.8}>
            <Text
              style={{
                color: 'white',
                fontSize: calculatedFontSize / 2.7,
                fontWeight: 'bold',
              }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={broadcasts}
          keyExtractor={item => item.id.toString()}
          windowSize={10}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.scrollView}
          ListEmptyComponent={() =>
            !loading && (
              <View style={styles.emptyContainer}>
                <FastImage
                  source={require('../../Resources/emptyListIllustration.png')} // Replace with your illustration
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTitle}>No Streams Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching with different keywords or check the Live tab
                  for currently active streams.
                </Text>
              </View>
            )
          }
          getItemLayout={(data, index) => ({
            length: screenHeight * 0.35, // Item height
            offset: screenHeight * 0.35 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: calculatedFontSize / 2.3,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: calculatedFontSize / 2.7,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: appPink,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: calculatedFontSize / 2.7,
    fontWeight: 'bold',
  },
});

export default React.memo(ListScheduledStreamsForSeller);
