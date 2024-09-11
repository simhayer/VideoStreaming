import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, Dimensions} from 'react-native';
import {
  Call,
  StreamCall,
  useCallStateHooks,
  useStreamVideoClient,
  VideoRenderer,
} from '@stream-io/video-react-native-sdk';
import IncallManager from 'react-native-incall-manager';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

export const CustomLivestreamPlayer = props => {
  const {callType, callId} = props;
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (!client) return;
    const myCall = client.call(callType, callId);
    setCall(myCall);
    myCall.join().catch(e => {
      console.error('Failed to join call', e);
    });
    return () => {
      myCall.leave().catch(e => {
        console.error('Failed to leave call', e);
      });
      setCall(undefined);
    };
  }, [callId, callType, client]);

  if (!call) {
    return null;
  }

  return (
    <StreamCall call={call}>
      <CustomLivestreamLayout />
    </StreamCall>
  );
};

const CustomLivestreamLayout = () => {
  const {useParticipants, useParticipantCount} = useCallStateHooks();
  const participantCount = useParticipantCount();
  const [firstParticipant] = useParticipants();

  // Automatically route audio to speaker devices as relevant for watching videos.
  useEffect(() => {
    IncallManager.start({media: 'video'});
    return () => IncallManager.stop();
  }, []);

  return (
    <SafeAreaView style={styles.flexed}>
      <View style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginRight: 50,
          }}>
          <Text
            style={{
              alignSelf: 'center',
              color: 'white',
              marginTop: '4%',
              fontSize: calculatedFontSize / 2.5,
              zIndex: 10,
            }}>
            Live: {participantCount}
          </Text>
        </View>
        <View style={styles.video}>
          {firstParticipant ? (
            <VideoRenderer participant={firstParticipant} />
          ) : (
            <Text style={styles.text}>The host hasn't joined yet</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexed: {
    flex: 1,
    backgroundColor: 'white',
  },
  text: {
    alignSelf: 'center',
    color: 'white',
    backgroundColor: 'blue',
    padding: 6,
    margin: 4,
    zIndex: 10,
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
});
