import React, { useRef, useState } from 'react';
import {Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import { RTCPeerConnection, RTCView } from 'react-native-webrtc';
import { mediaDevices } from 'react-native-webrtc';
import {MediaStream} from 'react-native-webrtc';

const HomeTab = () => {
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;


  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const pc = useRef();
  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const startWebcam = async () => {
    pc.current = new RTCPeerConnection(servers);

    const isFront = true;
    const devices = await mediaDevices.enumerateDevices();

    const facing = isFront ? "front" : "environment";
    const videoSourceId = devices.find(
      (device) => device.kind === "videoinput" && device.facing === facing
    );
    const facingMode = isFront ? "user" : "environment";
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      },
    };

    var local = null;

    try{
      local = await mediaDevices.getUserMedia(constraints);
      setWebcamStarted(true);
    }
    catch(e){
      console.error(e);
    }
    
    // const local = await mediaDevices.getUserMedia({
    //   video: true,
    //   audio: true,
    // });
  
    setLocalStream(local);
  
    // Add tracks from local stream to peer connection
    local.getTracks().forEach(track => {
      pc.current.addTrack(track, local);
    });
  
    // Create an empty MediaStream for remote
    const remote = new MediaStream();
    setRemoteStream(remote);
  
    // Set up event handler for receiving remote tracks
    pc.current.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remote.addTrack(track);
      });
    };

    
  };
  
  

  const startCall = async () => {
    // const channelDoc = firestore().collection('channels').doc();
    // const offerCandidates = channelDoc.collection('offerCandidates');
    // const answerCandidates = channelDoc.collection('answerCandidates');

    // setChannelId(channelDoc.id);

    // pc.current.onicecandidate = async event => {
    //   if (event.candidate) {
    //     await offerCandidates.add(event.candidate.toJSON());
    //   }
    // };

    // //create offer
    // const offerDescription = await pc.current.createOffer();
    // await pc.current.setLocalDescription(offerDescription);

    // const offer = {
    //   sdp: offerDescription.sdp,
    //   type: offerDescription.type,
    // };

    // await channelDoc.set({offer});

    // // Listen for remote answer
    // channelDoc.onSnapshot(snapshot => {
    //   const data = snapshot.data();
    //   if (!pc.current.currentRemoteDescription && data?.answer) {
    //     const answerDescription = new RTCSessionDescription(data.answer);
    //     pc.current.setRemoteDescription(answerDescription);
    //   }
    // });

    // // When answered, add candidate to peer connection
    // answerCandidates.onSnapshot(snapshot => {
    //   snapshot.docChanges().forEach(change => {
    //     if (change.type === 'added') {
    //       const data = change.doc.data();
    //       pc.current.addIceCandidate(new RTCIceCandidate(data));
    //     }
    //   });
    // });
  };

  const joinCall = async () => {
    // const channelDoc = firestore().collection('channels').doc(channelId);
    // const offerCandidates = channelDoc.collection('offerCandidates');
    // const answerCandidates = channelDoc.collection('answerCandidates');

    // pc.current.onicecandidate = async event => {
    //   if (event.candidate) {
    //     await answerCandidates.add(event.candidate.toJSON());
    //   }
    // };

    // const channelDocument = await channelDoc.get();
    // const channelData = channelDocument.data();

    // const offerDescription = channelData.offer;

    // await pc.current.setRemoteDescription(
    //   new RTCSessionDescription(offerDescription),
    // );

    // const answerDescription = await pc.current.createAnswer();
    // await pc.current.setLocalDescription(answerDescription);

    // const answer = {
    //   type: answerDescription.type,
    //   sdp: answerDescription.sdp,
    // };

    // await channelDoc.update({answer});

    // offerCandidates.onSnapshot(snapshot => {
    //   snapshot.docChanges().forEach(change => {
    //     if (change.type === 'added') {
    //       const data = change.doc.data();
    //       pc.current.addIceCandidate(new RTCIceCandidate(data));
    //     }
    //   });
    // });
  };

  return (
    <KeyboardAvoidingView style={styles.body} behavior="position">
      <SafeAreaView>
        {localStream && (
          <RTCView
            streamURL={localStream?.toURL()}
            objectFit="cover"
            mirror
            style={styles.stream}
          />
        )}

        {remoteStream && (
          <RTCView
            streamURL={remoteStream?.toURL()}
            objectFit="cover"
            mirror
            style={styles.stream}
          />
        )}
        <View style={styles.buttons}>
          {!webcamStarted && (
            <Button title="Start webcam" onPress={startWebcam} />
          )}
          {webcamStarted && <Button title="Start call" onPress={startCall} />}
          {webcamStarted && (
            <View style={{flexDirection: 'row'}}>
              <Button title="Join call" onPress={joinCall} />
              <TextInput
                value={channelId}
                placeholder="callId"
                minLength={45}
                style={{borderWidth: 1, padding: 5}}
                onChangeText={newText => setChannelId(newText)}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#fff',

    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFill,
  },
  stream: {
    flex: 2,
    width: 200,
    height: 200,
  },
  buttons: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
});


export default HomeTab;
