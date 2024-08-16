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

const App = ({route}) => {
  // const {
  //     streamId,
  //     broadcastId,
  //     username,
  //     watchers,
  //     profilePictureURL,
  //     comments,
  //   } = route.params;
  console.log('route', route.params);
  const meetingId = route.params.meetingId;
  console.log(meetingId);

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
      <ViewerView />
    </MeetingProvider>
  );
};

export default App;
