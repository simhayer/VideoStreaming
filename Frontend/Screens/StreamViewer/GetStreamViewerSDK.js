import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import io from 'socket.io-client';
import {
  apiEndpoints,
  appPink,
  baseURL,
  baseURLNoApi,
  colors,
} from '../../Resources/Constants';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {StreamVideo} from '@stream-io/video-react-native-sdk';
import CustomLivestreamPlayer from '../../Components/CustomLivestreamPlayer';
import useStreamCall from './UseStreamCall';
import ControlsBottomSheet from './BottomSheets/ControlsBottomSheet';
import CannotBidBottomSheet from './BottomSheets/CannotBidBottomSheet';
import CustomBidBottomSheet from './BottomSheets/CustomBidBottomSheet';
import ShippingAndTaxesBottomSheet from './BottomSheets/ShippingAndTaxesBottomSheet';
import CommentSection from '../../Components/CommentSection';
import CommentInput from '../../Components/CommentInput';
//import {useStreamClient} from '../../Components/StreamClientSetup';
import fetchApiKey from '../../Components/FetchApiKey';
import {useStreamClient} from './StreamClientSetup';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const VideoScreen = ({route}) => {
  const {
    broadcastId,
    username,
    watchers,
    profilePictureURL,
    comments,
    meetingId,
  } = route.params;

  const callId = broadcastId;

  console.log(callId);
  const {userData} = useSelector(state => state.auth);
  const dispatch = useDispatch();

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
  const [bidItem, setBidItem] = useState(null);

  const scrollViewRef = useRef();
  const [socket, setSocket] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0); // Initial time is 0
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [curBidWinner, setCurBidWinner] = useState('');
  const [showWinner, setShowWinner] = useState(false);

  const [streamError, setStreamError] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const myClient = useStreamClient();
  const myCall = useStreamCall(myClient, broadcastId, setStreamError);
  const apiKey = useSelector(state => state.NonPersistSlice.apiKey);

  useEffect(() => {
    console.log('useEffect triggered');
    const newSocket = io(baseURLNoApi, {
      path: '/api/socket.io',
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.emit('joinStream', broadcastId);

    newSocket.on('newComment', data => {
      console.log('New comment received:', data);
      setCurComments(prevComments => [...prevComments, data]);
    });

    newSocket.on('newBid', data => {
      console.log('New bid received:', data);
      setCurBid(Number(data.bidAmount));
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
      if (newSocket) {
        newSocket.disconnect(); // Ensure proper cleanup
        console.log('Socket disconnected');
      }
    };
  }, [broadcastId]);

  useEffect(() => {
    if (!apiKey) {
      fetchApiKey(dispatch); // Fetch API key when component mounts
    }
  }, [dispatch]);

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
      Keyboard.dismiss();
    }
  };

  const handleSendBid = () => {
    console.log('In Bid sent:', curBid + 1);

    checkPaymentandAddressExist(userEmail);
    if (!canBid) {
      return;
    }
    setUserBid(Number(curBid) + 1);
    //setCurBid(Number(curBid) + 1);

    console.log('Bid sent:', curBid + 1);

    const bidData = {
      id: broadcastId,
      bidAmount: Number(curBid) + 1,
      userUsername,
    };
    //setCurBid(Number(curBid) + 1);
    socket.emit('bid', bidData);
    //setUserBid(0); // Clear the input after sending the comment
  };

  const handleSendCustomBid = () => {
    console.log('In Bid sent:', Number(userBid));
    if (userBid > curBid) {
      console.log('Bid sent:', userBid);

      const bidData = {
        id: broadcastId,
        bidAmount: Number(userBid),
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
      setBidItem(null);
    }

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startBid = data => {
    const {product, startBid, timer} = data;

    const timeInSeconds = parseInt(timer, 10);
    setBidItem(product);
    setTimeLeft(timeInSeconds);
    setIsTimerRunning(true);
    setCurBid(startBid);
  };

  const [isBidBottomSheetVisible, setIsBidBottomSheetVisible] = useState(false);

  const bidBottomSheetRef = useRef(null);

  const showBidBottomSheet = () => {
    checkPaymentandAddressExist(userEmail);
    if (!canBid) {
      return;
    }
    setIsBidBottomSheetVisible(true);
    bidBottomSheetRef.current?.expand();
  };

  const cannotBidBottomSheetRef = useRef(null);

  const checkPaymentandAddressExist = async email => {
    console.log('Checking payment and address exist');
    const payload = {
      email: email,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.checkStripePaymentPresent, payload)
      .catch(error => {
        console.error('Error checking payment present:', error);
        return;
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
      cannotBidBottomSheetRef.current?.expand();
    }

    return {
      canBid,
    };
  };

  useEffect(() => {
    checkPaymentandAddressExist(userEmail);
  }, [userEmail]);

  const [controlsBottomSheetVisible, setControlsBottomSheetVisible] =
    useState(false);

  const controlsBottomSheetRef = useRef(null);

  const onControlsPressed = () => {
    setControlsBottomSheetVisible(true);
    controlsBottomSheetRef.current?.expand();
  };

  const [
    shippingAndTaxesBottomSheetVisible,
    setShippingAndTaxesBottomSheetVisible,
  ] = useState(false);

  const shippingAndTaxesBottomSheetRef = useRef(null);

  const showShippingAndTaxesBottomSheet = () => {
    setShippingAndTaxesBottomSheetVisible(true);
    shippingAndTaxesBottomSheetRef.current?.expand();
  };

  const endCall = () => {
    console.log('in end call');
    if (userData.user.isAdmin) {
      console.log('in end call 2');
      myCall.endCall();
    }
  };

  useEffect(() => {
    if (!myClient) {
      return;
    }
    // Subscribe to the 'call.ended' event
    const unsubscribeEnded = myClient.on('call.ended', event => {
      if (event.type === 'call.ended') {
        setCallEnded(true);
        console.log(`Call ended: ${event.call_cid}`);
      }
    });

    return () => {
      unsubscribeEnded();
    };
  }, [myClient]);

  if (streamError || callEnded) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {callEnded ? (
          <Text style={{fontSize: calculatedFontSize / 2.4}}>
            This stream has ended
          </Text>
        ) : (
          <Text style={{fontSize: calculatedFontSize / 2.4}}>
            Something went wrong, please try again later
          </Text>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Streams')}
          style={{
            backgroundColor: appPink,
            borderRadius: 40,
            paddingVertical: '4%',
            alignItems: 'center',
            width: '60%',
            marginTop: 30,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'left',
              fontSize: calculatedFontSize / 2.2,
              fontWeight: 'bold',
            }}>
            Home
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!myClient || !myCall) {
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
        <Text style={{fontSize: calculatedFontSize / 2.4, alignSelf: 'center'}}>
          Livestream starting...
        </Text>
        <ActivityIndicator
          size="large"
          color="grey"
          style={{marginVertical: 20}}
        />
      </SafeAreaView>
    );
  }

  const screenTap = () => {
    Keyboard.dismiss();

    cannotBidBottomSheetRef.current?.close();
    bidBottomSheetRef.current?.close();
    controlsBottomSheetRef.current?.close();
    shippingAndTaxesBottomSheetRef.current?.close();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <StreamVideo client={myClient}>
        <View style={styles.video}>
          <CustomLivestreamPlayer callType="livestream" callId={callId} />
        </View>
      </StreamVideo>
      <SafeAreaView style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={screenTap} style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: '2%',
                zIndex: 1,
              }}>
              <TouchableOpacity
                style={{
                  padding: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 20,
                }}
                onPress={() =>
                  navigation.navigate('ViewProfile', {username: username})
                }>
                <Image
                  source={{uri: profilePictureURL}}
                  style={styles.profilePicture}
                />

                <Text
                  style={{
                    color: 'white',
                    fontSize: calculatedFontSize / 2.5,
                    fontWeight: 'bold',
                    marginLeft: 10,
                    textShadowColor: '#000', // Shadow color
                    textShadowOffset: {width: 1, height: 1}, // Shadow offset
                    textShadowRadius: 3, // Shadow blur
                    elevation: 5,
                  }}>
                  {username}
                </Text>
              </TouchableOpacity>
              <View style={{flex: 1}}></View>
              <TouchableOpacity
                style={{
                  backgroundColor: 'red',
                  borderRadius: 30,
                  padding: '1.5%',
                  alignItems: 'center',
                }}
                onPress={closeStream}>
                <Icon name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>
            {showWinner && (
              <View
                style={{
                  position: 'absolute',
                  top: '15%',
                  alignItems: 'center',
                  width: '100%',
                  textShadowColor: '#000',
                  textShadowOffset: {width: 1, height: 1},
                  textShadowRadius: 3,
                  elevation: 5,
                }}>
                <Text
                  style={{color: 'red', fontSize: calculatedFontSize / 2.3}}>
                  {curBidWinner} won the bid!
                </Text>
              </View>
            )}
            <View style={{flex: 1}} />
            <View
              style={{
                width: '70%',
                marginLeft: '5%',
                flex: 2,
                marginBottom: 10,
              }}>
              <CommentSection
                comments={curComments}
                scrollViewRef={scrollViewRef}
              />
            </View>
            <CommentInput
              comment={comment}
              handleCommentChange={handleCommentChange}
              handleSendComment={handleSendComment}
              onControlsPressed={onControlsPressed}
            />
            <View
              style={{
                marginHorizontal: 10,
                flex: 0.3,
              }}>
              {isTimerRunning && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ViewProductBuyer', {
                        item: bidItem,
                      })
                    }
                    style={{maxWidth: '60%', marginLeft: 10, marginTop: 10}}>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2.9,
                        fontWeight: 'bold',
                        color: colors.white,
                        textShadowColor: '#000', // Shadow color
                        textShadowOffset: {width: 1, height: 1}, // Shadow offset
                        textShadowRadius: 3, // Shadow blur
                        elevation: 5,
                      }}
                      numberOfLines={2}>
                      {bidItem?.name}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: calculatedFontSize / 1.6,
                      textShadowColor: '#000', // Shadow color
                      textShadowOffset: {width: 1, height: 1}, // Shadow offset
                      textShadowRadius: 3, // Shadow blur
                      elevation: 5,
                    }}>
                    ${curBid}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{
                width: '96%',
                justifyContent: 'flex-end',
                flexDirection: 'row',
                marginBottom: 30,
              }}>
              {isTimerRunning && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: calculatedFontSize / 2.4,
                    textShadowColor: '#000', // Shadow color
                    textShadowOffset: {width: 1, height: 1}, // Shadow offset
                    textShadowRadius: 3, // Shadow blur
                    elevation: 5,
                  }}>
                  {timeLeft} s
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={{marginLeft: '4%', marginBottom: 10}}
              onPress={showShippingAndTaxesBottomSheet}>
              <Text style={{color: 'white'}}>Shipping and Taxes</Text>
            </TouchableOpacity>
            {!isTimerRunning && (
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    height: 45,
                    width: '75%',
                    marginBottom: 20,
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
              </View>
            )}
            {isTimerRunning && (
              <View
                style={{
                  flexDirection: 'row',
                  height: 50,
                  marginBottom: 20,
                  paddingHorizontal: '5%',
                }}>
                <View
                  style={{
                    borderColor: appPink,
                    flex: 4,
                    padding: 3,
                    borderWidth: 2,
                    borderRadius: 20,
                  }}>
                  <TouchableOpacity
                    onPress={showBidBottomSheet}
                    style={{
                      flex: 1,
                      backgroundColor: appPink,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 3},
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 7,
                    }}
                    activeOpacity={0.8}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: calculatedFontSize / 2.7,
                      }}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}} />
                <View
                  style={{
                    borderColor: appPink,
                    flex: 4,
                    padding: 3,
                    borderWidth: 2,
                    borderRadius: 20,
                  }}>
                  <TouchableOpacity
                    onPress={handleSendBid}
                    style={{
                      flex: 1,
                      backgroundColor: appPink,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 3},
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 7,
                    }}
                    activeOpacity={0.8}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: calculatedFontSize / 2.7,
                      }}>
                      Bid {Number(curBid) + 1}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
      {isCannotBidBottomSheetVisible && (
        <CannotBidBottomSheet
          cannotBidBottomSheetRef={cannotBidBottomSheetRef}
          isCannotBidBottomSheetVisible={isCannotBidBottomSheetVisible}
          setIsCannotBidBottomSheetVisible={setIsCannotBidBottomSheetVisible}
        />
      )}
      {isBidBottomSheetVisible && (
        <CustomBidBottomSheet
          bidBottomSheetRef={bidBottomSheetRef}
          isBidBottomSheetVisible={isBidBottomSheetVisible}
          setIsBidBottomSheetVisible={setIsBidBottomSheetVisible}
          curBid={curBid}
          userBid={userBid}
          setUserBid={setUserBid}
          handleSendCustomBid={handleSendCustomBid}
          timeLeft={timeLeft}
        />
      )}
      {controlsBottomSheetVisible && (
        <ControlsBottomSheet
          controlsBottomSheetRef={controlsBottomSheetRef}
          controlsBottomSheetVisible={controlsBottomSheetVisible}
          profilePictureURL={profilePictureURL}
          username={username}
          setControlsBottomSheetVisible={setControlsBottomSheetVisible}
          endCall={endCall}
        />
      )}
      {shippingAndTaxesBottomSheetVisible && (
        <ShippingAndTaxesBottomSheet
          shippingAndTaxesBottomSheetRef={shippingAndTaxesBottomSheetRef}
          shippingAndTaxesBottomSheetVisible={
            shippingAndTaxesBottomSheetVisible
          }
          setShippingAndTaxesBottomSheetVisible={
            setShippingAndTaxesBottomSheetVisible
          }
          bidItem={bidItem}
          isTimerRunning={isTimerRunning}
        />
      )}
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
    width: 30,
    height: 30,
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
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
});

export default VideoScreen;
