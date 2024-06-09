import React, { useEffect, useState, useRef } from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import TextInputContainer from './components/TextInputContainer';
import SocketIOClient from 'socket.io-client';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import CallEnd from './asset/CallEnd';
import MicOn from './asset/MicOn';
import MicOff from './asset/MicOff';
import VideoOn from './asset/VideoOn';
import VideoOff from './asset/VideoOff';
import CameraSwitch from './asset/CameraSwitch';
import IconContainer from './components/IconContainer';
import InCallManager from 'react-native-incall-manager';

export default function App({}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [type, setType] = useState('JOIN');
  const [activeStreams, setActiveStreams] = useState([]);

  const [streamerId] = useState(
    Math.floor(100000 + Math.random() * 900000).toString(),
  );
  const broadcasterId = useRef(null);

  const socket = useRef(
    SocketIOClient('http://10.0.2.2:3000', {
      transports: ['websocket'],
      query: {
        streamerId,
      },
    })
  ).current;

  const [localMicOn, setLocalMicOn] = useState(true);
  const [localWebcamOn, setLocalWebcamOn] = useState(true);

  const peerConnections = useRef({});

  useEffect(() => {
    console.log('Setting up socket listeners');
    socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socket.on('updateStreams', data => {
      console.log('updateStreams', data);
      setActiveStreams(data);
    });

    socket.on('newViewer', async data => {
      console.log('newViewer', data);
      const { viewerId } = data;
      const peerConnection = createPeerConnection(viewerId);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('offer', {
        viewerId,
        rtcMessage: offer,
      });
    });

    socket.on('answer', async data => {
      console.log('answer', data);
      const { viewerId, rtcMessage } = data;
      const peerConnection = peerConnections.current[viewerId];

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(rtcMessage),
      );
    });

    socket.on('ICEcandidate', data => {
      console.log('ICEcandidate', data);
      const { viewerId, rtcMessage } = data;
      const peerConnection = peerConnections.current[viewerId];

      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(rtcMessage));
      }
    });

    socket.on('streamEnded', data => {
      console.log('streamEnded', data);
      const { streamerId } = data;
      setActiveStreams(prevStreams =>
        prevStreams.filter(stream => stream.streamerId !== streamerId),
      );
    });

    return () => {
      console.log('Removing socket listeners');
      socket.off('newViewer');
      socket.off('answer');
      socket.off('ICEcandidate');
      socket.off('updateStreams');
      socket.off('streamEnded');
    };
  }, []);

  useEffect(() => {
    console.log('Accessing media devices');
    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'videoinput') {
          videoSourceId = sourceInfo.deviceId;
        }
      }

      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500,
              minHeight: 300,
              minFrameRate: 30,
            },
            optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
          },
        })
        .then(stream => {
          console.log('Media stream acquired');
          setLocalStream(stream);
        })
        .catch(error => {
          console.log('Error accessing media devices.', error);
        });
    });

    InCallManager.start();
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    return () => {
      console.log('Stopping InCallManager');
      InCallManager.stop();
    };
  }, []);

  function createPeerConnection(viewerId) {
    console.log('Creating PeerConnection for viewerId:', viewerId);
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
      ],
    });

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socket.emit('ICEcandidate', {
          viewerId,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      }
    };

    if (localStream) {
      peerConnection.addStream(localStream);
    }

    peerConnections.current[viewerId] = peerConnection;

    return peerConnection;
  }

  function connectToStream() {
    console.log('Connecting to stream with broadcasterId:', broadcasterId.current);
    const viewerId = streamerId;
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
      ],
    });

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socket.emit('ICEcandidate', {
          viewerId: broadcasterId.current,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      }
    };

    peerConnection.onaddstream = event => {
      console.log('Received remote stream');
      setRemoteStreams(prev => [...prev, event.stream]);
    };

    peerConnections.current[broadcasterId.current] = peerConnection;

    socket.emit('joinStream', {
      streamerId: broadcasterId.current,
      viewerId,
    });

    socket.on('offer', async data => {
      const { rtcMessage } = data;
      console.log('Received offer');
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(rtcMessage),
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('answer', {
        streamerId: broadcasterId.current,
        viewerId,
        rtcMessage: answer,
      });
    });

    socket.on('ICEcandidate', data => {
      const { rtcMessage } = data;
      if (rtcMessage) {
        console.log('Adding ICE candidate');
        peerConnection.addIceCandidate(new RTCIceCandidate(rtcMessage));
      }
    });
  }

  async function startStream() {
    console.log('Starting stream');
    setType('STREAMING');
    socket.emit('startStream', {
      streamerId,
    });
  }

  function endStream() {
    console.log('Ending stream');
    setType('JOIN');
    setLocalStream(null);
    socket.emit('endStream', {
      streamerId,
    });
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
  }

  function switchCamera() {
    console.log('Switching camera');
    localStream.getVideoTracks().forEach(track => {
      track._switchCamera();
    });
  }

  function toggleCamera() {
    console.log(localWebcamOn ? 'Turning off camera' : 'Turning on camera');
    localWebcamOn ? setLocalWebcamOn(false) : setLocalWebcamOn(true);
    localStream.getVideoTracks().forEach(track => {
      localWebcamOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  function toggleMic() {
    console.log(localMicOn ? 'Turning off mic' : 'Turning on mic');
    localMicOn ? setLocalMicOn(false) : setLocalMicOn(true);
    localStream.getAudioTracks().forEach(track => {
      localMicOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {localStream && type === 'STREAMING' && (
            <RTCView
              streamURL={localStream.toURL()}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          )}

          {remoteStreams.length > 0 && (
            <FlatList
              data={remoteStreams}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <RTCView
                  streamURL={item.toURL()}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              )}
            />
          )}

          {type === 'JOIN' ? (
            <>
              <FlatList
                data={activeStreams}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      broadcasterId.current = item.streamerId;
                      connectToStream();
                      setType('CONNECTED');
                    }}>
                    <Text style={{ color: 'white' }}>
                      Join Stream {item.streamerId}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={startStream}>
                <Text style={{ color: 'white' }}>Start Stream</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={{
                position: 'absolute',
                bottom: 30,
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-around',
              }}>
              {/* <IconContainer
                backgroundColor="red"
                onPress={endStream}
                icon={CallEnd}
              />
              <IconContainer
                onPress={toggleMic}
                icon={localMicOn ? MicOn : MicOff}
              />
              <IconContainer
                onPress={toggleCamera}
                icon={localWebcamOn ? VideoOn : VideoOff}
              />
              <IconContainer onPress={switchCamera} icon={CameraSwitch} /> */}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
