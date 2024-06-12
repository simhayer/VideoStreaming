import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import io from 'socket.io-client';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { apiEndpoints, baseURL } from '../Resources/Constants';
import StreamStore from './StreamStore';  // Import the StreamStore

const { height: screenHeight } = Dimensions.get('window');

const configurationPeerConnection = {
  iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
};
const addTransceiverConstraints = { direction: "recvonly" };

const HomeScreen = () => {
  const navigation = useNavigation();
  const [peer, setPeer] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(baseURL);
    setSocket(newSocket);
    newSocket.on('candidate-from-server', handleRemoteCandidate);

    newSocket.on('List-update', showList);

    return () => {
      newSocket.off('candidate-from-server', handleRemoteCandidate);
      newSocket.off('List-update', showList);
      newSocket.close();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      showList();
    }, [])
  );

  const handleRemoteCandidate = (candidate) => {
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const showList = async () => {
    console.log("in List update");
    try {
      const response = await axios.get(baseURL + apiEndpoints.listbroadcast);
      setBroadcasts(response.data);
    } catch (error) {
      console.error("Error fetching broadcasts: ", error);
    }
  };

  const handleTrackEvent = (event) => {
    const receivedStream = event.streams[0];
    console.log("Stream received: ", receivedStream);

    // Generate a unique ID for the stream
    const streamId = Date.now().toString();
    // Store the stream in the StreamStore
    StreamStore.setStream(streamId, receivedStream);

    // Navigate to the VideoScreen with the streamId as a parameter
    navigation.navigate('Video', { streamId });
  };

  const watch = async (broadcastId) => {
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
      <ScrollView contentContainerStyle={styles.scrollView}>
        {broadcasts.map((broadcast) => (
          <TouchableOpacity key={broadcast} title={`Watch ${broadcast}`} style={styles.buttonContainer} onPress={() => watch(broadcast)}>
            <Text>{`Watch ${broadcast}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollView: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    width: '48%',
    height: screenHeight * 0.3,
    marginBottom: '2%',
    borderColor: 'black',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
