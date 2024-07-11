import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Button,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  Pressable,
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

    const bidData = {
      id: broadcastId,
      userBid: 0,
      userUsername: 'NA',
    };

    socket.current.emit('start-bid', bidData);
    setTimeLeft(10);
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

  return (
    <SafeAreaView style={{height: '100%', width: '100%'}}>
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
        <TouchableOpacity style={styles.closeButton} onPress={closeStream}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      {stream && (
        <RTCView
          style={styles.video}
          objectFit="cover"
          streamURL={stream.toURL()}
        />
      )}
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
        <BottomSheetView style={{flexDirection: 'column'}}>
          <View style={{height: '30%', marginTop: '3%'}}>
            <TouchableOpacity
              onPress={() => handleStartBid()}
              style={{
                backgroundColor: '#f542a4',
                justifyContent: 'center',
                alignItems: 'center',
                width: '20%',
                height: '30%',
                margin: '2%',
              }}>
              <Text>Start Bid</Text>
            </TouchableOpacity>
          </View>
          <View style={{borderWidth: 1, height: '74%', marginTop: '3%'}}>
            <Text style={styles.timerText}>{timeLeft} seconds left</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
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
