import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { RTCPeerConnection, RTCSessionDescription, RTCView } from 'react-native-webrtc';
import io from 'socket.io-client';
import axios from 'axios';
import { apiEndpoints, baseURL } from '../Resources/Constants';

const configurationPeerConnection = {
  iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
};
const addTransceiverConstraints = { direction: "recvonly" };

const App = () => {
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [broadcastId, setBroadcastId] = useState('');

  useEffect(() => {
    const newSocket = io(baseURL);
    setSocket(newSocket);
    newSocket.on('candidate-from-server', handleRemoteCandidate);

    return () => {
      newSocket.off('candidate-from-server', handleRemoteCandidate);
      newSocket.close();
    };
  }, []);

  const handleRemoteCandidate = (candidate) => {
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const showList = async () => {
    try {
      const response = await axios.get(baseURL + apiEndpoints.listbroadcast);
      setBroadcasts(response.data);
    } catch (error) {
      console.error("Error fetching broadcasts: ", error);
    }
  };

  useEffect(() => {
    showList();
  }, []);

  const handleTrackEvent = (event) => {
    setStream(event.streams[0]);
    console.log("Stream received: ", event.streams[0]);
  };

  const watch = async (broadcastId) => {
    setBroadcastId(broadcastId);
    if (peer) {
      peer.close();
    }

    const newPeer = new RTCPeerConnection(configurationPeerConnection);
    newPeer.addTransceiver("video", addTransceiverConstraints);
    newPeer.addTransceiver("audio", addTransceiverConstraints);

    newPeer.ontrack = handleTrackEvent;

    newPeer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("add-candidate-consumer", {
          candidate: event.candidate,
          broadcast_id: broadcastId,
        });
      }
    };

    try {
      const offer = await newPeer.createOffer();
      await newPeer.setLocalDescription(offer);

      const { data } = await axios.post(baseURL + apiEndpoints.addConsumer, {
        sdp: newPeer.localDescription,
        broadcast_id: broadcastId,
      });

      const desc = new RTCSessionDescription(data.data.sdp);
      await newPeer.setRemoteDescription(desc);
      setPeer(newPeer);

    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viewer of Streaming</Text>
      {stream && (
        <RTCView
          style={styles.video}
          objectFit="cover"
          streamURL={stream.toURL()}
        />
      )}
      <ScrollView>
        {broadcasts.map((broadcast) => (
          <View key={broadcast} style={styles.buttonContainer}>
            <Button title={`Watch ${broadcast}`} onPress={() => watch(broadcast)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: 300,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default App;
