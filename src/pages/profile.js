import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Tabs, Tab, Spinner, Image } from 'react-bootstrap';
import { FaUser, FaLock, FaCamera, FaCheck, FaTimes } from 'react-icons/fa';
import Layout from './Layout';
import profileService from '../services/profile';
import authService from '../services/auth';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userData = await profileService.getProfile();
        setProfile(userData);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const updatedProfile = await profileService.updateProfile(profile);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      
      // Update user in auth service if needed
      authService.updateCurrentUser(updatedProfile);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    
    try {
      setChangingPassword(true);
      console.log('Attempting to change password...');
      
      const response = await profileService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      console.log('Password change response:', response);
      
      if (response.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        /*
          Changing the password invalidates the current JWT, so
          immediately log the user out and send them to the login
          page to re-authenticate with the new password.  We wait
          a brief moment so the success alert is visible.
        */
        console.log('Password changed successfully, logging out in 1 second...');
        setTimeout(async () => {
          console.log('Logging out now...');
          await authService.logout();
        }, 1000);
        
        // Clear success message after 3 seconds
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        console.error('Password change failed with response:', response);
        setPasswordError(response.error || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Password change error details:', err);
      setPasswordError('Current password is incorrect or server error occurred.');
      console.error('Error changing password:', err);
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    
    try {
      setUploadingPhoto(true);
      setError('');
      
      const response = await profileService.uploadProfilePhoto(photoFile);
      
      if (response.success) {
        setProfile(prevState => ({
          ...prevState,
          profile_photo: response.photoUrl
        }));
        
        setSuccess('Profile photo updated successfully!');
        setPhotoFile(null);
        setPhotoPreview(null);
        
        // Update user in auth service
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          currentUser.profile_photo = response.photoUrl;
          authService.updateCurrentUser(currentUser);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to upload photo.');
      }
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error('Error uploading photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const cancelPhotoUpload = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading profile information...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">My Profile</h1>
      </div>

      <Row>
        <Col lg={12}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Profile Information</h6>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="profile" title={<span><FaUser className="me-2" />Profile</span>}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                  
                  <Row>
                    <Col md={3} className="text-center mb-4">
                      <div className="position-relative d-inline-block">
                        <Image 
                          src={photoPreview || profile?.profile_photo || "https://via.placeholder.com/150"} 
                          roundedCircle 
                          className="img-profile shadow"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          alt="Profile"
                        />
                        <div className="mt-3">
                          <Form.Group controlId="profilePhoto" className="mb-3">
                            <Form.Label className="btn btn-outline-primary btn-sm">
                              <FaCamera className="me-2" />
                              Change Photo
                              <Form.Control 
                                type="file" 
                                onChange={handlePhotoChange} 
                                accept="image/*" 
                                hidden 
                              />
                            </Form.Label>
                          </Form.Group>
                          
                          {photoFile && (
                            <div className="mt-2">
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={handlePhotoUpload} 
                                disabled={uploadingPhoto}
                                className="me-2"
                              >
                                {uploadingPhoto ? (
                                  <>
                                    <Spinner
                                      as="span"
                                      animation="border"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                      className="me-1"
                                    />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <FaCheck className="me-1" /> Upload
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={cancelPhotoUpload} 
                                disabled={uploadingPhoto}
                              >
                                <FaTimes className="me-1" /> Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md={9}>
                      <Form onSubmit={handleProfileSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3" controlId="firstname">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="firstname"
                                value={profile?.firstname || ''}
                                onChange={handleProfileChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3" controlId="lastname">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="lastname"
                                value={profile?.lastname || ''}
                                onChange={handleProfileChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profile?.email || ''}
                            onChange={handleProfileChange}
                            required
                            disabled
                          />
                          <Form.Text className="text-muted">
                            Email address cannot be changed.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3" controlId="phone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profile?.phone || ''}
                            onChange={handleProfileChange}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3" controlId="role">
                          <Form.Label>Role</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile?.role || 'User'}
                            disabled
                          />
                        </Form.Group>
                        
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Saving...
                              </>
                            ) : 'Save Changes'}
                          </Button>
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </Tab>
                
                <Tab eventKey="password" title={<span><FaLock className="me-2" />Change Password</span>}>
                  {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                  {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
                  
                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3" controlId="currentPassword">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                      />
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters long.
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Changing Password...
                          </>
                        ) : 'Change Password'}
                      </Button>
                    </div>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Profile;
