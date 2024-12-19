import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {
  useCall,
  useCallStateHooks,
  VideoRenderer,
} from '@stream-io/video-react-native-sdk';
import InCallManager from 'react-native-incall-manager';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const LivestreamView = () => {
  const {useParticipantCount, useLocalParticipant, useIsCallLive} =
    useCallStateHooks();

  const call = useCall();
  const totalParticipants = useParticipantCount();
  const localParticipant = useLocalParticipant();

  useEffect(() => {
    InCallManager.start({media: 'video'});
    call?.goLive();

    return () => InCallManager.stop();
  }, []);

  return (
    <View style={styles.flexed}>
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
            Live: {totalParticipants - 1}
          </Text>
        </View>
        <View style={styles.video}>
          {localParticipant && (
            <VideoRenderer
              participant={localParticipant}
              trackType="videoTrack"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexed: {
    flex: 1,
    backgroundColor: 'white',
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

export default LivestreamView;
