import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import {
  baseURL,
  apiEndpoints,
  appPink,
  colors,
  errorRed,
  baseURLNoApi,
} from '../../Resources/Constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import LiveStreamView from './LiveStreamView';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {fetchProducts} from '../../Redux/Features/ProductsSlice';
import FastImage from 'react-native-fast-image';
import inCallManager from 'react-native-incall-manager';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const GetStreamSDK = ({route}) => {
  const {title, thumbnail} = route.params;
  const dispatch = useDispatch();

  const [socketId, setSocketId] = useState(null);
  const [broadcastId, setBroadcastId] = useState(null);
  const socket = useRef(null);
  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;
  const userUsername = userData?.user?.username;

  const scrollViewRef = useRef();
  const [curComments, setCurComments] = useState([]);
  const [curBid, setCurBid] = useState('');
  const [noOfBids, setNoOfBids] = useState(0);
  const [curBidWinner, setCurBidWinner] = useState('');
  const [showWinner, setShowWinner] = useState(false);
  const [watchers, setWatchers] = useState(0);
  const [streamError, setStreamError] = useState(false);
  const {items} = useSelector(state => state.products);
  const navigation = useNavigation();

  const [myClient, setMyClient] = useState(null);
  const [myCall, setMyCall] = useState(null);

  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    socket.current = io(baseURLNoApi, {
      path: '/api/socket.io',
      transports: ['websocket'],
    });

    socket.current.on('from-server', id => {
      setSocketId(id);
      setBroadcastId(id);
      console.log('Connected with socket ID: ' + id);
      setIsSocketReady(true);
    });

    socket.current.on('candidate-from-server', data => {
      setRemoteCandidates(prevCandidates => [...prevCandidates, data]);
    });

    socket.current.on('newComment', data => {
      console.log('New comment received:', data);
      setCurComments(prevComments => [...prevComments, data]);
    });

    socket.current.on('updateWatcher', updatedWatchers => {
      console.log('Updated watchers:', updatedWatchers);
      //setWatchers(updatedWatchers);
    });

    socket.current.on('newBid', data => {
      console.log('New bid received:', data);
      setCurBid(Number(data.bidAmount));
      setNoOfBids(Number(data.bidNo));
    });

    socket.current.on('endBid', data => {
      console.log('Bid ended:', data);
      if (data.userUsername !== 'null') {
        setCurBidWinner(data.userUsername);
        setShowWinner(true); // Show the winner

        // Hide the winner after 3 seconds
        setTimeout(() => {
          setShowWinner(false);
        }, 3000);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const createStreamUser = async () => {
    console.log('Creating stream user...');
    try {
      const payload = {
        username: userUsername,
      };

      const response = await axios.post(
        baseURL + apiEndpoints.createStreamUser,
        payload,
      );
      const {token, apiKey} = response.data;

      console.log('Token:', token);
      console.log('API Key:', apiKey);

      const user = {
        id: userUsername,
        name: userUsername,
      };
      // Create StreamVideoClient
      const client = StreamVideoClient.getOrCreateInstance({
        apiKey: apiKey,
        user,
        token,
      });
      setMyClient(client);

      console.log('Socket ID:', socketId);
    } catch (error) {
      console.error(
        'Error creating stream user or joining call:',
        error.response.data ?? error,
      );
      setStreamError(true);
    }
  };

  useEffect(() => {
    if (!myClient || !socketId) return;

    console.log('Initializing call...');
    const call = myClient.call('livestream', socketId);

    call
      .join({
        create: true,
        data: {
          settings_override: {
            audio: {
              mic_default_on: true,
              access_request_enabled: true,
              default_device: 'speaker',
            },
          },
        },
      })
      .then(() => {
        console.log('Call joined successfully');
        setMyCall(call);
      })
      .catch(error => {
        console.error('Failed to join the call:', error);
      });

    return () => {
      console.log('Cleaning up call...');
      call
        .leave()
        .then(() => console.log('Call left successfully'))
        .catch(() => console.error('Failed to leave the call'));
      setMyCall(undefined);
    };
  }, [myClient, socketId]);

  const initializeMeeting = async () => {
    createStreamUser();
    if (streamError) {
      return;
    }

    const formData = new FormData();
    formData.append('sdp', null);
    console.log('socketId:', socketId);
    formData.append('socket_id', socketId);
    formData.append('username', username);
    formData.append('profilePicture', profilePicture);
    formData.append('title', title || 'Untitled');

    // Check if a thumbnail is selected
    if (thumbnail) {
      // Convert the file URI to a file object
      const imageFile = {
        uri: thumbnail,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      };
      formData.append('thumbnail', imageFile);
    }

    axios
      .post(baseURL + apiEndpoints.addBroadcast, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Broadcast added:', response.data);
      })
      .catch(error => {
        console.error('Error adding broadcast:', error);
        setStreamError(true);
      });
  };

  useEffect(() => {
    console.log('Socket ready:', isSocketReady);
    if (isSocketReady) {
      initializeMeeting();
    }
  }, [isSocketReady]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startBid, setStartBid] = useState(0);

  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemPress = item => {
    setSelectedItem(item);
  };

  const bottomSheetRef = useRef(null);
  const animatedPosition = useSharedValue(screenHeight);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleSheetChanges = useCallback(index => {
    setIsBottomSheetOpen(index === 1);
  }, []);

  const handleSheetPositionChange = useCallback(
    position => {
      console.log('position:', position);
      animatedPosition.value = position;
    },
    [animatedPosition],
  );

  const animatedVideoStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(animatedPosition.value + 10, {duration: 10}),
    };
  });

  const closeStream = async () => {
    inCallManager.stop();
    await myCall?.endCall();
    await socket.current.disconnect();
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      // Handle back button press on Android
      const onBackPress = async () => {
        console.log('Back pressed');
        await closeStream();
        //navigation.goBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup when the component is unfocused or unmounted
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, []),
  );

  const handleStartBid = () => {
    console.log('In Start Bid');

    if (!selectedItem) {
      return;
    }

    const startbidData = {
      id: broadcastId,
      userBid: 0,
      userUsername: 'NA',
      timer: timer,
      startBid: !startBid ? 0 : startBid,
      product: selectedItem,
    };

    socket.current.emit('start-bid', startbidData);
    const timeInSeconds = parseInt(timer, 10);
    setTimeLeft(timeInSeconds);
    setIsTimerRunning(true);

    if (startBid) {
      setCurBid(Number(startBid));
    } else {
      setCurBid(Number(0));
    }
    setNoOfBids(0);
    //setUserBid(0); // Clear the input after sending the comment
  };

  const handleEndBid = broadcastId => {
    socket.current.emit('end-bid', {id: broadcastId});
    setNoOfBids(0);
    setCurBid(0);
  };

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isTimerRunning) {
        handleEndBid(broadcastId);
      }
      setIsTimerRunning(false);
    }

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const snapPoints = useMemo(() => ['15%', '50%'], []);

  useEffect(() => {
    // Scroll to bottom whenever comments change
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [curComments]);

  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState('10s');

  const [timerOptions, setTimerOptions] = useState([
    {label: '10s', value: '10s'},
    {label: '15s', value: '15s'},
    {label: '20s', value: '20s'},
    {label: '30s', value: '30s'},
  ]);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts(userEmail));
      console.log('items:', items);
    }
  }, []);

  if (streamError) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}>
        <Text style={{fontSize: calculatedFontSize / 2.4}}>
          Something went wrong, please try again later
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: appPink,
            borderRadius: 40,
            paddingVertical: '4%',
            alignItems: 'center',
            width: '60%',
            marginTop: 30,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'left',
              fontSize: calculatedFontSize / 2.2,
              fontWeight: 'bold',
            }}>
            Home
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render nothing until myClient and myCall are ready
  if (!myClient || !myCall) {
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
        <Text style={{fontSize: calculatedFontSize / 2.4, alignSelf: 'center'}}>
          Livestream starting...
        </Text>
        <ActivityIndicator
          size="large"
          color="grey"
          style={{marginVertical: 20}}
        />
      </SafeAreaView>
    );
  }

  return (
    <StreamVideo client={myClient} language="en">
      <StreamCall call={myCall}>
        <View style={{flex: 1}}>
          <Animated.View style={[styles.video, animatedVideoStyle]}>
            <LiveStreamView />
          </Animated.View>
          <SafeAreaView style={{flex: 1}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                {showWinner && (
                  <View
                    style={{
                      position: 'absolute',
                      top: '15%',
                      alignItems: 'center',
                      width: '100%',
                    }}>
                    <Text
                      style={{
                        color: 'red',
                        fontSize: calculatedFontSize / 2.3,
                        textShadowColor: '#000', // Shadow color
                        textShadowOffset: {width: 1, height: 1}, // Shadow offset
                        textShadowRadius: 3, // Shadow blur
                        elevation: 5,
                      }}>
                      {curBidWinner} won the bid!
                    </Text>
                  </View>
                )}
                <View style={styles.header}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: calculatedFontSize / 2.5,
                      fontWeight: 'bold',
                      flex: 1,
                      textShadowColor: '#000', // Shadow color
                      textShadowOffset: {width: 1, height: 1}, // Shadow offset
                      textShadowRadius: 3, // Shadow blur
                      elevation: 5,
                    }}>
                    Now Streaming
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeStream}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>

                <View style={{flex: 1}} />
                <View
                  style={{
                    marginLeft: '3%',
                    flex: 1.2,
                  }}>
                  <MaskedView
                    style={{flex: 1}}
                    maskElement={
                      <LinearGradient
                        style={{flex: 1}}
                        colors={['transparent', 'white', 'white', 'white']}
                      />
                    }>
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      ref={scrollViewRef}
                      data={curComments}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item}) => {
                        const profilePictureFilename = item.userProfilePicture
                          .split('/')
                          .pop();

                        const profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;
                        return (
                          <Pressable
                            style={{
                              flex: 1,
                              height: '20%',
                              width: '70%',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: '2%',
                              }}>
                              <FastImage
                                source={{uri: profilePictureURL}}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 15,
                                  marginRight: '5%',
                                  marginLeft: '5%',
                                  marginTop: '3%',
                                  alignSelf: 'flex-start',
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                              <View>
                                <Text
                                  style={{
                                    color: 'white',
                                    fontSize: calculatedFontSize / 3.1,
                                    textShadowColor: '#000', // Shadow color
                                    textShadowOffset: {width: 1, height: 1}, // Shadow offset
                                    textShadowRadius: 3, // Shadow blur
                                    elevation: 5,
                                  }}>
                                  {item.userUsername}
                                </Text>
                                <Text
                                  style={{
                                    color: 'white',
                                    fontSize: calculatedFontSize / 3.1,
                                    fontWeight: '600',
                                    textShadowColor: '#000', // Shadow color
                                    textShadowOffset: {width: 1, height: 1}, // Shadow offset
                                    textShadowRadius: 3, // Shadow blur
                                    elevation: 5,
                                    flexWrap: 'wrap',
                                  }}>
                                  {item.comment}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        );
                      }}
                      contentContainerStyle={{
                        flexGrow: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                      }}
                    />
                  </MaskedView>
                </View>
                <View
                  style={{
                    width: '100%',
                    height: '5%',
                    marginBottom: '30%',
                    justifyContent: 'center',
                  }}></View>
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            animatedPosition={animatedPosition}
            onChange={handleSheetChanges}
            onPositionChange={handleSheetPositionChange}>
            <BottomSheetView
              style={{
                flexDirection: 'column',
                flex: 1,
              }}>
              <Text
                style={{
                  fontSize: calculatedFontSize / 2.5,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: appPink,
                }}>
                Bidding Controls
              </Text>
              <Animated.View
                style={[
                  {
                    height: 'auto',
                    marginTop: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: '7%',
                    zIndex: 100,
                  },
                ]}>
                <View
                  style={{
                    zIndex: 100,
                    flex: 1,
                  }}>
                  <DropDownPicker
                    open={open}
                    disabled={isTimerRunning || !isBottomSheetOpen}
                    value={timer}
                    items={timerOptions}
                    setOpen={setOpen}
                    setValue={setTimer}
                    setItems={setTimerOptions}
                    labelStyle={{
                      fontWeight: 'bold',
                      fontSize: calculatedFontSize / 2.9,
                    }}
                    listItemLabelStyle={{
                      marginTop: 0,
                      fontWeight: 'bold',
                      fontSize: calculatedFontSize / 2.9,
                    }}
                    style={{
                      opacity: isTimerRunning || !isBottomSheetOpen ? 0.5 : 1,
                    }}
                  />
                </View>
                <View style={{flex: 0.4}} />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1.1,
                  }}>
                  <Text style={{fontSize: calculatedFontSize / 2}}>$ </Text>
                  <TextInput
                    value={startBid}
                    editable={!isTimerRunning && isBottomSheetOpen}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setStartBid(Number(numericValue));
                    }}
                    placeholder={'0'}
                    style={{
                      fontSize: calculatedFontSize / 2.5,
                      borderWidth: 1,
                      flex: 1,
                      textAlign: 'center',
                      borderRadius: 8,
                      minHeight: 50,
                      opacity: isTimerRunning || !isBottomSheetOpen ? 0.5 : 1,
                    }}
                    autoComplete="off"
                    autoCapitalize="none"
                    placeholderTextColor={'gray'}
                    autoCorrect={false}
                    returnKeyType="done"
                    maxLength={5}
                    selectionColor={appPink}
                    inputMode="numeric"
                    clearButtonMode="while-editing"
                    keyboardAppearance="light"
                  />
                </View>
              </Animated.View>
              <View
                style={{
                  flex: 1,
                }}>
                {isTimerRunning && (
                  <View
                    style={{
                      margin: 7,
                      borderWidth: 1,
                      flex: 1,
                      borderColor: appPink,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 20,
                    }}>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2.2,
                        color: 'black',
                      }}>
                      {selectedItem?.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: calculatedFontSize / 2.2,
                          color: 'black',
                        }}>
                        Highest Bid :{' '}
                      </Text>
                      <Text
                        style={{
                          fontSize: calculatedFontSize / 1.8,
                          color: 'black',
                        }}>
                        ${curBid}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2.2,
                        color: 'black',
                      }}>
                      No of bids : {noOfBids}
                    </Text>
                    <Text style={{color: 'red'}}>{timeLeft} seconds left</Text>
                  </View>
                )}
                {!isTimerRunning && (
                  <View style={{flex: 1, marginTop: 10}}>
                    <Text
                      style={{
                        alignSelf: 'center',
                        fontSize: calculatedFontSize / 3,
                        color: errorRed,
                      }}>
                      Select an item to bid
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginTop: 5,
                        flex: 1,
                      }}>
                      <FlatList
                        style={{flex: 1, maxHeight: '100%'}}
                        data={items}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => {
                          if (!item.imageUrl) return null;
                          const itemImageUrl = `${baseURL}/${item.imageUrl}`;
                          const isSelected = item._id === selectedItem?._id;
                          return (
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: 'rgba(0,0,0,0.2)',
                                paddingRight: 25,
                                justifyContent: 'space-between',
                                backgroundColor: isSelected
                                  ? '#d3d3d3'
                                  : 'white',
                              }}
                              onPress={() => handleItemPress(item)}>
                              <FastImage
                                source={{uri: item.localImagePath}}
                                style={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: 8,
                                  margin: 5,
                                  marginLeft: 10,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                              <View style={{flex: 1, marginLeft: 10}}>
                                <Text
                                  style={{
                                    fontWeight: 'bold',
                                    textAlign: 'left',
                                    flexWrap: 'wrap',
                                    fontSize: calculatedFontSize / 2.8,
                                    color: 'black',
                                  }}>
                                  {item.name}
                                </Text>
                                <Text
                                  style={{fontSize: calculatedFontSize / 3}}>
                                  {item.size}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                        contentContainerStyle={{
                          paddingBottom: 10, // Add padding to avoid the last item being cut off
                        }}
                      />
                    </View>
                  </View>
                )}
                <View
                  style={{
                    height: 'auto',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    onPress={handleStartBid}
                    disabled={isTimerRunning || selectedItem === null}
                    style={{
                      backgroundColor:
                        isTimerRunning || selectedItem === null
                          ? 'grey'
                          : appPink,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '35%',
                      height: 50,
                      borderRadius: 8,
                      marginBottom: 20,
                      opacity: isTimerRunning ? 0.5 : 1,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: calculatedFontSize / 2.2,
                        fontWeight: 'bold',
                      }}>
                      Start Bid
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </StreamCall>
    </StreamVideo>
  );
};

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'red',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '2%',
    zIndex: 1,
  },
  profilePicture: {
    width: '8%',
    height: '100%',
    borderRadius: 25,
    marginRight: '1%',
  },
  closeButton: {
    width: '8%',
    height: '100%',
    backgroundColor: 'red',
    borderRadius: 25,
    padding: '1.5%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
  commentBox: {
    flexDirection: 'row',
    opacity: 0.8,
    height: '100%',
    minHeight: 50,
    width: '40%',
    marginRight: '10%',
    marginLeft: '4%',
  },
  input: {
    height: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: '2%',
    color: 'black',
    width: '100%',
  },
  flexed: {
    flex: 1,
  },
  text: {
    alignSelf: 'center',
    color: 'white',
    backgroundColor: 'blue',
    padding: 6,
    margin: 4,
  },
  bottomBar: {
    alignSelf: 'center',
    margin: 4,
  },
});

export default GetStreamSDK;
