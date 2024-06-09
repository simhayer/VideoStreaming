import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Button } from 'react-native';
import io from 'socket.io-client';
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
    RTCView,
} from 'react-native-webrtc';

const socket = io('http://localhost:4000');

const App = () => {
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pc = useRef(new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    })).current;

    useEffect(() => {
        mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then((stream) => {
            setStream(stream);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        pc.onaddstream = (event) => {
            setRemoteStream(event.stream);
        };

        socket.on('offer', async (data) => {
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', answer);
        });

        socket.on('answer', async (data) => {
            await pc.setRemoteDescription(new RTCSessionDescription(data));
        });

        socket.on('candidate', async (data) => {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data));
            } catch (e) {
                console.error(e);
            }
        });
    }, []);

    const startCall = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', offer);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {stream && (
                    <RTCView
                        streamURL={stream.toURL()}
                        style={{ width: '100%', height: 200 }}
                    />
                )}
                {remoteStream && (
                    <RTCView
                        streamURL={remoteStream.toURL()}
                        style={{ width: '100%', height: 200 }}
                    />
                )}
                <Button title="Start Call" onPress={startCall} />
            </View>
        </SafeAreaView>
    );
};

export default App;
