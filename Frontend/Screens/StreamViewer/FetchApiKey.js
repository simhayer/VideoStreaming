import axios from 'axios';
import {apiEndpoints, baseURL} from '../../Resources/Constants';
import {setApiKey} from '../../Redux/Features/NonPersistSlice';

const fetchApiKey = async dispatch => {
  try {
    const response = await axios.get(baseURL + apiEndpoints.getStreamApiKey);
    dispatch(setApiKey(response.data.apiKey)); // Save API key to Redux
  } catch (error) {
    console.error('Error fetching API key:', error);
  }
};

export default fetchApiKey;
