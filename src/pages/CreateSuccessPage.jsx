import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { resetMeeting } from '../features/meetingsSlice';
import { resetAvailability } from '../features/availabilitySlice';
import { useDispatch } from 'react-redux';

function CreateSuccessPage() {
  const { meetingId } = useParams();
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(resetMeeting());
    dispatch(resetAvailability());
  })

  return (
    <Container>
      <h1>Meeting Created Successfully!</h1>
      <p>Your meeting link is: <a href={`/bookmeeting/${meetingId}`}>/bookmeeting/{meetingId}</a></p>
    </Container>
  );
}

export default CreateSuccessPage;
