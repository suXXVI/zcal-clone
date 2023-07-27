// meetingSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

//Async thunk to send both 'meetings' and 'availability' data to backend
export const postMeetingData = createAsyncThunk(
    'meeting/postMeetingData',
    async (meetingData, thunkAPI) => {
        console.log(meetingData)
        try {
        let imageURL = "";

        if (meetingData.meeting.cover_photo) {
            const imageRef = ref(storage, `meetings/${meetingData.meeting.cover_photo.name}`);
            const response = await uploadBytes(imageRef, meetingData.meeting.cover_photo);
            imageURL = await getDownloadURL(response.ref);
        }
        
        console.log(meetingData)
        const response = await axios.post('https://capstone-project-api.chungmangjie200.repl.co/meetings', {
            ...meetingData,
            meeting: {
            ...meetingData.meeting,
            cover_photo: imageURL,
            },
            availability: meetingData.availability.map(slot => ({
            ...slot,
            start_time: slot.start_time || '00:00', // Ensure start_time is a valid time value
            end_time: slot.end_time || '00:00', // Ensure end_time is a valid time value
            })),
        });

        // Remove the File object from the state
        thunkAPI.dispatch(saveMeeting({ ...meetingData.meeting, cover_photo: imageURL }));

        return response.data;
        } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

//Async thunk to fetch meeting ID
export const fetchMeetingById = createAsyncThunk(
    'meetings/fetchMeetingById',
    async(meetingId) => {
        const response = await axios.get(`https://capstone-project-api.chungmangjie200.repl.co/api/meetings/${meetingId}`);
        console.log(response)
        return response.data
    }
)


  


//Synchronous 
const meetingSlice = createSlice({
  name: 'meeting',
  initialState: {
    meeting: {
      meeting_name: '',
      location: 'zoom',
      description: '',
      custom_url: '',
      cover_photo: '',
      event_duration: '30',
      time_slot_increment: '30',
      date_range: '7'
    },
    loading: true, // add loading to track request status
  },
  reducers: {
    saveMeeting: (state, action) => {
      state.meeting = action.payload;
    },
    resetMeeting: (state) => {
      state.meeting = {
        meeting_name: '',
        location: '',
        description: '',
        custom_url: '',
        cover_photo: '',
        event_duration: '',
        time_slot_increment: '',
        date_range: ''
      };
    },
  },
  //Asynchronous
  extraReducers: (builder) => {
    builder
      .addCase(postMeetingData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any other state changes you need on success
      })
      .addCase(fetchMeetingById.fulfilled, (state,action) => {
        state.loading = false;
        state.meeting = action.payload;
      })
  }
});

export const { saveMeeting, resetMeeting } = meetingSlice.actions;

export default meetingSlice.reducer;
