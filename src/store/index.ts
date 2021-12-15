import { configureStore, ThunkAction, Action, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from "redux-persist/lib/storage";

import tokensReducer from './slices/tokensSlice';
import cacheReducer from './slices/cacheSlice';
import settingsSlice from './slices/settingsSlice';
import responsesSlice from './slices/responsesSlice';

import config from 'config';


const rootReducer = combineReducers({
  tokens: tokensReducer,
  cache: cacheReducer,
  settings: settingsSlice,
  responses: responsesSlice
});

const persistConfig = {
  key: `new-obyte-donations${config.testnet ? "-testnet" : ""}`,
  version: 10,
  storage,
  whitelist: ["settings", "cache"],
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  })
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

