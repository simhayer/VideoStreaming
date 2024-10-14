import {combineReducers, configureStore} from '@reduxjs/toolkit';
import AuthSlice from './Features/AuthSlice';
import productsReducer from './Features/ProductsSlice';
import NonPersistSlice from './Features/NonPersistSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, persistStore} from 'redux-persist';

const reducers = combineReducers({
  auth: AuthSlice,
  NonPersistSlice: NonPersistSlice,
  products: productsReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleWare =>
    getDefaultMiddleWare({serializableCheck: false}),
});

const persistor = persistStore(store);
export {store, persistor};
