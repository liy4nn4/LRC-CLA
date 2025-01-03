import React, { useEffect, useState } from 'react';
import './AdminTopNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminTopNavbar = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [uname, setUname] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get('http://localhost:3001/user-details', {
                withCredentials: true,
            });
            console.log('User Details:', response.data.uname);
            setUname(response.data.uname);  // Set username to state
        } catch (error) {
            console.error('Error fetching user details:', error.message);
        }
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        // Add event listeners for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Update date and time every second
        const intervalId = setInterval(() => setDateTime(new Date()), 1000);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            clearInterval(intervalId);
        };
    }, []);

    const handleLogout = () => {
        // Remove cookies from the client-side
        Cookies.remove('role', { path: '/' });
        Cookies.remove('uname', { path: '/' });
    
        // Optionally, clear cookies directly via document.cookie (if needed)
        document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        document.cookie = 'uname=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    
        // Optionally, log the user out on the server as well
        axios.post('http://localhost:3001/logout', {}, { withCredentials: true }).then(() => {
            // Redirect to login page after logout
            navigate('/');
        }).catch(err => console.error("Logout failed:", err));
    };
    

    return (
        <div className="top-navbar">
            {/* Online/Offline Indicator */}
            <div className="indicator">
                {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="info">
                {/* Date and Time */}
                <div className="top-navbar-datetime">
                    <span>{dateTime.toLocaleTimeString()}</span>
                    <span>|</span>
                    <span>{currentDay}</span>
                    <span>|</span>
                    <span>{dateTime.toLocaleDateString()}</span>
                </div>

                {/* Admin Account Dropdown */}
                <div className="user-box">
                    <div className="dropdown">
                        <button className="btn cat-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <FontAwesomeIcon icon={faCircleUser} className="icon" />
                            <span>
                                Hello, <span className="user-welcome-uname">{uname}</span>
                            </span>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={handleLogout} // Handle logout on click
                                >
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopNavbar;
