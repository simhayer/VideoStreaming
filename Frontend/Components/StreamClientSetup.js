import {StreamVideoClient} from '@stream-io/video-react-native-sdk';
import {useSelector} from 'react-redux';
import {useEffect, useState} from 'react';

export const useStreamClient = () => {
  const apiKey = useSelector(state => state.NonPersistSlice.apiKey); // Access API Key
  const [client, setClient] = useState(null);

  useEffect(() => {
    const initClient = async () => {
      if (!apiKey) return; // Wait for API key

      try {
        const user = {type: 'anonymous'}; // Anonymous user
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user,
        });

        setClient(streamClient); // Store client
      } catch (error) {
        console.error('Error initializing Stream Video Client:', error);
      }
    };

    initClient();

    return () => {
      if (client) {
        client.disconnectUser(); // Disconnect user
      }
    };
  }, [apiKey]); // Dependency added for apiKey change

  return client; // Return client instance
};
