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
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import io from 'socket.io-client';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
  token,
} from '../../Resources/Constants';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import axios from 'axios';
import {
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-native-sdk';

const CustomLivestreamPlayer = React.lazy(() =>
  import('./CustomLivestreamPlayer'),
);
const MaskedView = React.lazy(() =>
  import('@react-native-masked-view/masked-view'),
);
const LinearGradient = React.lazy(() => import('react-native-linear-gradient'));

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

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

  const callId = broadcastId;

  console.log(callId);
  const {userData} = useSelector(state => state.auth);

  const userUsername = userData?.user?.username;
  //const userUsername = 'simsim';
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

  const [myClient, setMyClient] = useState(null);
  const [myCall, setMyCall] = useState(null);
  const [streamError, setStreamError] = useState(false);

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
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, [broadcastId]);

  useEffect(() => {
    createStreamUser();
  }, []);

  const createStreamUser = async () => {
    try {
      const payload = {
        username: userUsername,
        sellerUsername: username,
      };

      const response = await axios.post(
        baseURL + apiEndpoints.createStreamUserForJoining,
        payload,
      );
      console.log('Stream user created:', response.data);
      const {token, apiKey} = response.data;

      const user = {
        id: userUsername, // Ensure userId is defined somewhere
        name: userUsername,
      };

      // Create StreamVideoClient
      const client = StreamVideoClient.getOrCreateInstance({
        apiKey: apiKey,
        user,
        token,
      });
      setMyClient(client); // Set client in state

      // Create and join the call
      const call = client.call('livestream', callId);
      await call.join();
      setMyCall(call);
    } catch (error) {
      console.error('Error creating stream user or joining call:', error);
      console.log(
        'Error creating stream user or joining call:',
        error.response.data.error,
      );
      console.log('Error creating stream user or joining call:', error.error);
      setStreamError(true);
    }
  };

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

  const snapPoints = useMemo(() => ['1%', '30%'], []);

  const [viewHeightPercentage, setViewHeightPercentage] = useState('15%');

  const cannotBidSnapPoints = useMemo(
    () => ['1%', viewHeightPercentage],
    [viewHeightPercentage],
  );

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

  const controlsSnapPoints = useMemo(() => ['1%', '50%'], []);

  const onControlsPressed = () => {
    setControlsBottomSheetVisible(true);
    controlsBottomSheetRef.current?.expand();
  };

  const handleContolsSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      //todo:get this function to work
      setControlsBottomSheetVisible(false);
    }
  }, []);

  const onBlockUser = async () => {
    console.log('Blocking user:', username);
    const payload = {
      blockedUsername: username,
      username: userUsername,
    };

    const response = await axios
      .post(baseURL + apiEndpoints.addUserToBlocked, payload)
      .catch(error => {
        console.error('Error blocking user:', error);
        return;
      });

    console.log('Response:', response.data);
    navigation.navigate('Home');
  };

  if (streamError) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: calculatedFontSize / 2.4}}>
          Something went wrong, please try again later
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
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
  };

  const closeControls = () => {
    controlsBottomSheetRef.current?.close();
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
                  }}>
                  {username}
                </Text>
              </TouchableOpacity>
              <View style={{flex: 1}}></View>
              {/* <Text
                style={{
                  color: 'white',
                  fontSize: calculatedFontSize / 2.5,
                  marginRight: '2%',
                }}>
                Watchers: {watchers}
              </Text> */}
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
                flex: 1,
                marginBottom: 10,
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
                  showsVerticalScrollIndicator={false}
                  ref={scrollViewRef}
                  data={curComments}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => {
                    const profilePictureFilename = item.userProfilePicture
                      .split('/')
                      .pop();
                    const hasProfilePicture =
                      profilePictureFilename !== 'null' &&
                      profilePictureFilename !== '';
                    const profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;
                    return (
                      <Pressable
                        style={{
                          flex: 1,
                        }}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: '2%',
                          }}>
                          {hasProfilePicture && (
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
                          )}
                          {!hasProfilePicture && (
                            <View style={{marginRight: '4%'}}>
                              <Icon
                                name="person-circle-outline"
                                size={30}
                                color="white"
                              />
                            </View>
                          )}
                          <View>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                color: 'white',
                                fontSize: calculatedFontSize / 3,
                              }}>
                              {item.userUsername}
                            </Text>
                            <Text
                              style={{
                                color: 'white',
                                fontSize: calculatedFontSize / 3,
                              }}>
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
                justifyContent: 'space-between',
                minHeight: 35,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'grey',
                  width: '70%',
                  marginLeft: '4%',
                  borderRadius: 20,
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    opacity: 0.8,
                    width: '80%',
                    marginLeft: '4%',
                  }}>
                  <TextInput
                    style={{
                      borderRadius: 5,
                      paddingHorizontal: '2%',
                      color: 'white',
                      width: '100%',
                      fontSize: calculatedFontSize / 2.7,
                      padding: 5,
                    }}
                    placeholder="Add a comment..."
                    placeholderTextColor="white"
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
                    }}
                    onPress={handleSendComment}>
                    <Icon name="arrow-up-circle" size={35} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{marginRight: 10}}>
                <TouchableOpacity
                  style={{padding: 5}}
                  onPress={onControlsPressed}>
                  <Icon name="ellipsis-horizontal" size={35} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                minHeight: '4%',
                justifyContent: 'center',
                marginHorizontal: 10,
              }}>
              {isTimerRunning && (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ViewProduct', {
                        item: bidItem,
                      })
                    }
                    style={{maxWidth: '60%', marginLeft: 20}}>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2.5,
                        fontWeight: 'bold',
                        color: colors.white,
                      }}
                      numberOfLines={2}>
                      {bidItem?.name}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: calculatedFontSize / 1.4,
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
                marginBottom: 50,
              }}>
              {isTimerRunning && (
                <Text
                  style={{color: 'red', fontSize: calculatedFontSize / 2.4}}>
                  {timeLeft} s
                </Text>
              )}
            </View>
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
                  height: 45,
                  marginBottom: 20,
                  paddingHorizontal: '5%',
                }}>
                <TouchableOpacity
                  onPress={() => setIsBidBottomSheetVisible(true)}
                  style={{
                    flex: 2,
                    backgroundColor: appPink,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: calculatedFontSize / 2.7,
                    }}>
                    Custom
                  </Text>
                </TouchableOpacity>
                <View style={{flex: 1}} />
                <TouchableOpacity
                  onPress={handleSendBid}
                  style={{
                    flex: 2,
                    backgroundColor: appPink,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                  }}>
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
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
      {isCannotBidBottomSheetVisible && (
        <BottomSheet
          ref={cannotBidBottomSheetRef}
          snapPoints={cannotBidSnapPoints}
          index={isCannotBidBottomSheetVisible ? 1 : -1}
          onChange={handleCannotBidSheetChanges}>
          <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
            <View
              style={{
                alignItems: 'center',
                marginHorizontal: '4%',
                marginTop: 10,
              }}
              onLayout={event => {
                const {height} = event.nativeEvent.layout;
                if (height === 0) return;
                setViewHeightPercentage(
                  `${((height + 50) / screenHeight) * 100}%`,
                );
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
      {controlsBottomSheetVisible && (
        <BottomSheet
          ref={controlsBottomSheetRef}
          snapPoints={controlsSnapPoints}
          index={controlsBottomSheetVisible ? 1 : -1}
          onChange={handleContolsSheetChanges}>
          <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: '3%',
                marginTop: 10,
              }}>
              <View style={{width: 30}} />
              <TouchableOpacity
                style={{
                  padding: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 20,
                  justifyContent: 'center',
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
                    color: 'black',
                    fontSize: calculatedFontSize / 2.5,
                    fontWeight: 'bold',
                    marginLeft: 10,
                  }}>
                  {username}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 30,
                  padding: 5,
                  alignItems: 'center',
                }}
                onPress={closeControls}>
                <Icon name="chevron-down" size={22} color="white" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(0,0,0,0.1)',
                marginVertical: 8,
                marginHorizontal: 10,
              }}
            />
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={() =>
                navigation.navigate('ViewProfile', {username: username})
              }>
              <View style={styles.controlsIconStyle}>
                <Icon name="person-circle-outline" size={25} color="white" />
              </View>
              <Text style={styles.controlsTextStyle}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={onBlockUser}>
              <View style={styles.controlsIconStyle}>
                <Icon name="ban" size={25} color="white" />
              </View>
              <Text style={styles.controlsTextStyle}>Block</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={() =>
                navigation.navigate('ReportSellerOptions', {
                  sellerUsername: username,
                })
              }>
              <View
                style={{
                  backgroundColor: 'grey',
                  borderRadius: 30,
                  padding: 7,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: '5%',
                  paddingBottom: 9,
                  paddingHorizontal: 9,
                }}>
                <Icon name="warning" size={25} color="white" />
              </View>
              <Text style={styles.controlsTextStyle}>Report seller</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
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
    color: 'white',
    width: '100%',
  },
  controlsTextStyle: {
    marginLeft: '5%',
    fontSize: calculatedFontSize / 2.1,
    color: 'black',
    fontWeight: '700',
  },
  controlsIconStyle: {
    backgroundColor: 'grey',
    borderRadius: 30,
    padding: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '5%',
  },
});

export default VideoScreen;
