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
import {
  RTCView,
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import axios from 'axios';
import io from 'socket.io-client';
import {baseURL, apiEndpoints} from '../Resources/Constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';

const configurationPeerConnection = {
  iceServers: [
    {
      urls: 'stun:stun.stunprotocol.org',
    },
  ],
};

const offerSdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [],
};

const mediaConstraints = {
  video: true,
  audio: true,
};

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

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

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;

  const scrollViewRef = useRef();
  const [curComments, setCurComments] = useState([]);
  const [comment, setComment] = useState('');
  const [curBid, setCurBid] = useState(0);
  const [userBid, setUserBid] = useState(0);
  const [watchers, setWatchers] = useState(0);

  const navigation = useNavigation();

  const [timeLeft, setTimeLeft] = useState(0); // Initial time is 0
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startBid, setStartBid] = useState(0);

  const items = [
    'Item1',
    'Item2',
    'Item3',
    'Item4',
    'Item5',
    'Item6',
    'Item1',
    'Item2',
    'Item3',
    'Item4',
    'Item5',
    'Item6',
  ];
  const [selectedItem, setSelectedItem] = useState(items[0]);

  const handleItemPress = item => {
    setSelectedItem(item);
  };

  useFocusEffect(
    useCallback(() => {
      if (!stream) {
        init();
      }
    }, []),
  );

  useEffect(() => {
    socket.current = io(baseURL, {
      transports: ['websocket'],
    });
    socket.current.on('from-server', id => {
      setSocketId(id);
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

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const init = async () => {
    const localStream = await mediaDevices.getUserMedia(mediaConstraints);
    setStream(localStream);

    peer.current = await createPeer();
    localStream
      .getTracks()
      .forEach(track => peer.current.addTrack(track, localStream));
  };

  const createPeer = async () => {
    const newPeer = new RTCPeerConnection(
      configurationPeerConnection,
      offerSdpConstraints,
    );
    setLocalCandidates([]);
    setRemoteCandidates([]);
    setupIceCandidate(newPeer);

    newPeer.onnegotiationneeded = async () =>
      await handleNegotiationNeededEvent(newPeer);

    return newPeer;
  };

  const handleNegotiationNeededEvent = async newPeer => {
    const offer = await newPeer.createOffer({offerToReceiveVideo: 1});
    await newPeer.setLocalDescription(offer);

    const payload = {
      sdp: newPeer.localDescription,
      socket_id: socketId,
      username: username,
      profilePicture: profilePicture,
      title: title || 'Untitled',
    };

    const {data} = await axios.post(
      baseURL + apiEndpoints.addBroadcast,
      payload,
    );

    const desc = new RTCSessionDescription(data.data.sdp);
    setBroadcastId(data.data.id);
    await newPeer.setRemoteDescription(desc).catch(e => console.log(e));

    socket.current.emit('broadcast-started', {
      broadcastId: data.data.id,
      socketId,
    });

    localCandidates.forEach(candidate => {
      socket.current.emit('add-candidate-broadcast', {
        id: data.data.id,
        candidate,
      });
    });

    remoteCandidates.forEach(candidate => {
      newPeer.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };

  const setupIceCandidate = newPeer => {
    newPeer.onicecandidate = e => {
      if (!e || !e.candidate) return;

      const candidate = {
        candidate: String(e.candidate.candidate),
        sdpMid: String(e.candidate.sdpMid),
        sdpMLineIndex: e.candidate.sdpMLineIndex,
      };
      setLocalCandidates(prevCandidates => [...prevCandidates, candidate]);
    };

    newPeer.oniceconnectionstatechange = e => {
      const connectionStatus = newPeer.connectionState;
      if (['disconnected', 'failed', 'closed'].includes(connectionStatus)) {
        console.log('Disconnected');
      } else {
        console.log('Connected');
      }
    };
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
      bidItem: selectedItem,
    };

    socket.current.emit('start-bid', startbidData);
    const timeInSeconds = parseInt(timer, 10);
    setTimeLeft(timeInSeconds);
    setIsTimerRunning(true);
    //setUserBid(0); // Clear the input after sending the comment
  };

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
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

  return (
    <View style={styles.container}>
      {stream && (
        <RTCView
          style={styles.video}
          objectFit="cover"
          streamURL={stream.toURL()}
        />
      )}
      <SafeAreaView style={{height: '100%', width: '100%'}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
            }}>
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
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{
                  flexGrow: 1,
                  flexDirection: 'column',
                }}>
                {curComments.map((commentData, index) => {
                  const profilePictureFilename = commentData.userProfilePicture
                    .split('/')
                    .pop();
                  const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;
                  return (
                    <Pressable
                      key={index}
                      style={{flex: 1, height: '20%', maxHeight: '20%'}}>
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
                            {commentData.userUsername}
                          </Text>
                          <Text>{commentData.comment}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
            <View
              style={{
                width: '100%',
                height: '5%',
                marginBottom: '30%',
                justifyContent: 'center',
              }}></View>
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
                      onChangeText={startBid => setStartBid(startBid)}
                      placeholder={'Start Bid'}
                      style={{
                        //fontSize: calculatedFontSize / 2.3,
                        borderWidth: 1,
                        height: '90%',
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: 8,
                        minHeight: 50,
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
                    style={{
                      backgroundColor: '#f542a4',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '35%',
                      height: 50,
                      marginTop: '2%',
                      marginRight: '2%',

                      borderRadius: 8,
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
                    borderWidth: 1,
                    marginTop: '2%',
                    maxHeight: '60%',
                    height: '60%',
                  }}>
                  {isTimerRunning && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        width: '100%',
                        marginTop: '2%',
                      }}>
                      <Text style={{color: 'red'}}>
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
                      }}>
                      <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={{
                          flexGrow: 1,
                          flexDirection: 'column',
                          padding: 10,
                        }}>
                        {items.map((item, index) => {
                          const isSelected = item === selectedItem;
                          return (
                            <Pressable
                              key={index}
                              onPress={() => handleItemPress(item)}
                              style={{
                                padding: 10,
                                borderWidth: 1,
                                marginVertical: 5,
                                backgroundColor: isSelected
                                  ? '#d3d3d3'
                                  : 'white', // Highlight selected item
                              }}>
                              <Text>{item}</Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </BottomSheetView>
            </BottomSheet>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
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
