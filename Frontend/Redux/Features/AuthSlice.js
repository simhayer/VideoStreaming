import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { baseURL, apiEndpoints } from "../../Resources/Constants";
import axios from 'axios';

const initialState = {
    userData: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
};

//login 
export const login = createAsyncThunk('login', async (params, thunkApi) => {
    console.log("- file: AuthSlice.js:12 - login - params:", params);
    try {
        const response = await axios.post(baseURL + apiEndpoints.login, params);
        console.log("file: AuthSlice.js:16 - login - response:", response)
        return response.data;
    } catch (error) {
        console.log("file - AuthSlice.js:19 - login - error:", error);
        
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

const authSlice = createSlice({
    name: 'authSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) =>{
        //login cases
        builder.addCase(login.pending, (state) =>{
            state.isLoading = true;
        });
        builder.addCase(login.fulfilled,(state,action)=> {
            state.isLoading = false;
            state.isSuccess = true;
            state.userData = action.payload;
        });
        builder.addCase(login.rejected, (state,action) => {
            state.isLoading = false;
            state.isError = true;  //set action payload here to get error message
        })
    },
});

export default authSlice.reducer;