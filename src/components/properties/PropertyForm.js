import React, { useState, useRef } from 'react';
import { PROPERTY_TYPE_FIELDS, PROPERTY_TYPES, COMMON_FEATURES, lebanonVillages, lebanonCities } from '../../utils/properties_const';

function PropertyForm({ mode = 'create', property = null, onSubmitSuccess }) {
  const mainImageInputRef = useRef(null);
  const additionalImagesInputRef = useRef(null);
  const currentYear = new Date().getFullYear();
  
  // State for form data
  const [form, setForm] = useState({
    propertyTitle: property?.title || '',
    propertyType: (property?.property_type === 'Challet' ? 'Chalet' : property?.property_type) || '',
    propertyStatus: property?.status || '',
    price: property?.price || '',
    governorate: property?.governate || '',
    city: property?.city || '',
    address: property?.address || '',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    parkingSpaces: property?.parking_spaces?.toString() || '',
    area: property?.area?.toString() || '',
    floor: property?.floor != null ? property?.floor.toString() : '',
    view: property?.view || '',
    yearBuilt: property?.year_built?.toString() || '',
    furnishingStatus: property?.furnishing_status || '',
    description: property?.description || '',
    status: property?.status || '',
    verified: property?.verified || false,
    featured: property?.is_featured || false,
    recommended: property?.recommended || false,
    airConditioning: property?.features?.air_conditioning || false,
    heating: property?.features?.heating || false,
    internet: property?.features?.internet || false,
    parking: property?.features?.parking || false,
    swimmingPool: property?.features?.swimming_pool || false,
    generator: property?.features?.generator || false,
    waterTank: property?.features?.water_tank || false,
    security: property?.features?.security || false,
    balcony: property?.features?.balcony || false,
    elevator: property?.features?.elevator || false,
    solarPanels: property?.features?.solar_panels || false,
    garden: property?.features?.garden || false,
    fireplace: property?.features?.fireplace || false,
    bbqArea: property?.features?.bbq_area || false,
    village: property?.village || '',
    livingrooms: property?.livingrooms?.toString() || '',
    garden_area: property?.garden_area?.toString() || '',
    location_url: property?.location_url || '',
    floors: property?.floors?.toString() || '',
    units: property?.units?.toString() || '',
    elevators: property?.elevators?.toString() || '',
    shop_front_width: property?.shop_front_width?.toString() || '',
    storage_area: property?.storage_area?.toString() || '',
    ceiling_height: property?.ceiling_height?.toString() || '',
    loading_docks: property?.loading_docks?.toString() || '',
    // Add Office-specific fields
    office_layout: property?.office_layout || '',
    meeting_rooms: property?.meeting_rooms?.toString() || '',
    // Add Farm-specific fields
    waterSource: property?.water_source || '',
    cropTypes: property?.crop_types || '',
    // Add features
    irrigation: property?.features?.irrigation || false,
    storage: property?.features?.storage || false,
    electricity: property?.features?.electricity || false,
    roadAccess: property?.features?.road_access || false,
    waterSource: property?.features?.water_source || false,  // Add water source as a feature
    // Add Land-specific fields
    plotSize: property?.plot_size?.toString() || '',
    landType: property?.land_type || '',
    zoning: property?.zoning || '',
  });

  // State for extra fields specific to property type
  const [extraFields, setExtraFields] = useState({});

  // State for file uploads
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  // State for cities based on governorate
  const [cities, setCities] = useState([]);
  const [cityDisabled, setCityDisabled] = useState(true);

  // State for villages based on city
  const [villages, setVillages] = useState([]);
  const [villageDisabled, setVillageDisabled] = useState(true);
  
  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [missingFields, setMissingFields] = useState([]);

  // Get current property type configuration
  const typeConfig = PROPERTY_TYPE_FIELDS[form.propertyType] || { 
    details: [], 
    features: [],
    showStandard: {
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true
    }
  };

  // Initialize form data when property is provided for editing
  React.useEffect(() => {
    if (property && mode === 'edit') {
      // console.log('Initializing form with property data:', property);
      // Initialize form with property data
      setForm({
        propertyTitle: property.title || '',
        propertyType: property.property_type === 'Challet' ? 'Chalet' : property.property_type || '',
        propertyStatus: property.status || '',
        price: property.price ? property.price.toLocaleString('en-US') : '',
        governorate: property.governate || '',
        city: property.city || '',
        address: property.address || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        parkingSpaces: property.parking_spaces?.toString() || '',
        area: property.area?.toString() || '',
        yearBuilt: property.year_built?.toString() || '',
        furnishingStatus: property.furnishing_status || '',
        description: property.description || '',
        status: property.status || '',
        verified: property.verified || false,
        featured: property.is_featured || false,
        recommended: property.recommended || false,
        village: property.village || '',
        livingrooms: property.livingrooms?.toString() || '',
        floor: property.floor?.toString() || '',
        view: property.view || '',
        garden_area: property.garden_area?.toString() || '',
        location_url: property.location_url || '',
        // Initialize building-specific fields with explicit null check
        units: property.units !== null ? property.units.toString() : '',
        elevators: property.elevators !== null ? property.elevators.toString() : '',
        // Initialize retail-specific fields with explicit null check
        shop_front_width: property.shop_front_width !== null ? property.shop_front_width.toString() : '',
        storage_area: property.storage_area !== null ? property.storage_area.toString() : '',
        // Initialize warehouse-specific fields with explicit null check
        ceiling_height: property.ceiling_height !== null ? property.ceiling_height.toString() : '',
        loading_docks: property.loading_docks !== null ? property.loading_docks.toString() : '',
        // Initialize farm-specific fields
        waterSource: property.property_type === 'Farm' ? property.water_source || '' : (property.features?.water_source ? 'true' : 'false'),
        cropTypes: property.crop_types || '',
        // Initialize features from the JSONB data
        airConditioning: property.features?.air_conditioning || false,
        heating: property.features?.heating || false,
        internet: property.features?.internet || false,
        parking: property.features?.parking || false,
        swimmingPool: property.features?.swimming_pool || false,
        generator: property.features?.generator || false,
        waterTank: property.features?.water_tank || false,
        security: property.features?.security || false,
        balcony: property.features?.balcony || false,
        elevator: property.features?.elevator || false,
        solarPanels: property.features?.solar_panels || false,
        garden: property.features?.garden || false,
        fireplace: property.features?.fireplace || false,
        bbqArea: property.features?.bbq_area || false,
        // Initialize features
        irrigation: property.features?.irrigation || false,
        storage: property.features?.storage || false,
        electricity: property.features?.electricity || false,
        roadAccess: property.features?.road_access || false,
        // Initialize Land-specific fields
        plotSize: property.plot_size?.toString() || '',
        landType: property.land_type || '',
        zoning: property.zoning || '',
        // Add Office-specific fields
        office_layout: property.office_layout || '',
        meeting_rooms: property.meeting_rooms?.toString() || '',
      });

      // console.log('Warehouse fields:', {
      //   ceiling_height: property.ceiling_height,
      //   loading_docks: property.loading_docks
      // });

      // Initialize cities if governorate is present
      if (property.governate) {
        setCities(lebanonCities[property.governate] || []);
        setCityDisabled(false);
      }

      // Initialize villages if city is present
      if (property.city) {
        setVillages(lebanonVillages[property.city] || []);
        setVillageDisabled(false);
      }

      // console.log('Form initialized with retail fields:', {
      //   shop_front_width: property.shop_front_width,
      //   storage_area: property.storage_area
      // });
    }
  }, [property, mode]);

  // Reset extra fields when property type changes
  React.useEffect(() => {
    if (form.propertyType) {
      const cfg = PROPERTY_TYPE_FIELDS[form.propertyType] || { details: [], features: [] };

      // Determine if current type supports a floor field
      const supportsFloor = cfg.details.some(d => d.name === 'floor');

      // Build feature checkbox defaults
      const newFeatureState = {};
      cfg.features.forEach(feat => {
        newFeatureState[feat] = form[feat] || false;
      });

      setForm(prev => ({
        ...prev,
        ...newFeatureState,
        // Clear floor only if the type does NOT support it
        floor: supportsFloor ? prev.floor : ''
      }));
    }
  }, [form.propertyType]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // console.log('Input change:', { name, value, type: typeof value });
    
    // Special handling for numeric fields
    if (['floor', 'garden_area', 'bedrooms', 'bathrooms', 'livingrooms', 'parkingSpaces', 'area'].includes(name)) {
      // Allow empty string or valid numbers
      if (value === '' || !isNaN(value)) {
        if (name === 'garden_area') {
          // Disallow negative values for garden area
          if (value === '' || Number(value) >= 0) {
            setForm(prev => ({
              ...prev,
              [name]: value === '' ? '' : value
            }));
          }
        } else if (name === 'floor') {
          // Handle floor field based on property type
          if (form.propertyType === 'Villa' || form.propertyType === 'Building') {
            // For Villa and Building types, ensure floor is a positive integer
            const floorValue = value === '' ? '' : parseInt(value);
            if (floorValue !== '' && floorValue < 1) {
              return; // Don't update if value is less than 1
            }
            setForm(prev => ({
              ...prev,
              [name]: floorValue
            }));
            // console.log('Updated floor value:', floorValue);
          } else if (form.propertyType === 'Apartment') {
            // For Apartments, allow any non-negative integer
            const floorValue = value === '' ? '' : parseInt(value);
            if (floorValue !== '' && floorValue < 0) {
              return; // Don't update if value is negative
            }
            setForm(prev => ({
              ...prev,
              [name]: floorValue
            }));
            // console.log('Updated apartment floor value:', floorValue);
          } else {
            setForm(prev => ({
              ...prev,
              [name]: value === '' ? '' : parseInt(value)
            }));
          }
        } else {
          setForm(prev => ({
            ...prev,
            [name]: value === '' ? '' : value
          }));
        }
      }
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle extra field changes
  const handleExtraFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric fields for building type
    if (name === 'floor' || name === 'units' || name === 'elevators') {
      if (value === '' || !isNaN(value)) {
        // console.log(`Updating ${name} to:`, value);
        setForm(prev => {
          const newForm = {
            ...prev,
            [name]: value === '' ? '' : value
          };
          // console.log(`New form state for ${name}:`, newForm[name]);
          return newForm;
        });
      }
    } else if (name === 'garden_area') {
      // Extra field change for garden area – clamp at 0
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        setForm(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm({
      ...form,
      [name]: checked
    });
  };

  // Handle governorate change and load cities
  const handleGovernorateChange = (e) => {
    const selectedGovernorate = e.target.value;
    
    setForm(prev => ({ 
      ...prev, 
      governorate: selectedGovernorate, 
      city: '', 
      village: '' 
    }));
    
    if (selectedGovernorate) {
      const availableCities = lebanonCities[selectedGovernorate] || [];
      setCities(availableCities);
      setCityDisabled(false);
    } else {
      setCities([]);
      setCityDisabled(true);
    }
    
    setVillages([]);
    setVillageDisabled(true);
  };

  // Handle city change and load villages
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    
    setForm(prev => ({ ...prev, city: selectedCity, village: '' }));

    if (selectedCity) {
      const availableVillages = lebanonVillages[selectedCity] || [];
      setVillages(availableVillages);
      setVillageDisabled(false);
      
      if (availableVillages.length === 1) {
        setForm(prev => ({ ...prev, village: availableVillages[0] }));
      }
    } else {
      setVillages([]);
      setVillageDisabled(true);
    }
  };

  // Handle location URL field
  const handleLocationUrlChange = (e) => {
    setForm({ ...form, location_url: e.target.value });
  };

  // Handle main image changes
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        e.target.value = '';
        return;
      }
      
      if (!file.type.match('image.*')) {
        alert('Please select an image file.');
        e.target.value = '';
        return;
      }
      
      setMainImage(file);
    }
  };

  // Handle additional images changes
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      alert('You can select a maximum of 10 images.');
      e.target.value = '';
      return;
    }
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 5 * 1024 * 1024) {
        alert(`File "${files[i].name}" exceeds 5MB. Please choose smaller images.`);
        e.target.value = '';
        return;
      }
      
      if (!files[i].type.match('image.*')) {
        alert(`File "${files[i].name}" is not an image. Please select only image files.`);
        e.target.value = '';
        return;
      }
    }
    
    setAdditionalImages(files);
  };

  // Format price with commas
  const formatPrice = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value) {
      value = parseInt(value, 10).toLocaleString('en-US');
    }
    
    setForm({
      ...form,
      price: value
    });
  };

  // Function to validate required fields
  const validateForm = () => {
    const requiredFields = [
      'propertyTitle',
      'propertyType',
      'price',
      'governorate',
      'city',
      'address',
      'description',
      'area'
    ];

    // Add property type specific required fields
    if (form.propertyType === 'Farm') {
      requiredFields.push('waterSource', 'cropTypes');
    }

    // Add Land-specific required fields
    if (form.propertyType === 'Land') {
      requiredFields.push('plotSize', 'landType', 'zoning');
    }

    // Add Warehouse-specific required fields
    if (form.propertyType === 'Warehouse') {
      requiredFields.push('ceiling_height', 'loading_docks');
    }

    // Add Office-specific required fields
    if (form.propertyType === 'Office') {
      requiredFields.push('office_layout', 'meeting_rooms');
    }

    const numericFields = {
      bedrooms: { min: 0, max: 20 },
      bathrooms: { min: 0, max: 15 },
      livingrooms: { min: 0, max: 10 },
      area: { min: 1 },
      floor: { min: form.propertyType === 'Villa' ? 1 : -5, max: 200 },
      year_built: { min: 1800, max: currentYear },
      garden_area: { min: 0 },
      units: { min: 1, max: 1000 },
      elevators: { min: 0, max: 20 },
      plotSize: { min: 1 },
      ceiling_height: { min: 0 },
      loading_docks: { min: 0 },
      meeting_rooms: { min: 0, max: 50 }
    };

    const errors = [];
    const missing = [];

    requiredFields.forEach(field => {
      const value = form[field];
      const isEmpty = 
        value === undefined || 
        value === null || 
        value === '' || 
        (typeof value === 'string' && value.trim() === '');
      
      if (isEmpty) {
        missing.push(field);
      }
    });

    Object.entries(numericFields).forEach(([field, range]) => {
      if (form[field] !== '' && form[field] !== null && form[field] !== undefined) {
        const value = Number(form[field]);
        if (isNaN(value)) {
          errors.push(`${field} must be a valid number`);
        } else {
          if (range.min !== undefined && value < range.min) {
            errors.push(`${field} must be at least ${range.min}`);
          }
          if (range.max !== undefined && value > range.max) {
            errors.push(`${field} must be no more than ${range.max}`);
          }
        }
      }
    });

    // Validate Farm-specific fields
    if (form.propertyType === 'Farm') {
      if (!form.waterSource) {
        missing.push('waterSource');
      }
      if (!form.cropTypes) {
        missing.push('cropTypes');
      }
      if (form.yearBuilt === '') {
        missing.push('yearBuilt');
      }
    }

    return { isValid: errors.length === 0 && missing.length === 0, errors, missing };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setMissingFields([]);

    try {
      // console.log('Form values before submission:', {
      //   floor: form.floor,
      //   garden_area: form.garden_area,
      //   shop_front_width: form.shop_front_width,
      //   storage_area: form.storage_area,
      //   ceiling_height: form.ceiling_height,
      //   loading_docks: form.loading_docks,
      //   allForm: form
      // });

      const validationResult = validateForm();
      if (!validationResult.isValid) {
        setMissingFields(validationResult.missing);
        validationResult.missing.forEach(field => {
          alert(`Please fill in the ${field} field`);
        });
        validationResult.errors.forEach(error => {
          alert(error);
        });
        setIsSubmitting(false);
        return;
      }

      // Additional validation for Villa and Building types
      if ((form.propertyType === 'Villa' || form.propertyType === 'Building') && (!form.floor || form.floor < 1)) {
        alert(`Please enter a valid number of floors (minimum 1) for the ${form.propertyType.toLowerCase()}`);
        setIsSubmitting(false);
        return;
      }

      // Validate Land-specific fields
      if (form.propertyType === 'Land') {
        if (!form.plotSize) {
          alert('Please enter the plot size');
          setIsSubmitting(false);
          return;
        }
        if (!form.landType) {
          alert('Please select the land type');
          setIsSubmitting(false);
          return;
        }
        if (!form.zoning) {
          alert('Please select the zoning');
          setIsSubmitting(false);
          return;
        }
      }

      // For now, just pass the form data to onSubmitSuccess
      // console.log('Form state before submission:', form);
      
      const cfg = PROPERTY_TYPE_FIELDS[form.propertyType] || { details: [] };
      const supportsFloorField = cfg.details.some(d => d.name === 'floor');

      const formData = {
        title: form.propertyTitle,
        property_type: form.propertyType === 'Challet' ? 'Chalet' : form.propertyType,
        status: form.status,
        price: form.price ? parseFloat(form.price.replace(/,/g, '')) : null,
        governate: form.governorate,
        city: form.city,
        village: form.village || null,
        address: form.address,
        bedrooms: form.propertyType === 'Building' ? null : (form.bedrooms ? parseInt(form.bedrooms) : null),
        bathrooms: form.propertyType === 'Building' ? null : (form.bathrooms ? parseInt(form.bathrooms) : null),
        parking_spaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : null,
        area: form.area ? parseFloat(form.area) : null,
        year_built: form.yearBuilt ? parseInt(form.yearBuilt) : null,
        furnishing_status: form.furnishingStatus || null,
        description: form.description,
        verified: form.verified || false,
        is_featured: form.featured || false,
        recommended: form.recommended || false,
        livingrooms: form.propertyType === 'Building' ? null : (form.livingrooms ? parseInt(form.livingrooms) : null),
        floor: supportsFloorField ? (form.floor !== '' && form.floor !== null ? parseInt(form.floor) : null) : null,
        garden_area: form.garden_area ? parseFloat(form.garden_area) : null,
        location_url: form.location_url || null,
        view: form.view || null,
        // Building-specific fields
        units: form.propertyType === 'Building' ? (form.units ? parseInt(form.units) : null) : null,
        elevators: form.propertyType === 'Building' ? (form.elevators ? parseInt(form.elevators) : null) : null,
        // Retail-specific fields
        shop_front_width: form.propertyType === 'Retail' ? (form.shop_front_width ? parseFloat(form.shop_front_width) : null) : null,
        storage_area: form.propertyType === 'Retail' ? (form.storage_area ? parseFloat(form.storage_area) : null) : null,
        // Farm-specific fields
        water_source: form.propertyType === 'Farm' ? form.waterSource || null : null,
        crop_types: form.cropTypes || null,
        features: {
          air_conditioning: form.airConditioning || false,
          heating: form.heating || false,
          internet: form.internet || false,
          parking: form.parking || false,
          swimming_pool: form.swimmingPool || false,
          generator: form.generator || false,
          water_tank: form.waterTank || false,
          security: form.security || false,
          balcony: form.balcony || false,
          elevator: form.elevator || false,
          solar_panels: form.solarPanels || false,
          garden: form.garden || false,
          fireplace: form.fireplace || false,
          bbq_area: form.bbqArea || false,
          // Add Farm-specific features
          irrigation: form.irrigation || false,
          storage: form.storage || false,
          electricity: form.electricity || false,
          road_access: form.roadAccess || false,
          // Add water source as a feature for Land type
          water_source: form.propertyType === 'Land' ? form.waterSource || false : false
        },
        // Land-specific fields
        plot_size: form.plotSize ? parseFloat(form.plotSize) : null,
        land_type: form.landType || null,
        zoning: form.zoning || null,
        // Warehouse-specific fields
        ceiling_height: form.ceiling_height ? parseFloat(form.ceiling_height) : null,
        loading_docks: form.loading_docks ? parseInt(form.loading_docks) : null,
        // Office-specific fields
        office_layout: form.office_layout || null,
        meeting_rooms: form.meeting_rooms ? parseInt(form.meeting_rooms) : null,
      };

      // console.log('FormData being sent to backend:', {
      //   floor: formData.floor,
      //   garden_area: formData.garden_area,
      //   units: formData.units,
      //   elevators: formData.elevators,
      //   propertyType: formData.property_type,
      //   allFormData: formData
      // });
      
      // Additional validation for Building type
      if (formData.property_type === 'Building') {
        if (!form.units || form.units === '') {
          alert('Please enter the number of units for the building');
          setIsSubmitting(false);
          return;
        }
        if (!form.elevators || form.elevators === '') {
          alert('Please enter the number of elevators for the building');
          setIsSubmitting(false);
          return;
        }
      }

      if (onSubmitSuccess) {
        await onSubmitSuccess(formData);
        // console.log('Form submission successful');
      }

      // Reset form if not in modal
      if (!onSubmitSuccess) {
        setForm({
          propertyTitle: '',
          propertyType: '',
          propertyStatus: '',
          price: '',
          governorate: '',
          city: '',
          address: '',
          bedrooms: '',
          bathrooms: '',
          parkingSpaces: '',
          area: '',
          yearBuilt: '',
          furnishingStatus: '',
          description: '',
          status: '',
          verified: false,
          featured: false,
          recommended: false,
          floor: '',
          garden_area: '',
          units: '',
          elevators: '',
          waterSource: '',
          cropTypes: '',
          // Reset Farm-specific features
          irrigation: false,
          storage: false,
          electricity: false,
          roadAccess: false,
          solarPanels: false,
          // Reset Land-specific fields
          plotSize: '',
          landType: '',
          zoning: '',
          // Reset warehouse-specific fields
          ceiling_height: '',
          loading_docks: '',
          // Reset Office-specific fields
          office_layout: '',
          meeting_rooms: '',
        });
        setMainImage(null);
        setAdditionalImages([]);
        setExtraFields({});

        if (mainImageInputRef.current) {
          mainImageInputRef.current.value = '';
        }
        if (additionalImagesInputRef.current) {
          additionalImagesInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Property submission error:', err);
      setSubmitError(err.message || 'Failed to submit property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {submitError && (
          <div className="alert alert-danger" role="alert">
            {submitError}
          </div>
        )}
        <div className="bg-light rounded p-3">
          <div className="bg-white rounded p-4" style={{border: '1px dashed rgba(0, 185, 142, .3)'}}>
            <div className="row g-5 align-items-center">
              <div className="col-lg-12 wow fadeIn" data-wow-delay="0.1s">
                <form id="propertyForm" onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="bg-light rounded p-3 mb-2">
                        <h4 className="mb-0">Basic Information</h4>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className={`form-control${missingFields.includes('propertyTitle') ? ' is-invalid' : ''}`}
                          id="propertyTitle" 
                          name="propertyTitle"
                          placeholder="Property Title"
                          value={form.propertyTitle}
                          onChange={handleInputChange}
                          required
                        />
                        <label htmlFor="propertyTitle">Property Title</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select 
                          className="form-select" 
                          id="propertyType"
                          name="propertyType"
                          value={form.propertyType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="" disabled>Select Type</option>
                          {PROPERTY_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <label htmlFor="propertyType">Property Type</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select 
                          className="form-select" 
                          id="status"
                          name="status"
                          value={form.status}
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>Select Status</option>
                          <option value="For Sale">For Sale</option>
                          <option value="For Rent">For Rent</option>
                        </select>
                        <label htmlFor="status">Property Status</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="price" 
                          name="price"
                          placeholder="Price"
                          value={form.price}
                          onChange={formatPrice}
                        />
                        <label htmlFor="price">Price (USD)</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-light rounded p-3 mb-2 mt-3">
                        <h4 className="mb-0">Property Location</h4>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select 
                          className="form-select" 
                          id="governorate"
                          name="governorate"
                          value={form.governorate}
                          onChange={handleGovernorateChange}
                        >
                          <option value="" disabled>Select Governorate</option>
                          <option value="Beirut">Beirut</option>
                          <option value="Mount Lebanon">Mount Lebanon</option>
                          <option value="North Lebanon">North Lebanon</option>
                          <option value="South Lebanon">South Lebanon</option>
                          <option value="Bekaa">Bekaa</option>
                          <option value="Nabatieh">Nabatieh</option>
                          <option value="Akkar">Akkar</option>
                          <option value="Baalbek-Hermel">Baalbek-Hermel</option>
                        </select>
                        <label htmlFor="governorate">Governorate</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select 
                          className="form-select" 
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleCityChange}
                          disabled={cityDisabled}
                        >                          <option value="">Select City</option>
                          {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                          ))}
                        </select>
                        <label htmlFor="city">City/District</label>
                      </div>
                    </div>
                     <div className="col-md-6">
                      <div className="form-floating">
                        <select 
                          className="form-select" 
                          id="village"
                          name="village"
                          value={form.village || ''}
                          onChange={handleInputChange}
                          disabled={!form.city || villageDisabled}
                        >
                          <option value="">Select Village/Suburb</option>
                          {villages.map((village, index) => (
                            <option key={index} value={village}>{village}</option>
                          ))}
                        </select>
                        <label htmlFor="village">Village/Suburb</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="address" 
                          name="address"
                          placeholder="Detailed Address"
                          value={form.address}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="address">Detailed Address</label>
                      </div>
                    </div>
                   
                   
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="url"
                          className="form-control"
                          id="location_url"
                          name="location_url"
                          placeholder="Enter Google Maps URL"
                          value={form.location_url || ''}
                          onChange={handleLocationUrlChange}
                        />
                        <label htmlFor="location_url">Location URL</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-light rounded p-3 mb-2 mt-3">
                        <h4 className="mb-0">Property Details</h4>
                      </div>
                    </div>
                    
                    {/* Area field (always shown) */}
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="number" 
                          className="form-control" 
                          id="area" 
                          name="area"
                          placeholder="Area"
                          value={form.area}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
                        />
                        <label htmlFor="area">Area (m²)</label>
                      </div>
                    </div>
                    
                    {/* Dynamic property-specific fields */}
                    {typeConfig.details.map(field => (
                      <div className="col-md-6" key={field.name}>
                        <div className="form-floating">
                          {field.type === 'select' ? (
                            <select
                              className="form-select"
                              id={field.name}
                              name={field.name}
                              value={form[field.name] || ''}
                              onChange={handleInputChange}
                              required={field.required}
                            >
                              <option value="">{field.placeholder || `Select ${field.label}`}</option>
                              {field.options && field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              className="form-control"
                              id={field.name}
                              name={field.name}
                              placeholder={field.placeholder || field.label}
                              value={form[field.name] || ''}
                              onChange={handleInputChange}
                              min={field.min}
                              max={field.max}
                              step={field.step || "1"}
                              required={field.required}
                            />
                          )}
                          <label htmlFor={field.name}>{field.label}</label>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Retail Space specific fields */}
                    {form.propertyType === 'Retail Space' && (
                      <>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="number"
                              className="form-control"
                              id="shop_front_width"
                              name="shop_front_width"
                              placeholder="Shop Front Width"
                              value={form.shop_front_width}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                            />
                            <label htmlFor="shop_front_width">Shop Front Width (m)</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="number"
                              className="form-control"
                              id="storage_area"
                              name="storage_area"
                              placeholder="Storage Area"
                              value={form.storage_area}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                            />
                            <label htmlFor="storage_area">Storage Area (m²)</label>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Conditionally show standard fields based on property type */}
                    {typeConfig.showStandard.bedrooms && (
                      <div className="col-md-3">
                        <div className="form-floating">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="bedrooms" 
                            name="bedrooms"
                            placeholder="Bedrooms"
                            value={form.bedrooms}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                          />
                          <label htmlFor="bedrooms">Bedrooms</label>
                        </div>
                      </div>
                    )}
                    
                    {typeConfig.showStandard.bathrooms && (
                      <div className="col-md-3">
                        <div className="form-floating">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="bathrooms" 
                            name="bathrooms"
                            placeholder="Bathrooms"
                            value={form.bathrooms}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                          />
                          <label htmlFor="bathrooms">Bathrooms</label>
                        </div>
                      </div>
                    )}
                    
                    {typeConfig.showStandard.livingrooms && (
                      <div className="col-md-3">
                        <div className="form-floating">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="livingrooms" 
                            name="livingrooms"
                            placeholder="Living Rooms"
                            value={form.livingrooms}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                          />
                          <label htmlFor="livingrooms">Living Rooms</label>
                        </div>
                      </div>
                    )}
                    
                    {typeConfig.showStandard.parkingSpaces && (
                      <div className="col-md-3">
                        <div className="form-floating">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="parkingSpaces" 
                            name="parkingSpaces"
                            placeholder="Parking Spaces"
                            value={form.parkingSpaces}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                          />
                          <label htmlFor="parkingSpaces">Parking Spaces</label>
                        </div>
                      </div>
                    )}
                    
                    {typeConfig.showStandard.yearBuilt && (
                      <div className="col-md-3">
                        <div className="form-floating">
                          <select
                            className="form-select"
                            id="yearBuilt"
                            name="yearBuilt"
                            value={form.yearBuilt || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Year Built</option>
                            {years.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <label htmlFor="yearBuilt">Year Built</label>
                        </div>
                      </div>
                    )}
                    
                    {typeConfig.showStandard.furnishingStatus && (
                      <div className="col-md-3">
                        <div className="form-floating">
                          <select 
                            className="form-select" 
                            id="furnishingStatus"
                            name="furnishingStatus"
                            value={form.furnishingStatus}
                            onChange={handleInputChange}
                          >
                            <option value="" disabled>Select Status</option>
                            <option value="Furnished">Furnished</option>
                            <option value="Semi-Furnished">Semi-Furnished</option>
                            <option value="Unfurnished">Unfurnished</option>
                          </select>
                          <label htmlFor="furnishingStatus">Furnishing Status</label>
                        </div>
                      </div>
                    )}
                    
                    {form.propertyType && (
                      <div className="col-12">
                        <div className="bg-light rounded p-3 mb-2 mt-3">
                          <h4 className="mb-0">Property Features</h4>
                        </div>
                      </div>
                    )}
                    
                                       {/* Dynamic property features */}
                    {form.propertyType && typeConfig.features.map(featureKey => (
                      <div className="col-md-4" key={featureKey}>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={featureKey}
                            name={featureKey}
                            checked={form[featureKey] || false}
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor={featureKey}>
                            {COMMON_FEATURES[featureKey] || featureKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <div className="col-12">
                      <div className="bg-light rounded p-3 mb-2 mt-3">
                        <h4 className="mb-0">Property Description</h4>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea 
                          className="form-control" 
                          placeholder="Description" 
                          id="description"
                          name="description"
                          style={{height: '150px'}}
                          value={form.description}
                          onChange={handleInputChange}
                        ></textarea>
                        <label htmlFor="description">Description</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-light rounded p-3 mb-2 mt-3">
                        <h4 className="mb-0">Property Images</h4>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="mainImage" className="form-label">Main Image (Cover Photo)</label>
                        {mode === 'edit' && property?.main_image && (
                          <div className="mb-2">
                            <img 
                              src={property.main_image} 
                              alt="Current main image" 
                              style={{ maxWidth: '200px', display: 'block' }} 
                              className="mb-2"
                            />
                            <small className="text-muted">Current main image</small>
                          </div>
                        )}
                        <input 
                          className="form-control" 
                          type="file" 
                          id="mainImage" 
                          accept="image/*"
                          onChange={handleMainImageChange}
                          ref={mainImageInputRef}
                          required={mode !== 'edit'}
                        />
                        <div className="form-text">
                          {mode === 'edit' 
                            ? "Leave empty to keep the current main image. Recommended size: 1200 x 800 pixels. Max file size: 5MB" 
                            : "Recommended size: 1200 x 800 pixels. Max file size: 5MB"}
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="additionalImages" className="form-label">Additional Images (Select multiple)</label>
                        {mode === 'edit' && property?.images?.length > 0 && (
                          <div className="mb-2">
                            <div className="row">
                              {property.images.map((img, index) => (
                                <div key={index} className="col-md-3 mb-2">
                                  <img 
                                    src={img} 
                                    alt={`Current image ${index + 1}`} 
                                    style={{ maxWidth: '100%', display: 'block' }} 
                                    className="mb-1"
                                  />
                                </div>
                              ))}
                            </div>
                            <small className="text-muted">Current additional images</small>
                          </div>
                        )}
                        <input 
                          className="form-control" 
                          type="file" 
                          id="additionalImages" 
                          multiple 
                          accept="image/*"
                          onChange={handleAdditionalImagesChange}
                          ref={additionalImagesInputRef}
                          required={mode !== 'edit'}
                        />
                        <div className="form-text">
                          {mode === 'edit' 
                            ? "Leave empty to keep the current additional images. You can select up to 10 additional images. Max file size: 5MB each"
                            : "You can select up to 10 additional images. Max file size: 5MB each"}
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-light rounded p-3 mb-2">
                        <h4 className="mb-0">Property Status</h4>
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="verified"
                            name="verified"
                            checked={form.verified}
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor="verified">
                            Verified Property
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="featured"
                            name="featured"
                            checked={form.featured}
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor="featured">
                            Featured Property
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="recommended"
                            name="recommended"
                            checked={form.recommended}
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor="recommended">
                            Recommended Property
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 mt-4">
                      <button className="btn btn-primary w-100 py-3" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Property'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyForm;


