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
      const response = await axios.post(
        `${baseURL}${apiEndpoints.getAllOrdersForSellerGroupedByStatus}`,
        {sellerUsername: userUsername},
      );
      if (response.status === 200) {
        const orders = await Promise.all(
          response.data.orders.map(async statusGroup => {
            const updatedOrders = await Promise.all(
              statusGroup.orders.map(async order => {
                if (order.product && order.product.imageUrls[0]) {
                  const localImage = await saveImageLocally(
                    order.product.imageUrls[0],
                  );
                  order.product.localImagePath = `file://${localImage}`;
                }
                return order;
              }),
            );
            return {
              ...statusGroup,
              orders: updatedOrders,
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
    orders: [],
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
    markOrderCompleteAction(state, action) {
      const {orderId} = action.payload;

      let completedOrder;

      // Find and remove the order from its current status group
      state.orders.forEach(statusGroup => {
        const index = statusGroup.orders.findIndex(
          order => order._id === orderId,
        );
        if (index !== -1) {
          // Capture the order and update its status to complete
          completedOrder = {...statusGroup.orders[index], status: 'complete'};
          // Remove the order from its current group
          statusGroup.orders.splice(index, 1);
        }
      });

      // If the order was found, add it to the "Completed" group
      if (completedOrder) {
        const completedGroup = state.orders.find(
          group => group._id === 'Completed',
        );

        if (completedGroup) {
          // Add to existing "Completed" group
          completedGroup.orders.push(completedOrder);
        } else {
          // If "Completed" group does not exist, create it
          state.orders.push({
            _id: 'Completed',
            orders: [completedOrder],
          });
        }
      } else {
        console.log('Order not found in any group');
      }
    },
    markOrderShippedAction(state, action) {
      const {orderId, trackingNumber, shippingCompany, trackingLink} =
        action.payload;

      let shippedOrder = null;

      // Update groups
      state.orders = state.orders.map(group => {
        const orderIndex = group.orders.findIndex(
          order => order._id === orderId,
        );

        if (orderIndex !== -1) {
          shippedOrder = {
            ...group.orders[orderIndex],
            status: 'Shipped',
            trackingNumber,
            shippingCompany,
            trackingLink,
          };

          // Remove the order from the current group
          group.orders.splice(orderIndex, 1); // Mutate the draft directly
        }

        return group;
      });

      if (shippedOrder) {
        const shippedGroup = state.orders.find(
          group => group._id === 'Shipped',
        );

        if (shippedGroup) {
          shippedGroup.orders.push(shippedOrder); // Add directly
        } else {
          state.orders.push({
            _id: 'Shipped',
            orders: [shippedOrder],
          });
        }
      } else {
        console.error('Order not found in any group');
      }
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

export const {resetOrders, markOrderCompleteAction, markOrderShippedAction} =
  ordersSlice.actions;
export default ordersSlice.reducer;
