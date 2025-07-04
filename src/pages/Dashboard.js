import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { Card, Row, Col, Button, Table, ProgressBar } from 'react-bootstrap';
import { FaHome, FaUsers, FaEnvelope, FaDollarSign, FaCalendarAlt, FaChartLine, FaEllipsisV, FaBlog, FaNewspaper } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import OverviewCard from '../components/dashboard/overviewcard';
import { dashboardService } from '../services/dashboard';
import blogService from '../services/blog';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState({
    labels: [],
    datasets: [{
      label: 'Earnings',
      data: [],
      borderColor: 'rgb(78, 115, 223)',
      backgroundColor: 'rgba(78, 115, 223, 0.05)',
      tension: 0.3,
      fill: true
    }]
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load properties
        const properties = await dashboardService.getRecentVerifiedProperties();
        setRecentProperties(properties);
      } catch (error) {
        console.error('Error loading recent properties:', error);
      } finally {
        setLoading(false);
      }

      try {
        // Load inquiries
        const inquiries = await dashboardService.getRecentInquiries();
        setRecentInquiries(inquiries);
      } catch (error) {
        console.error('Error loading recent inquiries:', error);
      } finally {
        setInquiriesLoading(false);
      }
      
      try {
        // Load blogs
        const blogs = await blogService.getAllBlogs();
        // Get only the most recent 4 blogs
        setRecentBlogs(blogs.slice(0, 4));
      } catch (error) {
        console.error('Error loading recent blogs:', error);
      } finally {
        setBlogsLoading(false);
      }

      try {
        // Load earnings overview data
        const earningsOverview = await dashboardService.getEarningsOverview();
        setEarningsData({
          labels: earningsOverview.months,
          datasets: [{
            label: 'Earnings',
            data: earningsOverview.earnings,
            borderColor: 'rgb(78, 115, 223)',
            backgroundColor: 'rgba(78, 115, 223, 0.05)',
            tension: 0.3,
            fill: true
          }]
        });
      } catch (error) {
        console.error('Error loading earnings overview:', error);
      }
    };

    loadDashboardData();
  }, []);

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Layout>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
      </div>

      {/* Overview Cards */}
      <OverviewCard />

      {/* Earnings Chart */}
      <Row>
        <Col xl={12} lg={12}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Earnings Overview</h6>
              <div className="dropdown no-arrow">
                <Button variant="link" className="dropdown-toggle" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <FaEllipsisV className="text-gray-400" />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-area">
                <Line 
                  data={earningsData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                  height={320}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Properties */}
      <Card className="shadow mb-4">
        <Card.Header className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Recently Added Properties </h6>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table className="table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>Property Title</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">Loading...</td>
                  </tr>
                ) : recentProperties.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No verified properties found in the last 20 days</td>
                  </tr>
                ) : (
                  recentProperties.map(property => (
                    <tr key={property.id}>
                      <td>{property.title}</td>
                      <td>
                        <span className={`badge ${property.status === 'For Sale' ? 'bg-primary' : 'bg-info'}`}>
                          {property.status}
                        </span>
                      </td>
                      <td>{formatPrice(property.price)}</td>
                      <td>{formatDate(property.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Recent Inquiries */}
      <Card className="shadow mb-4">
        <Card.Header className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Recent Inquiries</h6>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table className="table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Property</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiriesLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center">Loading...</td>
                  </tr>
                ) : recentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No inquiries found in the last 20 days</td>
                  </tr>
                ) : (
                  recentInquiries.map(inquiry => (
                    <tr key={inquiry.id}>
                      <td>{inquiry.name}</td>
                      <td>{inquiry.email}</td>
                      <td>{inquiry.property}</td>
                      <td>{formatDate(inquiry.date)}</td>
                      <td>
                        <span className={`badge ${
                          inquiry.status === 'New' ? 'bg-primary' : 
                          inquiry.status === 'contacted' ? 'bg-info' : 
                          inquiry.status === 'pending' ? 'bg-warning' : 
                          'bg-success'
                        }`}>
                          {inquiry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Calendar & Tasks */}
      <Row>
        <Col xl={12} lg={12}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Recent Blog Posts</h6>
              <div className="dropdown no-arrow">
                <Button variant="link" className="dropdown-toggle" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <FaEllipsisV className="text-gray-400" />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {blogsLoading ? (
                <div className="text-center py-4">Loading blog posts...</div>
              ) : recentBlogs.length === 0 ? (
                <div className="text-center py-4">No blog posts found</div>
              ) : (
                recentBlogs.map((blog, index) => (
                  <div key={blog.id} className="mb-3 d-flex align-items-center">
                    <div className={`icon-circle bg-${['primary', 'success', 'info', 'warning'][index % 4]} text-white mr-3`}>
                      <FaBlog />
                    </div>
                    <div>
                      <div className="small text-gray-500">{formatDate(blog.created_at)}</div>
                      <span className="font-weight-bold">{blog.title}</span>
                      {blog.excerpt && (
                        <p className="small text-muted mb-0">{truncateText(blog.excerpt, 80)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Dashboard;
