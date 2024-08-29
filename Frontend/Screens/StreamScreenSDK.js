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
} from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import {baseURL, apiEndpoints, token, appPink} from '../Resources/Constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
  RTCView,
} from '@videosdk.live/react-native-sdk';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

// API call to create meeting
export const createMeeting = async ({token}) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: 'POST',
    headers: {
      authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const {roomId} = await res.json();
  return roomId;
};

function ParticipantView({participantId}) {
  const {webcamStream, webcamOn} = useParticipant(participantId);
  return webcamOn && webcamStream ? (
    <RTCView
      streamURL={new MediaStream([webcamStream.track]).toURL()}
      objectFit={'cover'}
      style={{
        height: screenHeight,
      }}
    />
  ) : (
    <View
      style={{
        backgroundColor: 'grey',
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{fontSize: 16}}>NO MEDIA</Text>
    </View>
  );
}

function Controls() {
  const {hlsState, startHls, stopHls} = useMeeting();
  const _handleHLS = () => {
    if (!hlsState || hlsState === 'HLS_STOPPED') {
      startHls({
        layout: {
          type: 'SPOTLIGHT',
          priority: 'PIN',
          gridSize: 4,
        },
        theme: 'DARK',
        orientation: 'landscape',
      });
    } else if (hlsState === 'HLS_STARTED' || hlsState === 'HLS_PLAYABLE') {
      stopHls();
    }
  };

  useEffect(() => {
    _handleHLS();
  }, []);

  return <></>;
}

function SpeakerView({socketId, username, profilePicture, title, meetingId}) {
  const [joined, setJoined] = useState(null);
  const {participants} = useMeeting();
  const mMeeting = useMeeting({
    onMeetingJoined: () => {
      setJoined('JOINED');
      if (mMeetingRef.current?.localParticipant?.mode === 'CONFERENCE') {
        mMeetingRef.current.localParticipant.pin();
      }
    },
  });

  const mMeetingRef = useRef(mMeeting);
  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const speakers = useMemo(() => {
    const speakerParticipants = [...participants.values()].filter(
      participant => {
        return participant.mode === Constants.modes.CONFERENCE;
      },
    );
    return speakerParticipants;
  }, [participants]);

  useEffect(() => {
    if (joined) {
      const payload = {
        sdp: null,
        socket_id: socketId,
        username: username,
        profilePicture: profilePicture,
        title: title || 'Untitled',
        meetingId: meetingId,
      };

      axios
        .post(baseURL + apiEndpoints.addBroadcast, payload)
        .then(response => {
          console.log('Broadcast added:', response.data);
        })
        .catch(error => {
          console.error('Error adding broadcast:', error);
        });
    }
  }, [joined]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {joined && joined === 'JOINED' ? (
        <>
          <Controls />
          {speakers.map(participant => (
            <ParticipantView
              participantId={participant.id}
              key={participant.id}
              style={{flex: 1}}
            />
          ))}
        </>
      ) : (
        <Text>Joining the meeting...</Text>
      )}
    </SafeAreaView>
  );
}

const StreamScreen = ({route}) => {
  const {title} = route.params;

  const [socketId, setSocketId] = useState(null);
  const [broadcastId, setBroadcastId] = useState(null);
  const [localCandidates, setLocalCandidates] = useState([]);
  const [remoteCandidates, setRemoteCandidates] = useState([]);
  const [stream, setStream] = useState(null);
  const peer = useRef(null);
  const socket = useRef(null);
  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;

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
  useEffect(() => {
    const initializeMeeting = async () => {
      if (!meetingId) {
        const newMeetingId = await createMeeting({token});
        setMeetingId(newMeetingId);
      }
    };

    initializeMeeting();
  }, []);

  const [timeLeft, setTimeLeft] = useState(0); // Initial time is 0
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startBid, setStartBid] = useState('0');

  const [selectedItem, setSelectedItem] = useState(items[0]);

  const handleItemPress = item => {
    setSelectedItem(item);
  };

  useEffect(() => {
    socket.current = io(baseURL, {
      transports: ['websocket'],
    });

    socket.current.on('from-server', id => {
      setSocketId(id);
      setBroadcastId(id);
      console.log('Connected with socket ID: ' + id);
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
      bidItem: selectedItem,
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

  const getItemIcon = type => {
    switch (type) {
      case 'Clothing':
        return 'shirt-outline'; // Clothing icon
      case 'Footwear':
        return 'footsteps-outline'; // Footwear icon (this is not an Ionicons icon, so you may need to choose another or customize)
      case 'Accessories':
        return 'watch-outline'; // Accessory icon
      case 'Electronics':
        return 'phone-portrait-outline'; // Electronics icon
      case 'VideoGames':
        return 'game-controller-outline'; // Video Games icon
      default:
        return 'cube-outline'; // Default icon
    }
  };

  return meetingId ? (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Simrat's Org",
        mode: Constants.modes.CONFERENCE, // 'CONFERENCE' || 'VIEWER'
      }}
      joinWithoutUserInteraction
      token={token}>
      <View style={styles.container}>
        {meetingId && (
          <SpeakerView
            socketId={socketId}
            username={username}
            profilePicture={profilePicture}
            title={title}
            meetingId={meetingId}
            style={{flex: 1, height: '100%', width: '100%'}}
          />
        )}
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
                    style={{color: 'red', fontSize: calculatedFontSize / 2.3}}>
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

              <View
                style={{
                  width: '50%',
                  height: '100%',
                  marginTop: '75%',
                  marginLeft: '3%',
                  flex: 1,
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
                              <Text style={{fontWeight: 'bold'}}>
                                {item.userUsername}
                              </Text>
                              <Text>{item.comment}</Text>
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
                  {/* <FlatList
                    ref={scrollViewRef}
                    data={items1}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => {
                      const isSelected = item === selectedItem;
                      return (
                        <Pressable
                          onPress={() => handleItemPress(item)}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            marginVertical: 5,
                            backgroundColor: isSelected ? '#d3d3d3' : 'white', // Highlight selected item
                          }}>
                          <Text>{item}</Text>
                        </Pressable>
                      );
                    }}
                    contentContainerStyle={{
                      flexGrow: 1,
                      flexDirection: 'column',
                      padding: 10,
                    }}
                  /> */}
                  <FlatList
                    style={{flex: 1}}
                    data={items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => {
                      const isSelected = item.name === selectedItem?.name;
                      return (
                        <Pressable
                          onPress={() => handleItemPress(item)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 20,
                            marginTop: 10,
                            paddingVertical: '3%',
                            paddingHorizontal: '5%',
                            backgroundColor: isSelected ? '#d3d3d3' : 'white', // Highlight selected item
                            justifyContent: 'space-between',
                          }}>
                          <Icon
                            name={getItemIcon(item.type)}
                            size={40}
                            color="black"
                          />
                          <Text
                            style={{
                              fontWeight: 'bold',
                              textAlign: 'left',
                              width: '60%',
                              maxWidth: '60%',
                            }}>
                            {item.name}
                          </Text>
                          <Text style={{marginRight: '8%'}}>{item.size}</Text>
                        </Pressable>
                      );
                    }}
                    contentContainerStyle={{
                      flexGrow: 1,
                      flexDirection: 'column',
                      padding: 10,
                    }}
                  />
                </View>
              )}
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </MeetingProvider>
  ) : (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Loading...</Text>
    </SafeAreaView>
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
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
});

export default StreamScreen;
