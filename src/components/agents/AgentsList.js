import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaTrash, FaCheck, FaTimes, FaStar, FaEdit, FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import { Modal, Button, Form, Card, Row, Col, Badge, Toast } from 'react-bootstrap';
import agentsService from '../../services/agents';
import LoadingSpinner from '../common/LoadingSpinner';
import { AGENT_SPECIALTIES } from '../../utils/agentConstants';

const AgentsList = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [searchTerm, filterSpecialty, agents]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await agentsService.getApprovedAgents();
      setAgents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to load agents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    // Apply specialty filter
    if (filterSpecialty !== 'all') {
      filtered = filtered.filter(agent => agent.specialty === filterSpecialty);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.profiles.firstname?.toLowerCase().includes(searchLower) ||
        agent.profiles.lastname?.toLowerCase().includes(searchLower) ||
        agent.profiles.email?.toLowerCase().includes(searchLower) ||
        agent.specialty?.toLowerCase().includes(searchLower) ||
        agent.experience?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAgents(filtered);
  };

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleDeleteAgent = async () => {
    if (!currentAgent) return;

    try {
      setActionLoading(true);
      await agentsService.deleteAgent(currentAgent.id);
      
      // Update local state - remove the deleted agent
      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== currentAgent.id));
      
      setShowDeleteModal(false);
      setCurrentAgent(null);
      showToast('Agent deleted successfully');
    } catch (err) {
      console.error('Error deleting agent:', err);
      showToast('Failed to delete agent', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(true);
      const updatedData = {
        status: newStatus,
        approved: newStatus === 'approved',
        approved_at: newStatus === 'approved' ? new Date().toISOString() : null
      };
      
      // Optimistically update the UI
      const updatedAgents = agents.map(agent => 
        agent.id === id ? { ...agent, ...updatedData } : agent
      );
      setAgents(updatedAgents);
      
      const response = await agentsService.updateAgentApplication(id, updatedData);
      
      // Update with actual response data
      setAgents(prevAgents => prevAgents.map(agent => 
        agent.id === id ? response : agent
      ));
      
      showToast(`Agent status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating agent status:', err);
      showToast('Failed to update agent status', 'danger');
      
      // Revert optimistic update on failure
      await fetchAgents();
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeatureToggle = async (id, currentStatus) => {
    try {
      setActionLoading(true);
      
      // Optimistically update UI
      const updatedAgents = agents.map(agent => 
        agent.id === id ? { ...agent, is_featured: !currentStatus } : agent
      );
      setAgents(updatedAgents);
      
      const response = await agentsService.updateAgentFeature(id, !currentStatus);
      
      // Update with actual response data to ensure consistency
      setAgents(prevAgents => prevAgents.map(agent => 
        agent.id === id ? { ...agent, is_featured: response.is_featured } : agent
      ));
      
      showToast(`Agent ${response.is_featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (err) {
      console.error('Error updating agent feature status:', err);
      showToast('Failed to update featured status', 'danger');
      
      // Revert optimistic update on failure
      await fetchAgents();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!currentAgent) return;

    try {
      setActionLoading(true);
      const response = await agentsService.updateAgent(currentAgent.id, editForm);
      
      // Update local state with the edited agent
      setAgents(prevAgents => prevAgents.map(agent => 
        agent.id === currentAgent.id ? { ...agent, ...response } : agent
      ));
      
      setShowEditModal(false);
      setCurrentAgent(null);
      showToast('Agent updated successfully');
    } catch (err) {
      console.error('Error updating agent:', err);
      showToast('Failed to update agent', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAgent) return;

    try {
      setActionLoading(true);
      await agentsService.deleteAgent(currentAgent.id);
      
      // Update local state
      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== currentAgent.id));
      
      setShowDeleteModal(false);
      showToast('Agent deleted successfully');
    } catch (err) {
      console.error('Error deleting agent:', err);
      showToast('Failed to delete agent', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (agent) => {
    setCurrentAgent(agent);
    setEditForm({
      specialty: agent.specialty,
      experience: agent.experience,
      about_me: agent.about_me,
      facebook_url: agent.facebook_url,
      twitter_url: agent.twitter_url,
      instagram_url: agent.instagram_url,
      is_featured: agent.is_featured
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      {/* Toast notification */}
      <Toast 
        show={toast.show} 
        onClose={() => setToast({ ...toast, show: false })}
        className={`position-fixed top-0 end-0 m-3 bg-${toast.variant}`} 
        style={{ zIndex: 9999 }}
      >
        <Toast.Header>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>

      {/* Filters and Search */}
      <div className="card shadow mb-4">
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
                  placeholder="Search agents..." 
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
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                >
                  <option value="all">All Specialties</option>
                  {AGENT_SPECIALTIES.map(specialty => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">All Agents</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Specialty</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={agent.image || agent.profiles.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.profiles.firstname + ' ' + agent.profiles.lastname)}`} 
                          alt={`${agent.profiles.firstname} ${agent.profiles.lastname}`}
                          className="rounded-circle me-2"
                          width="40"
                          height="40"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold">
                            {agent.profiles.firstname} {agent.profiles.lastname}
                          </div>
                          <div className="small text-muted">{agent.profiles.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{agent.specialty}</td>
                    <td>{agent.experience}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td>{formatDate(agent.created_at)}</td>
                    <td>
                      <button 
                        className={`btn btn-sm ${agent.is_featured ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => handleFeatureToggle(agent.id, agent.is_featured)}
                        disabled={actionLoading}
                      >
                        <FaStar />
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn btn-info btn-sm me-1" 
                        onClick={() => {
                          setCurrentAgent(agent);
                          setShowViewModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn btn-primary btn-sm me-1" 
                        onClick={() => handleEditClick(agent)}
                        disabled={actionLoading}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm me-1" 
                        onClick={() => {
                          setCurrentAgent(agent);
                          setShowDeleteModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        <FaTrash />
                      </button>
                      {agent.status !== 'approved' ? (
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleStatusChange(agent.id, 'approved')}
                          disabled={actionLoading}
                        >
                          <FaCheck />
                        </button>
                      ) : (
                        <button 
                          className="btn btn-warning btn-sm" 
                          onClick={() => handleStatusChange(agent.id, 'rejected')}
                          disabled={actionLoading}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAgents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {loading ? <LoadingSpinner /> : 'No agents found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agent Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAgent && (
            <div>
              <div className="text-center mb-4">
                <img 
                  src={currentAgent.image || currentAgent.profiles.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentAgent.profiles.firstname + ' ' + currentAgent.profiles.lastname)}`} 
                  alt={`${currentAgent.profiles.firstname} ${currentAgent.profiles.lastname}`}
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h4>{currentAgent.profiles.firstname} {currentAgent.profiles.lastname}</h4>
                <p className="text-muted mb-2">{currentAgent.specialty}</p>
                <div className="mb-3">
                  <span className={`badge ${getStatusBadgeClass(currentAgent.status)} me-2`}>
                    {currentAgent.status}
                  </span>
                  {currentAgent.is_featured && (
                    <span className="badge bg-warning">Featured Agent</span>
                  )}
                </div>
                <div className="d-flex justify-content-center gap-3 mb-4">
                  {currentAgent.facebook_url && (
                    <a href={currentAgent.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                      <FaFacebook size={24} />
                    </a>
                  )}
                  {currentAgent.twitter_url && (
                    <a href={currentAgent.twitter_url} target="_blank" rel="noopener noreferrer" className="text-info">
                      <FaTwitter size={24} />
                    </a>
                  )}
                  {currentAgent.instagram_url && (
                    <a href={currentAgent.instagram_url} target="_blank" rel="noopener noreferrer" className="text-danger">
                      <FaInstagram size={24} />
                    </a>
                  )}
                </div>
                {currentAgent.cv_resume_url && (
                  <div className="mb-4">
                    <a href={currentAgent.cv_resume_url} className="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">
                      Download CV / Resume
                    </a>
                  </div>
                )}
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <h5 className="mb-3">Contact Information</h5>
                  <p>
                    <FaPhone className="me-2 text-primary" />
                    {currentAgent.phone}
                  </p>
                  <p>
                    <FaEnvelope className="me-2 text-primary" />
                    {currentAgent.profiles.email}
                  </p>
                </div>
                <div className="col-md-6">
                  <h5 className="mb-3">Experience</h5>
                  <p>{currentAgent.experience}</p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="mb-3">About</h5>
                <p>{currentAgent.about_me}</p>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <p><strong>Created:</strong> {formatDate(currentAgent.created_at)}</p>
                  {currentAgent.approved_at && (
                    <p><strong>Approved:</strong> {formatDate(currentAgent.approved_at)}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <p><strong>Last Updated:</strong> {formatDate(currentAgent.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)} disabled={actionLoading}>
            Close
          </Button>
          {currentAgent && currentAgent.status !== 'approved' && (
            <Button 
              variant="success" 
              onClick={() => {
                handleStatusChange(currentAgent.id, 'approved');
                setShowViewModal(false);
              }}
              disabled={actionLoading}
            >
              Approve Agent
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Agent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAgent && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Specialty</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.specialty || ''}
                  onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.experience || ''}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>About</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editForm.about_me || ''}
                  onChange={(e) => setEditForm({ ...editForm, about_me: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Facebook URL</Form.Label>
                <Form.Control
                  type="url"
                  value={editForm.facebook_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, facebook_url: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Twitter URL</Form.Label>
                <Form.Control
                  type="url"
                  value={editForm.twitter_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, twitter_url: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Instagram URL</Form.Label>
                <Form.Control
                  type="url"
                  value={editForm.instagram_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, instagram_url: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Featured Agent"
                  checked={editForm.is_featured || false}
                  onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit} disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAgent && (
            <p>Are you sure you want to delete the agent "{currentAgent.profiles.firstname} {currentAgent.profiles.lastname}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AgentsList; 