import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AlertMessageState {
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: AlertMessageState = {
  successMessage: null,
  errorMessage: null,
};

const alertMessageSlice = createSlice({
  name: 'alertMessage',
  initialState,
  reducers: {
    setSuccessMessage(state, action: PayloadAction<string>) {
      state.successMessage = action.payload;
      state.errorMessage = null; // Clear error when showing success
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
      state.successMessage = null; // Clear success when showing error
    },
    clearAlertMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },
});

export const { setSuccessMessage, setErrorMessage, clearAlertMessages } = alertMessageSlice.actions;
export default alertMessageSlice.reducer;
