import React, {useEffect, useRef, useState} from 'react';
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
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {useNavigation} from '@react-navigation/native';
import StreamStore from './StreamStore'; // Import the StreamStore
import io from 'socket.io-client';
import {apiEndpoints, baseURL} from '../Resources/Constants';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

const VideoScreen = ({route}) => {
  const {
    streamId,
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
  } = route.params;

  const {userData} = useSelector(state => state.auth);

  const userUsername = userData?.user?.username;
  const userProfilePicture = userData?.user?.profilePicture;

  const navigation = useNavigation();
  const [comment, setComment] = useState('');
  const [curComments, setCurComments] = useState(comments || []);
  const [curBid, setCurBid] = useState(0);
  const [userBid, setUserBid] = useState(0);

  const scrollViewRef = useRef();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log('useEffect triggered');
    const newSocket = io(baseURL);
    setSocket(newSocket);

    // Join the specific stream's room
    newSocket.emit('joinStream', broadcastId);

    // Listen for new comments for the specific stream
    newSocket.on('newComment', data => {
      console.log('New comment received:', data);
      setCurComments(prevComments => [...prevComments, data]);
    });

    newSocket.on('newBid', data => {
      console.log('New bid received:', data);
      setCurBid(data.userBid);
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, [broadcastId]);

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

      const commentData = {
        id: broadcastId,
        comment,
        userUsername,
        userProfilePicture,
      };
      socket.emit('comment', commentData);
      setComment(''); // Clear the input after sending the comment
      //setCurComments([...curComments, commentData]); // Add the comment to the comments list
    }
  };

  const handleSendBid = () => {
    console.log('In Bid sent:', userBid);
    setUserBid(userBid + 1);
    if (userBid > 0) {
      console.log('Bid sent:', userBid);

      const bidData = {
        id: broadcastId,
        userBid,
        userUsername,
      };
      socket.emit('bid', bidData);
      //setUserBid(0); // Clear the input after sending the comment
    }
  };

  useEffect(() => {
    // Scroll to bottom whenever comments change
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [curComments]);

  return (
    <SafeAreaView style={{height: '100%', width: '100%'}}>
      {/* <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}> */}
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
      <View
        style={{
          width: '50%',
          height: '100%',
          marginTop: '75%',
          marginLeft: '3%',
          flex: 1,
        }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: 'column',
          }}>
          {curComments.map((commentData, index) => {
            const profilePictureFilename = commentData.userProfilePicture
              .split('/')
              .pop();
            const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;
            return (
              <Pressable
                key={index}
                style={{flex: 1, height: '20%', maxHeight: '20%'}}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: '2%',
                  }}>
                  <Image
                    source={{uri: profilePictureURL}}
                    style={{
                      width: '15%',
                      height: '80%',
                      borderRadius: 15,
                      marginRight: '4%',
                      marginLeft: '5%',
                      marginBottom: '2%',
                    }}
                  />
                  <View>
                    <Text style={{fontWeight: 'bold'}}>
                      {commentData.userUsername}
                    </Text>
                    <Text>{commentData.comment}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          width: '100%',
          height: '5%',
          marginBottom: '30%',
          justifyContent: 'center',
        }}>
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
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '7%',
            }}
            onPress={handleSendComment}>
            <Icon name="arrow-up-circle" size={40} color="grey" />
            <Text></Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          height: '7%',
          width: '100%',
        }}>
        <TouchableOpacity
          onPress={handleSendBid}
          style={{
            height: '100%',
            width: '40%',
            backgroundColor: '#f542a4',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Custom Bid</Text>
        </TouchableOpacity>
        <View style={{width: '20%', justifyContent: 'center'}}>
          <Text style={{color: 'white'}}>Cur Bid: {curBid}</Text>
        </View>
        <TouchableOpacity
          onPress={handleSendBid}
          style={{
            height: '100%',
            width: '40%',
            backgroundColor: '#f542a4',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            Bid {curBid + 1}
          </Text>
        </TouchableOpacity>
      </View>
      {/* </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView> */}
    </SafeAreaView>
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
    height: '100%',
    minHeight: 50,
    width: '40%',
    marginRight: '10%',
    marginLeft: '4%',
  },
  input: {
    height: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: '2%',
    color: 'black',
    width: '100%',
  },
});

export default VideoScreen;
