import {createAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {baseURL, apiEndpoints} from '../../Resources/Constants';
import axios from 'axios';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {updateProfilePicture} from '../../../Backend/middleware/auth';

const initialState = {
  userData: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  isAuthenticated: false,
  errorMessage: '',
};

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (params, thunkApi) => {
    try {
      const user = params.user;
      if (user) {
        if (user.profilePicture) {
          const profilePictureFilename = user.profilePicture?.split('/').pop();
          const profilePictureURI = `${baseURL}/profilePicture/${profilePictureFilename}`;
          const imagePath = `${RNFS.DocumentDirectoryPath}/profile.jpg`;

          // Download profile picture
          await RNFS.downloadFile({
            fromUrl: profilePictureURI,
            toFile: imagePath,
          }).promise;

          // Store the local path in AsyncStorage
          await AsyncStorage.setItem('profilePicturePath', imagePath);
        }

        getAndSetLocalProfilePictureURI(dispatch);
        return {user};
      } else {
        return thunkApi.rejectWithValue({
          message: 'User data missing in response',
        });
      }
    } catch (error) {
      console.error('Google Login Failed:', error);
      return thunkApi.rejectWithValue({
        message: error.response?.data?.message || 'Google Login failed',
      });
    }
  },
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (params, {dispatch, rejectWithValue}) => {
    try {
      const response = await axios.post(baseURL + apiEndpoints.login, params);
      const user = response.data.user;

      // If the user has a profile picture, download and store it locally
      if (user.profilePicture) {
        const profilePictureFilename = user.profilePicture?.split('/').pop();
        const profilePictureURI = `${baseURL}/profilePicture/${profilePictureFilename}`;
        const imagePath = `${RNFS.DocumentDirectoryPath}/profile.jpg`;

        // Download profile picture
        await RNFS.downloadFile({
          fromUrl: profilePictureURI,
          toFile: imagePath,
        }).promise;

        // Store the local path in AsyncStorage
        await AsyncStorage.setItem('profilePicturePath', imagePath);
      }

      getAndSetLocalProfilePictureURI(dispatch);

      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkApi.rejectWithValue({
          message: 'Login failed',
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        return thunkApi.rejectWithValue({
          message: 'Login failed',
        });
      }
    }
  },
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (params, thunkApi) => {
    console.log('Logout params:', params);
    try {
      const response = await axios.post(baseURL + apiEndpoints.logout, params);
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkApi.rejectWithValue({
          message: 'Logout failed',
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        return thunkApi.rejectWithValue({
          message: 'Logout failed',
        });
      }
    }
  },
);

// Update Username
export const updateUsername = createAsyncThunk(
  'auth/updateUsername',
  async (params, thunkApi) => {
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.updateUsername,
        params,
      );
      console.log('Update username response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkApi.rejectWithValue({
          message: 'Update username failed',
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        return thunkApi.rejectWithValue({
          message: 'Update username failed',
        });
      }
    }
  },
);

export const uploadProfilePicture = createAsyncThunk(
  'auth/uploadProfilePicture',
  async (params, {dispatch, rejectWithValue}) => {
    const {email, uri} = params;
    const formData = new FormData();
    formData.append('profilePicture', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    formData.append('email', email);

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.updateProfilePicture,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const profilePicture = response.data.profilePicture;

      const imagePath = `${RNFS.DocumentDirectoryPath}/profile.jpg`;

      // Save the new profile picture locally
      await saveProfilePictureLocally(uri, imagePath);

      // Store the local path in AsyncStorage
      await AsyncStorage.setItem('profilePicturePath', imagePath);

      dispatch(setLocalProfilePictureURI(`file://${imagePath}`));

      return {profilePicture, uri: `file://${imagePath}`}; // Return both server URL and local URI
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: 'Update username failed',
        status: error.response ? error.response.status : null,
        data: error.response ? error.response.data : null,
      });
    }
  },
);

const saveProfilePictureLocally = async (sourceUri, destinationPath) => {
  try {
    const fileExists = await RNFS.exists(destinationPath);

    if (fileExists) {
      await RNFS.unlink(destinationPath);
    }
    await RNFS.copyFile(sourceUri, destinationPath);

    return destinationPath;
  } catch (error) {
    console.error('Failed to save profile picture:', error);
    throw error;
  }
};

// Define actions
export const setLocalProfilePictureURI = createAction(
  'auth/setLocalProfilePictureURI',
);

// Helper function to get and set local profile picture URI
const getAndSetLocalProfilePictureURI = async dispatch => {
  try {
    const path = await AsyncStorage.getItem('profilePicturePath');
    if (path) {
      dispatch(setLocalProfilePictureURI(`file://${path}`));
    }
  } catch (error) {
    console.error('Failed to get profile picture path:', error);
  }
};

const clearImageCache = async () => {
  try {
    const files = await RNFS.readDir(RNFS.DocumentDirectoryPath); // Get list of files
    await Promise.all(files.map(file => RNFS.unlink(file.path))); // Delete each file
    console.log('Image cache cleared.');
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    setOnboardingStarted: state => {
      if (state.userData) {
        state.userData.user.isOnboardingStarted = true;
      }
    },
    setIsSellerTrue: state => {
      if (state.userData) {
        state.userData.user.isSeller = true;
      }
    },
  },
  extraReducers: builder => {
    // Login cases
    builder.addCase(login.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.userData = action.payload;
      state.isAuthenticated = true;

      const {stripeConnectedAccountId} = action.payload.user;
      state.userData.user.isOnboardingStarted = stripeConnectedAccountId
        ? true
        : false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      state.isAuthenticated = false;
    });
    builder.addCase(setLocalProfilePictureURI, (state, action) => {
      if (state.userData?.user) {
        state.userData.user.localProfilePictureURI = action.payload;
      }
    });

    // Handle Google login
    builder.addCase(googleLogin.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(googleLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.userData = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      state.isAuthenticated = false;
    });

    // Logout cases
    builder.addCase(logout.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, state => {
      state.isLoading = false;
      state.isSuccess = true;
      state.userData = null;
      state.isAuthenticated = false;

      try {
        // Clear profile picture URI from AsyncStorage
        AsyncStorage.removeItem('profilePicturePath');

        // Clear image cache
        clearImageCache();
      } catch (error) {
        console.error('Error during logout cleanup:', error);
      }
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      state.userData = null;
      state.isAuthenticated = false;
      state.userData.user.localProfilePictureURI = null;
    });

    // Update Username cases
    builder.addCase(updateUsername.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateUsername.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;

      if (state.userData) {
        state.userData.user.username = action.payload.user.username;
      }
    });
    builder.addCase(updateUsername.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
    });

    // Update ProfilePicture cases
    builder.addCase(uploadProfilePicture.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(uploadProfilePicture.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      // Save the uploaded image URL and local URI in the state
      state.userData.user.profilePicture = action.payload.profilePicture;
      state.userData.user.profilePictureURI = action.payload.uri; // Save local URI here
    });
    builder.addCase(uploadProfilePicture.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
    });
  },
});

export const {setOnboardingStarted} = authSlice.actions;
export const {setIsSellerTrue} = authSlice.actions;
export default authSlice.reducer;
