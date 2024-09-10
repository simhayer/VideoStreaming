import React, {useEffect, useState} from 'react';
import {
  role,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-native-sdk';
//import { SafeAreaView, Text, StyleSheet, View, Image } from 'react-native';
import {
  useCall,
  useCallStateHooks,
  useIncallManager,
  VideoRenderer,
} from '@stream-io/video-react-native-sdk';
import {Button, Text, View, StyleSheet, SafeAreaView} from 'react-native';
import InCallManager from 'react-native-incall-manager';
import {apiEndpoints, baseURL} from '../../Resources/Constants';
import axios from 'axios';
import {useSelector} from 'react-redux';

const apiKey = '8ryv3hxy9p2s'; // The API key can be found in the "Credentials" section
// const token =
//   'z5fr9c6rytbjcqueha8g7c48cfwtcyba86mnupqsxg4ccfjgxfmek9n87us7wrqa'; // The token can be found in the "Credentials" section

// const token =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMSJ9.W9sm5ZlaH1rAoSocOnXVP0ZqTIOJCEyZ6e4kFn3sOT0'; // The token can be found in the "Credentials" section
const userId = 'john'; // Theu ser id can be found in the "Credentials" section
const callId = 'livestream_4'; // The call id can be found in the "Credentials" section

// const user = {id: userId, name: 'Tutorial'};
// const client = new StreamVideoClient({apiKey, user, token});
// const call = client.call('livestream', callId);
// call.join({create: true});

export default function App() {
  const [myClient, setMyClient] = useState(null);
  const [myCall, setMyCall] = useState(null);

  const {userData} = useSelector(state => state.auth);

  const userUsername = userData?.user?.username;

  useEffect(() => {
    createStreamUser();
  }, []);

  const createStreamUser = async () => {
    try {
      const payload = {
        username: userUsername,
      };

      const response = await axios.post(
        baseURL + apiEndpoints.queryActiveStreamCalls,
      );
      console.log('Stream user created:', response.data);
      const token = response.data;
      console.log('Token:', token);

      const user = {
        id: userUsername, // Ensure userId is defined somewhere
        name: userUsername,
        image: `https://getstream.io/random_png/?id=${userUsername}&name=Santhosh`,
      };
      // Create StreamVideoClient
      //const client = new StreamVideoClient({apiKey, user, token: token});
      const client = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user,
        token,
      });
      setMyClient(client); // Set client in state

      // Create and join the call
      const call = client.call('livestream', callId); // Ensure callId is defined
      await call.join({create: true}); // Wait for the join to complete
      setMyCall(call); // Set call in state
    } catch (error) {
      console.error('Error creating stream user or joining call:', error);
    }
  };

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
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
          <LivestreamView />
        </SafeAreaView>
      </StreamCall>
    </StreamVideo>
  );
}

const LivestreamView = () => {
  const {useParticipantCount, useLocalParticipant, useIsCallLive} =
    useCallStateHooks();

  const call = useCall();
  const totalParticipants = useParticipantCount();
  const localParticipant = useLocalParticipant();
  const isCallLive = useIsCallLive();

  useEffect(() => {
    InCallManager.start({media: 'video'});
    return () => InCallManager.stop();
  }, []);

  return (
    <View style={styles.flexed}>
      <Text style={styles.text}>Live: {totalParticipants}</Text>
      <View style={styles.flexed}>
        {localParticipant && (
          <VideoRenderer
            participant={localParticipant}
            trackType="videoTrack"
          />
        )}
      </View>
      <View style={styles.bottomBar}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
