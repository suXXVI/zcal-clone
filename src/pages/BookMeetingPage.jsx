import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createGuestMeeting, fetchGuestMeeting, fetchMeetingById } from "../features/meetingsSlice";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "../components/AuthProvider";
import Button from '@mui/material/Button';
import { DateTimePicker, StaticDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { TextField } from "@mui/material";



export default function BookMeetingPage() {
    const { meetingId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const meeting = useSelector(state => state.meeting.meeting);
    const {currentUser} = useContext(AuthContext);
    const [submitting, setSubmitting] = useState(false); // Add this state to track submission status
    const guestMeeting = useSelector(state => state.meeting.guestMeeting)
    const [formSubmitted, setFormSubmitted] = useState(false);

    console.log(meeting)
    console.log(guestMeeting)

    // Dispatch fetchGuestMeeting when the component mounts
    useEffect(() => {
        dispatch(fetchGuestMeeting(meetingId));
    }, [dispatch, meetingId]);

    useEffect(() => {
        dispatch(fetchMeetingById(meetingId));
      }, [dispatch, meetingId]);

    const [allowedDates, setAllowedDates] = useState([]);
    const [allowedTimeSlots, setAllowedTimeSlots] = useState({});

    const [value, setValue] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
      if (meeting && meeting.availability && guestMeeting) {
        const dates = [];
        const timeSlots = {};
  
        meeting.availability.forEach((avail) => {
          const date = dayjs(avail.date).format('YYYY-MM-DD');
          const startTime = dayjs(avail.start_time, 'HH:mm:ss');
          const endTime = dayjs(avail.end_time, 'HH:mm:ss');
  
          // Exclude dates and times that were already booked
          if (guestMeeting.some(gm => gm.booked_date === date)) {
            return;
          }
  
          if (!dates.includes(date)) {
            dates.push(date);
          }
  
          if (!timeSlots[date]) {
            timeSlots[date] = [];
          }
  
          for (let time = startTime; time.isBefore(endTime); time = time.add(meeting.event_duration, 'minutes')) {
            const formattedTime = time.format('HH:mm');
            if (!guestMeeting.some(gm => gm.booked_date === date && gm.booked_time === formattedTime)) {
              timeSlots[date].push(formattedTime);
            }
          }
        });
  
        setAllowedDates(dates);
        setAllowedTimeSlots(timeSlots);
      }
    }, [meeting, guestMeeting]);
    
    
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!value) {
        alert('Please select a date and time.');
        return;
      }
  
      const bookedDate = dayjs(value).format('YYYY-MM-DD');
      const bookedTime = dayjs(value).format('HH:mm:ss');
  
      const guestMeetingData = {
        meetingId,
        name,
        email,
        booked_date: bookedDate,
        booked_time: bookedTime,
      };
  
      setSubmitting(true); // Set submitting to true to disable the button and change the text
  
      try {
        await dispatch(createGuestMeeting({ guestMeetingData })); // Dispatch the action
        alert("Booked successfully! Email sending feature coming soon!")
        setFormSubmitted(true)
      } catch (error) {
        console.error(error);
        // Handle the error as needed
      } finally {
        setSubmitting(false); // Set submitting to false to re-enable the button
      }
    };

    const shouldDisableDate = (date) => {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      return !allowedDates.includes(formattedDate);
    };
  
  
    const shouldDisableTime = (value, view) => {
      if (!value) return true; // Disable time if value is not defined
    
      const dateStr = dayjs(value).format('YYYY-MM-DD');
      const timeSlots = allowedTimeSlots[dateStr];
      if (!timeSlots) return true;
    
      if (view === 'hours') {
        const hour = dayjs(value).hour();
        const disableHour = !timeSlots.some(slot => parseInt(slot.split(':')[0]) === hour);
        return disableHour;
      }
    
      if (view === 'minutes') {
        const minutes = dayjs(value).minute();
        const disableMinutes = minutes % meeting.event_duration !== 0;
        return disableMinutes;
      }
    
      return false;
    };
    
    return (
      <>
      <style>
        {`
          body {
            background-color: #ececec;
          }
          .MuiDialogActions-root{
            display: none;
          }
        `}
      </style>
          {(meeting.length === 0)? (
            <Spinner animation="border" variant="primary" />
          ): (
            <form onSubmit={handleSubmit}>
              <div className="container d-flex justify-content-center align-items-center min-vh-100" style={{maxWidth: '1200px'}}>
                <div className="row border p-3 bg-white shadow rounded-5 w-100">
                  <div className="profile col-12 col-md-4 col-xl-5 p-3 border">
                    <img src="https://firebasestorage.googleapis.com/v0/b/mentor-mentee-booking-system.appspot.com/o/meetings%2Frexlogo.PNG?alt=media&token=e7a3e13f-6ce0-48b5-8735-e58ce8e1abad" alt="rexlogo" className="img-fluid" style={{width: '70px'}}/>
                    <div className="mt-3">
                      <h1 className="fs-4">Career Coaching 30 mins</h1>
                      <div className="mt-4">
                        <div className="d-flex">
                          <i className="bi bi-clock me-2"></i>
                          <p className="text-muted mb-2">{meeting.event_duration} {meeting.event_duration>60? 'hour': 'minutes'}</p>
                        </div>
                        <div className="d-flex">
                          <i className="bi bi-geo-alt me-2"></i>
                          <p className="text-muted mb-2">{meeting.location}</p>
                        </div>
                        <div className="d-flex">
                          <i className="bi bi-link-45deg me-2"></i>
                          <p className="text-muted mb-2">{meeting.custom_url}</p>
                        </div>
                      </div>
                      <hr></hr>
                      <p>{meeting.description}</p>
                    </div>
                  </div>

                  <div className="booking col-md-8 col-xl-7 bg-white p-3">
                      <h3 className="mb-3">Book your meeting</h3>
                      <TextField
                        label="Name"
                        variant="outlined"
                        className="mb-3"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <StaticDateTimePicker
                        label="Select Date and Time"
                        value={value}
                        onChange={(newValue) => setValue(newValue)}
                        shouldDisableDate={shouldDisableDate}
                        shouldDisableTime={shouldDisableTime}
                      />
                      <div className="d-flex justify-content-end">
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={submitting} 
                        >
                          {submitting ? 'Submitting...' : 'Submit'} 
                        </Button>
                      </div>
                  </div>
                </div>
              </div>
            </form>
          )}
      </>
    );
}


 