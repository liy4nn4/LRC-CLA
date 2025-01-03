import React, { useEffect, useState } from 'react';
import './AdminNavbar.css';
import tuplogo from '../../assets/tuplogo.png';
import clalogo from '../../assets/clalogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faChartSimple, faFileLines, faCartShopping, faUser, faList, faFileExcel, faUsersGear } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  const [role, setRole] = useState(null);  // Set to null initially to handle loading state

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get('http://localhost:3001/user-details', {
        withCredentials: true,
      });
      console.log('User Details:', response.data.role);
      setRole(response.data.role);  // Set role to state
    } catch (error) {
      console.error('Error fetching user details:', error.message);
    }
  };

  // Render a loading state while the role is being fetched
  if (role === null) {
    return <div>Loading...</div>; // You can customize this as needed (e.g., a spinner)
  }

  return (
    <div className='admin-navbar-container'>
        {/* logo and heading */}
        <div className="navbar-logo-heading">
            {/* logos */}
            <div className="navbar-logos">
                <img src={tuplogo} alt="tup-logo" />
                <img src={clalogo} alt="cla-log" />
            </div>
            {/* heading */}
            <div className="navbar-heading">
                <p className='navbar-heading-text navbar-heading-cla'>College of Liberal Arts</p>
                <p className='navbar-heading-text navbar-heading-lrc'>Learning Resource Center</p>
            </div>
        </div>

        {/* menu */}
        <div className="navbar-menu">
            <ul>
                {/* Dashboard */}
                <li>
                    <Link to='/dashboard' className='menu'>
                        <FontAwesomeIcon icon={faChartSimple} className='menu-icon'/>
                        <p>Dashboard</p>
                    </Link>
                </li>

                {/* Logbook */}
                <li>
                    <Link to='/logbook' className="menu">
                        <FontAwesomeIcon icon={faFileLines} className='menu-icon'/>
                        <p>Logbook</p>
                    </Link>
                </li>

                {/* Circulation */}
                <li>
                    <Link to='/circulation' className="menu">
                        <FontAwesomeIcon icon={faCartShopping} className='menu-icon'/>
                        <p>Circulation</p>
                    </Link>
                </li>

                {/* Patrons */}
                <li>
                    <Link to='/patrons' className="menu">
                        <FontAwesomeIcon icon={faUser} className='menu-icon' />
                        <p>Patrons</p>
                    </Link>
                </li>

                {/* Cataloging */}
                <li>
                    <Link to='/catalog' className='menu'>
                        <FontAwesomeIcon icon={faList} className='menu-icon'/>
                        <p>Cataloging</p>
                    </Link>
                </li>

                {/* Reports - Only visible if not 'staff' */}
                {role !== 'staff' && (
                    <li>
                        <Link to='/reports' className="menu">
                            <FontAwesomeIcon icon={faFileExcel} className='menu-icon'/>
                            <p>Reports</p>
                        </Link>
                    </li>
                )}

                {/* Audit Logs - Only visible if not 'staff' */}
                {role !== 'staff' && (
                    <li>
                        <Link to='/audit' className="menu">
                            <FontAwesomeIcon icon={faFile} className='menu-icon'/>
                            <p>Audit Logs</p>
                        </Link>
                    </li>
                )}

                {/* Accounts - Only visible if not 'staff' */}
                {role !== 'staff' && (
                    <li>
                        <Link to='/accounts' className="menu">
                            <FontAwesomeIcon icon={faUsersGear} className='menu-icon'/>
                            <p>Accounts</p>
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    </div>
  );
};

export default AdminNavbar;
