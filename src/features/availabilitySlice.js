import { createSlice } from '@reduxjs/toolkit';

const availabilitySlice = createSlice({
  name: 'availability',
  initialState: [],
  reducers: {
    saveAvailability: (state, action) => {
      return action.payload;
    },
    resetAvailability: () => {
      return [];
    },
  },
});

export const { saveAvailability, resetAvailability } = availabilitySlice.actions;

export default availabilitySlice.reducer;
