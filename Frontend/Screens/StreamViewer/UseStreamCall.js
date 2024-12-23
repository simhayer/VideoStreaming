import {useEffect, useState} from 'react';

const useStreamCall = (myClient, callId, setStreamError) => {
  const [myCall, setMyCall] = useState(null);

  useEffect(() => {
    if (!myClient || !callId) return;

    console.log('Initializing call...');
    const call = myClient.call('livestream', callId);

    call
      .join({
        create: false,
        data: {
          settings_override: {
            audio: {
              mic_default_on: false,
              access_request_enabled: false,
              default_device: 'speaker',
            },
            video: {
              camera_default_on: false,
              access_request_enabled: false,
              target_resolution: {
                width: 1920,
                height: 1080,
                bitrate: 3000000,
              },
            },
          },
        },
      })
      .then(() => {
        console.log('Call joined successfully');
        setMyCall(call);
      })
      .catch(error => {
        setStreamError(true);
        console.error('Failed to join the call:', error);
      });

    return () => {
      call.leave().then(() => console.log('Call left successfully'));
    };
  }, [myClient, callId]);

  return myCall;
};

export default useStreamCall;
