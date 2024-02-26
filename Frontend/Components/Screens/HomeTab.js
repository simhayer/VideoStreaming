import React, {useState, useEffect, useRef} from 'react';
import {
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {mediaDevices, MediaStream} from 'react-native-webrtc';
import ActionCable from 'react-native-actioncable';
//import MediaStream from 'react-native-webrtc';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const HomeTab = () => {
  const dispatch = useDispatch();
  const {userData, isLoading} = useSelector(state => state.auth);

  const email = userData?.user?.email;

  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [channelId, setChannelId] = useState(null);
  //const [pc, setPC] = useState(null);
  //const pc = new RTCPeerConnection(servers);
  const pc = useRef(new RTCPeerConnection(servers));

  const handleWebRTCData = data => {
    if (!pc.current.currentRemoteDescription && data.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.current.setRemoteDescription(answerDescription);
    } else if (data.candidate) {
      pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const startWebcam = async () => {
    //const newPC = new RTCPeerConnection(servers);
    //setPC(newPC);

    //const peerConnection = new RTCPeerConnection(servers);
    //setPC(peerConnection);
    //pc.current = peerConnection;
    pc.current = new RTCPeerConnection(servers);

    const isFront = true;
    const devices = await mediaDevices.enumerateDevices();

    const facing = isFront ? 'front' : 'environment';
    const videoSourceId = devices.find(
      device => device.kind === 'videoinput' && device.facing === facing,
    );
    const facingMode = isFront ? 'user' : 'environment';
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500,
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
      },
    };

    try {
      const local = await mediaDevices.getUserMedia(constraints);
      setWebcamStarted(true);
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
        console.log('Here');
        event.streams[0].getTracks().forEach(track => {
          remote.addTrack(track);
        });
      };

      pc.current.oniceconnectionstatechange = event => {
        console.log(
          'ICE connection state change:',
          pc.current.iceConnectionState,
        );
      };
    } catch (e) {
      console.error(e);
    }
  };

  // const channelId1 = '555';
  // const ws = new WebSocket(`ws://10.0.2.2:3000/cable?channel_id=${channelId1}`);
  //   //const ws = new WebSocket(`ws://localhost:3000/cable?channel_id=${channelId}`);

  //   ws.onopen = () => {
  //     console.log('Connected to WebRTC channel');
  //   };

  const startCall = async () => {
    const cable = ActionCable.createConsumer(`ws://10.0.2.2:3000/cable`);

    // Set up the Action Cable channel
    const channel = cable.subscriptions.create(
      {channel: 'WebRtcChannel', channel_id: '555'},
      {
        connected: async () => {
          console.log('Connected to Action Cable');

          // Set up the event handler for ICE candidates
          pc.current.onicecandidate = (event) => {
            if (event.candidate) {
              const iceData = {
                type: 'ice-candidate',
                candidate: event.candidate,
              };
              channel.send(iceData);
            }
          };
    

          try {
            // Create an offer
            // const offerDescription = await pc.current.createOffer();
            // await pc.current.setLocalDescription(offerDescription);

            // Send the offer to the remote peer using Action Cable
            //channel.perform('send_offer', { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            const offerData = {
              type: 'offer',
              sdp: offer.sdp,
            };
            channel.send(offerData);
            console.log(
              'State after sending offer:',
              pc.current.signalingState,
            );
          } catch (error) {
            console.error('Error during call setup:', error);
            // Handle error appropriately
          }
        },
        disconnected: () => {
          console.log('Disconnected from Action Cable');
          // Handle disconnection
        },
        received: data => {
          console.log("HEREE2");
          // Handle received data from Action Cable
          // if (data.answer) {
          //   const answerDescription = new RTCSessionDescription(data.answer);
          //   pc.current.setRemoteDescription(answerDescription);
          // } else if (data.candidate) {
          //   pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          // }

          if (data.offer) {
            console.log("have Offer");
            const offerDescription = new RTCSessionDescription(data.offer);
            
            pc.current.setRemoteDescription(offerDescription)
              .then(() => {
                // Now, create and send the answer
                const answer = pc.current.createAnswer();
                pc.current.setLocalDescription(answer);
                const answerData = {
                  type: 'answer',
                  sdp: answer.sdp,
                };
                channel.send(answerData);
              })
              .catch(error => {
                console.error('Error setting remote description:', error);
              });
          } else if (data.candidate) {
            pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        },
      },
    );
  };

  const joinCall = channelId => {
    const cable = ActionCable.createConsumer(`ws://10.0.2.2:3000/cable`);
    //console.log("HEREE");

    // Set up the Action Cable channel for an existing call
    const channel = cable.subscriptions.create(
      {channel: 'WebRtcChannel', room: '555'},
      {
        // connected: async () => {
        //   console.log('Connected to Action Cable for existing call');

        //   // Set up the event handler for ICE candidates
        //   pc.current.onicecandidate = async event => {
        //     if (event.candidate) {
        //       // Send ICE candidate to the remote peer using Action Cable
        //       channel.perform('send_ice_candidate', {
        //         candidate: event.candidate.toJSON(),
        //       });
        //     }
        //   };

        //   try {
        //     // Create an answer
        //     // const answerDescription = await pc.current.createAnswer();
        //     // await pc.current.setLocalDescription(answerDescription);

        //     // // Send the answer to the remote peer using Action Cable
        //     // channel.perform('send_answer', { answer: { sdp: answerDescription.sdp, type: answerDescription.type } });

        //     console.log(
        //       'State before:',
        //       pc.current.signalingState,
        //     );

        //     if (pc.current.signalingState === 'have-remote-offer') {
        //       const answerDescription = await pc.current.createAnswer();
        //       await pc.current.setLocalDescription(answerDescription);
        //       // Send the answer to the remote peer using Action Cable
        //       channel.perform('send_answer', {
        //         answer: {
        //           sdp: answerDescription.sdp,
        //           type: answerDescription.type,
        //         },
        //       });
        //     } else {
        //       console.error(
        //         'Invalid state for creating answer:',
        //         pc.current.signalingState,
        //       );
        //     }
        //   } catch (error) {
        //     console.error('Error during call setup:', error);
        //     // Handle error appropriately
        //   }
        // },
        disconnected: () => {
          console.log('Disconnected from Action Cable');
          // Handle disconnection
        },
        received: data => {
          // Handle received data from Action Cable
          console.log("received data");
          if (data.offer) {
            const offerDescription = new RTCSessionDescription(data.offer);
            pc.current.setRemoteDescription(offerDescription);
          } else if (data.candidate) {
            pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        },
      },
    );
  };

  // const joinCall = () => {
  //   const joinChannelId = '555';

  //   if (joinChannelId) {
  //     setChannelId(joinChannelId);

  //     // Create a new WebSocket instance
  //     //const channel = new WebSocket('ws://10.0.2.2:3000/cable');
  //     const cable = ActionCable.createConsumer(`ws://10.0.2.2:3000/cable`);
  //     //const channel = new WebSocket(`ws://localhost:3000/cable?channel_id=${channelId}`);
  //     //const channel = new WebSocket(`ws://10.0.2.2:3000/cable?channel_id=${channelId}`);

  //     const channel = cable.subscriptions.create(
  //       { channel: 'WebRtcChannel', channel_id: '555' },
  //       {
  //         connected() {
  //           console.log('Connected to Action Cable');
  //         },
  //         disconnected() {
  //           console.log('Disconnected from Action Cable');
  //         },
  //         received(data) {
  //           // Handle received data from the server
  //           console.log('Received data from Action Cable:', data);
  //         },
  //       }
  //     );

  //     // Event handler for when the WebSocket connection is opened
  //     // channel.onopen = () => {
  //     //   console.log('Connected to WebRTC channel');

  //     //   // Send a subscription request
  //     //   const subscriptionData = {
  //     //     command: 'subscribe',
  //     //     identifier: JSON.stringify({
  //     //       channel: 'WebRtcChannel',
  //     //       channel_id: joinChannelId,
  //     //     }),
  //     //   };
  //     //   channel.send(JSON.stringify(subscriptionData));
  //     // };

  //     // Event handler for when the WebSocket connection is closed
  //     channel.onmessage = async (event) => {
  //       const data = JSON.parse(event.data);

  //       if (data.offer) {
  //         try {
  //           // Set the remote offer
  //           await pc.current.setRemoteDescription(new RTCSessionDescription(data.offer));

  //           // Add tracks to the peer connection
  //           localStream.getTracks().forEach((track) => {
  //             pc.current.addTrack(track, localStream);
  //           });

  //           // Create and set local description (answer)
  //           const answer = await pc.current.createAnswer();
  //           await pc.current.setRemoteDescription(answer);

  //           // Send the answer to the other peer (via signaling server)
  //           channel.send(JSON.stringify({ answer: pc.current.localDescription }));
  //         } catch (error) {
  //           console.error('Error handling remote offer:', error);
  //         }
  //       } else if (data.candidate) {
  //         // Handle ICE candidates if needed
  //         try {
  //           await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
  //         } catch (error) {
  //           console.error('Error handling ICE candidate:', error);
  //         }
  //       }
  //     };

  //     // Set up the necessary event handlers for receiving data
  //     pc.current.onicecandidate = async (event) => {
  //       if (event.candidate) {
  //         // Send ICE candidate to the server
  //         const candidateData = {
  //           command: 'message',
  //           identifier: JSON.stringify({
  //             channel: 'WebRtcChannel',
  //             channel_id: joinChannelId,
  //           }),
  //           data: JSON.stringify({ candidate: event.candidate.toJSON() }),
  //         };
  //         channel.send(JSON.stringify(candidateData));
  //       }
  //     };

  //     // pc.current.createAnswer().then((answer) => {
  //     //   console.log('Answer created:', answer);
  //     //   return pc.current.setLocalDescription(answer);
  //     // }).then(() => {
  //     //   // Send the answer to the server...
  //     // });

  //     // pc.current.ontrack = (event) => {
  //     //   // Handle remote tracks
  //     //   const remoteStream = new MediaStream();
  //     //   event.streams[0].getTracks().forEach((track) => {
  //     //     remoteStream.addTrack(track);
  //     //   });
  //     //   setRemoteStream(remoteStream);
  //     // };

  //     pc.current.ontrack = (event) => {
  //       // Append remote tracks to the existing remoteStream
  //       console.log('Remote tracks received:', event.streams[0].getTracks());
  //       event.streams[0].getTracks().forEach((track) => {
  //         remoteStream.addTrack(track);
  //       });

  //       // Update the state with the modified remoteStream
  //       setRemoteStream(new MediaStream(remoteStream));
  //     };
  //   }
  // };

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
