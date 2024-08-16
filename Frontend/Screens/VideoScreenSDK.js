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
  FlatList,
} from 'react-native';
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
  RTCView,
} from '@videosdk.live/react-native-sdk';
import {useNavigation} from '@react-navigation/native';
import StreamStore from './StreamStore'; // Import the StreamStore
import io from 'socket.io-client';
import {apiEndpoints, baseURL} from '../Resources/Constants';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

import Video from 'react-native-video';
const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

function ViewerView({}) {
  const {hlsState, hlsUrls} = useMeeting();
  return (
    <SafeAreaView style={{flex: 1}}>
      {hlsState == 'HLS_PLAYABLE' ? (
        <>
          {/* Render VideoPlayer that will play downstreamUrl*/}
          <Video
            controls={false}
            source={{
              uri: hlsUrls.downstreamUrl,
            }}
            resizeMode={'cover'}
            style={{
              backgroundColor: 'black',
              height: screenHeight,
            }}
            onError={e => console.log('error', e)}
          />
        </>
      ) : (
        <SafeAreaView
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 20}}>
            HLS is not started yet or is stopped
          </Text>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const VideoScreen = ({route}) => {
  const {
    streamId,
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
    meetingId,
  } = route.params;
  console.log(meetingId);
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

  const [timeLeft, setTimeLeft] = useState(0); // Initial time is 0
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [showEndBidText, setShowEndBidText] = useState(false);

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

    newSocket.on('startBid', data => {
      console.log('New bid started:', data);
      startBid(data);
    });

    newSocket.on('endBid', data => {
      console.log('Bid ended:', data);
      setIsTimerRunning(false);
      setShowEndBidText(true);
      setTimeout(() => {
        setShowEndBidText(false);
      }, 4000);
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, [broadcastId]);

  // Retrieve the stream from the StreamStore
  const stream = StreamStore.getStream(streamId);

  const closeStream = () => {
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
    console.log('In Bid sent:', curBid + 1);
    setUserBid(curBid + 1);
    if (curBid + 1 > 0) {
      console.log('Bid sent:', curBid + 1);

      const bidData = {
        id: broadcastId,
        userBid: curBid + 1,
        userUsername,
      };
      socket.emit('bid', bidData);
      //setUserBid(0); // Clear the input after sending the comment
    }
  };

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startBid = data => {
    const {bidItem, startBid, timer} = data;

    const timeInSeconds = parseInt(timer, 10);
    setTimeLeft(timeInSeconds);
    setIsTimerRunning(true);
    setCurBid(startBid);
  };

  useEffect(() => {
    // Scroll to bottom whenever comments change
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [curComments]);

  return (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Simrat's Org",
        mode: Constants.modes.VIEWER,
      }}
      joinWithoutUserInteraction
      token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkYTIyODY0OS00YmM5LTQxYzctYmI3Yi1jZjA4Y2RlZjNhZmQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyMzY5MTY4MSwiZXhwIjoxNzU1MjI3NjgxfQ.z9HIp4NOtQF0nXAyqPAIvUUcq917rT4WAeglxl5jgxU">
      <View>
        <ViewerView />
        <SafeAreaView style={{height: '100%', width: '100%'}}>
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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeStream}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
              {showEndBidText && (
                <View style={styles.endBidTextContainer}>
                  <Text style={styles.endBidText}>Bid Ended</Text>
                </View>
              )}
              <View
                style={{
                  width: '70%',
                  height: '100%',
                  marginTop: '75%',
                  marginLeft: '5%',
                  flex: 1,
                  marginBottom: '2%',
                }}>
                <MaskedView
                  style={{flex: 1}}
                  maskElement={
                    <LinearGradient
                      style={{flex: 1}}
                      colors={['transparent', 'white', 'white', 'white']}
                    />
                  }>
                  <FlatList
                    ref={scrollViewRef}
                    data={curComments}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => {
                      const profilePictureFilename = item.userProfilePicture
                        .split('/')
                        .pop();
                      const profilePictureURL = `${baseURL}/profilePicture/${profilePictureFilename}`;
                      return (
                        <Pressable
                          style={{
                            flex: 1,
                            height: '20%',
                          }}>
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
                                width: '12%',
                                height: '80%',
                                borderRadius: 20,
                                marginRight: '4%',
                                marginTop: '1%',
                              }}
                            />
                            <View>
                              <Text
                                style={{fontWeight: 'bold', color: 'white'}}>
                                {item.userUsername}
                              </Text>
                              <Text style={{color: 'white'}}>
                                {item.comment}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    }}
                    contentContainerStyle={{
                      flexGrow: 1,
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  />
                </MaskedView>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '5%',
                  justifyContent: 'center',
                  minHeight: 50,
                }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: 'grey',
                    width: '70%',
                    marginLeft: '5%',
                    borderRadius: 20,
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
                        paddingTop: '6%',
                      }}
                      onPress={handleSendComment}>
                      <Icon name="arrow-up-circle" size={40} color="grey" />
                      <Text></Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View
                style={{
                  width: '94%',
                  justifyContent: 'flex-end',
                  flexDirection: 'row',
                  height: '4%',
                }}>
                {isTimerRunning && (
                  <Text
                    style={{
                      color: 'white',
                      fontSize: calculatedFontSize / 1.4,
                    }}>
                    ${curBid}
                  </Text>
                )}
              </View>
              <View
                style={{
                  width: '96%',
                  justifyContent: 'flex-end',
                  flexDirection: 'row',
                  marginBottom: 50,
                  height: '3%',
                }}>
                {isTimerRunning && (
                  <Text
                    style={{color: 'red', fontSize: calculatedFontSize / 2.4}}>
                    {timeLeft} s
                  </Text>
                )}
              </View>
              {!isTimerRunning && (
                <View
                  style={{
                    flexDirection: 'row',
                    height: '6%',
                    width: '75%',
                    marginBottom: 20,
                    marginLeft: '12%',
                    backgroundColor: 'rgba(128, 128, 128, 0.7)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 30,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: calculatedFontSize / 2.4,
                    }}>
                    Awaiting Next Bid
                  </Text>
                </View>
              )}
              {isTimerRunning && (
                <View
                  style={{
                    flexDirection: 'row',
                    height: '6%',
                    width: '100%',
                    marginBottom: 20,
                    marginLeft: '5%',
                  }}>
                  <TouchableOpacity
                    onPress={handleSendBid}
                    style={{
                      height: '100%',
                      width: '25%',
                      backgroundColor: '#f542a4',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                    }}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                  <View style={{width: '20%', justifyContent: 'center'}}>
                    {/* <Text style={{color: 'white'}}>Cur Bid: {curBid}</Text> */}
                  </View>
                  <TouchableOpacity
                    onPress={handleSendBid}
                    style={{
                      height: '100%',
                      width: '45%',
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
              )}
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </View>
    </MeetingProvider>
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
    bottom: 0,
    right: 0,
  },
  commentBox: {
    flexDirection: 'row',
    opacity: 0.8,
    height: '100%',
    minHeight: 50,
    width: '80%',
    marginRight: '10%',
    marginLeft: '4%',
  },
  input: {
    height: '100%',
    minHeight: 50,
    borderRadius: 5,
    paddingHorizontal: '2%',
    color: 'black',
    width: '100%',
  },
});

export default VideoScreen;
