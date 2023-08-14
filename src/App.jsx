import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthContext, AuthProvider } from './components/AuthProvider';
import AuthPage from './pages/AuthPage';
import { auth } from './firebase';
import { useContext } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import AvailabilityForm from './pages/AvailabilityForm';
import MeetingForm from './pages/MeetingForm';
import { Provider, useDispatch } from 'react-redux';
import store from './store';
import CreateSuccessPage from './pages/CreateSuccessPage';
import BookMeetingPage from './pages/BookMeetingPage';
import Home from './pages/Home';
import { clearAllMeetings, resetMeeting } from './features/meetingsSlice';
import { resetAvailability } from './features/availabilitySlice';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ProfilePage from './pages/ProfilePage';

function Layout() {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const dispatch = useDispatch();
  const handleLogout = () => {
    auth.signOut();
    dispatch(clearAllMeetings());
    dispatch(resetAvailability());
    dispatch(resetMeeting());
  };

  return (
    <>
      <Navbar bg='light' variant='light' className='mb-3'>
        <Container className='justify-content-start gap-4'>
          <Navbar.Brand href='/'>
            <img
              src='https://firebasestorage.googleapis.com/v0/b/mentor-mentee-booking-system.appspot.com/o/meetings%2Fdownload.png?alt=media&token=d7898c68-1a0d-4ae8-9499-52d128e314fd'
              style={{ width: 80, height: 'auto' }}
            ></img>
          </Navbar.Brand>
          {currentUser && !location.pathname.startsWith('/bookmeeting') && (
            <Button variant='danger' onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Layout />}>
                <Route index element={<AuthPage />} />
                <Route path='*' element={<AuthPage />} />
                <Route path='/login' element={<AuthPage />} />
                <Route path='/meeting/:meetingId' element={<MeetingForm />} />
                <Route path='/meeting' element={<MeetingForm />} />
                <Route path='/profile' element={<ProfilePage />} />
                <Route
                  path='/availability/:meetingId'
                  element={<AvailabilityForm />}
                />
                <Route path='/availability' element={<AvailabilityForm />} />
                <Route
                  path='/success/:meetingId'
                  element={<CreateSuccessPage />}
                />
                <Route
                  path='/bookmeeting/:meetingId'
                  element={<BookMeetingPage />}
                />
                <Route path='/home' element={<Home />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Provider>
      </AuthProvider>
    </LocalizationProvider>
  );
}
