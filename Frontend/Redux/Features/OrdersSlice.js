import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {baseURL, apiEndpoints} from '../../Resources/Constants';
import RNFS from 'react-native-fs';

const saveImageLocally = async imageUrl => {
  try {
    const filename = imageUrl.split('/').pop();
    const localPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

    const imageExists = await RNFS.exists(localPath);
    if (!imageExists) {
      await RNFS.downloadFile({
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

export const fetchOrdersSeller = createAsyncThunk(
  'orders/fetchOrdersSeller',
  async (userUsername, {rejectWithValue}) => {
    try {
      console.log('Fetching orders for seller:', userUsername);
      const response = await axios.post(
        `${baseURL}${apiEndpoints.getAllOrdersForSellerGroupedByStatus}`,
        {sellerUsername: userUsername},
      );
      if (response.status === 200) {
        // Map over orders grouped by status
        const orders = await Promise.all(
          response.data.orders.map(async statusGroup => {
            // Map each order within the grouped status
            const updatedOrders = await Promise.all(
              statusGroup.orders.map(async order => {
                if (order.product && order.product.imageUrl) {
                  const localImage = await saveImageLocally(
                    order.product.imageUrl,
                  );
                  order.product.localImagePath = `file://${localImage}`;
                }
                return order;
              }),
            );
            return {
              ...statusGroup,
              orders: updatedOrders, // Assign updated orders with local image paths
            };
          }),
        );
        return orders;
      } else {
        return rejectWithValue('Failed to fetch orders');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [], // Updated to orders for clarity
    loading: false,
    reduxLoading: false,
    needSellerUpdate: true,
    error: null,
  },
  reducers: {
    resetOrders(state) {
      state.orders = [];
      state.error = null;
      state.loading = false;
      state.reduxLoading = false;
      state.needSellerUpdate = true;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchOrdersSeller.pending, state => {
      state.loading = true;
      state.reduxLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrdersSeller.fulfilled, (state, action) => {
      state.loading = false;
      state.reduxLoading = false;
      state.orders = action.payload || [];
    });
    builder.addCase(fetchOrdersSeller.rejected, (state, action) => {
      state.loading = false;
      state.reduxLoading = false;
      state.error = action.payload;
    });
  },
});

export const {resetOrders} = ordersSlice.actions; // Fixed typo from productsSlice to ordersSlice
export default ordersSlice.reducer;
