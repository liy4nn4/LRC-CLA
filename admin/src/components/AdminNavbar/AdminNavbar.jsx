import React, { useEffect, useState } from 'react';
import './AdminNavbar.css';
import tuplogo from '../../assets/tuplogo.png';
import clalogo from '../../assets/clalogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faChartSimple, faFileLines, faCartShopping, faUser, faList, faFileExcel, faUsersGear } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import axios from 'axios'

const AdminNavbar = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
       
        const fetchUserRole = async () => {
            try {
              // Request server to verify the JWT token
              const response = await axios.get('http://localhost:3001/check-session', { withCredentials: true });
      
              // If session is valid, set the role
              if (response.data.loggedIn) {
                setRole(response.data.userRole);
              } else {
                setRole(null); // If not logged in, clear the role
              }
            } catch (error) {
              console.error('Error verifying session:', error);
              setRole(null); // Set null if there's an error
            } finally {
              setLoading(false);  // Stop loading once the request completes
            }
          };
      
          fetchUserRole();
    }, [navigate]);

    if (loading) {
        return <Loading />; // Show loading spinner or placeholder while checking role
    }

    return (
        <div className='admin-navbar-container'>
            {/* logo and heading */}
            <div className="navbar-logo-heading">
                {/* logos */}
                <div className="navbar-logos">
                    <img src={tuplogo} alt="tup-logo" />
                    <img src={clalogo} alt="cla-logo" />
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

                    {/* Conditionally render menu items based on role */}
                    {role !== 'staff' && (
                        <>
                            <li>
                                <Link to='/reports' className="menu">
                                    <FontAwesomeIcon icon={faFileExcel} className='menu-icon'/>
                                    <p>Reports</p>
                                </Link>
                            </li>

                            <li>
                                <Link to='/audit' className="menu">
                                    <FontAwesomeIcon icon={faFile} className='menu-icon'/>
                                    <p>Audit Logs</p>
                                </Link>
                            </li>

                            <li>
                                <Link to='/accounts' className="menu">
                                    <FontAwesomeIcon icon={faUsersGear} className='menu-icon'/>
                                    <p>Accounts</p>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminNavbar;
