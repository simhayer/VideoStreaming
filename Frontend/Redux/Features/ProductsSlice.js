import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {baseURL, apiEndpoints} from '../../Resources/Constants';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveImageLocally = async imageUrl => {
  try {
    const filename = imageUrl.split('/').pop(); // Extract filename
    const localPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

    const imageExists = await RNFS.exists(localPath);
    if (!imageExists) {
      const response = await RNFS.downloadFile({
        fromUrl: `${baseURL}/${imageUrl}`,
        toFile: localPath,
      }).promise;
    }
    return localPath;
  } catch (error) {
    console.error('Failed to download image:', error);
    throw error;
  }
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (email, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${baseURL}${apiEndpoints.getUserProducts}`,
        {email},
      );
      if (response.status === 200) {
        const products = await Promise.all(
          response.data.products.map(async product => {
            if (!product.imageUrl) return product; // Skip if no image URL
            const localImage = await saveImageLocally(product.imageUrl);
            const localImagePath = `file://${localImage}`;
            return {...product, localImagePath}; // Add local path to product
          }),
        );

        return products;
      } else {
        return rejectWithValue('Failed to fetch products');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Thunk to add a product
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${baseURL}${apiEndpoints.addProductToUser}`,
        productData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      const product = response.data.product;
      const localImage = await saveImageLocally(product.imageUrl);
      const localImagePath = `file://${localImage}`;

      return {...product, localImagePath};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteProducts = createAsyncThunk(
  'products/deleteProducts',
  async ({email, products}, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${baseURL}${apiEndpoints.removeProductsFromUser}`,
        {email, products},
      );

      if (response.status === 200) {
        console.log('Products removed successfully:', response.data);
        return products; // Return the list of deleted product IDs
      } else {
        return rejectWithValue('Failed to remove products');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    reduxLoading: false,
    error: null,
  },
  reducers: {
    // Optional: Reset products if needed
    resetProducts(state) {
      state.items = [];
      state.error = null;
      state.loading = false;
      state.reduxLoading = false;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchProducts.pending, state => {
      state.loading = true;
      state.reduxLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.reduxLoading = false;
      state.items = action.payload || [];
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.reduxLoading = false;
      state.error = action.payload;
    });
    builder.addCase(addProduct.pending, state => {
      state.loading = true;
    });
    builder.addCase(addProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.items.push(action.payload); // Add new product to the list
    });
    builder.addCase(addProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(deleteProducts.pending, state => {
      state.loading = true;
      state.reduxLoading = true;
    });
    builder.addCase(deleteProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.reduxLoading = false;
      // Filter out the deleted products
      state.items = state.items.filter(
        item => !action.payload.includes(item._id),
      );
    });
    builder.addCase(deleteProducts.rejected, (state, action) => {
      state.loading = false;
      state.reduxLoading = false;
      state.error = action.payload;
    });
  },
});

export const {resetProducts} = productsSlice.actions;
export default productsSlice.reducer;
