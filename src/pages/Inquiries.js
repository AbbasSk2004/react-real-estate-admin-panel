import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaReply, FaTrash, FaCheck, FaTimes, FaWhatsapp } from 'react-icons/fa';
import Layout from './Layout';
import { Modal, Button, Form, Nav } from 'react-bootstrap';
import ContactSubmissions from '../components/inquiries/ContactSubmissions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import propertyInquiryService from '../services/property_inquiry';

const Inquiries = () => {
  const [activeTab, setActiveTab] = useState('inquiries');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await propertyInquiryService.getAllInquiries(searchTerm, filterStatus);
      setInquiries(data);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
      // console.error('Error fetching inquiries:', error); // removed in production
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  // Fetch when search or filter changes
  useEffect(() => {
    if (activeTab === 'inquiries') {
      const debounceTimer = setTimeout(() => {
        fetchInquiries();
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, filterStatus]);

  // Handle inquiry operations
  const handleReplyInquiry = async () => {
    try {
      await propertyInquiryService.replyToInquiry(currentInquiry.id, replyMessage);
      await fetchInquiries();
      setShowReplyModal(false);
      setReplyMessage('');
      toast.success('Reply sent successfully');
    } catch (error) {
      toast.error('Failed to send reply');
      // console.error('Error sending reply:', error); // removed in production
    }
  };

  const handleDeleteInquiry = async () => {
    try {
      await propertyInquiryService.deleteInquiry(currentInquiry.id);
      await fetchInquiries();
      setShowDeleteModal(false);
      toast.success('Inquiry deleted successfully');
    } catch (error) {
      toast.error('Failed to delete inquiry');
      // console.error('Error deleting inquiry:', error); // removed in production
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await propertyInquiryService.updateStatus(id, status);
      await fetchInquiries();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
      // console.error('Error updating status:', error); // removed in production
    }
  };

  const openViewModal = (inquiry) => {
    setCurrentInquiry(inquiry);
    setShowViewModal(true);
  };

  const openWhatsAppChat = (inquiry) => {
    // Format phone number (remove any non-digit characters)
    const phone = inquiry.phone ? inquiry.phone.replace(/\D/g, '') : '';
    
    if (!phone) {
      toast.error('No phone number available for this inquiry');
      return;
    }
    
    // Create message text
    const message = `Hello ${inquiry.name}, regarding your inquiry about ${inquiry.property}...`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');

    // NEW: Automatically mark inquiry as "In Progress" when WhatsApp chat is initiated
    handleStatusChange(inquiry.id, 'In Progress');
  };

  const openReplyModal = (inquiry) => {
    setCurrentInquiry(inquiry);
    setReplyMessage(`Dear ${inquiry.name},\n\nThank you for your inquiry about ${inquiry.property}.\n\n\n\nBest regards,\nYour Real Estate Team`);
    setShowReplyModal(true);
  };

  const openDeleteModal = (inquiry) => {
    setCurrentInquiry(inquiry);
    setShowDeleteModal(true);
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="animate__animated animate__fadeIn">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">Inquiries Management</h1>
        </div>

        {/* Tabs */}
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'inquiries'}
              onClick={() => setActiveTab('inquiries')}
            >
              Property Inquiries
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'contact'}
              onClick={() => setActiveTab('contact')}
            >
              Contact Submissions
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === 'inquiries' && (
          <>
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
                        placeholder="Search inquiries..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-primary" type="button">
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3">
                      <span className="input-group-text"><FaFilter /></span>
                      <select 
                        className="form-select" 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="card shadow mb-4 animate__animated animate__fadeInUp animate__delay-1s">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Property Inquiries</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <table className="table table-bordered" width="100%" cellSpacing="0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Subject</th>
                          <th>Property</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.map((inquiry) => (
                          <tr key={inquiry.id}>
                            <td>{inquiry.name}</td>
                            <td>{inquiry.email}</td>
                            <td>{inquiry.subject}</td>
                            <td>{inquiry.property}</td>
                            <td>
                              <span className={`badge ${
                                inquiry.status === 'New' ? 'bg-danger' :
                                inquiry.status === 'In Progress' ? 'bg-warning' :
                                'bg-success'
                              }`}>
                                {inquiry.status}
                              </span>
                            </td>
                            <td>{inquiry.date}</td>
                            <td>
                              <button 
                                className="btn btn-info btn-sm me-1" 
                                onClick={() => openViewModal(inquiry)}
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="btn btn-success btn-sm me-1" 
                                onClick={() => openWhatsAppChat(inquiry)}
                                title="WhatsApp Chat"
                              >
                                <FaWhatsapp />
                              </button>
                              <button 
                                className="btn btn-danger btn-sm me-1" 
                                onClick={() => openDeleteModal(inquiry)}
                              >
                                <FaTrash />
                              </button>
                              {inquiry.status !== 'Closed' ? (
                                <button 
                                  className="btn btn-success btn-sm" 
                                  onClick={() => handleStatusChange(inquiry.id, 'Closed')}
                                >
                                  <FaCheck />
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-warning btn-sm" 
                                  onClick={() => handleStatusChange(inquiry.id, 'In Progress')}
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'contact' && (
          <ContactSubmissions activeTab={activeTab} />
        )}
      </div>

      {/* View Inquiry Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Inquiry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentInquiry && (
            <div>
              <div className="mb-3">
                <span className={`badge ${
                  currentInquiry.status === 'New' ? 'bg-danger' :
                  currentInquiry.status === 'In Progress' ? 'bg-warning' :
                  'bg-success'
                } me-2`}>
                  {currentInquiry.status}
                </span>
                {currentInquiry.replied && (
                  <span className="badge bg-info">Replied</span>
                )}
              </div>
              
              <h5>Subject: {currentInquiry.subject}</h5>
              <p className="text-muted">Property: {currentInquiry.property}</p>
              
              <div className="card mb-3">
                <div className="card-header">
                  <strong>Message</strong>
                </div>
                <div className="card-body">
                  <p>{currentInquiry.message}</p>
                </div>
                <div className="card-footer text-muted">
                  {currentInquiry.date}
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {currentInquiry.name}</p>
                  <p><strong>Email:</strong> {currentInquiry.email}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Phone:</strong> {currentInquiry.phone}</p>
                  <p><strong>Date Received:</strong> {currentInquiry.date}</p>
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
            variant="success" 
            onClick={() => {
              setShowViewModal(false);
              if (currentInquiry) openWhatsAppChat(currentInquiry);
            }}
          >
            <FaWhatsapp className="me-1" /> WhatsApp Chat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reply Modal - Keeping for reference but not used anymore */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Inquiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentInquiry && (
            <Form>
              <div className="mb-3">
                <p><strong>To:</strong> {currentInquiry.name} ({currentInquiry.email})</p>
                <p><strong>Subject:</strong> RE: {currentInquiry.subject}</p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Reply</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={6} 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReplyInquiry}>
            Send Reply
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentInquiry && (
            <p>Are you sure you want to delete the inquiry from "{currentInquiry.name}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteInquiry}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Inquiries;

