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
  async (params, {dispatch, rejectWithValue}) => {
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

export const appleLogin = createAsyncThunk(
  'auth/appleLogin',
  async (params, thunkApi) => {
    const user = params.user;
    return {user};
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

// Delete User
export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (params, thunkApi) => {
    console.log('DeleteUser params:', params);
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.deleteUser,
        params,
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkApi.rejectWithValue({
          message: 'Delete failed',
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        return thunkApi.rejectWithValue({
          message: 'Delete failed',
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

export const updateUserAddress = createAsyncThunk(
  'auth/updateUserAddress',
  async (params, thunkApi) => {
    try {
      const response = await axios.post(
        baseURL + apiEndpoints.updateCustomerAddress,
        params,
      );
      console.log('Update address response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkApi.rejectWithValue({
          message: 'Update address failed',
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        return thunkApi.rejectWithValue({
          message: 'Update address failed',
        });
      }
    }
  },
);

export const updateInterestedCategories = createAsyncThunk(
  'auth/updateInterestedCategories',
  async (params, thunkApi) => {
    try {
      console.log('in updating categories');
      const response = await axios.post(
        baseURL + apiEndpoints.updateUserInterestedCategories,
        params,
      );
      //console.log('Update interested categories response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkApi.rejectWithValue({
          message: 'Update interested categories  failed',
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        return thunkApi.rejectWithValue({
          message: 'Update interested categories  failed',
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

      const {stripeConnectedAccountId} = action.payload.user;
      state.userData.user.isOnboardingStarted = stripeConnectedAccountId
        ? true
        : false;
    });
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      state.isAuthenticated = false;
    });

    // Handle Apple login
    builder.addCase(appleLogin.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(appleLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.userData = action.payload;
      state.isAuthenticated = true;

      const {stripeConnectedAccountId} = action.payload.user;
      state.userData.user.isOnboardingStarted = stripeConnectedAccountId
        ? true
        : false;
    });
    builder.addCase(appleLogin.rejected, (state, action) => {
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
      //state.userData.user.localProfilePictureURI = null;
      try {
        // Clear profile picture URI from AsyncStorage
        AsyncStorage.removeItem('profilePicturePath');

        // Clear image cache
        clearImageCache();
      } catch (error) {
        console.error('Error during logout cleanup:', error);
      }
    });

    // Delete User cases
    builder.addCase(deleteUser.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(deleteUser.fulfilled, state => {
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
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
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

    // Update User Address cases
    builder.addCase(updateUserAddress.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateUserAddress.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;

      if (state.userData) {
        state.userData.user.address = action.payload.user.address;
      }
    });
    builder.addCase(updateUserAddress.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
    });

    //update Interested Categories
    builder.addCase(updateInterestedCategories.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateInterestedCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;

      console.log(
        'Setting interested Categories ',
        action.payload.user.interestedCategories,
      );

      if (
        action.payload &&
        action.payload.user &&
        action.payload.user.interestedCategories
      ) {
        state.userData.user.interestedCategories =
          action.payload.user.interestedCategories;
      } else {
        state.userData.user.interestedCategories = [];
      }
    });
    builder.addCase(updateInterestedCategories.rejected, (state, action) => {
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
