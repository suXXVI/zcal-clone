import { useState, useEffect, useContext } from 'react';
import { Form, Button, Modal, Table, Container, Col, Row } from 'react-bootstrap';
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

  //Load the date within user specified range
  useEffect(() => {
    if (meeting.date_range && meeting.meeting_name) {
      const dates = eachDayOfInterval({
        start: new Date(),
        end: new Date(new Date().getTime() + meeting.date_range * 24 * 60 * 60 * 1000)
      });

      // Initialize availability for each date with one slot
      const initialAvailability = dates.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        slots: [
          {
            start_time: isWeekend(date) ? '' : '09:00',
            end_time: isWeekend(date) ? '' : '17:00',
            repeats: ''
          },
        ],
      }));

      setAvailability(initialAvailability);
    } 
  }, [meeting.date_range]);

  const handleTimeChange = (dateIndex, slotIndex) => {
    const newAvailability = [...availability];
    const selectedDay = format(new Date(newAvailability[dateIndex].date), 'EEEE').toLowerCase();
    const selectedStartTime = newAvailability[dateIndex].slots[slotIndex].start_time;
    const selectedEndTime = newAvailability[dateIndex].slots[slotIndex].end_time;
  
    switch (newAvailability[dateIndex].slots[slotIndex].repeats) {
      case 'daily':
        newAvailability.forEach(day => {
          if (format(new Date(day.date), 'EEEE').toLowerCase() === selectedDay) {
            day.slots.forEach(slot => {
              slot.start_time = selectedStartTime;
              slot.end_time = selectedEndTime;
            });
          }
        });
        break;
      case 'weekdays':
        newAvailability.forEach(day => {
          if (!isWeekend(new Date(day.date))) {
            day.slots.forEach(slot => {
              slot.start_time = selectedStartTime;
              slot.end_time = selectedEndTime;
            });
          }
        });
        break;
      default:
        break;
    }
  
    setAvailability(newAvailability);
  };

  // Add a new slot for a date
  const addSlotInModal = () => {
    const newAvailability = [...availability];
    newAvailability[currentSlot.dateIndex].slots.push({
      start_time: '',
      end_time: '',
    });
    setAvailability(newAvailability);
  };

  // Delete a slot for a date
  const deleteSlotInModal = (slotIndex) => {
    const newAvailability = [...availability];
    const slots = newAvailability[currentSlot.dateIndex].slots;
    if (slots.length > 1) {
      slots.splice(slotIndex, 1);
    } else {
      slots[0].start_time = '';
      slots[0].end_time = '';
      slots[0].repeats = '';
    }
    setAvailability(newAvailability);
  };
  
  
  const handleChange = (dateIndex, slotIndex, event) => {
    const newAvailability = [...availability];
    newAvailability[dateIndex].slots[slotIndex][event.target.name] = event.target.value;
    setAvailability(newAvailability);
  
    if (event.target.name === 'start_time' || event.target.name === 'end_time' || event.target.name === 'repeats') {
      handleTimeChange(dateIndex, slotIndex);
    }
  };

  //Navigate user back to meeting page
  const handleBack = () => {
    navigate(-1);
  }

  const handleShowModal = (dateIndex, slotIndex) => {
    setCurrentSlot({ dateIndex, slotIndex });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setCurrentSlot(null);
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  // Create a deep copy of the availability array
  const availabilityCopy = JSON.parse(JSON.stringify(availability));

  // Remove the "repeats" field from each slot
  availabilityCopy.forEach(dateAvailability => {
    dateAvailability.slots.forEach(slot => {
      delete slot.repeats;
    });
  });

  const meetingData = {
    meeting: meeting,
    availability: availabilityCopy
  };

  const response = await dispatch(postMeetingData(meetingData));
  if (postMeetingData.fulfilled.match(response)) {
    const meetingId = response.payload.meeting_id; // replace this with the actual ID of the created meeting
    navigate(`/success/${meetingId}`);

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
              {availability.map((dateAvailability, dateIndex) => (
                <tr key={dateIndex}>
                  <td>{dateAvailability.date}</td>
                  <td>
                    {dateAvailability.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} onClick={() => handleShowModal(dateIndex, slotIndex)}>
                        {`${slot.start_time} - ${slot.end_time}`}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
              {!meeting.meeting_name && (
                <tr>
                  <td colSpan={2}>Click back to create a meeting before setting availability timeslot</td>
                </tr>
              )}
            </tbody>
        </Table>
        
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Availability</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentSlot && (
              <>
                <Form.Group controlId={`date${currentSlot.dateIndex}`}>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="date" value={availability[currentSlot.dateIndex]?.date} disabled />
                </Form.Group>
                {availability[currentSlot.dateIndex].slots.map((slot, slotIndex) => (
                  <Row key={slotIndex}>
                    <Col>
                      <Form.Group controlId={`startTime${currentSlot.dateIndex}${slotIndex}`}>
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control type="time" name="start_time" value={slot.start_time} onChange={(event) => handleChange(currentSlot.dateIndex, slotIndex, event)} />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`endTime${currentSlot.dateIndex}${slotIndex}`}>
                        <Form.Label>End Time</Form.Label>
                        <Form.Control type="time" name="end_time" value={slot.end_time} onChange={(event) => handleChange(currentSlot.dateIndex, slotIndex, event)} />
                      </Form.Group>
                    </Col>
                    <Col xs="auto">
                      <Button variant="danger" onClick={() => deleteSlotInModal(slotIndex)}>Delete</Button>
                    </Col>
                  </Row>
                ))}
                <Form.Group controlId={`repeats${currentSlot.dateIndex}`}>
                  <Form.Label>Repeats</Form.Label>
                  <Form.Control as="select" name="repeats" value={availability[currentSlot.dateIndex]?.slots[currentSlot.slotIndex]?.repeats} onChange={(event) => handleChange(currentSlot.dateIndex, currentSlot.slotIndex, event)}>
                    <option value="">Select...</option>
                    <option value="only">{`Only on ${format(new Date(availability[currentSlot.dateIndex].date), 'MMMM do')}`}</option>
                    <option value="daily">{`Every ${format(new Date(availability[currentSlot.dateIndex].date), 'EEEE')}`}</option>
                    <option value="weekdays">All weekdays</option>
                  </Form.Control>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCloseModal}>
              Save Changes
            </Button>
            {currentSlot && (
              <Button onClick={addSlotInModal}>New Interval</Button>
            )}
          </Modal.Footer>
        </Modal>

        
        <Button variant='primary' onClick={handleBack} className='me-2 px-3'>
            Back
        </Button>
        {meeting.meeting_name && (
          <Button variant="success" type="submit">
            Submit
          </Button>
        )}
        
        </Form>
    </Container>
  );
}

export default AvailabilityForm;