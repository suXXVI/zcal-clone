import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createGuestMeeting, fetchGuestMeeting, fetchMeetingById } from "../features/meetingsSlice";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "../components/AuthProvider";
import Button from '@mui/material/Button';
import { DatePicker, DateTimePicker, StaticDateTimePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Chip, InputBase, Paper, TextField } from "@mui/material";



export default function BookMeetingPage() {
    const { meetingId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const meeting = useSelector(state => state.meeting.meeting);
    const {currentUser} = useContext(AuthContext);
    const [submitting, setSubmitting] = useState(false); // Add this state to track submission status
    const guestMeeting = useSelector(state => state.meeting.guestMeeting)
    const [formSubmitted, setFormSubmitted] = useState(false);

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
        console.log('Guest Meeting Data:', guestMeeting);
        const dates = [];
        const timeSlots = {};
    
        meeting.availability.forEach((avail) => {
          const date = dayjs(avail.date).format('YYYY-MM-DD');
          const startTime = dayjs(avail.start_time, 'HH:mm:ss');
          const endTime = dayjs(avail.end_time, 'HH:mm:ss');
    
          if (!dates.includes(date)) {
            dates.push(date);
          }
    
          if (!timeSlots[date]) {
            timeSlots[date] = [];
          }
    
          for (let time = startTime; time.isBefore(endTime); time = time.add(meeting.event_duration, 'minutes')) {
            const formattedTime = time.format('HH:mm');
            timeSlots[date].push(formattedTime);
          }
    
          // Filter out booked time slots for this date
          const bookedTimes = guestMeeting
            .filter(gm => dayjs(gm.booked_date).format('YYYY-MM-DD') === date)
            .map(gm => gm.booked_time.slice(0, 5)); // Extracting 'HH:mm' part
            console.log('Booked Times for date', date, ':', bookedTimes);
          
            // Before filtering
            console.log('Time Slots before filtering for date', date, ':', timeSlots[date]);

            timeSlots[date] = timeSlots[date].filter(time => !bookedTimes.includes(time));

            // After filtering
            console.log('Time Slots after filtering for date', date, ':', timeSlots[date]);

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
      console.log(value);
      const bookedDate = dayjs(value).format('YYYY-MM-DD');
      const bookedTime = dayjs(value).format('HH:mm:ss');
    
      const guestMeetingData = {
        meetingId,
        name,
        email,
        booked_date: bookedDate,
        booked_time: bookedTime,
        guestEmails: emails.join(', '), // Add the emails array as a comma-separated string
      };
    
      setSubmitting(true); // Set submitting to true to disable the button and change the text
    
      try {
        await dispatch(createGuestMeeting({ guestMeetingData })); // Dispatch the action
        alert("Booked successfully! Email sending feature coming soon!");
        setFormSubmitted(true);
        window.location.reload();
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
        const timeStr = dayjs(value).format('HH:mm');
        const isDisabled = !timeSlots.includes(timeStr);
        if (isDisabled) {
          console.log(`Time slot ${timeStr} on date ${dateStr} is disabled.`);
        }
        return isDisabled;
      }
    
      return false;
    };

    //Email
    const [emails, setEmails] = useState([]);
    const [inputValue, setInputValue] = useState('');
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };
  
    const handleAddEmail = () => {
      if (inputValue.trim() === '') return; // Return early if the input is empty
    
      const email = inputValue.trim();
      const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      if (isValidEmail) {
        setEmails([...emails, email]);
        setInputValue('');
      } else {
        alert('Please enter a valid email address.');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddEmail();
      }
    };
  
    const handleRemoveEmail = (index) => {
      setEmails(emails.filter((_, i) => i !== index));
    };

    const [selectedDate, setSelectedDate] = useState(null);
    const [timePickerEnabled, setTimePickerEnabled] = useState(false);

    
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
                        className="mb-3"
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                       <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <TextField
                          label="Enter guest email (optional)"
                          variant="outlined"
                          fullWidth
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          onBlur={handleAddEmail} // Add this line
                        />
                        {emails.length > 0 && (
                          <Paper
                            variant="outlined"
                            style={{
                              display: 'flex',
                              flexWrap: 'nowrap',
                              overflowX: 'auto',
                              padding: '5px',
                              alignItems: 'center',
                              position: 'absolute',
                              top: '56px',
                              width: '100%',
                            }}
                          >
                            {emails.map((email, index) => (
                              <Chip
                                key={index}
                                label={email}
                                onDelete={() => handleRemoveEmail(index)}
                                style={{ margin: '5px' }}
                              />
                            ))}
                            <InputBase style={{ minWidth: '100px' }} placeholder="Add more emails..." />
                          </Paper>
                        )}
                      </div>

                      <p className="ms-1 mb-3">Select your preferred date:</p>
                      <div className="w-100 d-flex justify-content-between">
                          <DatePicker
                          label="Select Date"
                          value={selectedDate}
                          className="me-3 w-100"
                          onChange={(newValue) => {
                            setSelectedDate(newValue);
                            setTimePickerEnabled(true); // Enable time picker once a date is selected
                          }}
                          shouldDisableDate={shouldDisableDate}
                        />

                        {timePickerEnabled && (
                          <TimePicker
                            label="Select Time"
                            value={value}
                            className="w-100"
                            onChange={(newValue) => setValue(newValue)}
                            shouldDisableTime={shouldDisableTime}
                          />
                        )}
                      </div>
                     


                      <div className="d-flex justify-content-end">
                        <Button
                          type="submit"
                          variant="contained"
                          className="mt-3"
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


 