import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isOnboardingChecked: false,
  apiKey: null, // Added apiKey to the initial state
};

const NonPersistSlice = createSlice({
  name: 'NonPersistSlice',
  initialState,
  reducers: {
    setOnboardingChecked: state => {
      state.isOnboardingChecked = true;
    },
    setApiKey: (state, action) => {
      state.apiKey = action.payload; // Action to set the API key
    },
  },
});

// Export actions
export const {setOnboardingChecked, setApiKey} = NonPersistSlice.actions;

// Export reducer
export default NonPersistSlice.reducer;
