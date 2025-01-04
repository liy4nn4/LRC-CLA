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
        const getUsername = async()=>{
            try {
              // Request server to verify the JWT token
              const response = await axios.get('http://localhost:3001/check-session', { withCredentials: true });
              console.log(response.data)
              // If session is valid, set the role
              if (response.data.loggedIn) {
                setUname(response.data.username);
              } else {
                setUname(null); // If not logged in, clear the role
              }
            } catch (error) {
              console.error('Error verifying session:', error);
              setUname(null); // Set null if there's an error
            }
          }

          getUsername()
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
            // Send a logout request to the server
            await axios.post('http://localhost:3001/logout', {}, { withCredentials: true });

            // Clear all relevant data from localStorage
            localStorage.removeItem('role');  // Remove the user's role
            localStorage.removeItem('username');  // Remove username or any other session-related data

            // Redirect the user to the login page
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
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
