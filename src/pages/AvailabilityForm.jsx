import { useState, useEffect, useContext } from 'react';
import { Form, Button, Modal, Table, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { resetAvailability, saveAvailability } from '../features/availabilitySlice';
import { format, eachDayOfInterval, isWeekend } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { postMeetingData, resetMeeting } from '../features/meetingsSlice';
import { AuthContext } from '../components/AuthProvider';

function AvailabilityForm() {
  const meeting = useSelector(state => state.meeting.meeting);
  const {currentUser} = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  //Log user out
  useEffect(() => {
    if(!currentUser){
      navigate('/login');
    }
  },[currentUser])

  useEffect(() => {
    if (meeting.date_range) {
      const dates = eachDayOfInterval({
        start: new Date(),
        end: new Date(new Date().getTime() + meeting.date_range * 24 * 60 * 60 * 1000)
      });

      const availability = dates.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        start_time: isWeekend(date) ? '' : '09:00',
        end_time: isWeekend(date) ? '' : '17:00',
        repeats: ''
      }));

      setAvailability(availability);
    }
  }, [meeting.date_range]);

  const handleChange = (event) => {
    const values = [...availability];
    values[currentSlot][event.target.name] = event.target.value;
    setAvailability(values);
  };

  const handleBack = () => {
    navigate(-1);
  }

  const handleShowModal = (index) => {
    setCurrentSlot(index);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setCurrentSlot(null);
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const meetingData = {
        meeting: meeting,
        availability: availability
      };
    const response = await dispatch(postMeetingData(meetingData));
    if (postMeetingData.fulfilled.match(response)) {
        const meetingId = response.payload.meeting_id; // replace this with the actual ID of the created meeting
        navigate(`/success/${meetingId}`);
        dispatch(resetMeeting());
        dispatch(resetAvailability());
    }
  };

  return (
    <Container>

        <Form onSubmit={handleSubmit}>
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Date</th>
                <th>Start Time - End Time</th>
            </tr>
            </thead>
            <tbody>
            {availability.map((slot, index) => (
                <tr key={index} onClick={() => handleShowModal(index)}>
                <td>{slot.date}</td>
                <td>{`${slot.start_time} - ${slot.end_time}`}</td>
                </tr>
            ))}
            </tbody>
        </Table>
        <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
            <Modal.Title>Edit Availability</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form.Group controlId={`date${currentSlot}`}>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={availability[currentSlot]?.date} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId={`startTime${currentSlot}`}>
                <Form.Label>Start Time</Form.Label>
                <Form.Control type="time" name="start_time" value={availability[currentSlot]?.start_time} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId={`endTime${currentSlot}`}>
                <Form.Label>End Time</Form.Label>
                <Form.Control type="time" name="end_time" value={availability[currentSlot]?.end_time} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId={`repeats${currentSlot}`}>
                <Form.Label>Repeats</Form.Label>
                <Form.Control as="select" name="repeats" value={availability[currentSlot]?.repeats} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="only">Only this day</option>
                <option value="daily">Everyday</option>
                <option value="weekdays">All weekdays</option>
                </Form.Control>
            </Form.Group>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
                Close
            </Button>
            <Button variant="primary" onClick={handleCloseModal}>
                Save Changes
            </Button>
            </Modal.Footer>
        </Modal>
        <Button variant='primary' onClick={handleBack} className='me-2 px-3'>
            Back
        </Button>
        <Button variant="success" type="submit">
            Submit
        </Button>
        </Form>
    </Container>
  );
}

export default AvailabilityForm;
