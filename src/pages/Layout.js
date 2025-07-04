import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Topbar from './Topbar';
import { 
  FaTachometerAlt, 
  FaHome, 
  FaUsers, 
  FaEnvelope, 
  FaFileAlt, 
  FaChartLine, 
  FaBars
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const [sidebarToggled, setSidebarToggled] = useState(true);
  const location = useLocation();
  // Site title (static now that Settings is removed)
  const siteName = 'Real Estate Admin';
  
  useEffect(() => {
    // Set default document title
    document.title = siteName;
  }, []);
  
  const toggleSidebar = () => {
    setSidebarToggled(!sidebarToggled);
  };
  
  return (
    <div id="wrapper">
      {/* Sidebar */}
      <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion position-fixed ${sidebarToggled ? 'toggled' : ''}`} id="accordionSidebar">
        {/* Sidebar - Brand */}
        <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
          <div className="sidebar-brand-icon rotate-n-15">
            <FaHome />
          </div>
          <div className="sidebar-brand-text mx-3">{siteName}</div>
        </Link>

        {/* Divider */}
        <hr className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Link className="nav-link" to="/">
            <FaTachometerAlt />
            <span className="ms-1">Dashboard</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Management
        </div>

        {/* Nav Item - Properties */}
        <li className={`nav-item ${location.pathname === '/properties' ? 'active' : ''}`}>
          <Link className="nav-link" to="/properties">
            <FaHome />
            <span className="ms-1">Properties</span>
          </Link>
        </li>

        {/* Nav Item - Users */}
        <li className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}>
          <Link className="nav-link" to="/users">
            <FaUsers />
            <span className="ms-1">Users</span>
          </Link>
        </li>

        {/* Nav Item - Agents */}
        <li className={`nav-item ${location.pathname === '/agents' ? 'active' : ''}`}>
          <Link className="nav-link" to="/agents">
            <FaUsers />
            <span className="ms-1">Agents</span>
          </Link>
        </li>

        {/* Nav Item - Inquiries */}
        <li className={`nav-item ${location.pathname === '/inquiries' ? 'active' : ''}`}>
          <Link className="nav-link" to="/inquiries">
            <FaEnvelope />
            <span className="ms-1">Inquiries</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Content
        </div>

        {/* Nav Item - Content */}
        <li className={`nav-item ${location.pathname === '/content' ? 'active' : ''}`}>
          <Link className="nav-link" to="/content">
            <FaFileAlt />
            <span className="ms-1">Content</span>
          </Link>
        </li>

        {/* Nav Item - Analytics */}
        <li className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
          <Link className="nav-link" to="/analytics">
            <FaChartLine />
            <span className="ms-1">Analytics</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider d-none d-md-block" />

        {/* Sidebar Toggler (Sidebar) */}
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
      </ul>
      {/* End of Sidebar */}

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        {/* Main Content */}
        <div id="content">
          {/* Topbar */}
          <Topbar />
          {/* End of Topbar */}

          {/* Begin Page Content */}
          <div className="container-fluid mt-5 pt-4">
            {children}
          </div>
          {/* /.container-fluid */}
        </div>
        {/* End of Main Content */}

        {/* Footer */}
        <footer className="sticky-footer bg-white">
          <div className="container my-auto">
            <div className="copyright text-center my-auto">
              <span>Copyright &copy; {siteName} {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
        {/* End of Footer */}
      </div>
      {/* End of Content Wrapper */}
    </div>
  );
};

export default Layout;

