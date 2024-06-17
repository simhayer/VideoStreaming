import React, {useState, useEffect, useRef} from 'react';
import {View, Button, Text} from 'react-native';
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
import {useNavigation} from '@react-navigation/native';
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

const App = () => {
  const [socketId, setSocketId] = useState(null);
  const [broadcastId, setBroadcastId] = useState(null);
  const [localCandidates, setLocalCandidates] = useState([]);
  const [remoteCandidates, setRemoteCandidates] = useState([]);
  const [stream, setStream] = useState(null);
  const peer = useRef(null);
  const socket = useRef(null);
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;

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
    };

    const {data} = await axios.post(
      baseURL + apiEndpoints.addBroadcast,
      payload,
    );

    //console.log(data.message)
    console.log('after axios');
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

  return (
    <View>
      <Button title="Start Stream" onPress={init} />
      {broadcastId && <Text>Streaming id: {broadcastId}</Text>}
      {stream && (
        <RTCView
          streamURL={stream.toURL()}
          style={{width: '100%', height: 200}}
        />
      )}
    </View>
  );
};

export default App;
