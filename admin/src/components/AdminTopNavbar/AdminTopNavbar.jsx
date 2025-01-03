import React, { useEffect, useState } from 'react';
import './AdminTopNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation

const AdminTopNavbar = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [uname, setUname] = useState(null);
    const navigate = useNavigate(); // Hook to navigate programmatically

    useEffect(() => {
        // Fetch session or user data from the server to get the username
        const getUsername = async () => {
            try {
                const response = await axios.get('http://localhost:3001/session', { withCredentials: true });
                if (response.data.user) {
                    setUname(response.data.user.username); // Assuming the role is returned from session
                }
            } catch (err) {
                console.log('Error fetching session data', err);
            }
        };

        getUsername();
    }, []);

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

    // Logout function
    const logout = async () => {
        try {
            await axios.post('http://localhost:3001/logout', {}, { withCredentials: true });
            navigate('/'); // Redirect to login page after logout
        } catch (err) {
            console.log('Logout error:', err);
        }
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
                                <button className="dropdown-item" onClick={logout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopNavbar;
