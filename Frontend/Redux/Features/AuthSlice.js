import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {baseURL, apiEndpoints} from '../../Resources/Constants';
import axios from 'axios';

const initialState = {
  userData: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  isAuthenticated: false,
};

//login
export const login = createAsyncThunk('login', async (params, thunkApi) => {
  console.log('- file: AuthSlice.js:12 - login - params:', params);
  try {
    const response = await axios.post(baseURL + apiEndpoints.login, params);
    console.log('file: AuthSlice.js:16 - login - response:', response);
    return response.data;
  } catch (error) {
    console.log('file - AuthSlice.js:19 - login - error:', error);

    // Modify the rejection value to be serializable
    if (error.response) {
      // If it's an AxiosError, include only necessary information
      return thunkApi.rejectWithValue({
        message: 'Login failed',
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      // For non-Axios errors, include a simple error message
      return thunkApi.rejectWithValue({
        message: 'Login failed',
      });
    }
  }
});

//logout
export const logout = createAsyncThunk('logout', async (params, thunkApi) => {
  console.log('- file: AuthSlice.js:12 - logout - params:', params);
  try {
    const response = await axios.post(baseURL + apiEndpoints.logout, params);
    console.log('file: AuthSlice.js:16 - logout - response:', response);
    return response.data;
  } catch (error) {
    console.log('file - AuthSlice.js:19 - logout - error:', error);

    // Modify the rejection value to be serializable
    if (error.response) {
      // If it's an AxiosError, include only necessary information
      return thunkApi.rejectWithValue({
        message: 'Logout failed',
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      // For non-Axios errors, include a simple error message
      return thunkApi.rejectWithValue({
        message: 'Logout failed',
      });
    }
  }
});

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    //login cases
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
      state.isError = true; //set action payload here to get error message
      state.isAuthenticated = false;
    });

    //logout cases
    builder.addCase(logout.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      //state.userData = action.payload;
      state.userData = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true; //set action payload here to get error message
    });
  },
});

export default authSlice.reducer;
