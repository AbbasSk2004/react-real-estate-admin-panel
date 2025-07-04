import React from 'react';
import { Modal } from 'react-bootstrap';
import PropertyDetail from '../../pages/PropertyDetail';
import './PropertyDetailModal.css';

const PropertyDetailModal = ({ property, show, onHide }) => {
  if (!property) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" fullscreen scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{property.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <PropertyDetail property={property} isModal={true} />
      </Modal.Body>
    </Modal>
  );
};

export default PropertyDetailModal; 