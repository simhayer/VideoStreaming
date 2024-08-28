import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import io from 'socket.io-client';
import {apiEndpoints, appPink, baseURL, token} from '../Resources/Constants';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Video from 'react-native-video';
import {set} from 'mongoose';
import axios from 'axios';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

function ViewerView({}) {
  const {hlsState, hlsUrls} = useMeeting();
  const videoRef = useRef(null);

  useEffect(() => {
    if (hlsState === 'HLS_PLAYABLE') {
      // Seek to the end of the video (live)
      videoRef.current.seek(Number.MAX_SAFE_INTEGER); // Seeking to a very high number should take you to the live edge
    }
  }, [hlsState]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {hlsState == 'HLS_PLAYABLE' ? (
        <>
          {/* Render VideoPlayer that will play downstreamUrl*/}
          <Video
            ref={videoRef}
            controls={false}
            source={{
              uri: hlsUrls.downstreamUrl,
            }}
            resizeMode={'cover'}
            style={{
              backgroundColor: 'black',
              height: screenHeight * 1.1,
            }}
            onLoad={() => {
              videoRef.current.seek(Number.MAX_SAFE_INTEGER);
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
  const userEmail = userData?.user?.email;
  const userProfilePicture = userData?.user?.profilePicture;

  const [canBid, setCanBid] = useState(false);
  const [isCannotBidBottomSheetVisible, setIsCannotBidBottomSheetVisible] =
    useState(false);

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

  const [curBidWinner, setCurBidWinner] = useState('');
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered');
    const newSocket = io(baseURL);
    setSocket(newSocket);

    newSocket.emit('joinStream', broadcastId);

    newSocket.on('newComment', data => {
      console.log('New comment received:', data);
      setCurComments(prevComments => [...prevComments, data]);
    });

    newSocket.on('newBid', data => {
      console.log('New bid received:', data);
      setCurBid(Number(data.userBid));
    });

    newSocket.on('startBid', data => {
      console.log('New bid started:', data);
      startBid(data);
    });

    newSocket.on('endBid', data => {
      console.log('Bid ended:', data);
      if (data.userUsername !== 'null') {
        setCurBidWinner(data.userUsername);
        setShowWinner(true);
        setTimeout(() => {
          setShowWinner(false);
        }, 3000);
      }
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, [broadcastId]);

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
    setUserBid(Number(curBid) + 1);
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

  const handleSendCustomBid = () => {
    console.log('In Bid sent:', Number(userBid));
    if (userBid > curBid) {
      console.log('Bid sent:', userBid);

      const bidData = {
        id: broadcastId,
        userBid: userBid,
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

  const [isBidBottomSheetVisible, setIsBidBottomSheetVisible] = useState(false);

  const bidBottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      setIsBidBottomSheetVisible(false);
    }
  }, []);

  const cannotBidBottomSheetRef = useRef(null);

  const handleCannotBidSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      //todo:get this function to work
      setIsCannotBidBottomSheetVisible(false);
    }
  }, []);

  const snapPoints = useMemo(() => ['1%', '25%'], []);

  const checkPaymentandAddressExist = async email => {
    console.log('Checking payment and address exist');
    const payload = {
      email: email,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.checkStripePaymentPresent, payload)
      .catch(error => {
        console.error('Error checking payment present:', error);
      });

    console.log('Response:', response.data);

    const {paymentPresent, address} = response.data;

    console.log('Payment present:', paymentPresent);
    if (paymentPresent && address != null) {
      console.log('Payment and address exist');
      setCanBid(true);
    } else {
      console.log('Payment and address do not exist');
      setCanBid(false);
      setIsCannotBidBottomSheetVisible(true);
    }

    return {
      canBid,
    };
  };

  useEffect(() => {
    checkPaymentandAddressExist(userEmail);
  }, [userEmail]);

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
      token={token}>
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
              {showWinner && (
                <View
                  style={{
                    position: 'absolute',
                    top: '15%',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                  <Text
                    style={{color: 'red', fontSize: calculatedFontSize / 2.3}}>
                    {curBidWinner} won the bid!
                  </Text>
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
                    onPress={() => setIsBidBottomSheetVisible(true)}
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
                      Bid {Number(curBid) + 1}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
          {isCannotBidBottomSheetVisible && (
            <BottomSheet
              ref={cannotBidBottomSheetRef}
              snapPoints={snapPoints}
              index={isCannotBidBottomSheetVisible ? 1 : -1}
              onChange={handleCannotBidSheetChanges}>
              <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
                <View
                  style={{
                    alignItems: 'center',
                    marginHorizontal: '4%',
                    marginTop: 10,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: calculatedFontSize / 2.8,
                    }}>
                    For placing a bid, you need to add payment and shipping
                    information
                  </Text>
                  <Text
                    style={{
                      color: 'black',
                      textAlign: 'center',
                      fontSize: calculatedFontSize / 3,
                    }}>
                    You will not be charged until your bid is accepted. All bids
                    placed are final.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddPaymentOrShipping')}
                    style={{
                      paddingVertical: '2%',
                      width: '100%',
                      backgroundColor: appPink,
                      borderRadius: 40,
                      marginTop: '6%',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: calculatedFontSize / 2.2,
                        fontWeight: 'bold',
                      }}>
                      Add Info
                    </Text>
                  </TouchableOpacity>
                </View>
              </BottomSheetView>
            </BottomSheet>
          )}
          {isBidBottomSheetVisible && (
            <BottomSheet
              ref={bidBottomSheetRef}
              snapPoints={snapPoints}
              index={isBidBottomSheetVisible ? 1 : -1}
              onChange={handleSheetChanges}>
              <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
                <View style={{flexDirection: 'column', marginTop: 2}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2,
                      }}>
                      Current Bid:{'     '}
                    </Text>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 1.4,
                      }}>
                      ${curBid}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 40,
                    }}>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 1.4,
                      }}>
                      ${' '}
                    </Text>
                    <TextInput
                      placeholder="Enter Bid"
                      keyboardType="numeric"
                      maxLength={5}
                      textAlign="center"
                      value={userBid}
                      onChangeText={text => {
                        const numericValue = text.replace(/[^0-9]/g, '');
                        setUserBid(numericValue);
                      }}
                      style={{
                        width: '30%',
                        borderBottomWidth: 1,
                        textAlign: 'center',
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleSendCustomBid}
                      disabled={userBid <= curBid}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: '10%',
                        marginTop: '2%',
                        opacity: userBid <= curBid ? 0.5 : 1,
                      }}>
                      <Icon
                        name="arrow-up-circle"
                        size={40}
                        color={userBid <= curBid ? 'gray' : '#f542a4'}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{alignItems: 'center'}}>
                    <Text
                      style={{
                        color: 'red',
                        marginTop: '5%',
                      }}>
                      Time Left: {timeLeft} s
                    </Text>
                  </View>
                </View>
              </BottomSheetView>
            </BottomSheet>
          )}
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
