import {
  Badge,
  Button,
  Card,
  CardGroup,
  Col,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import MeetingDetailsCard from '../components/MeetingDetailsCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetingsByUser, fetchUser } from '../features/meetingsSlice';

// Bug: Dashboard goes blank if user has no link

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.meeting.user);

    //Log user out
    useEffect(() => {
        if(!currentUser){
         navigate('/login');
        } else {
            dispatch(fetchMeetingsByUser(currentUser.uid));
            dispatch(fetchUser(currentUser.uid));
        }
    },[currentUser])

    //Get meeting details from redux store
    const allMeetings = useSelector(state => state.meeting.allMeetings);
    const loading = useSelector(state => state.meeting.loading)

    const handleCreateMeeting = () => {
        navigate('/meeting')
    }
  }, [currentUser]);

  //Get meeting details from redux store
  const allMeetings = useSelector((state) => state.meeting.allMeetings);
  const loading = useSelector((state) => state.meeting.loading);

  console.log(allMeetings);

  const handleCreateMeeting = () => {
    navigate('/profile');
    //change back to login when done
  };

                <Row className="px-2">
                    {loading && (
                        <Spinner animation="border" variant="primary" />
                    )}
                    {!loading && allMeetings && allMeetings.map((meeting) => (
                        <MeetingDetailsCard 
                            key={meeting.id}
                            meetingId = {meeting.id}
                            name={meeting.meeting_name}
                            duration={meeting.event_duration}
                            location={meeting.location}
                            link={`${window.location.origin}/bookmeeting/${meeting.id}`}
                        />
                    ))}
                        
                </Row>    
            </Container> 
        </>
    )
}
