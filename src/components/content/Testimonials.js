import React, { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaCheck } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import testimonialsService from '../../services/testimonials';
import LoadingSpinner from '../common/LoadingSpinner';

const Testimonials = ({ activeTab }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'testimonials') {
      fetchTestimonials();
    }
  }, [activeTab]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialsService.getAllTestimonials();
      setTestimonials(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonial = async () => {
    if (!currentTestimonial) return;

    try {
      await testimonialsService.deleteTestimonial(currentTestimonial.id);
      await fetchTestimonials(); // Refresh the list
      setShowDeleteModal(false);
      setCurrentTestimonial(null);
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      // You might want to show an error toast/alert here
    }
  };

  const handleApproveTestimonial = async (id) => {
    try {
      await testimonialsService.updateApprovalStatus(id, true);
      await fetchTestimonials(); // Refresh the list
    } catch (err) {
      console.error('Error approving testimonial:', err);
      // You might want to show an error toast/alert here
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  if (activeTab !== 'testimonials') return null;
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered" width="100%" cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Content</th>
              <th>Rating</th>
              <th>Created At</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id}>
                <td>
                  {testimonial.profiles.firstname} {testimonial.profiles.lastname}
                </td>
                <td>{testimonial.content.substring(0, 50)}...</td>
                <td>{renderStars(testimonial.rating)}</td>
                <td>{formatDate(testimonial.created_at)}</td>
                <td>
                  <span className={`badge ${testimonial.approved ? 'bg-success' : 'bg-warning'}`}>
                    {testimonial.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-info btn-sm me-1" 
                    onClick={() => {
                      setCurrentTestimonial(testimonial);
                      setShowViewModal(true);
                    }}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="btn btn-danger btn-sm me-1" 
                    onClick={() => {
                      setCurrentTestimonial(testimonial);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                  {!testimonial.approved && (
                    <button 
                      className="btn btn-success btn-sm" 
                      onClick={() => handleApproveTestimonial(testimonial.id)}
                    >
                      <FaCheck />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No testimonials found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Testimonial Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTestimonial && (
            <div className="text-center">
              <img 
                src={currentTestimonial.profiles.profile_photo} 
                alt={`${currentTestimonial.profiles.firstname} ${currentTestimonial.profiles.lastname}`}
                className="rounded-circle mb-3"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <h4>{currentTestimonial.profiles.firstname} {currentTestimonial.profiles.lastname}</h4>
              <p className="text-muted">{currentTestimonial.profiles.email}</p>
              
              <div className="mb-3">
                <span className={`badge ${currentTestimonial.approved ? 'bg-success' : 'bg-warning'} me-2`}>
                  {currentTestimonial.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              
              <div className="card mb-3">
                <div className="card-header">
                  <strong>Rating: {renderStars(currentTestimonial.rating)}</strong>
                </div>
                <div className="card-body">
                  <p>{currentTestimonial.content}</p>
                </div>
                <div className="card-footer text-muted">
                  {formatDate(currentTestimonial.created_at)}
                </div>
              </div>
              
              <div className="text-start">
                <p><strong>Phone:</strong> {currentTestimonial.profiles.phone}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {currentTestimonial && !currentTestimonial.approved && (
            <Button 
              variant="success" 
              onClick={() => {
                handleApproveTestimonial(currentTestimonial.id);
                setShowViewModal(false);
              }}
            >
              Approve Testimonial
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTestimonial && (
            <p>Are you sure you want to delete the testimonial from "{currentTestimonial.profiles.firstname} {currentTestimonial.profiles.lastname}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTestimonial}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Testimonials; 