import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMeetingById } from "../features/meetingsSlice";
import { Container } from "react-bootstrap";


export default function BookMeetingPage() {
    const { meetingId } = useParams();
    const dispatch = useDispatch();
    const meeting = useSelector(state => state.meeting.meeting);

    console.log(meetingId)
    useEffect(() => {
        dispatch(fetchMeetingById(meetingId));
      }, [dispatch, meetingId]);
    
      // Check if the meeting is loaded
      if (!meeting) {
        return <div>Loading...</div>;
      }
      console.log(meeting)
      return (
        <Container>
            <div>
                <h1>More Features Coming Soon!</h1>
                <img src={meeting.cover_photo}></img>
                <p>Meeting ID: {meetingId}</p>
                <p>Meeting Name: {meeting.meeting_name}</p>
                <p>Location: {meeting.location}</p>
                <p>Description: {meeting.description}</p>
                <p>Custom URL: {meeting.custom_url}</p>
                <p>Event Duration: {meeting.event_duration}</p>
            </div>
        </Container>
      );
}
