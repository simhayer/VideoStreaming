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
} from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import {
  baseURL,
  apiEndpoints,
  appPink,
  colors,
  errorRed,
} from '../../Resources/Constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
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
  interpolate,
} from 'react-native-reanimated';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const GetStreamSDK = ({route}) => {
  const {title, thumbnail} = route.params;

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
  const [comment, setComment] = useState('');
  const [curBid, setCurBid] = useState(0);
  const [noOfBids, setNoOfBids] = useState(0);
  const [curBidWinner, setCurBidWinner] = useState('');
  const [showWinner, setShowWinner] = useState(false);
  const [userBid, setUserBid] = useState(0);
  const [watchers, setWatchers] = useState(0);
  const [streamError, setStreamError] = useState(false);

  const [items, setItems] = useState([]);

  const navigation = useNavigation();

  const [meetingId, setMeetingId] = useState(null);

  const [myClient, setMyClient] = useState(null);
  const [myCall, setMyCall] = useState(null);

  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    socket.current = io(baseURL, {
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
    try {
      const payload = {
        username: userUsername,
      };

      const response = await axios.post(
        baseURL + apiEndpoints.createStreamUser,
        payload,
      );
      const {token, apiKey} = response.data;

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
      const call = client.call('livestream', socketId);
      await call.join({create: true});
      setMyCall(call);
    } catch (error) {
      console.error(
        'Error creating stream user or joining call:',
        error.response.data ?? error,
      );
      setStreamError(true);
    }
  };

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
    formData.append('meetingId', meetingId);

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
    if (isSocketReady) {
      initializeMeeting();
    }
  }, [isSocketReady]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startBid, setStartBid] = useState();

  const [selectedItem, setSelectedItem] = useState(items[0]);

  const handleItemPress = item => {
    setSelectedItem(item);
  };

  const bottomSheetRef = useRef(null);

  const opacityValue = useSharedValue(0);
  const animatedPosition = useSharedValue(screenHeight);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleSheetChanges = useCallback(index => {
    setIsBottomSheetOpen(index === 1);
  }, []);

  const handleSheetPositionChange = useCallback(
    position => {
      console.log('position:', position);
      opacityValue.value = withTiming(position === 0 ? 0 : 1, {
        duration: 300,
      });
      animatedPosition.value = position;
    },
    [animatedPosition, opacityValue],
  );

  const animatedVideoStyle = useAnimatedStyle(() => {
    const videoHeight = interpolate(
      animatedPosition.value,
      [screenHeight, screenHeight / 2],
      [screenHeight, screenHeight / 1.8],
    );
    return {
      height: videoHeight,
    };
  });

  const animatedOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [screenHeight, screenHeight / 2],
      [0, 1],
    );
    return {
      opacity: opacity,
    };
  });

  const closeStream = () => {
    navigation.goBack();
  };

  const handleStartBid = () => {
    console.log('In Start Bid');

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

  const fetchProducts = async () => {
    const payload = {
      email: userEmail,
    };
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.getUserProducts,
        payload,
      );
      if (response.status === 200) {
        setItems(response.data.products);
      } else {
        console.error('Failed to fetch products:', response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
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
                    width: '60%',
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
                        const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;
                        return (
                          <Pressable
                            style={{
                              flex: 1,
                              height: '20%',
                            }}>
                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: '2%',
                              }}>
                              <Image
                                source={{uri: profilePictureURL}}
                                style={{
                                  width: '15%',
                                  height: '80%',
                                  borderRadius: 15,
                                  marginRight: '4%',
                                  marginLeft: '5%',
                                  marginBottom: '2%',
                                }}
                              />
                              <View>
                                <Text
                                  style={{fontWeight: 'bold', color: 'white'}}>
                                  {item.userUsername}
                                </Text>
                                <Text style={{color: 'white'}}>
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
            animatedPosition={animatedPosition} // Link the animated position here
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
                  animatedOpacityStyle, // Apply animated opacity style
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
                      opacity: isTimerRunning ? 0.5 : 1,
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
                    placeholder={'0'}
                    editable={!isTimerRunning && isBottomSheetOpen}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setStartBid(Number(numericValue));
                    }}
                    style={{
                      fontSize: calculatedFontSize / 2.5,
                      borderWidth: 1,
                      flex: 1,
                      textAlign: 'center',
                      borderRadius: 8,
                      minHeight: 50,
                      opacity: isTimerRunning ? 0.5 : 1,
                    }}
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
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: calculatedFontSize / 2,
                        }}>
                        Highest Bid :{'     '}
                      </Text>
                      <Text
                        style={{
                          fontSize: calculatedFontSize / 1.4,
                        }}>
                        ${curBid}
                      </Text>
                    </View>
                    <Text
                      style={{
                        marginTop: '10%',
                        fontSize: calculatedFontSize / 2,
                      }}>
                      No of bids : {noOfBids}
                    </Text>
                    <Text style={{color: 'red', marginTop: '10%'}}>
                      {timeLeft} seconds left
                    </Text>
                  </View>
                )}
                {!isTimerRunning && (
                  <View style={{flex: 1, marginTop: 5}}>
                    <Text
                      style={{
                        alignSelf: 'center',
                        fontSize: calculatedFontSize / 2.9,
                        color: errorRed,
                      }}>
                      Select an item to start bid
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        flex: 1,
                        marginTop: 5,
                      }}>
                      <FlatList
                        style={{flex: 1}}
                        data={items}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => {
                          if (!item.imageUrl) return null;
                          const itemImageFilename = item.imageUrl
                            .split('\\')
                            .pop();
                          const itemImageUrl = `${baseURL}/products/${itemImageFilename}`;
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
                              <Image
                                source={{uri: itemImageUrl}}
                                resizeMode="contain"
                                style={{width: '20%', height: 50}}
                              />
                              <View style={{flex: 1}}>
                                <Text
                                  style={{
                                    fontWeight: 'bold',
                                    textAlign: 'left',
                                    flexWrap: 'wrap',
                                    fontSize: calculatedFontSize / 2.7,
                                  }}>
                                  {item.name}
                                </Text>
                                <Text
                                  style={{fontSize: calculatedFontSize / 2.9}}>
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
              </View>
              <View
                style={{
                  height: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  marginBottom: 30,
                }}>
                <TouchableOpacity
                  onPress={() => handleStartBid()}
                  disabled={isTimerRunning}
                  style={{
                    backgroundColor: isTimerRunning ? 'grey' : appPink,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '35%',
                    height: 50,
                    borderRadius: 8,
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
