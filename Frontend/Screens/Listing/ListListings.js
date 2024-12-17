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
  TextInput,
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
import Icon from 'react-native-vector-icons/Ionicons';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ListListings = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [isAxiosError, setIsAxiosError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [canFetchMore, setCanFetchMore] = useState(true);
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchChange = value => {
    setSearchInput(value);

    if (value.trim() === '' && hasSearched) {
      console.log('Search input is empty');
      setSearch('');
    }
  };

  const triggerSearch = useCallback(() => {
    if (searchInput.trim() !== '') {
      setSearch(searchInput);
      setHasSearched(true);
    }
  }, [searchInput]);

  useEffect(() => {
    console.log('Search:', search);
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
      const MIN_TRIGGER_INTERVAL = 100000;

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
      setListings([]);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getAllListingsByPage,
        {page: newPage, limit: 10, search: searchValue},
        {
          timeout: 7000,
          signal: controller.signal,
        },
      );

      setListings(prev =>
        newPage === 1
          ? response.data.listings
          : [...prev, ...response.data.listings],
      );
      setIsAxiosError(false);

      if (response.data.listings.length === 0) {
        setCanFetchMore(false); // Disable further fetching if no more data
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
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

  const handleViewListing = (item, profilePictureURL) => {
    navigation.navigate('ViewListingBuyer', {
      listing: item,
    });
  };

  const ListingItem = React.memo(({item, profilePictureURL}) => {
    if (item.product == null) return null;
    const [imageLoaded, setImageLoaded] = useState(false);
    const thumbnailUri = `${baseURL}/${item.product.imageUrl}`;

    return (
      <View
        style={{
          width: '48%',
          aspectRatio: 1,
          marginRight: '4%',
          marginBottom: '18%',
        }}>
        <TouchableOpacity
          key={item._id}
          title={`Watch ${item._id}`}
          style={styles.buttonContainer}
          onPress={() =>
            handleViewListing(item, profilePictureURL, navigation)
          }>
          <FastImage
            source={
              imageLoaded
                ? {uri: thumbnailUri}
                : require('../../Resources/StreamListThumbnailBlur.png')
            }
            style={{width: '100%', height: '100%', borderRadius: 7}}
            imageStyle={{borderRadius: 7}}
            onLoadEnd={() => setImageLoaded(true)}></FastImage>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: calculatedFontSize / 3.1,
            color: colors.black,
            marginVertical: 1,
          }}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.product.name}
        </Text>
        <Text
          style={{
            fontSize: calculatedFontSize / 2.2,
            color: colors.black,
            fontWeight: 'bold',
            marginVertical: 1,
          }}
          numberOfLines={2}
          ellipsizeMode="tail">
          ${item.price}
        </Text>
      </View>
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
    const SkeletonItem = () => {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: 10,
          }}>
          <View style={{width: '48%', aspectRatio: 1, borderRadius: 7}} />
          <View style={{width: '48%', aspectRatio: 1, borderRadius: 7}} />
        </View>
      );
    };

    return (
      <SkeletonPlaceholder>
        {SkeletonItem()}
        {SkeletonItem()}
        {SkeletonItem()}
        {SkeletonItem()}
      </SkeletonPlaceholder>
    );
  };

  const renderItem = useCallback(
    ({item}) => {
      const profilePictureFilename = item.user.profilePicture.split('/').pop();
      var profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;

      if (item.user.profilePicture.includes('googleusercontent')) {
        profilePictureURL = item.profilePicture;
      }

      return <ListingItem item={item} profilePictureURL={profilePictureURL} />;
    },
    [listings],
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 10,
          marginTop: 16,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          borderRadius: 12,
          paddingHorizontal: 10,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          marginBottom: 20,
        }}>
        <Icon name="search" size={24} color="grey" />
        <TextInput
          style={{
            flex: 1,
            fontSize: calculatedFontSize / 3,
            paddingVertical: 10,
            paddingHorizontal: 8,
            color: 'black',
          }}
          placeholder="Search products..."
          placeholderTextColor="grey"
          value={searchInput}
          onChangeText={handleSearchChange}
          onSubmitEditing={triggerSearch}
          returnKeyType="search"
          maxLength={30}
          selectionColor={appPink}
          keyboardAppearance="light"
        />
        <TouchableOpacity onPress={triggerSearch} activeOpacity={0.8}>
          <Icon
            name="arrow-up-circle"
            size={30}
            color={searchInput == '' ? 'grey' : 'black'}
          />
        </TouchableOpacity>
      </View>
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
        <View style={styles.container}>
          <FlatList
            data={listings}
            keyExtractor={item => item._id.toString()}
            windowSize={10}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              if (listings.length < 8) return;
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
                  <Text style={styles.emptyTitle}>No Listings Found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try searching with different keywords or check the upcoming
                    tab for scheduled streams.
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
            // getItemLayout={(data, index) => ({
            //   length: screenHeight * 0.35, // Item height
            //   offset: screenHeight * 0.35 * index,
            //   index,
            // })}
          />
        </View>
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
    paddingHorizontal: '3%',
    paddingBottom: 20
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    marginBottom: '2%',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ListListings;
