import { useSelector } from 'react-redux/es/hooks/useSelector';
import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom/dist';
import { AuthContext } from '../components/AuthProvider';
import { fetchUser } from '../features/meetingsSlice';
import { useDispatch } from 'react-redux';
import { Col, Container, Button } from 'react-bootstrap';
import defaultPic from '../assets/default-pic.png';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [editing, setEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedProfilePic, setUpdatedProfilePic] = useState(null); // New state for the updated profile picture

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      dispatch(fetchUser(currentUser.uid));
    }
  }, [currentUser]);

  const user = useSelector((state) => state.meeting.user);
  const profilepic = user.userDetails.profile_picture;

  const handleEdit = () => {
    setEditing(true);
    setUpdatedName(user.userDetails.name);
    setUpdatedEmail(user.userDetails.email);
  };

  const handleProfilePicChange = (e) => {
    setUpdatedProfilePic(e.target.files[0]);
  };

  const handleSubmit = () => {
    // Dispatch an action to update user info, including the updated profile picture
    dispatch(
      updateUserInfo({
        id: user.id,
        name: updatedName,
        email: updatedEmail,
        profile_picture: updatedProfilePic, // Add the updated profile picture here
      })
    );
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Container>
      <Col className='d-flex flex-column align-items-center'>
        {' '}
        {/* profile pic */}
        <div className='d-flex flex-column align-items-center gap-4 mb-4'>
          <img
            className='square bg-primary rounded-circle'
            style={{ width: 200 }}
            src={
              updatedProfilePic
                ? URL.createObjectURL(updatedProfilePic)
                : profilepic
                ? profilepic
                : defaultPic
            }
            alt='User Profile'
          />
          {editing && (
            <input
              type='file'
              accept='image/*'
              onChange={handleProfilePicChange}
            />
          )}
        </div>
        {/* name and email */}
        <div className='d-flex flex-column align-items-center gap-0'>
          <h2>
            {editing ? (
              <input
                type='text'
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
              />
            ) : (
              user.userDetails.name
            )}
          </h2>
          <p>{user.userDetails.email}</p>
        </div>
        {/* buttons */}
        <div className='d-flex flex-row gap-2'>
          {editing ? (
            <>
              <Button onClick={handleSubmit}>Save</Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button onClick={handleEdit}>Edit</Button>
          )}
        </div>
      </Col>
    </Container>
  );
}
