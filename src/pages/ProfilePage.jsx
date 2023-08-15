import { useSelector } from 'react-redux/es/hooks/useSelector';
import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom/dist';
import { AuthContext } from '../components/AuthProvider';
import { fetchUser } from '../features/meetingsSlice';
import { useDispatch } from 'react-redux';
import { Col, Container, Button } from 'react-bootstrap';
import defaultPic from '../assets/default-pic.png';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { updateUserInfo } from '../features/meetingsSlice';

export default function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      dispatch(fetchUser(currentUser.uid));
    }
  }, [currentUser]);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [imgToUpload, setImgToUpload] = useState(null);

  const user = useSelector((state) => state.meeting.user);

  const handleEdit = () => {
    setEditing(true);
    setNewName(user.userDetails.name);
    console.log(user.userDetails.profile_picture);
  };

  const handleProfilePicChange = (e) => {
    setImgToUpload(e.target.files[0]);
  };

  // upload pic to firebase storaage and get link
  const handleUploadAndSubmit = async () => {
    setIsLoading(true);
    try {
      const imageRef = ref(storage, `meetings/${currentUser.uid}`);
      await uploadBytes(imageRef, imgToUpload);
      const url = await getDownloadURL(imageRef);
      console.log('pic uploaded!');

      // Dispatch data to update user info in users table
      dispatch(
        updateUserInfo({
          id: user.userDetails.id,
          name: newName,
          profile_picture: url, // Using the URL obtained from Firebase Storage
        })
      );

      setEditing(false);
      setIsLoading(false);
      dispatch(fetchUser(currentUser.uid));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Container>
      <Col className='d-flex flex-column align-items-center mt-5'>
        {' '}
        {/* profile pic */}
        <div className='d-flex flex-column align-items-center gap-4 mb-4'>
          <img
            className='rounded-circle'
            style={{ width: 200, height: 200 }}
            src={user.userDetails?.profile_picture || defaultPic}
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
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='Enter new username'
              />
            ) : (
              user.userDetails?.name || 'Loading...'
            )}
          </h2>
          <p>{user.userDetails?.email || 'Loading...'}</p>
        </div>
        {/* buttons */}
        <div className='d-flex flex-row gap-2'>
          {editing ? (
            <>
              <Button onClick={handleUploadAndSubmit}>Save</Button>
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
