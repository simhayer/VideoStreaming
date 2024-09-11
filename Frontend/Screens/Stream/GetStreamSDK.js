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
  Button,
} from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import {
  baseURL,
  apiEndpoints,
  token,
  appPink,
  GetStreamApiKey,
} from '../../Resources/Constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import {
  useCall,
  useCallStateHooks,
  VideoRenderer,
} from '@stream-io/video-react-native-sdk';
import InCallManager from 'react-native-incall-manager';

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
      console.log('Stream user created:', response.data);
      const token = response.data;

      const user = {
        id: userUsername, // Ensure userId is defined somewhere
        name: userUsername,
        image: `https://getstream.io/random_png/?id=${userUsername}&name=Santhosh`,
      };
      // Create StreamVideoClient
      //const client = new StreamVideoClient({apiKey, user, token: token});
      const client = StreamVideoClient.getOrCreateInstance({
        apiKey: GetStreamApiKey,
        user,
        token,
      });
      setMyClient(client); // Set client in state

      // Create and join the call
      console.log('Socket ID:', socketId);
      const call = client.call('livestream', socketId); // Ensure callId is defined
      await call.join({create: true}); // Wait for the join to complete
      setMyCall(call); // Set call in state
    } catch (error) {
      console.error('Error creating stream user or joining call:', error);
    }
  };

  const initializeMeeting = async () => {
    createStreamUser();

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
      });
    //}
  };

  useEffect(() => {
    if (isSocketReady) {
      initializeMeeting(); // Only start the meeting after the socket is ready
    }
  }, [isSocketReady]);

  const [timeLeft, setTimeLeft] = useState(0); // Initial time is 0
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startBid, setStartBid] = useState('0');

  const [selectedItem, setSelectedItem] = useState(items[0]);

  const handleItemPress = item => {
    setSelectedItem(item);
  };

  const bottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

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
      startBid: startBid,
      product: selectedItem,
    };

    socket.current.emit('start-bid', startbidData);
    const timeInSeconds = parseInt(timer, 10);
    setTimeLeft(timeInSeconds);
    setIsTimerRunning(true);
    setCurBid(Number(startBid));
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

  const snapPoints = useMemo(() => ['8%', '60%'], []);

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

  // Render nothing until myClient and myCall are ready
  if (!myClient || !myCall) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    ); // You can show a loading indicator here
  }

  return (
    <StreamVideo client={myClient} language="en">
      <StreamCall call={myCall}>
        <View style={styles.container}>
          {/* video here */}
          <View style={styles.video}>
            <LivestreamView />
          </View>
          <SafeAreaView style={{height: '100%', width: '100%'}}>
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
                  <Text
                    style={{
                      color: 'white',
                      fontSize: calculatedFontSize / 2.5,
                      marginRight: '2%',
                    }}>
                    Watchers: {watchers}
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
            onChange={handleSheetChanges}>
            <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
              <View
                style={{
                  height: '11%',
                  marginTop: '3%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: '10%',
                  zIndex: 100,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '30%',
                    zIndex: 100,
                  }}>
                  <DropDownPicker
                    open={open}
                    disabled={isTimerRunning}
                    value={timer}
                    items={timerOptions}
                    setOpen={setOpen}
                    setValue={setTimer}
                    setItems={setTimerOptions}
                    containerStyle={{
                      height: '32%',
                      justifyContent: 'center',
                      marginTop: '18%',
                    }}
                    labelStyle={{
                      fontWeight: 'bold',
                    }}
                    dropDownContainerStyle={{
                      //backgroundColor: 'red',
                      borderColor: 'black',
                    }}
                    listItemLabelStyle={{
                      fontWeight: 'bold',
                    }}
                    style={{
                      opacity: isTimerRunning ? 0.5 : 1,
                    }}
                  />
                </View>
                <View
                  style={{
                    width: '32%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: calculatedFontSize / 2}}>$ </Text>
                  <TextInput
                    value={startBid}
                    placeholder={'Start Bid'}
                    editable={!isTimerRunning}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setStartBid(Number(numericValue));
                    }}
                    style={{
                      //fontSize: calculatedFontSize / 2.3,
                      borderWidth: 1,
                      height: '90%',
                      width: '100%',
                      textAlign: 'center',
                      borderRadius: 8,
                      minHeight: 50,
                      opacity: isTimerRunning ? 0.5 : 1,
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  height: '20%',
                  justifyContent: 'center',
                  alignItems: 'center',
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
                    marginTop: '2%',
                    marginRight: '2%',
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
              <View
                style={{
                  flex: 1,
                  maxHeight: '60%',
                  height: '60%',
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
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      maxHeight: '100%',
                      flex: 1,
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
                              marginTop: 10,
                              paddingRight: '3%',
                              justifyContent: 'space-between',
                              backgroundColor: isSelected ? '#d3d3d3' : 'white',
                            }}
                            onPress={() => handleItemPress(item)}>
                            <Image
                              source={{uri: itemImageUrl}}
                              resizeMode="contain"
                              style={{width: '20%', height: 100}}
                            />
                            <View style={{width: '70%'}}>
                              <Text
                                style={{
                                  fontWeight: 'bold',
                                  textAlign: 'left',
                                  flexWrap: 'wrap',
                                }}>
                                {item.name}
                              </Text>
                              <Text style={{}}>{item.size}</Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => handleDeleteItem(item)}>
                              <Icon
                                name="close-circle-outline"
                                size={25}
                                color="red"
                              />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        );
                      }}
                      contentContainerStyle={{
                        paddingBottom: 10, // Add padding to avoid the last item being cut off
                      }}
                    />
                  </View>
                )}
              </View>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </StreamCall>
    </StreamVideo>
  );
};

const LivestreamView = () => {
  const {useParticipantCount, useLocalParticipant, useIsCallLive} =
    useCallStateHooks();

  const call = useCall();
  const totalParticipants = useParticipantCount();
  const localParticipant = useLocalParticipant();
  const isCallLive = useIsCallLive();

  useEffect(() => {
    InCallManager.start({media: 'video'});
    call?.goLive();

    return () => InCallManager.stop();
  }, []);

  return (
    <View style={styles.flexed}>
      <View
        style={{
          width: '100%',
          zIndex: 10,
        }}>
        <Text style={styles.text}>Live: {totalParticipants}</Text>
        {/* <View style={styles.bottomBar}>
          {isCallLive ? (
            <Button onPress={() => call?.stopLive()} title="Stop Live" />
          ) : (
            <Button
              onPress={() => {
                call?.goLive();
              }}
              title="Go Live"
            />
          )}
        </View> */}
      </View>

      <View style={styles.video}>
        {localParticipant && (
          <VideoRenderer
            participant={localParticipant}
            trackType="videoTrack"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
