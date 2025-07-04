import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import agentsService from '../../services/agents';
import LoadingSpinner from '../common/LoadingSpinner';

const AgentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await agentsService.getAgentApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load agent applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        approved: newStatus === 'approved',
        approved_at: newStatus === 'approved' ? new Date().toISOString() : null
      };
      
      await agentsService.updateAgentApplication(id, updateData);
      await fetchApplications(); // Refresh only the applications table
      if (showViewModal) {
        setShowViewModal(false);
      }
    } catch (err) {
      console.error('Error updating application:', err);
      // You might want to show an error toast/alert here
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;

    try {
      await agentsService.deleteAgent(selectedApplication.id);
      await fetchApplications(); // Refresh only the applications table
      setShowDeleteModal(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Error deleting application:', err);
      // You might want to show an error toast/alert here
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Specialty</th>
            <th>Experience</th>
            <th>Status</th>
            <th>Applied Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>
                {application.profiles.firstname} {application.profiles.lastname}
              </td>
              <td>{application.profiles.email}</td>
              <td>{application.specialty}</td>
              <td>{application.experience}</td>
              <td>{getStatusBadge(application.status)}</td>
              <td>{new Date(application.created_at).toLocaleDateString()}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowViewModal(true);
                    }}
                  >
                    <FaEye />
                  </Button>
                  {(application.status === 'rejected' || !application.approved) && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleStatusUpdate(application.id, 'approved')}
                    >
                      <FaCheck />
                    </Button>
                  )}
                  {(application.status === 'approved' || application.approved) && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    >
                      <FaTimes />
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">
                No agent applications found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this agent application? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Application Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agent Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div>
              <h5>Personal Information</h5>
              <p><strong>Name:</strong> {selectedApplication.profiles.firstname} {selectedApplication.profiles.lastname}</p>
              <p><strong>Email:</strong> {selectedApplication.profiles.email}</p>
              <p><strong>Phone:</strong> {selectedApplication.profiles.phone}</p>

              <h5 className="mt-4">Professional Information</h5>
              <p><strong>Specialty:</strong> {selectedApplication.specialty}</p>
              <p><strong>Experience:</strong> {selectedApplication.experience}</p>
              <p><strong>About:</strong> {selectedApplication.about_me}</p>

              {selectedApplication.cv_resume_url && (
                <p className="mt-3">
                  <a href={selectedApplication.cv_resume_url} className="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">
                    Download CV / Resume
                  </a>
                </p>
              )}

              <h5 className="mt-4">Social Media</h5>
              <p><strong>Facebook:</strong> {selectedApplication.facebook_url || 'Not provided'}</p>
              <p><strong>Twitter:</strong> {selectedApplication.twitter_url || 'Not provided'}</p>
              <p><strong>Instagram:</strong> {selectedApplication.instagram_url || 'Not provided'}</p>

              <h5 className="mt-4">Application Status</h5>
              <p><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</p>
              <p><strong>Applied Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
              {selectedApplication.approved_at && (
                <p><strong>Approved Date:</strong> {new Date(selectedApplication.approved_at).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedApplication && (
            <>
              {(selectedApplication.status === 'rejected' || !selectedApplication.approved) && (
                <Button 
                  variant="success" 
                  onClick={() => {
                    handleStatusUpdate(selectedApplication.id, 'approved');
                    setShowViewModal(false);
                  }}
                >
                  Approve Application
                </Button>
              )}
              {(selectedApplication.status === 'approved' || selectedApplication.approved) && (
                <Button 
                  variant="danger" 
                  onClick={() => {
                    handleStatusUpdate(selectedApplication.id, 'rejected');
                    setShowViewModal(false);
                  }}
                >
                  Reject Application
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AgentApplications; 