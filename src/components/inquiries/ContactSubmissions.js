import React, { useState, useEffect } from 'react';
import { FaEye, FaReply, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import { contactSubmissionService } from '../../services/contact_submission';
import { toast } from 'react-toastify';

const ContactSubmissions = ({ activeTab }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch submissions when component mounts
  useEffect(() => {
    if (activeTab === 'contact') {
      fetchSubmissions();
    }
  }, [activeTab]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await contactSubmissionService.getAllSubmissions();
      setSubmissions(data);
    } catch (error) {
      toast.error('Failed to fetch contact submissions');
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactSubmissionService.updateSubmissionStatus(id, newStatus);
      setSubmissions(submissions.map(submission =>
        submission.id === id ? { ...submission, status: newStatus } : submission
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteSubmission = async () => {
    try {
      await contactSubmissionService.deleteSubmission(currentSubmission.id);
      setSubmissions(submissions.filter(submission => submission.id !== currentSubmission.id));
      setShowDeleteModal(false);
      toast.success('Submission deleted successfully');
    } catch (error) {
      toast.error('Failed to delete submission');
      console.error('Error deleting submission:', error);
    }
  };

  const handleContactRedirect = (submission) => {
    const { preferred_contact, email, phone } = submission;
    
    switch (preferred_contact.toLowerCase()) {
      case 'email':
        window.location.href = `mailto:${email}?subject=Re: Contact Submission&body=Dear ${submission.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards,%0D%0AYour Team`;
        break;
      
      case 'whatsapp':
        // Remove any non-numeric characters from phone number
        const whatsappNumber = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${whatsappNumber}?text=Dear ${submission.name},%0AThank you for contacting us.`, '_blank');
        break;
      
      case 'phone':
        window.location.href = `tel:${phone}`;
        break;
      
      case 'sms':
        // Remove any non-numeric characters from phone number
        const smsNumber = phone.replace(/\D/g, '');
        window.location.href = `sms:${smsNumber}?body=Dear ${submission.name}, Thank you for contacting us.`;
        break;
      
      default:
        // Default to email if preferred contact method is not recognized
        window.location.href = `mailto:${email}`;
        break;
    }

    // Update status to in_progress after initiating contact
    handleStatusChange(submission.id, 'in_progress');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'completed':
        return 'bg-success';
      case 'in_progress':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  if (activeTab !== 'contact') return null;

  if (loading) {
    return (
      <div className="card shadow mb-4">
        <div className="card-body text-center">
          Loading submissions...
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Contact Submissions</h6>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered" width="100%" cellSpacing="0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Preferred Contact</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.name}</td>
                  <td>{submission.email}</td>
                  <td>{submission.phone || 'N/A'}</td>
                  <td>{submission.message.substring(0, 50)}...</td>
                  <td>
                    <span className="text-capitalize">{submission.preferred_contact}</span>
                  </td>
                  <td>{formatDate(submission.created_at)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-info btn-sm me-1" 
                      onClick={() => {
                        setCurrentSubmission(submission);
                        setShowViewModal(true);
                      }}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn btn-primary btn-sm me-1" 
                      onClick={() => handleContactRedirect(submission)}
                    >
                      <FaReply />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm me-1" 
                      onClick={() => {
                        setCurrentSubmission(submission);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </button>
                    {submission.status !== 'completed' ? (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleStatusChange(submission.id, 'completed')}
                      >
                        <FaCheck />
                      </button>
                    ) : (
                      <button 
                        className="btn btn-warning btn-sm" 
                        onClick={() => handleStatusChange(submission.id, 'in_progress')}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Submission Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubmission && (
            <div>
              <div className="mb-3">
                <span className={`badge ${getStatusBadgeClass(currentSubmission.status)} me-2`}>
                  {currentSubmission.status}
                </span>
              </div>
              
              <div className="card mb-3">
                <div className="card-header">
                  <strong>Message</strong>
                </div>
                <div className="card-body">
                  <p>{currentSubmission.message}</p>
                </div>
                <div className="card-footer text-muted">
                  {formatDate(currentSubmission.created_at)}
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {currentSubmission.name}</p>
                  <p><strong>Email:</strong> {currentSubmission.email}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Phone:</strong> {currentSubmission.phone || 'N/A'}</p>
                  <p><strong>Preferred Contact:</strong> <span className="text-capitalize">{currentSubmission.preferred_contact}</span></p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowViewModal(false);
              handleContactRedirect(currentSubmission);
            }}
          >
            Contact via {currentSubmission?.preferred_contact}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubmission && (
            <p>Are you sure you want to delete the contact submission from "{currentSubmission.name}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmission}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContactSubmissions; 