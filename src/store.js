import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './features/meetingsSlice';
import availabilityReducer from './features/availabilitySlice';

export default configureStore({
  reducer: {
    meeting: meetingReducer,
    availability: availabilityReducer,
  },
});
