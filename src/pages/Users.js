import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaUserCheck, FaUserTimes, FaUpload } from 'react-icons/fa';
import Layout from './Layout';
import { Modal, Button, Form } from 'react-bootstrap';
import usersService from '../services/users';
import { uploadProfileImage, deleteProfileImage, validateImage } from '../utils/image_utils';

// UsersTable component
const UsersTable = ({ 
  users, 
  loading, 
  openViewModal, 
  openEditModal, 
  openDeleteModal
}) => {
  if (loading) {
    return (
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">All Users</h6>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">All Users</h6>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered" width="100%" cellSpacing="0">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.profiles_id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={user.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstname + ' ' + user.lastname)}`} 
                        alt={`${user.firstname} ${user.lastname}`} 
                        className="rounded-circle me-2" 
                        style={{ width: '40px', height: '40px' }}
                      />
                      <div>
                        <div className="fw-bold">{`${user.firstname} ${user.lastname}`}</div>
                        <div className="small text-muted">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' ? 'bg-danger' :
                      user.role === 'agent' ? 'bg-primary' :
                      'bg-info'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button 
                        className="btn btn-info btn-sm" 
                        onClick={() => openViewModal(user)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => openEditModal(user)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => openDeleteModal(user)}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phone: '',
    role: 'user',
    profile_photo: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Fetch users on component mount and when search/filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setTableLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      if (filterRole !== 'all') {
        queryParams.append('role', filterRole);
      }

      const data = await usersService.getAllUsers(queryParams.toString());
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setTableLoading(false);
      setIsSearching(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const uploadedImageUrl = newUser.profile_photo; // Store the image URL before reset
    
    try {
      const createdUser = await usersService.createUser(newUser);
      await fetchUsers();
      setShowAddModal(false);
      setImagePreview(null);
      // Reset form
      setNewUser({
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        phone: '',
        role: 'user',
        profile_photo: ''
      });
    } catch (err) {
      // Only delete the uploaded image if user creation fails
      if (uploadedImageUrl) {
        try {
          console.log('Cleaning up uploaded image after failed user creation');
          await deleteProfileImage(uploadedImageUrl, true); // Pass true for cleanup
        } catch (deleteErr) {
          console.error('Failed to clean up image after user creation error:', deleteErr);
        }
      }
      console.error('Error adding user:', err);
      alert(err.response?.data?.error || 'Failed to add user');
    }
  };

  const handleEditUser = async (updatedUser) => {
    const oldPhotoUrl = currentUser.profile_photo;
    try {
      const response = await usersService.updateUser(updatedUser.profiles_id, updatedUser);
      // Update the users array with the response data
      setUsers(prevUsers => prevUsers.map(user => 
        user.profiles_id === response.profiles_id ? response : user
      ));
      setShowEditModal(false);
      setEditImagePreview(null);
    } catch (err) {
      // Restore old image if update fails
      if (oldPhotoUrl !== updatedUser.profile_photo) {
        await deleteProfileImage(updatedUser.profile_photo);
        setCurrentUser({ ...currentUser, profile_photo: oldPhotoUrl });
      }
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await usersService.deleteUser(currentUser.profiles_id);
      await fetchUsers();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
  };

  const handleRoleFilter = (e) => {
    setFilterRole(e.target.value);
    setTableLoading(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const openViewModal = (user) => {
    setCurrentUser(user);
    setShowViewModal(true);
  };

  const handleImageChange = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      validateImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditImagePreview(reader.result);
        } else {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Upload file
      setUploadProgress(0);
      const imageUrl = await uploadProfileImage(file);
      setUploadProgress(100);

      // Update state based on whether we're editing or adding
      if (isEdit) {
        // Only attempt to delete old image when editing an existing user
        const oldImageUrl = currentUser.profile_photo;
        setCurrentUser({ ...currentUser, profile_photo: imageUrl });
        
        if (oldImageUrl) {
          try {
            await deleteProfileImage(oldImageUrl);
          } catch (error) {
            console.error('Failed to delete old image:', error);
          }
        }
      } else {
        // For new user, just set the new image URL
        setNewUser({ ...newUser, profile_photo: imageUrl });
      }
    } catch (error) {
      alert(error.message);
      setUploadProgress(0);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="animate__animated animate__fadeIn">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">Users Management</h1>
          <button 
            className="d-none d-sm-inline-block btn btn-primary shadow-sm animate__animated animate__fadeInRight"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" /> Add New User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="card shadow mb-4 animate__animated animate__fadeInUp">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Search & Filter</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button className="btn btn-primary" type="button" disabled={isSearching}>
                    {isSearching ? 'Searching...' : <FaSearch />}
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaFilter /></span>
                  <select 
                    className="form-select" 
                    value={filterRole}
                    onChange={handleRoleFilter}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UsersTable 
          users={users}
          loading={tableLoading}
          openViewModal={openViewModal}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
        />
      </div>

      {/* View User Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <div className="text-center">
              <img 
                src={currentUser.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstname + ' ' + currentUser.lastname)}`} 
                alt={`${currentUser.firstname} ${currentUser.lastname}`} 
                className="rounded-circle mb-3" 
                style={{ width: '100px', height: '100px' }}
              />
              <h4>{`${currentUser.firstname} ${currentUser.lastname}`}</h4>
              <p className="text-muted">{currentUser.email}</p>
              
              <div className="mb-3">
                <span className={`badge ${
                  currentUser.role === 'admin' ? 'bg-danger' :
                  currentUser.role === 'agent' ? 'bg-primary' :
                  'bg-info'
                } me-2`}>
                  {currentUser.role}
                </span>
                <span className={`badge ${currentUser.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                  {currentUser.status}
                </span>
              </div>
              
              <div className="row mt-4">
                <div className="col-md-6 text-start">
                  <p><strong>Phone:</strong> {currentUser.phone || 'N/A'}</p>
                </div>
                <div className="col-md-6 text-start">
                  <p><strong>Created:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleEditUser(currentUser);
            }}>
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <div className="position-relative">
                    <img
                      src={editImagePreview || currentUser.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstname + ' ' + currentUser.lastname)}`}
                      alt="Profile Preview"
                      className="rounded-circle mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <div className="position-relative d-inline-block">
                      <Button
                        variant="outline-primary"
                        className="position-absolute bottom-0 end-0"
                        style={{ borderRadius: '50%', padding: '8px' }}
                      >
                        <FaUpload />
                        <input
                          type="file"
                          className="position-absolute top-0 start-0 opacity-0"
                          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, true)}
                        />
                      </Button>
                    </div>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="progress mt-2">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-8">
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={currentUser.firstname || ''} 
                      onChange={(e) => setCurrentUser({...currentUser, firstname: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={currentUser.lastname || ''} 
                      onChange={(e) => setCurrentUser({...currentUser, lastname: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      value={currentUser.email || ''} 
                      onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={currentUser.phone || ''} 
                      onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select 
                      value={currentUser.role || 'user'} 
                      onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                    >
                      <option value="admin">Admin</option>
                      <option value="agent">Agent</option>
                      <option value="user">User</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <p>Are you sure you want to delete the user "{currentUser.firstname} {currentUser.lastname}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddUserSubmit}>
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                <div className="position-relative">
                  <img
                    src={imagePreview || newUser.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(((newUser.firstname || '') + ' ' + (newUser.lastname || '')).trim() || 'User')}`} 
                    alt="Profile Preview"
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <div className="position-relative d-inline-block">
                    <Button
                      variant="outline-primary"
                      className="position-absolute bottom-0 end-0"
                      style={{ borderRadius: '50%', padding: '8px' }}
                    >
                      <FaUpload />
                      <input
                        type="file"
                        className="position-absolute top-0 start-0 opacity-0"
                        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                      />
                    </Button>
                  </div>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress mt-2">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                      aria-valuenow={uploadProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                )}
              </div>
              <div className="col-md-8">
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                    placeholder="Enter email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    placeholder="Enter password"
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newUser.firstname}
                    onChange={(e) => setNewUser({...newUser, firstname: e.target.value})}
                    required
                    placeholder="Enter first name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newUser.lastname}
                    onChange={(e) => setNewUser({...newUser, lastname: e.target.value})}
                    required
                    placeholder="Enter last name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    required
                  >
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Add User
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Users;

