import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  TextInput,
  RefreshControl,
  FlatList,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
  debounce,
  token,
} from '../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewerTab = () => {
  const navigation = useNavigation();
  const [broadcasts, setBroadcasts] = useState([]);

  const [searchInput, setSearchInput] = useState(''); // Immediate input state
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isAxiosError, setIsAxiosError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [canFetchMore, setCanFetchMore] = useState(true);

  const handleSearchChange = value => {
    setSearchInput(value);

    if (value.trim() === '') {
      console.log('Search input is empty');
      setSearch('');
      setPage(1);
      setCanFetchMore(true);
      showList(1, '', true);
    }
  };

  const triggerSearch = () => {
    if (searchInput.trim() !== '') {
      setSearch(searchInput);
      setPage(1);
      setCanFetchMore(true);
      showList(1, searchInput, true);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setCanFetchMore(true);
    showList(1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      showList();
    }, []),
  );

  const showList = async (
    newPage = 1,
    searchValue = '',
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
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.listbroadcast,
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

  const handleWatchVideoSDK = (item, profilePictureURL) => {
    navigation.navigate('GetStreamViewerSDK', {
      streamId: '',
      broadcastId: item.id,
      username: item.username,
      watchers: item.watchers,
      profilePictureURL: profilePictureURL,
      comments: item.comments,
      meetingId: item.meetingId,
    });
  };

  const BroadcastItem = React.memo(({item, profilePictureURL}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const profilePictureFilename = item.profilePicture.split('/').pop();
    const thumbnailUri = `${baseURL}/thumbnail/${item.thumbnail}`;

    return (
      <View
        style={{
          width: '48%',
          height: screenHeight * 0.35,
          marginBottom: '20%',
          marginRight: '4%',
        }}>
        <View style={styles.row}>
          <Image
            source={
              profilePictureFilename !== ''
                ? {uri: profilePictureURL}
                : require('../Resources/user.png')
            }
            style={styles.profilePicture}
          />
          <Text
            style={{
              fontSize: calculatedFontSize / 2.7,
              fontWeight: 'bold',
              maxWidth: '48%',
              color: colors.black,
            }}>
            {item.username}
          </Text>
        </View>
        <TouchableOpacity
          key={item.id}
          title={`Watch ${item.id}`}
          style={styles.buttonContainer}
          onPress={() =>
            handleWatchVideoSDK(item, profilePictureURL, navigation)
          }>
          <ImageBackground
            source={
              imageLoaded
                ? {uri: thumbnailUri}
                : require('../Resources/StreamListThumbnailBlur.png')
            }
            style={{width: '100%', height: '100%', borderRadius: 7}}
            imageStyle={{borderRadius: 7}}
            onLoadEnd={() => setImageLoaded(true)}>
            <View
              style={{
                backgroundColor: 'red',
                width: '40%',
                height: '9%',
                margin: '4%',
                borderRadius: 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: calculatedFontSize / 2.7,
                }}>
                Live - {item.watchers}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: calculatedFontSize / 2.6,
            color: colors.black,
            fontWeight: 'bold',
          }}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.title}
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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          marginHorizontal: '2.5%',
          borderRadius: 20,
          marginTop: 10,
          height: 'auto',
          paddingHorizontal: '3%',
          alignItems: 'center',
        }}>
        <Icon name="search" size={30} color="grey" />

        <TextInput
          style={{
            paddingVertical: 7,
            minHeight: 25,
            color: 'black',
            flex: 1,
            fontSize: calculatedFontSize / 3,
          }}
          placeholder="Search streams..."
          placeholderTextColor="grey"
          value={searchInput}
          onChangeText={handleSearchChange}
          onSubmitEditing={triggerSearch}
          returnKeyType="send"
          enterKeyHint="search"
        />
        <TouchableOpacity onPress={triggerSearch}>
          <Icon name="arrow-up-circle" size={35} color="grey" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: 7,
          borderBottomWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          width: '100%',
          marginBottom: 5,
        }}
      />
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
              borderRadius: 40,
              paddingVertical: '3%',
              paddingHorizontal: '10%',
              marginTop: 20,
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.7,
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
          renderItem={({item}) => {
            const profilePictureFilename = item.profilePicture.split('/').pop();
            const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;

            return (
              <BroadcastItem
                item={item}
                profilePictureURL={profilePictureURL}
              />
            );
          }}
          numColumns={2}
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={() => {
            if (canFetchMore && !loading) {
              setPage(prev => prev + 1);
              showList(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() =>
            !loading && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 50,
                }}>
                <Icon name="boat" size={40} color="black" />
                <Text style={{fontSize: calculatedFontSize / 2.5}}>
                  No broadcasts found.
                </Text>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4%',
    height: '9%',
    width: '100%',
  },
  profilePicture: {
    width: 20,
    height: 20,
    borderRadius: 25,
    marginRight: '5%',
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    marginBottom: '2%',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewerTab;
