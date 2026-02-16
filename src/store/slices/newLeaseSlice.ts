import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface NewLeaseState {
  createdLeaseId: string | null;
}

const initialState: NewLeaseState = {
  createdLeaseId: null,
};

const newLeaseSlice = createSlice({
  name: 'newLease',
  initialState,
  reducers: {
    setCreatedLeaseId(state, action: PayloadAction<string>) {
      console.log("new lease slice - setting created lease ID", action.payload);
      state.createdLeaseId = action.payload;
    },
    clearCreatedLeaseId(state) {
      state.createdLeaseId = null;
    },
  },
});

export const { setCreatedLeaseId, clearCreatedLeaseId } = newLeaseSlice.actions;

export default newLeaseSlice.reducer;
