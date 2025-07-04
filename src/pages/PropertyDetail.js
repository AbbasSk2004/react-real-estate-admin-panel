import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import ShareProperty from '../components/properties/ShareProperty';
import PropertyImageGallery from '../components/properties/PropertyImageGallery';
import './PropertyDetail.css';
import propertyService from '../services/propertiesservice';
import propertyViewsService from '../services/propertyViews';

// Mock services/context for now - these will need to be implemented
const useAuth = () => ({ user: null });
const useToast = () => ({ error: () => {} });
const useGlobalChat = () => ({
  startNewConversation: async () => {},
  setActiveConversation: () => {},
  setShowChat: () => {}
});
const endpoints = {
  propertyViews: propertyViewsService
};

const PropertyDetail = ({ property: propProperty, isModal }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { 
    startNewConversation, 
    setActiveConversation,
    setShowChat
  } = useGlobalChat();
  
  const [property, setProperty] = useState(propProperty);
  const [loading, setLoading] = useState(!propProperty);
  const [error, setError] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [loadingViews, setLoadingViews] = useState(false);
  const [viewError, setViewError] = useState(null);
  const viewRecorded = useRef(false);
  const abortController = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Memoize the view count handler
  const handleViewCount = useCallback(
    async (propertyIdOverride) => {
      // Determine which ID to use: an explicit override, route param, or any available prop
      const propertyIdToUse = propertyIdOverride || id || propProperty?.id;

      if (viewRecorded.current || !propertyIdToUse) return;

      try {
        setLoadingViews(true);
        setViewError(null);

        const countResponse = await endpoints.propertyViews.getViewCount(propertyIdToUse);

        if (countResponse?.success && typeof countResponse?.data?.count === 'number') {
          setViewCount(countResponse.data.count);
          viewRecorded.current = true;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('View count error:', err);
        setViewError(err.message || 'Could not update view count');

        if (retryCount.current < maxRetries) {
          retryCount.current++;
          setTimeout(() => handleViewCount(propertyIdToUse), 2000 * retryCount.current);
        }
      } finally {
        setLoadingViews(false);
      }
    },
    [id, propProperty]
  );

  // Memoize the chat handler
  const handleStartChat = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!property?.profiles_id) {
      toast.error('Cannot start chat: Owner information is missing');
      return;
    }

    try {
      const conversation = await startNewConversation({
        profiles_id: property.profiles_id,
        firstname: property.profiles.firstname,
        lastname: property.profiles.lastname,
        profile_photo: property.profiles.profile_photo
      }, property.id);

      // Set the active conversation and show chat
      setActiveConversation(conversation);
      setShowChat(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  }, [user, property, navigate, startNewConversation, setActiveConversation, setShowChat, toast]);

  // Only fetch property if not provided as prop
  useEffect(() => {
    let mounted = true;
    let timeoutId;
    
    const fetchProperty = async () => {
      /*
        1. If propProperty already contains owner profile data, just use it.
        2. Else, figure out which ID we can use to fetch a full record:
           • Prefer the route param `id` when present (regular page view).
           • Fallback to `propProperty.id` when the component is rendered inside a modal
             that received a lightweight property object from the list view.
        3. If we still can't determine an ID, there's nothing to fetch—just render what we have.
      */

      const propHasProfiles = !!(propProperty?.profiles && Object.keys(propProperty.profiles).length > 0);

      if (propProperty && propHasProfiles) {
        setProperty(propProperty);
        // Ensure view count is recorded even when property details are already fully provided
        // (e.g., when this component is rendered in a modal with a complete property object)
        handleViewCount(propProperty.id);
        return;
      }

      const fetchId = id || propProperty?.id;

      if (!fetchId) {
        // No valid ID – just use the provided prop (likely from SSR tests) and bail.
        if (propProperty) setProperty(propProperty);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        abortController.current = new AbortController();
        
        const data = await propertyService.getProperty(fetchId);
        if (!mounted) return;
        
        setProperty(data);
        
        // Delay view count recording to prevent concurrent API calls
        timeoutId = setTimeout(() => {
          if (mounted) {
            handleViewCount(fetchId);
          }
        }, 1000);
      } catch (err) {
        console.error('Error fetching property:', err);
        if (mounted) {
          setError(err.message || 'Failed to load property details');
          toast.error('Failed to load property details');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
      const cleanupId = id || propProperty?.id;
      if (cleanupId) {
        endpoints.propertyViews.clearCache(cleanupId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, propProperty, handleViewCount]);

  // After navigation/hooks declarations, insert helper function
  const hasDetail = (value) => {
    if (value === null || value === undefined) return false; // null/undefined
    if (typeof value === 'number') return value > 0;         // numbers > 0
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '0') return false;  // empty or "0"
    }
    return Boolean(value);                                   // fallback truthiness
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="error-state py-5">
              <i className="fa fa-exclamation-triangle fa-4x text-warning mb-4"></i>
              <h3 className="fw-bold mb-3">Property Not Found</h3>
              <p className="text-muted mb-4 lead">
                {error || 'The property you are looking for does not exist or has been removed.'}
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/properties" className="btn btn-primary">
                  <i className="fa fa-search me-2"></i>
                  Browse Properties
                </Link>
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                  <i className="fa fa-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getImageUrl = (url) => {
    if (!url) return '/img/property-placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/property-images/${url}`;
  };

  return (
    <div className="property-detail-page bg-light">
      <PropertyImageGallery 
        mainImage={getImageUrl(property.main_image)}
        images={property.images ? property.images.map(img => getImageUrl(img)) : []} 
        property={property}
        onPropertyClick={() => {}} // No-op when in modal view
      />
      <div className="container py-4">
        

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Property Header */}
            <div className="property-header bg-white rounded-3 shadow-sm p-4 mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className={`badge ${property.status === 'For Sale' ? 'bg-success' : 'bg-primary'} px-3 py-2`}>
                      {property.status}
                    </span>
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="fas fa-eye me-1"></i>
                      {loadingViews ? (
                        <small className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading view count...</span>
                        </small>
                      ) : viewError ? (
                        <span title={viewError}>--</span>
                      ) : (
                        <>{viewCount} views</>
                      )}
                    </span>
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="fas fa-clock me-1"></i>
                      {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h1 className="h2 fw-bold mb-2 text-dark">{property.title}</h1>
                  
                  <div className="location-info d-flex align-items-center text-muted mb-3">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    <span>
                      {property.address && `${property.address}, `}
                      {property.village && `${property.village}, `}
                      {property.city && `${property.city}, `}
                      {property.governate}
                    </span>
                  </div>

                  <div className="price-section">
                    <h2 className="h3 text-primary fw-bold mb-0">
                      {formatPrice(property.price)}
                      {property.status === 'For Rent' && <span className="fs-6 text-muted">/month</span>}
                    </h2>
                  </div>
                </div>
                
                                  <div className="action-buttons d-flex gap-2">
                    <ShareProperty property={property} className="btn-outline-primary" />
                  </div>
              </div>              {/* Key Details */}              <div className="key-details-grid mb-3">
                <div className="row g-2">                  {/* Property Type Badge */}
                  {property.property_type && (
                    <div className="col-12 d-flex justify-content-center mb-2">
                      <div className="detail-item d-inline-flex align-items-center px-3 py-2 bg-light text-dark rounded-2" style={{ maxWidth: 'fit-content' }}>
                        <i className={`fas ${
                          property.property_type === 'Office' ? 'fa-briefcase' :
                          property.property_type === 'Retail' ? 'fa-shopping-cart' :
                          property.property_type === 'Land' ? 'fa-mountain' :
                          property.property_type === 'Farm' ? 'fa-tractor' :
                          'fa-home'
                        } fa-lg text-primary me-2`}></i>
                        <div>
                          <span className="fw-bold">{property.property_type}</span>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Areas */}
                  {hasDetail(property.area) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-ruler-combined fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.area} m²</div>
                          <small className="text-muted">Built Area</small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {hasDetail(property.garden_area) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-tree fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.garden_area} m²</div>
                          <small className="text-muted">Garden Area</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rooms */}
                  {hasDetail(property.bedrooms) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-bed fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.bedrooms}</div>
                          <small className="text-muted">Bedrooms</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasDetail(property.bathrooms) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-bath fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.bathrooms}</div>
                          <small className="text-muted">Bathrooms</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasDetail(property.livingrooms) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-couch fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.livingrooms}</div>
                          <small className="text-muted">Living Rooms</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Building Details */}
                  {hasDetail(property.floor) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-building fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.floor}</div>
                          <small className="text-muted">Floor</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasDetail(property.year_built) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-calendar-alt fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.year_built}</div>
                          <small className="text-muted">Year Built</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parking */}
                  {hasDetail(property.parking_spaces) && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-car fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.parking_spaces}</div>
                          <small className="text-muted">Parking Spaces</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Status */}                  {property.furnishing_status && (
                    <div className="col-6 col-md-3">
                      <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                        <i className="fas fa-chair fa-lg text-primary me-2"></i>
                        <div>
                          <div className="fw-bold">{property.furnishing_status}</div>
                          <small className="text-muted">Furnishing</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Office-specific details */}
                  {property.property_type === 'Office' && (
                    <>
                      {hasDetail(property.meeting_rooms) && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-users fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.meeting_rooms}</div>
                              <small className="text-muted">Meeting Rooms</small>
                            </div>
                          </div>
                        </div>
                      )}
                      {hasDetail(property.parking_spaces) && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-parking fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.parking_spaces}</div>
                              <small className="text-muted">Parking Spaces</small>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Retail-specific details */}
                  {property.property_type === 'Retail' && (
                    <>
                      {hasDetail(property.frontage) && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-store-alt fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.frontage} m</div>
                              <small className="text-muted">Shop Front</small>
                            </div>
                          </div>
                        </div>
                      )}
                      {hasDetail(property.storage_area) && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-warehouse fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.storage_area} m²</div>
                              <small className="text-muted">Storage Area</small>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Land-specific details */}
                  {property.property_type === 'Land' && (
                    <>
                      {property.land_type && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-map fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.land_type}</div>
                              <small className="text-muted">Land Type</small>
                            </div>
                          </div>
                        </div>
                      )}
                      {property.zoning && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-clipboard-list fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.zoning}</div>
                              <small className="text-muted">Zoning</small>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Farm-specific details */}
                  {property.property_type === 'Farm' && (
                    <>
                      {property.water_source && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-water fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.water_source}</div>
                              <small className="text-muted">Water Source</small>
                            </div>
                          </div>
                        </div>
                      )}
                      {property.crop_types && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-seedling fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.crop_types}</div>
                              <small className="text-muted">Crop Types</small>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Property Description */}
            <div className="property-description bg-white rounded-3 shadow-sm p-4 mb-4">
              <h3 className="h4 fw-bold mb-3">
                <i className="fas fa-align-left me-2 text-primary"></i>
                Description
              </h3>
              <div className="description-content">
                <p className="text-muted lh-lg">{property.description}</p>
              </div>
            </div>

            {/* Property Features */}
            {property.features && Object.keys(property.features).length > 0 && (
              <div className="property-features bg-white rounded-3 shadow-sm p-4 mb-4">
                <h3 className="h4 fw-bold mb-3">
                  <i className="fas fa-star me-2 text-primary"></i>
                  Features & Amenities
                </h3>
                <div className="features-grid">
                  <div className="row g-3">
                    {Object.entries(property.features).map(([key, value]) => (
                      value && (
                        <div key={key} className="col-md-6 col-lg-4">
                          <div className="feature-item d-flex align-items-center p-2 rounded-2 bg-light">
                            <div className="feature-icon me-3">
                              <i className="fas fa-check-circle text-success"></i>
                            </div>
                            <span className="feature-text">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Always show owner card; use placeholders if profiles data isn't available yet */}
            <div className="owner-card bg-white rounded-3 shadow-sm p-4 mb-4">
              <h3 className="h4 fw-bold mb-3">
                <i className="fas fa-user me-2 text-primary"></i>
                Property Owner
              </h3>
              <div className="owner-profile d-flex align-items-center mb-3">
                <div className="owner-avatar me-3">
                  <img 
                    src={
                      property.profiles?.profile_photo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(((property.profiles?.firstname || 'Property') + ' ' + (property.profiles?.lastname || 'Owner')).trim())}&size=100&background=random&color=ffffff`
                    } 
                    alt={`${property.profiles?.firstname || 'Property'} ${property.profiles?.lastname || 'Owner'}`}
                    className="rounded-circle"
                    width="60"
                    height="60"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="owner-info">
                  <h4 className="h5 mb-1">
                    {property.profiles ? (
                      `${property.profiles.firstname} ${property.profiles.lastname}`
                    ) : (
                      'Owner'
                    )}
                  </h4>
                  <p className="text-muted mb-0">Property Owner</p>
                </div>
              </div>
              
              <div className="owner-contact mb-3">
                {property.profiles?.email ? (
                  <div className="contact-item d-flex align-items-center mb-2">
                    <i className="fas fa-envelope text-primary me-2"></i>
                    <span>{property.profiles.email}</span>
                  </div>
                ) : (
                  <small className="text-muted">Email not available</small>
                )}
                {property.profiles?.phone ? (
                  <div className="contact-item d-flex align-items-center mb-2">
                    <i className="fas fa-phone text-primary me-2"></i>
                    <span>{property.profiles.phone}</span>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              
              <div className="owner-actions">
                <div className="d-grid gap-2">
                  {property.profiles?.phone && (
                    <a 
                      href={`https://wa.me/${property.profiles.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                    >
                      <i className="fab fa-whatsapp me-2"></i>
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Property Location */}
            {property.location_url && (
              <div className="location-card bg-white rounded-3 shadow-sm p-4 mb-4">
                <h3 className="h4 fw-bold mb-3">
                  <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                  Location
                </h3>
                <div className="map-container ratio ratio-16x9">
                  <iframe 
                    src={property.location_url} 
                    allowFullScreen 
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location"
                    className="rounded-3"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
           {/* Similar Properties Section removed */}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
