import React, { useState, useEffect, useRef } from 'react';
import Layout from './Layout';
import { Card, Row, Col, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea, FaCalendarAlt, FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  getAnalyticsOverview,
  getPropertyViewsData, 
  getPropertyListingsData, 
  getPropertyTypesData,
  getTopPerformingProperties
} from '../services/analytics';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  // State for date range
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  
  // State for analytics data
  const [overviewData, setOverviewData] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    conversionRate: 0
  });
  
  const [viewsData, setViewsData] = useState({
    labels: [],
    datasets: []
  });
  
  const [listingsData, setListingsData] = useState({
    labels: [],
    datasets: []
  });
  
  const [propertyTypesData, setPropertyTypesData] = useState({
    labels: [],
    datasets: []
  });
  
  const [topProperties, setTopProperties] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report generation states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Refs for capturing charts
  const viewsChartRef = useRef(null);
  const typesChartRef = useRef(null);
  const listingsChartRef = useRef(null);
  const tableRef = useRef(null);
  const reportContentRef = useRef(null);

  // Load analytics data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  // Function to fetch all analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    // Format dates for API
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    try {
      // Fetch overview data
      const overview = await getAnalyticsOverview(formattedStartDate, formattedEndDate);
      setOverviewData(overview);
      
      // Fetch views data
      const views = await getPropertyViewsData(formattedStartDate, formattedEndDate);
      setViewsData(views);
      
      // Fetch listings data
      const listings = await getPropertyListingsData(formattedStartDate, formattedEndDate);
      setListingsData(listings);
      
      // Fetch property types data
      const propertyTypes = await getPropertyTypesData(formattedStartDate, formattedEndDate);
      setPropertyTypesData(propertyTypes);
      
      // Fetch top performing properties
      const topPerforming = await getTopPerformingProperties(5, formattedStartDate, formattedEndDate);
      setTopProperties(topPerforming);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
      
      // Set fallback data for better UX in case of errors
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };
  
  // Apply date filter
  const handleApplyDateFilter = () => {
    fetchAnalyticsData();
  };
  
  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  
  // Set fallback data in case of API errors
  const setFallbackData = () => {
    // Set fallback data for views chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    setViewsData({
      labels: months,
      datasets: [
        {
          label: 'Property Views',
          data: [1500, 1800, 2200, 2400, 2800, 3100, 3400, 3800, 4200, 4500, 4800, 5200],
          borderColor: 'rgb(78, 115, 223)',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          tension: 0.3,
          fill: true
        }
      ]
    });
    
    setListingsData({
      labels: months,
      datasets: [
        {
          label: 'For Sale',
          data: [65, 72, 86, 81, 90, 95, 87, 92, 98, 102, 110, 115],
          backgroundColor: 'rgba(78, 115, 223, 0.8)',
        },
        {
          label: 'For Rent',
          data: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
          backgroundColor: 'rgba(28, 200, 138, 0.8)',
        }
      ]
    });
    
    setPropertyTypesData({
      labels: ['Apartment', 'House', 'Villa', 'Studio', 'Penthouse'],
      datasets: [
        {
          data: [35, 25, 15, 15, 10],
          backgroundColor: [
            'rgba(78, 115, 223, 0.8)',
            'rgba(28, 200, 138, 0.8)',
            'rgba(54, 185, 204, 0.8)',
            'rgba(246, 194, 62, 0.8)',
            'rgba(231, 74, 59, 0.8)'
          ],
          borderWidth: 1,
        },
      ],
    });
    
    setTopProperties([
      { id: 1, title: 'Modern Apartment in Downtown', views: 1245, inquiries: 32, conversion: '2.57%' },
      { id: 2, title: 'Luxury Villa with Pool', views: 1120, inquiries: 28, conversion: '2.50%' },
      { id: 3, title: 'Penthouse with City View', views: 980, inquiries: 25, conversion: '2.55%' },
      { id: 4, title: 'Family Home with Garden', views: 850, inquiries: 20, conversion: '2.35%' },
      { id: 5, title: 'Cozy Studio for Rent', views: 780, inquiries: 18, conversion: '2.31%' }
    ]);
  };
  
  // Generate report
  const generateReport = () => {
    setShowReportModal(true);
  };
  
  // Handle report type selection
  const handleReportTypeChange = (type) => {
    setReportType(type);
  };
  
  // Generate PDF report
  const generatePDFReport = async () => {
    setGeneratingReport(true);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title and date range
      pdf.setFontSize(18);
      pdf.text('Analytics Report', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });
      
      // Add overview data
      pdf.setFontSize(14);
      pdf.text('Overview', 15, 35);
      pdf.setFontSize(10);
      pdf.text(`Total Properties: ${overviewData.totalProperties}`, 15, 45);
      pdf.text(`Total Views: ${overviewData.totalViews}`, 15, 50);
      pdf.text(`Total Inquiries: ${overviewData.totalInquiries}`, 15, 55);
      pdf.text(`Conversion Rate: ${overviewData.conversionRate}%`, 15, 60);
      
      // Capture and add charts
      if (viewsChartRef.current) {
        const viewsCanvas = await html2canvas(viewsChartRef.current);
        const viewsImgData = viewsCanvas.toDataURL('image/png');
        pdf.addImage(viewsImgData, 'PNG', 15, 70, 180, 80);
      }
      
      if (typesChartRef.current) {
        const typesCanvas = await html2canvas(typesChartRef.current);
        const typesImgData = typesCanvas.toDataURL('image/png');
        pdf.addImage(typesImgData, 'PNG', 15, 160, 180, 80);
      }
      
      // Add new page for more charts and table
      pdf.addPage();
      
      if (listingsChartRef.current) {
        const listingsCanvas = await html2canvas(listingsChartRef.current);
        const listingsImgData = listingsCanvas.toDataURL('image/png');
        pdf.addImage(listingsImgData, 'PNG', 15, 15, 180, 80);
      }
      
      // Add top properties table
      pdf.setFontSize(14);
      pdf.text('Top Performing Properties', 15, 110);
      
      // Set up table headers
      pdf.setFontSize(10);
      pdf.text('ID', 15, 120);
      pdf.text('Property Title', 35, 120);
      pdf.text('Views', 120, 120);
      pdf.text('Inquiries', 145, 120);
      pdf.text('Conversion', 170, 120);
      
      // Add table rows
      let yPosition = 125;
      topProperties.forEach((property, index) => {
        pdf.text(property.id.toString().substring(0, 5), 15, yPosition);
        pdf.text(property.title.substring(0, 40), 35, yPosition);
        pdf.text(property.views.toString(), 120, yPosition);
        pdf.text(property.inquiries.toString(), 145, yPosition);
        pdf.text(property.conversion, 170, yPosition);
        yPosition += 7;
      });
      
      // Save the PDF
      pdf.save(`Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setGeneratingReport(false);
      setShowReportModal(false);
    }
  };
  
  // Generate Excel report
  const generateExcelReport = () => {
    setGeneratingReport(true);
    
    try {
      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();
      
      // Overview sheet
      const overviewData = [
        ['Analytics Report'],
        [`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
        [''],
        ['Overview'],
        ['Total Properties', overviewData.totalProperties],
        ['Total Views', overviewData.totalViews],
        ['Total Inquiries', overviewData.totalInquiries],
        ['Conversion Rate', `${overviewData.conversionRate}%`]
      ];
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, overviewSheet, 'Overview');
      
      // Property views sheet
      const viewsSheetData = [
        ['Property Views by Month'],
        ['Month', 'Views']
      ];
      
      viewsData.labels.forEach((month, index) => {
        viewsSheetData.push([month, viewsData.datasets[0].data[index]]);
      });
      const viewsSheet = XLSX.utils.aoa_to_sheet(viewsSheetData);
      XLSX.utils.book_append_sheet(wb, viewsSheet, 'Property Views');
      
      // Property listings sheet
      const listingsSheetData = [
        ['Property Listings by Month'],
        ['Month', 'For Sale', 'For Rent']
      ];
      
      listingsData.labels.forEach((month, index) => {
        listingsSheetData.push([
          month, 
          listingsData.datasets[0].data[index], 
          listingsData.datasets[1].data[index]
        ]);
      });
      const listingsSheet = XLSX.utils.aoa_to_sheet(listingsSheetData);
      XLSX.utils.book_append_sheet(wb, listingsSheet, 'Property Listings');
      
      // Property types sheet
      const typesSheetData = [
        ['Property Types Distribution'],
        ['Type', 'Count']
      ];
      
      propertyTypesData.labels.forEach((type, index) => {
        typesSheetData.push([type, propertyTypesData.datasets[0].data[index]]);
      });
      const typesSheet = XLSX.utils.aoa_to_sheet(typesSheetData);
      XLSX.utils.book_append_sheet(wb, typesSheet, 'Property Types');
      
      // Top properties sheet
      const topPropertiesSheetData = [
        ['Top Performing Properties'],
        ['ID', 'Property Title', 'Views', 'Inquiries', 'Conversion Rate']
      ];
      
      topProperties.forEach(property => {
        topPropertiesSheetData.push([
          property.id,
          property.title,
          property.views,
          property.inquiries,
          property.conversion
        ]);
      });
      const topPropertiesSheet = XLSX.utils.aoa_to_sheet(topPropertiesSheetData);
      XLSX.utils.book_append_sheet(wb, topPropertiesSheet, 'Top Properties');
      
      // Generate Excel file
      XLSX.writeFile(wb, `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setGeneratingReport(false);
      setShowReportModal(false);
    }
  };
  
  // Handle report generation based on selected type
  const handleGenerateReport = () => {
    if (reportType === 'pdf') {
      generatePDFReport();
    } else {
      generateExcelReport();
    }
  };

  return (
    <Layout>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Analytics Dashboard</h1>
        <Button variant="primary" onClick={generateReport}>
          <FaDownload className="mr-2" /> Generate Report
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* Date Range Selector */}
      <Card className="shadow mb-4">
        <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
          <h6 className="m-0 font-weight-bold text-primary">Date Range</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <div>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="form-control"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <div>
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="form-control"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                className="mb-3 w-100" 
                onClick={handleApplyDateFilter}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Apply'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Overview Cards */}
      <Row>
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Properties
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{overviewData.totalProperties}</div>
                </Col>
                <Col xs="auto">
                  <FaChartLine className="fa-2x text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-success shadow h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Views
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{overviewData.totalViews}</div>
                </Col>
                <Col xs="auto">
                  <FaChartBar className="fa-2x text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-info shadow h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Inquiries
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{overviewData.totalInquiries}</div>
                </Col>
                <Col xs="auto">
                  <FaChartPie className="fa-2x text-gray-300" />
                </Col>
              </Row>
                       </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-warning shadow h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Conversion Rate
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{overviewData.conversionRate}%</div>
                </Col>
                <Col xs="auto">
                  <FaChartArea className="fa-2x text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col xl={8} lg={7}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Property Views Overview</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-area" ref={viewsChartRef}>
                {loading ? (
                  <div className="text-center p-5">Loading chart data...</div>
                ) : (
                  <Line 
                    data={viewsData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                    height={300}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={5}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Property Types Distribution</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-pie pt-4 pb-2" ref={typesChartRef}>
                {loading ? (
                  <div className="text-center p-5">Loading chart data...</div>
                ) : (
                  <Pie 
                    data={propertyTypesData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom'
                        }
                      }
                    }}
                    height={300}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Property Listings by Month</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-bar" ref={listingsChartRef}>
                {loading ? (
                  <div className="text-center p-5">Loading chart data...</div>
                ) : (
                  <Bar 
                    data={listingsData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                    height={300}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Performing Properties */}
      <Card className="shadow mb-4">
        <Card.Header className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Top Performing Properties</h6>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive" ref={tableRef}>
            {loading ? (
              <div className="text-center p-5">Loading property data...</div>
            ) : (
              <Table className="table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Property Title</th>
                    <th>Views</th>
                    <th>Inquiries</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topProperties.length > 0 ? (
                    topProperties.map((property, index) => (
                      <tr key={property.id || index}>
                        <td>{property.id}</td>
                        <td>{property.title}</td>
                        <td>{property.views}</td>
                        <td>{property.inquiries}</td>
                        <td>{property.conversion}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No property data available</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </Card.Body>
      </Card>
      
      {/* Report Generation Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Analytics Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select the report format you would like to generate:</p>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <Button 
              variant={reportType === 'pdf' ? 'primary' : 'outline-primary'}
              className="d-flex flex-column align-items-center p-4"
              onClick={() => handleReportTypeChange('pdf')}
            >
              <FaFilePdf size={32} className="mb-2" />
              <span>PDF Report</span>
            </Button>
            <Button 
              variant={reportType === 'excel' ? 'success' : 'outline-success'}
              className="d-flex flex-column align-items-center p-4"
              onClick={() => handleReportTypeChange('excel')}
            >
              <FaFileExcel size={32} className="mb-2" />
              <span>Excel Report</span>
            </Button>
          </div>
          <p className="text-muted small">
            {reportType === 'pdf' 
              ? 'PDF report includes charts and summary data in a printable format.' 
              : 'Excel report includes detailed data tables that can be further analyzed.'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={reportType === 'pdf' ? 'primary' : 'success'} 
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Generating...
              </>
            ) : (
              <>
                {reportType === 'pdf' ? <FaFilePdf className="me-2" /> : <FaFileExcel className="me-2" />}
                Generate {reportType.toUpperCase()}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Analytics;
