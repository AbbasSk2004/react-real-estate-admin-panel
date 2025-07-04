import React, { useState } from 'react';

const ShareProperty = ({ property, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const propertyUrl = `${window.location.origin}/properties/${property.id}`;
  const shareText = `Check out this amazing property: ${property.title}`;
  const shareImage = property.main_image;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: 'fa-facebook-f',
      color: '#1877f2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Twitter',
      icon: 'fa-twitter',
      color: '#1da1f2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: 'fa-linkedin-in',
      color: '#0077b5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}&title=${encodeURIComponent(shareText)}`
    },
    {
      name: 'WhatsApp',
      icon: 'fa-whatsapp',
      color: '#25d366',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${propertyUrl}`)}`
    },
    {
      name: 'Telegram',
      icon: 'fa-telegram-plane',
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Email',
      icon: 'fa-envelope',
      color: '#6c757d',
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`I found this property that might interest you:\n\n${shareText}\n\n${propertyUrl}`)}`
    }
  ];

  const handleShare = (option) => {
    window.open(option.url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    setShowDropdown(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowDropdown(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = propertyUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowDropdown(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `Check out this property: ${property.title}`,
          url: propertyUrl,
        });
        setShowDropdown(false);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

    return (
    <div className={`share-property position-relative ${className}`}>
      <button
        className={`btn ${className}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fa fa-share-alt me-2"></i>
        Share
      </button>

      {showDropdown && (
        <div className="dropdown-menu show position-absolute end-0 mt-1" style={{ zIndex: 1050 }}>
          <h6 className="dropdown-header">Share this property</h6>
          
          {shareOptions.map((option) => (
            <button
              key={option.name}
              className="dropdown-item d-flex align-items-center"
              onClick={() => handleShare(option)}
            >
              <i 
                className={`fab ${option.icon} me-2`}
                style={{ color: option.color, width: '16px' }}
              ></i>
              {option.name}
            </button>
          ))}
          
          <div className="dropdown-divider"></div>
          
          <button
            className="dropdown-item d-flex align-items-center"
            onClick={copyToClipboard}
          >
            <i className="fa fa-copy me-2" style={{ width: '16px' }}></i>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          {navigator.share && (
            <button
              className="dropdown-item d-flex align-items-center"
              onClick={handleNativeShare}
            >
              <i className="fa fa-share-alt me-2" style={{ width: '16px' }}></i>
              Share via Native
            </button>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040 }}
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default ShareProperty;

    