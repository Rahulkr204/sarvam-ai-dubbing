import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './videoSlice';

const store = configureStore({
  reducer: {
    video: videoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;