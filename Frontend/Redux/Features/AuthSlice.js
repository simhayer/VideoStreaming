import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {baseURL, apiEndpoints} from '../../Resources/Constants';
import axios from 'axios';

const initialState = {
  userData: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  isAuthenticated: false,
  errorMessage: '',
};

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

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {},
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
    });
    builder.addCase(login.rejected, (state, action) => {
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
    });

    // Update Username cases
    builder.addCase(updateUsername.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateUsername.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.userData = {
        ...state.userData,
        username: action.payload.user.username,
      };
    });
    builder.addCase(updateUsername.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload.message;
    });
  },
});

export default authSlice.reducer;
