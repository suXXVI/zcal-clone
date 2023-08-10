import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMeetingById } from "../features/meetingsSlice";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "../components/AuthProvider";
import Button from '@mui/material/Button';
import { StaticDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";



export default function BookMeetingPage() {
    const { meetingId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const meeting = useSelector(state => state.meeting.meeting);
    const {currentUser} = useContext(AuthContext);

    useEffect(() => {
        dispatch(fetchMeetingById(meetingId));
      }, [dispatch, meetingId]);

    const [allowedDates, setAllowedDates] = useState([]);
    const [allowedTimeSlots, setAllowedTimeSlots] = useState({});
    

    useEffect(() => {
      if (meeting && meeting.availability) {
        const dates = meeting.availability.map(avail => dayjs(avail.date));
    
        const timeSlots = meeting.availability.reduce((slots, avail) => {
          const date = dayjs(avail.date).format('YYYY-MM-DD');
          const startTime = dayjs(avail.start_time, 'HH:mm:ss');
          const endTime = dayjs(avail.end_time, 'HH:mm:ss');
          const timeSlots = [];
    
          for (let time = startTime; time.isBefore(endTime); time = time.add(meeting.event_duration, 'minutes')) {
            timeSlots.push(time.format('HH:mm'));
          }
    
          slots[date] = timeSlots;
          return slots;
        }, {});
    
        setAllowedDates(dates);
        setAllowedTimeSlots(timeSlots);
      }
    }, [meeting]);
    
  
    const shouldDisableDate = (date) => {
      return !allowedDates.some(allowedDate => allowedDate.isSame(date, 'day'));
    };
  
    const shouldDisableTime = (timeValue, type, date) => {
      if (!date) return true; // Disable time if date is not defined
    
      const dateStr = date.format('YYYY-MM-DD');
      const timeSlots = allowedTimeSlots[dateStr];
      if (!timeSlots) return true;
    
      if (type === 'hours') {
        return !timeSlots.some(slot => parseInt(slot.split(':')[0]) === timeValue);
      }
    
      if (type === 'minutes') {
        return !timeSlots.some(slot => parseInt(slot.split(':')[1]) === timeValue);
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
        `}
      </style>
          {(meeting.length === 0)? (
            <Spinner animation="border" variant="primary" />
          ): (
            <>
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
                      <StaticDateTimePicker
                        defaultValue={dayjs('2022-04-17T15:30')}
                        shouldDisableDate={shouldDisableDate}
                        shouldDisableTime={shouldDisableTime}
                      />
                    </div>
                  </div>
                </div>
            </>
          )}
      </>
    );
}


