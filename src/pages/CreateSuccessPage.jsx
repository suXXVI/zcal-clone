import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { resetMeeting } from '../features/meetingsSlice';
import { resetAvailability } from '../features/availabilitySlice';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../components/AuthProvider';

function CreateSuccessPage() {
  const { meetingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {currentUser} = useContext(AuthContext);
  
  useEffect(() => {
    dispatch(resetMeeting());
    dispatch(resetAvailability());
  })

  //Log user out
  useEffect(() => {
    if(!currentUser){
      navigate('/login');
    }
  },[currentUser])

  return (
    <Container>
      <h1>Meeting Created Successfully!</h1>
      <p>Your meeting link is: <a href={`/bookmeeting/${meetingId}`}>/bookmeeting/{meetingId}</a></p>
    </Container>
  );
}

export default CreateSuccessPage;
