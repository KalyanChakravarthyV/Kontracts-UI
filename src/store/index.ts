import { configureStore } from '@reduxjs/toolkit';
import existingLeaseReducer from './slices/existingLeaseSlice';
import newLeaseReducer from './slices/newLeaseSlice';
import alertMessageReducer from './slices/alertMessageSlice';

export const store = configureStore({
  reducer: {
    existingLease: existingLeaseReducer,
    newLease: newLeaseReducer,
    alertMessage: alertMessageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
