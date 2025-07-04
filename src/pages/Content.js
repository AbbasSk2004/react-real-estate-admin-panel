import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaImage, FaNewspaper, FaHome, FaQuestionCircle, FaComments } from 'react-icons/fa';
import Layout from './Layout';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import faqService from '../services/faq';
import Testimonials from '../components/content/Testimonials';
import Blog from '../components/content/Blog';

const Content = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('faq');
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    is_featured: false,
    order_number: 0
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch FAQs and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [faqsData, categoriesData] = await Promise.all([
          faqService.getAllFaqs(),
          faqService.getCategories()
        ]);
        setFaqs(faqsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (data) => {
    const errors = {};
    if (!data.question.trim()) errors.question = 'Question is required';
    if (!data.answer.trim()) errors.answer = 'Answer is required';
    return errors;
  };

  // Handle FAQ operations
  const handleAddContent = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const newFaq = await faqService.createFaq(formData);
      setFaqs(prevFaqs => [...prevFaqs, newFaq]);
      setShowAddModal(false);
      // Reset form
      setFormData({
        question: '',
        answer: '',
        category: '',
        is_featured: false,
        order_number: 0
      });
      setFormErrors({});
    } catch (err) {
      setError('Failed to create FAQ');
      console.error(err);
    }
  };

  const handleEditContent = async (e) => {
    e.preventDefault();
    if (!currentContent || !currentContent.id) {
      setError('Invalid FAQ data');
      return;
    }

    const errors = validateForm(currentContent);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const updatedFaq = await faqService.updateFaq(currentContent.id, currentContent);
      setFaqs(prevFaqs => prevFaqs.map(faq => 
        faq.id === updatedFaq.id ? updatedFaq : faq
      ));
      setShowEditModal(false);
      setFormErrors({});
    } catch (err) {
      setError('Failed to update FAQ');
      console.error(err);
    }
  };

  const handleDeleteContent = async () => {
    try {
      await faqService.deleteFaq(currentContent.id);
      setFaqs(faqs.filter(faq => faq.id !== currentContent.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete FAQ');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="animate__animated animate__fadeIn">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">Content Management</h1>
        </div>

        {/* Content Tabs */}
        <div className="card shadow mb-4 animate__animated animate__fadeInUp animate__delay-1s">
          <div className="card-header py-3">
            <Nav variant="tabs" defaultActiveKey="faqs" onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="faqs">
                  <FaQuestionCircle className="me-2" /> FAQs
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="testimonials">
                  <FaComments className="me-2" /> Testimonials
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="blog">
                  <FaNewspaper className="me-2" /> Blog Posts
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
          <div className="card-body">
            <Tab.Content>
              <Tab.Pane active={activeTab === 'faqs'}>
                {/* FAQ Actions Row */}
                <div className="row mb-4">
                  <div className="col-md-8">
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search FAQs..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-primary" type="button">
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button 
                      className="btn btn-primary shadow-sm w-100"
                      onClick={() => {
                        setContentType('faq');
                        setShowAddModal(true);
                      }}
                    >
                      <FaPlus className="me-2" /> Add New FAQ
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Category</th>
                        <th>Featured</th>
                        <th>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFaqs.map((faq, index) => (
                        <tr key={faq.id ? `faq-row-${faq.id}` : `faq-row-index-${index}`}>
                          <td>{faq.question}</td>
                          <td>{faq.category || 'N/A'}</td>
                          <td>
                            <span className={`badge ${faq.is_featured ? 'bg-success' : 'bg-secondary'}`}>
                              {faq.is_featured ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>{faq.order_number}</td>
                          <td>
                            <button 
                              key={`view-${faq.id}`}
                              className="btn btn-info btn-sm me-1" 
                              onClick={() => {
                                setCurrentContent({...faq});
                                setShowViewModal(true);
                              }}
                            >
                              <FaEye />
                            </button>
                            <button 
                              key={`edit-${faq.id}`}
                              className="btn btn-primary btn-sm me-1" 
                              onClick={() => {
                                setCurrentContent({...faq});
                                setShowEditModal(true);
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              key={`delete-${faq.id}`}
                              className="btn btn-danger btn-sm" 
                              onClick={() => {
                                setCurrentContent({...faq});
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tab.Pane>
              
              <Tab.Pane active={activeTab === 'testimonials'}>
                <Testimonials activeTab={activeTab} />
              </Tab.Pane>

              <Tab.Pane active={activeTab === 'blog'}>
                <Blog activeTab={activeTab} />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>
      </div>

      {/* Add FAQ Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddContent}>
            <Form.Group className="mb-3">
              <Form.Label>Question <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                isInvalid={!!formErrors.question}
                placeholder="Enter question"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.question}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Answer <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                isInvalid={!!formErrors.answer}
                placeholder="Enter answer"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.answer}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="new">+ Add new category</option>
              </Form.Select>
              {formData.category === 'new' && (
                <Form.Control
                  type="text"
                  className="mt-2"
                  placeholder="Enter new category"
                  name="newCategory"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Order Number</Form.Label>
              <Form.Control
                type="number"
                name="order_number"
                value={formData.order_number}
                onChange={handleInputChange}
                placeholder="Enter order number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Featured FAQ"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddContent}>
            Add FAQ
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit FAQ Modal */}
      <Modal show={showEditModal} onHide={() => {
        setShowEditModal(false);
        setCurrentContent(null);
        setFormErrors({});
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentContent && (
            <Form onSubmit={handleEditContent}>
              <Form.Group className="mb-3">
                <Form.Label>Question <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="question"
                  value={currentContent.question || ''}
                  onChange={(e) => setCurrentContent(prev => ({
                    ...prev,
                    question: e.target.value
                  }))}
                  isInvalid={!!formErrors.question}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.question}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Answer <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="answer"
                  value={currentContent.answer || ''}
                  onChange={(e) => setCurrentContent(prev => ({
                    ...prev,
                    answer: e.target.value
                  }))}
                  isInvalid={!!formErrors.answer}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.answer}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={currentContent.category || ''}
                  onChange={(e) => setCurrentContent(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="new">+ Add new category</option>
                </Form.Select>
                {currentContent.category === 'new' && (
                  <Form.Control
                    type="text"
                    className="mt-2"
                    placeholder="Enter new category"
                    onChange={(e) => setCurrentContent(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Order Number</Form.Label>
                <Form.Control
                  type="number"
                  name="order_number"
                  value={currentContent.order_number || 0}
                  onChange={(e) => setCurrentContent(prev => ({
                    ...prev,
                    order_number: parseInt(e.target.value) || 0
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Featured FAQ"
                  name="is_featured"
                  checked={currentContent.is_featured || false}
                  onChange={(e) => setCurrentContent(prev => ({
                    ...prev,
                    is_featured: e.target.checked
                  }))}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowEditModal(false);
            setCurrentContent(null);
            setFormErrors({});
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditContent}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View FAQ Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentContent && (
            <div>
              <h4>Question</h4>
              <p>{currentContent.question}</p>
              
              <h4 className="mt-4">Answer</h4>
              <p>{currentContent.answer}</p>
              
              <div className="mt-4">
                <p><strong>Category:</strong> {currentContent.category || 'N/A'}</p>
                <p><strong>Order Number:</strong> {currentContent.order_number}</p>
                <p>
                  <strong>Featured:</strong>{' '}
                  <span className={`badge ${currentContent.is_featured ? 'bg-success' : 'bg-secondary'}`}>
                    {currentContent.is_featured ? 'Yes' : 'No'}
                  </span>
                </p>
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
              setShowEditModal(true);
            }}
          >
            Edit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentContent && (
            <p>Are you sure you want to delete this FAQ: "{currentContent.question}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteContent}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Content;

