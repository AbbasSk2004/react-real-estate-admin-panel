import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaHome, FaUsers, FaEnvelope, FaDollarSign } from 'react-icons/fa';
import { dashboardService } from '../../services/dashboard';

const OverviewCard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeUsers: 0,
    pendingInquiries: 0
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [error, setError] = useState(null);
  const refreshIntervalRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, earnings] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getMonthlyEarnings()
      ]);
      
      if (statsData.error) {
        setError(statsData.error);
      } else if (statsData) {
        setStats(statsData);
      }

      setMonthlyEarnings(earnings);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up auto-refresh to run every 5 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchStats();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array since fetchStats is stable (useCallback)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cardData = [
    {
      title: 'Total Properties',
      value: stats.totalProperties.toString(),
      icon: <FaHome className="fa-2x text-gray-300" />,
      borderClass: 'border-left-primary',
      textClass: 'text-primary'
    },
    {
      title: 'Monthly Earnings',
      value: formatCurrency(Number.isFinite(monthlyEarnings) ? monthlyEarnings : 0),
      icon: <FaDollarSign className="fa-2x text-gray-300" />,
      borderClass: 'border-left-success',
      textClass: 'text-success'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: <FaUsers className="fa-2x text-gray-300" />,
      borderClass: 'border-left-info',
      textClass: 'text-info'
    },
    {
      title: 'Pending Inquiries',
      value: stats.pendingInquiries.toString(),
      icon: <FaEnvelope className="fa-2x text-gray-300" />,
      borderClass: 'border-left-warning',
      textClass: 'text-warning'
    }
  ];

  if (error) {
    return (
      <Row>
        <Col>
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      {cardData.map((card, index) => (
        <Col xl={3} md={6} className="mb-4" key={index}>
          <Card className={`${card.borderClass} shadow h-100 py-2`}>
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className={`text-xs font-weight-bold ${card.textClass} text-uppercase mb-1`}>
                    {card.title}
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{card.value}</div>
                </Col>
                <Col xs="auto">
                  {card.icon}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default OverviewCard;
