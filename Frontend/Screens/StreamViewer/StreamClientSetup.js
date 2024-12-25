import {StreamVideoClient} from '@stream-io/video-react-native-sdk';
import {useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import axios from 'axios';
import {apiEndpoints, baseURL} from '../../Resources/Constants';

export const useStreamClient = () => {
  const {userData} = useSelector(state => state.auth);

  const userUsername = userData?.user?.username;

  const apiKey = useSelector(state => state.NonPersistSlice.apiKey); // Access API Key
  const [client, setClient] = useState(null);

  const createStreamUserForAdmin = async () => {
    const payload = {
      username: userUsername,
    };

    console.log('Stream creating for adming');

    const response = await axios.post(
      baseURL + apiEndpoints.createStreamUserForAdmin,
      payload,
    );
    console.log('Stream user created for admin:', response.data);
    const {token, apiKey} = response.data;

    const user = {
      id: userUsername, // Ensure userId is defined somewhere
      name: userUsername,
    };

    const client = StreamVideoClient.getOrCreateInstance({
      apiKey: apiKey,
      user,
      token,
    });

    return client;
  };

  useEffect(() => {
    const initClient = async () => {
      console.log('here');
      if (!apiKey) return; // Wait for API key

      try {
        console.log('here1');
        if (userData.user.isAdmin) {
          const adminClient = await createStreamUserForAdmin();
          setClient(adminClient);
          //setClient(createStreamUserForAdmin());
          return;
        }

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
