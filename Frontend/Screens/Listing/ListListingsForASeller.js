import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../Resources/Constants';
import axios from 'axios';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import FastImage from 'react-native-fast-image';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ListListingsForASeller = ({username}) => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);

  const [isAxiosError, setIsAxiosError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    showList();
  }, []);

  const showList = async () => {
    const MIN_LOADING_TIME = 1000; // Minimum loading time (1 second)
    const startLoadingTime = Date.now(); // Record the start time of loading

    setListings([]);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getListingsForProfile,
        {username: username},
        {
          timeout: 7000,
          signal: controller.signal,
        },
      );

      setListings(response.data.listings);
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
    }
  };

  const handleViewListing = (item, profilePictureURL) => {
    navigation.navigate('ViewListingBuyer', {
      listing: item,
    });
  };

  const ListingItem = React.memo(({item, profilePictureURL}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const profilePictureFilename = item.user.profilePicture.split('/').pop();
    const thumbnailUri = `${baseURL}/${item.product.imageUrl}`;

    return (
      <View
        style={{
          width: '48%',
          aspectRatio: 1,
          marginBottom: '18%',
          marginRight: '4%',
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
            fontSize: calculatedFontSize / 2.8,
            color: colors.black,
            fontWeight: 'bold',
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
    <SafeAreaView
      style={{flex: 1, backgroundColor: colors.background, marginVertical: 10}}>
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
                </View>
              )
            }
            getItemLayout={(data, index) => ({
              length: screenHeight * 0.35, // Item height
              offset: screenHeight * 0.35 * index,
              index,
            })}
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

export default React.memo(ListListingsForASeller);
