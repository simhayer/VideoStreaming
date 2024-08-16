import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
  RTCView,
} from '@videosdk.live/react-native-sdk';
import {SafeAreaView, TouchableOpacity, Text, View} from 'react-native';
import Video from 'react-native-video';

function ParticipantView({participantId}) {
  const {webcamStream, webcamOn} = useParticipant(participantId);
  console.log('webcamStream', webcamStream);
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

function SpeakerView() {
  const [joined, setJoined] = useState(null);
  //Get the method which will be used to join the meeting.
  //We will also get the participant list to display all participants
  const {participants} = useMeeting();
  console.log('participants', participants);
  const mMeeting = useMeeting({
    onMeetingJoined: () => {
      setJoined('JOINED');
      //we will pin the local participant if he joins in CONFERENCE mode
      if (mMeetingRef.current.localParticipant.mode == 'CONFERENCE') {
        mMeetingRef.current.localParticipant.pin();
      }
    },
  });
  //We will create a ref to meeting object so that when used inside the
  //Callback functions, meeting state is maintained
  const mMeetingRef = useRef(mMeeting);
  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);
  //Filtering the host/speakers from all the participants
  const speakers = useMemo(() => {
    const speakerParticipants = [...participants.values()].filter(
      participant => {
        return participant.mode == Constants.modes.CONFERENCE;
      },
    );
    return speakerParticipants;
  }, [participants]);
  return (
    <SafeAreaView style={{flex: 1}}>
      {joined && joined == 'JOINED' ? (
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

function ViewerView({}) {
  const {hlsState, hlsUrls} = useMeeting();
  console.log('hrsUrls ', hlsUrls);
  return (
    <SafeAreaView style={{flex: 1}}>
      {hlsState == 'HLS_PLAYABLE' ? (
        <>
          {/* Render VideoPlayer that will play downstreamUrl*/}
          <Video
            controls={true}
            source={{
              uri: hlsUrls.downstreamUrl,
            }}
            resizeMode={'stretch'}
            style={{
              flex: 1,
              backgroundColor: 'black',
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

const App = () => {
  const [mode, setMode] = useState(null);
  return mode ? (
    <MeetingProvider
      config={{
        meetingId: '61u1-b09b-uu4r',
        micEnabled: true,
        webcamEnabled: true,
        name: "Simrat's Org",
        mode, // 'CONFERENCE' || 'VIEWER'
      }}
      joinWithoutUserInteraction
      token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkYTIyODY0OS00YmM5LTQxYzctYmI3Yi1jZjA4Y2RlZjNhZmQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyMjk5ODg2NSwiZXhwIjoxNzIzMDg1MjY1fQ.85WdA-o_nmEhtRxKXkuMF3RYn1ko6KQKGNCQlThckwQ">
      {mode === 'CONFERENCE' ? <SpeakerView /> : <ViewerView />}
    </MeetingProvider>
  ) : (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity
        style={{borderWidth: 1, padding: 12, borderRadius: 10}}
        onPress={() => {
          setMode(Constants.modes.CONFERENCE);
        }}>
        <Text>Join as Speaker</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{marginTop: 12, borderWidth: 1, padding: 12, borderRadius: 10}}
        onPress={() => {
          setMode(Constants.modes.VIEWER);
        }}>
        <Text>Join as Viewer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default App;
