import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
  RTCView,
} from '@videosdk.live/react-native-sdk';
import {SafeAreaView, TouchableOpacity, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {baseURL, apiEndpoints, token} from '../Resources/Constants';
import io from 'socket.io-client';
import axios from 'axios';

// API call to create meeting
export const createMeeting = async ({token}) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: 'POST',
    headers: {
      authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const {roomId} = await res.json();
  return roomId;
};

function ParticipantView({participantId}) {
  const {webcamStream, webcamOn} = useParticipant(participantId);
  return webcamOn && webcamStream ? (
    <RTCView
      streamURL={new MediaStream([webcamStream.track]).toURL()}
      objectFit={'cover'}
      style={{
        height: 300,
        marginVertical: 8,
        marginHorizontal: 8,
      }}
    />
  ) : (
    <View
      style={{
        backgroundColor: 'grey',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{fontSize: 16}}>NO MEDIA</Text>
    </View>
  );
}

function Controls() {
  const {hlsState, startHls, stopHls} = useMeeting();
  const _handleHLS = () => {
    if (!hlsState || hlsState === 'HLS_STOPPED') {
      startHls({
        layout: {
          type: 'SPOTLIGHT',
          priority: 'PIN',
          gridSize: 4,
        },
        theme: 'DARK',
        orientation: 'landscape',
      });
    } else if (hlsState === 'HLS_STARTED' || hlsState === 'HLS_PLAYABLE') {
      stopHls();
    }
  };

  useEffect(() => {
    _handleHLS();
  }, []);

  return (
    <>
      {hlsState === 'HLS_STARTED' ||
      hlsState === 'HLS_STOPPING' ||
      hlsState === 'HLS_STARTING' ||
      hlsState === 'HLS_PLAYABLE' ? (
        <TouchableOpacity
          style={{
            width: 100,
            padding: 10,
            borderRadius: 8,
            backgroundColor: '#FF5D5D',
          }}
          onPress={() => {
            _handleHLS();
          }}>
          <Text>
            {hlsState === 'HLS_STARTED'
              ? 'Live Starting'
              : hlsState === 'HLS_STOPPING'
              ? 'Live Stopping'
              : hlsState === 'HLS_PLAYABLE'
              ? 'Stop Live'
              : 'Loading...'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            width: 100,
            padding: 10,
            borderRadius: 8,
            backgroundColor: '#FF5D5D',
          }}
          onPress={() => {
            _handleHLS();
          }}>
          <Text>Go Live</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

function SpeakerView({socketId, username, profilePicture, title, meetingId}) {
  const [joined, setJoined] = useState(null);
  const {participants} = useMeeting();
  const mMeeting = useMeeting({
    onMeetingJoined: () => {
      setJoined('JOINED');
      if (mMeetingRef.current?.localParticipant?.mode === 'CONFERENCE') {
        mMeetingRef.current.localParticipant.pin();
      }
    },
  });

  const mMeetingRef = useRef(mMeeting);
  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const speakers = useMemo(() => {
    const speakerParticipants = [...participants.values()].filter(
      participant => {
        return participant.mode === Constants.modes.CONFERENCE;
      },
    );
    return speakerParticipants;
  }, [participants]);

  useEffect(() => {
    if (joined) {
      const payload = {
        sdp: null,
        socket_id: socketId,
        username: username,
        profilePicture: profilePicture,
        title: title || 'Untitled',
        meetingId: meetingId,
      };

      axios
        .post(baseURL + apiEndpoints.addBroadcast, payload)
        .then(response => {
          console.log('Broadcast added:', response.data);
        })
        .catch(error => {
          console.error('Error adding broadcast:', error);
        });
    }
  }, [joined]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {joined && joined === 'JOINED' ? (
        <>
          <Controls />
          {speakers.map(participant => (
            <ParticipantView
              participantId={participant.id}
              key={participant.id}
            />
          ))}
        </>
      ) : (
        <Text>Joining the meeting...</Text>
      )}
    </SafeAreaView>
  );
}

const App = ({route}) => {
  const {title} = route.params;
  const [meetingId, setMeetingId] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const socket = useRef(null);
  const {userData} = useSelector(state => state.auth);

  const email = userData?.user?.email;
  const fullname = userData?.user?.fullname;
  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;

  useEffect(() => {
    const initializeMeeting = async () => {
      if (!meetingId) {
        const newMeetingId = await createMeeting({token});
        setMeetingId(newMeetingId);
      }
    };

    initializeMeeting();
  }, []); // empty dependency array to run only once

  useEffect(() => {
    socket.current = io(baseURL, {
      transports: ['websocket'],
    });

    socket.current.on('connect', () => {
      setSocketId(socket.current.id);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return meetingId ? (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Simrat's Org",
        mode: Constants.modes.CONFERENCE, // 'CONFERENCE' || 'VIEWER'
      }}
      joinWithoutUserInteraction
      token={token}>
      <SpeakerView
        socketId={socketId}
        username={username}
        profilePicture={profilePicture}
        title="Your Broadcast Title"
        meetingId={meetingId}
      />
    </MeetingProvider>
  ) : (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Loading...</Text>
    </SafeAreaView>
  );
};

export default App;
