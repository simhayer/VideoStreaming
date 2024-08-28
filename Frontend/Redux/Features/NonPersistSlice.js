import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

const initialState = {
  isOnboardingChecked: false,
};

const NonPersistSlice = createSlice({
  name: 'NonPersistSlice',
  initialState,
  reducers: {
    setOnboardingChecked: state => {
      state.isOnboardingChecked = true;
    },
  },
});

export const {setOnboardingChecked} = NonPersistSlice.actions;
export default NonPersistSlice.reducer;
