import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from 'react-native';
import {RTCPeerConnection, RTCSessionDescription} from 'react-native-webrtc';
import io from 'socket.io-client';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {apiEndpoints, baseURL} from '../Resources/Constants';
import StreamStore from './StreamStore'; // Import the StreamStore
import Icon from 'react-native-vector-icons/Ionicons';

const {height: screenHeight} = Dimensions.get('window');

const configurationPeerConnection = {
  iceServers: [{urls: 'stun:stun.stunprotocol.org'}],
};
const addTransceiverConstraints = {direction: 'recvonly'};

const ViewerTab = () => {
  const navigation = useNavigation();
  const [peer, setPeer] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [socket, setSocket] = useState(null);
  const calculatedFontSize = screenHeight * 0.05;

  const [search, setSearch] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
      // You can perform your refresh logic here
      showList();
    }, 1000);
  }, []);

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
    }, []),
  );

  const handleRemoteCandidate = candidate => {
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const showList = async () => {
    console.log('in List update');
    try {
      const response = await axios.get(baseURL + apiEndpoints.listbroadcast);
      //console.log('Broadcasts: ', response.data);
      setBroadcasts(response.data);
    } catch (error) {
      console.error('Error fetching broadcasts: ', error);
    }
  };

  const handleTrackEvent = (
    event,
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
  ) => {
    const receivedStream = event.streams[0];
    console.log('Stream received: ', receivedStream);

    // Generate a unique ID for the stream
    const streamId = Date.now().toString();
    // Store the stream in the StreamStore
    StreamStore.setStream(streamId, receivedStream);

    // Navigate to the VideoScreen with the streamId, username, and watchers
    navigateToVideoScreen(
      streamId,
      broadcastId,
      username,
      watchers,
      profilePictureURL,
      comments,
    );
  };

  const navigateToVideoScreen = (
    streamId,
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
  ) => {
    navigation.navigate('Video', {
      streamId,
      broadcastId,
      username,
      watchers,
      profilePictureURL,
      comments,
    });
  };

  const watch = async (
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
  ) => {
    if (peer) {
      peer.close();
    }

    const newPeer = new RTCPeerConnection(configurationPeerConnection);
    newPeer.addTransceiver('video', addTransceiverConstraints);
    newPeer.addTransceiver('audio', addTransceiverConstraints);

    newPeer.ontrack = event =>
      handleTrackEvent(
        event,
        broadcastId,
        username,
        watchers,
        profilePictureURL,
        comments,
      );

    socket.emit('watcher', {id: broadcastId});

    newPeer.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('add-candidate-consumer', {
          candidate: event.candidate,
          broadcast_id: broadcastId,
        });
      }
    };

    try {
      const offer = await newPeer.createOffer();
      await newPeer.setLocalDescription(offer);

      const {data} = await axios.post(baseURL + apiEndpoints.addConsumer, {
        sdp: newPeer.localDescription,
        broadcast_id: broadcastId,
      });

      const desc = new RTCSessionDescription(data.data.sdp);
      await newPeer.setRemoteDescription(desc);
      setPeer(newPeer);
    } catch (error) {
      console.error('Error during negotiation:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          width: '95%',
          marginLeft: '2.5%',
          borderRadius: 20,
          height: '6%',
          justifyContent: 'center',
          marginTop: '3%',
          minHeight: 50,
        }}>
        <View style={styles.commentBox}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '1%',
              marginLeft: '3%',
            }}>
            <Icon name="search" size={40} color="grey" />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Search streams..."
            placeholderTextColor="grey"
            value={search}
            onChangeText={setSearch}
            returnKeyType="send"
            enterKeyHint="send"
          />
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '6%',
            }}>
            <Icon name="arrow-up-circle" size={40} color="grey" />
            <Text></Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          height: '3%',
          borderTopWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          marginTop: 20,
          width: '100%',
        }}></View>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {broadcasts.map(broadcast => {
          const profilePictureFilename = broadcast.profilePicture
            .split('/')
            .pop();
          const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;
          return (
            <View
              key={broadcast.id}
              style={{
                width: '48%',
                height: screenHeight * 0.35,
                marginBottom: '20%',
              }}>
              <View style={styles.row}>
                <Image
                  source={{uri: profilePictureURL}}
                  style={styles.profilePicture}
                />
                <Text style={styles.username}>{broadcast.username}</Text>
              </View>
              <TouchableOpacity
                key={broadcast.id}
                title={`Watch ${broadcast.id}`}
                style={styles.buttonContainer}
                onPress={() =>
                  watch(
                    broadcast.id,
                    broadcast.username,
                    broadcast.watchers,
                    profilePictureURL,
                    broadcast.comments,
                  )
                }>
                <ImageBackground
                  source={{uri: profilePictureURL}}
                  style={{width: '100%', height: '100%', borderRadius: 7}}
                  imageStyle={{borderRadius: 7}}>
                  <View
                    style={{
                      backgroundColor: 'red',
                      width: '40%',
                      height: '9%',
                      margin: '4%',
                      borderRadius: 3,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: calculatedFontSize / 2.5,
                      }}>
                      Live - {broadcast.watchers}
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
              <Text>{broadcast.title}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: '3%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4%',
    height: '9%',
    width: '100%',
  },
  profilePicture: {
    width: '15%',
    height: '100%',
    borderRadius: 25,
    marginRight: '5%',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '48%',
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    marginBottom: '2%',
    borderColor: 'black',
    borderWidth: 0.3,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentBox: {
    flexDirection: 'row',
    width: '80%',
  },
  input: {
    minHeight: 50,
    color: 'black',
    width: '90%',
  },
});

export default ViewerTab;
