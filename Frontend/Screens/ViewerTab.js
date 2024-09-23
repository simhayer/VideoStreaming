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
import io from 'socket.io-client';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  debounce,
  token,
} from '../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewerTab = () => {
  const navigation = useNavigation();
  const [broadcasts, setBroadcasts] = useState([]);
  const [socket, setSocket] = useState(null);

  const [searchInput, setSearchInput] = useState(''); // Immediate input state
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isAxiosError, setIsAxiosError] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(value => {
      setSearch(value);
    }, 300),
    []
  );

  const handleSearchChange = value => {
    setSearchInput(value); 
    debouncedSearch(value); 
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showList();
    }, 1000);
  }, []);

  useEffect(() => {
    const newSocket = io(baseURL);
    setSocket(newSocket);

    newSocket.on('List-update', showList);

    return () => {
      newSocket.off('List-update', showList);
      newSocket.close();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      showList();
    }, []),
  );

  const showList = async () => {
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      console.log('Fetching broadcasts');
      const response = await axios.get(baseURL + apiEndpoints.listbroadcast, {
        timeout: 5000, // Set timeout for the request
        signal: controller.signal, // Attach the AbortController signal
      });
      setIsAxiosError(false);
      setBroadcasts(response.data);
    } catch (error) {
    } finally {
      // Clear the timeout once the request is completed or aborted
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const watchVideoSDK = async (
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
    meetingId,
  ) => {
    socket.emit('watcher', {id: broadcastId});

    navigation.navigate('GetStreamViewerSDK', {
      streamId: '',
      broadcastId,
      username,
      watchers,
      profilePictureURL,
      comments,
      meetingId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
          returnKeyType="send"
          enterKeyHint="send"
        />
        <TouchableOpacity>
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
        <ActivityIndicator
          size="large"
          color="grey"
          style={{marginVertical: 20}}
        />
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
          renderItem={({item}) => {
            const profilePictureFilename = item.profilePicture.split('/').pop();
            const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;
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
                    source={{uri: profilePictureURL}}
                    style={styles.profilePicture}
                  />
                  <Text
                    style={{
                      fontSize: calculatedFontSize / 2.7,
                      fontWeight: 'bold',
                      maxWidth: '48%',
                    }}>
                    {item.username}
                  </Text>
                </View>
                <TouchableOpacity
                  key={item.id}
                  title={`Watch ${item.id}`}
                  style={styles.buttonContainer}
                  onPress={() =>
                    watchVideoSDK(
                      item.id,
                      item.username,
                      item.watchers,
                      profilePictureURL,
                      item.comments,
                      item.meetingId,
                    )
                  }>
                  <ImageBackground
                    source={{uri: thumbnailUri}}
                    style={{width: '100%', height: '100%', borderRadius: 7}}
                    imageStyle={{borderRadius: 7}}>
                    <View
                      style={{
                        backgroundColor: 'red',
                        width: '40%',
                        height: '9%',
                        margin: '4%',
                        borderRadius: 3,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: 'white',
                          fontSize: calculatedFontSize / 2.5,
                        }}>
                        Live - {item.watchers}
                      </Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
                <Text>{item.title}</Text>
              </View>
            );
          }}
          numColumns={2}
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    width: '15%',
    height: '100%',
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
