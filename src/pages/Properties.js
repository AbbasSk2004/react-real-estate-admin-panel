import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { Table, Button, Modal, Badge, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa';
import PropertyForm from '../components/properties/PropertyForm';
import PropertyDetailModal from '../components/properties/PropertyDetailModal';
import propertiesService from '../services/propertiesservice';

const Properties = () => {
  // State for properties data
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  
  // State for property detail modal
  const [showPropertyDetail, setShowPropertyDetail] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch properties from API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertiesService.getAllProperties();
      setProperties(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  // Handle add new property
  const handleAddProperty = () => {
    setModalMode('add');
    setCurrentProperty(null);
    setShowModal(true);
  };

  // Handle edit property
  const handleEditProperty = async (property) => {
    try {
      setLoadingProperty(true);
      // Fetch the full property details
      const propertyDetails = await propertiesService.getProperty(property.id);
      setModalMode('edit');
      setCurrentProperty(propertyDetails);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching property details:', err);
      alert('Failed to load property details');
    } finally {
      setLoadingProperty(false);
    }
  };

  // Handle view property
  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setShowPropertyDetail(true);
  };

  // Handle delete property
  const handleDeleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertiesService.deleteProperty(id);
        setProperties(properties.filter(property => property.id !== id));
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('Failed to delete property');
      }
    }
  };

  // Handle form submission success
  const handleSubmitSuccess = async (propertyData) => {
    try {
      if (modalMode === 'add') {
        const newProperty = await propertiesService.createProperty(propertyData);
        setProperties([...properties, newProperty]);
      } else {
        const updatedProperty = await propertiesService.updateProperty(currentProperty.id, propertyData);
        setProperties(properties.map(prop => 
          prop.id === currentProperty.id ? updatedProperty : prop
        ));
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving property:', err);
      alert('Failed to save property');
    }
  };

  // Filter properties based on search term
  const filteredProperties = properties.filter(property => 
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.governate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.property_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading properties...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="alert alert-danger my-4">
          <p>Error: {error}</p>
          <Button variant="primary" onClick={fetchProperties}>Try Again</Button>
        </div>
      );
    }
    
    return (
      <>
        {/* Properties Table */}
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">All Properties</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <Table className="table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Area (sq ft)</th>
                    <th>Featured</th>
                    <th>Recommended</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">No properties found</td>
                    </tr>
                  ) : (
                    filteredProperties.map(property => (
                      <tr key={property.id}>
                        <td>{property.title}</td>
                        <td>{property.property_type}</td>
                        <td>
                          <Badge bg={property.status === 'For Sale' ? 'primary' : 'info'}>
                            {property.status}
                          </Badge>
                        </td>
                        <td>
                          {property.status === 'For Sale' 
                            ? `$${property.price.toLocaleString()}` 
                            : `$${property.price.toLocaleString()}/mo`}
                        </td>
                        <td>{property.governate}</td>
                        <td>{property.area}</td>
                        <td>
                          {property.is_featured ? 
                            <Badge bg="success">Yes</Badge> : 
                            <Badge bg="secondary">No</Badge>}
                        </td>
                        <td>
                          {property.recommended ? 
                            <Badge bg="success">Yes</Badge> : 
                            <Badge bg="secondary">No</Badge>}
                        </td>
                        <td>
                          {property.verified ? 
                            <Badge bg="success">Yes</Badge> : 
                            <Badge bg="warning">Pending</Badge>}
                        </td>
                        <td>
                          <Button variant="info" size="sm" className="mr-2" onClick={() => handleViewProperty(property)}>
                            <FaEye />
                          </Button>
                          <Button variant="primary" size="sm" className="mr-2" onClick={() => handleEditProperty(property)}>
                            <FaEdit />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteProperty(property.id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Properties Management</h1>
        {/* Add New Property button removed as per request */}
      </div>

      {/* Search Bar */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Search Properties</h6>
        </div>
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, location, type, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="input-group-append">
              <Button variant="primary">
                <FaSearch />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {renderContent()}

      {/* Property Detail Modal */}
      <PropertyDetailModal
        show={showPropertyDetail}
        onHide={() => setShowPropertyDetail(false)}
        property={selectedProperty}
      />

      {/* Add/Edit Property Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add New Property' : 'Edit Property'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingProperty ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">Loading property details...</p>
            </div>
          ) : (
            <PropertyForm 
              mode={modalMode} 
              property={currentProperty}
              onSubmitSuccess={handleSubmitSuccess}
            />
          )}
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Properties;
