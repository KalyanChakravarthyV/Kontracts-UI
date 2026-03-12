import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export type ExistingLease = {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  classification?: 'finance' | 'operating';
  // allow any additional API fields
  [key: string]: unknown;
};

type ExistingLeaseState = {
  leaseData: ExistingLease | null;
};

const initialState: ExistingLeaseState = {
  leaseData: null,
};

const existingLeaseSlice = createSlice({
  name: 'existingLease',
  initialState,
  reducers: {
    setExistingLease(
      state,
      action: PayloadAction<ExistingLease>
    ) {
      console.log("existing lease slice", action.payload)
      state.leaseData = action.payload;
    },
    clearExistingLease(state) {
      state.leaseData = null;
    },
  },
});

export const { setExistingLease, clearExistingLease } =
  existingLeaseSlice.actions;

export default existingLeaseSlice.reducer;
