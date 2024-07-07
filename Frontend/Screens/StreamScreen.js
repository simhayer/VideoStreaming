import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Button,
  Text,
  SafeAreaView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
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
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const screenHeight = Dimensions.get('window').height;

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;

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

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const menuHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight / 60, screenHeight / 2],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {stream && (
          <RTCView
            streamURL={stream.toURL()}
            style={styles.rtcView}
            objectFit="cover"
          />
        )}
      </View>
      <View style={styles.overlay}>
        {broadcastId && <Text>Streaming id: {broadcastId}</Text>}
        {title && <Text>Title: {title}</Text>}
        <Button title="Stop" onPress={() => peer.current.close()} />

        <Animated.View style={[styles.menuContainer, {height: menuHeight}]}>
          <TouchableOpacity style={styles.arrowContainer} onPress={toggleMenu}>
            {menuVisible ? (
              <Icon name="chevron-down" size={40} color="white" />
            ) : (
              <Icon name="chevron-up" size={40} color="white" />
            )}
          </TouchableOpacity>
          {menuVisible && (
            <View style={styles.menuContent}>
              <Text style={styles.menuItem}>Option 1</Text>
              <Text style={styles.menuItem}>Option 2</Text>
              <Text style={styles.menuItem}>End Stream</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  rtcView: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderColor: 'grey',
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 9},
    shadowOpacity: 0.5,
    shadowRadius: 12.35,
    elevation: 19,
  },
  arrowContainer: {
    position: 'absolute',
    top: -20,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  menuItem: {
    padding: 20,
    fontSize: 18,
    color: 'white',
  },
});

export default StreamScreen;
