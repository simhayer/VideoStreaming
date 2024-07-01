import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {useNavigation} from '@react-navigation/native';
import StreamStore from './StreamStore'; // Import the StreamStore
import io from 'socket.io-client';
import {apiEndpoints, baseURL} from '../Resources/Constants';

const VideoScreen = ({route}) => {
  const {streamId, broadcastId, username, watchers, profilePictureURL} =
    route.params;
  const navigation = useNavigation();
  const [comment, setComment] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(baseURL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Retrieve the stream from the StreamStore
  const stream = StreamStore.getStream(streamId);

  const closeStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      StreamStore.removeStream(streamId);
    }
    navigation.goBack();
  };

  const handleCommentChange = text => {
    setComment(text);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      console.log('Comment sent:', comment);
      // Add your send comment logic here
      socket.emit('comment', {id: broadcastId, comment});
      setComment(''); // Clear the input after sending the comment
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Image
              source={{uri: profilePictureURL}}
              style={styles.profilePicture}
            />
            <Text
              style={{
                color: 'white',
                fontSize: calculatedFontSize / 2.5,
                fontWeight: 'bold',
                flex: 1,
              }}>
              {username}
            </Text>
            <Text
              style={{
                color: 'white',
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
          <View style={styles.commentBox}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="grey"
              value={comment}
              onChangeText={handleCommentChange}
              returnKeyType="send"
              enterKeyHint="send"
              onSubmitEditing={handleSendComment}
            />
            <TouchableOpacity onPress={handleSendComment}>
              <Text>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
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
  commentBox: {
    flexDirection: 'row',
    opacity: 0.8,
    height: '5%',
    minHeight: 50,
    marginBottom: '50%',
    marginRight: '40%',
  },
  input: {
    height: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: '2%',
    color: 'black',
  },
});

export default VideoScreen;
