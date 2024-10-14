import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {baseURL, apiEndpoints} from '../../Resources/Constants';
import axios from 'axios';
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
      console.log('Google login params:', params);
      const user = params.user;
      console.log('User:', user);
      if (user) {
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
  async (params, thunkApi) => {
    try {
      const response = await axios.post(baseURL + apiEndpoints.login, params);
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
  async (params, thunkApi) => {
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
      return {profilePicture: response.data.profilePicture, uri}; // Return both server URL and local URI
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: 'Update username failed',
        status: error.response ? error.response.status : null,
        data: error.response ? error.response.data : null,
      });
    }
  },
);

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
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
      state.userData = null;
      state.isAuthenticated = false;
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
