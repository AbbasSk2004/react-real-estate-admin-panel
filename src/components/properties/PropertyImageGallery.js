import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './PropertyGalleryStyles.css';

const PropertyImageGallery = ({ mainImage, images = [], property, onPropertyClick }) => {
  const allImages = [mainImage, ...images].filter(Boolean);
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openFullImage = (index, e) => {
    e.stopPropagation(); // Prevent triggering onPropertyClick
    setCurrentIndex(index);
    setShowFullImage(true);
  };

  const showPrevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const showNextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const closeFullImage = () => {
    setShowFullImage(false);
  };

  return (
    <div className="property-gallery">
      {/* Main Image - 50% width */}
      <div
        className="main-image-wrapper"
        onClick={(e) => openFullImage(0, e)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={allImages[0]}
          alt="Main"
          className="img-fluid"
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-dark bg-opacity-75 px-3 py-2">
            <i className="fas fa-camera me-2"></i>
            {allImages.length} Photos
          </span>
        </div>
      </div>

      {/* Thumbnails - 50% width, 2x2 grid */}
      <div className="thumbnails-grid">
        {allImages.slice(1, 5).map((img, index) => (
          <div
            key={index}
            className="thumbnail-wrapper"
            onClick={(e) => openFullImage(index + 1, e)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={img}
              alt={`Thumb ${index + 1}`}
              className="img-fluid"
            />
          </div>
        ))}
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="full-image-modal" onClick={closeFullImage}>
          <div className="modal-close-btn">
            <i className="fas fa-times"></i>
          </div>
          {allImages.length > 1 && (
            <>
              <div className="nav-button prev" onClick={showPrevImage}>
                <i className="fas fa-chevron-left"></i>
              </div>
              <div className="nav-button next" onClick={showNextImage}>
                <i className="fas fa-chevron-right"></i>
              </div>
            </>
          )}
          <div className="full-image-container">
            <img src={allImages[currentIndex]} alt="Full size" />
          </div>
        </div>
      )}

      {/* Add some basic CSS for the modal */}
      <style>{`
        .full-image-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          cursor: pointer;
        }
        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }
        .full-image-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .full-image-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
        }
        .nav-button.prev {
          left: 20px;
        }
        .nav-button.next {
          right: 20px;
        }
      `}</style>
    </div>
  );
};

export default PropertyImageGallery;
