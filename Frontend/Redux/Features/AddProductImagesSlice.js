import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  images: [null, null, null],
};

const addProductImagesSlice = createSlice({
  name: 'addProductImages',
  initialState,
  reducers: {
    setAddProductImage: (state, action) => {
      const {index, image} = action.payload;
      state.images[index] = image; // Update specific image by index
    },
    clearAddProductImages: () => initialState,
  },
});

export const {setAddProductImage, clearAddProductImages} =
  addProductImagesSlice.actions;
export default addProductImagesSlice.reducer;
