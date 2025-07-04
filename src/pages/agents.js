import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import Layout from './Layout';
import AgentsList from '../components/agents/AgentsList';
import AgentApplications from '../components/agents/AgentApplications';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Agents = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setLoading(true);
    setActiveTab(tab);
    // Add a small delay to simulate tab switching and show loading state
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <Layout>
      <div className="animate__animated animate__fadeIn">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">Agents Management</h1>
        </div>

        {/* Tabs */}
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'agents'}
              onClick={() => handleTabChange('agents')}
            >
              Agents
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'applications'}
              onClick={() => handleTabChange('applications')}
            >
              Agent Applications
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          activeTab === 'agents' ? <AgentsList /> : <AgentApplications />
        )}
      </div>
    </Layout>
  );
};

export default Agents;
