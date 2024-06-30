import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {useNavigation} from '@react-navigation/native';
import StreamStore from './StreamStore'; // Import the StreamStore

const VideoScreen = ({route}) => {
  const {streamId, username, watchers, profilePictureURL} = route.params;
  const navigation = useNavigation();

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  // Retrieve the stream from the StreamStore
  const stream = StreamStore.getStream(streamId);

  const closeStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      StreamStore.removeStream(streamId);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{uri: profilePictureURL}}
          style={styles.profilePicture}
        />
        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.5,
            fontWeight: 'bold',
            flex: 1,
          }}>
          {username}
        </Text>
        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.5,
            marginRight: '2%',
          }}>
          Watchers: {watchers}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={closeStream}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      {stream && (
        <RTCView
          style={styles.video}
          objectFit="cover"
          streamURL={stream.toURL()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '2%',
    zIndex: 1,
  },
  profilePicture: {
    width: '8%',
    height: '100%',
    borderRadius: 25,
    marginRight: '1%',
  },
  closeButton: {
    width: '8%',
    height: '100%',
    backgroundColor: 'red',
    borderRadius: 25,
    padding: '1.5%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default VideoScreen;
