import { configureStore } from '@reduxjs/toolkit';
import existingLeaseReducer from './slices/existingLeaseSlice';

export const store = configureStore({
  reducer: {
    existingLease: existingLeaseReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
