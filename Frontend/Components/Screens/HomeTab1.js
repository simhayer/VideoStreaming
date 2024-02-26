// App.js
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button } from 'react-native';
import { RTCView, RTCPeerConnection, mediaDevices, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import ActionCable from 'react-native-actioncable';

const HomeTab1 = () => {
  const [remoteStream, setRemoteStream] = useState();
  const peerConnection = useRef();

  useEffect(() => {
    const initializeWebRTC = async () => {
      // Get user media
      const stream = await mediaDevices.getUserMedia({ audio: true, video: true });

      // Display local stream if needed
      // setLocalStream(stream);

      // Initialize RTCPeerConnection
      const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      peerConnection.current = new RTCPeerConnection(config);

      // Add local stream to the connection
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      // Event listener for remote stream
      peerConnection.current.onaddstream = (event) => {
        setRemoteStream(event.stream);
      };

      // Event listener for ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          const iceData = {
            type: 'ice-candidate',
            candidate: event.candidate,
          };
          videoChannel.send(iceData);
        }
      };

      // Implement SDP negotiation

      // Create and send offer
      if(peerConnection.current.signalingState !== 'stable'){
        const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      const offerData = {
        type: 'offer',
        sdp: offer.sdp,
      };
      videoChannel.send(offerData);
      }
      
    };

    // Set up ActionCable
    const cable = ActionCable.createConsumer('ws://10.0.2.2:3000/cable');
    const videoChannel = cable.subscriptions.create('WebRtcChannel', {
      received: async (data) => {
        if (data.type === 'offer' || data.type === 'answer') {
          const remoteDescription = new RTCSessionDescription({ sdp: data.sdp, type: data.type });
          await peerConnection.current.setRemoteDescription(remoteDescription);

          if (data.type === 'offer') {
            // Create and send answer
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            const answerData = {
              type: 'answer',
              sdp: answer.sdp,
            };
            videoChannel.send(answerData);
          }
        } else if (data.type === 'ice-candidate') {
          // Add remote ICE candidate
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      },
    });

    initializeWebRTC();

    return () => {
      // Cleanup resources when component unmounts
      // Close the peer connection, remove event listeners, etc.
    };
  }, []);

  return (
    <View>
      {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={{ flex: 1 }} />}
      <Text>Your video call app</Text>
    </View>
  );
};

export default HomeTab1;
