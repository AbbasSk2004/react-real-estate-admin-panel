import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import MDEditor from '@uiw/react-md-editor';
import blogService from '../../services/blog';
import { uploadBlogImage, deleteBlogImage } from '../../utils/image_utils';
import LoadingSpinner from '../common/LoadingSpinner';
import './Blog.css';

const Blog = ({ activeTab }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: `# Welcome to your new blog post!

## Introduction
Start with a brief introduction about your topic here...

## Main Content
Add your main content here. You can use various Markdown features:

### Lists
- Point 1
- Point 2
- Point 3

### Code Example
\`\`\`javascript
console.log('Hello World!');
\`\`\`

### Images
![Alt text](image-url)

## Conclusion
Wrap up your post with a strong conclusion...

---
*Feel free to edit this template to suit your needs!*`,
    excerpt: '',
    category: '',
    tags: [],
    image_url: '',
    status: 'published'
  });
  const [imageFile, setImageFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'blog') {
      fetchBlogs();
    }
  }, [activeTab]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAllBlogs();
      setBlogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'tags') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(tag => tag.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.title.trim()) errors.title = 'Title is required';
    if (!data.content.trim()) errors.content = 'Content is required';
    if (!data.excerpt.trim()) errors.excerpt = 'Excerpt is required';
    if (!data.category.trim()) errors.category = 'Category is required';
    return errors;
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadBlogImage(imageFile);
      }

      const blogData = {
        ...formData,
        image_url: imageUrl
      };

      await blogService.createBlog(blogData);
      await fetchBlogs();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Failed to create blog');
    }
  };

  const handleEditBlog = async (e) => {
    e.preventDefault();
    if (!currentBlog) return;

    const errors = validateForm(currentBlog);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let imageUrl = currentBlog.image_url;
      if (imageFile) {
        // Delete old image if exists
        if (currentBlog.image_url) {
          await deleteBlogImage(currentBlog.image_url);
        }
        imageUrl = await uploadBlogImage(imageFile);
      }

      const blogData = {
        ...currentBlog,
        image_url: imageUrl
      };

      await blogService.updateBlog(currentBlog.id, blogData);
      await fetchBlogs();
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Error updating blog:', err);
      setError('Failed to update blog');
    }
  };

  const handleDeleteBlog = async () => {
    try {
      if (currentBlog.image_url) {
        await deleteBlogImage(currentBlog.image_url);
      }
      await blogService.deleteBlog(currentBlog.id);
      await fetchBlogs();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Failed to delete blog');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: `# Welcome to your new blog post!

## Introduction
Start with a brief introduction about your topic here...

## Main Content
Add your main content here. You can use various Markdown features:

### Lists
- Point 1
- Point 2
- Point 3

### Code Example
\`\`\`javascript
console.log('Hello World!');
\`\`\`

### Images
![Alt text](image-url)

## Conclusion
Wrap up your post with a strong conclusion...

---
*Feel free to edit this template to suit your needs!*`,
      excerpt: '',
      category: '',
      tags: [],
      image_url: '',
      status: 'published'
    });
    setImageFile(null);
    setFormErrors({});
    setCurrentBlog(null);
  };

  if (activeTab !== 'blog') return null;
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      {/* Add Blog Button */}
      <div className="mb-4">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" /> Add New Blog Post
        </button>
      </div>

      {/* Blogs Table */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.title}</td>
                <td>{blog.category}</td>
                <td>
                  <span className={`badge ${blog.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                    {blog.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-info btn-sm me-1"
                    onClick={() => {
                      setCurrentBlog(blog);
                      setShowViewModal(true);
                    }}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="btn btn-primary btn-sm me-1"
                    onClick={() => {
                      setCurrentBlog(blog);
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setCurrentBlog(blog);
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

      {/* Add/Edit Modal */}
      <Modal 
        show={showAddModal || showEditModal} 
        onHide={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{showAddModal ? 'Add New Blog Post' : 'Edit Blog Post'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={showAddModal ? handleAddBlog : handleEditBlog}>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={showEditModal ? currentBlog?.title : formData.title}
                onChange={showEditModal ? 
                  (e) => setCurrentBlog(prev => ({ ...prev, title: e.target.value })) : 
                  handleInputChange
                }
                isInvalid={!!formErrors.title}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content <span className="text-danger">*</span></Form.Label>
              <div className={formErrors.content ? 'is-invalid' : ''}>
                <MDEditor
                  value={showEditModal ? currentBlog?.content : formData.content}
                  onChange={showEditModal ?
                    (content) => setCurrentBlog(prev => ({ ...prev, content })) :
                    (content) => setFormData(prev => ({ ...prev, content }))
                  }
                  height={400}
                  preview="edit"
                />
              </div>
              {formErrors.content && (
                <div className="invalid-feedback d-block">
                  {formErrors.content}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Excerpt <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="excerpt"
                value={showEditModal ? currentBlog?.excerpt : formData.excerpt}
                onChange={showEditModal ? 
                  (e) => setCurrentBlog(prev => ({ ...prev, excerpt: e.target.value })) : 
                  handleInputChange
                }
                isInvalid={!!formErrors.excerpt}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.excerpt}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={showEditModal ? currentBlog?.category : formData.category}
                onChange={showEditModal ? 
                  (e) => setCurrentBlog(prev => ({ ...prev, category: e.target.value })) : 
                  handleInputChange
                }
                isInvalid={!!formErrors.category}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.category}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={showEditModal ? 
                  (currentBlog?.tags || []).join(', ') : 
                  (formData.tags || []).join(', ')
                }
                onChange={showEditModal ? 
                  (e) => setCurrentBlog(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()) 
                  })) : 
                  handleInputChange
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(showEditModal ? currentBlog?.image_url : formData.image_url) && (
                <img 
                  src={showEditModal ? currentBlog?.image_url : formData.image_url}
                  alt="Blog preview"
                  className="mt-2"
                  style={{ maxWidth: '200px' }}
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={showEditModal ? currentBlog?.status : formData.status}
                onChange={showEditModal ? 
                  (e) => setCurrentBlog(prev => ({ ...prev, status: e.target.value })) : 
                  handleInputChange
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={showAddModal ? handleAddBlog : handleEditBlog}
          >
            {showAddModal ? 'Add Blog Post' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Blog Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBlog && (
            <div>
              {currentBlog.image_url && (
                <img 
                  src={currentBlog.image_url}
                  alt={currentBlog.title}
                  className="img-fluid mb-4"
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                />
              )}
              
              <h3>{currentBlog.title}</h3>
              
              <div className="mb-3">
                <span className={`badge bg-${currentBlog.status === 'published' ? 'success' : 'warning'} me-2`}>
                  {currentBlog.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <p className="text-muted">
                Category: {currentBlog.category}
              </p>
              
              <div className="mb-4">
                <h5>Excerpt</h5>
                <p>{currentBlog.excerpt}</p>
              </div>
              
              <div className="mb-4">
                <h5>Content</h5>
                <MDEditor.Markdown source={currentBlog.content} />
              </div>
              
              {currentBlog.tags && currentBlog.tags.length > 0 && (
                <div>
                  <h5>Tags</h5>
                  <div>
                    {currentBlog.tags.map((tag, index) => (
                      <span key={index} className="badge bg-secondary me-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <hr />
              
              <p className="text-muted">
                Created: {new Date(currentBlog.created_at).toLocaleString()}
                <br />
                Last updated: {new Date(currentBlog.updated_at).toLocaleString()}
              </p>
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

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBlog && (
            <p>Are you sure you want to delete the blog post "{currentBlog.title}"? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBlog}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Blog; 