import React, {useState, useCallback, useRef, useEffect} from 'react';
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

const ListScheduledStreams = ({search, hasSearched}) => {
  const navigation = useNavigation();
  const [broadcasts, setBroadcasts] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [isAxiosError, setIsAxiosError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [canFetchMore, setCanFetchMore] = useState(true);

  useEffect(() => {
    if (search.trim() === '' && hasSearched) {
      console.log('Search input is empty');
      setPage(1);
      setCanFetchMore(true);
      showList(1, '', true);
    }

    if (search.trim() !== '') {
      setPage(1);
      setCanFetchMore(true);
      showList(1, search, true);
    }
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setCanFetchMore(true);
    showList(1, search, true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const lastTriggeredTimeRef = useRef(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const currentTime = Date.now();
      const MIN_TRIGGER_INTERVAL = 50000;

      if (isFirstLoad) {
        showList();
        setIsFirstLoad(false);
        lastTriggeredTimeRef.current = currentTime;
      } else {
        const timeSinceLastTrigger = currentTime - lastTriggeredTimeRef.current;

        if (timeSinceLastTrigger >= MIN_TRIGGER_INTERVAL) {
          showList();
          lastTriggeredTimeRef.current = currentTime;
        }
      }
    }, [isFirstLoad]),
  );

  const showList = async (
    newPage = 1,
    searchValue = search,
    overrideCanFecth = false,
  ) => {
    if (!overrideCanFecth && !canFetchMore) return;

    const MIN_LOADING_TIME = 1000; // Minimum loading time (1 second)
    const startLoadingTime = Date.now(); // Record the start time of loading

    if (newPage === 1) {
      setBroadcasts([]);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.listScheduledStream,
        {page: newPage, limit: 10, search: searchValue},
        {
          timeout: 7000,
          signal: controller.signal,
        },
      );

      setBroadcasts(prev =>
        newPage === 1 ? response.data : [...prev, ...response.data],
      );
      setIsAxiosError(false);

      if (response.data.length === 0) {
        setCanFetchMore(false); // Disable further fetching if no more data
      }
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
      setLoadingMore(false);
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

  const renderFooter = () => {
    if (!loadingMore) return null; // Only show the footer when loading more data
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={appPink} />
      </View>
    );
  };

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={() => {
            if (broadcasts.length < 8) return;
            if (canFetchMore && !loading) {
              setPage(prev => prev + 1);
              showList(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
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
                <TouchableOpacity
                  onPress={onRefresh}
                  style={styles.emptyButton}
                  activeOpacity={0.8}>
                  <Text style={styles.emptyButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )
          }
          ListFooterComponent={renderFooter}
          getItemLayout={(data, index) => ({
            length: screenHeight * 0.35, // Item height
            offset: screenHeight * 0.35 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

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

export default ListScheduledStreams;
