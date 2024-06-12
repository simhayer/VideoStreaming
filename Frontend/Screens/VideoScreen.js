import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import StreamStore from './StreamStore';  // Import the StreamStore

const VideoScreen = ({ route }) => {
  const { streamId } = route.params;

  // Retrieve the stream from the StreamStore
  const stream = StreamStore.getStream(streamId);

  return (
    <View style={styles.container}>
      {stream && <RTCView style={styles.video} objectFit="cover" streamURL={stream.toURL()} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default VideoScreen;
