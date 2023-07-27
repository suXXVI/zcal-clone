import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function CreateSuccessPage() {
  const { meetingId } = useParams();
//   fetchMeetingById , dispatch

  return (
    <Container>
      <h1>Meeting Created Successfully!</h1>
      <p>Your meeting link is: <a href={`/bookmeeting/${meetingId}`}>/bookmeeting/{meetingId}</a></p>
    </Container>
  );
}

export default CreateSuccessPage;
